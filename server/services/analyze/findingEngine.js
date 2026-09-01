// ======================================================
// FINDING ENGINE
// services/analyze/findingEngine.js
// ======================================================
//
// หน้าที่:
//
// 1. รับผลจาก Analyzer ต่าง ๆ
// 2. ตรวจหาเหตุการณ์ / สัญญาณสำคัญ
// 3. สร้าง Finding มาตรฐาน
// 4. ส่งต่อให้ AI Analyzer
//
// IMPORTANT
//
// Finding Engine:
// - ไม่อ่าน Database
// - ไม่อ่าน raw orders / products / expenses
// - ไม่คำนวณ business logic จาก database
// - ใช้เฉพาะผลลัพธ์จาก Analyzer
// - ห้ามสร้างตัวเลขทางธุรกิจขึ้นเอง
//
// Analyzer:
//
// - sales
// - profit
// - inventory
// - product
// - trends
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


function round(
    value,
    digits = 2
) {

    const factor =
        Math.pow(
            10,
            digits
        )

    return Math.round(
        toNumber(value) *
        factor
    ) / factor
}


function isArray(value) {

    return Array.isArray(value)

}


function isObject(value) {

    return (
        value !== null &&
        typeof value === "object"
    )

}


// ======================================================
// FINDING FACTORY
// ======================================================

function createFinding({

    code,

    severity,

    title,

    message,

    data = {}

}) {

    return {

        code,

        severity,

        title,

        message,

        data

    }

}


// ======================================================
// SALES FINDINGS
// ======================================================
//
// IMPORTANT
//
// ห้ามถือ growth = 0
// ถ้า analyzer ส่ง null
//
// null = ไม่มี baseline
//
// ======================================================

function analyzeSalesFindings(
    sales,
    trends,
    findings
) {

    if (!isObject(sales)) {
        return
    }


    // ==================================================
    // SALES GROWTH
    // ==================================================

    const rawSalesGrowth =
        sales.growth?.salesGrowth ??
        sales.salesGrowth ??
        trends?.trend?.revenue?.growth ??
        null


    if (
        rawSalesGrowth !== null &&
        rawSalesGrowth !== undefined
    ) {

        const salesGrowth =
            toNumber(
                rawSalesGrowth
            )


        if (salesGrowth > 0) {

            findings.push(

                createFinding({

                    code:
                        "SALES_GROWING",

                    severity:
                        "positive",

                    title:
                        "ยอดขายเพิ่มขึ้น",

                    message:
                        `ยอดขายเพิ่มขึ้น ${round(salesGrowth)}% เมื่อเทียบกับช่วงก่อนหน้า`,

                    data: {

                        salesGrowth:
                            round(salesGrowth)

                    }

                })

            )

        }


        if (salesGrowth < 0) {

            findings.push(

                createFinding({

                    code:
                        "SALES_DECLINING",

                    severity:
                        "warning",

                    title:
                        "ยอดขายลดลง",

                    message:
                        `ยอดขายลดลง ${round(Math.abs(salesGrowth))}% เมื่อเทียบกับช่วงก่อนหน้า`,

                    data: {

                        salesGrowth:
                            round(salesGrowth)

                    }

                })

            )

        }

    }


    // ==================================================
    // ORDER GROWTH
    // ==================================================

    const rawOrderGrowth =
        sales.growth?.orderGrowth ??
        sales.orderGrowth ??
        trends?.trend?.orders?.growth ??
        null


    if (
        rawOrderGrowth !== null &&
        rawOrderGrowth !== undefined
    ) {

        const orderGrowth =
            toNumber(
                rawOrderGrowth
            )


        if (orderGrowth > 0) {

            findings.push(

                createFinding({

                    code:
                        "ORDERS_GROWING",

                    severity:
                        "positive",

                    title:
                        "จำนวนออเดอร์เพิ่มขึ้น",

                    message:
                        `จำนวนออเดอร์เพิ่มขึ้น ${round(orderGrowth)}% เมื่อเทียบกับช่วงก่อนหน้า`,

                    data: {

                        orderGrowth:
                            round(orderGrowth)

                    }

                })

            )

        }


        if (orderGrowth < 0) {

            findings.push(

                createFinding({

                    code:
                        "ORDERS_DECLINING",

                    severity:
                        "warning",

                    title:
                        "จำนวนออเดอร์ลดลง",

                    message:
                        `จำนวนออเดอร์ลดลง ${round(Math.abs(orderGrowth))}% เมื่อเทียบกับช่วงก่อนหน้า`,

                    data: {

                        orderGrowth:
                            round(orderGrowth)

                    }

                })

            )

        }

    }

}


