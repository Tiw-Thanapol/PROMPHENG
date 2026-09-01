import { jsPDF } from "jspdf"

// ======================================================
// PDF CONFIG
// ======================================================
// A4 แนวนอน เพราะตารางบัญชีมีคอลัมน์เยอะ (เหมือนตอน print HTML เดิม)
// ======================================================

const PAGE_WIDTH = 297
const PAGE_HEIGHT = 210
const MARGIN = 12

const USABLE_WIDTH = PAGE_WIDTH - MARGIN * 2

const FONT_REGULAR = "Sarabun"
const FONT_BOLD = "SarabunBold"

const ROW_HEIGHT = 7
const HEADER_ROW_HEIGHT = 8
const CELL_PADDING = 2

// สี (ให้โทนเดียวกับตอน print HTML เดิม)
const COLOR_HEADER_BG = [241, 234, 250]
const COLOR_HEADER_TEXT = [78, 69, 96]
const COLOR_BORDER = [222, 212, 234]
const COLOR_ZEBRA = [250, 247, 253]
const COLOR_TEXT = [62, 53, 80]
const COLOR_INCOME = [36, 150, 107]
const COLOR_EXPENSE = [211, 107, 120]
const COLOR_NET = [120, 101, 168]

// สัดส่วนความกว้างคอลัมน์ (รวมกันต้องได้ 1)
const COLUMNS = [
    { key: "date", label: "วันที่", ratio: 0.09, align: "left" },
    { key: "time", label: "เวลา", ratio: 0.06, align: "left" },
    { key: "reference", label: "เลขที่", ratio: 0.08, align: "left" },
    { key: "type", label: "ประเภท", ratio: 0.08, align: "left" },
    { key: "title", label: "รายการ", ratio: 0.13, align: "left" },
    { key: "description", label: "รายละเอียด", ratio: 0.16, align: "left" },
    { key: "source", label: "แหล่งที่มา", ratio: 0.09, align: "left" },
    { key: "income", label: "รายรับ", ratio: 0.10, align: "right" },
    { key: "expense", label: "รายจ่าย", ratio: 0.10, align: "right" },
    { key: "balance", label: "ยอดคงเหลือ", ratio: 0.11, align: "right" }
]

