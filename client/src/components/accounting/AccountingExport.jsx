import React, {
useEffect,
useRef,
useState
} from "react";

import {
Download,
ChevronDown,
FileSpreadsheet,
FileText,
Printer
} from "lucide-react";

import * as XLSX from "xlsx";

import { downloadAccountingPdf } from "../../utils/generateAccountingPdf";

// ======================================================
// ACCOUNTING EXPORT
// ======================================================

export default function AccountingExport({
rows = [],
summary = {
income: 0,
expense: 0,
net: 0
},
periodLabel = "Today"
}) {

// ==================================================
// STATE
// ==================================================

const [open, setOpen] = useState(false);

const [pdfLoading, setPdfLoading] = useState(false);

const exportRef = useRef(null);


// ==================================================
// HELPERS
// ==================================================

function num(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    const normalized =
        typeof value === "string"
            ? value.replace(/,/g, "")
            : value;

    const n =
        Number(normalized);

    return Number.isFinite(n)
        ? n
        : 0;
}


function money(value) {

    return num(value)
        .toLocaleString(
            "th-TH",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );

}


function pad2(value) {

    return String(value).padStart(2, "0");

}


// ==================================================
// DATE / TIME FORMAT
// ==================================================
// รูปแบบมาตรฐานสำหรับเอกสารบัญชี: วัน/เดือน/ปี (พ.ศ.) เวลา 24 ชม.
// เช่น 01/09/2569 14:30
// ==================================================

function formatDate(value) {

    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-";
    }

    const day =
        pad2(date.getDate());

    const month =
        pad2(date.getMonth() + 1);

    // พ.ศ. = ค.ศ. + 543
    const year =
        date.getFullYear() + 543;

    return `${day}/${month}/${year}`;

}


function formatTime(value) {

    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-";
    }

    const hours =
        pad2(date.getHours());

    const minutes =
        pad2(date.getMinutes());

    return `${hours}:${minutes}`;

}


function formatDateTime(value) {

    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-";
    }

    return `${formatDate(value)} ${formatTime(value)}`;

}


function getTypeLabel(row) {

    return (
        row?.typeLabel ||
        (
            row?.type === "INCOME"
                ? "รายรับ"
                : "รายจ่าย"
        )
    );

}


function getTitle(row) {

    return (
        row?.title ||
        row?.name ||
        "-"
    );

}


function getDescription(row) {

    return (
        row?.description ||
        row?.category ||
        row?.customer?.name ||
        "-"
    );

}


function getReference(row) {

    return (
        row?.reference ||
        row?.sourceId ||
        row?.saleId ||
        "-"
    );

}


function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==================================================
// SUMMARY TOTALS (ใช้ร่วมกันทั้ง Excel และ Print/PDF)
// ==================================================
// ถ้า parent ส่ง summary prop ที่มีค่าจริงมา (income/expense/net
// ไม่เท่ากับ 0 อย่างน้อยหนึ่งค่า) ให้ใช้ค่านั้นเป็นหลัก เพื่อให้
// ตัวเลขตรงกับที่แสดงบนหน้าจอ Financial Overview เสมอ
// ถ้าไม่มี ให้คำนวณจาก rows ที่ส่งเข้ามาแทน (fallback)
// ==================================================

function computeTotals() {

    const totalIncome =
        rows.reduce(
            (
                total,
                row
            ) =>
                total +
                num(
                    row?.income ??
                    (
                        row?.type === "INCOME"
                            ? row?.amount
                            : 0
                    )
                ),
            0
        );


    const totalExpense =
        rows.reduce(
            (
                total,
                row
            ) =>
                total +
                num(
                    row?.expense ??
                    (
                        row?.type !== "INCOME"
                            ? row?.amount
                            : 0
                    )
                ),
            0
        );


    const summaryIncome =
        num(summary?.income);


    const summaryExpense =
        num(summary?.expense);


    const summaryNet =
        num(summary?.net);


    const hasSummaryOverride =
        summaryIncome !== 0 ||
        summaryExpense !== 0 ||
        summaryNet !== 0;


    const income =
        hasSummaryOverride
            ? summaryIncome
            : totalIncome;


    const expense =
        hasSummaryOverride
            ? summaryExpense
            : totalExpense;


    const net =
        hasSummaryOverride
            ? summaryNet
            : income - expense;


    return {
        income,
        expense,
        net
    };

}


// ==================================================
// CLOSE DROPDOWN
// ==================================================

useEffect(() => {

    function handleClickOutside(event) {

        if (
            exportRef.current &&
            !exportRef.current.contains(
                event.target
            )
        ) {

            setOpen(false);

        }

    }


    document.addEventListener(
        "mousedown",
        handleClickOutside
    );


    return () => {

        document.removeEventListener(
            "mousedown",
            handleClickOutside
        );

    };

}, []);


