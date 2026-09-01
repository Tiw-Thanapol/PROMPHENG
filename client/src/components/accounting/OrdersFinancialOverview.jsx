import React from "react";

import {
Package,
CalendarDays,
Sparkles,
TrendingDown,
TrendingUp,
Wallet,
Receipt
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

// ======================================================
// PERIOD LABEL
// ======================================================

function getPeriodLabel(period) {

switch (period) {

    case "TODAY":
        return "Today";

    case "WEEK":
        return "This Week";

    case "MONTH":
        return "This Month";

    case "YEAR":
        return "This Year";

    case "CUSTOM":
        return "Custom Range";

    default:
        return "Today";

}

}

// ======================================================
// FINANCIAL CARD
// ======================================================

function FinancialCard({
type,
icon,
label,
sub,
value,
noCurrency = false
}) {

const safeValue =
    num(value);


return (

    <div
        className={
            "financial-card financial-" +
            type
        }
    >

        {/* ==========================================
            TOP
        ========================================== */}

        <div className="financial-card-top">

            <div className="financial-card-icon">

                {icon}

            </div>


            <div className="financial-card-mini-icon">

                <Sparkles
                    size={13}
                    aria-hidden="true"
                />

            </div>

        </div>


        {/* ==========================================
            LABEL
        ========================================== */}

        <div className="financial-card-label">

            <span>
                {label}
            </span>

            <small>
                {sub}
            </small>

        </div>


        {/* ==========================================
            VALUE
        ========================================== */}

        <h3>

            {!noCurrency && "฿"}

            {money(safeValue)}

        </h3>

    </div>

);

}

// ======================================================
// FINANCIAL OVERVIEW
// ======================================================

export default function FinancialOverview({

financial = {},

orderSummary = {},

period = "TODAY",

onPeriodChange,

customStart = "",

customEnd = "",

onCustomStartChange,

onCustomEndChange

}) {

// ==================================================
// SAFE FINANCIAL DATA
// ==================================================

const revenue =
    num(
        financial?.revenue
    );


const productCost =
    num(
        financial?.productCost
    );


const expense =
    num(
        financial?.expense
    );


const netProfit =
    num(
        financial?.netProfit
    );


const cashFlow =
    num(
        financial?.cashFlow
    );


const grossProfit =
    num(
        financial?.grossProfit
    );


const shipping =
    num(
        financial?.shipping
    );


const discount =
    num(
        financial?.discount
    );


// ==================================================
// ORDER SUMMARY
// ==================================================

const totalOrders =
    num(
        orderSummary?.total
    );


const completedOrders =
    num(
        orderSummary?.completed
    );


// ==================================================
// PERIODS
// ==================================================

const periods = [

    [
        "TODAY",
        "Today"
    ],

    [
        "WEEK",
        "This Week"
    ],

    [
        "MONTH",
        "This Month"
    ],

    [
        "YEAR",
        "This Year"
    ],

    [
        "CUSTOM",
        "Custom"
    ]

];


// ==================================================
// PERIOD CHANGE
// ==================================================

function handlePeriodChange(value) {

    if (
        typeof onPeriodChange ===
        "function"
    ) {

        onPeriodChange(
            value
        );

    }

}


// ==================================================
// CUSTOM START CHANGE
// ==================================================

function handleCustomStartChange(event) {

    if (
        typeof onCustomStartChange ===
        "function"
    ) {

        onCustomStartChange(
            event.target.value
        );

    }

}


// ==================================================
// CUSTOM END CHANGE
// ==================================================

function handleCustomEndChange(event) {

    if (
        typeof onCustomEndChange ===
        "function"
    ) {

        onCustomEndChange(
            event.target.value
        );

    }

}


// ==================================================
// RENDER
// ==================================================

return (

    <section className="financial-section">


        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="financial-heading">

            <div className="financial-heading-left">

                <div className="financial-heading-icon">

                    <BarChartIcon />

                </div>


                <div>

                    <h2>
                        Financial Overview
                    </h2>

                    <p>
                        สรุปภาพรวมทางการเงิน
                    </p>

                </div>

            </div>


            <div className="period-label">

                <CalendarDays
                    size={15}
                    aria-hidden="true"
                />

                <span>
                    {getPeriodLabel(
                        period
                    )}
                </span>

            </div>

        </div>


        {/* ==========================================
            PERIOD FILTER
        ========================================== */}

        <div className="period-filter">

            {periods.map(
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
                            handlePeriodChange(
                                value
                            )
                        }
                    >

                        {label}

                    </button>

                )
            )}

        </div>


        {/* ==========================================
            CUSTOM RANGE
        ========================================== */}

        {period === "CUSTOM" && (

            <div className="custom-date-box">

                <div>

                    <label>
                        From
                    </label>

                    <input
                        type="date"
                        value={
                            customStart || ""
                        }
                        onChange={
                            handleCustomStartChange
                        }
                    />

                </div>


                <div className="date-arrow">

                    →

                </div>


                <div>

                    <label>
                        To
                    </label>

                    <input
                        type="date"
                        value={
                            customEnd || ""
                        }
                        onChange={
                            handleCustomEndChange
                        }
                    />

                </div>

            </div>

        )}


        {/* ==========================================
            FINANCIAL CARDS
        ========================================== */}

        <div className="financial-grid">


            {/* ======================================
                REVENUE
            ====================================== */}

            <FinancialCard
                type="revenue"
                icon={
                    <TrendingUp
                        aria-hidden="true"
                    />
                }
                label="Revenue"
                sub="รายรับ"
                value={revenue}
            />


            {/* ======================================
                COST
            ====================================== */}

            <FinancialCard
                type="cost"
                icon={
                    <Package
                        aria-hidden="true"
                    />
                }
                label="Cost of Goods"
                sub="ต้นทุนสินค้า"
                value={productCost}
            />


            {/* ======================================
                EXPENSE
            ====================================== */}

            <FinancialCard
                type="expense"
                icon={
                    <TrendingDown
                        aria-hidden="true"
                    />
                }
                label="Expenses"
                sub="รายจ่าย"
                value={expense}
            />


            {/* ======================================
                NET PROFIT
            ====================================== */}

            <FinancialCard
                type="profit"
                icon={
                    <Sparkles
                        aria-hidden="true"
                    />
                }
                label="Net Profit"
                sub="กำไรสุทธิ"
                value={netProfit}
            />


            {/* ======================================
                CASH FLOW
            ====================================== */}

            <FinancialCard
                type="cash"
                icon={
                    <Wallet
                        aria-hidden="true"
                    />
                }
                label="Cash Flow"
                sub="กระแสเงินสด"
                value={cashFlow}
            />


            {/* ======================================
                ORDERS
            ====================================== */}

            <FinancialCard
                type="orders"
                icon={
                    <Receipt
                        aria-hidden="true"
                    />
                }
                label="Orders"
                sub="รายการขาย"
                value={totalOrders}
                noCurrency
            />

        </div>


        {/* ==========================================
            MINI BREAKDOWN
        ========================================== */}

        <div className="financial-breakdown">


            {/* --------------------------------------
                GROSS PROFIT
            -------------------------------------- */}

            <div>

                <span>
                    Gross Profit
                </span>

                <strong>
                    ฿{money(
                        grossProfit
                    )}
                </strong>

            </div>


            {/* --------------------------------------
                SHIPPING
            -------------------------------------- */}

            <div>

                <span>
                    Shipping
                </span>

                <strong>
                    ฿{money(
                        shipping
                    )}
                </strong>

            </div>


            {/* --------------------------------------
                DISCOUNT
            -------------------------------------- */}

            <div>

                <span>
                    Discount
                </span>

                <strong>
                    ฿{money(
                        discount
                    )}
                </strong>

            </div>


            {/* --------------------------------------
                COMPLETED ORDERS
            -------------------------------------- */}

            <div>

                <span>
                    Completed Orders
                </span>

                <strong>
                    {completedOrders}
                </strong>

            </div>


        </div>


    </section>

);

}

// ======================================================
// BAR CHART ICON
// ======================================================

function BarChartIcon() {

return (

    <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >

        <line
            x1="4"
            y1="19"
            x2="4"
            y2="10"
        />

        <line
            x1="10"
            y1="19"
            x2="10"
            y2="5"
        />

        <line
            x1="16"
            y1="19"
            x2="16"
            y2="8"
        />

        <line
            x1="22"
            y1="19"
            x2="22"
            y2="12"
        />

    </svg>

);

}