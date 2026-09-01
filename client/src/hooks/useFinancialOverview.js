// ======================================================
// hooks/useFinancialOverview.js
// ======================================================

import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import api from "../api/axios";

import {
    exportFinanceExcel,
    exportFinancePDF,
    printFinance
} from "../utils/financeExport";

import {
    transactionSearchText,
    toNumber
} from "../utils/financeFormatters";


// ======================================================
// API
// ======================================================

const FINANCE_API = "/orders/accounting";


// ======================================================
// EMPTY SUMMARY
// ======================================================

const EMPTY_SUMMARY = {
    totalSales: 0,
    totalExpenses: 0,

    itemsSold: 0,
    returnedItems: 0,

    revenue: 0,

    shipping: 0,

    shippingCharged: 0,
    shippingActual: 0,
    shippingProfit: 0,

    // ----------------------------------------------
    // OTHER EXPENSE (ค่าใช้จ่ายอื่นๆ จากการขาย)
    // ----------------------------------------------
    //
    // เดิมไม่มี field นี้เลยใน EMPTY_SUMMARY / normalizeSummary
    // ทั้งที่ FinancialOverview.jsx เรียกใช้ summary.otherExpense
    // ตรงๆ ที่การ์ด "ค่าใช้จ่ายอื่นๆ (จากการขาย)" — เพิ่มไว้ที่นี่
    // เพื่อให้มี default ที่ถูกต้อง
    //
    // ----------------------------------------------

    otherExpense: 0,

    productSales: 0,

    discount: 0,

    productCost: 0,

    expenses: 0,

    grossProfit: 0,
    netProfit: 0,

    profitMargin: 0,

    cashFlow: 0
};


// ======================================================
// EMPTY DATA
// ======================================================

const EMPTY_DATA = {
    summary: {
        ...EMPTY_SUMMARY
    },

    transactions: [],

    daily: [],

    range: null
};


// ======================================================
// NUMBER
// ======================================================

function safeNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }


    if (
        typeof value === "number" &&
        Number.isFinite(value)
    ) {
        return value;
    }


    if (typeof value === "string") {

        const cleaned =
            value
                .replace(/,/g, "")
                .replace(/฿/g, "")
                .trim();


        const number =
            Number(cleaned);


        return Number.isFinite(number)
            ? number
            : 0;

    }


    return toNumber(value);

}


// ======================================================
// FIRST VALID NUMBER
// ======================================================

function firstNumber(...values) {

    for (const value of values) {

        if (
            value !== null &&
            value !== undefined &&
            value !== ""
        ) {

            const number =
                safeNumber(value);


            if (number !== 0) {

                return number;

            }

        }

    }


    return 0;

}


// ======================================================
// NORMALIZE PERIOD
// ======================================================

function normalizePeriod(period) {

    const value =
        String(
            period || "day"
        ).toLowerCase();


    switch (value) {

        case "today":
        case "day":

            return "day";


        case "this_week":
        case "week":

            return "week";


        case "this_month":
        case "month":

            return "month";


        case "this_year":
        case "year":

            return "year";


        case "custom":

            return "custom";


        default:

            return "day";

    }

}


// ======================================================
// DATE FORMAT FOR API
// ======================================================

function formatDateForApi(value) {

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
        value instanceof Date
            ? value
            : new Date(value);


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
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
    );

}


// ======================================================
// FIND ACTUAL RESPONSE DATA
// ======================================================
//
// รองรับทั้ง:
//
// {
//     summary: {...}
// }
//
// และ:
//
// {
//     data: {
//         summary: {...}
//     }
// }
//
// และ:
//
// {
//     result: {
//         summary: {...}
//     }
// }
//
// ======================================================

function unwrapResponseData(responseData) {

    let source =
        responseData || {};


    if (
        source.data &&
        typeof source.data === "object" &&
        !Array.isArray(source.data)
    ) {

        source =
            source.data;

    }


    if (
        source.result &&
        typeof source.result === "object" &&
        !Array.isArray(source.result)
    ) {

        source =
            source.result;

    }


    if (
        source.accounting &&
        typeof source.accounting === "object" &&
        !Array.isArray(source.accounting)
    ) {

        source =
            source.accounting;

    }


    if (
        source.financial &&
        typeof source.financial === "object" &&
        !Array.isArray(source.financial)
    ) {

        source =
            source.financial;

    }


    return source || {};

}


