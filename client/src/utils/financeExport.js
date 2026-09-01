/* =========================================================
   financeExport.js
   Financial Overview / Accounting Export
   ========================================================= */

import {
    money,
    number,
    formatDateTimeExport,
    formatDateOnly,
    dayKey,
    monthKey,
    formatDayLabel,
    formatMonthLabel,
} from "./financeFormatters";

/* =========================================================
   THAI FONT (Sarabun) — ใช้ pattern เดียวกับ generateLabelPdf.js
   =========================================================
   jsPDF ใช้ font default (Helvetica) ซึ่งรองรับแค่ WinAnsi
   (อังกฤษ/ตัวเลข) เท่านั้น ถ้าไม่ฝังฟอนต์ไทยเข้าไปเอง ตัวอักษรไทย
   จะถูก map ผิดตัวกลายเป็นสัญลักษณ์มั่ว ๆ (ตัวเลขจะไม่เพี้ยนเพราะ
   อยู่ใน WinAnsi อยู่แล้ว แต่ตัวไทยเพี้ยนหมด)
   ========================================================= */

const PDF_FONT_REGULAR = "Sarabun";
const PDF_FONT_BOLD = "SarabunBold";

let fontCachePromise = null;

async function loadFont(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(
            `Cannot load font from ${url} (Status: ${response.status})`
        );
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            const base64Data = base64String.split(",")[1];
            if (!base64Data) {
                reject(
                    new Error(
                        `Failed to parse font base64 from ${url}`
                    )
                );
            } else {
                resolve(base64Data);
            }
        };
        reader.onerror = () =>
            reject(
                new Error(
                    `FileReader error while loading ${url}`
                )
            );
        reader.readAsDataURL(blob);
    });
}

async function getFontCache() {
    if (!fontCachePromise) {
        fontCachePromise = Promise.all([
            loadFont("/fonts/Sarabun-Regular.ttf"),
            loadFont("/fonts/Sarabun-Bold.ttf"),
        ]).then(([regular, bold]) => ({ regular, bold }));

        // ถ้าโหลดพลาด ให้ล้าง cache ทิ้งเพื่อให้ retry รอบหน้าได้
        fontCachePromise.catch(() => {
            fontCachePromise = null;
        });
    }
    return fontCachePromise;
}

async function registerThaiFont(doc) {
    const { regular, bold } = await getFontCache();

    doc.addFileToVFS("Sarabun-Regular.ttf", regular);
    doc.addFont("Sarabun-Regular.ttf", PDF_FONT_REGULAR, "normal");

    doc.addFileToVFS("Sarabun-Bold.ttf", bold);
    doc.addFont("Sarabun-Bold.ttf", PDF_FONT_BOLD, "bold");

    const fontList = doc.getFontList();
    const registeredOk =
        fontList[PDF_FONT_REGULAR]?.includes("normal") &&
        fontList[PDF_FONT_BOLD]?.includes("bold");

    if (!registeredOk) {
        throw new Error(
            "ลงทะเบียนฟอนต์ไม่สำเร็จ — ไฟล์ Sarabun-Regular.ttf / Sarabun-Bold.ttf ใน public/fonts/ " +
                "อาจเสียหายหรือหาไม่พบ"
        );
    }
}

/* =========================================================
   HELPERS
   ========================================================= */

function safeArray(value) {
    return Array.isArray(value) ? value : [];
}