// ==================================================
// EXPORT DATA
// ==================================================

function getExportRows() {

    return rows.map(
        row => {

            const isIncome =
                row?.type === "INCOME";

            return {

                "วันที่":
                    formatDate(
                        row?.date
                    ),

                "เวลา":
                    formatTime(
                        row?.date
                    ),

                "เลขที่รายการ":
                    getReference(row),

                "ประเภท":
                    getTypeLabel(row),

                "รายการ":
                    getTitle(row),

                "รายละเอียด":
                    getDescription(row),

                "แหล่งที่มา":
                    row?.source || "-",

                "รายรับ":
                    isIncome
                        ? num(
                            row?.income ??
                            row?.amount
                        )
                        : 0,

                "รายจ่าย":
                    !isIncome
                        ? num(
                            row?.expense ??
                            row?.amount
                        )
                        : 0,

                "ยอดคงเหลือ":
                    num(
                        row?.balance
                    )

            };

        }
    );

}


// ==================================================
// EXPORT EXCEL
// ==================================================

function handleExportExcel() {

    try {

        const exportRows =
            getExportRows();


        const workbook =
            XLSX.utils.book_new();


        // ==========================================
        // ACCOUNTING SHEET
        // ==========================================

        const sheet =
            XLSX.utils.json_to_sheet(
                exportRows
            );


        sheet["!cols"] = [

            {
                wch: 13
            },

            {
                wch: 8
            },

            {
                wch: 18
            },

            {
                wch: 14
            },

            {
                wch: 28
            },

            {
                wch: 32
            },

            {
                wch: 18
            },

            {
                wch: 18
            },

            {
                wch: 18
            },

            {
                wch: 18
            }

        ];


        XLSX.utils.book_append_sheet(
            workbook,
            sheet,
            "Accounting"
        );


        // ==========================================
        // SUMMARY SHEET
        // ==========================================

        const totals =
            computeTotals();


        const summaryRows = [

            {
                "รายการ":
                    "ช่วงเวลา",

                "ข้อมูล":
                    periodLabel
            },

            {
                "รายการ":
                    "พิมพ์เมื่อ",

                "ข้อมูล":
                    formatDateTime(new Date())
            },

            {
                "รายการ":
                    "รายรับรวม",

                "ข้อมูล":
                    totals.income
            },

            {
                "รายการ":
                    "รายจ่ายรวม",

                "ข้อมูล":
                    totals.expense
            },

            {
                "รายการ":
                    "คงเหลือสุทธิ",

                "ข้อมูล":
                    totals.net
            },

            {
                "รายการ":
                    "จำนวนรายการ",

                "ข้อมูล":
                    rows.length
            }

        ];


        const summarySheet =
            XLSX.utils.json_to_sheet(
                summaryRows
            );


        summarySheet["!cols"] = [

            {
                wch: 24
            },

            {
                wch: 26
            }

        ];


        XLSX.utils.book_append_sheet(
            workbook,
            summarySheet,
            "Summary"
        );


        // ==========================================
        // FILE NAME
        // ==========================================

        const now = new Date();

        const fileDateStr =
            `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`;


        XLSX.writeFile(
            workbook,
            `accounting-${fileDateStr}.xlsx`
        );


        setOpen(false);

    } catch (error) {

        console.error(
            "Accounting Excel export error:",
            error
        );


        alert(
            "ไม่สามารถ Export Excel ได้"
        );

    }

}


// ==================================================
// PRINT (เปิดหน้าต่าง print preview ของเบราว์เซอร์)
// ==================================================
// หมายเหตุ: ปุ่ม PDF ไม่ใช้ฟังก์ชันนี้แล้ว — PDF สร้างผ่าน jsPDF
// ในไฟล์ utils/generateAccountingPdf.js แทน เพื่อฝัง Sarabun font
// เองตรง ๆ ไม่พึ่ง font/engine ของเบราว์เซอร์ผู้ใช้ (กัน Thai text
// เพี้ยนตอน "Save as PDF" ซึ่งเคยเกิดปัญหานี้มาก่อน)
// ==================================================