// ======================================================
// CALCULATE SUMMARY FROM ORDERS
// ======================================================
//
// ใช้เป็น fallback กรณี backend ไม่ส่ง summary
// หรือส่ง summary มาไม่ครบ
// ======================================================

function calculateSummaryFromOrders(
    orders = [],
    expenses = []
) {

    let revenue = 0;

    let productCost = 0;

    let shippingCharged = 0;

    let shippingActual = 0;

    let otherExpense = 0;

    let discount = 0;

    let productSales = 0;

    let itemsSold = 0;


    orders.forEach(
        order => {

            const orderRevenue =
                firstNumber(
                    order.totalAmount,
                    order.total,
                    order.amount,
                    order.grandTotal
                );


            revenue +=
                orderRevenue;


            shippingCharged +=
                firstNumber(
                    order.shippingCharged,
                    order.shippingCost,
                    order.shipping
                );


            shippingActual +=
                firstNumber(
                    order.shippingActual,
                    order.actualShippingCost,
                    order.shippingCostActual
                );


            otherExpense +=
                firstNumber(
                    order.otherExpense,
                    order.otherSaleCost
                );


            discount +=
                firstNumber(
                    order.discount,
                    order.discountAmount
                );


            (
                order.items || []
            ).forEach(
                item => {

                    const quantity =
                        firstNumber(
                            item.quantity,
                            item.qty,
                            1
                        );


                    itemsSold +=
                        quantity;


                    const salePrice =
                        firstNumber(
                            item.salePrice,
                            item.sellingPrice,
                            item.price,
                            item.amount,
                            item.total
                        );


                    productSales +=
                        salePrice *
                        quantity;


                    const costPrice =
                        firstNumber(
                            item.consignmentItem?.costPrice,
                            item.costPrice,
                            item.product?.costPrice,
                            item.product?.cost,
                            0
                        );


                    productCost +=
                        costPrice *
                        quantity;

                }
            );

        }
    );


    const expense =
        expenses.reduce(
            (
                total,
                item
            ) =>
                total +
                firstNumber(
                    item.amount,
                    item.total,
                    item.cost
                ),
            0
        );


    const shippingProfit =
        shippingCharged -
        shippingActual;


    const grossProfit =
        revenue -
        productCost;


    const netProfit =
        grossProfit -
        expense;


    const cashFlow =
        revenue -
        expense;


    const profitMargin =
        revenue !== 0
            ? (
                netProfit /
                revenue
            ) *
            100
            : 0;


    return {

        totalSales:
            orders.length,

        totalExpenses:
            expenses.length,

        itemsSold,

        returnedItems:
            0,

        revenue,

        shipping:
            shippingCharged,

        shippingCharged,

        shippingActual,

        shippingProfit,

        otherExpense,

        productSales,

        discount,

        productCost,

        expenses:
            expense,

        grossProfit,

        netProfit,

        profitMargin,

        cashFlow

    };

}


// ======================================================
// NORMALIZE SUMMARY
// ======================================================

