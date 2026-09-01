// ========================================================================
// utils/labelParser.js
// พอร์ตมาจาก label-print/script.js (เวอร์ชันวนิลลา) — ทำเป็น pure function
// ล้วนๆ ไม่แตะ DOM เลย เพื่อให้เรียกใช้จาก React component ได้ตรงๆ
// รวม fix ทุกจุดจากต้นฉบับ:
//   1) บรรทัดค่าส่งรองรับคำว่า "วิน" ไม่ใช่แค่ "ส่ง"
//   2) รองรับเบอร์โทรที่เขียนในวงเล็บกลม ( ) ไม่ใช่แค่วงเล็บเหลี่ยม [ ]
//   3) รองรับคำนำหน้าเบอร์ "เบอร์" เดี่ยว ๆ ไม่ใช่แค่ "เบอร์โทร"
//   4) แยก logic วงเล็บเหลี่ยม [ ] (โน้ต) กับวงเล็บกลม ( ) (เบอร์เท่านั้น) ออกจากกัน
// ========================================================================

const PHONE_RE = /0[\d-]{8,10}\d/; // จับเบอร์โทรแบบ 0xxxxxxxxx หรือ 0xx-xxxxxxx

// คำที่บ่งชี้ว่าเป็นชื่อธุรกิจ/ร้านค้า ใช้แยกออกจากชื่อคนให้เป็นคนละบรรทัด
const BUSINESS_KEYWORD_RE = /(ร้าน|บริษัท|ห้างหุ้นส่วน|หจก\.?|บจก\.?)/;

// เบอร์โทรแบบก้อนเดียว (freeform): ต้องไม่ติดกับตัวเลขชุดอื่น (กันไปกินรหัสไปรษณีย์/ราคา)
const FREEFORM_PHONE_RE =
  /(?:เบอร์โทร|เบอร์|โทร\.?|T\.?|Tel\.?)?\s*:?\s*(?<!\d)(0[\d\s-]{8,10}\d)(?!\d)/i;

// จุดเริ่มที่อยู่หน่วยงาน/ราชการ/ทหาร ซึ่งมักไม่มีตัวเลขนำหน้าเลย
const INSTITUTION_KEYWORD_RE =
  /(บ้านพัก|มหาวิทยาลัย|วิทยาลัย|สถาบัน|โรงเรียน|ค่ายทหาร|ค่าย|กรม|กองพล|กองร้อย|กองบิน|กอง(?!ทัพ)|สภ\.|สถานีตำรวจ|โรงพัก|ตชด\.|เรือนจำ|ทัณฑสถาน|มณฑลทหารบก|หน่วย|ป้อมตำรวจ|ฐานทัพ|ศูนย์แพทยศาสตร์)/;

// จุดเริ่มของที่อยู่ (รองรับทั้งแบบมีเลขนำหน้า และแบบขึ้นต้นด้วยคำ เช่น โครงการ/หมู่บ้าน/คอนโด)
const ADDRESS_START_RE =
  /(?:มบ\.?|เดอะ|The|โครงการ|หมู่บ้าน|บ้านพัก|คอนโด(?:มิเนียม)?|เพลส|อาคาร|ตึก|บ้านเลขที่|เลขที่|หมู่ที่|หมู่\s+|\b\d{1,3}\/\d+|\b\d{1,4}\s+(?:ซอย|ถนน|หมู่|ม\.|ต\.|อ\.|จ\.))/i;

// บรรทัดค่าส่ง เช่น "ส่ง 50" / "วิน60" — ใช้ตัด "รายการสินค้า" ทิ้งก่อนถึงข้อมูลลูกค้า
const SHIPPING_FEE_LINE_RE = /^[ \t]*(?:ส่ง|วิน)[ \t]*\d+.*$/m;

// ตัดคำนำหน้าชื่อทุกแบบทิ้ง แล้วขึ้นต้นด้วย "คุณ" ให้เหมือนกันหมดทุกคน
const TITLE_RE =
  /^(นางสาว|นาย|นาง|น\.ส\.|ดร\.|นพ\.|พญ\.|ด\.ช\.|ด\.ญ\.|คุณหญิง|จัดส่ง|กรุณาจัดส่ง|ส่ง|คุณ|Mrs\.?|Mr\.?|Miss\.?|Ms\.?|Dr\.?|K\.)\s*/i;