// ======================================================
// PROFIT FINDINGS
// ======================================================

function analyzeProfitFindings(
    profit,
    trends,
    sales,
    findings
) {

    if (!isObject(profit)) {
        return
    }


    // ==================================================
    // PROFIT GROWTH
    // ==================================================

    const rawProfitGrowth =
        profit.growth?.profitGrowth ??
        profit.profitGrowth ??
        trends?.trend?.profit?.growth ??
        null


    if (
        rawProfitGrowth !== null &&
        rawProfitGrowth !== undefined
    ) {

        const profitGrowth =
            toNumber(
                rawProfitGrowth
            )


        if (profitGrowth > 0) {

            findings.push(

                createFinding({

                    code:
                        "PROFIT_GROWING",

                    severity:
                        "positive",

                    title:
                        "กำไรเพิ่มขึ้น",

                    message:
                        `กำไรเพิ่มขึ้น ${round(profitGrowth)}% เมื่อเทียบกับช่วงก่อนหน้า`,

                    data: {

                        profitGrowth:
                            round(profitGrowth)

                    }

                })

            )

        }


        if (profitGrowth < 0) {

            findings.push(

                createFinding({

                    code:
                        "PROFIT_DECLINING",

                    severity:
                        "warning",

                    title:
                        "กำไรลดลง",

                    message:
                        `กำไรลดลง ${round(Math.abs(profitGrowth))}% เมื่อเทียบกับช่วงก่อนหน้า`,

                    data: {

                        profitGrowth:
                            round(profitGrowth)

                    }

                })

            )

        }

    }


    // ==================================================
    // CURRENT PROFIT
    // ==================================================
    //
    // รองรับ schema ปัจจุบัน:
    //
    // profit.summary.profit
    //
    // และ schema เก่า
    //
    // ==================================================

    const netProfit =
        profit.summary?.profit ??
        profit.netProfit ??
        profit.summary?.netProfit ??
        profit.profit ??
        null


    if (
        netProfit !== null &&
        netProfit !== undefined
    ) {

        const currentProfit =
            toNumber(
                netProfit
            )


        // ----------------------------------------------
        // NET LOSS
        // ----------------------------------------------

        if (currentProfit < 0) {

            findings.push(

                createFinding({

                    code:
                        "NET_LOSS",

                    severity:
                        "critical",

                    title:
                        "ผลประกอบการขาดทุน",

                    message:
                        `ผลประกอบการติดลบ ${round(Math.abs(currentProfit))} บาท`,

                    data: {

                        netProfit:
                            round(currentProfit)

                    }

                })

            )

        }

    }


    // ==================================================
    // PROFIT MARGIN
    // ==================================================
    //
    // รองรับ:
    //
    // profit.summary.margin
    // profit.profitMargin
    // profit.summary.profitMargin
    //
    // ==================================================

    const profitMargin =
        profit.summary?.margin ??
        profit.profitMargin ??
        profit.summary?.profitMargin ??
        null


    if (
        profitMargin !== null &&
        profitMargin !== undefined
    ) {

        const margin =
            toNumber(
                profitMargin
            )


        const currentProfit =
            toNumber(
                netProfit
            )


        if (
            currentProfit >= 0 &&
            margin > 0 &&
            margin < 10
        ) {

            findings.push(

                createFinding({

                    code:
                        "LOW_PROFIT_MARGIN",

                    severity:
                        "warning",

                    title:
                        "กำไรมี Margin ต่ำ",

                    message:
                        `กำไรคิดเป็น Margin เพียง ${round(margin)}%`,

                    data: {

                        profitMargin:
                            round(margin),

                        profit:
                            round(currentProfit)

                    }

                })

            )

        }

    }


    // ==================================================
    // SALES UP BUT PROFIT DOWN
    // ==================================================

    const rawSalesGrowth =
        trends?.trend?.revenue?.growth ??
        sales?.growth?.salesGrowth ??
        sales?.salesGrowth ??
        null


    if (
        rawSalesGrowth !== null &&
        rawSalesGrowth !== undefined &&
        rawProfitGrowth !== null &&
        rawProfitGrowth !== undefined
    ) {

        const salesGrowth =
            toNumber(
                rawSalesGrowth
            )

        const profitGrowth =
            toNumber(
                rawProfitGrowth
            )


        if (
            salesGrowth > 0 &&
            profitGrowth < 0
        ) {

            findings.push(

                createFinding({

                    code:
                        "SALES_GROWING_PROFIT_DECLINING",

                    severity:
                        "critical",

                    title:
                        "ยอดขายเพิ่มแต่กำไรลด",

                    message:
                        "ยอดขายเพิ่มขึ้น แต่กำไรกลับลดลง",

                    data: {

                        salesGrowth:
                            round(salesGrowth),

                        profitGrowth:
                            round(profitGrowth)

                    }

                })

            )

        }

    }

}


