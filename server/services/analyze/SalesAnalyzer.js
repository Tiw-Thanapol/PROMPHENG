// ======================================================
// SALES ANALYZER
// ======================================================
//
// วิเคราะห์ "ยอดขาย / เงินเข้า"
//
// BUSINESS RULE
// ------------------------------------------------------
//
// Customer Payment
// = เงินที่ลูกค้าจ่ายจริง
//
// Expected Customer Payment
// = Product Revenue
// + Shipping Revenue
// - Discount
//
// Profit จะคำนวณแยกใน Profit Analyzer
//
// ======================================================


// ======================================================
// HELPERS
// ======================================================

function toNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0
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

function round(
    value,
    digits = 2
) {

    const factor =
        Math.pow(10, digits)

    return Math.round(
        (
            toNumber(value) *
            factor
        ) + Number.EPSILON
    ) / factor
}


// ======================================================
// ITEMS
// ======================================================

function getItems(order) {

    return Array.isArray(order?.items)
        ? order.items
        : []
}


// ======================================================
// QUANTITY
// ======================================================

function getQuantity(item) {

    if (
        item?.quantity === undefined ||
        item?.quantity === null ||
        item?.quantity === ""
    ) {
        return 1
    }

    const qty =
        Number(item.quantity)

    if (
        !Number.isFinite(qty) ||
        qty < 0
    ) {
        return 0
    }

    return qty
}


// ======================================================
// ITEM REVENUE
// ======================================================

function getItemRevenue(item) {

    const price =
        toNumber(
            item?.salePrice
        )

    const quantity =
        getQuantity(item)

    return price * quantity
}


// ======================================================
// ANALYZE ORDER
// ======================================================

function analyzeOrder(order) {

    if (
        !order ||
        typeof order !== "object"
    ) {
        throw new TypeError(
            "analyzeOrder expects object"
        )
    }


    const items =
        getItems(order)


    let productRevenue = 0

    let itemQuantity = 0


    // --------------------------------------------------
    // PRODUCT REVENUE
    // --------------------------------------------------

    for (const item of items) {

        productRevenue +=
            getItemRevenue(item)

        itemQuantity +=
            getQuantity(item)

    }


    // --------------------------------------------------
    // SHIPPING REVENUE
    // --------------------------------------------------

    const shippingRevenue =
        toNumber(
            order.shippingCost
        )


    // --------------------------------------------------
    // DISCOUNT
    // --------------------------------------------------

    const discount =
        toNumber(
            order.discount
        )


    // --------------------------------------------------
    // CUSTOMER PAYMENT
    // --------------------------------------------------
    //
    // ยอดที่ลูกค้าจ่ายจริง
    //
    // ไม่คำนวณใหม่
    // อ่านจาก order.totalAmount
    //
    // --------------------------------------------------

    const customerPayment =
        toNumber(
            order.totalAmount
        )


    // --------------------------------------------------
    // EXPECTED PAYMENT
    // --------------------------------------------------
    //
    // ตาม Business Rule:
    //
    // สินค้า
    // + ค่าส่ง
    // - ส่วนลด
    //
    // --------------------------------------------------

    const expectedCustomerPayment =
        productRevenue +
        shippingRevenue -
        discount


    // --------------------------------------------------
    // PAYMENT DIFFERENCE
    // --------------------------------------------------

    const paymentDifference =
        customerPayment -
        expectedCustomerPayment


    // --------------------------------------------------
    // ACCOUNTING STATUS
    // --------------------------------------------------

    const accountingBalanced =
        round(paymentDifference) === 0


    return {

        orderId:
            order.id,

        createdAt:
            order.createdAt,

        itemCount:
            items.length,

        itemQuantity:
            round(itemQuantity),

        productRevenue:
            round(productRevenue),

        shippingRevenue:
            round(shippingRevenue),

        discount:
            round(discount),

        // เงินที่ลูกค้าจ่ายจริง
        customerPayment:
            round(customerPayment),

        // เงินที่ควรได้รับตามสูตร
        expectedCustomerPayment:
            round(
                expectedCustomerPayment
            ),

        // ส่วนต่าง
        paymentDifference:
            round(
                paymentDifference
            ),

        accountingBalanced

    }

}