// ------------------------------------------------------------------------
// ตัวช่วยพื้นฐาน
// ------------------------------------------------------------------------
export function normalizePhoneDigits(rawPhone) {
  const digits = rawPhone.replace(/[^\d]/g, "");
  return digits.length === 10
    ? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
    : digits;
}

export function looksLikePhoneNumber(text) {
  const digits = text.replace(/[^\d]/g, "");
  return /^0\d{8,9}$/.test(digits);
}

function splitNameAndBusiness(line) {
  const match = line.match(BUSINESS_KEYWORD_RE);
  if (!match) return { personal: line, business: "" };
  const idx = match.index;
  return {
    personal: line.slice(0, idx).trim(),
    business: line.slice(idx).trim(),
  };
}

export function normalizeNameTitle(name) {
  if (!name) return name;
  const stripped = name.replace(TITLE_RE, "").trim();
  return stripped ? `คุณ ${stripped}` : name;
}

function resolveNameAndBusiness(rawLine) {
  const split = splitNameAndBusiness(rawLine);
  if (split.personal) {
    return { name: normalizeNameTitle(split.personal), business: split.business };
  }
  return { name: split.business, business: "" };
}

// ------------------------------------------------------------------------
// โหมด A: ข้อมูลลูกค้าพิมพ์แยกบรรทัดชัดเจน (ชื่อ / เบอร์ / ที่อยู่ / [โน้ต])
// ------------------------------------------------------------------------
export function parseCustomerData(raw) {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);

  let name = "";
  let business = "";
  let phone = "";
  let note = "";
  const address = [];

  lines.forEach((line) => {
    const phoneMatch = line.match(PHONE_RE);
    if (phoneMatch) {
      phone = phoneMatch[0];
      return;
    }

    if (line.includes("[") && line.includes("]")) {
      note = line.replace(/^\[|\]$/g, "");
      return;
    }

    if (!name) {
      const resolved = resolveNameAndBusiness(line);
      name = resolved.name;
      business = resolved.business;
      return;
    }

    address.push(line);
  });

  return { name, business, phone, note: note ? `[${note}]` : "", address };
}

