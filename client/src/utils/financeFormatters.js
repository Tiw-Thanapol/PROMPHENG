/* =========================================================
   financeFormatters.js
   Financial Overview / Accounting Formatters
   ========================================================= */

/* =========================================================
   NUMBER
   ========================================================= */

export function number(
    value,
    options = {}
) {
    const {
        locale = "en-US",
        minimumFractionDigits = 0,
        maximumFractionDigits = 2,
    } = options;

    const numericValue =
        Number(value);

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(numericValue)
    ) {
        return "0";
    }

    return new Intl.NumberFormat(
        locale,
        {
            minimumFractionDigits,
            maximumFractionDigits,
        }
    ).format(numericValue);
}

/* =========================================================
   MONEY
   ========================================================= */

export function money(
    value,
    options = {}
) {
    const {
        currency = "THB",
        locale = "th-TH",
        minimumFractionDigits = 2,
        maximumFractionDigits = 2,
        showCurrency = true,
    } = options;

    const numericValue =
        Number(value);

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(numericValue)
    ) {
        return showCurrency
            ? "฿0.00"
            : "0.00";
    }

    if (!showCurrency) {
        return new Intl.NumberFormat(
            locale,
            {
                minimumFractionDigits,
                maximumFractionDigits,
            }
        ).format(numericValue);
    }

    return new Intl.NumberFormat(
        locale,
        {
            style: "currency",
            currency,
            minimumFractionDigits,
            maximumFractionDigits,
        }
    ).format(numericValue);
}

/* =========================================================
   MONEY SHORT
   ========================================================= */

export function moneyShort(
    value,
    options = {}
) {
    const {
        currencySymbol = "฿",
        decimals = 1,
    } = options;

    const numericValue =
        Number(value);

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(numericValue)
    ) {
        return `${currencySymbol}0`;
    }

    const absolute =
        Math.abs(numericValue);

    let result;

    if (absolute >= 1_000_000_000) {
        result =
            (
                numericValue /
                1_000_000_000
            ).toFixed(decimals) +
            "B";
    } else if (
        absolute >= 1_000_000
    ) {
        result =
            (
                numericValue /
                1_000_000
            ).toFixed(decimals) +
            "M";
    } else if (
        absolute >= 1_000
    ) {
        result =
            (
                numericValue /
                1_000
            ).toFixed(decimals) +
            "K";
    } else {
        result =
            numericValue.toFixed(
                decimals
            );
    }

    return `${currencySymbol}${result}`;
}

/* =========================================================
   DATE
   ========================================================= */

export function formatDate(
    value,
    options = {}
) {
    const {
        locale = "th-TH",
        dateStyle = "medium",
    } = options;

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    const date =
        value instanceof Date
            ? value
            : new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return new Intl.DateTimeFormat(
        locale,
        {
            dateStyle,
        }
    ).format(date);
}

/* =========================================================
   DATE TIME
   ========================================================= */

export function formatDateTime(
    value,
    options = {}
) {
    const {
        locale = "th-TH",
        dateStyle = "medium",
        timeStyle = "short",
    } = options;

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    const date =
        value instanceof Date
            ? value
            : new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return new Intl.DateTimeFormat(
        locale,
        {
            dateStyle,
            timeStyle,
        }
    ).format(date);
}

/* =========================================================
   TIME
   ========================================================= */

export function formatTime(
    value,
    options = {}
) {
    const {
        locale = "th-TH",
        timeStyle = "short",
    } = options;

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    const date =
        value instanceof Date
            ? value
            : new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return new Intl.DateTimeFormat(
        locale,
        {
            timeStyle,
        }
    ).format(date);
}

/* =========================================================
   DATE ONLY (DD/MM/YYYY)
   =========================================================
   ใช้ในไฟล์ export (PDF / Excel / Print / CSV) ตามที่ต้องการ
   รูปแบบ วัน/เดือน/ปี แบบตัวเลขล้วน ไม่ผูกกับ locale
   ========================================================= */

