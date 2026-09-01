// ======================================================
// INVENTORY ANALYZER
// services/analyze/inventoryAnalyzer.js
// ======================================================
//
// วิเคราะห์ Inventory / Stock
//
// วิเคราะห์:
// - Stock Quantity
// - Stock Value
// - Available Value
// - Sold Value
// - Dead Stock
// - Slow Moving Stock
// - Inventory Turnover
// - Stock Age
//
// IMPORTANT:
// Analyzer นี้ไม่แก้ Database
// รับ ConsignmentItem[] -> วิเคราะห์ -> คืนผลลัพธ์
//
// ตาม Schema ปัจจุบัน:
//
// ConsignmentItem
// - costPrice
// - actualSalePrice
// - status
// - purchaseDate
// - soldAt
//
// ======================================================


// ======================================================
// HELPERS
// ======================================================

function toNumber(value) {

    return Number(value || 0)

}


function round(value, digits = 2) {

    const factor =
        Math.pow(10, digits)

    return Math.round(
        (Number(value) || 0) * factor
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
// DEFAULT CONFIG
// ======================================================

const DEFAULT_CONFIG = {

    // สินค้าที่อยู่ใน Stock
    // >= 30 วัน ถือว่าเริ่มช้า
    slowMovingDays: 30,

    // >= 90 วัน ถือว่า Dead Stock
    deadStockDays: 90

}


// ======================================================
// ANALYZE INVENTORY
// ======================================================

function analyzeInventory(
    inventory = [],
    options = {}
) {

    const config = {

        ...DEFAULT_CONFIG,

        ...options

    }


    if (!Array.isArray(inventory)) {

        inventory = []

    }


    // ==================================================
    // SUMMARY COUNTERS
    // ==================================================

    let totalItems = 0

    let availableItems = 0

    let soldItems = 0

    let cancelledItems = 0


    let stockValue = 0

    let availableValue = 0

    let soldValue = 0

    let cancelledValue = 0


    let availableSaleValue = 0


    // ==================================================
    // ANALYSIS ARRAYS
    // ==================================================

    const availableStock = []

    const soldStock = []

    const cancelledStock = []

    const slowMovingStock = []

    const deadStock = []


    // ==================================================
    // PROCESS EACH ITEM
    // ==================================================

    for (const item of inventory) {

        if (!item) {
            continue
        }


        const id =
            Number(item.id)


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            continue

        }


        const status =
            normalizeStatus(
                item.status
            )


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


        const soldAt =
            validDate(
                item.soldAt
            )


        totalItems += 1


        // ==================================================
        // COMMON ITEM DATA
        // ==================================================

        const baseItem = {

            id,

            name:
                item.name ||
                `Product #${id}`,

            ownerId:
                item.ownerId ?? null,

            status,

            costPrice:
                round(
                    costPrice
                ),

            actualSalePrice:
                round(
                    salePrice
                ),

            purchaseDate:
                purchaseDate
                    ? purchaseDate.toISOString()
                    : null,

            soldAt:
                soldAt
                    ? soldAt.toISOString()
                    : null

        }


        // ==================================================
        // AVAILABLE
        // ==================================================

        if (status === "AVAILABLE") {

            availableItems += 1


            availableValue +=
                costPrice


            stockValue +=
                costPrice


            availableSaleValue +=
                salePrice


            const stockAge =
                daysBetween(
                    purchaseDate
                )


            const analyzedItem = {

                ...baseItem,

                stockAgeDays:
                    stockAge,

                stockCostValue:
                    round(
                        costPrice
                    ),

                stockSaleValue:
                    round(
                        salePrice
                    )

            }


            availableStock.push(
                analyzedItem
            )


            // ==============================================
            // DEAD STOCK
            // ==============================================

            if (
                stockAge >=
                config.deadStockDays
            ) {

                deadStock.push(
                    analyzedItem
                )

            }


            // ==============================================
            // SLOW MOVING
            // ==============================================

            else if (
                stockAge >=
                config.slowMovingDays
            ) {

                slowMovingStock.push(
                    analyzedItem
                )

            }

        }


        // ==================================================
        // SOLD
        // ==================================================

        else if (status === "SOLD") {

            soldItems += 1


            soldValue +=
                costPrice


            stockValue +=
                costPrice


            const holdingDays =
                purchaseDate &&
                soldAt
                    ? daysBetween(
                        purchaseDate,
                        soldAt
                    )
                    : 0


            soldStock.push({

                ...baseItem,

                holdingDays,

                costValue:
                    round(
                        costPrice
                    ),

                saleValue:
                    round(
                        salePrice
                    )

            })

        }


        // ==================================================
        // CANCELLED
        // ==================================================

        else if (
            status === "CANCELLED"
        ) {

            cancelledItems += 1


            cancelledValue +=
                costPrice


            stockValue +=
                costPrice


            cancelledStock.push({

                ...baseItem,

                costValue:
                    round(
                        costPrice
                    )

            })

        }

    }


    // ==================================================
    // DEAD STOCK VALUE
    // ==================================================

    const deadStockValue =
        deadStock.reduce(

            (sum, item) =>
                sum +
                item.stockCostValue,

            0

        )


    // ==================================================
    // DEAD STOCK SALE VALUE
    // ==================================================

    const deadStockSaleValue =
        deadStock.reduce(

            (sum, item) =>
                sum +
                item.stockSaleValue,

            0

        )


    // ==================================================
    // SLOW MOVING VALUE
    // ==================================================

    const slowMovingValue =
        slowMovingStock.reduce(

            (sum, item) =>
                sum +
                item.stockCostValue,

            0

        )


    // ==================================================
    // SLOW MOVING SALE VALUE
    // ==================================================

    const slowMovingSaleValue =
        slowMovingStock.reduce(

            (sum, item) =>
                sum +
                item.stockSaleValue,

            0

        )


    // ==================================================
    // TOTAL POTENTIAL STOCK PROFIT
    // ==================================================
    //
    // ยังไม่ใช่กำไรจริง
    //
    // เป็นกำไรที่คาดการณ์จาก:
    //
    // ราคาขายปัจจุบัน
    // -
    // ต้นทุน
    //
    // เฉพาะ AVAILABLE
    //
    // ==================================================

    const potentialStockProfit =
        availableSaleValue -
        availableValue


    // ==================================================
    // INVENTORY TURNOVER
    // ==================================================
    //
    // สูตรพื้นฐาน:
    //
    // Cost of Goods Sold
    // /
    // Average Inventory Value
    //
    // แต่ตอนนี้ Analyzer ได้ข้อมูล
    // Inventory snapshot ปัจจุบันเป็นหลัก
    //
    // จึงใช้:
    //
    // Sold Cost
    // /
    // Current Available Cost
    //
    // เป็นค่า indicative
    //
    // ไม่เรียกว่า accounting turnover แบบเต็ม
    //
    // ==================================================

    const inventoryTurnover =
        availableValue > 0
            ? soldValue /
                availableValue
            : 0


    // ==================================================
    // STOCK TURNOVER PERCENT
    // ==================================================

    const stockTurnoverPercent =
        totalItems > 0
            ? (
                soldItems /
                totalItems
            ) * 100
            : 0


    // ==================================================
    // DEAD STOCK PERCENT
    // ==================================================

    const deadStockPercent =
        availableItems > 0
            ? (
                deadStock.length /
                availableItems
            ) * 100
            : 0


    // ==================================================
    // SLOW STOCK PERCENT
    // ==================================================

    const slowMovingPercent =
        availableItems > 0
            ? (
                slowMovingStock.length /
                availableItems
            ) * 100
            : 0


    // ==================================================
    // STOCK AGE ANALYSIS
    // ==================================================

    let totalStockAge = 0

    let oldestStockAge = 0

    let newestStockAge = 0


    for (const item of availableStock) {

        const age =
            Number(
                item.stockAgeDays || 0
            )


        totalStockAge +=
            age


        if (
            age >
            oldestStockAge
        ) {

            oldestStockAge =
                age

        }


        if (
            availableStock.length === 1 ||
            age < newestStockAge ||
            newestStockAge === 0
        ) {

            newestStockAge =
                age

        }

    }


    const averageStockAge =
        availableItems > 0
            ? totalStockAge /
                availableItems
            : 0


    // ==================================================
    // SORT
    // ==================================================

    slowMovingStock.sort(

        (a, b) =>
            b.stockCostValue -
            a.stockCostValue

    )


    deadStock.sort(

        (a, b) =>
            b.stockCostValue -
            a.stockCostValue

    )


    availableStock.sort(

        (a, b) =>
            b.stockAgeDays -
            a.stockAgeDays

    )


    soldStock.sort(

        (a, b) =>
            b.holdingDays -
            a.holdingDays

    )


    cancelledStock.sort(

        (a, b) =>
            b.costValue -
            a.costValue

    )


    // ==================================================
    // RETURN
    // ==================================================

    return {

        // ==================================================
        // SUMMARY
        // ==================================================

        summary: {

            totalItems,

            availableItems,

            soldItems,

            cancelledItems,

            stockQuantity:
                availableItems,

            stockValue:
                round(
                    availableValue
                ),

            availableValue:
                round(
                    availableValue
                ),

            soldValue:
                round(
                    soldValue
                ),

            cancelledValue:
                round(
                    cancelledValue
                ),

            availableSaleValue:
                round(
                    availableSaleValue
                ),

            potentialStockProfit:
                round(
                    potentialStockProfit
                ),

            inventoryTurnover:
                round(
                    inventoryTurnover
                ),

            stockTurnoverPercent:
                round(
                    stockTurnoverPercent
                ),

            deadStockCount:
                deadStock.length,

            deadStockValue:
                round(
                    deadStockValue
                ),

            deadStockSaleValue:
                round(
                    deadStockSaleValue
                ),

            deadStockPercent:
                round(
                    deadStockPercent
                ),

            slowMovingCount:
                slowMovingStock.length,

            slowMovingValue:
                round(
                    slowMovingValue
                ),

            slowMovingSaleValue:
                round(
                    slowMovingSaleValue
                ),

            slowMovingPercent:
                round(
                    slowMovingPercent
                ),

            averageStockAgeDays:
                round(
                    averageStockAge
                ),

            oldestStockAgeDays:
                oldestStockAge,

            newestStockAgeDays:
                newestStockAge

        },


        // ==================================================
        // STOCK LISTS
        // ==================================================

        stock: {

            available:
                availableStock,

            sold:
                soldStock,

            cancelled:
                cancelledStock

        },


        // ==================================================
        // SPECIAL ANALYSIS
        // ==================================================

        analysis: {

            slowMoving:
                slowMovingStock,

            deadStock:
                deadStock

        },


        // ==================================================
        // CONFIG
        // ==================================================

        config: {

            slowMovingDays:
                config.slowMovingDays,

            deadStockDays:
                config.deadStockDays

        }

    }

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    analyzeInventory
}