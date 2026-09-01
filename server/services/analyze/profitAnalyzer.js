// ======================================================
// PROFIT ANALYZER
// services/analyze/profitAnalyzer.js
// ======================================================
//
// BUSINESS PROFIT RULE
// ------------------------------------------------------
//
// เงินเข้า
// = order.totalAmount
//
// totalAmount คือเงินที่ลูกค้าจ่ายจริง
// ซึ่งรวม:
//
//     สินค้า
//     + ค่าส่งที่ลูกค้าจ่าย
//     - ส่วนลด
//
//
//
// เงินออก
// = ต้นทุนสินค้า
// + ค่าใช้จ่ายที่ผูกกับ Order
// + Global Expenses
//
//
//
// Profit
// = เงินเข้าทั้งหมด - เงินออกทั้งหมด
//
//
//
// IMPORTANT
// ------------------------------------------------------
//
// shippingCost
// = ค่าส่งที่ลูกค้าจ่าย
// = รายรับ
//
// expense.category = SHIPPING
// = ค่าส่งที่ร้านจ่ายจริง
// = ต้นทุน
//
//
//
// ORDER EXPENSE
// ------------------------------------------------------
//
// expense ที่ผูกกับ order
//
// เช่น:
// - ค่าส่ง Order นี้
// - ค่ากล่อง Order นี้
// - ค่าแพ็ค Order นี้
//
//
//
// GLOBAL EXPENSE
// ------------------------------------------------------
//
// expense ที่ไม่ได้ผูกกับ Order
//
// เช่น:
// - ซื้อกล่องจำนวนมาก
// - อุปกรณ์แพ็ค
// - ค่าใช้จ่ายร้าน
// - ค่าอื่นๆ
//
// Global Expense จะไม่ถูกยัดเข้า orderResults
// เพราะไม่รู้ว่าเป็นต้นทุนของ Order ไหน
//
// แต่จะถูกหักใน summary profit จริง
//
// ======================================================


// ======================================================
// NUMBER
// ======================================================

function toNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0

    }


    if (
        typeof value === "string"
    ) {

        value =
            value
                .replace(/,/g, "")
                .trim()

    }


    const number =
        Number(value)


    return Number.isFinite(number)
        ? number
        : 0

}


// ======================================================
// ROUND
// ======================================================

function round(value) {

    return Math.round(
        (
            toNumber(value)
            +
            Number.EPSILON
        ) * 100
    ) / 100

}


// ======================================================
// ITEMS
// ======================================================

function getItems(order) {

    return Array.isArray(
        order?.items
    )
        ? order.items
        : []

}


// ======================================================
// QUANTITY
// ======================================================
//
// quantity ไม่มีค่า
// = 1
//
// quantity > 0
// = quantity
//
// quantity <= 0
// = 0
//
// ======================================================

function getQty(item) {

    if (
        item?.quantity === undefined ||
        item?.quantity === null ||
        item?.quantity === ""
    ) {

        return 1

    }


    const qty =
        Number(
            item.quantity
        )


    if (
        !Number.isFinite(qty) ||
        qty <= 0
    ) {

        return 0

    }


    return qty

}


// ======================================================
// SALE AMOUNT
// ======================================================
//
// ยอดขายสินค้า
//
// salePrice × quantity
//
// ใช้สำหรับ Breakdown เท่านั้น
//
// Revenue หลัก:
// order.totalAmount
//
// ======================================================

function getSaleAmount(item) {

    return (
        toNumber(
            item?.salePrice
        )
        *
        getQty(item)
    )

}


// ======================================================
// PRODUCT COST
// ======================================================
//
// ต้นทุนสินค้า
//
// costPrice × quantity
//
// ======================================================

function getCost(item) {

    return (
        toNumber(
            item
                ?.consignmentItem
                ?.costPrice
        )
        *
        getQty(item)
    )

}


// ======================================================
// EXPENSE CATEGORY
// ======================================================