function normalizeSummary(
    summary = {},
    fallback = {}
) {

    // ==================================================
    // EXPENSE BREAKDOWN FROM BACKEND
    // ==================================================
    //
    // backend (controllers/orders.js -> getAccounting) ส่ง
    // summary.expensesByCategory.shippingActual และ
    // summary.expensesByCategory.otherSaleCost มาแยกหมวดแล้ว
    //
    // เดิมโค้ดตรงนี้ไม่เคยอ่าน expensesByCategory เลย ทำให้
    // การ์ด "ค่าส่งจริง" กับ "ค่าใช้จ่ายอื่นๆ" หน้า Financial
    // Overview โชว์ 0 เสมอ — แก้โดยอ่านจาก expensesByCategory
    // เป็นลำดับแรก ก่อน fallback ไปที่ field ชื่ออื่นๆ
    //
    // ==================================================

    const expensesByCategory =
        summary.expensesByCategory ||
        {};


    const shippingCharged =
        firstNumber(
            summary.shippingCharged,
            summary.shipping,
            fallback.shippingCharged,
            fallback.shipping
        );


    const shippingActual =
        firstNumber(
            expensesByCategory.shippingActual,
            summary.shippingActual,
            summary.actualShipping,
            fallback.shippingActual
        );


    const otherExpense =
        firstNumber(
            expensesByCategory.otherSaleCost,
            summary.otherExpense,
            summary.otherSaleCost,
            fallback.otherExpense
        );


    const shippingProfit =
        summary.shippingProfit !== undefined &&
        summary.shippingProfit !== null
            ? safeNumber(
                summary.shippingProfit
            )
            : (
                shippingCharged -
                shippingActual
            );


    const revenue =
        firstNumber(
            summary.revenue,
            summary.totalRevenue,
            summary.salesRevenue,
            fallback.revenue
        );


    const productCost =
        firstNumber(
            summary.productCost,
            summary.costOfGoodsSold,
            summary.cogs,
            summary.cost,
            fallback.productCost
        );


    const expense =
        firstNumber(
            summary.expenses,
            summary.expense,
            summary.totalExpense,
            summary.totalExpensesAmount,
            fallback.expenses
        );


    const grossProfit =
        summary.grossProfit !== undefined &&
        summary.grossProfit !== null
            ? safeNumber(
                summary.grossProfit
            )
            : (
                revenue -
                productCost
            );


    const netProfit =
        summary.netProfit !== undefined &&
        summary.netProfit !== null
            ? safeNumber(
                summary.netProfit
            )
            : (
                grossProfit -
                expense
            );


    const cashFlow =
        summary.cashFlow !== undefined &&
        summary.cashFlow !== null
            ? safeNumber(
                summary.cashFlow
            )
            : (
                revenue -
                expense
            );


    const profitMargin =
        summary.profitMargin !== undefined &&
        summary.profitMargin !== null
            ? safeNumber(
                summary.profitMargin
            )
            : (
                revenue !== 0
                    ? (
                        netProfit /
                        revenue
                    ) *
                    100
                    : 0
            );


    return {

        totalSales:
            firstNumber(
                summary.totalSales,
                summary.salesCount,
                fallback.totalSales
            ),


        totalExpenses:
            firstNumber(
                summary.totalExpenses,
                summary.expensesCount,
                fallback.totalExpenses
            ),


        itemsSold:
            firstNumber(
                summary.itemsSold,
                summary.totalItemsSold,
                fallback.itemsSold
            ),


        returnedItems:
            firstNumber(
                summary.returnedItems,
                fallback.returnedItems
            ),


        revenue,


        shipping:
            shippingCharged,


        shippingCharged,


        shippingActual,


        shippingProfit,


        // ----------------------------------------------
        // OTHER EXPENSE
        // ----------------------------------------------
        //
        // เพิ่ม field นี้เข้า return object — เดิมไม่มีเลย
        // ทั้งที่ FinancialOverview.jsx ใช้ summary.otherExpense
        // ตรงๆ
        //
        // ----------------------------------------------

        otherExpense,


        // ----------------------------------------------
        // RAW EXPENSE BREAKDOWN (เผื่อใช้ทำกราฟ/breakdown
        // เพิ่มเติมในอนาคต โดยไม่ต้องแก้ hook นี้อีก)
        // ----------------------------------------------

        expensesByCategory: {

            shippingActual:
                firstNumber(
                    expensesByCategory.shippingActual
                ),

            packaging:
                firstNumber(
                    expensesByCategory.packaging
                ),

            commission:
                firstNumber(
                    expensesByCategory.commission
                ),

            otherSaleCost:
                firstNumber(
                    expensesByCategory.otherSaleCost
                ),

            rent:
                firstNumber(
                    expensesByCategory.rent
                ),

            salary:
                firstNumber(
                    expensesByCategory.salary
                ),

            marketing:
                firstNumber(
                    expensesByCategory.marketing
                ),

            utility:
                firstNumber(
                    expensesByCategory.utility
                ),

            otherGeneral:
                firstNumber(
                    expensesByCategory.otherGeneral
                )

        },


        productSales:
            firstNumber(
                summary.productSales,
                summary.salesBeforeShipping,
                fallback.productSales
            ),


        discount:
            firstNumber(
                summary.discount,
                summary.totalDiscount,
                fallback.discount
            ),


        productCost,


        expenses:
            expense,


        grossProfit,


        netProfit,


        profitMargin,


        cashFlow

    };

}