function getTransactionType(item) {
    const type = String(
        item?.type ??
        item?.transactionType ??
        item?.kind ??
        ""
    )
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

function getAmount(item) {
    return (
        Number(
            item?.amount ??
            item?.total ??
            item?.totalAmount ??
            item?.value ??
            0
        ) || 0
    );
}

function getDate(item) {
    return (
        item?.date ??
        item?.transactionDate ??
        item?.createdAt ??
        item?.created_at ??
        ""
    );
}

function getReference(item) {
    return (
        item?.reference ??
        item?.referenceNo ??
        item?.referenceNumber ??
        item?.invoiceNo ??
        item?.invoiceNumber ??
        item?.orderNo ??
        item?.orderNumber ??
        "-"
    );
}

function getDescription(item) {
    return (
        item?.description ??
        item?.note ??
        item?.remark ??
        item?.details ??
        ""
    );
}

function getItemName(item) {
    return (
        item?.itemName ??
        item?.name ??
        item?.productName ??
        item?.title ??
        item?.description ??
        "-"
    );
}

function normalizeTransactions(
    transactions = []
) {
    return safeArray(
        transactions
    ).map((item, index) => {
        const type =
            getTransactionType(item);

        const amount =
            getAmount(item);

        return {
            id:
                item?.id ??
                item?._id ??
                index + 1,

            date:
                getDate(item),

            reference:
                getReference(item),

            type,

            itemName:
                getItemName(item),

            description:
                getDescription(item),

            income:
                type === "income"
                    ? amount
                    : Number(
                        item?.income ?? 0
                    ) || 0,

            expense:
                type === "expense"
                    ? amount
                    : Number(
                        item?.expense ?? 0
                    ) || 0,

            amount,
        };
    });
}

/* =========================================================
   PERIOD SUMMARY (ใหม่)
   =========================================================
   รวมยอดทั้งหมด + แยกตามวัน + แยกตามเดือน จากรายการที่ส่งเข้ามา
   (คำนวณจาก transactions ที่ผ่าน filter / ช่วงเวลาที่เลือกมาแล้ว
   จากฝั่ง useFinancialOverview.js ก่อนเรียก export function)
   ========================================================= */

function buildPeriodSummary(rows) {
    let totalIncome = 0;
    let totalExpense = 0;

    const dayMap = new Map();
    const monthMap = new Map();

    rows.forEach((row) => {
        totalIncome += row.income;
        totalExpense += row.expense;

        const dKey = dayKey(row.date);

        if (!dayMap.has(dKey)) {
            dayMap.set(dKey, {
                key: dKey,
                income: 0,
                expense: 0,
            });
        }

        const dayEntry = dayMap.get(dKey);
        dayEntry.income += row.income;
        dayEntry.expense += row.expense;

        const mKey = monthKey(row.date);

        if (!monthMap.has(mKey)) {
            monthMap.set(mKey, {
                key: mKey,
                income: 0,
                expense: 0,
            });
        }

        const monthEntry = monthMap.get(mKey);
        monthEntry.income += row.income;
        monthEntry.expense += row.expense;
    });

    const byDay = Array.from(dayMap.values())
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((entry) => ({
            ...entry,
            label: formatDayLabel(entry.key),
            net: entry.income - entry.expense,
        }));

    const byMonth = Array.from(monthMap.values())
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((entry) => ({
            ...entry,
            label: formatMonthLabel(entry.key),
            net: entry.income - entry.expense,
        }));

    return {
        totalIncome,
        totalExpense,
        totalNet: totalIncome - totalExpense,
        byDay,
        byMonth,
    };
}

/* =========================================================
   PERIOD RANGE LABEL (ใหม่)
   =========================================================
   สร้างข้อความช่วงเวลาที่เลือกอยู่ (จาก options ที่
   useFinancialOverview.js ส่งมา: period / selectedDate /
   customStart / customEnd) เพื่อโชว์บนหัวรายงาน
   PDF / Excel / Print
   ========================================================= */

function getPeriodRangeLabel(options = {}) {
    const {
        period,
        selectedDate,
        customStart,
        customEnd,
    } = options;

    const normalized =
        String(period || "day").toLowerCase();

    if (
        normalized === "custom" &&
        (customStart || customEnd)
    ) {
        const start =
            customStart
                ? formatDateOnly(customStart)
                : "-";

        const end =
            customEnd
                ? formatDateOnly(customEnd)
                : start;

        return `ช่วงวันที่ที่เลือก: ${start} — ${end}`;
    }

    const labelMap = {
        day: "ช่วงเวลา: วันนี้",
        week: "ช่วงเวลา: สัปดาห์นี้",
        month: "ช่วงเวลา: เดือนนี้",
        year: "ช่วงเวลา: ปีนี้",
    };

    const base =
        labelMap[normalized] ||
        "ช่วงเวลาที่เลือก";

    if (selectedDate) {
        return `${base} (${formatDateOnly(selectedDate)})`;
    }

    return base;
}

/* =========================================================
   CSV
   ========================================================= */

function escapeCsv(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    const text = String(value);

    if (
        text.includes('"') ||
        text.includes(",") ||
        text.includes("\n") ||
        text.includes("\r")
    ) {
        return `"${text.replaceAll(
            '"',
            '""'
        )}"`;
    }

    return text;
}

export function exportFinanceCSV(
    transactions = [],
    options = {}
) {
    const {
        filename =
            "financial-overview.csv",
    } = options;

    const rows =
        normalizeTransactions(
            transactions
        );

    const data = [
        [
            "Date",
            "Reference",
            "Type",
            "Item",
            "Description",
            "Income",
            "Expense",
            "Amount",
        ],

        ...rows.map((row) => [
            row.date
                ? formatDateTimeExport(row.date)
                : "",

            row.reference,
            row.type,
            row.itemName,
            row.description,
            row.income,
            row.expense,
            row.amount,
        ]),
    ];

    const csv =
        data
            .map((row) =>
                row
                    .map(escapeCsv)
                    .join(",")
            )
            .join("\r\n");

    const blob =
        new Blob(
            [
                "\uFEFF",
                csv,
            ],
            {
                type:
                    "text/csv;charset=utf-8",
            }
        );

    downloadBlob(
        blob,
        filename
    );
}

/* =========================================================
   EXCEL
   =========================================================
   NOTE: signature เปลี่ยนจากเดิม (transactions, options)
   เป็น (transactions, summary, options) เพื่อให้ตรงกับ
   exportFinancePDF / printFinance และรองรับการแสดงสรุปยอด
   ========================================================= */

export async function exportFinanceExcel(
    transactions = [],
    summary = null,
    options = {}
) {
    const {
        filename =
            "financial-overview.xlsx",
    } = options;

    const rows =
        normalizeTransactions(
            transactions
        );

    const periodSummary =
        buildPeriodSummary(rows);

    const rangeLabel =
        getPeriodRangeLabel(options);

    try {
        const module =
            await import("xlsx");

        const XLSX =
            module.default ??
            module;

        // ------------------------------------------------
        // SHEET 1: รายการทั้งหมด
        // ------------------------------------------------

        const transactionData = [
            [
                "Date",
                "Reference",
                "Type",
                "Item",
                "Description",
                "Income",
                "Expense",
                "Amount",
            ],

            ...rows.map((row) => [
                row.date
                    ? formatDateTimeExport(row.date)
                    : "",

                row.reference,
                row.type,
                row.itemName,
                row.description,
                row.income,
                row.expense,
                row.amount,
            ]),
        ];

        const transactionSheet =
            XLSX.utils.aoa_to_sheet(
                transactionData
            );

        transactionSheet["!cols"] = [
            { wch: 18 },
            { wch: 18 },
            { wch: 12 },
            { wch: 28 },
            { wch: 40 },
            { wch: 16 },
            { wch: 16 },
            { wch: 16 },
        ];

        // ------------------------------------------------
        // SHEET 2: สรุปยอด (Total / รายวัน / รายเดือน)
        // ------------------------------------------------

        const summaryData = [
            [rangeLabel],
            [],
            ["สรุปยอดรวม"],
            ["รายรับรวม", periodSummary.totalIncome],
            ["รายจ่ายรวม", periodSummary.totalExpense],
            ["คงเหลือสุทธิ", periodSummary.totalNet],
        ];

        if (summary) {
            summaryData.push(
                [],
                ["สรุปบัญชี (จากการ์ดสรุป)"],
                ["ยอดขายสุทธิ (Revenue)", summary.revenue ?? 0],
                ["กำไรขั้นต้น (Gross Profit)", summary.grossProfit ?? 0],
                ["กำไรสุทธิ (Net Profit)", summary.netProfit ?? 0]
            );
        }

        summaryData.push(
            [],
            ["สรุปยอดรายวัน"],
            ["วันที่", "รายรับ", "รายจ่าย", "คงเหลือ"]
        );

        periodSummary.byDay.forEach((day) => {
            summaryData.push([
                day.label,
                day.income,
                day.expense,
                day.net,
            ]);
        });

        summaryData.push(
            [],
            ["สรุปยอดรายเดือน"],
            ["เดือน", "รายรับ", "รายจ่าย", "คงเหลือ"]
        );

        periodSummary.byMonth.forEach((month) => {
            summaryData.push([
                month.label,
                month.income,
                month.expense,
                month.net,
            ]);
        });

        const summarySheet =
            XLSX.utils.aoa_to_sheet(
                summaryData
            );

        summarySheet["!cols"] = [
            { wch: 24 },
            { wch: 18 },
            { wch: 18 },
            { wch: 18 },
        ];

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            transactionSheet,
            "Transactions"
        );

        XLSX.utils.book_append_sheet(
            workbook,
            summarySheet,
            "Summary"
        );

        XLSX.writeFile(
            workbook,
            filename
        );
    } catch (error) {
        console.error(
            "Excel export failed:",
            error
        );

        /*
         * ถ้า xlsx ยังไม่มี
         * fallback เป็น CSV
         */
        exportFinanceCSV(
            transactions,
            {
                filename:
                    filename.replace(
                        /\.xlsx?$/i,
                        ".csv"
                    ),
            }
        );
    }
}

