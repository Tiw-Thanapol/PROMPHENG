const {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    subDays,
    subWeeks,
    subMonths,
    subYears
} = require("date-fns")


// ======================================================
// TREND ANALYZER
// services/analyze/trendAnalyzer.js
// ======================================================
//
// วิเคราะห์ Trend:
//
// - Revenue / เงินเข้า
// - Orders
// - Items
// - Profit
// - Shipping Revenue
// - Discount
//
// BUSINESS RULE
// ------------------------------------------------------
//
// Revenue
// = order.totalAmount
// = เงินที่ลูกค้าจ่ายจริง
//
// Shipping Revenue
// = order.shippingCost
// = ค่าส่งที่เรียกลูกค้า
//
// Discount
// = order.discount
//
// Profit
// = profitAnalyzer.orderResults
//
// IMPORTANT
// ------------------------------------------------------
// 1. Analyzer นี้ไม่แก้ Database
// 2. Analyzer นี้ไม่เรียก AI
// 3. ไม่ปัดเศษระหว่าง calculation
// 4. ปัดเฉพาะค่าที่ return
// 5. Order ที่นำมาคำนวณต้องมี status = COMPLETED
// 6. Profit ใช้ profitAnalyzer.orderResults
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


    if (typeof value === "number") {

        return Number.isFinite(value)
            ? value
            : 0

    }


    if (typeof value === "string") {

        const cleaned =
            value
                .replace(/,/g, "")
                .trim()


        if (cleaned === "") {
            return 0
        }


        const number =
            Number(cleaned)


        return Number.isFinite(number)
            ? number
            : 0

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

    const number =
        toNumber(value)


    const factor =
        Math.pow(
            10,
            digits
        )


    return Math.round(
        (
            number +
            Number.EPSILON
        ) *
        factor
    ) / factor

}


// ======================================================
// VALID DATE
// ======================================================

function validDate(value) {

    if (!value) {
        return null
    }


    const date =
        value instanceof Date
            ? new Date(
                value.getTime()
            )
            : new Date(value)


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null
    }


    return date

}


// ======================================================
// PERIOD NORMALIZATION
// ======================================================

function normalizePeriod(period) {

    const value =
        String(
            period || "MONTH"
        )
            .trim()
            .toUpperCase()


    const allowed = [
        "DAY",
        "WEEK",
        "MONTH",
        "YEAR",
        "ALL"
    ]


    if (
        !allowed.includes(value)
    ) {
        return "MONTH"
    }


    return value

}


// ======================================================
// PERCENTAGE CHANGE
// ======================================================

function percentageChange(
    current,
    previous
) {

    current =
        toNumber(current)

    previous =
        toNumber(previous)


    if (previous === 0) {

        if (current === 0) {
            return 0
        }

        return null

    }


    return round(
        (
            (
                current -
                previous
            ) /
            Math.abs(previous)
        ) *
        100
    )

}


// ======================================================
// DIRECTION
// ======================================================

function getDirection(change) {

    if (change === null) {
        return "NO_BASELINE"
    }


    if (change > 0) {
        return "UP"
    }


    if (change < 0) {
        return "DOWN"
    }


    return "FLAT"

}


// ======================================================
// GET PERIOD RANGE
// ======================================================