export function formatDateOnly(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    const date =
        value instanceof Date
            ? value
            : new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    const day =
        String(date.getDate()).padStart(2, "0");

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const year =
        date.getFullYear();

    return `${day}/${month}/${year}`;
}

/* =========================================================
   DATE + TIME (DD/MM/YYYY HH:mm)
   =========================================================
   ใช้ในไฟล์ export (PDF / Excel / Print / CSV)
   ========================================================= */

export function formatDateTimeExport(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    const date =
        value instanceof Date
            ? value
            : new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    const datePart =
        formatDateOnly(date);

    const hours =
        String(date.getHours()).padStart(2, "0");

    const minutes =
        String(date.getMinutes()).padStart(2, "0");

    return `${datePart} ${hours}:${minutes}`;
}

/* =========================================================
   DATE VALUE
   =========================================================
   แปลงค่าดิบ (string / number / Date) ให้เป็น Date object
   ที่ใช้งานได้จริง สำหรับเอาไป sort หรือเปรียบเทียบวันที่
   คืนค่า null ถ้าแปลงไม่ได้ / ไม่มีค่า
   ========================================================= */

export function dateValue(
    value
) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const date =
        value instanceof Date
            ? value
            : new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }

    return date;
}

/* =========================================================
   GROUPING KEYS
   =========================================================
   ใช้สำหรับสรุปยอดรายวัน / รายเดือน ในไฟล์ export
   คืนค่า "unknown" ถ้าวันที่แปลงไม่ได้ เพื่อไม่ให้รายการ
   หายไปจากสรุปยอด (จะถูกจัดเข้ากลุ่ม "ไม่ระบุวันที่/เดือน")
   ========================================================= */

export function dayKey(value) {
    const date =
        dateValue(value);

    if (!date) {
        return "unknown";
    }

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function monthKey(value) {
    const date =
        dateValue(value);

    if (!date) {
        return "unknown";
    }

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
}

export function formatDayLabel(key) {
    if (!key || key === "unknown") {
        return "ไม่ระบุวันที่";
    }

    const [year, month, day] =
        key.split("-");

    return `${day}/${month}/${year}`;
}

const THAI_MONTH_SHORT = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

export function formatMonthLabel(key) {
    if (!key || key === "unknown") {
        return "ไม่ระบุเดือน";
    }

    const [year, month] =
        key.split("-");

    const monthIndex =
        Number(month) - 1;

    const monthLabel =
        THAI_MONTH_SHORT[monthIndex] ?? month;

    return `${monthLabel} ${year}`;
}

/* =========================================================
   PERCENTAGE
   ========================================================= */

export function percentage(
    value,
    options = {}
) {
    const {
        locale = "en-US",
        minimumFractionDigits = 0,
        maximumFractionDigits = 2,
        multiplyBy100 = false,
    } = options;

    let numericValue =
        Number(value);

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(numericValue)
    ) {
        numericValue = 0;
    }

    if (multiplyBy100) {
        numericValue *= 100;
    }

    return new Intl.NumberFormat(
        locale,
        {
            style: "percent",
            minimumFractionDigits,
            maximumFractionDigits,
        }
    ).format(
        multiplyBy100
            ? numericValue / 100
            : numericValue
    );
}

/* =========================================================
   SIGNED MONEY
   ========================================================= */

export function signedMoney(
    value,
    options = {}
) {
    const numericValue =
        Number(value) || 0;

    if (numericValue > 0) {
        return `+${money(
            numericValue,
            options
        )}`;
    }

    if (numericValue < 0) {
        return `-${money(
            Math.abs(numericValue),
            options
        )}`;
    }

    return money(
        0,
        options
    );
}

/* =========================================================
   INCOME / EXPENSE
   ========================================================= */

export function formatIncome(
    value,
    options = {}
) {
    const numericValue =
        Number(value) || 0;

    return money(
        numericValue,
        options
    );
}

export function formatExpense(
    value,
    options = {}
) {
    const numericValue =
        Number(value) || 0;

    return money(
        numericValue,
        options
    );
}