// ======================================================
// INVENTORY FINDINGS
// ======================================================

function analyzeInventoryFindings(
    inventory,
    findings
) {

    if (!isObject(inventory)) {
        return
    }


    const summary =
        isObject(inventory.summary)
            ? inventory.summary
            : {}


    const analysis =
        isObject(inventory.analysis)
            ? inventory.analysis
            : {}


    const config =
        isObject(inventory.config)
            ? inventory.config
            : {}


    // ==================================================
    // DEAD STOCK
    // ==================================================

    const deadStock =
        isArray(
            analysis.deadStock
        )
            ? analysis.deadStock
            : []


    const deadStockCount =
        toNumber(
            summary.deadStockCount
        )


    const deadStockValue =
        toNumber(
            summary.deadStockValue
        )


    const deadStockPercent =
        toNumber(
            summary.deadStockPercent
        )


    if (
        deadStockCount > 0
    ) {

        const severity =
            deadStockPercent >= 30
                ? "critical"
                : "warning"


        findings.push(

            createFinding({

                code:
                    "DEAD_STOCK",

                severity,

                title:
                    "มีสินค้าค้างสต็อกนาน",

                message:
                    `พบสินค้าค้างสต็อก ${deadStockCount} รายการ มูลค่าต้นทุน ${round(deadStockValue)} บาท`,

                data: {

                    count:
                        deadStockCount,

                    value:
                        round(
                            deadStockValue
                        ),

                    percentage:
                        round(
                            deadStockPercent
                        ),

                    thresholdDays:
                        config.deadStockDays ??
                        null,

                    items:
                        deadStock

                }

            })

        )

    }


    // ==================================================
    // SLOW MOVING
    // ==================================================

    const slowMoving =
        isArray(
            analysis.slowMoving
        )
            ? analysis.slowMoving
            : []


    const slowMovingCount =
        toNumber(
            summary.slowMovingCount
        )


    const slowMovingValue =
        toNumber(
            summary.slowMovingValue
        )


    const slowMovingPercent =
        toNumber(
            summary.slowMovingPercent
        )


    if (
        slowMovingCount > 0
    ) {

        const severity =
            slowMovingPercent >= 30
                ? "warning"
                : "info"


        findings.push(

            createFinding({

                code:
                    "SLOW_MOVING_STOCK",

                severity,

                title:
                    "มีสินค้าที่ขายช้า",

                message:
                    `พบสินค้าที่เคลื่อนไหวช้า ${slowMovingCount} รายการ มูลค่าต้นทุน ${round(slowMovingValue)} บาท`,

                data: {

                    count:
                        slowMovingCount,

                    value:
                        round(
                            slowMovingValue
                        ),

                    percentage:
                        round(
                            slowMovingPercent
                        ),

                    thresholdDays:
                        config.slowMovingDays ??
                        null,

                    items:
                        slowMoving

                }

            })

        )

    }


    // ==================================================
    // MONEY TIED IN STOCK
    // ==================================================

    const stockValue =
        toNumber(
            summary.stockValue
        )


    if (
        stockValue > 0
    ) {

        findings.push(

            createFinding({

                code:
                    "MONEY_TIED_IN_STOCK",

                severity:
                    "info",

                title:
                    "มีเงินทุนอยู่ในสต็อก",

                message:
                    `ปัจจุบันมีต้นทุนสินค้าคงเหลือ ${round(stockValue)} บาท`,

                data: {

                    value:
                        round(stockValue),

                    quantity:
                        toNumber(
                            summary.stockQuantity
                        )

                }

            })

        )

    }


    // ==================================================
    // POTENTIAL STOCK LOSS
    // ==================================================

    const potentialStockProfit =
        toNumber(
            summary.potentialStockProfit
        )


    if (
        potentialStockProfit < 0
    ) {

        findings.push(

            createFinding({

                code:
                    "STOCK_POTENTIAL_LOSS",

                severity:
                    "critical",

                title:
                    "สต็อกมีมูลค่าขายต่ำกว่าต้นทุน",

                message:
                    `มูลค่ากำไรคาดการณ์ของสต็อกติดลบ ${round(Math.abs(potentialStockProfit))} บาท`,

                data: {

                    potentialStockProfit:
                        round(
                            potentialStockProfit
                        )

                }

            })

        )

    }

}