function getPeriodRange(
    period,
    referenceDate
) {

    const date =
        validDate(
            referenceDate
        ) || new Date()


    switch (period) {

        // ------------------------------------------------
        // DAY
        // ------------------------------------------------

        case "DAY": {

            const previousDate =
                subDays(
                    date,
                    1
                )


            return {

                current: {

                    start:
                        startOfDay(
                            date
                        ),

                    end:
                        endOfDay(
                            date
                        )

                },

                previous: {

                    start:
                        startOfDay(
                            previousDate
                        ),

                    end:
                        endOfDay(
                            previousDate
                        )

                }

            }

        }


        // ------------------------------------------------
        // WEEK
        // ------------------------------------------------

        case "WEEK": {

            const previousDate =
                subWeeks(
                    date,
                    1
                )


            return {

                current: {

                    start:
                        startOfWeek(
                            date,
                            {
                                weekStartsOn: 1
                            }
                        ),

                    end:
                        endOfWeek(
                            date,
                            {
                                weekStartsOn: 1
                            }
                        )

                },

                previous: {

                    start:
                        startOfWeek(
                            previousDate,
                            {
                                weekStartsOn: 1
                            }
                        ),

                    end:
                        endOfWeek(
                            previousDate,
                            {
                                weekStartsOn: 1
                            }
                        )

                }

            }

        }


        // ------------------------------------------------
        // YEAR
        // ------------------------------------------------

        case "YEAR": {

            const previousDate =
                subYears(
                    date,
                    1
                )


            return {

                current: {

                    start:
                        startOfYear(
                            date
                        ),

                    end:
                        endOfYear(
                            date
                        )

                },

                previous: {

                    start:
                        startOfYear(
                            previousDate
                        ),

                    end:
                        endOfYear(
                            previousDate
                        )

                }

            }

        }


        // ------------------------------------------------
        // ALL
        // ------------------------------------------------

        case "ALL":

            return {

                current: {

                    start: null,
                    end: null

                },

                previous: {

                    start: null,
                    end: null

                }

            }


        // ------------------------------------------------
        // MONTH
        // ------------------------------------------------

        case "MONTH":
        default: {

            const previousDate =
                subMonths(
                    date,
                    1
                )


            return {

                current: {

                    start:
                        startOfMonth(
                            date
                        ),

                    end:
                        endOfMonth(
                            date
                        )

                },

                previous: {

                    start:
                        startOfMonth(
                            previousDate
                        ),

                    end:
                        endOfMonth(
                            previousDate
                        )

                }

            }

        }

    }

}


// ======================================================
// RANGE CHECK
// ======================================================

function isInRange(
    date,
    range
) {

    if (
        !range.start &&
        !range.end
    ) {
        return true
    }


    const value =
        validDate(
            date
        )


    if (!value) {
        return false
    }


    return (
        value >= range.start &&
        value <= range.end
    )

}


// ======================================================
// ITEM COUNT
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

function getItemCount(order) {

    if (
        !Array.isArray(
            order?.items
        )
    ) {
        return 0
    }


    let count = 0


    for (
        const item
        of order.items
    ) {

        if (!item) {
            continue
        }


        if (
            item.quantity === undefined ||
            item.quantity === null ||
            item.quantity === ""
        ) {

            count += 1

            continue

        }


        const quantity =
            toNumber(
                item.quantity
            )


        if (quantity > 0) {

            count += quantity

        }

    }


    return count

}


// ======================================================
// PROFIT MAP
// ======================================================

function createProfitMap(
    profitAnalysis
) {

    const map =
        new Map()


    const results =
        Array.isArray(
            profitAnalysis?.orderResults
        )
            ? profitAnalysis.orderResults
            : []


    for (
        const result
        of results
    ) {

        if (!result) {
            continue
        }


        if (
            result.orderId === null ||
            result.orderId === undefined
        ) {
            continue
        }


        map.set(
            String(
                result.orderId
            ),
            result
        )

    }


    return map

}


// ======================================================
// GET ORDER PROFIT
// ======================================================
//
// รองรับ Profit Analyzer ทั้ง 2 รูปแบบ:
//
// ใหม่:
// result.profit
//
// เดิม:
// result.netProfit
//
// ใช้ profit ก่อน
//
// ======================================================

function getOrderProfit(
    profitResult
) {

    if (!profitResult) {
        return 0
    }


    if (
        profitResult.profit !== undefined &&
        profitResult.profit !== null
    ) {

        return toNumber(
            profitResult.profit
        )

    }


    if (
        profitResult.netProfit !== undefined &&
        profitResult.netProfit !== null
    ) {

        return toNumber(
            profitResult.netProfit
        )

    }


    return 0

}


// ======================================================
// CALCULATE PERIOD
// ======================================================