/* =========================================================
   PDF
   =========================================================
   NOTE: signature เปลี่ยนจากเดิม (transactions, options)
   เป็น (transactions, summary, options) — ตรงกับที่
   useFinancialOverview.js เรียกใช้อยู่แล้ว
   ========================================================= */

export async function exportFinancePDF(
    transactions = [],
    summary = null,
    options = {}
) {
    const {
        filename =
            "financial-overview.pdf",

        title =
            "Financial Overview",
    } = options;

    const rows =
        normalizeTransactions(
            transactions
        );

    const periodSummary =
        buildPeriodSummary(rows);

    const rangeLabel =
        getPeriodRangeLabel(options);

    try {
        const module =
            await import("jspdf");

        const JsPDF =
            module.jsPDF ??
            module.default;

        if (!JsPDF) {
            throw new Error(
                "jsPDF constructor not found."
            );
        }

        const doc =
            new JsPDF({
                orientation:
                    "landscape",

                unit: "mm",

                format: "a4",
            });

        // --------------------------------------------------
        // ฝัง Sarabun font ก่อนวาดข้อความใด ๆ ทั้งหมด
        // ไม่งั้น jsPDF จะ fallback ไปใช้ Helvetica default
        // ซึ่งไม่รองรับตัวอักษรไทย ทำให้ข้อความไทยเพี้ยน
        // --------------------------------------------------

        await registerThaiFont(doc);

        doc.setFont(PDF_FONT_REGULAR, "normal");

        let y = 18;

        doc.setFont(PDF_FONT_BOLD, "bold");
        doc.setFontSize(18);

        doc.text(
            title,
            14,
            y
        );

        y += 8;

        doc.setFont(PDF_FONT_REGULAR, "normal");
        doc.setFontSize(9);

        doc.text(
            `Generated: ${new Date().toLocaleString()}`,
            14,
            y
        );

        y += 5;

        doc.text(
            rangeLabel,
            14,
            y
        );

        y += 10;

        const columns = [
            ["Date", 14],
            ["Reference", 45],
            ["Type", 75],
            ["Item", 100],
            ["Description", 145],
            ["Income", 200],
            ["Expense", 225],
            ["Amount", 250],
        ];

        function drawColumnHeader() {
            doc.setFont(PDF_FONT_BOLD, "bold");
            doc.setFontSize(8);

            columns.forEach(
                ([label, x]) => {
                    doc.text(
                        label,
                        x,
                        y
                    );
                }
            );

            doc.setFont(PDF_FONT_REGULAR, "normal");
        }

        drawColumnHeader();

        y += 5;

        doc.line(
            14,
            y,
            275,
            y
        );

        y += 6;

        doc.setFontSize(8);

        function ensureTransactionSpace() {
            if (y > 190) {
                doc.addPage();

                y = 18;

                drawColumnHeader();

                doc.setFontSize(8);

                y += 8;
            }
        }

        rows.forEach((row) => {
            ensureTransactionSpace();

            doc.text(
                row.date
                    ? formatDateTimeExport(row.date)
                    : "-",
                14,
                y
            );

            doc.text(
                truncate(
                    row.reference,
                    18
                ),
                45,
                y
            );

            doc.text(
                truncate(
                    row.type,
                    12
                ),
                75,
                y
            );

            doc.text(
                truncate(
                    row.itemName,
                    24
                ),
                100,
                y
            );

            doc.text(
                truncate(
                    row.description,
                    30
                ),
                145,
                y
            );

            doc.text(
                number(
                    row.income,
                    {
                        maximumFractionDigits: 2,
                    }
                ),
                200,
                y
            );

            doc.text(
                number(
                    row.expense,
                    {
                        maximumFractionDigits: 2,
                    }
                ),
                225,
                y
            );

            doc.text(
                number(
                    row.amount,
                    {
                        maximumFractionDigits: 2,
                    }
                ),
                250,
                y
            );

            y += 6;
        });

        // --------------------------------------------------
        // SUMMARY SECTION (ใหม่)
        // --------------------------------------------------
        // หน้าใหม่แยกต่างหาก แสดง Total รวม + สรุปรายวัน
        // + สรุปรายเดือน ของช่วงเวลาที่กำลังเลือกอยู่
        // --------------------------------------------------

        doc.addPage();
        y = 18;

        doc.setFont(PDF_FONT_BOLD, "bold");
        doc.setFontSize(16);

        doc.text(
            "สรุปยอดบัญชี",
            14,
            y
        );

        y += 8;

        doc.setFont(PDF_FONT_REGULAR, "normal");
        doc.setFontSize(10);

        doc.text(
            rangeLabel,
            14,
            y
        );

        y += 10;

        doc.setFont(PDF_FONT_BOLD, "bold");
        doc.setFontSize(11);

        doc.text(
            "สรุปยอดรวมทั้งหมด",
            14,
            y
        );

        y += 7;

        doc.setFont(PDF_FONT_REGULAR, "normal");
        doc.setFontSize(10);

        doc.text(
            `รายรับรวม: ${money(periodSummary.totalIncome)}`,
            14,
            y
        );

        y += 6;

        doc.text(
            `รายจ่ายรวม: ${money(periodSummary.totalExpense)}`,
            14,
            y
        );

        y += 6;

        doc.text(
            `คงเหลือสุทธิ: ${money(periodSummary.totalNet)}`,
            14,
            y
        );

        y += 12;

        function drawBreakdownTable(sectionTitle, entries) {
            if (y > 170) {
                doc.addPage();
                y = 18;
            }

            doc.setFont(PDF_FONT_BOLD, "bold");
            doc.setFontSize(11);

            doc.text(
                sectionTitle,
                14,
                y
            );

            y += 7;

            doc.setFontSize(9);

            doc.text("ช่วง", 14, y);
            doc.text("รายรับ", 90, y);
            doc.text("รายจ่าย", 140, y);
            doc.text("คงเหลือ", 190, y);

            y += 5;

            doc.line(14, y, 230, y);

            y += 6;

            doc.setFont(PDF_FONT_REGULAR, "normal");

            entries.forEach((entry) => {
                if (y > 190) {
                    doc.addPage();
                    y = 18;
                }

                doc.text(entry.label, 14, y);

                doc.text(
                    number(entry.income, {
                        maximumFractionDigits: 2,
                    }),
                    90,
                    y
                );

                doc.text(
                    number(entry.expense, {
                        maximumFractionDigits: 2,
                    }),
                    140,
                    y
                );

                doc.text(
                    number(entry.net, {
                        maximumFractionDigits: 2,
                    }),
                    190,
                    y
                );

                y += 6;
            });

            y += 8;
        }

        drawBreakdownTable(
            "สรุปยอดรายวัน",
            periodSummary.byDay
        );

        drawBreakdownTable(
            "สรุปยอดรายเดือน",
            periodSummary.byMonth
        );

        doc.save(
            filename
        );
    } catch (error) {
        console.error(
            "PDF export failed:",
            error
        );

        /*
         * ถ้า jspdf ไม่มี หรือฝังฟอนต์ไม่สำเร็จ
         * ใช้ print เป็น fallback
         */
        printFinance(
            transactions,
            summary,
            {
                title,
                ...options,
            }
        );
    }
}

