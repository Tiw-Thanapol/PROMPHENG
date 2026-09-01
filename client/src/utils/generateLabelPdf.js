import { jsPDF } from "jspdf"
import QRCode from "qrcode"
import { SENDER_INFO } from "../data/sender"

// ======================================================
// PDF CONFIG
// ======================================================

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const PAGE_PADDING = 10
const LABEL_HEIGHT = (PAGE_HEIGHT - PAGE_PADDING * 2) / 3

const FONT_REGULAR = "Sarabun"
const FONT_BOLD = "SarabunBold"

// pt -> mm conversion factor used for line-height math
const PT_TO_MM = 0.3528

// ======================================================
// LOAD FONT (cached across calls so we don't re-fetch every print)
// ======================================================

let fontCachePromise = null

async function loadFont(url) {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Cannot load font from ${url} (Status: ${response.status})`)
    }

    const blob = await response.blob()

    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result
            const base64Data = base64String.split(",")[1]
            if (!base64Data) {
                reject(new Error(`Failed to parse font base64 from ${url}`))
            } else {
                resolve(base64Data)
            }
        }
        reader.onerror = () => reject(new Error(`FileReader error while loading ${url}`))
        reader.readAsDataURL(blob)
    })
}

async function getFontCache() {
    if (!fontCachePromise) {
        fontCachePromise = Promise.all([
            loadFont("/fonts/Sarabun-Regular.ttf"),
            loadFont("/fonts/Sarabun-Bold.ttf")
        ]).then(([regular, bold]) => ({ regular, bold }))
        // ถ้าโหลดพลาด ให้ล้าง cache ทิ้งเพื่อให้ retry รอบหน้าได้ แทนที่จะค้าง error เดิมตลอดไป
        fontCachePromise.catch(() => {
            fontCachePromise = null
        })
    }
    return fontCachePromise
}

async function registerFonts(pdf) {
    try {
        const { regular, bold } = await getFontCache()

        pdf.addFileToVFS("Sarabun-Regular.ttf", regular)
        pdf.addFont("Sarabun-Regular.ttf", FONT_REGULAR, "normal")

        pdf.addFileToVFS("Sarabun-Bold.ttf", bold)
        pdf.addFont("Sarabun-Bold.ttf", FONT_BOLD, "bold")

        // jsPDF ไม่ throw error ตอน addFont() ล้มเหลว (เช่นไฟล์ TTF ไม่มี unicode cmap table)
        // มันแค่ print error ลง console แล้วปล่อยผ่าน ทำให้โค้ดพังทีหลังแบบงงๆ ตอนเรียก text()/splitTextToSize()
        // เช็คตรงนี้ให้ชัดเจนไปเลยว่าฟอนต์ถูกลงทะเบียนสำเร็จจริง
        const fontList = pdf.getFontList()
        const registeredOk =
            fontList[FONT_REGULAR]?.includes("normal") && fontList[FONT_BOLD]?.includes("bold")

        if (!registeredOk) {
            throw new Error(
                "ลงทะเบียนฟอนต์ไม่สำเร็จ — ไฟล์ Sarabun-Regular.ttf / Sarabun-Bold.ttf ใน public/fonts/ " +
                "อาจเสียหายหรือเป็น variable font ที่ไม่มี unicode cmap table ที่ jsPDF รองรับ " +
                "ลองโหลด static TTF ใหม่จาก https://fonts.google.com/specimen/Sarabun แล้ววางทับไฟล์เดิม"
            )
        }
    } catch (err) {
        console.error("Error registering custom fonts:", err)
        throw new Error(
            err.message?.includes("ลงทะเบียนฟอนต์ไม่สำเร็จ")
                ? err.message
                : "ไม่สามารถโหลดไฟล์ฟอนต์สำหรับสร้าง PDF ได้ กรุณาตรวจสอบตำแหน่งไฟล์ใน /public/fonts/"
        )
    }
}

// ======================================================
// TEXT HELPERS
// ======================================================

function safe(value) {
    if (value === null || value === undefined) {
        return ""
    }
    return String(value).trim()
}

// รองรับทั้ง string ปกติ และ array ของบรรทัด (เช่น address ที่มาจาก textarea แยกบรรทัด)
function joinLines(value) {
    if (Array.isArray(value)) {
        return value.map((line) => safe(line)).filter(Boolean).join("\n")
    }
    return safe(value)
}

function drawWrappedText(pdf, text, x, y, maxWidth, lineHeightFactor, fontSize) {
    const value = safe(text)
    if (!value) {
        return y
    }

    // splitTextToSize จะ wrap ตาม maxWidth แต่ยังคง \n เดิมที่มีอยู่ในข้อความ (ขึ้นบรรทัดใหม่ตามที่ผู้ใช้พิมพ์)
    const lines = pdf.splitTextToSize(value, maxWidth)

    pdf.text(lines, x, y, {
        lineHeightFactor
    })

    // ความสูงบรรทัดต้องผูกกับ fontSize จริง ไม่ใช้ตัวเลข hardcode
    const lineHeightMm = fontSize * lineHeightFactor * PT_TO_MM
    return y + lines.length * lineHeightMm
}

// ======================================================
// QR
// ======================================================

// ให้ QR ในไฟล์ PDF มีเนื้อหาเหมือนกับที่โชว์บนหน้าจอ preview (orderId|phone)
function buildQrValue(orderId, phone) {
    return phone ? `${orderId}|${phone}` : orderId
}

async function createQrDataUrl(value) {
    return QRCode.toDataURL(safe(value), {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 160
    })
}

// ======================================================
// DRAW ONE LABEL
// ======================================================

async function drawLabel(pdf, order, index, hasNextOnPage) {
    const top = PAGE_PADDING + LABEL_HEIGHT * index
    const left = PAGE_PADDING
    const right = PAGE_WIDTH - PAGE_PADDING
    const width = PAGE_WIDTH - PAGE_PADDING * 2

    // --------------------------------------------------
    // DASHED CUT LINE — คั่นระหว่างป้ายเท่านั้น
    // (ไม่วาดหลังป้ายใบสุดท้ายของหน้า เพราะติดขอบ margin อยู่แล้ว
    //  3 ป้ายต่อหน้า -> มีเส้นคั่นแค่ 2 เส้น)
    // --------------------------------------------------

    if (hasNextOnPage) {
        const bottom = top + LABEL_HEIGHT
        pdf.setDrawColor(100, 100, 100)
        pdf.setLineDashPattern([2, 2], 0)
        pdf.line(left, bottom, right, bottom)
        pdf.setLineDashPattern([], 0)
    }

    // --------------------------------------------------
    // ORDER DATA
    // รับ order รูปแบบ { id, data: { name, phone, business, address, note } }
    // ตรงกับ state ของ PrintLabel.jsx โดยตรง ไม่ต้อง map ก่อนส่งเข้ามา
    // --------------------------------------------------

    const data = order.data || {}

    const orderId = safe(order.orderId || order.id || `ORDER-${index + 1}`)

    const receiverName = safe(data.name)
    const phone = safe(data.phone)
    const business = safe(data.business)
    const address = joinLines(data.address)
    const note = safe(data.note)

    const sender = {
        name: SENDER_INFO.name,
        phone: SENDER_INFO.phone,
        address: joinLines(SENDER_INFO.addressLines)
    }

    // --------------------------------------------------
    // SENDER
    // --------------------------------------------------

    let senderY = top + 18

    pdf.setFont(FONT_BOLD, "bold")
    pdf.setFontSize(14)

    senderY = drawWrappedText(pdf, sender.name, left + 5, senderY, width * 0.58, 1.25, 14)

    pdf.setFont(FONT_REGULAR, "normal")
    pdf.setFontSize(12)

    if (sender.phone) {
        senderY = drawWrappedText(pdf, `โทร. ${sender.phone}`, left + 5, senderY, width * 0.58, 1.25, 12)
    }

    if (sender.address) {
        drawWrappedText(pdf, sender.address, left + 5, senderY, width * 0.58, 1.25, 12)
    }

    // --------------------------------------------------
    // QR
    // --------------------------------------------------

    const qrSize = 25
    const qrX = right - qrSize
    const qrY = top + 7

    const qrData = await createQrDataUrl(buildQrValue(orderId, phone))

    pdf.addImage(qrData, "PNG", qrX, qrY, qrSize, qrSize)

    // --------------------------------------------------
    // ORDER ID
    // --------------------------------------------------

    pdf.setFont(FONT_REGULAR, "normal")
    pdf.setFontSize(8)
    pdf.setTextColor(60, 60, 60)

    pdf.text(orderId, qrX + qrSize / 2, qrY + qrSize + 4, {
        align: "center"
    })

    // --------------------------------------------------
    // RECEIVER
    // --------------------------------------------------

    const receiverX = left + 72
    const receiverWidth = width - 77

    let receiverY = top + 48

    pdf.setTextColor(0, 0, 0)

    // Name + phone
    pdf.setFont(FONT_BOLD, "bold")
    pdf.setFontSize(18)

    const namePhone = [receiverName, phone ? `โทร. ${phone}` : ""].filter(Boolean).join("  ")

    receiverY = drawWrappedText(pdf, namePhone, receiverX, receiverY, receiverWidth, 1.25, 18)

    // Business
    if (business) {
        pdf.setFont(FONT_REGULAR, "normal")
        pdf.setFontSize(17)

        receiverY = drawWrappedText(pdf, business, receiverX, receiverY, receiverWidth, 1.25, 17)
    }

    // Address
    if (address) {
        pdf.setFont(FONT_REGULAR, "normal")
        pdf.setFontSize(17)

        receiverY = drawWrappedText(pdf, address, receiverX, receiverY, receiverWidth, 1.3, 17)
    }

    // Note
    if (note) {
        pdf.setTextColor(210, 40, 60)
        pdf.setFont(FONT_BOLD, "bold")
        pdf.setFontSize(14)

        drawWrappedText(pdf, note, receiverX, receiverY + 2, receiverWidth, 1.25, 14)
    }

    pdf.setTextColor(0, 0, 0)
}

// ======================================================
// CREATE PDF
// ======================================================

export async function generateLabelPdf(orders = [], options = {}) {
    if (!Array.isArray(orders)) {
        throw new Error("orders must be an array")
    }

    if (orders.length === 0) {
        throw new Error("No orders to generate PDF")
    }

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
    })

    await registerFonts(pdf)
    pdf.setFont(FONT_REGULAR, "normal")

    for (let i = 0; i < orders.length; i++) {
        const position = i % 3

        if (i > 0 && position === 0) {
            pdf.addPage()
        }

        // มีป้ายถัดไปในหน้าเดียวกันไหม (ยังไม่ครบ 3 ใบของหน้านี้ และยังมี order เหลืออยู่จริง)
        const hasNextOnPage = position < 2 && i + 1 < orders.length

        await drawLabel(pdf, orders[i], position, hasNextOnPage)
    }

    const blob = pdf.output("blob")
    const blobUrl = URL.createObjectURL(blob)

    if (options.download) {
        const link = document.createElement("a")
        link.href = blobUrl
        link.download = options.fileName || "sale-record-labels.pdf"
        link.click()
        // revoke ทิ้งหลังเบราว์เซอร์เริ่ม download แล้ว กันหน่วยความจำค้าง
        setTimeout(() => URL.revokeObjectURL(blobUrl), 4000)
    }

    return { pdf, blob, url: blobUrl }
}

// ======================================================
// OPEN / PRINT PDF (เปิดแท็บใหม่ให้ผู้ใช้กด Ctrl+P / พิมพ์เอง)
// ======================================================

export async function openLabelPdf(orders = []) {
    const result = await generateLabelPdf(orders)

    const win = window.open(result.url, "_blank", "noopener,noreferrer")
    // revoke ช้าหน่อยเพื่อให้แท็บใหม่โหลด PDF จาก blob URL ทันก่อน
    setTimeout(() => URL.revokeObjectURL(result.url), 60000)

    if (!win) {
        console.warn("Popup ถูกบล็อก — เบราว์เซอร์อาจไม่อนุญาตให้เปิดแท็บใหม่อัตโนมัติ")
    }

    return result
}

// ======================================================
// DOWNLOAD PDF
// ======================================================

export async function downloadLabelPdf(orders = [], fileName = "sale-record-labels.pdf") {
    return generateLabelPdf(orders, { download: true, fileName })
}