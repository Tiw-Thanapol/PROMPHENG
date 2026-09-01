
// ======================================================
// PRODUCT ANALYZER
// services/analyze/productAnalyzer.js
// ======================================================
//
// วิเคราะห์ Performance รายสินค้า
//
// แหล่งข้อมูล:
//
// sales/orders
// -> ยอดขายจริง
// -> unitsSold
// -> revenue
// -> cost
// -> profit
//
// inventory / ConsignmentItem[]
// -> stock ปัจจุบัน
// -> AVAILABLE เท่านั้น
// -> stock value
// -> stock age
//
// IMPORTANT
//
// 1. ห้ามนับ SOLD จาก inventory เป็นยอดขายซ้ำ
// 2. ยอดขายต้องอ้างอิงจาก Sale.items
// 3. Stock ปัจจุบันอ้างอิง AVAILABLE
// 4. ถ้ามี productId ให้รวมตาม productId
// 5. ถ้าไม่มี productId จะ fallback เป็น ConsignmentItem.id
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


function round(value, digits = 2) {

    const factor =
        Math.pow(10, digits)

    return Math.round(
        toNumber(value) * factor
    ) / factor
}


function normalizeStatus(status) {

    return String(
        status || ""
    )
        .trim()
        .toUpperCase()
}


function validDate(value) {

    if (!value) {
        return null
    }

    const date =
        new Date(value)

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null
    }

    return date
}


function daysBetween(
    from,
    to = new Date()
) {

    const start =
        validDate(from)

    const end =
        validDate(to)

    if (!start || !end) {
        return 0
    }

    const diff =
        end.getTime() -
        start.getTime()

    return Math.max(
        0,
        Math.floor(
            diff /
            (1000 * 60 * 60 * 24)
        )
    )
}


// ======================================================
// PRODUCT KEY
// ======================================================
//
// สำคัญมาก
//
// ถ้า ConsignmentItem มี productId
// ให้รวมหลาย ConsignmentItem เป็น Product เดียวกัน
//
// ถ้ายังไม่มี productId
// fallback ไปใช้ id
//
// ======================================================

function getProductKey(item) {

    if (!item) {
        return null
    }


    const productId =
        item.productId ??
        item.product?.id


    if (
        productId !== null &&
        productId !== undefined &&
        productId !== ""
    ) {

        return `PRODUCT:${productId}`

    }


    if (
        item.id !== null &&
        item.id !== undefined &&
        item.id !== ""
    ) {

        return `ITEM:${item.id}`

    }


    return null
}


// ======================================================
// PRODUCT ID
// ======================================================

function getProductId(item) {

    if (!item) {
        return null
    }


    const productId =
        item.productId ??
        item.product?.id


    if (
        productId !== null &&
        productId !== undefined &&
        productId !== ""
    ) {

        return productId

    }


    return item.id ?? null
}


// ======================================================
// PRODUCT NAME
// ======================================================

function getProductName(item, fallbackId) {

    if (!item) {
        return `Product #${fallbackId}`
    }


    return (
        item.product?.name ||
        item.productName ||
        item.name ||
        `Product #${fallbackId}`
    )
}


// ======================================================
// DEFAULT CONFIG
// ======================================================

const DEFAULT_CONFIG = {

    // สินค้าที่มี stock และอายุ < 30 วัน
    // แต่มีการขายแล้ว -> FAST_MOVING
    fastMovingDays: 30,

    // >= 30 วัน และ < 90 วัน
    // -> SLOW_MOVING
    slowMovingDays: 30,

    // >= 90 วัน
    // -> DEAD_STOCK
    deadStockDays: 90,

    // Margin < 10%
    lowMarginPercent: 10,

    // Margin >= 30%
    highMarginPercent: 30

}


// ======================================================
// CREATE EMPTY PRODUCT
// ======================================================