// ======================================================
// LOAD FONT (cache เดียวกับที่ generateLabelPdf.js ใช้ — ไฟล์ฟอนต์
// ตัวเดียวกันเป๊ะ ๆ ใน public/fonts/ ไม่ต้องเพิ่มไฟล์ฟอนต์ใหม่)
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

        const fontList = pdf.getFontList()
        const registeredOk =
            fontList[FONT_REGULAR]?.includes("normal") && fontList[FONT_BOLD]?.includes("bold")

        if (!registeredOk) {
            throw new Error(
                "ลงทะเบียนฟอนต์ไม่สำเร็จ — ไฟล์ Sarabun-Regular.ttf / Sarabun-Bold.ttf ใน public/fonts/ " +
                "อาจเสียหายหรือเป็น variable font ที่ไม่มี unicode cmap table ที่ jsPDF รองรับ"
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
// HELPERS
// ======================================================

function num(value) {
    if (value === null || value === undefined || value === "") {
        return 0
    }
    const normalized = typeof value === "string" ? value.replace(/,/g, "") : value
    const n = Number(normalized)
    return Number.isFinite(n) ? n : 0
}

function money(value) {
    return num(value).toLocaleString("th-TH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })
}

function pad2(value) {
    return String(value).padStart(2, "0")
}

function formatDate(value) {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "-"

    const day = pad2(date.getDate())
    const month = pad2(date.getMonth() + 1)
    const year = date.getFullYear() + 543 // พ.ศ.

    return `${day}/${month}/${year}`
}

function formatTime(value) {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "-"

    return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

function formatDateTime(value) {
    if (!value) return "-"
    return `${formatDate(value)} ${formatTime(value)}`
}

function getTypeLabel(row) {
    return row?.typeLabel || (row?.type === "INCOME" ? "รายรับ" : "รายจ่าย")
}

function getTitle(row) {
    return row?.title || row?.name || "-"
}

function getDescription(row) {
    return row?.description || row?.category || row?.customer?.name || "-"
}

function getReference(row) {
    return row?.reference || row?.sourceId || row?.saleId || "-"
}

function safe(value) {
    return value === null || value === undefined ? "" : String(value)
}

// ตัดข้อความให้พอดีกับความกว้างคอลัมน์ (binary search หา index ที่พอดี)
function truncateToWidth(pdf, text, maxWidth) {
    const value = safe(text)
    if (!value) return "-"
    if (pdf.getTextWidth(value) <= maxWidth) return value

    const ellipsis = "…"
    let low = 0
    let high = value.length

    while (low < high) {
        const mid = Math.ceil((low + high) / 2)
        const candidate = value.slice(0, mid) + ellipsis
        if (pdf.getTextWidth(candidate) <= maxWidth) {
            low = mid
        } else {
            high = mid - 1
        }
    }

    return value.slice(0, low) + ellipsis
}

// คำนวณ totals — ใช้ summary prop ก่อนถ้ามีค่าจริง ไม่งั้น fallback คำนวณจาก rows
function computeTotals(rows, summary) {
    const totalIncome = rows.reduce(
        (total, row) =>
            total + num(row?.income ?? (row?.type === "INCOME" ? row?.amount : 0)),
        0
    )

    const totalExpense = rows.reduce(
        (total, row) =>
            total + num(row?.expense ?? (row?.type !== "INCOME" ? row?.amount : 0)),
        0
    )

    const summaryIncome = num(summary?.income)
    const summaryExpense = num(summary?.expense)
    const summaryNet = num(summary?.net)

    const hasOverride = summaryIncome !== 0 || summaryExpense !== 0 || summaryNet !== 0

    const income = hasOverride ? summaryIncome : totalIncome
    const expense = hasOverride ? summaryExpense : totalExpense
    const net = hasOverride ? summaryNet : income - expense

    return { income, expense, net }
}

// ======================================================
// COLUMN X POSITIONS
// ======================================================

function buildColumnLayout() {
    let x = MARGIN
    return COLUMNS.map((col) => {
        const width = USABLE_WIDTH * col.ratio
        const layout = { ...col, x, width }
        x += width
        return layout
    })
}

// ======================================================
// DRAW TABLE HEADER ROW
// ======================================================

function drawTableHeader(pdf, columns, y) {
    pdf.setFillColor(...COLOR_HEADER_BG)
    pdf.rect(MARGIN, y, USABLE_WIDTH, HEADER_ROW_HEIGHT, "F")

    pdf.setDrawColor(...COLOR_BORDER)
    pdf.setLineWidth(0.1)

    pdf.setFont(FONT_BOLD, "bold")
    pdf.setFontSize(9)
    pdf.setTextColor(...COLOR_HEADER_TEXT)

    columns.forEach((col) => {
        const textX =
            col.align === "right" ? col.x + col.width - CELL_PADDING : col.x + CELL_PADDING
        pdf.text(col.label, textX, y + HEADER_ROW_HEIGHT / 2 + 1.5, {
            align: col.align === "right" ? "right" : "left"
        })
        pdf.rect(col.x, y, col.width, HEADER_ROW_HEIGHT)
    })

    return y + HEADER_ROW_HEIGHT
}

// ======================================================
// GENERATE PDF
// ======================================================

export async function generateAccountingPdf(rows = [], summary = {}, periodLabel = "Today") {
    if (!Array.isArray(rows)) {
        throw new Error("rows must be an array")
    }

    const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true
    })

    await registerFonts(pdf)

    const columns = buildColumnLayout()
    const totals = computeTotals(rows, summary)
    const generatedAt = formatDateTime(new Date())

    // --------------------------------------------------
    // HEADER (หน้าแรกเท่านั้น)
    // --------------------------------------------------

    let y = MARGIN

    pdf.setFont(FONT_BOLD, "bold")
    pdf.setFontSize(18)
    pdf.setTextColor(...COLOR_TEXT)
    pdf.text("ตารางบัญชีรายรับ - รายจ่าย", MARGIN, y + 6)

    pdf.setFont(FONT_REGULAR, "normal")
    pdf.setFontSize(10)
    pdf.setTextColor(120, 120, 120)
    pdf.text(
        `Sale Record / Accounting Ledger  •  ช่วงเวลา: ${safe(periodLabel)}  •  พิมพ์เมื่อ: ${generatedAt}`,
        MARGIN,
        y + 12
    )

    y += 18

    // --------------------------------------------------
    // SUMMARY CARDS
    // --------------------------------------------------

    const cardWidth = (USABLE_WIDTH - 8) / 3
    const cardHeight = 16
    const cards = [
        { label: "รายรับรวม", value: totals.income, color: COLOR_INCOME },
        { label: "รายจ่ายรวม", value: totals.expense, color: COLOR_EXPENSE },
        { label: "คงเหลือสุทธิ", value: totals.net, color: COLOR_NET }
    ]

    cards.forEach((card, index) => {
        const cardX = MARGIN + index * (cardWidth + 4)

        pdf.setDrawColor(...COLOR_BORDER)
        pdf.setFillColor(255, 255, 255)
        pdf.roundedRect(cardX, y, cardWidth, cardHeight, 2, 2, "S")

        pdf.setFont(FONT_REGULAR, "normal")
        pdf.setFontSize(9)
        pdf.setTextColor(120, 120, 120)
        pdf.text(card.label, cardX + 4, y + 6)

        pdf.setFont(FONT_BOLD, "bold")
        pdf.setFontSize(13)
        pdf.setTextColor(...card.color)
        pdf.text(`฿${money(card.value)}`, cardX + 4, y + 13)
    })

    y += cardHeight + 8

    // --------------------------------------------------
    // TABLE
    // --------------------------------------------------

    y = drawTableHeader(pdf, columns, y)

    const bottomLimit = PAGE_HEIGHT - MARGIN - 8 // เผื่อพื้นที่ footer

    if (rows.length === 0) {
        pdf.setFont(FONT_REGULAR, "normal")
        pdf.setFontSize(10)
        pdf.setTextColor(...COLOR_TEXT)
        pdf.text("ไม่มีรายการในช่วงเวลานี้", PAGE_WIDTH / 2, y + 12, { align: "center" })
    }

    rows.forEach((row, index) => {
        if (y + ROW_HEIGHT > bottomLimit) {
            pdf.addPage()
            y = MARGIN
            y = drawTableHeader(pdf, columns, y)
        }

        const isIncome = row?.type === "INCOME"
        const income = num(row?.income ?? (isIncome ? row?.amount : 0))
        const expense = num(row?.expense ?? (!isIncome ? row?.amount : 0))

        // zebra stripe
        if (index % 2 === 1) {
            pdf.setFillColor(...COLOR_ZEBRA)
            pdf.rect(MARGIN, y, USABLE_WIDTH, ROW_HEIGHT, "F")
        }

        pdf.setDrawColor(...COLOR_BORDER)
        pdf.setLineWidth(0.1)

        const cellValues = {
            date: formatDate(row?.date),
            time: formatTime(row?.date),
            reference: getReference(row),
            type: getTypeLabel(row),
            title: getTitle(row),
            description: getDescription(row),
            source: safe(row?.source || "-"),
            income: income > 0 ? `฿${money(income)}` : "-",
            expense: expense > 0 ? `฿${money(expense)}` : "-",
            balance: `฿${money(row?.balance)}`
        }

        columns.forEach((col) => {
            pdf.rect(col.x, y, col.width, ROW_HEIGHT)

            const maxTextWidth = col.width - CELL_PADDING * 2
            let text = cellValues[col.key]

            pdf.setFont(FONT_REGULAR, "normal")
            pdf.setFontSize(8.5)
            pdf.setTextColor(...COLOR_TEXT)

            if (col.key === "type") {
                pdf.setTextColor(...(isIncome ? COLOR_INCOME : COLOR_EXPENSE))
                pdf.setFont(FONT_BOLD, "bold")
            } else if (col.key === "income") {
                pdf.setTextColor(...COLOR_INCOME)
            } else if (col.key === "expense") {
                pdf.setTextColor(...COLOR_EXPENSE)
            } else if (col.key === "balance") {
                pdf.setFont(FONT_BOLD, "bold")
            }

            text = truncateToWidth(pdf, text, maxTextWidth)

            const textX =
                col.align === "right" ? col.x + col.width - CELL_PADDING : col.x + CELL_PADDING

            pdf.text(text, textX, y + ROW_HEIGHT / 2 + 1.3, {
                align: col.align === "right" ? "right" : "left"
            })
        })

        y += ROW_HEIGHT
    })

    // --------------------------------------------------
    // FOOTER
    // --------------------------------------------------

    pdf.setFont(FONT_REGULAR, "normal")
    pdf.setFontSize(9)
    pdf.setTextColor(140, 140, 140)
    pdf.text(`จำนวน ${rows.length} รายการ`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - MARGIN + 4, {
        align: "right"
    })

    const blob = pdf.output("blob")
    const blobUrl = URL.createObjectURL(blob)

    return { pdf, blob, url: blobUrl }
}

// ======================================================
// DOWNLOAD PDF
// ======================================================

export async function downloadAccountingPdf(rows = [], summary = {}, periodLabel = "Today", fileName) {
    const result = await generateAccountingPdf(rows, summary, periodLabel)

    const now = new Date()
    const defaultFileName = `accounting-${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(
        now.getDate()
    )}.pdf`

    const link = document.createElement("a")
    link.href = result.url
    link.download = fileName || defaultFileName
    link.click()

    setTimeout(() => URL.revokeObjectURL(result.url), 4000)

    return result
}