// ======================================================
// BUSINESS METRICS
// services/analyze/businessMetrics.js
// ======================================================
//
// หน้าที่:
//
// รวม Analyzer Result
// ให้เป็น Business KPI
//
// ไม่อ่าน Database
// ไม่คำนวณ Raw Data
//
// Input:
//
// salesAnalyzer
// profitAnalyzer
// inventoryAnalyzer
// productAnalyzer
// trendAnalyzer
//
// Output:
//
// Business Metrics
//
// ======================================================



// ======================================================
// HELPERS
// ======================================================

function toNumber(value) {

    const number =
        Number(value)


    return Number.isFinite(number)
        ? number
        : 0

}



function round(value,digits=2){

    const factor =
        Math.pow(
            10,
            digits
        )


    return Math.round(
        toNumber(value) * factor
    ) / factor

}



// ======================================================
// SALES KPI
// ======================================================

function buildSalesMetrics(
    sales
){

    if(!sales){
        return {}
    }


    return {

        revenue:
            round(
                sales.customerPayment
            ),


        orders:
            toNumber(
                sales.orders
            ),


        averageOrderValue:
            round(
                sales.averageOrderValue
            ),


        items:
            toNumber(
                sales.items
            ),


        quantity:
            round(
                sales.itemQuantity
            ),


        accountingBalanced:
            sales.accounting?.balanced ?? null

    }

}



// ======================================================
// PROFIT KPI
// ======================================================

function buildProfitMetrics(
    profit
){

    if(!profit){
        return {}
    }


    const summary =
        profit.summary || {}



    return {


        revenue:
            round(
                summary.revenue
            ),


        cost:
            round(
                summary.totalCost
            ),


        profit:
            round(
                summary.profit
            ),


        margin:
            round(
                summary.margin
            ),


        productCost:
            round(
                summary.productCost
            ),


        expense:

            round(
                summary.totalCost -
                summary.productCost
            )


    }

}



// ======================================================
// INVENTORY KPI
// ======================================================

function buildInventoryMetrics(
    inventory
){

    if(!inventory){
        return {}
    }


    const summary =
        inventory.summary || {}



    return {


        stockValue:
            round(
                summary.stockValue
            ),


        stockQuantity:
            round(
                summary.stockQuantity
            ),


        deadStock:

            toNumber(
                summary.deadStockCount
            ),


        slowMoving:

            toNumber(
                summary.slowMovingCount
            )

    }

}



// ======================================================
// PRODUCT KPI
// ======================================================

function buildProductMetrics(
    product
){

    if(!product){
        return {}
    }


    const ranking =
        product.rankings || {}



    return {

        lossMaking:

            Array.isArray(
                ranking.lossMaking
            )
            ?
            ranking.lossMaking.length
            :
            0,


        lowMargin:

            Array.isArray(
                ranking.lowMargin
            )
            ?
            ranking.lowMargin.length
            :
            0,


        fastMoving:

            Array.isArray(
                ranking.fastMoving
            )
            ?
            ranking.fastMoving.length
            :
            0

    }

}



// ======================================================
// TREND KPI
// ======================================================

function buildTrendMetrics(
    trends
){

    if(!trends){
        return {}
    }


    const trend =
        trends.trend || {}



    return {

        revenueGrowth:

            round(
                trend.revenue?.growth
            ),


        profitGrowth:

            round(
                trend.profit?.growth
            )

    }

}



// ======================================================
// MAIN
// ======================================================

function buildBusinessMetrics(
    data={}
){

    return {


        sales:

            buildSalesMetrics(
                data.sales
            ),


        profit:

            buildProfitMetrics(
                data.profit
            ),


        inventory:

            buildInventoryMetrics(
                data.inventory
            ),


        product:

            buildProductMetrics(
                data.product
            ),


        trend:

            buildTrendMetrics(
                data.trends
            )


    }

}



// ======================================================
// EXPORT
// ======================================================

module.exports = {

    buildBusinessMetrics

}