function normalizeExpenseCategory(
    category
) {

    return String(
        category || ""
    )
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_")

}


// ======================================================
// EXPENSE ANALYZER
// ======================================================
//
// รองรับ:
//
// SHIPPING
// PACKAGING
// PLATFORM_FEE
// OTHER
//
// category ที่ไม่รู้จัก
// = OTHER
//
// ======================================================

function analyzeExpenses(
    expenses = []
) {

    if (
        !Array.isArray(
            expenses
        )
    ) {

        expenses = []

    }


    let shipping = 0

    let packaging = 0

    let platformFee = 0

    let other = 0


    for (
        const expense
        of expenses
    ) {

        if (!expense) {
            continue
        }


        const amount =
            toNumber(
                expense.amount
            )


        if (amount === 0) {
            continue
        }


        const category =
            normalizeExpenseCategory(
                expense.category
            )


        switch (category) {

            // ------------------------------------------
            // SHIPPING
            // ------------------------------------------

            case "SHIPPING":

                shipping += amount

                break


            // ------------------------------------------
            // PACKAGING
            // ------------------------------------------

            case "PACKAGING":

                packaging += amount

                break


            // ------------------------------------------
            // PLATFORM FEE
            // ------------------------------------------

            case "PLATFORM_FEE":

                platformFee += amount

                break


            // ------------------------------------------
            // OTHER
            // ------------------------------------------

            case "OTHER":

                other += amount

                break


            // ------------------------------------------
            // UNKNOWN
            // ------------------------------------------

            default:

                other += amount

                break

        }

    }


    const total =
        shipping
        +
        packaging
        +
        platformFee
        +
        other


    return {

        shipping:
            round(
                shipping
            ),

        packaging:
            round(
                packaging
            ),

        platformFee:
            round(
                platformFee
            ),

        other:
            round(
                other
            ),

        total:
            round(
                total
            )

    }

}


// ======================================================
// SINGLE ORDER PROFIT
// ======================================================

function analyzeOrderProfit(
    order = {}
) {

    if (
        !order ||
        typeof order !== "object"
    ) {

        throw new TypeError(
            "analyzeOrderProfit expects object"
        )

    }


    // ==================================================
    // ITEMS
    // ==================================================

    const items =
        getItems(
            order
        )


    let productRevenue = 0

    let productCost = 0


    for (
        const item
        of items
    ) {

        if (!item) {
            continue
        }


        productRevenue +=
            getSaleAmount(
                item
            )


        productCost +=
            getCost(
                item
            )

    }


    // ==================================================
    // CUSTOMER PAYMENT
    // ==================================================
    //
    // เงินเข้าจริง
    //
    // ไม่คำนวณใหม่จากสินค้า + shipping
    //
    // ==================================================

    const customerPayment =
        toNumber(
            order.totalAmount
        )


    // ==================================================
    // SHIPPING REVENUE
    // ==================================================
    //
    // ค่าส่งที่ลูกค้าจ่าย
    //
    // เป็นรายรับ
    //
    // ==================================================

    const shippingRevenue =
        toNumber(
            order.shippingCost
        )


    // ==================================================
    // DISCOUNT
    // ==================================================

    const discount =
        toNumber(
            order.discount
        )


    // ==================================================
    // ORDER EXPENSES
    // ==================================================

    const expenses =
        analyzeExpenses(
            order.expenses
        )


    // ==================================================
    // TOTAL ORDER COST
    // ==================================================
    //
    // ต้นทุนสินค้า
    // +
    // ค่าใช้จ่ายของ Order
    //
    // ==================================================

    const totalCost =

        productCost
        +
        expenses.total


    // ==================================================
    // ORDER PROFIT
    // ==================================================

    const profit =

        customerPayment
        -
        totalCost


    // ==================================================
    // MARGIN
    // ==================================================

    const margin =

        customerPayment > 0

            ? (
                profit /
                customerPayment
            ) * 100

            : 0


    // ==================================================
    // RETURN
    // ==================================================

    return {

        orderId:
            order.id,


        createdAt:
            order.createdAt,


        // ----------------------------------------------
        // MONEY IN
        // ----------------------------------------------

        customerPayment:
            round(
                customerPayment
            ),


        // ----------------------------------------------
        // SALES BREAKDOWN
        // ----------------------------------------------

        productRevenue:
            round(
                productRevenue
            ),


        shippingRevenue:
            round(
                shippingRevenue
            ),


        discount:
            round(
                discount
            ),


        // ----------------------------------------------
        // PRODUCT COST
        // ----------------------------------------------

        productCost:
            round(
                productCost
            ),


        // ----------------------------------------------
        // ORDER EXPENSES
        // ----------------------------------------------

        expenses: {

            shipping:
                round(
                    expenses.shipping
                ),

            packaging:
                round(
                    expenses.packaging
                ),

            platformFee:
                round(
                    expenses.platformFee
                ),

            other:
                round(
                    expenses.other
                )

        },


        // ----------------------------------------------
        // ORDER TOTAL COST
        // ----------------------------------------------

        totalCost:
            round(
                totalCost
            ),


        // ----------------------------------------------
        // ORDER PROFIT
        // ----------------------------------------------

        profit:
            round(
                profit
            ),


        // ----------------------------------------------
        // ORDER MARGIN
        // ----------------------------------------------

        margin:
            round(
                margin
            )

    }

}