// ------------------------------------------------------------------------
// โหมด B: ข้อความก้อนเดียว ไม่มีขึ้นบรรทัดใหม่เลย (ชื่อ+ที่อยู่+เบอร์+โน้ตปนกัน)
// ------------------------------------------------------------------------
export function parseShippingBlob(raw) {
  let working = raw.replace(/\s+/g, " ").trim();
  let phone = "";

  // วงเล็บเหลี่ยม [ ] = ช่องโน้ตที่ตั้งใจไว้จริง ๆ (เผื่อกรณีใส่เบอร์ไว้ใน [ ] แทนโน้ตด้วย)
  let bracketNote = "";
  const noteMatch = working.match(/\[([^\]]+)\]/);
  if (noteMatch) {
    const noteContent = noteMatch[1].trim();
    if (looksLikePhoneNumber(noteContent)) {
      phone = normalizePhoneDigits(noteContent);
    } else {
      bracketNote = noteContent;
    }
    working = (
      working.slice(0, noteMatch.index) +
      " " +
      working.slice(noteMatch.index + noteMatch[0].length)
    )
      .replace(/\s+/g, " ")
      .trim();
  }

  // วงเล็บกลม ( ) = ดึงออกมาเฉพาะกรณีข้างในเป็นเบอร์โทรจริง ๆ เท่านั้น เช่น "(0937718642)"
  // ถ้าข้างในเป็นข้อความอื่น เช่น "(CEO)" ปล่อยผ่าน ให้ติดไปกับชื่อ/ชื่อร้านตามธรรมชาติ
  if (!phone) {
    const parenMatch = working.match(/\(([^)]+)\)/);
    if (parenMatch && looksLikePhoneNumber(parenMatch[1])) {
      phone = normalizePhoneDigits(parenMatch[1]);
      working = (
        working.slice(0, parenMatch.index) +
        " " +
        working.slice(parenMatch.index + parenMatch[0].length)
      )
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  if (!phone) {
    const phoneMatch = working.match(FREEFORM_PHONE_RE);
    if (phoneMatch) {
      phone = normalizePhoneDigits(phoneMatch[1]);
      working = (
        working.slice(0, phoneMatch.index) +
        " " +
        working.slice(phoneMatch.index + phoneMatch[0].length)
      )
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  // หาตำแหน่งตัดชื่อ โดยมองหาคำที่บ่งบอกถึง "ที่อยู่" ชัดเจนก่อน ถ้าไม่เจอค่อย fallback เป็นตัวเลขตัวแรก
  let nameEndIdx = -1;
  const matchAddrStart = working.search(ADDRESS_START_RE);
  if (matchAddrStart !== -1) {
    nameEndIdx = matchAddrStart;
  } else {
    nameEndIdx = working.search(/\d/);
  }

  const instMatch = working.match(INSTITUTION_KEYWORD_RE);
  if (instMatch && instMatch.index > 0 && (nameEndIdx === -1 || instMatch.index < nameEndIdx)) {
    nameEndIdx = instMatch.index;
  }

  let nameRaw = working;
  let rest = "";
  if (nameEndIdx > 0) {
    nameRaw = working.slice(0, nameEndIdx).trim().replace(/,\s*$/, "");
    rest = working.slice(nameEndIdx).trim();
  } else if (nameEndIdx === 0) {
    nameRaw = "";
    rest = working;
  }

  const resolved = resolveNameAndBusiness(nameRaw);
  const name = resolved.name;
  const business = resolved.business;

  // ที่อยู่ตัดจบตรงรหัสไปรษณีย์ (เลข 5 หลัก) ส่วนที่เหลือถือเป็นโน้ต
  let address = rest;
  let noteFromTail = "";
  const zipMatch = rest.match(/^(.*?\b\d{5}\b)([\s\S]*)$/);
  if (zipMatch) {
    address = zipMatch[1].trim().replace(/,\s*$/, "");
    noteFromTail = zipMatch[2].trim();
  }
  noteFromTail = noteFromTail.replace(/^(?:ค่ะ|ค่า+|คะ|ครับ)+[\s,]*/, "").trim();

  const note = bracketNote || noteFromTail;

  return {
    name,
    business,
    phone,
    note: note ? `[${note}]` : "",
    address: address ? [address] : [],
  };
}

// ------------------------------------------------------------------------
// โหมด C: ก้อนข้อความรวมหลายออเดอร์ คั่นด้วยเส้นประ
// ------------------------------------------------------------------------
export function extractShippingBlob(block) {
  let idx = block.search(/ที่อยู่/);
  if (idx !== -1) return block.slice(idx + "ที่อยู่".length).trim();

  idx = block.search(/ชื่อ\s/);
  if (idx !== -1) return block.slice(idx + "ชื่อ".length).trim();

  const ttMatch = block.match(/ตต\s*(\S+)/);
  if (ttMatch) {
    const cutIdx = ttMatch.index + ttMatch[0].length;
    return block.slice(cutIdx).trim();
  }

  // ตัดส่วน "รายการสินค้า" ทิ้ง โดยหาบรรทัดค่าส่งแบบ "ส่ง <ตัวเลข>" หรือ "วิน <ตัวเลข>"
  const shipFeeMatch = block.match(SHIPPING_FEE_LINE_RE);
  if (shipFeeMatch) {
    return block.slice(shipFeeMatch.index + shipFeeMatch[0].length).trim();
  }

  const totalMatches = [...block.matchAll(/รวม(?:ทั้งหมด|ท้ั้งหมด)?[\d\s+=,.]*/g)];
  if (totalMatches.length) {
    const last = totalMatches[totalMatches.length - 1];
    return block.slice(last.index + last[0].length).trim();
  }

  return block;
}

export function parseBulkOrders(raw) {
  const blocks = raw.split(/[-–—_]{2,}/g).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block) => parseShippingBlob(extractShippingBlob(block)));
}