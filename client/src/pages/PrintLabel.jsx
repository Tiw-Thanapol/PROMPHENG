import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Package,
  Printer,
  Sparkles,
  ClipboardList,
  Hash,
  FileStack,
  Trash2,
  Upload,
  FileText,
  Download,
} from "lucide-react";

import "../styles/print-label.css";
import { SENDER_INFO } from "../data/sender";
import {
  parseCustomerData,
  parseShippingBlob,
  parseBulkOrders,
  normalizeNameTitle,
} from "../utils/labelParser";

import {
  openLabelPdf,
  downloadLabelPdf,
} from "../utils/generateLabelPdf";

// key ที่ใช้เก็บเลขที่ออเดอร์ล่าสุดใน localStorage กันเลขซ้ำเวลาแอปโดนปิด/suspend
// (สำคัญมากเมื่อห่อเป็นแอปมือถือด้วย Capacitor เพราะ WebView อาจถูก OS kill แล้วรีเซ็ต state ในหน่วยความจำทั้งหมด)
const SEQ_STORAGE_KEY = "printlabel:lastOrderSeq";
const SEQ_DATE_KEY = "printlabel:lastOrderDate";

function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export default function PrintLabel() {
  const [rawInput, setRawInput] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [startSeqInput, setStartSeqInput] = useState(1);

  const [orders, setOrders] = useState([]); // { id, data }
  const [review, setReview] = useState([]); // { data } ที่ยังไม่ยืนยัน
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const seqRef = useRef(1);

  // โหลดเลขที่ออเดอร์ล่าสุดจาก localStorage ตอนเปิดแอป
  // ถ้าเป็นวันใหม่ ให้เริ่มนับ 1 ใหม่ตามพฤติกรรมเดิม (เลขที่ผูกกับวันที่)
  useEffect(() => {
    try {
      const savedDate = localStorage.getItem(SEQ_DATE_KEY);
      const savedSeq = localStorage.getItem(SEQ_STORAGE_KEY);

      if (savedDate === todayKey() && savedSeq) {
        const parsed = parseInt(savedSeq, 10);
        seqRef.current = isNaN(parsed) || parsed < 1 ? 1 : parsed;
      }
    } catch (err) {
      // localStorage อาจใช้ไม่ได้ในบาง WebView context — ไม่ critical พอให้แอปพังทั้งหน้า
      console.warn("ไม่สามารถอ่านเลขที่ออเดอร์ที่บันทึกไว้ได้:", err);
    }
  }, []);

  function persistSeq() {
    try {
      localStorage.setItem(SEQ_STORAGE_KEY, String(seqRef.current));
      localStorage.setItem(SEQ_DATE_KEY, todayKey());
    } catch (err) {
      console.warn("ไม่สามารถบันทึกเลขที่ออเดอร์ได้:", err);
    }
  }

  function buildOrderId() {
    const y = new Date().getFullYear();
    const dateKey = todayKey();
    const m = dateKey.slice(4, 6);
    const d = dateKey.slice(6, 8);
    const id = `${y}${m}${d}-${String(seqRef.current).padStart(3, "0")}`;
    seqRef.current += 1;
    persistSeq();
    return id;
  }

  function previewNextOrderId() {
    const dateKey = todayKey();
    const y = dateKey.slice(0, 4);
    const m = dateKey.slice(4, 6);
    const d = dateKey.slice(6, 8);
    return `${y}${m}${d}-${String(seqRef.current).padStart(3, "0")}`;
  }

  function applyStartSeq() {
    const val = parseInt(startSeqInput, 10);
    seqRef.current = isNaN(val) || val < 1 ? 1 : val;
    persistSeq();
  }

  function addSingleOrder() {
    const raw = rawInput.trim();
    if (!raw) {
      alert("กรุณากรอกข้อมูลลูกค้าก่อนครับ");
      return;
    }

    const lineCount = raw.split("\n").map((l) => l.trim()).filter(Boolean).length;
    const data = lineCount <= 1 ? parseShippingBlob(raw) : parseCustomerData(raw);

    setOrders((prev) => [...prev, { id: buildOrderId(), data }]);
    setRawInput("");
  }

  function addBulkOrders() {
    const raw = bulkInput.trim();
    if (!raw) {
      alert("กรุณาวางข้อมูลออเดอร์ก่อนครับ");
      return;
    }

    const dataList = parseBulkOrders(raw);
    if (dataList.length === 0) {
      alert("แยกออเดอร์ไม่เจอเลยครับ ลองเช็คว่ามีเส้นคั่น (----) ระหว่างแต่ละออเดอร์ไหม");
      return;
    }

    setReview((prev) => [...prev, ...dataList]);
    setBulkInput("");
  }

  function updateReviewField(idx, field, value) {
    setReview((prev) => {
      const next = [...prev];
      const item = { ...next[idx] };
      if (field === "address") {
        item.address = value.split("\n").map((l) => l.trim()).filter(Boolean);
      } else if (field === "note") {
        item.note = value.trim() ? `[${value.trim()}]` : "";
      } else {
        item[field] = value;
      }
      next[idx] = item;
      return next;
    });
  }

  function removeReviewItem(idx) {
    setReview((prev) => prev.filter((_, i) => i !== idx));
  }

  function confirmReview() {
    const newOrders = review.map((data) => ({
      id: buildOrderId(),
      data: { ...data, name: normalizeNameTitle(data.name) },
    }));
    setOrders((prev) => [...prev, ...newOrders]);
    setReview([]);
  }

  function cancelReview() {
    if (!window.confirm("ยกเลิกรายการที่แยกไว้ทั้งหมดหรือไม่? (ยังไม่ได้สร้างป้าย)")) return;
    setReview([]);
  }

  function resetAll() {
    if ((orders.length || review.length) && !window.confirm("ล้างป้ายและรายการที่รอตรวจสอบทั้งหมดหรือไม่?")) return;
    setOrders([]);
    setReview([]);
  }

  // ==========================================
  // สร้าง / เปิด / ดาวน์โหลด PDF
  // เปิด PDF (ปุ่มเดียวทำหน้าที่ทั้งดูตัวอย่างและพิมพ์ — บนแอป native จะเด้ง native
  // share sheet ซึ่งมีตัวเลือกพิมพ์ผ่าน AirPrint/เครื่องพิมพ์ในตัวอยู่แล้ว
  // จึงไม่จำเป็นต้องมีปุ่ม "พิมพ์" แยกที่ทำงานซ้ำกัน)
  // ==========================================
  async function handleOpenPdf() {
    if (!orders.length) {
      setError("ยังไม่มีรายการสำหรับสร้าง PDF");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await openLabelPdf(orders);
    } catch (err) {
      console.error(err);
      setError(err?.message || "ไม่สามารถสร้าง PDF ได้");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPdf() {
    if (!orders.length) {
      setError("ยังไม่มีรายการสำหรับสร้าง PDF");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await downloadLabelPdf(orders, "shipping-labels.pdf");
    } catch (err) {
      console.error(err);
      setError(err?.message || "ไม่สามารถสร้าง PDF ได้");
    } finally {
      setLoading(false);
    }
  }

  const pages = [];
  for (let i = 0; i < orders.length; i += 3) {
    pages.push(orders.slice(i, i + 3));
  }

  return (
    <div className="printlabel-page">
      {/* ================== BACKGROUND DECOR ================== */}
      <div className="printlabel-background">
        <span className="pl-sparkle pl-sparkle-1">✦</span>
        <span className="pl-sparkle pl-sparkle-2">✧</span>
        <span className="pl-sparkle pl-sparkle-3">⋆</span>
        <span className="pl-sparkle pl-sparkle-4">✦</span>

        <div className="pl-cloud pl-cloud-1">
          <span className="pl-cloud-bubble a" />
          <span className="pl-cloud-bubble b" />
          <span className="pl-cloud-bubble c" />
          <span className="pl-cloud-base" />
        </div>

        <div className="pl-cloud pl-cloud-2">
          <span className="pl-cloud-bubble a" />
          <span className="pl-cloud-bubble b" />
          <span className="pl-cloud-bubble c" />
          <span className="pl-cloud-base" />
        </div>

        <div className="pl-tree pl-tree-left">
          <div className="pl-tree-crown pl-crown-one" />
          <div className="pl-tree-crown pl-crown-two" />
          <div className="pl-tree-trunk" />
        </div>

        <div className="pl-tree pl-tree-right">
          <div className="pl-tree-crown pl-crown-one" />
          <div className="pl-tree-crown pl-crown-two" />
          <div className="pl-tree-trunk" />
        </div>
      </div>

      <div className="printlabel-container">
        {/* ================== HEADER ================== */}
        <header className="printlabel-header">
          <div className="printlabel-title-area">
            <div className="printlabel-title-icon">
              <Package size={28} />
            </div>
            <div>
              <div className="printlabel-title-line">
                <h1>พิมพ์ใบปะหน้าพัสดุ</h1>
                <span>✨</span>
              </div>
              <p>สร้าง QR + Order ID อัตโนมัติ พร้อมพิมพ์ PDF A4 ได้เลย</p>
            </div>
          </div>

          <div className="printlabel-actions" style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="printlabel-print-button"
              onClick={handleOpenPdf}
              disabled={loading || orders.length === 0}
            >
              <span className="pl-button-icon">
                {loading ? <Printer size={18} className="pl-spin" /> : <Printer size={18} />}
              </span>
              <span>{loading ? "กำลังสร้าง PDF..." : "เปิด / พิมพ์ PDF"}</span>
            </button>

            <button
              type="button"
              className="pl-btn-primary"
              onClick={handleDownloadPdf}
              disabled={loading || orders.length === 0}
            >
              <Download size={16} />
              <span>ดาวน์โหลด PDF</span>
            </button>
          </div>
        </header>

        {error && <p className="printlabel-error" style={{ color: "red", padding: "10px" }}>{error}</p>}

        {/* ================== SUMMARY ================== */}
        <div className="printlabel-summary">
          <SummaryCard
            icon={<Package size={23} />}
            title="ป้ายทั้งหมด"
            value={orders.length}
            suffix=" ใบ"
            variant="pink"
          />
          <SummaryCard
            icon={<FileStack size={23} />}
            title="หน้า A4"
            value={pages.length}
            suffix=" หน้า"
            variant="purple"
          />
          <SummaryCard
            icon={<ClipboardList size={23} />}
            title="รอตรวจสอบ"
            value={review.length}
            suffix=" รายการ"
            variant="yellow"
          />
          <SummaryCard
            icon={<Hash size={23} />}
            title="เลขที่ออเดอร์ถัดไป"
            value={previewNextOrderId()}
            suffix=""
            variant="green"
            small
          />
        </div>

        {/* ================== CONTENT ================== */}
        <section className="printlabel-content">
          <div className="printlabel-toolbar">
            <div className="printlabel-section-title">
              <div className="pl-section-title-icon">
                <Sparkles size={19} />
              </div>
              <div>
                <strong>สร้างป้ายใหม่</strong>
                <span>กรอกทีละรายการ หรือวางหลายออเดอร์พร้อมกัน</span>
              </div>
            </div>

            <div className="pl-seq-control">
              <label>เริ่มเลขที่ออเดอร์จาก</label>
              <input
                type="number"
                min="1"
                value={startSeqInput}
                onChange={(e) => setStartSeqInput(e.target.value)}
              />
              <button type="button" onClick={applyStartSeq}>
                ตั้งค่า
              </button>
            </div>
          </div>

          <div className="printlabel-input-area">
            <div className="pl-intro">
              <div className="pl-intro-icon">
                <Upload size={21} />
              </div>
              <div>
                <strong>โยนข้อมูลลูกค้ามาได้เลย</strong>
                <p>ระบบจะพยายามแยกชื่อ เบอร์โทร ที่อยู่ และโน้ตให้อัตโนมัติ</p>
              </div>
            </div>

            <div className="printlabel-input-grid">
              <div className="pl-input-panel">
                <label>เพิ่มป้ายเดี่ยว (สร้างทันที)</label>
                <textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder={"ชื่อ\nเบอร์โทร\nที่อยู่"}
                />
                <div className="pl-input-panel-actions">
                  <button type="button" className="pl-btn-primary" onClick={addSingleOrder}>
                    <Package size={15} />
                    เพิ่มป้าย
                  </button>
                </div>
              </div>

              <div className="pl-input-panel">
                <label>วางหลายออเดอร์ (เข้าสู่ขั้นตรวจสอบก่อน)</label>
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder={"วางหลายออเดอร์\nคั่นด้วย ----"}
                />
                <div className="pl-input-panel-actions">
                  <button type="button" className="pl-btn-primary" onClick={addBulkOrders}>
                    <Sparkles size={15} />
                    แยกหลายรายการ
                  </button>
                </div>
              </div>
            </div>

            <div className="printlabel-reset-row">
              <button type="button" className="pl-btn-danger" onClick={resetAll}>
                <Trash2 size={15} />
                ล้างทั้งหมด
              </button>
            </div>
          </div>

          <p className="printlabel-status">
            ป้ายทั้งหมด <strong>{orders.length}</strong> ใบ ({pages.length} หน้า A4) — เลขที่ออเดอร์ถัดไป{" "}
            <strong>{previewNextOrderId()}</strong>
          </p>

          {/* ================== REVIEW ================== */}
          {review.length > 0 && (
            <div className="printlabel-review">
              <div className="pl-review-header">
                <div>
                  <strong>ตรวจสอบก่อนสร้างป้าย</strong>
                  <span>พบ {review.length} รายการ</span>
                </div>
              </div>

              <p className="pl-review-hint">
                ระบบแยกข้อมูลให้อัตโนมัติ แต่ถ้าคนพิมพ์ใช้แท็ก/คำย่อแปลก ๆ อาจแยกพลาดได้ กรุณาตรวจทุกช่องก่อนกด
                &quot;ยืนยันและสร้างป้าย&quot;
              </p>

              <div className="pl-review-list">
                {review.map((item, i) => (
                  <div className="pl-review-item" key={i}>
                    <div className="pl-review-item-head">
                      <div>
                        <span className="pl-review-number">{i + 1}</span>
                        <strong>รายการที่ {i + 1}</strong>
                      </div>
                      <button type="button" className="pl-review-remove" onClick={() => removeReviewItem(i)}>
                        <Trash2 size={13} />
                        ลบรายการนี้
                      </button>
                    </div>

                    <div className="pl-review-grid">
                      <div className="pl-field">
                        <label>ชื่อผู้รับ</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateReviewField(i, "name", e.target.value)}
                        />
                      </div>

                      <div className="pl-field">
                        <label>ชื่อร้าน/บริษัท (ถ้ามี)</label>
                        <input
                          type="text"
                          value={item.business}
                          onChange={(e) => updateReviewField(i, "business", e.target.value)}
                        />
                      </div>

                      <div className="pl-field">
                        <label>เบอร์โทร</label>
                        <input
                          type="text"
                          value={item.phone}
                          onChange={(e) => updateReviewField(i, "phone", e.target.value)}
                        />
                      </div>

                      <div className="pl-field">
                        <label>โน้ต (ถ้ามี)</label>
                        <input
                          type="text"
                          value={item.note.replace(/^\[|\]$/g, "")}
                          onChange={(e) => updateReviewField(i, "note", e.target.value)}
                        />
                      </div>

                      <div className="pl-field pl-review-full">
                        <label>ที่อยู่</label>
                        <textarea
                          rows={2}
                          value={item.address.join("\n")}
                          onChange={(e) => updateReviewField(i, "address", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pl-review-actions">
                <button type="button" className="pl-btn-cancel" onClick={cancelReview}>
                  ยกเลิกทั้งหมด
                </button>
                <button type="button" className="pl-btn-primary" onClick={confirmReview}>
                  <Sparkles size={15} />
                  ยืนยันและสร้างป้ายทั้งหมด
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ================== PREVIEW / PRINT AREA ================== */}
        <section className="printlabel-preview">
          {pages.length === 0 && (
            <div className="printlabel-preview-empty">
              <div className="pl-empty-bubble">📦</div>
              <h3>ยังไม่มีป้ายที่สร้าง</h3>
              <p>เพิ่มป้ายจากช่องด้านบนเพื่อเริ่มต้นนะ ✨</p>
            </div>
          )}

          {pages.map((pageItems, pageIdx) => (
            <div className="a4-page" key={pageIdx}>
              <span className="pl-page-badge">
                หน้า {pageIdx + 1} / {pages.length}
              </span>

              {pageItems.map((order) => (
                <div className="label" key={order.id}>
                  <div className="sender">
                    ผู้ส่ง : {SENDER_INFO.name}
                    <br />
                    {SENDER_INFO.phone}
                    <br />
                    {SENDER_INFO.addressLines.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>

                  <div className="order-meta">
                    <QRCodeCanvas value={`${order.id}|${order.data.phone}`} size={50} />
                    <div className="order-id">{order.orderNo ?? order.id}</div>
                  </div>

                  <div className="receiver">
                    <div className="receiver-grid">
                      <span className="rlabel">กรุณาส่ง</span>
                      <span className="namephone">
                        {order.data.name}
                        {order.data.phone ? ` โทร. ${order.data.phone}` : ""}
                      </span>

                      {order.data.business && (
                        <>
                          <span />
                          <span className="business">{order.data.business}</span>
                        </>
                      )}

                      <span />
                      <div className="address-block">
                        {order.data.address.map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>

                      {order.data.note && (
                        <>
                          <span />
                          <span className="note">{order.data.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {Array.from({ length: 3 - pageItems.length }).map((_, i) => (
                <div className="label empty" key={`empty-${i}`} />
              ))}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({ icon, title, value, suffix, variant, small }) {
  return (
    <div className={`pl-summary-card summary-${variant}`}>
      <div className="pl-summary-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <h2 style={small ? { fontSize: 16 } : undefined}>
          {value}
          {suffix}
        </h2>
      </div>
      <span>✦</span>
    </div>
  );
}