/* =========================================================
   PRINT
   =========================================================
   NOTE: signature เปลี่ยนจากเดิม (transactions, options)
   เป็น (transactions, summary, options)
   ========================================================= */

/*
 * IMPORTANT:
 * useFinancialOverview.js เรียกชื่อว่า printFinance
 * ดังนั้นต้อง export ชื่อนี้โดยตรง
 */

export function printFinance(
    transactions = [],
    summary = null,
    options = {}
) {
    const {
        title =
            "Financial Overview",
    } = options;

    const rows =
        normalizeTransactions(
            transactions
        );

    const periodSummary =
        buildPeriodSummary(rows);

    const rangeLabel =
        getPeriodRangeLabel(options);

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=1200,height=800"
        );

    if (!printWindow) {
        console.error(
            "Unable to open print window."
        );

        return;
    }

    const tableRows =
        rows
            .map(
                (row) => `
                    <tr>
                        <td>
                            ${escapeHtml(
                                row.date
                                    ? formatDateTimeExport(row.date)
                                    : "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                row.reference
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                row.type
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                row.itemName
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                row.description
                            )}
                        </td>

                        <td class="income">
                            ${escapeHtml(
                                money(
                                    row.income
                                )
                            )}
                        </td>

                        <td class="expense">
                            ${escapeHtml(
                                money(
                                    row.expense
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                money(
                                    row.amount
                                )
                            )}
                        </td>
                    </tr>
                `
            )
            .join("");

    const dayRows =
        periodSummary.byDay
            .map(
                (day) => `
                    <tr>
                        <td>${escapeHtml(day.label)}</td>
                        <td class="income">${escapeHtml(money(day.income))}</td>
                        <td class="expense">${escapeHtml(money(day.expense))}</td>
                        <td>${escapeHtml(money(day.net))}</td>
                    </tr>
                `
            )
            .join("");

    const monthRows =
        periodSummary.byMonth
            .map(
                (month) => `
                    <tr>
                        <td>${escapeHtml(month.label)}</td>
                        <td class="income">${escapeHtml(money(month.income))}</td>
                        <td class="expense">${escapeHtml(money(month.expense))}</td>
                        <td>${escapeHtml(money(month.net))}</td>
                    </tr>
                `
            )
            .join("");

    printWindow.document.write(
        `
        <!doctype html>

        <html lang="th">

        <head>
            <meta charset="utf-8" />

            <title>
                ${escapeHtml(title)}
            </title>

            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 30px;

                    color: #383244;
                    background: #fff;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;
                }

                h1 {
                    margin:
                        0 0 6px;

                    color: #2d2737;

                    font-size: 24px;
                }

                h2 {
                    margin: 30px 0 10px;

                    color: #2d2737;

                    font-size: 16px;
                }

                .generated {
                    margin-bottom: 4px;

                    color: #9992a4;

                    font-size: 11px;
                }

                .range-label {
                    margin-bottom: 22px;

                    color: #635a70;

                    font-size: 12px;

                    font-weight: 700;
                }

                table {
                    width: 100%;

                    border-collapse:
                        collapse;

                    font-size: 11px;

                    margin-bottom: 10px;
                }

                th {
                    padding: 9px;

                    border-bottom:
                        1px solid
                        #ddd6e8;

                    background:
                        #f8f5fc;

                    color: #635a70;

                    text-align: left;

                    font-weight: 700;
                }

                td {
                    padding: 9px;

                    border-bottom:
                        1px solid
                        #eeeaf2;
                }

                .income {
                    color: #23966a;
                }

                .expense {
                    color: #d16b78;
                }

                .summary-total {
                    margin: 10px 0 26px;

                    font-size: 13px;
                }

                .summary-total div {
                    padding: 3px 0;
                }

                .page-break {
                    page-break-before: always;
                }

                @media print {
                    body {
                        padding: 10px;
                    }
                }
            </style>
        </head>

        <body>
            <h1>
                ${escapeHtml(title)}
            </h1>

            <div class="generated">
                Generated:
                ${escapeHtml(
                    new Date().toLocaleString()
                )}
            </div>

            <div class="range-label">
                ${escapeHtml(rangeLabel)}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Reference</th>
                        <th>Type</th>
                        <th>Item</th>
                        <th>Description</th>
                        <th>Income</th>
                        <th>Expense</th>
                        <th>Amount</th>
                    </tr>
                </thead>

                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div class="page-break"></div>

            <h1>สรุปยอดบัญชี</h1>

            <div class="range-label">
                ${escapeHtml(rangeLabel)}
            </div>

            <div class="summary-total">
                <div><strong>รายรับรวม:</strong> ${escapeHtml(money(periodSummary.totalIncome))}</div>
                <div><strong>รายจ่ายรวม:</strong> ${escapeHtml(money(periodSummary.totalExpense))}</div>
                <div><strong>คงเหลือสุทธิ:</strong> ${escapeHtml(money(periodSummary.totalNet))}</div>
            </div>

            <h2>สรุปยอดรายวัน</h2>

            <table>
                <thead>
                    <tr>
                        <th>วันที่</th>
                        <th>รายรับ</th>
                        <th>รายจ่าย</th>
                        <th>คงเหลือ</th>
                    </tr>
                </thead>

                <tbody>
                    ${dayRows}
                </tbody>
            </table>

            <h2>สรุปยอดรายเดือน</h2>

            <table>
                <thead>
                    <tr>
                        <th>เดือน</th>
                        <th>รายรับ</th>
                        <th>รายจ่าย</th>
                        <th>คงเหลือ</th>
                    </tr>
                </thead>

                <tbody>
                    ${monthRows}
                </tbody>
            </table>
        </body>

        </html>
        `
    );

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
        printWindow.print();
    }, 250);
}