// ======================================================
// PRODUCT FINDINGS
// ======================================================

function analyzeProductFindings(
    product,
    findings
) {

    if (!isObject(product)) {
        return
    }


    const rankings =
        isObject(product.rankings)
            ? product.rankings
            : {}


    const config =
        isObject(product.config)
            ? product.config
            : {}


    // ==================================================
    // LOSS MAKING
    // ==================================================

    const lossMaking =
        isArray(
            rankings.lossMaking
        )
            ? rankings.lossMaking
            : []


    if (
        lossMaking.length > 0
    ) {

        findings.push(

            createFinding({

                code:
                    "LOSS_MAKING_PRODUCT",

                severity:
                    "critical",

                title:
                    "มีสินค้าที่ขายแล้วขาดทุน",

                message:
                    `พบสินค้าที่มีผลกำไรติดลบ ${lossMaking.length} รายการ`,

                data: {

                    count:
                        lossMaking.length,

                    products:
                        lossMaking

                }

            })

        )

    }


    // ==================================================
    // LOW MARGIN
    // ==================================================

    const lowMargin =
        isArray(
            rankings.lowMargin
        )
            ? rankings.lowMargin
            : []


    if (
        lowMargin.length > 0
    ) {

        findings.push(

            createFinding({

                code:
                    "LOW_MARGIN_PRODUCT",

                severity:
                    "warning",

                title:
                    "มีสินค้าที่ Margin ต่ำ",

                message:
                    `พบสินค้าที่มี Margin ต่ำ ${lowMargin.length} รายการ`,

                data: {

                    count:
                        lowMargin.length,

                    thresholdPercent:
                        config.lowMarginPercent ??
                        null,

                    products:
                        lowMargin

                }

            })

        )

    }


    // ==================================================
    // HIGH MARGIN
    // ==================================================
    //
    // IMPORTANT
    //
    // ห้ามใช้:
    //
    // rankings.highestMargin
    //
    // เพราะ highestMargin หมายถึง
    // "เรียงสินค้าที่ margin สูงสุด"
    //
    // ไม่ได้หมายความว่าทุกตัวผ่าน threshold
    //
    // ต้องใช้:
    //
    // rankings.highMargin
    //
    // ซึ่ง Product Analyzer
    // เป็นผู้ filter ด้วย:
    //
    // margin >= highMarginPercent
    //
    // ==================================================

    const highMargin =
        isArray(
            rankings.highMargin
        )
            ? rankings.highMargin
            : []


    if (
        highMargin.length > 0
    ) {

        findings.push(

            createFinding({

                code:
                    "HIGH_MARGIN_PRODUCT",

                severity:
                    "positive",

                title:
                    "มีสินค้าที่ Margin สูง",

                message:
                    `พบสินค้าที่มี Margin สูง ${highMargin.length} รายการ`,

                data: {

                    count:
                        highMargin.length,

                    thresholdPercent:
                        config.highMarginPercent ??
                        null,

                    products:
                        highMargin

                }

            })

        )

    }


    // ==================================================
    // FAST MOVING
    // ==================================================

    const fastMoving =
        isArray(
            rankings.fastMoving
        )
            ? rankings.fastMoving
            : []


    if (
        fastMoving.length > 0
    ) {

        findings.push(

            createFinding({

                code:
                    "FAST_MOVING_PRODUCT",

                severity:
                    "positive",

                title:
                    "มีสินค้าที่เคลื่อนไหวเร็ว",

                message:
                    `พบสินค้าเคลื่อนไหวเร็ว ${fastMoving.length} รายการ`,

                data: {

                    count:
                        fastMoving.length,

                    products:
                        fastMoving

                }

            })

        )

    }


    // ==================================================
    // SLOW MOVING PRODUCT
    // ==================================================

    const slowMoving =
        isArray(
            rankings.slowMoving
        )
            ? rankings.slowMoving
            : []


    if (
        slowMoving.length > 0
    ) {

        findings.push(

            createFinding({

                code:
                    "SLOW_MOVING_PRODUCT",

                severity:
                    "warning",

                title:
                    "มีสินค้าที่ขายช้า",

                message:
                    `พบสินค้า Slow Moving ${slowMoving.length} รายการ`,

                data: {

                    count:
                        slowMoving.length,

                    products:
                        slowMoving

                }

            })

        )

    }


    // ==================================================
    // DEAD STOCK PRODUCT
    // ==================================================

    const deadStock =
        isArray(
            rankings.deadStock
        )
            ? rankings.deadStock
            : []


    if (
        deadStock.length > 0
    ) {

        findings.push(

            createFinding({

                code:
                    "DEAD_STOCK_PRODUCT",

                severity:
                    "warning",

                title:
                    "มีสินค้าที่ค้างสต็อกระดับสินค้า",

                message:
                    `พบสินค้า Dead Stock ${deadStock.length} รายการ`,

                data: {

                    count:
                        deadStock.length,

                    products:
                        deadStock

                }

            })

        )

    }


    // ==================================================
    // NO SALES
    // ==================================================

    const noSales =
        isArray(
            rankings.noSales
        )
            ? rankings.noSales
            : []


    if (
        noSales.length > 0
    ) {

        findings.push(

            createFinding({

                code:
                    "NO_SALES_PRODUCT",

                severity:
                    "info",

                title:
                    "มีสินค้าที่ยังไม่มียอดขาย",

                message:
                    `พบสินค้าที่ยังไม่มียอดขาย ${noSales.length} รายการ`,

                data: {

                    count:
                        noSales.length,

                    products:
                        noSales

                }

            })

        )

    }

}