function createProductData(item) {

    const productId =
        getProductId(item)


    const productKey =
        getProductKey(item)


    return {

        key:
            productKey,

        id:
            productId,

        name:
            getProductName(
                item,
                productId
            ),


        // ----------------------------------------------
        // CURRENT STOCK
        // ----------------------------------------------

        stockQuantity:
            0,

        stockValue:
            0,

        stockSaleValue:
            0,

        oldestPurchaseDate:
            null,

        newestPurchaseDate:
            null,


        // ----------------------------------------------
        // SALES
        // ----------------------------------------------

        unitsSold:
            0,

        revenue:
            0,

        cost:
            0

    }

}


// ======================================================
// UPDATE PRODUCT NAME
// ======================================================

function updateProductIdentity(
    data,
    item
) {

    if (!data || !item) {
        return
    }


    const productId =
        getProductId(item)


    if (
        data.id === null ||
        data.id === undefined
    ) {

        data.id =
            productId

    }


    const name =
        getProductName(
            item,
            productId
        )


    if (
        !data.name ||
        data.name.startsWith("Product #")
    ) {

        data.name =
            name

    }

}


// ======================================================
// ADD AVAILABLE STOCK
// ======================================================

function addAvailableStock(
    data,
    item
) {

    if (!data || !item) {
        return
    }


    const status =
        normalizeStatus(
            item.status
        )


    if (status !== "AVAILABLE") {
        return
    }


    const costPrice =
        toNumber(
            item.costPrice
        )


    const salePrice =
        toNumber(
            item.actualSalePrice
        )


    const purchaseDate =
        validDate(
            item.purchaseDate
        )


    data.stockQuantity += 1

    data.stockValue +=
        costPrice

    data.stockSaleValue +=
        salePrice


    if (purchaseDate) {

        if (
            !data.oldestPurchaseDate ||
            purchaseDate <
            data.oldestPurchaseDate
        ) {

            data.oldestPurchaseDate =
                purchaseDate

        }


        if (
            !data.newestPurchaseDate ||
            purchaseDate >
            data.newestPurchaseDate
        ) {

            data.newestPurchaseDate =
                purchaseDate

        }

    }

}


// ======================================================
// ADD SALE
// ======================================================

function addSale(
    data,
    saleItem
) {

    if (!data || !saleItem) {
        return
    }


    const product =
        saleItem.consignmentItem


    const salePrice =
        toNumber(
            saleItem.salePrice
        )


    const costPrice =
        toNumber(
            product?.costPrice
        )


    data.unitsSold += 1

    data.revenue +=
        salePrice

    data.cost +=
        costPrice


    updateProductIdentity(
        data,
        product
    )

}


// ======================================================
// BUILD MOVEMENT
// ======================================================

function getMovement(
    data,
    config
) {

    const stockQuantity =
        toNumber(
            data.stockQuantity
        )


    const unitsSold =
        toNumber(
            data.unitsSold
        )


    // ไม่มี stock
    // จึงไม่ควรเรียก fast/slow/dead stock
    if (stockQuantity <= 0) {

        return unitsSold > 0
            ? "SOLD"
            : "NONE"

    }


    const stockAge =
        data.oldestPurchaseDate
            ? daysBetween(
                data.oldestPurchaseDate
            )
            : 0


    // ----------------------------------------------
    // DEAD STOCK
    // ----------------------------------------------

    if (
        stockAge >=
        config.deadStockDays
    ) {

        return "DEAD_STOCK"

    }


    // ----------------------------------------------
    // SLOW MOVING
    // ----------------------------------------------

    if (
        stockAge >=
        config.slowMovingDays
    ) {

        return "SLOW_MOVING"

    }


    // ----------------------------------------------
    // FAST MOVING
    // ----------------------------------------------
    //
    // ไม่ได้แปลว่า "ขายครั้งเดียว = ขายเร็ว"
    //
    // ในระดับข้อมูล snapshot นี้
    // ถ้ามีการขายและ stock ยังไม่ค้าง
    // จึงจัดเป็น fast-moving แบบ indicative
    //
    // ----------------------------------------------

    if (
        unitsSold > 0
    ) {

        return "FAST_MOVING"

    }


    // ----------------------------------------------
    // NEW STOCK
    // ----------------------------------------------

    return "NEW_STOCK"

}