// ======================================================
// ANALYZE SALES
// ======================================================

function analyzeSales(
    orders = []
) {

    if (!Array.isArray(orders)) {

        throw new TypeError(
            "salesAnalyzer expects array"
        )

    }


    let productRevenue = 0

    let shippingRevenue = 0

    let discount = 0

    let customerPayment = 0

    let expectedCustomerPayment = 0

    let items = 0

    let itemQuantity = 0

    let balancedOrders = 0

    let unbalancedOrders = 0

    let totalPaymentDifference = 0


    const orderResults = []


    // ==================================================
    // ORDERS
    // ==================================================

    for (const order of orders) {

        const result =
            analyzeOrder(order)


        orderResults.push(
            result
        )


        productRevenue +=
            result.productRevenue


        shippingRevenue +=
            result.shippingRevenue


        discount +=
            result.discount


        customerPayment +=
            result.customerPayment


        expectedCustomerPayment +=
            result.expectedCustomerPayment


        totalPaymentDifference +=
            result.paymentDifference


        items +=
            result.itemCount


        itemQuantity +=
            result.itemQuantity


        if (
            result.accountingBalanced
        ) {

            balancedOrders++

        } else {

            unbalancedOrders++

        }

    }


    // ==================================================
    // TOTALS
    // ==================================================

    const ordersCount =
        orders.length


    productRevenue =
        round(productRevenue)


    shippingRevenue =
        round(shippingRevenue)


    discount =
        round(discount)


    customerPayment =
        round(customerPayment)


    expectedCustomerPayment =
        round(expectedCustomerPayment)


    totalPaymentDifference =
        round(
            totalPaymentDifference
        )


    // ==================================================
    // ACCOUNTING ERRORS
    // ==================================================

    const errors =
        orderResults
            .filter(
                order =>
                    !order.accountingBalanced
            )
            .map(
                order => ({
                    orderId:
                        order.orderId,

                    customerPayment:
                        order.customerPayment,

                    expectedCustomerPayment:
                        order.expectedCustomerPayment,

                    difference:
                        order.paymentDifference
                })
            )


    // ==================================================
    // RETURN
    // ==================================================

    return {

        orders:
            ordersCount,

        items,

        itemQuantity:
            round(itemQuantity),

        productRevenue,

        shippingRevenue,

        discount,

        // เงินเข้าเงินจริง
        customerPayment,

        // ยอดที่ควรเป็น
        expectedCustomerPayment,

        // ส่วนต่างรวม
        totalPaymentDifference,

        averageOrderValue:

            ordersCount
                ? round(
                    customerPayment /
                    ordersCount
                )
                : 0,

        averageProductRevenue:

            ordersCount
                ? round(
                    productRevenue /
                    ordersCount
                )
                : 0,

        averageItemsPerOrder:

            ordersCount
                ? round(
                    itemQuantity /
                    ordersCount
                )
                : 0,

        accounting: {

            balanced:
                unbalancedOrders === 0,

            balancedOrders,

            unbalancedOrders,

            totalDifference:
                totalPaymentDifference,

            errors

        },

        // ------------------------------------------------
        // ORDER BREAKDOWN
        // ------------------------------------------------

        ordersDetail:
            orderResults

    }

}


// ======================================================
// ORDER BREAKDOWN
// ======================================================

function analyzeOrders(
    orders = []
) {

    if (!Array.isArray(orders)) {

        throw new TypeError(
            "analyzeOrders expects array"
        )

    }


    return orders.map(
        analyzeOrder
    )

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    analyzeSales,

    analyzeOrders,

    analyzeOrder

}