// ======================================================
// NORMALIZE TRANSACTION
// ======================================================

function normalizeTransaction(
    transaction = {}
) {

    const rawType =
        String(
            transaction.type ||
            ""
        ).toUpperCase();


    const type =
        rawType === "SALE"
            ? "SALE"
            : rawType === "INCOME"
                ? "INCOME"
                : "EXPENSE";


    const income =
        firstNumber(
            transaction.income,
            transaction.revenue,
            transaction.totalAmount,
            transaction.total,
            (
                type === "SALE" ||
                type === "INCOME"
            )
                ? transaction.amount
                : 0
        );


    const expense =
        firstNumber(
            transaction.expense,
            transaction.expenseAmount,
            (
                type === "EXPENSE"
            )
                ? transaction.amount
                : 0
        );


    const amount =
        firstNumber(
            transaction.amount,
            (
                type === "SALE" ||
                type === "INCOME"
            )
                ? income
                : expense
        );


    const date =
        transaction.date ||
        transaction.createdAt ||
        transaction.soldAt ||
        transaction.saleDate ||
        transaction.updatedAt ||
        null;


    return {

        ...transaction,


        id:
            transaction.id ??
            transaction.reference ??
            `${type}-${date || Date.now()}`,


        type,


        typeLabel:
            transaction.typeLabel ||
            (
                type === "SALE" ||
                type === "INCOME"
                    ? "รายรับ"
                    : "รายจ่าย"
            ),


        title:
            transaction.title ||
            transaction.name ||
            (
                transaction.orderNumber
                    ? `Order #${transaction.orderNumber}`
                    : "-"
            ),


        description:
            transaction.description ||
            transaction.customer?.name ||
            transaction.customerName ||
            transaction.category ||
            "",


        reference:
            transaction.reference ||
            transaction.orderNumber ||
            transaction.saleNumber ||
            (
                transaction.saleId
                    ? `SALE-${transaction.saleId}`
                    : "-"
            ),


        date,


        amount,


        income,


        expense,


        balance:
            safeNumber(
                transaction.balance
            ),


        shippingCharged:
            firstNumber(
                transaction.shippingCharged,
                transaction.shipping,
                transaction.order?.shippingCharged,
                transaction.order?.shippingCost
            ),


        shippingActual:
            firstNumber(
                transaction.shippingActual,
                transaction.order?.shippingActual
            ),


        // ----------------------------------------------
        // NOTE: shippingActual/otherExpense ต่อรายการขาย
        // ----------------------------------------------
        //
        // backend (controllers/orders.js -> getAccounting)
        // ยังไม่ได้แนบ shippingActual/otherExpense ของ sale
        // เข้ามาใน transaction object ตอนสร้างรายการ SALE
        // (มีแค่ id, amount, customer, items) ค่านี้จึงจะเป็น 0
        // เสมอสำหรับ transaction ประเภท SALE จนกว่าจะแก้ backend
        // ให้ join ข้อมูล Expense (ตาม saleId) เข้ามาด้วย
        //
        // ----------------------------------------------

        otherExpense:
            firstNumber(
                transaction.otherExpense,
                transaction.order?.otherExpense
            ),


        shippingProfit:
            transaction.shippingProfit !== undefined &&
            transaction.shippingProfit !== null
                ? safeNumber(
                    transaction.shippingProfit
                )
                : (
                    firstNumber(
                        transaction.shippingCharged,
                        transaction.shipping,
                        transaction.order?.shippingCharged,
                        transaction.order?.shippingCost
                    ) -
                    firstNumber(
                        transaction.shippingActual,
                        transaction.order?.shippingActual
                    )
                ),


        order:
            transaction.order ||
            transaction.sale ||
            null,


        expenseData:
            transaction.expenseData ||
            transaction.expense ||
            null

    };

}


// ======================================================
// NORMALIZE RESPONSE
// ======================================================

