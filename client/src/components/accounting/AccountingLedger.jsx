import React from "react";

import {
Receipt,
CalendarDays,
Search,
X,
ArrowUpRight,
ArrowDownRight,
Eye
} from "lucide-react";

// ======================================================
// ACCOUNTING LEDGER
// ======================================================

export default function AccountingLedger({
rows = [],
summary = {
income: 0,
expense: 0,
net: 0
},
periodLabel = "Today",
search = "",
onSearchChange,
onRowClick
}) {

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
            timeZone: "Asia/Bangkok",
            year: "numeric",
            month: "short",
            day: "numeric"
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
            timeZone: "Asia/Bangkok",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function getType(row) {

    return row?.type === "INCOME"
        ? "INCOME"
        : "EXPENSE";

}


function getTypeLabel(row) {

    return (
        row?.typeLabel ||
        (
            getType(row) === "INCOME"
                ? "รายรับ"
                : "รายจ่าย"
        )
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


function getIncome(row) {

    if (row?.income !== undefined) {
        return num(row.income);
    }

    if (getType(row) === "INCOME") {
        return num(row?.amount);
    }

    return 0;

}


function getExpense(row) {

    if (row?.expense !== undefined) {
        return num(row.expense);
    }

    if (getType(row) === "EXPENSE") {
        return num(row?.amount);
    }

    return 0;

}


function getBalance(row) {

    return num(
        row?.balance
    );

}


// ==================================================
// SEARCH
// ==================================================

function handleSearchChange(event) {

    onSearchChange?.(
        event.target.value
    );

}


// ==================================================
// ROW CLICK
// ==================================================

function handleRowClick(row) {

    onRowClick?.(row);

}


// ==================================================
// RENDER
// ==================================================

return (

    <section className="accounting-ledger-section">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="accounting-ledger-header">

            <div className="accounting-ledger-title">

                <div className="accounting-ledger-icon">

                    <Receipt size={20} />

                </div>

                <div>

                    <strong>
                        Accounting Ledger
                    </strong>

                    <span>
                        ตารางบัญชีรายรับ - รายจ่าย
                    </span>

                </div>

            </div>


            <div className="accounting-ledger-period">

                <CalendarDays size={15} />

                <span>
                    {periodLabel}
                </span>

            </div>

        </div>


        {/* ==========================================
            SUMMARY
        ========================================== */}

        <div className="accounting-summary">

            <div className="accounting-summary-card income">

                <span>
                    รายรับรวม
                </span>

                <strong>
                    ฿{money(
                        summary?.income
                    )}
                </strong>

            </div>


            <div className="accounting-summary-card expense">

                <span>
                    รายจ่ายรวม
                </span>

                <strong>
                    ฿{money(
                        summary?.expense
                    )}
                </strong>

            </div>


            <div className="accounting-summary-card balance">

                <span>
                    คงเหลือสุทธิ
                </span>

                <strong>
                    ฿{money(
                        summary?.net
                    )}
                </strong>

            </div>

        </div>


        {/* ==========================================
            TOOLBAR
        ========================================== */}

        <div className="accounting-toolbar">

            <div className="accounting-search">

                <Search size={17} />

                <input
                    type="text"
                    placeholder="ค้นหารายการบัญชี..."
                    value={search}
                    onChange={
                        handleSearchChange
                    }
                />

                {search && (

                    <button
                        type="button"
                        onClick={() =>
                            onSearchChange?.("")
                        }
                        aria-label="Clear search"
                    >

                        <X size={14} />

                    </button>

                )}

            </div>


            <div className="accounting-toolbar-info">

                <Receipt size={15} />

                <span>
                    {rows.length} รายการ
                </span>

            </div>

        </div>


        {/* ==========================================
            TABLE
        ========================================== */}

        <div className="accounting-table-wrapper">

            {rows.length === 0 ? (

                <div className="accounting-empty">

                    <Receipt size={38} />

                    <strong>
                        ยังไม่มีรายการบัญชี
                    </strong>

                    <span>
                        ไม่พบรายรับหรือรายจ่ายในช่วงเวลาที่เลือก
                    </span>

                </div>

            ) : (

                <table className="accounting-table">

                    <thead>

                        <tr>

                            <th>
                                วันที่
                            </th>

                            <th>
                                เลขที่
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

                            <th className="amount-column">
                                รายรับ
                            </th>

                            <th className="amount-column">
                                รายจ่าย
                            </th>

                            <th className="amount-column">
                                ยอดคงเหลือ
                            </th>

                            <th className="action-column">
                                ดู
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {rows.map(
                            (
                                row,
                                index
                            ) => {

                                const type =
                                    getType(row);

                                const isIncome =
                                    type === "INCOME";

                                const income =
                                    getIncome(row);

                                const expense =
                                    getExpense(row);

                                const rowKey =
                                    row?.id ||
                                    row?.reference ||
                                    `${type}-${row?.date || "row"}-${index}`;


                                return (

                                    <tr
                                        key={rowKey}
                                        onClick={() =>
                                            handleRowClick(
                                                row
                                            )
                                        }
                                    >

                                        {/* ======================
                                            DATE
                                        ====================== */}

                                        <td>

                                            <div className="ledger-date">

                                                <CalendarDays
                                                    size={14}
                                                />

                                                <div>

                                                    <strong>
                                                        {formatDate(
                                                            row?.date
                                                        )}
                                                    </strong>

                                                    <span>
                                                        {formatTime(
                                                            row?.date
                                                        )}
                                                    </span>

                                                </div>

                                            </div>

                                        </td>


                                        {/* ======================
                                            REFERENCE
                                        ====================== */}

                                        <td>

                                            <span className="ledger-reference">

                                                {
                                                    getReference(
                                                        row
                                                    )
                                                }

                                            </span>

                                        </td>


                                        {/* ======================
                                            TYPE
                                        ====================== */}

                                        <td>

                                            <span
                                                className={
                                                    "ledger-type " +
                                                    (
                                                        isIncome
                                                            ? "income"
                                                            : "expense"
                                                    )
                                                }
                                            >

                                                {isIncome ? (

                                                    <ArrowUpRight
                                                        size={13}
                                                    />

                                                ) : (

                                                    <ArrowDownRight
                                                        size={13}
                                                    />

                                                )}

                                                {
                                                    getTypeLabel(
                                                        row
                                                    )
                                                }

                                            </span>

                                        </td>


                                        {/* ======================
                                            TITLE
                                        ====================== */}

                                        <td>

                                            <div className="ledger-item-name">

                                                <strong>
                                                    {getTitle(row)}
                                                </strong>

                                                {row?.sourceId && (

                                                    <span>
                                                        #{row.sourceId}
                                                    </span>

                                                )}

                                            </div>

                                        </td>


                                        {/* ======================
                                            DESCRIPTION
                                        ====================== */}

                                        <td>

                                            <div className="ledger-description">

                                                <span>
                                                    {getDescription(row)}
                                                </span>

                                                {row?.category && (

                                                    <small>
                                                        {row.category}
                                                    </small>

                                                )}

                                            </div>

                                        </td>


                                        {/* ======================
                                            INCOME
                                        ====================== */}

                                        <td className="amount-column">

                                            {income > 0 ? (

                                                <strong className="ledger-income">

                                                    +฿
                                                    {money(
                                                        income
                                                    )}

                                                </strong>

                                            ) : (

                                                <span className="ledger-zero">
                                                    -
                                                </span>

                                            )}

                                        </td>


                                        {/* ======================
                                            EXPENSE
                                        ====================== */}

                                        <td className="amount-column">

                                            {expense > 0 ? (

                                                <strong className="ledger-expense">

                                                    -฿
                                                    {money(
                                                        expense
                                                    )}

                                                </strong>

                                            ) : (

                                                <span className="ledger-zero">
                                                    -
                                                </span>

                                            )}

                                        </td>


                                        {/* ======================
                                            BALANCE
                                        ====================== */}

                                        <td className="amount-column">

                                            <strong className="ledger-balance">

                                                ฿
                                                {money(
                                                    getBalance(row)
                                                )}

                                            </strong>

                                        </td>


                                        {/* ======================
                                            VIEW
                                        ====================== */}

                                        <td className="action-column">

                                            <button
                                                type="button"
                                                className="ledger-view-btn"
                                                onClick={
                                                    event => {

                                                        event.stopPropagation();

                                                        handleRowClick(
                                                            row
                                                        );

                                                    }
                                                }
                                                aria-label="View accounting detail"
                                                title="ดูรายละเอียด"
                                            >

                                                <Eye size={15} />

                                            </button>

                                        </td>

                                    </tr>

                                );

                            }
                        )}

                    </tbody>


                    {/* ==================================
                        TABLE FOOTER
                    ================================== */}

                    <tfoot>

                        <tr>

                            <td
                                colSpan="5"
                                className="ledger-total-label"
                            >

                                รวม

                            </td>


                            <td className="amount-column ledger-total-income">

                                +฿
                                {money(
                                    summary?.income
                                )}

                            </td>


                            <td className="amount-column ledger-total-expense">

                                -฿
                                {money(
                                    summary?.expense
                                )}

                            </td>


                            <td className="amount-column ledger-total-balance">

                                ฿
                                {money(
                                    summary?.net
                                )}

                            </td>


                            <td />

                        </tr>

                    </tfoot>

                </table>

            )}

        </div>


        {/* ==========================================
            FOOTER
        ========================================== */}

        <div className="accounting-table-footer">

            <span>
                แสดงข้อมูลจาก Orders และ Expenses
            </span>

            <span>
                Export / Print จะใช้ข้อมูลจากตารางนี้
            </span>

        </div>

    </section>

);

}