function handlePrint() {

    try {

        const generatedAt =
            formatDateTime(
                new Date()
            );


        const totals =
            computeTotals();


        const totalIncome =
            totals.income;


        const totalExpense =
            totals.expense;


        const net =
            totals.net;


        // ==========================================
        // TABLE ROWS
        // ==========================================

        const tableRows =
            rows
                .map(
                    row => {

                        const isIncome =
                            row?.type ===
                            "INCOME";


                        const income =
                            num(
                                row?.income ??
                                (
                                    isIncome
                                        ? row?.amount
                                        : 0
                                )
                            );


                        const expense =
                            num(
                                row?.expense ??
                                (
                                    !isIncome
                                        ? row?.amount
                                        : 0
                                )
                            );


                        return `

<tr>

<td>
    ${escapeHtml(
        formatDate(
            row?.date
        )
    )}
</td>


<td>
    ${escapeHtml(
        formatTime(
            row?.date
        )
    )}
</td>


<td>
    ${escapeHtml(
        getReference(row)
    )}
</td>


<td class="${
    isIncome
        ? "income"
        : "expense"
}">

    ${escapeHtml(
        getTypeLabel(row)
    )}

</td>


<td>
    ${escapeHtml(
        getTitle(row)
    )}
</td>


<td>
    ${escapeHtml(
        getDescription(row)
    )}
</td>


<td>
    ${escapeHtml(
        row?.source || "-"
    )}
</td>


<td class="money income-money">

    ${
        income > 0
            ? `฿${money(
                income
            )}`
            : "-"
    }

</td>


<td class="money expense-money">

    ${
        expense > 0
            ? `฿${money(
                expense
            )}`
            : "-"
    }

</td>


<td class="money balance-money">

    ฿${money(
        row?.balance
    )}

</td>

</tr>

                        `;

                    }
                )
                .join("");


        const emptyRow = `

<tr>

<td
    colspan="10"
    style="
        text-align:center;
        padding:30px;
    "
>

    ไม่มีรายการในช่วงเวลานี้

</td>

</tr>

        `;


        // ==========================================
        // PRINT HTML
        // ==========================================

        const html = `

<!DOCTYPE html>

<html lang="th">

<head>

<meta charset="UTF-8">

<title> Accounting Report </title>

<style> @page { size: A4 landscape; margin: 12mm; } * { box-sizing: border-box; } body { margin: 0; font-family: Arial, "Noto Sans Thai", "Tahoma", sans-serif; color: #3e3550; background: #ffffff; } .header { margin-bottom: 20px; } h1 { margin: 0 0 6px; font-size: 24px; } .subtitle { font-size: 13px; color: #777; } .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 18px; } .summary-card { border: 1px solid #eadff2; border-radius: 12px; padding: 12px 15px; } .summary-label { display: block; font-size: 11px; color: #777; margin-bottom: 4px; } .summary-value { font-size: 17px; font-weight: 700; } .income-text { color: #24966b; } .expense-text { color: #d36b78; } .net-text { color: #7865a8; } table { width: 100%; border-collapse: collapse; table-layout: fixed; } th { background: #f1eafa; color: #4e4560; font-size: 10px; padding: 9px 6px; border: 1px solid #ded4ea; text-align: left; } td { font-size: 9px; padding: 8px 6px; border: 1px solid #e7e1ed; vertical-align: middle; word-break: break-word; } .money { text-align: right; white-space: nowrap; } .income-money { color: #24966b; font-weight: 600; } .expense-money { color: #d36b78; font-weight: 600; } .balance-money { font-weight: 700; } td.income { color: #24966b; font-weight: 700; } td.expense { color: #d36b78; font-weight: 700; } .footer { margin-top: 14px; font-size: 10px; color: #888; text-align: right; } @media print { .no-print { display: none !important; } } </style>

</head>

<body>

<div class="header">

<h1>
    ตารางบัญชีรายรับ - รายจ่าย
</h1>


<div class="subtitle">

    Sale Record / Accounting Ledger

    &nbsp; • &nbsp;

    ช่วงเวลา:
    ${escapeHtml(
        periodLabel
    )}

    &nbsp; • &nbsp;

    พิมพ์เมื่อ:
    ${escapeHtml(
        generatedAt
    )}

</div>

</div>

<div class="summary">

<div class="summary-card">

    <span class="summary-label">
        รายรับรวม
    </span>

    <div class="summary-value income-text">

        ฿${money(
            totalIncome
        )}

    </div>

</div>


<div class="summary-card">

    <span class="summary-label">
        รายจ่ายรวม
    </span>

    <div class="summary-value expense-text">

        ฿${money(
            totalExpense
        )}

    </div>

</div>


<div class="summary-card">

    <span class="summary-label">
        คงเหลือสุทธิ
    </span>

    <div class="summary-value net-text">

        ฿${money(
            net
        )}

    </div>

</div>

</div>

<table>

<thead>

<tr>

<th style="width:9%">
    วันที่
</th>

<th style="width:6%">
    เวลา
</th>

<th style="width:8%">
    เลขที่
</th>

<th style="width:8%">
    ประเภท
</th>

<th style="width:13%">
    รายการ
</th>

<th style="width:16%">
    รายละเอียด
</th>

<th style="width:9%">
    แหล่งที่มา
</th>

<th style="width:10%">
    รายรับ
</th>

<th style="width:10%">
    รายจ่าย
</th>

<th style="width:11%">
    ยอดคงเหลือ
</th>

</tr>

</thead>

<tbody>

${
    tableRows ||
    emptyRow
}

</tbody>

</table>

<div class="footer">

จำนวน ${rows.length} รายการ

</div>

</body>

</html>

        `;


        // ==========================================
        // OPEN PRINT WINDOW
        // ==========================================
        // ใช้ Blob + Object URL แทน document.write เพื่อบังคับ
        // ให้เบราว์เซอร์อ่าน charset เป็น UTF-8 อย่างถูกต้อง
        // (document.write มักทำให้ข้อความไทยเพี้ยนเวลา print/save PDF)
        // ==========================================

        const blob =
            new Blob(
                [html],
                {
                    type: "text/html;charset=utf-8"
                }
            );


        const blobUrl =
            URL.createObjectURL(
                blob
            );


        const printWindow =
            window.open(
                blobUrl,
                "_blank",
                "width=1200,height=800"
            );


        if (!printWindow) {

            alert(
                "ไม่สามารถเปิดหน้าพิมพ์ได้ กรุณาอนุญาต Pop-up ของเว็บไซต์นี้"
            );

            URL.revokeObjectURL(
                blobUrl
            );

            return;

        }


        function triggerPrint() {

            try {

                printWindow.focus();

                printWindow.print();

            } catch (err) {

                console.error(
                    "Print trigger error:",
                    err
                );

            }

        }


        printWindow.onload = () => {

            setTimeout(
                triggerPrint,
                300
            );

        };


        // สำรอง เผื่อ onload ไม่ทำงานในบางเบราว์เซอร์
        setTimeout(
            triggerPrint,
            900
        );


        // เคลียร์ blob URL หลังใช้งานเสร็จ
        setTimeout(
            () => {

                URL.revokeObjectURL(
                    blobUrl
                );

            },
            60000
        );


        setOpen(false);

    } catch (error) {

        console.error(
            "Accounting print error:",
            error
        );


        alert(
            "ไม่สามารถเปิดหน้าพิมพ์ได้"
        );

    }

}