// ======================================================
// TREND FINDINGS
// ======================================================

function analyzeTrendFindings(
    trends,
    findings
) {

    if (!isObject(trends)) {
        return
    }


    const trend =
        isObject(trends.trend)
            ? trends.trend
            : {}


    // ==================================================
    // REVENUE
    // ==================================================

    const revenueTrend =
        trend.revenue


    if (
        isObject(revenueTrend) &&
        revenueTrend.growth !== null &&
        revenueTrend.growth !== undefined
    ) {

        const growth =
            toNumber(
                revenueTrend.growth
            )


        if (growth > 0) {

            findings.push(

                createFinding({

                    code:
                        "REVENUE_TREND_UP",

                    severity:
                        "positive",

                    title:
                        "รายรับมีแนวโน้มเพิ่มขึ้น",

                    message:
                        `รายรับเพิ่มขึ้น ${round(growth)}% จากช่วงก่อนหน้า`,

                    data: {

                        current:
                            toNumber(
                                revenueTrend.current
                            ),

                        previous:
                            toNumber(
                                revenueTrend.previous
                            ),

                        growth:
                            round(growth),

                        direction:
                            revenueTrend.direction ||
                            "UP"

                    }

                })

            )

        }


        if (growth < 0) {

            findings.push(

                createFinding({

                    code:
                        "REVENUE_TREND_DOWN",

                    severity:
                        "warning",

                    title:
                        "รายรับมีแนวโน้มลดลง",

                    message:
                        `รายรับลดลง ${round(Math.abs(growth))}% จากช่วงก่อนหน้า`,

                    data: {

                        current:
                            toNumber(
                                revenueTrend.current
                            ),

                        previous:
                            toNumber(
                                revenueTrend.previous
                            ),

                        growth:
                            round(growth),

                        direction:
                            revenueTrend.direction ||
                            "DOWN"

                    }

                })

            )

        }

    }


    // ==================================================
    // ORDERS
    // ==================================================

    const ordersTrend =
        trend.orders


    if (
        isObject(ordersTrend) &&
        ordersTrend.growth !== null &&
        ordersTrend.growth !== undefined
    ) {

        const growth =
            toNumber(
                ordersTrend.growth
            )


        if (growth > 0) {

            findings.push(

                createFinding({

                    code:
                        "ORDERS_TREND_UP",

                    severity:
                        "positive",

                    title:
                        "จำนวนออเดอร์มีแนวโน้มเพิ่มขึ้น",

                    message:
                        `จำนวนออเดอร์เพิ่มขึ้น ${round(growth)}% จากช่วงก่อนหน้า`,

                    data: {

                        current:
                            toNumber(
                                ordersTrend.current
                            ),

                        previous:
                            toNumber(
                                ordersTrend.previous
                            ),

                        growth:
                            round(growth)

                    }

                })

            )

        }


        if (growth < 0) {

            findings.push(

                createFinding({

                    code:
                        "ORDERS_TREND_DOWN",

                    severity:
                        "warning",

                    title:
                        "จำนวนออเดอร์มีแนวโน้มลดลง",

                    message:
                        `จำนวนออเดอร์ลดลง ${round(Math.abs(growth))}% จากช่วงก่อนหน้า`,

                    data: {

                        current:
                            toNumber(
                                ordersTrend.current
                            ),

                        previous:
                            toNumber(
                                ordersTrend.previous
                            ),

                        growth:
                            round(growth)

                    }

                })

            )

        }

    }


    // ==================================================
    // PROFIT
    // ==================================================

    const profitTrend =
        trend.profit


    if (
        isObject(profitTrend) &&
        profitTrend.growth !== null &&
        profitTrend.growth !== undefined
    ) {

        const growth =
            toNumber(
                profitTrend.growth
            )


        if (growth > 0) {

            findings.push(

                createFinding({

                    code:
                        "PROFIT_TREND_UP",

                    severity:
                        "positive",

                    title:
                        "กำไรมีแนวโน้มเพิ่มขึ้น",

                    message:
                        `กำไรเพิ่มขึ้น ${round(growth)}% จากช่วงก่อนหน้า`,

                    data: {

                        current:
                            toNumber(
                                profitTrend.current
                            ),

                        previous:
                            toNumber(
                                profitTrend.previous
                            ),

                        growth:
                            round(growth)

                    }

                })

            )

        }


        if (growth < 0) {

            findings.push(

                createFinding({

                    code:
                        "PROFIT_TREND_DOWN",

                    severity:
                        "warning",

                    title:
                        "กำไรมีแนวโน้มลดลง",

                    message:
                        `กำไรลดลง ${round(Math.abs(growth))}% จากช่วงก่อนหน้า`,

                    data: {

                        current:
                            toNumber(
                                profitTrend.current
                            ),

                        previous:
                            toNumber(
                                profitTrend.previous
                            ),

                        growth:
                            round(growth)

                    }

                })

            )

        }

    }


    // ==================================================
    // REVENUE UP + PROFIT DOWN
    // ==================================================

    const revenueGrowth =
        revenueTrend?.growth


    const profitGrowth =
        profitTrend?.growth


    if (
        revenueGrowth !== null &&
        revenueGrowth !== undefined &&
        profitGrowth !== null &&
        profitGrowth !== undefined
    ) {

        const revenueGrowthValue =
            toNumber(
                revenueGrowth
            )

        const profitGrowthValue =
            toNumber(
                profitGrowth
            )


        if (
            revenueGrowthValue > 0 &&
            profitGrowthValue < 0
        ) {

            findings.push(

                createFinding({

                    code:
                        "REVENUE_UP_PROFIT_DOWN",

                    severity:
                        "critical",

                    title:
                        "รายรับเพิ่มแต่กำไรลด",

                    message:
                        "รายรับเพิ่มขึ้น แต่กำไรกลับลดลงในช่วงเวลาเดียวกัน",

                    data: {

                        revenueGrowth:
                            round(
                                revenueGrowthValue
                            ),

                        profitGrowth:
                            round(
                                profitGrowthValue
                            )

                    }

                })

            )

        }

    }

}