// ======================================================
// MAIN
// ======================================================

function analyzeProfit(
    data = {}
) {

    // ==================================================
    // ORDERS
    // ==================================================

    const orders =
        Array.isArray(
            data.orders
        )
            ? data.orders
            : []


    // ==================================================
    // GLOBAL EXPENSES
    // ==================================================
    //
    // expense ที่ไม่ได้ผูกกับ Order
    //
    // analyzeDataService ส่งมาให้แล้ว
    //
    // ==================================================

    const globalExpenses =
        Array.isArray(
            data.expenses
        )
            ? data.expenses
            : []


    // ==================================================
    // ORDER RESULTS
    // ==================================================

    const results =
        orders.map(
            analyzeOrderProfit
        )


    // ==================================================
    // ORDER TOTALS
    // ==================================================

    let payment = 0

    let productCost = 0

    let orderShipping = 0

    let orderPackaging = 0

    let orderPlatformFee = 0

    let orderOther = 0

    let orderTotalCost = 0


    for (
        const result
        of results
    ) {

        payment +=
            result.customerPayment


        productCost +=
            result.productCost


        orderShipping +=
            result.expenses.shipping


        orderPackaging +=
            result.expenses.packaging


        orderPlatformFee +=
            result.expenses.platformFee


        orderOther +=
            result.expenses.other


        orderTotalCost +=
            result.totalCost

    }


    // ==================================================
    // GLOBAL EXPENSES
    // ==================================================

    const globalExpense =
        analyzeExpenses(
            globalExpenses
        )


    // ==================================================
    // ALL EXPENSES
    // ==================================================
    //
    // Order Expenses
    // +
    // Global Expenses
    //
    // ==================================================

    const totalShipping =
        orderShipping
        +
        globalExpense.shipping


    const totalPackaging =
        orderPackaging
        +
        globalExpense.packaging


    const totalPlatformFee =
        orderPlatformFee
        +
        globalExpense.platformFee


    const totalOther =
        orderOther
        +
        globalExpense.other


    const totalExpenses =
        totalShipping
        +
        totalPackaging
        +
        totalPlatformFee
        +
        totalOther


    // ==================================================
    // PRODUCT COST
    // ==================================================

    const totalProductCost =
        productCost


    // ==================================================
    // ALL COST
    // ==================================================
    //
    // Product Cost
    // +
    // Order Expenses
    // +
    // Global Expenses
    //
    // ==================================================

    const totalCost =
        totalProductCost
        +
        totalExpenses


    // ==================================================
    // PROFIT
    // ==================================================
    //
    // เงินเข้าจริง
    // -
    // เงินออกจริง
    //
    // ==================================================

    const profit =
        payment
        -
        totalCost


    // ==================================================
    // MARGIN
    // ==================================================

    const margin =

        payment > 0

            ? (
                profit /
                payment
            ) * 100

            : 0


    // ==================================================
    // ORDER PROFIT BEFORE GLOBAL EXPENSE
    // ==================================================
    //
    // ใช้เพื่อให้รู้ว่าแต่ละ Order ทำกำไรเท่าไร
    //
    // Global Expense ไม่ควรถูกเฉลี่ยมั่ว ๆ
    // ไปใส่ Order ใด Order หนึ่ง
    //
    // ==================================================

    const orderProfit =
        orderTotalCost > 0
            ? payment - orderTotalCost
            : payment


    // ==================================================
    // RETURN
    // ==================================================

    return {

        // =================================================
        // SUMMARY
        // =================================================

        summary: {

            orders:
                orders.length,


            // ---------------------------------------------
            // MONEY IN
            // ---------------------------------------------

            revenue:
                round(
                    payment
                ),


            // ---------------------------------------------
            // PRODUCT COST
            // ---------------------------------------------

            productCost:
                round(
                    totalProductCost
                ),


            // ---------------------------------------------
            // EXPENSES
            // ---------------------------------------------

            expenses: {

                // Order + Global
                shipping:
                    round(
                        totalShipping
                    ),

                packaging:
                    round(
                        totalPackaging
                    ),

                platformFee:
                    round(
                        totalPlatformFee
                    ),

                other:
                    round(
                        totalOther
                    )

            },


            // ---------------------------------------------
            // ORDER EXPENSES
            // ---------------------------------------------
            //
            // เอาไว้ Debug / Dashboard
            //
            // ---------------------------------------------

            orderExpenses: {

                shipping:
                    round(
                        orderShipping
                    ),

                packaging:
                    round(
                        orderPackaging
                    ),

                platformFee:
                    round(
                        orderPlatformFee
                    ),

                other:
                    round(
                        orderOther
                    ),

                total:
                    round(
                        orderTotalCost -
                        totalProductCost
                    )

            },


            // ---------------------------------------------
            // GLOBAL EXPENSES
            // ---------------------------------------------
            //
            // ค่าใช้จ่ายที่ไม่ได้ผูกกับ Order
            //
            // ---------------------------------------------

            globalExpenses: {

                shipping:
                    round(
                        globalExpense.shipping
                    ),

                packaging:
                    round(
                        globalExpense.packaging
                    ),

                platformFee:
                    round(
                        globalExpense.platformFee
                    ),

                other:
                    round(
                        globalExpense.other
                    ),

                total:
                    round(
                        globalExpense.total
                    )

            },


            // ---------------------------------------------
            // TOTAL COST
            // ---------------------------------------------

            totalCost:
                round(
                    totalCost
                ),


            // ---------------------------------------------
            // PROFIT
            // ---------------------------------------------

            profit:
                round(
                    profit
                ),


            // ---------------------------------------------
            // MARGIN
            // ---------------------------------------------

            margin:
                round(
                    margin
                )

        },


        // =================================================
        // ORDER BREAKDOWN
        // =================================================
        //
        // profit ของแต่ละ Order
        // ยังไม่หัก Global Expense
        //
        // เพราะ Global Expense ไม่ได้เป็นของ Order ใด
        //
        // =================================================

        orders:
            results,


        // =================================================
        // COMPATIBILITY
        // =================================================
        //
        // Trend Analyzer ใช้ field นี้
        //
        // =================================================

        orderResults:
            results

    }

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    analyzeProfit,

    analyzeOrderProfit,

    analyzeExpenses

}