// ======================================================
// BUILD PERFORMANCE
// ======================================================

function getPerformance(
    data,
    config
) {

    const unitsSold =
        toNumber(
            data.unitsSold
        )


    const revenue =
        toNumber(
            data.revenue
        )


    const cost =
        toNumber(
            data.cost
        )


    const profit =
        revenue -
        cost


    const margin =
        revenue > 0
            ? (
                profit /
                revenue
            ) * 100
            : 0


    // ----------------------------------------------
    // NO SALES
    // ----------------------------------------------

    if (unitsSold === 0) {

        return "NO_SALES"

    }


    // ----------------------------------------------
    // LOSS
    // ----------------------------------------------

    if (profit < 0) {

        return "LOSS"

    }


    // ----------------------------------------------
    // LOW MARGIN
    // ----------------------------------------------

    if (
        margin <
        config.lowMarginPercent
    ) {

        return "LOW_MARGIN"

    }


    // ----------------------------------------------
    // HIGH MARGIN
    // ----------------------------------------------

    if (
        margin >=
        config.highMarginPercent
    ) {

        return "HIGH_MARGIN"

    }


    return "PROFITABLE"

}


// ======================================================
// ANALYZE PRODUCTS
// ======================================================

function analyzeProducts(
    sales = [],
    inventory = [],
    options = {}
) {

    const config = {

        ...DEFAULT_CONFIG,

        ...options

    }


    if (!Array.isArray(sales)) {
        sales = []
    }


    if (!Array.isArray(inventory)) {
        inventory = []
    }


    // ==================================================
    // PRODUCT MAP
    // ==================================================

    const products =
        new Map()


    // ==================================================
    // INVENTORY
    // ==================================================
    //
    // สำคัญ:
    //
    // นับเฉพาะ AVAILABLE
    //
    // SOLD ไม่ถูกนำมานับ unitsSold
    // เพราะยอดขายจริงจะมาจาก Sale
    //
    // ==================================================

    for (const item of inventory) {

        if (!item) {
            continue
        }


        const key =
            getProductKey(item)


        if (!key) {
            continue
        }


        if (!products.has(key)) {

            products.set(
                key,
                createProductData(item)
            )

        }


        const data =
            products.get(key)


        updateProductIdentity(
            data,
            item
        )


        addAvailableStock(
            data,
            item
        )

    }


    // ==================================================
    // SALES
    // ==================================================
    //
    // Sale.items เป็น source of truth
    // สำหรับยอดขาย
    //
    // ห้ามเอา inventory SOLD
    // มาบวกซ้ำ
    //
    // ==================================================

    for (const sale of sales) {

        if (
            !sale ||
            !Array.isArray(
                sale.items
            )
        ) {

            continue

        }


        for (
            const saleItem
            of sale.items
        ) {

            if (!saleItem) {
                continue
            }


            const product =
                saleItem.consignmentItem


            if (!product) {
                continue
            }


            const key =
                getProductKey(product)


            if (!key) {
                continue
            }


            if (!products.has(key)) {

                products.set(
                    key,
                    createProductData(
                        product
                    )
                )

            }


            const data =
                products.get(key)


            addSale(
                data,
                saleItem
            )

        }

    }


    // ==================================================
    // BUILD RESULTS
    // ==================================================

    const result = []


    for (
        const data
        of products.values()
    ) {

        const profit =
            data.revenue -
            data.cost


        const margin =
            data.revenue > 0
                ? (
                    profit /
                    data.revenue
                ) * 100
                : 0


        const averageSalePrice =
            data.unitsSold > 0
                ? data.revenue /
                    data.unitsSold
                : 0


        const averageProfit =
            data.unitsSold > 0
                ? profit /
                    data.unitsSold
                : 0


        const stockAge =
            data.stockQuantity > 0 &&
            data.oldestPurchaseDate
                ? daysBetween(
                    data.oldestPurchaseDate
                )
                : null


        const movement =
            getMovement(
                data,
                config
            )


        const performance =
            getPerformance(
                data,
                config
            )


        result.push({

            id:
                data.id,

            name:
                data.name,

            unitsSold:
                data.unitsSold,

            revenue:
                round(
                    data.revenue
                ),

            cost:
                round(
                    data.cost
                ),

            profit:
                round(
                    profit
                ),

            margin:
                round(
                    margin
                ),

            averageSalePrice:
                round(
                    averageSalePrice
                ),

            averageProfit:
                round(
                    averageProfit
                ),

            stock: {

                quantity:
                    data.stockQuantity,

                costValue:
                    round(
                        data.stockValue
                    ),

                saleValue:
                    round(
                        data.stockSaleValue
                    ),

                stockAgeDays:
                    stockAge,

                oldestPurchaseDate:
                    data.oldestPurchaseDate
                        ? data.oldestPurchaseDate
                            .toISOString()
                        : null,

                newestPurchaseDate:
                    data.newestPurchaseDate
                        ? data.newestPurchaseDate
                            .toISOString()
                        : null

            },

            movement,

            performance

        })

    }


    // ==================================================
    // SORT HELPERS
    // ==================================================

    function sortBy(
        field,
        direction = "desc"
    ) {

        return [...result].sort(
            (a, b) => {

                const aValue =
                    toNumber(
                        a[field]
                    )


                const bValue =
                    toNumber(
                        b[field]
                    )


                return direction === "asc"
                    ? aValue - bValue
                    : bValue - aValue

            }
        )

    }


    // ==================================================
    // BEST SELLER
    // ==================================================

    const bestSeller =
        [...result]
            .filter(
                item =>
                    item.unitsSold > 0
            )
            .sort(
                (a, b) =>
                    b.unitsSold -
                    a.unitsSold
            )
            .slice(
                0,
                10
            )


    // ==================================================
    // WORST SELLER
    // ==================================================

    const worstSeller =
        [...result]
            .filter(
                item =>
                    item.unitsSold > 0
            )
            .sort(
                (a, b) =>
                    a.unitsSold -
                    b.unitsSold
            )
            .slice(
                0,
                10
            )


    // ==================================================
    // HIGHEST PROFIT
    // ==================================================

    const highestProfit =
        [...result]
            .filter(
                item =>
                    item.unitsSold > 0
            )
            .sort(
                (a, b) =>
                    b.profit -
                    a.profit
            )
            .slice(
                0,
                10
            )


    // ==================================================
    // HIGHEST MARGIN
    // ==================================================

    const highestMargin =
        [...result]
            .filter(
                item =>
                    item.unitsSold > 0
            )
            .sort(
                (a, b) =>
                    b.margin -
                    a.margin
            )
            .slice(
                0,
                10
            )


    // ==================================================
    // LOSS MAKING
    // ==================================================

    const lossMaking =
        result
            .filter(
                item =>
                    item.unitsSold > 0 &&
                    item.profit < 0
            )
            .sort(
                (a, b) =>
                    a.profit -
                    b.profit
            )


    // ==================================================
    // LOW MARGIN
    // ==================================================

    const lowMargin =
        result
            .filter(
                item =>
                    item.unitsSold > 0 &&
                    item.profit >= 0 &&
                    item.margin <
                    config.lowMarginPercent
            )
            .sort(
                (a, b) =>
                    a.margin -
                    b.margin
            )


    // ==================================================
    // HIGH MARGIN
    // ==================================================

    const highMargin =
        result
            .filter(
                item =>
                    item.unitsSold > 0 &&
                    item.margin >=
                    config.highMarginPercent
            )
            .sort(
                (a, b) =>
                    b.margin -
                    a.margin
            )


    // ==================================================
    // FAST MOVING
    // ==================================================

    const fastMoving =
        result
            .filter(
                item =>
                    item.movement ===
                    "FAST_MOVING"
            )
            .sort(
                (a, b) =>
                    b.unitsSold -
                    a.unitsSold
            )


    // ==================================================
    // SLOW MOVING
    // ==================================================

    const slowMoving =
        result
            .filter(
                item =>
                    item.movement ===
                    "SLOW_MOVING"
            )
            .sort(
                (a, b) =>
                    b.stock.costValue -
                    a.stock.costValue
            )


    // ==================================================
    // DEAD STOCK
    // ==================================================

    const deadStock =
        result
            .filter(
                item =>
                    item.movement ===
                    "DEAD_STOCK"
            )
            .sort(
                (a, b) =>
                    b.stock.costValue -
                    a.stock.costValue
            )


    // ==================================================
    // NO SALES
    // ==================================================

    const noSales =
        result
            .filter(
                item =>
                    item.unitsSold === 0 &&
                    item.stock.quantity > 0
            )
            .sort(
                (a, b) =>
                    b.stock.costValue -
                    a.stock.costValue
            )


    // ==================================================
    // AGGREGATES
    // ==================================================

    const totalProducts =
        result.length


    const productsWithSales =
        result.filter(
            item =>
                item.unitsSold > 0
        ).length


    const productsWithoutSales =
        result.filter(
            item =>
                item.unitsSold === 0
        ).length


    const totalUnitsSold =
        result.reduce(
            (sum, item) =>
                sum +
                item.unitsSold,
            0
        )


    const totalRevenue =
        result.reduce(
            (sum, item) =>
                sum +
                item.revenue,
            0
        )


    const totalCost =
        result.reduce(
            (sum, item) =>
                sum +
                item.cost,
            0
        )


    const totalProfit =
        result.reduce(
            (sum, item) =>
                sum +
                item.profit,
            0
        )


    const totalStockQuantity =
        result.reduce(
            (sum, item) =>
                sum +
                item.stock.quantity,
            0
        )


    const totalStockValue =
        result.reduce(
            (sum, item) =>
                sum +
                item.stock.costValue,
            0
        )


    const totalStockSaleValue =
        result.reduce(
            (sum, item) =>
                sum +
                item.stock.saleValue,
            0
        )


    const averageMargin =
        totalRevenue > 0
            ? (
                totalProfit /
                totalRevenue
            ) * 100
            : 0


    const averageProfitPerUnit =
        totalUnitsSold > 0
            ? totalProfit /
                totalUnitsSold
            : 0


    // ==================================================
    // RETURN
    // ==================================================

    return {

        // ==================================================
        // SUMMARY
        // ==================================================

        summary: {

            totalProducts,

            productsWithSales,

            productsWithoutSales,

            totalUnitsSold,

            totalRevenue:
                round(
                    totalRevenue
                ),

            totalCost:
                round(
                    totalCost
                ),

            totalProfit:
                round(
                    totalProfit
                ),

            averageMargin:
                round(
                    averageMargin
                ),

            averageProfitPerUnit:
                round(
                    averageProfitPerUnit
                ),

            totalStockQuantity,

            totalStockValue:
                round(
                    totalStockValue
                ),

            totalStockSaleValue:
                round(
                    totalStockSaleValue
                ),

            potentialStockProfit:
                round(
                    totalStockSaleValue -
                    totalStockValue
                )

        },


        // ==================================================
        // ALL PRODUCTS
        // ==================================================

        products:
            result,


        // ==================================================
        // RANKINGS
        // ==================================================

        rankings: {

            bestSeller,

            worstSeller,

            highestProfit,

            highestMargin,

            lossMaking,

            lowMargin,

            highMargin,

            fastMoving,

            slowMoving,

            deadStock,

            noSales

        },


        // ==================================================
        // CONFIG
        // ==================================================

        config: {

            fastMovingDays:
                config.fastMovingDays,

            slowMovingDays:
                config.slowMovingDays,

            deadStockDays:
                config.deadStockDays,

            lowMarginPercent:
                config.lowMarginPercent,

            highMarginPercent:
                config.highMarginPercent

        }

    }

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    analyzeProducts

}