// ======================================================
// SHIPPING FINDINGS
// ======================================================
//
// ใช้เฉพาะเมื่อ Analyzer ส่งข้อมูลจริงมา
//
// ห้าม assume field ที่ไม่มี
//
// ======================================================

function analyzeShippingFindings(
    profit,
    findings
) {

    if (!isObject(profit)) {
        return
    }


    const shippingDifference =
        profit.shippingDifference


    if (
        shippingDifference === null ||
        shippingDifference === undefined
    ) {

        return

    }


    const difference =
        toNumber(
            shippingDifference
        )


    if (
        difference < 0
    ) {

        findings.push(

            createFinding({

                code:
                    "SHIPPING_LOSS",

                severity:
                    "warning",

                title:
                    "ค่าส่งทำให้กำไรลดลง",

                message:
                    `ค่าส่งสุทธิสูงกว่าค่าส่งที่เรียกลูกค้า ${round(Math.abs(difference))} บาท`,

                data: {

                    shippingDifference:
                        round(difference),

                    shippingRevenue:
                        toNumber(
                            profit.netShippingRevenue ??
                            profit.shippingRevenue
                        ),

                    shippingExpense:
                        toNumber(
                            profit.shippingExpense
                        )

                }

            })

        )

    }


    if (
        difference > 0
    ) {

        findings.push(

            createFinding({

                code:
                    "SHIPPING_POSITIVE",

                severity:
                    "positive",

                title:
                    "ค่าส่งมีส่วนช่วยเพิ่มกำไร",

                message:
                    `ส่วนต่างค่าส่งเป็นบวก ${round(difference)} บาท`,

                data: {

                    shippingDifference:
                        round(difference)

                }

            })

        )

    }

}


