// ======================================================
// FINANCIAL OVERVIEW
// ======================================================

import React, {
    useMemo,
    useState
} from "react";

import {
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    FileSpreadsheet,
    FileText,
    Printer,
    RefreshCw,
    Search,
    X,
    TrendingUp,
    TrendingDown,
    Wallet,
    Receipt,
    Package,
    Percent,
    Truck,
    Eye,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";

import "../styles/FinancialOverview.css";

import useFinancialOverview
    from "../hooks/useFinancialOverview";


// ======================================================
// HELPERS
// ======================================================

function money(value) {

    const numericValue =
        Number(value) || 0;

    return numericValue.toLocaleString(
        "th-TH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


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

    return date.toLocaleDateString(
        "th-TH",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
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

    return date.toLocaleString(
        "th-TH",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
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

    return date.toLocaleTimeString(
        "th-TH",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function toInputDate(value) {

    if (!value) {
        return "";
    }

    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return value;
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ======================================================
// INCOME TYPE CHECK
// ======================================================
//
// useFinancialOverview.js (normalizeTransaction) ให้ค่า
// transaction.type เป็น "SALE" | "INCOME" | "EXPENSE"
// (ไม่ใช่แค่ "INCOME" / "EXPENSE" เหมือนที่โค้ดเดิมของหน้านี้
// สมมติไว้) การเช็คแบบเดิม `transaction.type === "INCOME"`
// จึงพลาดรายการขาย (type "SALE") ไปเป็น "รายจ่าย" ผิดๆ
// เกือบทุกรายการ — รวมจุดเช็คไว้ที่ helper เดียวเพื่อไม่ให้
// พลาดซ้ำที่ไหนอีก
//
// ======================================================

function isIncomeTransaction(transaction) {

    return (
        transaction?.type === "INCOME" ||
        transaction?.type === "SALE"
    );
}


function getTransactionTitle(transaction) {

    return (
        transaction?.title ||
        transaction?.name ||
        transaction?.productName ||
        (
            isIncomeTransaction(transaction)
                ? "รายรับ"
                : "รายจ่าย"
        )
    );
}


function getTransactionDescription(transaction) {

    return (
        transaction?.description ||
        transaction?.category ||
        transaction?.customer?.name ||
        transaction?.customerName ||
        "-"
    );
}


function getTransactionAmount(transaction) {

    return (
        Number(
            transaction?.amount ??
            transaction?.total ??
            transaction?.totalAmount ??
            0
        ) || 0
    );
}


function getTransactionDate(transaction) {

    return (
        transaction?.date ||
        transaction?.soldAt ||
        transaction?.saleDate ||
        transaction?.createdAt ||
        transaction?.updatedAt ||
        null
    );
}


// ======================================================
// CALENDAR
// ======================================================

function CalendarPopup({
    value,
    onChange,
    onClose
}) {

    const initialDate =
        value
            ? new Date(value)
            : new Date();

    const [
        viewDate,
        setViewDate
    ] = useState(
        new Date(
            initialDate.getFullYear(),
            initialDate.getMonth(),
            1
        )
    );

    const year =
        viewDate.getFullYear();

    const month =
        viewDate.getMonth();

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const previousMonth = () => {

        setViewDate(
            new Date(
                year,
                month - 1,
                1
            )
        );
    };


    const nextMonth = () => {

        setViewDate(
            new Date(
                year,
                month + 1,
                1
            )
        );
    };


    const selectDay = day => {

        const selected =
            new Date(
                year,
                month,
                day
            );

        onChange(
            toInputDate(selected)
        );
    };


    const today =
        new Date();


    const isToday = day =>
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();


    const selectedDate =
        value
            ? new Date(value)
            : null;


    const isSelected = day => {

        if (!selectedDate) {
            return false;
        }

        return (
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year
        );
    };


    const monthName =
        viewDate.toLocaleDateString(
            "th-TH",
            {
                month: "long"
            }
        );


    const yearText =
        viewDate.toLocaleDateString(
            "th-TH",
            {
                year: "numeric"
            }
        );


    const cells = [];


    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        cells.push(
            <div
                key={`empty-${i}`}
                className="finance-calendar-day empty"
            />
        );
    }


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        cells.push(
            <button
                key={day}
                type="button"
                className={[
                    "finance-calendar-day",
                    isToday(day)
                        ? "today"
                        : "",
                    isSelected(day)
                        ? "selected"
                        : ""
                ].join(" ")}
                onClick={() =>
                    selectDay(day)
                }
            >
                {day}
            </button>
        );
    }


    return (
        <div
            className="finance-calendar-overlay"
            onMouseDown={onClose}
        >

            <div
                className="finance-calendar-card"
                onMouseDown={event =>
                    event.stopPropagation()
                }
            >

                <div className="finance-calendar-header">

                    <div>

                        <strong>
                            เลือกวันที่
                        </strong>

                        <span>
                            {monthName} {yearText}
                        </span>

                    </div>


                    <button
                        type="button"
                        className="finance-icon-button"
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>

                </div>


                <div className="finance-calendar-navigation">

                    <button
                        type="button"
                        onClick={previousMonth}
                    >
                        <ChevronLeft size={18} />
                    </button>


                    <strong>
                        {monthName} {yearText}
                    </strong>


                    <button
                        type="button"
                        onClick={nextMonth}
                    >
                        <ChevronRight size={18} />
                    </button>

                </div>


                <div className="finance-calendar-weekdays">

                    {[
                        "อา",
                        "จ",
                        "อ",
                        "พ",
                        "พฤ",
                        "ศ",
                        "ส"
                    ].map(day => (
                        <span key={day}>
                            {day}
                        </span>
                    ))}

                </div>


                <div className="finance-calendar-grid">
                    {cells}
                </div>


                <div className="finance-calendar-footer">

                    <button
                        type="button"
                        className="finance-calendar-today"
                        onClick={() =>
                            onChange(
                                toInputDate(
                                    new Date()
                                )
                            )
                        }
                    >
                        วันนี้
                    </button>

                </div>

            </div>

        </div>
    );
}


// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
    icon,
    title,
    value,
    description,
    variant
}) {

    return (
        <div
            className={[
                "finance-summary-card",
                `finance-summary-${variant}`
            ].join(" ")}
        >

            <div className="finance-summary-top">

                <div className="finance-summary-icon">
                    {icon}
                </div>

                <span className="finance-summary-label">
                    {title}
                </span>

            </div>


            <div className="finance-summary-value">
                ฿{money(value)}
            </div>


            {description && (
                <div className="finance-summary-description">
                    {description}
                </div>
            )}

        </div>
    );
}


// ======================================================
// TRANSACTION MODAL
// ======================================================

function TransactionModal({
    transaction,
    onClose
}) {

    if (!transaction) {
        return null;
    }


    const isIncome =
        isIncomeTransaction(
            transaction
        );


    const amount =
        getTransactionAmount(
            transaction
        );


    const transactionDate =
        getTransactionDate(
            transaction
        );


    return (
        <div
            className="finance-modal-overlay"
            onMouseDown={onClose}
        >

            <div
                className="finance-transaction-modal"
                onMouseDown={event =>
                    event.stopPropagation()
                }
            >

                <div className="finance-modal-header">

                    <div>

                        <span className="finance-modal-eyebrow">
                            TRANSACTION DETAIL
                        </span>

                        <h3>
                            {getTransactionTitle(
                                transaction
                            )}
                        </h3>

                    </div>


                    <button
                        type="button"
                        className="finance-icon-button"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>

                </div>


                <div className="finance-transaction-status-row">

                    <span
                        className={[
                            "finance-type-badge",
                            isIncome
                                ? "income"
                                : "expense"
                        ].join(" ")}
                    >

                        {isIncome
                            ? "รายรับ"
                            : "รายจ่าย"}

                    </span>


                    <span className="finance-transaction-date">
                        {formatDateTime(
                            transactionDate
                        )}
                    </span>

                </div>


                <div className="finance-detail-amount">

                    <span>
                        จำนวนเงิน
                    </span>


                    <strong
                        className={
                            isIncome
                                ? "income-text"
                                : "expense-text"
                        }
                    >

                        {isIncome
                            ? "+"
                            : "-"}

                        ฿{money(amount)}

                    </strong>

                </div>


                <div className="finance-detail-grid">

                    <div>

                        <span>
                            รายการ
                        </span>

                        <strong>
                            {getTransactionTitle(
                                transaction
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            รายละเอียด
                        </span>

                        <strong>
                            {getTransactionDescription(
                                transaction
                            )}
                        </strong>

                    </div>


                    {transaction.category && (
                        <div>

                            <span>
                                หมวดหมู่
                            </span>

                            <strong>
                                {transaction.category}
                            </strong>

                        </div>
                    )}


                    {transaction.source && (
                        <div>

                            <span>
                                แหล่งที่มา
                            </span>

                            <strong>
                                {transaction.source}
                            </strong>

                        </div>
                    )}


                    {transaction.sourceId && (
                        <div>

                            <span>
                                Reference
                            </span>

                            <strong>
                                #{transaction.sourceId}
                            </strong>

                        </div>
                    )}


                    {transaction.saleId && (
                        <div>

                            <span>
                                Sale ID
                            </span>

                            <strong>
                                #{transaction.saleId}
                            </strong>

                        </div>
                    )}


                    {transaction.customer?.name && (
                        <div>

                            <span>
                                ลูกค้า
                            </span>

                            <strong>
                                {transaction.customer.name}
                            </strong>

                        </div>
                    )}


                    {isIncome && (

                        <>

                            <div>

                                <span>
                                    ค่าส่งจริง (ต้นทุน)
                                </span>

                                <strong>
                                    ฿{money(transaction.shippingActual)}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    ค่าใช้จ่ายอื่นๆ
                                </span>

                                <strong>
                                    ฿{money(transaction.otherExpense)}
                                </strong>

                            </div>

                        </>

                    )}

                </div>


                {Array.isArray(
                    transaction.items
                ) &&
                transaction.items.length > 0 && (

                    <div className="finance-detail-items">

                        <div className="finance-detail-section-title">
                            สินค้าในรายการ
                        </div>


                        <div className="finance-detail-items-list">

                            {transaction.items.map(
                                (item, index) => (

                                    <div
                                        className="finance-detail-item"
                                        key={
                                            item.id ||
                                            `${item.name || "item"}-${index}`
                                        }
                                    >

                                        <div>

                                            <span>
                                                {item.name ||
                                                    item.productName ||
                                                    "สินค้า"}
                                            </span>

                                            {item.quantity !== undefined && (
                                                <small>
                                                    จำนวน {item.quantity}
                                                </small>
                                            )}

                                        </div>


                                        <strong>
                                            ฿{money(
                                                item.salePrice ??
                                                item.amount ??
                                                item.total ??
                                                0
                                            )}
                                        </strong>

                                    </div>

                                )
                            )}

                        </div>

                    </div>
                )}


                <div className="finance-modal-footer">

                    <button
                        type="button"
                        className="finance-secondary-button"
                        onClick={onClose}
                    >
                        ปิด
                    </button>

                </div>

            </div>

        </div>
    );
}


// ======================================================
// PAGE
// ======================================================

export default function FinancialOverview() {

    const {
        summary = {},
        transactions = [],
        paginatedTransactions = [],
        daily = [],
        range,
        loading,
        error,
        period,
        selectedDate,
        customStart,
        customEnd,

        changePeriod,
        loadFinance,
        applyCustomDate,

        setSelectedDate,
        setCustomStart,
        setCustomEnd,

        search,
        setSearch,

        typeFilter,
        setTypeFilter,

        resetFilters,

        page,
        setPage,

        pageSize,
        setPageSize,

        totalPages,

        selectedTransaction,
        selectTransaction,
        closeTransaction,

        exportExcel,
        exportPDF,
        print

    } = useFinancialOverview();


    // ==================================================
    // LOCAL UI
    // ==================================================

    const [
        calendarOpen,
        setCalendarOpen
    ] = useState(false);


    const [
        calendarMode,
        setCalendarMode
    ] = useState("single");


    const [
        exportOpen,
        setExportOpen
    ] = useState(false);


    // ==================================================
    // SAFE VALUES
    // ==================================================

    const safeTotalPages =
        Math.max(
            1,
            Number(totalPages) || 1
        );


    const safePage =
        Math.min(
            Math.max(
                1,
                Number(page) || 1
            ),
            safeTotalPages
        );


    // ==================================================
    // SHOWING ALL?
    // ==================================================
    //
    // pageSize เป็น Infinity เมื่อผู้ใช้เลือก "ทั้งหมด" —
    // ใช้เช็คตรงนี้แทนการเทียบ pageSize === 10/20/50/100
    // เพื่อโชว์ UI ให้เหมาะสม (ไม่ต้องมี pagination controls)
    //
    // ==================================================

    const isShowingAll =
        !Number.isFinite(
            pageSize
        );


    // ==================================================
    // DATE
    // ==================================================

    const selectedDateValue =
        useMemo(
            () =>
                toInputDate(
                    selectedDate
                ),
            [selectedDate]
        );


    // ==================================================
    // PERIOD LABEL
    // ==================================================

    const periodLabel =
        useMemo(
            () => {

                switch (period) {

                    case "day":
                        return "วันนี้";

                    case "week":
                        return "สัปดาห์นี้";

                    case "month":
                        return "เดือนนี้";

                    case "year":
                        return "ปีนี้";

                    case "custom":
                        return "กำหนดเอง";

                    default:
                        return "วันนี้";
                }

            },
            [period]
        );


    // ==================================================
    // RANGE LABEL
    // ==================================================

    const rangeLabel =
        useMemo(
            () => {

                if (
                    customStart &&
                    customEnd &&
                    period === "custom"
                ) {

                    return `${formatDate(
                        customStart
                    )} - ${formatDate(
                        customEnd
                    )}`;
                }


                if (
                    range?.start &&
                    range?.end
                ) {

                    return `${formatDate(
                        range.start
                    )} - ${formatDate(
                        range.end
                    )}`;
                }


                return "เลือกช่วงเวลาที่ต้องการ";

            },
            [
                customStart,
                customEnd,
                period,
                range
            ]
        );


    // ==================================================
    // PAGE
    // ==================================================

    const goPrevious = () => {

        setPage(
            Math.max(
                1,
                safePage - 1
            )
        );
    };


    const goNext = () => {

        setPage(
            Math.min(
                safeTotalPages,
                safePage + 1
            )
        );
    };


    // ==================================================
    // PAGE SIZE
    // ==================================================
    //
    // เพิ่มตัวเลือก "ทั้งหมด" — ใช้ Infinity เป็นค่า pageSize
    // เพราะ paginatedTransactions ใช้ .slice(start, start+pageSize)
    // ซึ่ง slice(0, Infinity) จะคืนค่าทั้ง array มาให้พอดี
    // โดยไม่ต้องแก้ hook เลย
    //
    // ==================================================

    const handlePageSize = event => {

        const raw =
            event.target.value;


        const size =
            raw === "all"
                ? Infinity
                : Number(raw);


        setPageSize(size);

        setPage(1);
    };


    // ==================================================
    // DATE PICKER (SINGLE DATE, ไม่ใช่ custom range)
    // ==================================================

    const handleCalendarDate = value => {

        if (!value) {
            return;
        }


        const date =
            new Date(
                `${value}T00:00:00`
            );

        setSelectedDate(date);

        setPage(1);

        setSearch("");
        setTypeFilter("ALL");


        loadFinance({
            requestedPeriod: "day",
            requestedDate: value
        });

        setCalendarOpen(false);
    };


    // ==================================================
    // OPEN CUSTOM RANGE
    // ==================================================
    //
    // เดิมปุ่ม "กำหนดเอง" แค่เปิด popup ปฏิทินเฉยๆ โดยไม่เคย
    // เซ็ต period เป็น "custom" เลย ทำให้การ์ดเลือกวันที่
    // เริ่มต้น-สิ้นสุด (finance-custom-date-card ด้านล่าง ซึ่ง
    // render จาก `period === "custom"`) ไม่มีทางแสดงขึ้นมาได้
    // แก้โดยเรียก changePeriod("custom") ตรงๆ ซึ่งจะเซ็ต period
    // ให้ทันที (ไม่ยิง API จนกว่าจะกด "ดูข้อมูล")
    //
    // ==================================================

    const handleOpenCustomRange = () => {

        changePeriod("custom");
    };


    // ==================================================
    // APPLY CUSTOM
    // ==================================================

    const handleApplyCustom =
        async () => {

            if (!customStart) {
                return;
            }

            await applyCustomDate(
                customStart,
                customEnd ||
                customStart
            );

            setCalendarOpen(false);
        };


    // ==================================================
    // EXPORT
    // ==================================================

    const handleExportExcel = () => {

        if (typeof exportExcel === "function") {
            exportExcel();
        }

        setExportOpen(false);
    };


    const handleExportPDF = () => {

        if (typeof exportPDF === "function") {
            exportPDF();
        }

        setExportOpen(false);
    };


    const handlePrint = () => {

        if (typeof print === "function") {
            print();
        }

        setExportOpen(false);
    };


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (
            <div className="financial-overview-page">

                <div className="finance-loading">

                    <div className="finance-loading-icon">
                        <Wallet size={30} />
                    </div>


                    <strong>
                        กำลังโหลดข้อมูลทางการเงิน...
                    </strong>


                    <span>
                        กำลังเตรียมรายรับ รายจ่าย และรายการธุรกรรม
                    </span>

                </div>

            </div>
        );
    }


    // ==================================================
    // PAGE
    // ==================================================

    return (
        <div className="financial-overview-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="financial-overview-header">

                <div className="financial-overview-title">

                    <div className="financial-overview-title-icon">
                        <Wallet size={30} />
                    </div>


                    <div>

                        <div className="finance-title-row">

                            <h1>
                                Financial Overview
                            </h1>

                            <span>
                                ✨
                            </span>

                        </div>


                        <p>
                            ภาพรวมบัญชีรายรับ รายจ่าย และธุรกรรมทางการเงิน
                        </p>

                    </div>

                </div>


                <div className="financial-header-actions">

                    <button
                        type="button"
                        className="finance-refresh-button"
                        onClick={() =>
                            loadFinance()
                        }
                        disabled={loading}
                    >

                        <RefreshCw size={17} />

                        <span>
                            รีเฟรช
                        </span>

                    </button>


                    <div className="finance-export-wrapper">

                        <button
                            type="button"
                            className="finance-export-button"
                            onClick={() =>
                                setExportOpen(
                                    value => !value
                                )
                            }
                        >

                            <Download size={17} />

                            <span>
                                Export
                            </span>

                            <ChevronDown size={15} />

                        </button>


                        {exportOpen && (
                            <>

                                <div
                                    className="finance-export-backdrop"
                                    onClick={() =>
                                        setExportOpen(false)
                                    }
                                />


                                <div className="finance-export-menu">

                                    <button
                                        type="button"
                                        onClick={
                                            handleExportExcel
                                        }
                                    >

                                        <FileSpreadsheet size={17} />

                                        <span>
                                            Export Excel
                                        </span>

                                    </button>


                                    <button
                                        type="button"
                                        onClick={
                                            handleExportPDF
                                        }
                                    >

                                        <FileText size={17} />

                                        <span>
                                            Export PDF
                                        </span>

                                    </button>


                                    <button
                                        type="button"
                                        onClick={
                                            handlePrint
                                        }
                                    >

                                        <Printer size={17} />

                                        <span>
                                            Print
                                        </span>

                                    </button>

                                </div>

                            </>
                        )}

                    </div>

                </div>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div className="finance-error">

                    <div>

                        <strong>
                            ⚠️ โหลดข้อมูลไม่สำเร็จ
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            loadFinance()
                        }
                    >
                        ลองใหม่
                    </button>

                </div>
            )}


            {/* ==================================================
                PERIOD TOOLBAR
            ================================================== */}

            <div className="finance-period-toolbar">

                <div className="finance-period-buttons">

                    {[
                        ["day", "วันนี้"],
                        ["week", "สัปดาห์"],
                        ["month", "เดือน"],
                        ["year", "ปี"]
                    ].map(
                        ([value, label]) => (

                            <button
                                key={value}
                                type="button"
                                className={
                                    period === value
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    changePeriod(value)
                                }
                            >
                                {label}
                            </button>

                        )
                    )}


                    <button
                        type="button"
                        className={
                            period === "custom"
                                ? "active"
                                : ""
                        }
                        onClick={
                            handleOpenCustomRange
                        }
                    >
                        กำหนดเอง
                    </button>

                </div>


                <div className="finance-date-picker-wrapper">

                    <button
                        type="button"
                        className="finance-date-button"
                        onClick={() => {

                            setCalendarMode(
                                "single"
                            );

                            setCalendarOpen(true);

                        }}
                    >

                        <CalendarDays size={18} />


                        <div>

                            <span>
                                ช่วงเวลาที่ดู
                            </span>

                            <strong>
                                {periodLabel}
                            </strong>

                        </div>


                        <ChevronDown size={16} />

                    </button>


                    <div className="finance-range-label">
                        {rangeLabel}
                    </div>

                </div>

            </div>


            {/* ==================================================
                CUSTOM DATE
            ================================================== */}

            {period === "custom" && (

                <div className="finance-custom-date-card">

                    <div>

                        <span>
                            วันที่เริ่มต้น
                        </span>


                        <input
                            type="date"
                            value={customStart || ""}
                            onChange={event =>
                                setCustomStart(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    <div className="finance-custom-arrow">
                        →
                    </div>


                    <div>

                        <span>
                            วันที่สิ้นสุด
                        </span>


                        <input
                            type="date"
                            value={customEnd || ""}
                            min={
                                customStart ||
                                undefined
                            }
                            onChange={event =>
                                setCustomEnd(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    <button
                        type="button"
                        className="finance-apply-button"
                        disabled={!customStart}
                        onClick={
                            handleApplyCustom
                        }
                    >
                        ดูข้อมูล
                    </button>

                </div>
            )}


            {/* ==================================================
                SUMMARY
            ================================================== */}

            <section className="finance-summary-grid">

                <SummaryCard
                    variant="revenue"
                    icon={
                        <TrendingUp size={22} />
                    }
                    title="รายรับ"
                    value={
                        summary.revenue || 0
                    }
                    description={
                        `${summary.totalSales || 0} รายการขาย`
                    }
                />


                <SummaryCard
                    variant="expense"
                    icon={
                        <TrendingDown size={22} />
                    }
                    title="รายจ่าย"
                    value={
                        summary.expenses || 0
                    }
                    description={
                        `${summary.totalExpenses || 0} รายการ`
                    }
                />


                <SummaryCard
                    variant="cost"
                    icon={
                        <Package size={22} />
                    }
                    title="ต้นทุนสินค้า"
                    value={
                        summary.productCost || 0
                    }
                    description="ต้นทุนสินค้าที่ขาย"
                />


                <SummaryCard
                    variant="profit"
                    icon={
                        <Wallet size={22} />
                    }
                    title="กำไรสุทธิ"
                    value={
                        summary.netProfit || 0
                    }
                    description="รายรับ - ต้นทุน - ค่าส่ง - ค่าใช้จ่ายอื่นๆ - รายจ่าย"
                />

            </section>


            {/* ==================================================
                SECONDARY SUMMARY
            ================================================== */}

            <section className="finance-secondary-summary">

                <div className="finance-mini-card">

                    <div>
                        <Truck size={18} />
                    </div>

                    <span>
                        ค่าส่งจริง (ต้นทุน)
                    </span>

                    <strong>
                        ฿{money(
                            summary.shippingActual || 0
                        )}
                    </strong>

                </div>


                <div className="finance-mini-card">

                    <div>
                        <Receipt size={18} />
                    </div>

                    <span>
                        ค่าใช้จ่ายอื่นๆ (จากการขาย)
                    </span>

                    <strong>
                        ฿{money(
                            summary.otherExpense || 0
                        )}
                    </strong>

                </div>


                <div className="finance-mini-card">

                    <div>
                        <Percent size={18} />
                    </div>

                    <span>
                        ส่วนลด
                    </span>

                    <strong>
                        ฿{money(
                            summary.discount || 0
                        )}
                    </strong>

                </div>


                <div className="finance-mini-card">

                    <div>
                        <FileText size={18} />
                    </div>

                    <span>
                        จำนวนธุรกรรม
                    </span>

                    <strong>
                        {transactions.length}
                    </strong>

                </div>

            </section>


            {/* ==================================================
                DAILY BREAKDOWN
            ================================================== */}

            {daily.length > 0 && (

                <section className="finance-daily-section">

                    <div className="finance-section-header">

                        <div>

                            <span>
                                DAILY BREAKDOWN
                            </span>

                            <h2>
                                สรุปตามวัน
                            </h2>

                        </div>

                    </div>


                    <div className="finance-daily-list">

                        {daily.map(item => (

                            <div
                                className="finance-daily-row"
                                key={item.date}
                            >

                                <div className="finance-daily-date">

                                    <strong>
                                        {formatDate(
                                            item.date
                                        )}
                                    </strong>

                                </div>


                                <div className="finance-daily-value income">

                                    <span>
                                        รายรับ
                                    </span>

                                    <strong>
                                        +฿{money(
                                            item.income
                                        )}
                                    </strong>

                                </div>


                                <div className="finance-daily-value expense">

                                    <span>
                                        รายจ่าย
                                    </span>

                                    <strong>
                                        -฿{money(
                                            item.expense
                                        )}
                                    </strong>

                                </div>


                                <div className="finance-daily-value balance">

                                    <span>
                                        คงเหลือ
                                    </span>

                                    <strong>
                                        ฿{money(
                                            item.balance
                                        )}
                                    </strong>

                                </div>

                            </div>

                        ))}

                    </div>

                </section>
            )}


            {/* ==================================================
                TRANSACTIONS
            ================================================== */}

            <section className="finance-transactions-section">

                <div className="finance-section-header">

                    <div>

                        <span>
                            TRANSACTION HISTORY
                        </span>

                        <h2>
                            บัญชีรายรับ - รายจ่าย
                        </h2>

                        <p>
                            รายการธุรกรรมทั้งหมดในช่วงเวลาที่เลือก
                        </p>

                    </div>


                    <div className="finance-transaction-count">

                        <Receipt size={17} />

                        <span>
                            {transactions.length} รายการ
                        </span>

                    </div>

                </div>


                {/* ==================================================
                    FILTERS
                ================================================== */}

                <div className="finance-transaction-toolbar">

                    <div className="finance-search">

                        <Search size={18} />


                        <input
                            type="text"
                            value={search || ""}
                            onChange={event =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="ค้นหารายการ, ลูกค้า, หมวดหมู่..."
                        />


                        {search && (

                            <button
                                type="button"
                                onClick={() =>
                                    setSearch("")
                                }
                            >
                                <X size={15} />
                            </button>

                        )}

                    </div>


                    <div className="finance-type-filter">

                        <button
                            type="button"
                            className={
                                typeFilter === "ALL"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setTypeFilter("ALL")
                            }
                        >
                            ทั้งหมด
                        </button>


                        <button
                            type="button"
                            className={
                                typeFilter === "INCOME"
                                    ? "active income"
                                    : ""
                            }
                            onClick={() =>
                                setTypeFilter("INCOME")
                            }
                        >
                            รายรับ
                        </button>


                        <button
                            type="button"
                            className={
                                typeFilter === "EXPENSE"
                                    ? "active expense"
                                    : ""
                            }
                            onClick={() =>
                                setTypeFilter("EXPENSE")
                            }
                        >
                            รายจ่าย
                        </button>

                    </div>


                    <button
                        type="button"
                        className="finance-reset-button"
                        onClick={resetFilters}
                    >
                        ล้างตัวกรอง
                    </button>

                </div>


                {/* ==================================================
                    TABLE
                ================================================== */}

                <div className="finance-table-wrapper">

                    <table className="finance-table">

                        <thead>

                            <tr>

                                <th>
                                    วันที่
                                </th>

                                <th>
                                    ประเภท
                                </th>

                                <th>
                                    รายการ
                                </th>

                                <th>
                                    รายละเอียด
                                </th>

                                <th>
                                    แหล่งที่มา
                                </th>

                                <th className="align-right">
                                    จำนวนเงิน
                                </th>

                                <th className="align-center">
                                    ดู
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {paginatedTransactions.length === 0 && (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="finance-empty"
                                    >

                                        <div>

                                            <Receipt size={34} />

                                            <strong>
                                                ไม่พบรายการธุรกรรม
                                            </strong>

                                            <span>
                                                ลองเปลี่ยนช่วงวันที่ หรือล้างตัวกรอง
                                            </span>

                                        </div>

                                    </td>

                                </tr>

                            )}


                            {paginatedTransactions.map(
                                transaction => {

                                    const isIncome =
                                        isIncomeTransaction(
                                            transaction
                                        );


                                    const transactionDate =
                                        getTransactionDate(
                                            transaction
                                        );


                                    const dateObject =
                                        transactionDate
                                            ? new Date(
                                                transactionDate
                                            )
                                            : null;


                                    const validDate =
                                        dateObject &&
                                        !Number.isNaN(
                                            dateObject.getTime()
                                        );


                                    const amount =
                                        getTransactionAmount(
                                            transaction
                                        );


                                    return (

                                        <tr
                                            key={
                                                transaction.id
                                            }
                                        >

                                            <td>

                                                <div className="finance-table-date">

                                                    <strong>
                                                        {formatDate(
                                                            transactionDate
                                                        )}
                                                    </strong>

                                                    <span>
                                                        {validDate
                                                            ? formatTime(
                                                                transactionDate
                                                            )
                                                            : "-"}
                                                    </span>

                                                </div>

                                            </td>


                                            <td>

                                                <span
                                                    className={[
                                                        "finance-type-badge",
                                                        isIncome
                                                            ? "income"
                                                            : "expense"
                                                    ].join(" ")}
                                                >

                                                    {isIncome ? (
                                                        <ArrowUpRight size={14} />
                                                    ) : (
                                                        <ArrowDownRight size={14} />
                                                    )}

                                                    {isIncome
                                                        ? "รายรับ"
                                                        : "รายจ่าย"}

                                                </span>

                                            </td>


                                            <td>

                                                <div className="finance-table-title">

                                                    <strong>
                                                        {getTransactionTitle(
                                                            transaction
                                                        )}
                                                    </strong>


                                                    {transaction.sourceId && (
                                                        <span>
                                                            #{transaction.sourceId}
                                                        </span>
                                                    )}

                                                </div>

                                            </td>


                                            <td>

                                                <div className="finance-table-description">

                                                    <span>
                                                        {getTransactionDescription(
                                                            transaction
                                                        )}
                                                    </span>


                                                    {transaction.category && (
                                                        <small>
                                                            {transaction.category}
                                                        </small>
                                                    )}

                                                </div>

                                            </td>


                                            <td>

                                                <span className="finance-source-badge">
                                                    {transaction.source || "-"}
                                                </span>

                                            </td>


                                            <td className="align-right">

                                                <strong
                                                    className={
                                                        isIncome
                                                            ? "finance-income-amount"
                                                            : "finance-expense-amount"
                                                    }
                                                >

                                                    {isIncome
                                                        ? "+"
                                                        : "-"}

                                                    ฿{money(
                                                        amount
                                                    )}

                                                </strong>

                                            </td>


                                            <td className="align-center">

                                                <button
                                                    type="button"
                                                    className="finance-view-button"
                                                    onClick={() =>
                                                        selectTransaction(
                                                            transaction
                                                        )
                                                    }
                                                    title="ดูรายละเอียด"
                                                >

                                                    <Eye size={17} />

                                                </button>

                                            </td>

                                        </tr>

                                    );
                                }
                            )}

                        </tbody>

                    </table>

                </div>


                {/* ==================================================
                    PAGINATION
                ================================================== */}

                <div className="finance-pagination">

                    <div className="finance-page-size">

                        <span>
                            แสดง
                        </span>


                        <select
                            value={
                                isShowingAll
                                    ? "all"
                                    : pageSize
                            }
                            onChange={
                                handlePageSize
                            }
                        >

                            <option value="10">
                                10
                            </option>

                            <option value="20">
                                20
                            </option>

                            <option value="50">
                                50
                            </option>

                            <option value="100">
                                100
                            </option>

                            <option value="all">
                                ทั้งหมด
                            </option>

                        </select>


                        <span>
                            {isShowingAll
                                ? `รายการ (${transactions.length} รายการ)`
                                : "รายการต่อหน้า"}
                        </span>

                    </div>


                    {!isShowingAll && (

                        <div className="finance-page-controls">

                            <span>
                                หน้า {safePage} / {safeTotalPages}
                            </span>


                            <button
                                type="button"
                                disabled={
                                    safePage <= 1
                                }
                                onClick={
                                    goPrevious
                                }
                            >
                                <ChevronLeft size={17} />
                            </button>


                            <button
                                type="button"
                                disabled={
                                    safePage >=
                                    safeTotalPages
                                }
                                onClick={
                                    goNext
                                }
                            >
                                <ChevronRight size={17} />
                            </button>

                        </div>

                    )}

                </div>

            </section>


            {/* ==================================================
                CALENDAR
            ================================================== */}

            {calendarOpen && (

                <CalendarPopup
                    value={
                        selectedDateValue
                    }
                    onChange={
                        handleCalendarDate
                    }
                    onClose={() =>
                        setCalendarOpen(false)
                    }
                />

            )}


            {/* ==================================================
                TRANSACTION MODAL
            ================================================== */}

            {selectedTransaction && (

                <TransactionModal
                    transaction={
                        selectedTransaction
                    }
                    onClose={
                        closeTransaction
                    }
                />

            )}

        </div>
    );
}