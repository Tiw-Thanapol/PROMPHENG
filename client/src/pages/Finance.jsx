import React, {
useEffect,
useMemo,
useState
} from "react";

import {
WalletCards,
TrendingUp,
TrendingDown,
PiggyBank,
ShoppingCart,
ReceiptText,
Search,
X,
CalendarDays,
Eye,
FileSpreadsheet,
Printer,
ChevronDown,
CircleDollarSign,
RotateCcw,
UserRound,
CreditCard,
Boxes,
Banknote,
AlertCircle
} from "lucide-react";

import * as XLSX from "xlsx";

import api from "../api/axios";
import "../styles/Finance.css";

const FINANCE_API = "/finance";

const BANGKOK_TIME_ZONE = "Asia/Bangkok";

// ======================================================
// HELPERS
// ======================================================

function money(value) {
return Number(value || 0).toLocaleString("th-TH", {
minimumFractionDigits: 2,
maximumFractionDigits: 2
});
}

function number(value) {
const result = Number(value);

return Number.isFinite(result)
    ? result
    : 0;

}

function quantity(value) {
const result = Number(value);

return Number.isFinite(result) && result > 0
    ? result
    : 1;

}

function formatDate(date) {
if (!date) {
return "-";
}

const parsed = new Date(date);

if (Number.isNaN(parsed.getTime())) {
    return "-";
}

return parsed.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: BANGKOK_TIME_ZONE
});

}

function formatDateTime(date) {
if (!date) {
return "-";
}

const parsed = new Date(date);

if (Number.isNaN(parsed.getTime())) {
    return "-";
}

return parsed.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: BANGKOK_TIME_ZONE
});

}

function shortDate(date) {
if (!date) {
return "";
}

const parsed = new Date(date);

if (Number.isNaN(parsed.getTime())) {
    return "";
}

return parsed.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    timeZone: BANGKOK_TIME_ZONE
});

}

function transactionAmount(transaction) {
if (!transaction) {
return 0;
}

if (transaction.type === "INCOME") {
    return Math.abs(number(transaction.amount));
}

return -Math.abs(number(transaction.amount));

}

function transactionTypeLabel(type) {
switch (type) {
case "INCOME":
return "รายรับ";

    case "EXPENSE":
        return "รายจ่าย";

    case "RETURN":
        return "คืนเงิน";

    case "OWNER_PAYMENT":
        return "จ่ายเจ้าของ";

    default:
        return type || "-";
}

}

// ======================================================
// SALE HELPERS
// ======================================================

function getSaleItemQuantity(item) {
return quantity(
item?.quantity ??
item?.saleQuantity ??
item?.soldQuantity ??
1
);
}

/*

IMPORTANT


costPriceAtSale is the historical cost snapshot.


It must be preferred over the current
ConsignmentItem.costPrice because the cost of a
historical sale must never change when the stock lot
is edited later.
*/
function getSaleItemCost(item) {
return number(
item?.costPriceAtSale ??
item?.costPrice ??
item?.consignmentItem?.costPrice ??
0
);
}

function getSaleItemPrice(item) {
return number(
item?.salePrice ??
item?.actualSalePrice ??
item?.price ??
0
);
}

function getSaleItemTotal(item) {
const directTotal =
item?.totalAmount ??
item?.totalPrice ??
item?.subtotal;

if (
    directTotal !== undefined &&
    directTotal !== null &&
    directTotal !== ""
) {
    return number(directTotal);
}

return (
    getSaleItemPrice(item) *
    getSaleItemQuantity(item)
);

}

function getSaleItemCostTotal(item) {
return (
getSaleItemCost(item) *
getSaleItemQuantity(item)
);
}

function getSaleItemsCost(sale) {
return (sale?.items || []).reduce(
(sum, item) =>
sum +
getSaleItemCostTotal(item),
0
);
}

function getSaleItemsRevenue(sale) {
return (sale?.items || []).reduce(
(sum, item) =>
sum +
getSaleItemTotal(item),
0
);
}

function getSaleItemsQuantity(sale) {
return (sale?.items || []).reduce(
(sum, item) =>
sum +
getSaleItemQuantity(item),
0
);
}

function getShippingCharged(sale) {
return number(
sale?.shippingCharged ??
sale?.shippingCost ??
0
);
}

function getShippingActual(sale) {
return number(
sale?.shippingActual ??
0
);
}

function getSaleDiscount(sale) {
return number(
sale?.discount
);
}

function getSaleSoldAt(sale) {
return (
sale?.soldAt ??
sale?.createdAt ??
sale?.updatedAt
);
}

function getSaleCustomerName(sale) {
return (
sale?.customer?.name ||
sale?.customerName ||
"Walk in customer"
);
}

// ======================================================
// PAGE
// ======================================================