// ==================================================
// PDF (jsPDF + ฝัง Sarabun font — ดู utils/generateAccountingPdf.js)
// ==================================================

async function handleExportPdf() {

    try {

        setPdfLoading(true);

        await downloadAccountingPdf(
            rows,
            computeTotals(),
            periodLabel
        );

        setOpen(false);

    } catch (error) {

        console.error(
            "Accounting PDF export error:",
            error
        );


        alert(
            error?.message ||
            "ไม่สามารถสร้าง PDF ได้"
        );

    } finally {

        setPdfLoading(false);

    }

}


// ==================================================
// BUTTON HANDLERS
// ==================================================

function handleExcelClick() {

    handleExportExcel();

}


function handlePdfClick() {

    handleExportPdf();

}


function handlePrintClick() {

    handlePrint();

}


// ==================================================
// RENDER
// ==================================================

return (

    <div
        className="accounting-export-wrap"
        ref={exportRef}
    >

        {/* ==========================================
            EXPORT BUTTON
        ========================================== */}

        <button
            type="button"
            className="orders-action-btn export accounting-export-btn"
            onClick={() =>
                setOpen(
                    value => !value
                )
            }
            aria-expanded={open}
        >

            <Download
                size={17}
            />

            <span>
                Export
            </span>

            <ChevronDown
                size={15}
            />

        </button>


        {/* ==========================================
            EXPORT MENU
        ========================================== */}

        {open && (

            <div
                className="accounting-export-menu"
                role="menu"
            >

                {/* ==================================
                    EXCEL
                ================================== */}

                <button
                    type="button"
                    onClick={
                        handleExcelClick
                    }
                    role="menuitem"
                >

                    <FileSpreadsheet
                        size={17}
                    />


                    <div>

                        <strong>
                            Excel
                        </strong>

                        <span>
                            Export ตารางบัญชี
                        </span>

                    </div>


                </button>


                {/* ==================================
                    PDF
                ================================== */}

                <button
                    type="button"
                    onClick={
                        handlePdfClick
                    }
                    disabled={pdfLoading}
                    role="menuitem"
                >

                    <FileText
                        size={17}
                    />


                    <div>

                        <strong>
                            PDF
                        </strong>

                        <span>
                            {pdfLoading
                                ? "กำลังสร้าง PDF..."
                                : "Save ตารางบัญชีเป็น PDF"}
                        </span>

                    </div>


                </button>


                {/* ==================================
                    PRINT
                ================================== */}

                <button
                    type="button"
                    onClick={
                        handlePrintClick
                    }
                    role="menuitem"
                >

                    <Printer
                        size={17}
                    />


                    <div>

                        <strong>
                            Print
                        </strong>

                        <span>
                            พิมพ์ตารางบัญชี
                        </span>

                    </div>


                </button>

            </div>

        )}

    </div>

);

}