// ======================================================
// ACCOUNTING UTILITIES
// ======================================================
//
// ใช้สำหรับคำนวณข้อมูลบัญชีจาก Orders และ Expenses
//
// ไม่มี React
// ไม่มี API
// ไม่มี State
//
// Source of truth ของข้อมูลยังคงเป็น Orders / Expenses
// ======================================================


// ======================================================
// NUMBER
// ======================================================

export function num(value) {

    const n = Number(value);

    return Number.isFinite(n)
        ? n
        : 0;

}


// ======================================================
// MONEY
// ======================================================

export function money(value) {

    return num(value).toLocaleString(
        "th-TH",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

}


// ======================================================
// DATE
// ======================================================

export function formatDate(date) {

    if (!date) {

        return "-";

    }


    return new Date(date).toLocaleDateString(
        "th-TH",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


// ======================================================
// DATE + TIME
// ======================================================

export function formatDateTime(date) {

    if (!date) {

        return "-";

    }


    return new Date(date).toLocaleString(
        "th-TH",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ======================================================
// START OF DAY
// ======================================================

export function getStartOfDay(
    date = new Date()
) {

    const d = new Date(date);

    d.setHours(
        0,
        0,
        0,
        0
    );

    return d;

}


// ======================================================
// END OF DAY
// ======================================================

export function getEndOfDay(
    date = new Date()
) {

    const d = new Date(date);

    d.setHours(
        23,
        59,
        59,
        999
    );

    return d;

}


// ======================================================
// MONDAY
// ======================================================

export function getMonday(
    date = new Date()
) {

    const d =
        getStartOfDay(date);


    const day =
        d.getDay();


    const diff =
        day === 0
            ? -6
            : 1 - day;


    d.setDate(
        d.getDate() + diff
    );


    return d;

}


// ======================================================
// PERIOD RANGE
// ======================================================
//
// TODAY
// WEEK
// MONTH
// YEAR
//
// CUSTOM จะถูกจัดการจาก createPeriodRange()
// เพราะต้องรับ customStart / customEnd
// ======================================================

export function getPeriodRange(
    period
) {

    const now =
        new Date();


    let start;

    let end;


    switch (period) {

        case "TODAY":

            start =
                getStartOfDay(now);

            end =
                getEndOfDay(now);

            break;


        case "WEEK":

            start =
                getMonday(now);

            end =
                getEndOfDay(now);

            break;


        case "MONTH":

            start =
                new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                );


            end =
                new Date(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    0,
                    23,
                    59,
                    59,
                    999
                );

            break;


        case "YEAR":

            start =
                new Date(
                    now.getFullYear(),
                    0,
                    1
                );


            end =
                new Date(
                    now.getFullYear(),
                    11,
                    31,
                    23,
                    59,
                    59,
                    999
                );

            break;


        default:

            start =
                getStartOfDay(now);

            end =
                getEndOfDay(now);

            break;

    }


    return {
        start,
        end
    };

}


// ======================================================
// CUSTOM PERIOD RANGE
// ======================================================

export function getCustomPeriodRange(
    customStart,
    customEnd
) {

    if (
        !customStart ||
        !customEnd
    ) {

        return getPeriodRange(
            "TODAY"
        );

    }


    return {

        start:
            getStartOfDay(
                new Date(customStart)
            ),

        end:
            getEndOfDay(
                new Date(customEnd)
            )

    };

}


// ======================================================
// CREATE PERIOD RANGE
// ======================================================
//
// ใช้แทน logic periodRange ใน Orders.jsx
// ======================================================

export function createPeriodRange(
    period,
    customStart = "",
    customEnd = ""
) {

    if (
        period === "CUSTOM" &&
        customStart &&
        customEnd
    ) {

        return getCustomPeriodRange(
            customStart,
            customEnd
        );

    }


    return getPeriodRange(
        period
    );

}


// ======================================================
// DATE IN RANGE
// ======================================================

export function dateInRange(
    date,
    start,
    end
) {

    if (!date) {

        return false;

    }


    const d =
        new Date(date);


    return (
        d >= start &&
        d <= end
    );

}


// ======================================================
// FILTER ORDERS BY PERIOD
// ======================================================

export function filterOrdersByPeriod(
    orders = [],
    periodRange
) {

    if (
        !periodRange?.start ||
        !periodRange?.end
    ) {

        return [];

    }


    return orders.filter(
        order =>
            dateInRange(
                order.createdAt,
                periodRange.start,
                periodRange.end
            )
    );

}


// ======================================================
// FILTER EXPENSES BY PERIOD
// ======================================================

export function filterExpensesByPeriod(
    expenses = [],
    periodRange
) {

    if (
        !periodRange?.start ||
        !periodRange?.end
    ) {

        return [];

    }


    return expenses.filter(
        expense =>
            dateInRange(
                expense.createdAt,
                periodRange.start,
                periodRange.end
            )
    );

}


// ======================================================
// FINANCIAL CALCULATION
// ======================================================
//
// คำนวณจาก:
//
// Revenue
// Product Cost
// Shipping
// Discount
// Expense
// Gross Profit
// Net Profit
// Cash Flow
//
// หมายเหตุ:
// productCost ยึด logic เดิมจาก Orders.jsx
// คือรวม costPrice ของแต่ละ SaleItem
// ======================================================

export function calculateFinancial(
    periodOrders = [],
    periodExpenses = []
) {

    let revenue = 0;

    let productCost = 0;

    let shipping = 0;

    let discount = 0;


    // --------------------------------------------------
    // ORDERS
    // --------------------------------------------------

    periodOrders.forEach(
        order => {

            revenue +=
                num(
                    order.totalAmount
                );


            shipping +=
                num(
                    order.shippingCost
                );


            discount +=
                num(
                    order.discount
                );


            (
                order.items || []
            ).forEach(
                item => {

                    productCost +=
                        num(
                            item
                                .consignmentItem
                                ?.costPrice
                        );

                }
            );

        }
    );


    // --------------------------------------------------
    // EXPENSES
    // --------------------------------------------------

    const expense =
        periodExpenses.reduce(
            (
                sum,
                item
            ) =>
                sum +
                num(item.amount),
            0
        );


    // --------------------------------------------------
    // PROFIT
    // --------------------------------------------------

    const grossProfit =
        revenue -
        productCost;


    const netProfit =
        grossProfit -
        expense;


    // --------------------------------------------------
    // CASH FLOW
    // --------------------------------------------------

    const cashFlow =
        revenue -
        expense;


    return {

        revenue,

        productCost,

        shipping,

        discount,

        expense,

        grossProfit,

        netProfit,

        cashFlow

    };

}


// ======================================================
// ORDER SUMMARY
// ======================================================
//
// total
// processing
// completed
// ======================================================

export function calculateOrderSummary(
    periodOrders = []
) {

    return {

        total:
            periodOrders.length,


        processing:
            periodOrders.filter(
                order =>
                    order.status !==
                    "COMPLETED"
            ).length,


        completed:
            periodOrders.filter(
                order =>
                    order.status ===
                    "COMPLETED"
            ).length

    };

}


// ======================================================
// BUILD TRANSACTIONS
// ======================================================
//
// สร้าง Transaction History
//
// SALE
// EXPENSE
// ======================================================

export function buildTransactions(
    periodOrders = [],
    periodExpenses = []
) {

    const list = [];


    // --------------------------------------------------
    // SALES
    // --------------------------------------------------

    periodOrders.forEach(
        order => {

            list.push({

                id:
                    `sale-${order.id}`,

                type:
                    "SALE",

                title:
                    `Order #${order.orderNo ?? order.id}`,

                description:
                    order.customer?.name ||
                    "Walk in customer",

                amount:
                    num(
                        order.totalAmount
                    ),

                date:
                    order.createdAt,

                order

            });

        }
    );


    // --------------------------------------------------
    // EXPENSES
    // --------------------------------------------------

    periodExpenses.forEach(
        expense => {

            list.push({

                id:
                    `expense-${expense.id}`,

                type:
                    "EXPENSE",

                title:
                    expense.name,

                description:
                    expense.category,

                amount:
                    num(
                        expense.amount
                    ),

                date:
                    expense.createdAt,

                expense

            });

        }
    );


    // --------------------------------------------------
    // NEWEST FIRST
    // --------------------------------------------------

    return list.sort(
        (
            a,
            b
        ) =>
            new Date(b.date) -
            new Date(a.date)
    );

}


// ======================================================
// FILTER TRANSACTIONS
// ======================================================

export function filterTransactions(
    transactions = [],
    search = "",
    activeType = "ALL"
) {

    const key =
        search
            .trim()
            .toLowerCase();


    return transactions.filter(
        transaction => {

            // ------------------------------------------
            // TYPE
            // ------------------------------------------

            const typeMatch =
                activeType === "ALL" ||
                transaction.type ===
                    activeType;


            if (!typeMatch) {

                return false;

            }


            // ------------------------------------------
            // SEARCH
            // ------------------------------------------

            if (!key) {

                return true;

            }


            return (

                String(
                    transaction.title || ""
                )
                    .toLowerCase()
                    .includes(key)

                ||

                String(
                    transaction.description || ""
                )
                    .toLowerCase()
                    .includes(key)

                ||

                String(
                    transaction.type || ""
                )
                    .toLowerCase()
                    .includes(key)

            );

        }
    );

}


// ======================================================
// BUILD ACCOUNTING ROWS
// ======================================================
//
// IMPORTANT:
//
// ต้องคำนวณ running balance
// จาก "เก่า -> ใหม่" ก่อน
//
// จากนั้นจึง reverse
// เพื่อแสดง "ใหม่ -> เก่า"
//
// ตัวนี้ยึด logic เดิมจาก Orders.jsx
// ======================================================

export function buildAccountingRows(
    periodOrders = [],
    periodExpenses = []
) {

    const rows = [];


    // --------------------------------------------------
    // SALES
    // --------------------------------------------------

    periodOrders.forEach(
        order => {

            rows.push({

                id:
                    `sale-${order.id}`,

                reference:
                    `SALE-${order.orderNo ?? order.id}`,

                date:
                    order.createdAt,

                type:
                    "INCOME",

                typeLabel:
                    "รายรับ",

                title:
                    `Order #${order.orderNo ?? order.id}`,

                description:
                    order.customer?.name ||
                    "Walk in customer",

                income:
                    num(
                        order.totalAmount
                    ),

                expense:
                    0,

                amount:
                    num(
                        order.totalAmount
                    ),

                source:
                    "SALE",

                order

            });

        }
    );


    // --------------------------------------------------
    // EXPENSES
    // --------------------------------------------------

    periodExpenses.forEach(
        expense => {

            rows.push({

                id:
                    `expense-${expense.id}`,

                reference:
                    `EXP-${expense.id}`,

                date:
                    expense.createdAt,

                type:
                    "EXPENSE",

                typeLabel:
                    "รายจ่าย",

                title:
                    expense.name,

                description:
                    expense.category,

                income:
                    0,

                expense:
                    num(
                        expense.amount
                    ),

                amount:
                    num(
                        expense.amount
                    ),

                source:
                    "EXPENSE",

                expenseData:
                    expense

            });

        }
    );


    // --------------------------------------------------
    // SORT OLDEST -> NEWEST
    // --------------------------------------------------

    rows.sort(
        (
            a,
            b
        ) =>
            new Date(a.date) -
            new Date(b.date)
    );


    // --------------------------------------------------
    // RUNNING BALANCE
    // --------------------------------------------------

    let balance = 0;


    const withBalance =
        rows.map(
            row => {

                balance +=
                    row.income -
                    row.expense;


                return {

                    ...row,

                    balance

                };

            }
        );


    // --------------------------------------------------
    // DISPLAY NEWEST -> OLDEST
    // --------------------------------------------------

    return withBalance.reverse();

}


// ======================================================
// FILTER ACCOUNTING ROWS
// ======================================================

export function filterAccountingRows(
    accountingRows = [],
    search = ""
) {

    const key =
        search
            .trim()
            .toLowerCase();


    if (!key) {

        return accountingRows;

    }


    return accountingRows.filter(
        row => {

            return (

                String(
                    row.reference || ""
                )
                    .toLowerCase()
                    .includes(key)

                ||

                String(
                    row.title || ""
                )
                    .toLowerCase()
                    .includes(key)

                ||

                String(
                    row.description || ""
                )
                    .toLowerCase()
                    .includes(key)

                ||

                String(
                    row.typeLabel || ""
                )
                    .toLowerCase()
                    .includes(key)

            );

        }
    );

}


// ======================================================
// ACCOUNTING SUMMARY
// ======================================================
//
// ใช้ข้อมูลจาก "filtered rows"
// เหมือน logic เดิมใน Orders.jsx
//
// หมายเหตุ:
// ถ้ามี search อยู่
// summary จะรวมเฉพาะรายการที่ค้นพบ
// ซึ่งตรงกับ behavior ปัจจุบัน
// ======================================================

export function calculateAccountingSummary(
    accountingRows = []
) {

    const income =
        accountingRows.reduce(
            (
                sum,
                row
            ) =>
                sum +
                num(row.income),
            0
        );


    const expense =
        accountingRows.reduce(
            (
                sum,
                row
            ) =>
                sum +
                num(row.expense),
            0
        );


    const net =
        income -
        expense;


    return {

        income,

        expense,

        net

    };

}


// ======================================================
// PERIOD LABEL
// ======================================================

export function getPeriodLabel(
    period
) {

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
// ACCOUNTING EXPORT DATA
// ======================================================
//
// เตรียมข้อมูลสำหรับ XLSX
//
// ยังไม่ import XLSX ที่นี่
// เพราะ utility นี้ควรเป็น pure function
// ======================================================

export function getAccountingExportRows(
    accountingRows = []
) {

    return accountingRows.map(
        row => ({

            "วันที่":
                formatDateTime(
                    row.date
                ),

            "เลขที่รายการ":
                row.reference,

            "ประเภท":
                row.typeLabel,

            "รายการ":
                row.title,

            "รายละเอียด":
                row.description,

            "รายรับ":
                row.income,

            "รายจ่าย":
                row.expense,

            "ยอดคงเหลือ":
                row.balance

        })
    );

}


// ======================================================
// HTML ESCAPE
// ======================================================
//
// ใช้ตอนสร้าง HTML สำหรับ Print / PDF
// ======================================================

export function escapeHtml(
    value
) {

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


// ======================================================
// DEFAULT ACCOUNTING DATA
// ======================================================
//
// เอาไว้ให้ component ใช้ได้อย่างปลอดภัย
// กรณีไม่มีข้อมูล
// ======================================================

export const EMPTY_FINANCIAL = {

    revenue: 0,

    productCost: 0,

    shipping: 0,

    discount: 0,

    expense: 0,

    grossProfit: 0,

    netProfit: 0,

    cashFlow: 0

};


export const EMPTY_ACCOUNTING_SUMMARY = {

    income: 0,

    expense: 0,

    net: 0

};