function calculatePeriod(
    orders,
    range,
    profitMap
) {

    let revenue = 0

    let ordersCount = 0

    let items = 0

    let shippingRevenue = 0

    let discount = 0

    let profit = 0


    for (
        const order
        of orders
    ) {

        if (!order) {
            continue
        }


        // ------------------------------------------------
        // STATUS
        // ------------------------------------------------

        const status =
            String(
                order.status || ""
            )
                .trim()
                .toUpperCase()


        if (
            status !== "COMPLETED"
        ) {
            continue
        }


        // ------------------------------------------------
        // DATE
        // ------------------------------------------------

        if (
            !isInRange(
                order.createdAt,
                range
            )
        ) {
            continue
        }


        // ------------------------------------------------
        // ORDER
        // ------------------------------------------------

        ordersCount += 1


        // ------------------------------------------------
        // REVENUE
        // ------------------------------------------------
        //
        // ยอดเข้าเงินจริง
        //
        // ไม่คำนวณใหม่จาก
        // productRevenue + shippingRevenue
        //
        // ------------------------------------------------

        revenue +=
            toNumber(
                order.totalAmount
            )


        // ------------------------------------------------
        // ITEMS
        // ------------------------------------------------

        items +=
            getItemCount(
                order
            )


        // ------------------------------------------------
        // SHIPPING REVENUE
        // ------------------------------------------------

        shippingRevenue +=
            toNumber(
                order.shippingCost
            )


        // ------------------------------------------------
        // DISCOUNT
        // ------------------------------------------------

        discount +=
            toNumber(
                order.discount
            )


        // ------------------------------------------------
        // PROFIT
        // ------------------------------------------------

        const profitResult =
            profitMap.get(
                String(
                    order.id
                )
            )


        if (profitResult) {

            profit +=
                getOrderProfit(
                    profitResult
                )

        }

    }


    // ==================================================
    // AVERAGES
    // ==================================================

    const averageOrderValue =
        ordersCount > 0
            ? revenue /
              ordersCount
            : 0


    const averageItemsPerOrder =
        ordersCount > 0
            ? items /
              ordersCount
            : 0


    // ==================================================
    // RETURN
    // ==================================================

    return {

        revenue:
            round(
                revenue
            ),

        orders:
            ordersCount,

        items:
            round(
                items
            ),

        shippingRevenue:
            round(
                shippingRevenue
            ),

        discount:
            round(
                discount
            ),

        profit:
            round(
                profit
            ),

        averageOrderValue:
            round(
                averageOrderValue
            ),

        averageItemsPerOrder:
            round(
                averageItemsPerOrder
            )

    }

}


// ======================================================
// BUILD TREND
// ======================================================

function buildTrend(
    current,
    previous
) {

    const revenueGrowth =
        percentageChange(
            current.revenue,
            previous.revenue
        )


    const orderGrowth =
        percentageChange(
            current.orders,
            previous.orders
        )


    const itemGrowth =
        percentageChange(
            current.items,
            previous.items
        )


    const profitGrowth =
        percentageChange(
            current.profit,
            previous.profit
        )


    const aovGrowth =
        percentageChange(
            current.averageOrderValue,
            previous.averageOrderValue
        )


    return {

        revenue: {

            current:
                current.revenue,

            previous:
                previous.revenue,

            growth:
                revenueGrowth,

            direction:
                getDirection(
                    revenueGrowth
                )

        },

        orders: {

            current:
                current.orders,

            previous:
                previous.orders,

            growth:
                orderGrowth,

            direction:
                getDirection(
                    orderGrowth
                )

        },

        items: {

            current:
                current.items,

            previous:
                previous.items,

            growth:
                itemGrowth,

            direction:
                getDirection(
                    itemGrowth
                )

        },

        profit: {

            current:
                current.profit,

            previous:
                previous.profit,

            growth:
                profitGrowth,

            direction:
                getDirection(
                    profitGrowth
                )

        },

        averageOrderValue: {

            current:
                current.averageOrderValue,

            previous:
                previous.averageOrderValue,

            growth:
                aovGrowth,

            direction:
                getDirection(
                    aovGrowth
                )

        }

    }

}


// ======================================================
// DAILY BREAKDOWN
// ======================================================

function buildDailyTrend(
    orders,
    start,
    end,
    profitMap
) {

    const result = []


    if (
        !start ||
        !end
    ) {
        return result
    }


    let cursor =
        startOfDay(
            start
        )


    const finalDay =
        startOfDay(
            end
        )


    while (
        cursor <= finalDay
    ) {

        const dayStart =
            startOfDay(
                cursor
            )


        const dayEnd =
            endOfDay(
                cursor
            )


        const data =
            calculatePeriod(

                orders,

                {
                    start:
                        dayStart,

                    end:
                        dayEnd

                },

                profitMap

            )


        result.push({

            date:
                dayStart.toISOString(),

            revenue:
                data.revenue,

            orders:
                data.orders,

            items:
                data.items,

            shippingRevenue:
                data.shippingRevenue,

            discount:
                data.discount,

            profit:
                data.profit

        })


        cursor =
            subDays(
                cursor,
                -1
            )

    }


    return result

}