function normalizeFinanceResponse(
    responseData
) {

    const source =
        unwrapResponseData(
            responseData
        );


    // ==================================================
    // TRANSACTIONS
    // ==================================================

    let rawTransactions = [];


    if (
        Array.isArray(
            source.transactions
        )
    ) {

        rawTransactions =
            source.transactions;

    }


    else if (
        Array.isArray(
            source.accountingRows
        )
    ) {

        rawTransactions =
            source.accountingRows;

    }


    else if (
        Array.isArray(
            source.rows
        )
    ) {

        rawTransactions =
            source.rows;

    }


    else if (
        Array.isArray(
            source.sales
        )
        ||
        Array.isArray(
            source.expenses
        )
    ) {

        rawTransactions = [

            ...(
                source.sales ||
                []
            ).map(
                sale => ({
                    ...sale,
                    type: "SALE"
                })
            ),

            ...(
                source.expenses ||
                []
            ).map(
                expense => ({
                    ...expense,
                    type: "EXPENSE"
                })
            )

        ];

    }


    const transactions =
        rawTransactions.map(
            normalizeTransaction
        );


    // ==================================================
    // ORDERS / EXPENSES FALLBACK
    // ==================================================

    const orders =
        Array.isArray(
            source.orders
        )
            ? source.orders
            : transactions
                .filter(
                    transaction =>
                        (
                            transaction.type === "SALE" ||
                            transaction.type === "INCOME"
                        ) &&
                        transaction.order
                )
                .map(
                    transaction =>
                        transaction.order
                );


    const expenses =
        Array.isArray(
            source.expenseRecords
        )
            ? source.expenseRecords
            : Array.isArray(
                source.expenses
            )
                ? source.expenses
                : transactions
                    .filter(
                        transaction =>
                            transaction.type === "EXPENSE" &&
                            transaction.expenseData
                    )
                    .map(
                        transaction =>
                            transaction.expenseData
                    );


    const fallbackSummary =
        calculateSummaryFromOrders(
            orders,
            expenses
        );


    const sourceSummary =
        source.summary ||
        source.financialSummary ||
        source.overview ||
        {};


    const summary =
        normalizeSummary(
            sourceSummary,
            fallbackSummary
        );


    // ==================================================
    // DAILY
    // ==================================================

    const daily =
        Array.isArray(
            source.daily
        )
            ? source.daily
            : Array.isArray(
                source.dailyBreakdown
            )
                ? source.dailyBreakdown
                : [];


    // ==================================================
    // RANGE
    // ==================================================

    const range =
        source.range ||
        source.dateRange ||
        null;


    // ==================================================
    // DEBUG
    // ==================================================
    //
    // เปิดไว้เพื่อดู response จริงจาก backend
    // ใน browser console
    //
    // ==================================================

    console.debug(
        "[FinancialOverview] normalized response:",
        {
            source,
            summary,
            transactions,
            daily,
            range
        }
    );


    return {

        summary,

        transactions,

        daily,

        range

    };

}


// ======================================================
// HOOK
// ======================================================