export default function Finance() {

const [data, setData] = useState({
    sales: [],
    expenses: [],
    returns: [],
    ownerPayments: []
});

const [loading, setLoading] =
    useState(true);

const [error, setError] =
    useState("");

const [period, setPeriod] =
    useState("month");

const [customStart, setCustomStart] =
    useState("");

const [customEnd, setCustomEnd] =
    useState("");

const [search, setSearch] =
    useState("");

const [typeFilter, setTypeFilter] =
    useState("ALL");

const [selectedTransaction, setSelectedTransaction] =
    useState(null);

// ==================================================
// LOAD
// ==================================================

async function loadFinance() {

    try {

        setLoading(true);
        setError("");

        const params = {
            period
        };

        if (period === "custom") {

            if (
                !customStart ||
                !customEnd
            ) {
                setLoading(false);
                return;
            }

            params.startDate =
                customStart;

            params.endDate =
                customEnd;
        }

        const res =
            await api.get(
                FINANCE_API,
                {
                    params
                }
            );

        const result =
            res?.data || {};

        setData({

            sales:
                Array.isArray(result.sales)
                    ? result.sales
                    : [],

            expenses:
                Array.isArray(result.expenses)
                    ? result.expenses
                    : [],

            returns:
                Array.isArray(result.returns)
                    ? result.returns
                    : [],

            ownerPayments:
                Array.isArray(
                    result.ownerPayments
                )
                    ? result.ownerPayments
                    : []

        });

    } catch (err) {

        console.error(
            "Finance load error:",
            err
        );

        setError(
            "ไม่สามารถโหลดข้อมูลทางการเงินได้"
        );

    } finally {

        setLoading(false);

    }
}

useEffect(() => {

    if (
        period === "custom" &&
        (
            !customStart ||
            !customEnd
        )
    ) {
        return;
    }

    loadFinance();

}, [
    period,
    customStart,
    customEnd
]);

// ==================================================
// BUILD TRANSACTIONS
// ==================================================

const transactions = useMemo(() => {

    const list = [];

    // ----------------------------------------------
    // SALES
    // ----------------------------------------------

    data.sales.forEach(sale => {

        const itemsRevenue =
            getSaleItemsRevenue(sale);

        const shippingCharged =
            getShippingCharged(sale);

        const fallbackTotal =
            itemsRevenue +
            shippingCharged -
            getSaleDiscount(sale);

        const totalAmount =
            sale?.totalAmount !== undefined &&
            sale?.totalAmount !== null
                ? number(sale.totalAmount)
                : fallbackTotal;

        list.push({

            id:
                `SALE-${sale.id}`,

            originalId:
                sale.id,

            type:
                "INCOME",

            date:
                getSaleSoldAt(sale),

            title:
                `Order #${sale.orderNo ?? sale.id}`,

            description:
                getSaleCustomerName(sale),

            amount:
                totalAmount,

            sale,

            icon:
                "sale"

        });

    });

    // ----------------------------------------------
    // EXPENSES
    // ----------------------------------------------

    data.expenses.forEach(expense => {

        list.push({

            id:
                `EXPENSE-${expense.id}`,

            originalId:
                expense.id,

            type:
                "EXPENSE",

            date:
                expense.createdAt,

            title:
                expense.name ||
                "Expense",

            description:
                expense.category ||
                "Other",

            amount:
                number(
                    expense.amount
                ),

            expense,

            icon:
                "expense"

        });

    });

    // ----------------------------------------------
    // RETURNS
    // ----------------------------------------------

    data.returns.forEach(item => {

        const amount =
            number(
                item.refundAmount
            ) +
            number(
                item.refundShipping
            );

        list.push({

            id:
                `RETURN-${item.id}`,

            originalId:
                item.id,

            type:
                "RETURN",

            date:
                item.createdAt,

            title:
                `คืนเงิน Order #${item.saleId}`,

            description:
                item.reason ||
                "Customer return",

            amount,

            returnData:
                item,

            icon:
                "return"

        });

    });

    // ----------------------------------------------
    // OWNER PAYMENT
    // ----------------------------------------------

    data.ownerPayments.forEach(payment => {

        list.push({

            id:
                `OWNER-${payment.id}`,

            originalId:
                payment.id,

            type:
                "OWNER_PAYMENT",

            date:
                payment.paidAt ||
                payment.createdAt,

            title:
                "Owner Payment",

            description:
                payment.owner?.name ||
                "Owner",

            amount:
                number(
                    payment.amount
                ),

            ownerPayment:
                payment,

            icon:
                "owner"

        });

    });

    return list.sort(
        (a, b) =>
            new Date(b.date || 0) -
            new Date(a.date || 0)
    );

}, [data]);

// ==================================================
// FILTER
// ==================================================

const filteredTransactions =
    useMemo(() => {

        const key =
            search
                .trim()
                .toLowerCase();

        return transactions.filter(
            item => {

                if (
                    typeFilter !== "ALL" &&
                    item.type !== typeFilter
                ) {
                    return false;
                }

                if (!key) {
                    return true;
                }

                const text = [

                    item.title,

                    item.description,

                    item.type,

                    item.sale?.customer?.name,

                    item.sale?.customerName,

                    item.sale?.id,

                    item.expense?.name,

                    item.expense?.category,

                    item.returnData?.reason,

                    item.returnData?.saleId,

                    item.ownerPayment?.owner?.name

                ]
                    .filter(
                        value =>
                            value !==
                                undefined &&
                            value !==
                                null
                    )
                    .join(" ")
                    .toLowerCase();

                return text.includes(key);

            }
        );

    }, [
        transactions,
        search,
        typeFilter
    ]);

// ==================================================
// FINANCIAL SUMMARY
// ==================================================

const summary = useMemo(() => {

    /*
     * Revenue is the actual amount received from Sale.
     *
     * totalAmount is preferred because it already
     * represents the final sale amount after discount.
     */
    const revenue =
        data.sales.reduce(
            (sum, sale) => {

                const itemsRevenue =
                    getSaleItemsRevenue(sale);

                const shippingCharged =
                    getShippingCharged(sale);

                const fallbackTotal =
                    itemsRevenue +
                    shippingCharged -
                    getSaleDiscount(sale);

                const total =
                    sale?.totalAmount !== undefined &&
                    sale?.totalAmount !== null
                        ? number(
                            sale.totalAmount
                        )
                        : fallbackTotal;

                return sum + total;

            },
            0
        );

    // ----------------------------------------------
    // REFUNDS
    // ----------------------------------------------

    const refunds =
        data.returns.reduce(
            (sum, item) =>
                sum +
                number(
                    item.refundAmount
                ) +
                number(
                    item.refundShipping
                ),
            0
        );

    const netRevenue =
        revenue -
        refunds;

    // ----------------------------------------------
    // COGS
    // ----------------------------------------------

    /*
     * HISTORICAL COST
     *
     * SaleItem.costPriceAtSale is the source of truth.
     *
     * This prevents old sales from changing when the
     * current stock costPrice is edited.
     */
    const cogs =
        data.sales.reduce(
            (saleSum, sale) =>
                saleSum +
                getSaleItemsCost(sale),
            0
        );

    // ----------------------------------------------
    // OPERATING EXPENSE
    // ----------------------------------------------

    const expenses =
        data.expenses.reduce(
            (sum, item) =>
                sum +
                number(item.amount),
            0
        );

    // ----------------------------------------------
    // GROSS PROFIT
    // ----------------------------------------------

    const grossProfit =
        netRevenue -
        cogs;

    // ----------------------------------------------
    // NET PROFIT
    // ----------------------------------------------

    const netProfit =
        grossProfit -
        expenses;

    // ----------------------------------------------
    // OWNER PAYMENTS
    // ----------------------------------------------

    const ownerPayments =
        data.ownerPayments.reduce(
            (sum, item) =>
                sum +
                number(item.amount),
            0
        );

    // ----------------------------------------------
    // UNITS
    // ----------------------------------------------

    const totalUnitsSold =
        data.sales.reduce(
            (sum, sale) =>
                sum +
                getSaleItemsQuantity(sale),
            0
        );

    // ----------------------------------------------
    // SHIPPING
    // ----------------------------------------------

    const shippingCharged =
        data.sales.reduce(
            (sum, sale) =>
                sum +
                getShippingCharged(sale),
            0
        );

    const shippingActual =
        data.sales.reduce(
            (sum, sale) =>
                sum +
                getShippingActual(sale),
            0
        );

    const shippingProfit =
        shippingCharged -
        shippingActual;

    return {

        revenue,

        refunds,

        netRevenue,

        cogs,

        expenses,

        grossProfit,

        netProfit,

        ownerPayments,

        shippingCharged,

        shippingActual,

        shippingProfit,

        salesCount:
            data.sales.length,

        expenseCount:
            data.expenses.length,

        returnCount:
            data.returns.length,

        totalUnitsSold

    };

}, [data]);

// ==================================================
// CATEGORY BREAKDOWN
// ==================================================

const expenseBreakdown =
    useMemo(() => {

        const map = {};

        data.expenses.forEach(
            item => {

                const category =
                    item.category ||
                    "Other";

                map[category] =
                    (
                        map[category] ||
                        0
                    ) +
                    number(
                        item.amount
                    );

            }
        );

        return Object.entries(map)
            .map(
                ([name, amount]) => ({
                    name,
                    amount
                })
            )
            .sort(
                (a, b) =>
                    b.amount -
                    a.amount
            );

    }, [
        data.expenses
    ]);

// ==================================================
// DAILY CHART
// ==================================================

const chartData =
    useMemo(() => {

        const map = {};

        transactions.forEach(
            item => {

                if (!item.date) {
                    return;
                }

                const date =
                    new Date(
                        item.date
                    );

                if (
                    Number.isNaN(
                        date.getTime()
                    )
                ) {
                    return;
                }

                const parts =
                    new Intl.DateTimeFormat(
                        "en-CA",
                        {
                            timeZone:
                                BANGKOK_TIME_ZONE,

                            year:
                                "numeric",

                            month:
                                "2-digit",

                            day:
                                "2-digit"
                        }
                    ).formatToParts(
                        date
                    );

                const year =
                    parts.find(
                        p =>
                            p.type ===
                            "year"
                    )?.value;

                const month =
                    parts.find(
                        p =>
                            p.type ===
                            "month"
                    )?.value;

                const day =
                    parts.find(
                        p =>
                            p.type ===
                            "day"
                    )?.value;

                const key =
                    `${year}-${month}-${day}`;

                if (!map[key]) {

                    map[key] = {

                        date:
                            key,

                        income:
                            0,

                        expense:
                            0

                    };

                }

                if (
                    item.type ===
                    "INCOME"
                ) {

                    map[key].income +=
                        number(
                            item.amount
                        );

                }

                if (
                    item.type ===
                        "EXPENSE" ||
                    item.type ===
                        "RETURN" ||
                    item.type ===
                        "OWNER_PAYMENT"
                ) {

                    map[key].expense +=
                        number(
                            item.amount
                        );

                }

            }
        );

        return Object.values(map)
            .sort(
                (a, b) =>
                    new Date(a.date) -
                    new Date(b.date)
            )
            .slice(-14);

    }, [
        transactions
    ]);

// ==================================================
// EXPORT
// ==================================================

function handleExportExcel() {

    const rows =
        filteredTransactions.map(
            item => {

                const sale =
                    item.sale;

                return {

                    Date:
                        formatDateTime(
                            item.date
                        ),

                    Type:
                        transactionTypeLabel(
                            item.type
                        ),

                    Transaction:
                        item.title,

                    Description:
                        item.description,

                    "Customer / Owner":
                        item.sale?.customer?.name ||
                        item.sale?.customerName ||
                        item.ownerPayment?.owner?.name ||
                        "-",

                    Category:
                        item.expense?.category ||
                        "-",

                    "Order ID":
                        item.sale?.id ||
                        item.returnData?.saleId ||
                        "-",

                    Income:
                        item.type ===
                        "INCOME"
                            ? number(
                                item.amount
                            )
                            : 0,

                    Expense:
                        (
                            item.type ===
                                "EXPENSE" ||
                            item.type ===
                                "RETURN" ||
                            item.type ===
                                "OWNER_PAYMENT"
                        )
                            ? number(
                                item.amount
                            )
                            : 0,

                    ShippingCharged:
                        sale
                            ? getShippingCharged(
                                sale
                            )
                            : 0,

                    ShippingActual:
                        sale
                            ? getShippingActual(
                                sale
                            )
                            : 0,

                    COGS:
                        sale
                            ? getSaleItemsCost(
                                sale
                            )
                            : 0,

                    Net:
                        transactionAmount(
                            item
                        )

                };

            }
        );

    const worksheet =
        XLSX.utils.json_to_sheet(
            rows
        );

    worksheet["!cols"] = [

        { wch: 22 },
        { wch: 16 },
        { wch: 25 },
        { wch: 30 },
        { wch: 25 },
        { wch: 18 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 18 },
        { wch: 18 },
        { wch: 15 },
        { wch: 15 }

    ];

    const workbook =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Finance"
    );

    const date =
        new Date()
            .toISOString()
            .slice(0, 10);

    XLSX.writeFile(
        workbook,
        `finance-${date}.xlsx`
    );
}