// ======================================================
// EXPENSE FINDINGS
// ======================================================

function analyzeExpenseFindings(
    profit,
    findings
) {

    if (!isObject(profit)) {
        return
    }


    // ==================================================
    // SUPPORT CURRENT PROFIT SCHEMA
    // ==================================================

    const totalExpense =
        profit.totalExpense ??
        profit.summary?.expenses?.total ??
        profit.summary?.orderExpenses?.total ??
        0


    const currentProfit =
        profit.summary?.profit ??
        profit.netProfit ??
        profit.summary?.netProfit ??
        profit.profit ??
        null


    if (
        currentProfit !== null &&
        currentProfit !== undefined
    ) {

        const expense =
            toNumber(
                totalExpense
            )

        const netProfit =
            toNumber(
                currentProfit
            )


        if (
            expense > 0 &&
            netProfit > 0 &&
            expense > netProfit
        ) {

            findings.push(

                createFinding({

                    code:
                        "EXPENSE_HIGH",

                    severity:
                        "warning",

                    title:
                        "ค่าใช้จ่ายมีสัดส่วนสูงเมื่อเทียบกับกำไร",

                    message:
                        `ค่าใช้จ่ายรวม ${round(expense)} บาท สูงกว่ากำไร ${round(netProfit)} บาท`,

                    data: {

                        totalExpense:
                            round(expense),

                        profit:
                            round(netProfit)

                    }

                })

            )

        }

    }


    // ==================================================
    // UNKNOWN EXPENSE
    // ==================================================

    const unknownExpense =
        profit.unknownExpense


    if (
        unknownExpense !== null &&
        unknownExpense !== undefined
    ) {

        const value =
            toNumber(
                unknownExpense
            )


        if (
            value > 0
        ) {

            findings.push(

                createFinding({

                    code:
                        "UNKNOWN_EXPENSE",

                    severity:
                        "warning",

                    title:
                        "พบค่าใช้จ่ายที่ไม่ระบุประเภท",

                    message:
                        `พบค่าใช้จ่ายที่ไม่สามารถจัดหมวดหมู่ได้ ${round(value)} บาท`,

                    data: {

                        value:
                            round(value)

                    }

                })

            )

        }

    }

}


