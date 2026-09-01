import React, { useMemo } from "react";

import {
Wallet,
Search,
X,
Receipt,
ArrowUpRight,
ArrowDownRight,
CalendarDays,
ChevronRight
} from "lucide-react";

// ======================================================
// HELPERS
// ======================================================

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

function formatDate(date) {

if (!date) {

    return "-";

}


const parsed =
    new Date(date);


if (
    Number.isNaN(
        parsed.getTime()
    )
) {

    return "-";

}


return parsed.toLocaleDateString(
    "th-TH",
    {
        year: "numeric",
        month: "short",
        day: "numeric"
    }
);

}

// ======================================================
// TRANSACTION HISTORY
// ======================================================

export default function TransactionHistory({

transactions = [],

search = "",

activeTransactionType = "ALL",

onSearchChange,

onTypeChange,

onTransactionClick

}) {

// ==================================================
// FILTER
// ==================================================

const filteredTransactions =
    useMemo(() => {

        const key =
            String(search || "")
                .trim()
                .toLowerCase();


        return (
            Array.isArray(transactions)
                ? transactions
                : []
        ).filter(
            transaction => {

                if (!transaction) {

                    return false;

                }


                const type =
                    String(
                        transaction.type || ""
                    ).toUpperCase();


                const typeMatch =
                    activeTransactionType === "ALL" ||
                    type ===
                        String(
                            activeTransactionType ||
                            ""
                        ).toUpperCase();


                if (!typeMatch) {

                    return false;

                }


                if (!key) {

                    return true;

                }


                const searchableText = [

                    transaction.title,

                    transaction.description,

                    transaction.reference,

                    transaction.type,

                    transaction.typeLabel

                ]
                    .map(value =>
                        String(
                            value ?? ""
                        )
                            .toLowerCase()
                    )
                    .join(" ");


                return searchableText.includes(
                    key
                );

            }
        );

    }, [
        transactions,
        search,
        activeTransactionType
    ]);


// ==================================================
// TYPE CHANGE
// ==================================================

function handleTypeChange(type) {

    onTypeChange?.(
        type
    );

}


// ==================================================
// SEARCH CHANGE
// ==================================================

function handleSearchChange(event) {

    onSearchChange?.(
        event.target.value
    );

}


// ==================================================
// CLEAR SEARCH
// ==================================================

function handleClearSearch() {

    onSearchChange?.("");

}


// ==================================================
// RENDER
// ==================================================

return (

    <section className="transactions-section">


        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="section-main-header">

            <div className="section-main-title">

                <div className="transaction-title-icon">

                    <Wallet
                        size={19}
                        aria-hidden="true"
                    />

                </div>


                <div>

                    <strong>
                        Transaction History
                    </strong>

                    <span>
                        รายรับและรายจ่าย
                    </span>

                </div>

            </div>


            <div className="transaction-count">

                {filteredTransactions.length}

                {" "}

                transactions

            </div>

        </div>


        {/* ==========================================
            TOOLBAR
        ========================================== */}

        <div className="transaction-toolbar">


            {/* ======================================
                TYPE TABS
            ====================================== */}

            <div className="transaction-tabs">

                <button
                    type="button"
                    className={
                        activeTransactionType ===
                        "ALL"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        handleTypeChange(
                            "ALL"
                        )
                    }
                >

                    All

                </button>


                <button
                    type="button"
                    className={
                        activeTransactionType ===
                        "SALE"
                            ? "active sale"
                            : ""
                    }
                    onClick={() =>
                        handleTypeChange(
                            "SALE"
                        )
                    }
                >

                    Income

                </button>


                <button
                    type="button"
                    className={
                        activeTransactionType ===
                        "EXPENSE"
                            ? "active expense"
                            : ""
                    }
                    onClick={() =>
                        handleTypeChange(
                            "EXPENSE"
                        )
                    }
                >

                    Expense

                </button>

            </div>


            {/* ======================================
                SEARCH
            ====================================== */}

            <div className="transaction-search">

                <Search
                    size={17}
                    aria-hidden="true"
                />


                <input
                    type="text"
                    placeholder="Search transaction..."
                    value={
                        search || ""
                    }
                    onChange={
                        handleSearchChange
                    }
                    aria-label="Search transaction"
                />


                {search && (

                    <button
                        type="button"
                        onClick={
                            handleClearSearch
                        }
                        aria-label="Clear search"
                        title="Clear search"
                    >

                        <X
                            size={14}
                            aria-hidden="true"
                        />

                    </button>

                )}

            </div>

        </div>


        {/* ==========================================
            TRANSACTION LIST
        ========================================== */}

        <div className="transactions-list">

            {filteredTransactions.length === 0 ? (

                <div className="empty-transactions">

                    <Receipt
                        size={35}
                        aria-hidden="true"
                    />

                    <strong>
                        No transactions
                    </strong>

                    <span>
                        ยังไม่มีรายการในช่วงเวลานี้
                    </span>

                </div>

            ) : (

                filteredTransactions.map(
                    transaction => (

                        <TransactionRow
                            key={
                                transaction.id ??
                                transaction.reference ??
                                `${transaction.type}-${transaction.date}-${transaction.title}`
                            }
                            transaction={
                                transaction
                            }
                            onClick={
                                onTransactionClick
                            }
                        />

                    )
                )

            )}

        </div>


    </section>

);

}

// ======================================================
// TRANSACTION ROW
// ======================================================

function TransactionRow({

transaction,

onClick

}) {

const isSale =
    String(
        transaction?.type || ""
    ).toUpperCase() ===
    "SALE";


const safeAmount =
    num(
        transaction?.amount
    );


// ==================================================
// CLICK
// ==================================================

function handleClick() {

    onClick?.(
        transaction
    );

}


// ==================================================
// RENDER
// ==================================================

return (

    <button
        type="button"
        className="transaction-row"
        onClick={
            handleClick
        }
    >


        {/* ==========================================
            ICON
        ========================================== */}

        <div
            className={
                "transaction-icon " +
                (
                    isSale
                        ? "income"
                        : "expense"
                )
            }
        >

            {isSale ? (

                <ArrowUpRight
                    size={19}
                    aria-hidden="true"
                />

            ) : (

                <ArrowDownRight
                    size={19}
                    aria-hidden="true"
                />

            )}

        </div>


        {/* ==========================================
            MAIN
        ========================================== */}

        <div className="transaction-main">

            <strong>

                {
                    transaction?.title ||
                    "-"
                }

            </strong>


            <span>

                {
                    transaction?.description ||
                    "-"
                }

            </span>

        </div>


        {/* ==========================================
            DATE
        ========================================== */}

        <div className="transaction-date">

            <CalendarDays
                size={14}
                aria-hidden="true"
            />

            <span>
                {formatDate(
                    transaction?.date
                )}
            </span>

        </div>


        {/* ==========================================
            AMOUNT
        ========================================== */}

        <div
            className={
                "transaction-amount " +
                (
                    isSale
                        ? "income"
                        : "expense"
                )
            }
        >

            {isSale ? "+" : "-"}

            ฿

            {money(
                safeAmount
            )}

        </div>


        {/* ==========================================
            ARROW
        ========================================== */}

        <ChevronRight
            className="transaction-arrow"
            size={18}
            aria-hidden="true"
        />

    </button>

);

}