// ======================================================
// MONTHLY BREAKDOWN
// ======================================================

function buildMonthlyTrend(
    orders,
    year,
    profitMap
) {

    const result = []


    for (
        let month = 0;
        month < 12;
        month++
    ) {

        const date =
            new Date(
                year,
                month,
                1
            )


        const data =
            calculatePeriod(

                orders,

                {
                    start:
                        startOfMonth(
                            date
                        ),

                    end:
                        endOfMonth(
                            date
                        )

                },

                profitMap

            )


        result.push({

            month:
                month + 1,

            year,

            revenue:
                data.revenue,

            orders:
                data.orders,

            items:
                data.items,

            shippingRevenue:
                data.shippingRevenue,

            discount:
                data.discount,

            profit:
                data.profit

        })

    }


    return result

}


// ======================================================
// MAIN
// ======================================================
//
// Engine เรียก:
//
// analyzeTrends(
//     orders,
//     options
// )
//
// ======================================================

function analyzeTrends(
    orders = [],
    options = {}
) {

    if (!Array.isArray(orders)) {
        orders = []
    }


    // ==================================================
    // INPUT
    // ==================================================

    const period =
        normalizePeriod(
            options.period
        )


    const referenceDate =
        validDate(
            options.referenceDate
        ) || new Date()


    const includeDaily =
        options.includeDaily === true


    const includeMonthly =
        options.includeMonthly === true


    const profitAnalysis =
        options.profitAnalysis || {}


    // ==================================================
    // PROFIT MAP
    // ==================================================

    const profitMap =
        createProfitMap(
            profitAnalysis
        )


    // ==================================================
    // PERIOD RANGE
    // ==================================================

    const ranges =
        getPeriodRange(
            period,
            referenceDate
        )


    // ==================================================
    // CURRENT
    // ==================================================

    const current =
        calculatePeriod(

            orders,

            ranges.current,

            profitMap

        )


    // ==================================================
    // PREVIOUS
    // ==================================================

    const previous =
        period === "ALL"

            ? {

                revenue: 0,
                orders: 0,
                items: 0,
                shippingRevenue: 0,
                discount: 0,
                profit: 0,
                averageOrderValue: 0,
                averageItemsPerOrder: 0

            }

            : calculatePeriod(

                orders,

                ranges.previous,

                profitMap

            )


    // ==================================================
    // TREND
    // ==================================================

    const trend =
        buildTrend(
            current,
            previous
        )


    // ==================================================
    // DAILY
    // ==================================================

    let daily = []


    if (
        includeDaily &&
        ranges.current.start &&
        ranges.current.end
    ) {

        daily =
            buildDailyTrend(

                orders,

                ranges.current.start,

                ranges.current.end,

                profitMap

            )

    }


    // ==================================================
    // MONTHLY
    // ==================================================

    let monthly = []


    if (
        includeMonthly
    ) {

        monthly =
            buildMonthlyTrend(

                orders,

                referenceDate.getFullYear(),

                profitMap

            )

    }


    // ==================================================
    // RETURN
    // ==================================================

    return {

        period,

        referenceDate:
            referenceDate.toISOString(),


        range: {

            current: {

                start:
                    ranges.current.start
                        ? ranges.current.start.toISOString()
                        : null,

                end:
                    ranges.current.end
                        ? ranges.current.end.toISOString()
                        : null

            },

            previous: {

                start:
                    ranges.previous.start
                        ? ranges.previous.start.toISOString()
                        : null,

                end:
                    ranges.previous.end
                        ? ranges.previous.end.toISOString()
                        : null

            }

        },


        current,

        previous,

        trend,


        breakdown: {

            daily,

            monthly

        }

    }

}


// ======================================================
// EXPORT
// ======================================================

module.exports =
    analyzeTrends