export function useFinancialOverview() {

    // ==================================================
    // DATA
    // ==================================================

    const [
        data,
        setData
    ] = useState(
        EMPTY_DATA
    );


    // ==================================================
    // LOADING
    // ==================================================

    const [
        loading,
        setLoading
    ] = useState(false);


    // ==================================================
    // ERROR
    // ==================================================

    const [
        error,
        setError
    ] = useState("");


    // ==================================================
    // PERIOD
    // ==================================================

    const [
        period,
        setPeriod
    ] = useState("day");


    // ==================================================
    // SELECTED DATE
    // ==================================================

    const [
        selectedDate,
        setSelectedDate
    ] = useState(
        new Date()
    );


    // ==================================================
    // CUSTOM DATE
    // ==================================================

    const [
        customStart,
        setCustomStart
    ] = useState("");


    const [
        customEnd,
        setCustomEnd
    ] = useState("");


    // ==================================================
    // CALENDAR
    // ==================================================

    const [
        calendarOpen,
        setCalendarOpen
    ] = useState(false);


    // ==================================================
    // SEARCH
    // ==================================================

    const [
        search,
        setSearch
    ] = useState("");


    // ==================================================
    // TYPE FILTER
    // ==================================================

    const [
        typeFilter,
        setTypeFilter
    ] = useState("ALL");


    // ==================================================
    // PAGINATION
    // ==================================================

    const [
        page,
        setPage
    ] = useState(1);


    const [
        pageSize,
        setPageSize
    ] = useState(10);


    // ==================================================
    // SELECTED TRANSACTION
    // ==================================================

    const [
        selectedTransaction,
        setSelectedTransaction
    ] = useState(null);


    // ==================================================
    // LOAD FINANCE
    // ==================================================

    const loadFinance =
        useCallback(
            async ({
                requestedPeriod = period,
                requestedDate = selectedDate,
                startDate = customStart,
                endDate = customEnd
            } = {}) => {

                try {

                    setLoading(true);

                    setError("");


                    const normalizedPeriod =
                        normalizePeriod(
                            requestedPeriod
                        );


                    const params = {};


                    // ==================================
                    // CUSTOM
                    // ==================================

                    if (
                        normalizedPeriod ===
                        "custom"
                    ) {

                        const start =
                            formatDateForApi(
                                startDate
                            );


                        const end =
                            formatDateForApi(
                                endDate ||
                                startDate
                            );


                        if (!start) {

                            setError(
                                "กรุณาเลือกวันที่เริ่มต้น"
                            );

                            return;

                        }


                        params.period =
                            "custom";


                        params.startDate =
                            start;


                        params.endDate =
                            end ||
                            start;

                    }


                    // ==================================
                    // NORMAL PERIOD
                    // ==================================

                    else {

                        params.period =
                            normalizedPeriod;


                        const date =
                            formatDateForApi(
                                requestedDate
                            );


                        if (date) {

                            params.date =
                                date;

                        }

                    }


                    // ==================================
                    // API
                    // ==================================

                    console.debug(
                        "[FinancialOverview] request:",
                        {
                            url: FINANCE_API,
                            params
                        }
                    );


                    const response =
                        await api.get(
                            FINANCE_API,
                            {
                                params
                            }
                        );


                    // ==================================
                    // NORMALIZE
                    // ==================================

                    const normalized =
                        normalizeFinanceResponse(
                            response?.data
                        );


                    setData(
                        normalized
                    );

                }


                catch (err) {

                    console.error(
                        "Financial Overview load error:",
                        err
                    );


                    const message =
                        err?.response?.data?.message ||
                        err?.message ||
                        "ไม่สามารถโหลดข้อมูลทางการเงินได้";


                    setError(
                        message
                    );


                    setData({

                        summary: {
                            ...EMPTY_SUMMARY
                        },

                        transactions: [],

                        daily: [],

                        range: null

                    });

                }


                finally {

                    setLoading(false);

                }

            },
            [
                period,
                selectedDate,
                customStart,
                customEnd
            ]
        );


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {

        loadFinance({

            requestedPeriod:
                "day",

            requestedDate:
                new Date()

        });

    }, []);


    // ==================================================
    // CHANGE PERIOD
    // ==================================================

    const changePeriod =
        useCallback(
            nextPeriod => {

                const normalized =
                    normalizePeriod(
                        nextPeriod
                    );


                setPage(1);

                setSearch("");

                setTypeFilter("ALL");

                setPeriod(
                    normalized
                );


                if (
                    normalized ===
                    "custom"
                ) {

                    setCalendarOpen(
                        true
                    );

                    return;

                }


                loadFinance({

                    requestedPeriod:
                        normalized,

                    requestedDate:
                        selectedDate

                });

            },
            [
                loadFinance,
                selectedDate
            ]
        );


    // ==================================================
    // CHANGE DATE
    // ==================================================

    const changeSelectedDate =
        useCallback(
            date => {

                if (!date) {

                    return;

                }


                setSelectedDate(
                    date
                );


                setPage(1);

                setSearch("");

                setTypeFilter(
                    "ALL"
                );


                if (
                    period ===
                    "custom"
                ) {

                    return;

                }


                loadFinance({

                    requestedPeriod:
                        period,

                    requestedDate:
                        date

                });

            },
            [
                period,
                loadFinance
            ]
        );


    // ==================================================
    // APPLY CUSTOM DATE
    // ==================================================

    const applyCustomDate =
        useCallback(
            async (
                start,
                end
            ) => {

                const normalizedStart =
                    formatDateForApi(
                        start
                    );


                const normalizedEnd =
                    formatDateForApi(
                        end ||
                        start
                    );


                if (
                    !normalizedStart
                ) {

                    return;

                }


                setCustomStart(
                    normalizedStart
                );


                setCustomEnd(
                    normalizedEnd
                );


                setPeriod(
                    "custom"
                );


                setPage(1);

                setSearch("");

                setTypeFilter(
                    "ALL"
                );


                await loadFinance({

                    requestedPeriod:
                        "custom",

                    startDate:
                        normalizedStart,

                    endDate:
                        normalizedEnd

                });


                setCalendarOpen(
                    false
                );

            },
            [
                loadFinance
            ]
        );


    // ==================================================
    // CALENDAR
    // ==================================================

    const openCalendar =
        useCallback(
            () => {

                setCalendarOpen(
                    true
                );

            },
            []
        );


    const closeCalendar =
        useCallback(
            () => {

                setCalendarOpen(
                    false
                );

            },
            []
        );


    // ==================================================
    // FILTER TRANSACTIONS
    // ==================================================

    const filteredTransactions =
        useMemo(
            () => {

                const key =
                    search
                        .trim()
                        .toLowerCase();


                return (
                    data.transactions ||
                    []
                ).filter(
                    transaction => {

                        const transactionType =
                            transaction.type ===
                            "SALE"
                                ? "INCOME"
                                : transaction.type;


                        // ==========================
                        // TYPE
                        // ==========================

                        if (
                            typeFilter !==
                                "ALL" &&
                            transactionType !==
                                typeFilter
                        ) {

                            return false;

                        }


                        // ==========================
                        // SEARCH
                        // ==========================

                        if (!key) {

                            return true;

                        }


                        return transactionSearchText(
                            transaction
                        )
                            .toLowerCase()
                            .includes(
                                key
                            );

                    }
                );

            },
            [
                data.transactions,
                search,
                typeFilter
            ]
        );


    // ==================================================
    // TOTAL PAGES
    // ==================================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredTransactions.length /
                pageSize
            )
        );


    // ==================================================
    // FIX PAGE
    // ==================================================

    useEffect(() => {

        if (
            page >
            totalPages
        ) {

            setPage(
                totalPages
            );

        }

    }, [
        page,
        totalPages
    ]);


    // ==================================================
    // PAGINATED TRANSACTIONS
    // ==================================================

    const paginatedTransactions =
        useMemo(
            () => {

                const start =
                    (
                        page - 1
                    ) *
                    pageSize;


                return filteredTransactions.slice(
                    start,
                    start + pageSize
                );

            },
            [
                filteredTransactions,
                page,
                pageSize
            ]
        );


    // ==================================================
    // SUMMARY
    // ==================================================

    const summary =
        useMemo(
            () =>
                normalizeSummary(
                    data.summary
                ),
            [
                data.summary
            ]
        );


    // ==================================================
    // TRANSACTION SELECT
    // ==================================================

    const selectTransaction =
        useCallback(
            transaction => {

                setSelectedTransaction(
                    transaction
                );

            },
            []
        );


    const closeTransaction =
        useCallback(
            () => {

                setSelectedTransaction(
                    null
                );

            },
            []
        );


    // ==================================================
    // EXPORT EXCEL
    // ==================================================
    //
    // แก้ไข: เดิมไม่ได้ส่ง summary/options เข้าไปเลย ทำให้
    // ไฟล์ Excel ไม่มีชีตสรุปยอด และไม่รู้ช่วงเวลาที่เลือกอยู่
    // ตอนนี้ส่งให้ตรงกับ exportPDF / print ด้านล่าง
    //
    // ==================================================

    const exportExcel =
        useCallback(
            () => {

                exportFinanceExcel(
                    filteredTransactions,
                    summary,
                    {
                        period,
                        selectedDate,
                        customStart,
                        customEnd
                    }
                );

            },
            [
                filteredTransactions,
                summary,
                period,
                selectedDate,
                customStart,
                customEnd
            ]
        );


    // ==================================================
    // EXPORT PDF
    // ==================================================

    const exportPDF =
        useCallback(
            () => {

                exportFinancePDF(
                    filteredTransactions,
                    summary,
                    {
                        period,
                        selectedDate,
                        customStart,
                        customEnd
                    }
                );

            },
            [
                filteredTransactions,
                summary,
                period,
                selectedDate,
                customStart,
                customEnd
            ]
        );


    // ==================================================
    // PRINT
    // ==================================================

    const print =
        useCallback(
            () => {

                printFinance(
                    filteredTransactions,
                    summary,
                    {
                        period,
                        selectedDate,
                        customStart,
                        customEnd
                    }
                );

            },
            [
                filteredTransactions,
                summary,
                period,
                selectedDate,
                customStart,
                customEnd
            ]
        );


    // ==================================================
    // RESET FILTERS
    // ==================================================

    const resetFilters =
        useCallback(
            () => {

                setSearch("");

                setTypeFilter(
                    "ALL"
                );

                setPage(1);

            },
            []
        );


    // ==================================================
    // RETRY
    // ==================================================

    const retry =
        useCallback(
            () => {

                return loadFinance({

                    requestedPeriod:
                        period,

                    requestedDate:
                        selectedDate,

                    startDate:
                        customStart,

                    endDate:
                        customEnd

                });

            },
            [
                loadFinance,
                period,
                selectedDate,
                customStart,
                customEnd
            ]
        );


    // ==================================================
    // NEXT PAGE
    // ==================================================

    const nextPage =
        useCallback(
            () => {

                setPage(
                    current =>
                        Math.min(
                            current + 1,
                            totalPages
                        )
                );

            },
            [
                totalPages
            ]
        );


    // ==================================================
    // PREVIOUS PAGE
    // ==================================================

    const previousPage =
        useCallback(
            () => {

                setPage(
                    current =>
                        Math.max(
                            current - 1,
                            1
                        )
                );

            },
            []
        );


    // ==================================================
    // PAGE SIZE
    // ==================================================

    const changePageSize =
        useCallback(
            size => {

                const nextSize =
                    Number(size);


                if (
                    ![
                        10,
                        20,
                        50,
                        100
                    ].includes(
                        nextSize
                    )
                ) {

                    return;

                }


                setPageSize(
                    nextSize
                );


                setPage(1);

            },
            []
        );


    // ==================================================
    // RETURN
    // ==================================================

    return {

        // ==============================================
        // DATA
        // ==============================================

        data,

        summary,


        transactions:
            filteredTransactions,


        allTransactions:
            data.transactions,


        paginatedTransactions,


        daily:
            data.daily,


        range:
            data.range,


        // ==============================================
        // STATE
        // ==============================================

        loading,

        error,


        period,

        selectedDate,


        customStart,

        customEnd,


        // ==============================================
        // LOAD
        // ==============================================

        loadFinance,

        retry,


        // ==============================================
        // PERIOD
        // ==============================================

        changePeriod,

        setPeriod,


        // ==============================================
        // DATE
        // ==============================================

        changeSelectedDate,

        setSelectedDate,


        // ==============================================
        // CUSTOM DATE
        // ==============================================

        applyCustomDate,

        setCustomStart,

        setCustomEnd,


        // ==============================================
        // CALENDAR
        // ==============================================

        calendarOpen,

        openCalendar,

        closeCalendar,


        // ==============================================
        // SEARCH
        // ==============================================

        search,

        setSearch,


        // ==============================================
        // FILTER
        // ==============================================

        typeFilter,

        setTypeFilter,

        resetFilters,


        // ==============================================
        // PAGINATION
        // ==============================================

        page,

        setPage,


        pageSize,

        setPageSize,

        changePageSize,


        totalPages,


        nextPage,

        previousPage,


        // ==============================================
        // TRANSACTION
        // ==============================================

        selectedTransaction,

        selectTransaction,

        closeTransaction,


        // ==============================================
        // EXPORT
        // ==============================================

        exportExcel,

        exportPDF,

        print

    };

}


// ======================================================
// DEFAULT EXPORT
// ======================================================

export default useFinancialOverview;