// ==================================================
// PRINT
// ==================================================

function handlePrint() {
    window.print();
}

// ==================================================
// PERIOD LABEL
// ==================================================

const periodLabel = {

    day:
        "วันนี้",

    week:
        "สัปดาห์นี้",

    month:
        "เดือนนี้",

    year:
        "ปีนี้",

    custom:
        "กำหนดเอง"

}[period];

// ==================================================
// RENDER
// ==================================================

return (

    <div className="finance-page">

        {/* =========================================
            BACKGROUND
        ========================================= */}

        <div className="finance-decoration">

            <span className="deco-star">
                ✦
            </span>

            <span className="deco-star">
                ✧
            </span>

            <span className="deco-circle" />

            <span className="deco-cloud">
                ☁
            </span>

        </div>


        <div className="finance-container">

            {/* =====================================
                HEADER
            ===================================== */}

            <header className="finance-header">

                <div className="finance-title">

                    <div className="finance-title-icon">

                        <WalletCards
                            size={28}
                        />

                    </div>

                    <div>

                        <div className="finance-title-row">

                            <h1>
                                Finance
                            </h1>

                            <span>
                                ✨
                            </span>

                        </div>

                        <p>
                            รายรับ รายจ่าย และกำไรของธุรกิจ
                        </p>

                    </div>

                </div>


                <div className="finance-header-actions">

                    <button
                        className="finance-btn excel"
                        onClick={
                            handleExportExcel
                        }
                    >

                        <FileSpreadsheet
                            size={17}
                        />

                        Export Excel

                    </button>


                    <button
                        className="finance-btn print"
                        onClick={
                            handlePrint
                        }
                    >

                        <Printer
                            size={17}
                        />

                        Print

                    </button>

                </div>

            </header>


            {/* =====================================
                PERIOD
            ===================================== */}

            <section className="finance-period-card">

                <div className="period-label">

                    <CalendarDays
                        size={18}
                    />

                    <div>

                        <strong>
                            Financial Period
                        </strong>

                        <span>
                            แสดงข้อมูล:{" "}
                            {periodLabel}
                        </span>

                    </div>

                </div>


                <div className="period-buttons">

                    {[
                        ["day", "วันนี้"],
                        ["week", "สัปดาห์"],
                        ["month", "เดือน"],
                        ["year", "ปี"],
                        ["custom", "กำหนดเอง"]
                    ].map(
                        ([value, label]) => (

                            <button
                                key={value}
                                className={
                                    period ===
                                    value
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setPeriod(
                                        value
                                    )
                                }
                            >
                                {label}
                            </button>

                        )
                    )}

                </div>


                {period === "custom" && (

                    <div className="custom-date">

                        <input
                            type="date"
                            value={
                                customStart
                            }
                            onChange={e =>
                                setCustomStart(
                                    e.target.value
                                )
                            }
                        />

                        <span>
                            ถึง
                        </span>

                        <input
                            type="date"
                            value={
                                customEnd
                            }
                            onChange={e =>
                                setCustomEnd(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                )}

            </section>


            {/* =====================================
                LOADING / ERROR / CONTENT
            ===================================== */}

            {loading ? (

                <div className="finance-loading">

                    <div className="loading-orb">
                        💰
                    </div>

                    <strong>
                        กำลังวิเคราะห์ข้อมูล...
                    </strong>

                    <span>
                        แป๊บเดียวนะ ✨
                    </span>

                </div>

            ) : error ? (

                <div className="finance-error">

                    <AlertCircle />

                    <strong>
                        {error}
                    </strong>

                    <button
                        onClick={
                            loadFinance
                        }
                    >
                        ลองอีกครั้ง
                    </button>

                </div>

            ) : (

                <>

                    {/* =================================
                        SUMMARY
                    ================================= */}

                    <section className="finance-summary">

                        <FinanceCard
                            icon={
                                <TrendingUp />
                            }
                            label="Revenue"
                            thai="รายรับ"
                            value={
                                summary.netRevenue
                            }
                            type="income"
                            note={
                                `${summary.salesCount} orders`
                            }
                        />

                        <FinanceCard
                            icon={
                                <TrendingDown />
                            }
                            label="Expense"
                            thai="รายจ่าย"
                            value={
                                summary.expenses
                            }
                            type="expense"
                            note={
                                `${summary.expenseCount} รายการ`
                            }
                        />

                        <FinanceCard
                            icon={
                                <PiggyBank />
                            }
                            label="Net Profit"
                            thai="กำไรสุทธิ"
                            value={
                                summary.netProfit
                            }
                            type={
                                summary.netProfit >= 0
                                    ? "profit"
                                    : "loss"
                            }
                            note={
                                `Gross ฿${money(
                                    summary.grossProfit
                                )}`
                            }
                        />

                        <FinanceCard
                            icon={
                                <ShoppingCart />
                            }
                            label="Sales"
                            thai="ยอดขาย"
                            value={
                                summary.salesCount
                            }
                            type="orders"
                            isNumber
                            note={
                                `${summary.totalUnitsSold} units`
                            }
                        />

                    </section>


                    {/* =================================
                        MAIN ANALYTICS
                    ================================= */}

                    <section className="finance-grid">

                        {/* CHART */}

                        <div className="finance-panel chart-panel">

                            <div className="panel-header">

                                <div>

                                    <strong>
                                        Revenue Overview
                                    </strong>

                                    <span>
                                        รายรับและรายจ่ายตามช่วงเวลา
                                    </span>

                                </div>

                                <div className="chart-legend">

                                    <span>
                                        <i className="income-dot" />
                                        รายรับ
                                    </span>

                                    <span>
                                        <i className="expense-dot" />
                                        รายจ่าย
                                    </span>

                                </div>

                            </div>


                            <div className="finance-chart">

                                {chartData.length === 0 ? (

                                    <div className="empty-chart">
                                        ยังไม่มีข้อมูล
                                    </div>

                                ) : (

                                    <div className="bars">

                                        {chartData.map(
                                            item => {

                                                const max =
                                                    Math.max(
                                                        item.income,
                                                        item.expense,
                                                        1
                                                    );

                                                const incomeHeight =
                                                    Math.max(
                                                        8,
                                                        (
                                                            item.income /
                                                            max
                                                        ) *
                                                        100
                                                    );

                                                const expenseHeight =
                                                    Math.max(
                                                        8,
                                                        (
                                                            item.expense /
                                                            max
                                                        ) *
                                                        100
                                                    );

                                                return (

                                                    <div
                                                        className="chart-column"
                                                        key={
                                                            item.date
                                                        }
                                                    >

                                                        <div className="bar-area">

                                                            <div
                                                                className="bar income-bar"
                                                                style={{
                                                                    height:
                                                                        `${incomeHeight}%`
                                                                }}
                                                                title={
                                                                    `รายรับ ฿${money(
                                                                        item.income
                                                                    )}`
                                                                }
                                                            />

                                                            <div
                                                                className="bar expense-bar"
                                                                style={{
                                                                    height:
                                                                        `${expenseHeight}%`
                                                                }}
                                                                title={
                                                                    `รายจ่าย ฿${money(
                                                                        item.expense
                                                                    )}`
                                                                }
                                                            />

                                                        </div>

                                                        <small>
                                                            {
                                                                shortDate(
                                                                    item.date
                                                                )
                                                            }
                                                        </small>

                                                    </div>

                                                );

                                            }
                                        )}

                                    </div>

                                )}

                            </div>

                        </div>


                        {/* BREAKDOWN */}

                        <div className="finance-panel breakdown-panel">

                            <div className="panel-header">

                                <div>

                                    <strong>
                                        Financial Breakdown
                                    </strong>

                                    <span>
                                        สรุปภาพรวมทางการเงิน
                                    </span>

                                </div>

                                <CircleDollarSign
                                    size={21}
                                />

                            </div>


                            <BreakdownRow
                                icon={
                                    <TrendingUp />
                                }
                                label="Revenue"
                                value={
                                    summary.netRevenue
                                }
                                type="income"
                            />

                            <BreakdownRow
                                icon={
                                    <Boxes />
                                }
                                label="Cost of Goods"
                                value={
                                    summary.cogs
                                }
                                type="cost"
                            />

                            <BreakdownRow
                                icon={
                                    <ReceiptText />
                                }
                                label="Operating Expense"
                                value={
                                    summary.expenses
                                }
                                type="expense"
                            />

                            <div className="breakdown-divider" />

                            <div className="profit-row">

                                <div>

                                    <span>
                                        Net Profit
                                    </span>

                                    <small>
                                        กำไรสุทธิ
                                    </small>

                                </div>

                                <strong
                                    className={
                                        summary.netProfit >= 0
                                            ? "positive"
                                            : "negative"
                                    }
                                >
                                    ฿
                                    {money(
                                        summary.netProfit
                                    )}
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* =================================
                        EXPENSE CATEGORY
                    ================================= */}

                    {expenseBreakdown.length > 0 && (

                        <section className="finance-panel category-panel">

                            <div className="panel-header">

                                <div>

                                    <strong>
                                        Expense Breakdown
                                    </strong>

                                    <span>
                                        รายจ่ายแยกตามหมวดหมู่
                                    </span>

                                </div>

                                <ReceiptText />

                            </div>


                            <div className="category-list">

                                {expenseBreakdown.map(
                                    item => {

                                        const percent =
                                            summary.expenses > 0
                                                ? (
                                                    item.amount /
                                                    summary.expenses
                                                ) *
                                                100
                                                : 0;

                                        return (

                                            <div
                                                className="category-item"
                                                key={
                                                    item.name
                                                }
                                            >

                                                <div className="category-top">

                                                    <strong>
                                                        {
                                                            item.name
                                                        }
                                                    </strong>

                                                    <span>
                                                        ฿
                                                        {money(
                                                            item.amount
                                                        )}
                                                    </span>

                                                </div>

                                                <div className="category-track">

                                                    <div
                                                        className="category-progress"
                                                        style={{
                                                            width:
                                                                `${percent}%`
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        </section>

                    )}


                    {/* =================================
                        TRANSACTIONS
                    ================================= */}

                    <section className="finance-panel transactions-panel">

                        <div className="transactions-header">

                            <div className="panel-header">

                                <div>

                                    <strong>
                                        Financial Transactions
                                    </strong>

                                    <span>
                                        รายการเงินเข้าและเงินออกทั้งหมด
                                    </span>

                                </div>

                            </div>


                            <div className="transaction-tools">

                                <div className="finance-search">

                                    <Search
                                        size={17}
                                    />

                                    <input
                                        placeholder="ค้นหารายการ..."
                                        value={
                                            search
                                        }
                                        onChange={e =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                    />

                                    {search && (

                                        <button
                                            onClick={() =>
                                                setSearch(
                                                    ""
                                                )
                                            }
                                        >
                                            <X
                                                size={14}
                                            />
                                        </button>

                                    )}

                                </div>


                                <div className="filter-wrap">

                                    <select
                                        value={
                                            typeFilter
                                        }
                                        onChange={e =>
                                            setTypeFilter(
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="ALL">
                                            ทั้งหมด
                                        </option>

                                        <option value="INCOME">
                                            รายรับ
                                        </option>

                                        <option value="EXPENSE">
                                            รายจ่าย
                                        </option>

                                        <option value="RETURN">
                                            คืนเงิน
                                        </option>

                                        <option value="OWNER_PAYMENT">
                                            จ่ายเจ้าของ
                                        </option>

                                    </select>

                                    <ChevronDown
                                        size={15}
                                    />

                                </div>

                            </div>

                        </div>


                        <div className="transactions-list">

                            {filteredTransactions.length === 0 ? (

                                <div className="empty-transactions">

                                    <WalletCards />

                                    <strong>
                                        ไม่พบรายการ
                                    </strong>

                                    <span>
                                        ยังไม่มีข้อมูลในช่วงเวลานี้
                                    </span>

                                </div>

                            ) : (

                                filteredTransactions.map(
                                    item => (

                                        <TransactionRow
                                            key={
                                                item.id
                                            }
                                            transaction={
                                                item
                                            }
                                            onClick={() =>
                                                setSelectedTransaction(
                                                    item
                                                )
                                            }
                                        />

                                    )
                                )

                            )}

                        </div>


                        <div className="transaction-footer">

                            แสดง{" "}

                            <strong>
                                {
                                    filteredTransactions.length
                                }
                            </strong>{" "}

                            รายการ

                        </div>

                    </section>

                </>

            )}

        </div>


        {/* =========================================
            DETAIL MODAL
        ========================================= */}

        {selectedTransaction && (

            <FinanceModal
                transaction={
                    selectedTransaction
                }
                onClose={() =>
                    setSelectedTransaction(
                        null
                    )
                }
            />

        )}

    </div>

);

}

// ======================================================
// FINANCE CARD
// ======================================================

function FinanceCard({
icon,
label,
thai,
value,
type,
note,
isNumber
}) {

return (

    <div
        className={
            `finance-card finance-card-${type}`
        }
    >

        <div className="finance-card-icon">
            {icon}
        </div>

        <div className="finance-card-content">

            <span>
                {label}
            </span>

            <small>
                {thai}
            </small>

            <strong>

                {isNumber
                    ? value
                    : `฿${money(value)}`}

            </strong>

            <em>
                {note}
            </em>

        </div>

    </div>

);

}

// ======================================================
// BREAKDOWN ROW
// ======================================================

function BreakdownRow({
icon,
label,
value,
type
}) {

return (

    <div className="breakdown-row">

        <div
            className={
                `breakdown-icon ${type}`
            }
        >
            {icon}
        </div>

        <div className="breakdown-label">

            <strong>
                {label}
            </strong>

        </div>

        <span>
            ฿{money(value)}
        </span>

    </div>

);

}

// ======================================================
// TRANSACTION ROW
// ======================================================

function TransactionRow({
transaction,
onClick
}) {

const isIncome =
    transaction.type ===
    "INCOME";

const isExpense =
    transaction.type ===
    "EXPENSE";

const isReturn =
    transaction.type ===
    "RETURN";

const isOwnerPayment =
    transaction.type ===
    "OWNER_PAYMENT";

let Icon =
    WalletCards;

if (isIncome) {
    Icon = ShoppingCart;
}

if (isExpense) {
    Icon = ReceiptText;
}

if (isReturn) {
    Icon = RotateCcw;
}

if (isOwnerPayment) {
    Icon = Banknote;
}

return (

    <button
        className="transaction-row"
        onClick={onClick}
    >

        <div
            className={
                `transaction-icon ${
                    transaction.type.toLowerCase()
                }`
            }
        >

            <Icon size={18} />

        </div>


        <div className="transaction-main">

            <strong>
                {transaction.title}
            </strong>

            <span>
                {transaction.description}
            </span>

        </div>


        <div className="transaction-date">

            <CalendarDays
                size={14}
            />

            {formatDate(
                transaction.date
            )}

        </div>


        <div
            className={
                `transaction-type ${
                    transaction.type.toLowerCase()
                }`
            }
        >

            {transactionTypeLabel(
                transaction.type
            )}

        </div>


        <div
            className={
                `transaction-amount ${
                    isIncome
                        ? "income"
                        : "outgoing"
                }`
            }
        >

            {isIncome
                ? "+"
                : "-"}

            ฿
            {money(
                transaction.amount
            )}

        </div>


        <div className="transaction-view">

            <Eye size={17} />

        </div>

    </button>

);

}

// ======================================================
// MODAL
// ======================================================

function FinanceModal({
transaction,
onClose
}) {

const {
    type,
    sale,
    expense,
    returnData,
    ownerPayment
} = transaction;

const isSale =
    type === "INCOME";

const isExpense =
    type === "EXPENSE";

const isReturn =
    type === "RETURN";

const isOwnerPayment =
    type === "OWNER_PAYMENT";

return (

    <div
        className="finance-modal"
        onMouseDown={e => {

            if (
                e.target ===
                e.currentTarget
            ) {
                onClose();
            }

        }}
    >

        <div className="finance-modal-box">

            <button
                className="finance-modal-close"
                onClick={onClose}
            >
                <X />
            </button>


            {/* HEADER */}

            <div className="modal-heading">

                <div
                    className={
                        `modal-icon ${
                            type.toLowerCase()
                        }`
                    }
                >

                    {isSale && (
                        <ShoppingCart />
                    )}

                    {isExpense && (
                        <ReceiptText />
                    )}

                    {isReturn && (
                        <RotateCcw />
                    )}

                    {isOwnerPayment && (
                        <Banknote />
                    )}

                </div>

                <div>

                    <span>
                        {transactionTypeLabel(
                            type
                        )}
                    </span>

                    <h2>
                        {transaction.title}
                    </h2>

                </div>

            </div>


            {/* SALE */}

            {isSale && sale && (

                <>

                    <div className="modal-info-grid">

                        <InfoItem
                            icon={
                                <UserRound />
                            }
                            label="ลูกค้า"
                            value={
                                getSaleCustomerName(
                                    sale
                                )
                            }
                        />

                        <InfoItem
                            icon={
                                <CalendarDays />
                            }
                            label="วันที่ขาย"
                            value={
                                formatDateTime(
                                    getSaleSoldAt(
                                        sale
                                    )
                                )
                            }
                        />

                        <InfoItem
                            icon={
                                <CreditCard />
                            }
                            label="สถานะ"
                            value={
                                sale.status ||
                                "-"
                            }
                        />

                        <InfoItem
                            icon={
                                <ShoppingCart />
                            }
                            label="Order"
                            value={
                                `#${sale.orderNo ?? sale.id}`
                            }
                        />

                    </div>


                    <div className="modal-section">

                        <h3>
                            รายการสินค้า
                        </h3>

                        <div className="modal-items">

                            {(sale.items || [])
                                .map(
                                    item => {

                                        const qty =
                                            getSaleItemQuantity(
                                                item
                                            );

                                        const unitCost =
                                            getSaleItemCost(
                                                item
                                            );

                                        const unitPrice =
                                            getSaleItemPrice(
                                                item
                                            );

                                        const itemTotal =
                                            getSaleItemTotal(
                                                item
                                            );

                                        const totalCost =
                                            getSaleItemCostTotal(
                                                item
                                            );

                                        const profit =
                                            itemTotal -
                                            totalCost;

                                        return (

                                            <div
                                                className="modal-product"
                                                key={
                                                    item.id
                                                }
                                            >

                                                <div>

                                                    <strong>
                                                        {
                                                            item.consignmentItem?.name ||
                                                            item.name ||
                                                            "สินค้า"
                                                        }
                                                    </strong>

                                                    <span>
                                                        จำนวน{" "}
                                                        {qty}{" "}
                                                        ชิ้น
                                                    </span>

                                                    <span>
                                                        ต้นทุน/ชิ้น ฿
                                                        {money(
                                                            unitCost
                                                        )}
                                                    </span>

                                                    <span>
                                                        ราคาขาย/ชิ้น ฿
                                                        {money(
                                                            unitPrice
                                                        )}
                                                    </span>

                                                    <span>
                                                        กำไร ฿
                                                        {money(
                                                            profit
                                                        )}
                                                    </span>

                                                </div>

                                                <strong>
                                                    ฿
                                                    {money(
                                                        itemTotal
                                                    )}
                                                </strong>

                                            </div>

                                        );

                                    }
                                )}

                        </div>

                    </div>


                    <div className="modal-total">

                        <div>

                            <span>
                                ยอดสินค้า
                            </span>

                            <strong>
                                ฿
                                {money(
                                    getSaleItemsRevenue(
                                        sale
                                    )
                                )}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Shipping Charged
                            </span>

                            <strong>
                                ฿
                                {money(
                                    getShippingCharged(
                                        sale
                                    )
                                )}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Shipping Actual
                            </span>

                            <strong>
                                ฿
                                {money(
                                    getShippingActual(
                                        sale
                                    )
                                )}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Shipping Profit
                            </span>

                            <strong
                                className={
                                    (
                                        getShippingCharged(
                                            sale
                                        ) -
                                        getShippingActual(
                                            sale
                                        )
                                    ) >= 0
                                        ? "positive"
                                        : "negative"
                                }
                            >
                                ฿
                                {money(
                                    getShippingCharged(
                                        sale
                                    ) -
                                    getShippingActual(
                                        sale
                                    )
                                )}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Discount
                            </span>

                            <strong>
                                - ฿
                                {money(
                                    getSaleDiscount(
                                        sale
                                    )
                                )}
                            </strong>

                        </div>

                        <div>

                            <span>
                                COGS
                            </span>

                            <strong>
                                ฿
                                {money(
                                    getSaleItemsCost(
                                        sale
                                    )
                                )}
                            </strong>

                        </div>

                        <div className="total-final">

                            <span>
                                TOTAL
                            </span>

                            <strong>
                                ฿
                                {money(
                                    sale.totalAmount !==
                                        undefined &&
                                    sale.totalAmount !==
                                        null
                                        ? sale.totalAmount
                                        : (
                                            getSaleItemsRevenue(
                                                sale
                                            ) +
                                            getShippingCharged(
                                                sale
                                            ) -
                                            getSaleDiscount(
                                                sale
                                            )
                                        )
                                )}
                            </strong>

                        </div>

                    </div>

                </>

            )}


            {/* EXPENSE */}

            {isExpense && expense && (

                <div className="expense-detail">

                    <DetailRow
                        label="รายการ"
                        value={
                            expense.name
                        }
                    />

                    <DetailRow
                        label="หมวดหมู่"
                        value={
                            expense.category ||
                            "-"
                        }
                    />

                    <DetailRow
                        label="วันที่"
                        value={
                            formatDateTime(
                                expense.createdAt
                            )
                        }
                    />

                    <DetailRow
                        label="จำนวนเงิน"
                        value={
                            `฿${money(
                                expense.amount
                            )}`
                        }
                        strong
                    />

                    {expense.note && (

                        <div className="detail-note">

                            <span>
                                หมายเหตุ
                            </span>

                            <p>
                                {expense.note}
                            </p>

                        </div>

                    )}

                </div>

            )}


            {/* RETURN */}

            {isReturn &&
                returnData && (

                    <div className="expense-detail">

                        <DetailRow
                            label="Order"
                            value={
                                `#${returnData.saleId}`
                            }
                        />

                        <DetailRow
                            label="วันที่"
                            value={
                                formatDateTime(
                                    returnData.createdAt
                                )
                            }
                        />

                        <DetailRow
                            label="Refund"
                            value={
                                `฿${money(
                                    returnData.refundAmount
                                )}`
                            }
                        />

                        <DetailRow
                            label="Refund Shipping"
                            value={
                                `฿${money(
                                    returnData.refundShipping
                                )}`
                            }
                        />

                        <DetailRow
                            label="รวมคืนเงิน"
                            value={
                                `฿${money(
                                    number(
                                        returnData.refundAmount
                                    ) +
                                    number(
                                        returnData.refundShipping
                                    )
                                )}`
                            }
                            strong
                        />

                        {returnData.reason && (

                            <DetailRow
                                label="เหตุผล"
                                value={
                                    returnData.reason
                                }
                            />

                        )}

                        {returnData.note && (

                            <div className="detail-note">

                                <span>
                                    หมายเหตุ
                                </span>

                                <p>
                                    {
                                        returnData.note
                                    }
                                </p>

                            </div>

                        )}

                    </div>

                )}


            {/* OWNER PAYMENT */}

            {isOwnerPayment &&
                ownerPayment && (

                    <div className="expense-detail">

                        <DetailRow
                            label="เจ้าของสินค้า"
                            value={
                                ownerPayment.owner?.name ||
                                "-"
                            }
                        />

                        <DetailRow
                            label="วันที่จ่าย"
                            value={
                                formatDateTime(
                                    ownerPayment.paidAt ||
                                    ownerPayment.createdAt
                                )
                            }
                        />

                        <DetailRow
                            label="จำนวนเงิน"
                            value={
                                `฿${money(
                                    ownerPayment.amount
                                )}`
                            }
                            strong
                        />

                        {ownerPayment.note && (

                            <div className="detail-note">

                                <span>
                                    หมายเหตุ
                                </span>

                                <p>
                                    {
                                        ownerPayment.note
                                    }
                                </p>

                            </div>

                        )}

                    </div>

                )}


            <button
                className="modal-done-btn"
                onClick={onClose}
            >
                ปิดรายละเอียด
            </button>

        </div>

    </div>

);

}

// ======================================================
// INFO ITEM
// ======================================================

function InfoItem({
icon,
label,
value
}) {

return (

    <div className="modal-info-item">

        <div className="modal-info-icon">
            {icon}
        </div>

        <div>

            <span>
                {label}
            </span>

            <strong>
                {value}
            </strong>

        </div>

    </div>

);

}

// ======================================================
// DETAIL ROW
// ======================================================

function DetailRow({
label,
value,
strong
}) {

return (

    <div className="detail-row">

        <span>
            {label}
        </span>

        <strong
            className={
                strong
                    ? "highlight"
                    : ""
            }
        >
            {value}
        </strong>

    </div>

);

}