export function formatBalance(
    value,
    options = {}
) {
    const numericValue =
        Number(value) || 0;

    return money(
        numericValue,
        options
    );
}

/* =========================================================
   SAFE NUMBER
   ========================================================= */

export function toNumber(
    value,
    fallback = 0
) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return fallback;
    }

    const result =
        Number(value);

    return Number.isFinite(result)
        ? result
        : fallback;
}

/* =========================================================
   ROUND
   ========================================================= */

export function roundNumber(
    value,
    decimals = 2
) {
    const numericValue =
        Number(value);

    if (
        !Number.isFinite(
            numericValue
        )
    ) {
        return 0;
    }

    const factor =
        Math.pow(
            10,
            decimals
        );

    return (
        Math.round(
            numericValue *
                factor
        ) / factor
    );
}

/* =========================================================
   TRANSACTION TYPE
   ========================================================= */

export function transactionType(
    value
) {
    if (
        value === null ||
        value === undefined
    ) {
        return "other";
    }

    const type =
        String(value)
            .trim()
            .toLowerCase();

    if (
        [
            "income",
            "revenue",
            "sale",
            "sales",
            "credit",
            "รายรับ",
            "รายได้",
            "ขาย",
        ].includes(type)
    ) {
        return "income";
    }

    if (
        [
            "expense",
            "expenses",
            "cost",
            "purchase",
            "debit",
            "รายจ่าย",
            "ค่าใช้จ่าย",
            "ซื้อ",
        ].includes(type)
    ) {
        return "expense";
    }

    return "other";
}

/* =========================================================
   TRANSACTION TYPE LABEL
   ========================================================= */

export function transactionTypeLabel(
    value
) {
    const type =
        transactionType(value);

    if (type === "income") {
        return "รายรับ";
    }

    if (type === "expense") {
        return "รายจ่าย";
    }

    return "อื่น ๆ";
}

/* =========================================================
   TRANSACTION SEARCH TEXT
   =========================================================
   รวมข้อความจากหลาย field ของรายการธุรกรรม
   ให้เป็น string เดียว (lowercase) สำหรับใช้ค้นหา/กรองข้อมูล
   ใช้กับ item ที่มีโครงสร้างแบบเดียวกับใน financeExport.js
   ========================================================= */

export function transactionSearchText(
    item
) {
    if (
        !item ||
        typeof item !== "object"
    ) {
        return "";
    }

    const rawDate =
        item.date ??
        item.transactionDate ??
        item.createdAt ??
        item.created_at;

    const rawType =
        item.type ??
        item.transactionType ??
        item.kind;

    const parts = [
        rawDate,
        formatDate(rawDate),

        item.reference ??
            item.referenceNo ??
            item.referenceNumber ??
            item.invoiceNo ??
            item.invoiceNumber ??
            item.orderNo ??
            item.orderNumber,

        rawType,
        transactionTypeLabel(rawType),

        item.itemName ??
            item.name ??
            item.productName ??
            item.title,

        item.description ??
            item.note ??
            item.remark ??
            item.details,

        item.amount ??
            item.total ??
            item.totalAmount ??
            item.value,
    ];

    return parts
        .filter(
            (part) =>
                part !== null &&
                part !== undefined &&
                part !== "" &&
                part !== "-"
        )
        .map((part) => String(part))
        .join(" ")
        .toLowerCase();
}

/* =========================================================
   EXPORT DEFAULT
   ========================================================= */

const financeFormatters = {
    number,
    money,
    moneyShort,

    formatDate,
    formatDateTime,
    formatTime,
    formatDateOnly,
    formatDateTimeExport,
    dateValue,

    dayKey,
    monthKey,
    formatDayLabel,
    formatMonthLabel,

    percentage,

    signedMoney,

    formatIncome,
    formatExpense,
    formatBalance,

    toNumber,
    roundNumber,

    transactionType,
    transactionTypeLabel,
    transactionSearchText,
};

export default financeFormatters;