// ======================================================
// REMOVE DUPLICATES
// ======================================================

function removeDuplicateFindings(
    findings
) {

    const seen =
        new Set()


    return findings.filter(
        finding => {

            if (
                !finding ||
                !finding.code
            ) {

                return false

            }


            if (
                seen.has(
                    finding.code
                )
            ) {

                return false

            }


            seen.add(
                finding.code
            )


            return true

        }
    )

}


// ======================================================
// SORT FINDINGS
// ======================================================

function sortFindings(
    findings
) {

    const priority = {

        critical: 1,

        warning: 2,

        positive: 3,

        info: 4

    }


    return [...findings].sort(
        (a, b) => {

            const aPriority =
                priority[
                    a.severity
                ] || 99


            const bPriority =
                priority[
                    b.severity
                ] || 99


            return (
                aPriority -
                bPriority
            )

        }
    )

}


// ======================================================
// MAIN
// ======================================================

function generateFindings(
    data = {}
) {

    const findings = []


    // ==================================================
    // INPUT
    // ==================================================

    const sales =
        data.sales ||
        null


    const profit =
        data.profit ||
        null


    const inventory =
        data.inventory ||
        null


    const product =
        data.product ||
        data.products ||
        null


    const trends =
        data.trends ||
        null


    // ==================================================
    // ANALYZERS
    // ==================================================

    analyzeSalesFindings(
        sales,
        trends,
        findings
    )


    analyzeProfitFindings(
        profit,
        trends,
        sales,
        findings
    )


    analyzeInventoryFindings(
        inventory,
        findings
    )


    analyzeProductFindings(
        product,
        findings
    )


    analyzeTrendFindings(
        trends,
        findings
    )


    analyzeShippingFindings(
        profit,
        findings
    )


    analyzeExpenseFindings(
        profit,
        findings
    )


    // ==================================================
    // CLEAN
    // ==================================================

    const uniqueFindings =
        removeDuplicateFindings(
            findings
        )


    const sortedFindings =
        sortFindings(
            uniqueFindings
        )


    // ==================================================
    // SUMMARY
    // ==================================================

    const critical =
        sortedFindings.filter(
            finding =>
                finding.severity ===
                "critical"
        ).length


    const warning =
        sortedFindings.filter(
            finding =>
                finding.severity ===
                "warning"
        ).length


    const positive =
        sortedFindings.filter(
            finding =>
                finding.severity ===
                "positive"
        ).length


    const info =
        sortedFindings.filter(
            finding =>
                finding.severity ===
                "info"
        ).length


    // ==================================================
    // RETURN
    // ==================================================

    return {

        total:
            sortedFindings.length,

        critical,

        warning,

        positive,

        info,

        items:
            sortedFindings

    }

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    generateFindings,

    createFinding

}