/* =========================================================
   BACKWARD COMPATIBILITY
   ========================================================= */

/*
 * ถ้าที่อื่นในโปรเจกต์ยังใช้ชื่อเก่า
 * printFinanceReport
 * ก็ยังใช้ได้
 */

export const printFinanceReport =
    printFinance;

/* =========================================================
   GENERIC EXPORT
   =========================================================
   NOTE: signature เพิ่ม summary เข้ามาเป็นพารามิเตอร์ที่ 3
   ========================================================= */

export async function exportFinance(
    format,
    transactions = [],
    summary = null,
    options = {}
) {
    const normalizedFormat =
        String(
            format ?? ""
        )
            .trim()
            .toLowerCase();

    switch (
        normalizedFormat
    ) {
        case "excel":
        case "xlsx":
            return exportFinanceExcel(
                transactions,
                summary,
                options
            );

        case "pdf":
            return exportFinancePDF(
                transactions,
                summary,
                options
            );

        case "csv":
            return exportFinanceCSV(
                transactions,
                options
            );

        case "print":
            return printFinance(
                transactions,
                summary,
                options
            );

        default:
            throw new Error(
                `Unsupported finance export format: ${format}`
            );
    }
}

/* =========================================================
   DOWNLOAD
   ========================================================= */

function downloadBlob(
    blob,
    filename
) {
    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href = url;
    link.download = filename;

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(
            url
        );
    }, 1000);
}

/* =========================================================
   HTML
   ========================================================= */

function escapeHtml(value) {
    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}

function truncate(
    value,
    maxLength = 30
) {
    const text =
        String(
            value ?? ""
        );

    if (
        text.length <=
        maxLength
    ) {
        return text;
    }

    return (
        text.slice(
            0,
            maxLength - 3
        ) + "..."
    );
}

/* =========================================================
   DEFAULT
   ========================================================= */

const financeExport = {
    exportFinance,
    exportFinanceExcel,
    exportFinancePDF,
    exportFinanceCSV,
    printFinance,
    printFinanceReport,
};

export default financeExport;