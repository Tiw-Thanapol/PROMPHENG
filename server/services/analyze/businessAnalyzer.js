// ======================================================
// BUSINESS ANALYZER
// services/analyze/businessAnalyzer.js
// ======================================================
//
// หน้าที่:
//
// แปลงผลวิเคราะห์ระบบ
// ให้เป็น Business Intelligence
//
// ไม่อ่าน DB
// ไม่เรียก AI
// ไม่คำนวณ Transaction
//
// Output:
// - Business Health
// - Growth Opportunity
// - Risk
// - Recommendation
//
// ======================================================


function analyzeBusiness(data = {}) {


    const {
        sales = {},
        profit = {},
        inventory = {},
        product = {},
        trends = {},
        findings = {}
    } = data



    // ==================================================
    // BUSINESS HEALTH
    // ==================================================

    let health = "UNKNOWN"


    const margin =
        Number(
            profit.margin || 0
        )


    if (margin >= 40) {

        health = "GOOD"

    }
    else if (margin >= 20) {

        health = "NORMAL"

    }
    else {

        health = "RISK"

    }



    // ==================================================
    // SALES INSIGHT
    // ==================================================

    const salesInsight = {

        revenue:
            Number(
                sales.revenue || 0
            ),

        orders:
            Number(
                sales.orders || 0
            ),

        averageOrderValue:
            Number(
                sales.averageOrderValue || 0
            )

    }



    // ==================================================
    // PROFIT INSIGHT
    // ==================================================

    const profitInsight = {

        profit:
            Number(
                profit.profit || 0
            ),

        margin,

        status:
            margin >= 30
                ? "Healthy"
                : "Needs Attention"

    }



    // ==================================================
    // PRODUCT OPPORTUNITY
    // ==================================================

    const productInsight = {

        bestProducts:
            product.bestProducts || [],


        slowProducts:
            product.slowProducts || []

    }



    // ==================================================
    // INVENTORY RISK
    // ==================================================

    const inventoryInsight = {

        risk:
            inventory.risk ||
            "UNKNOWN"

    }



    // ==================================================
    // RECOMMENDATIONS
    // ==================================================

    const recommendations = []


    if (
        margin < 30
    ) {

        recommendations.push(
            "ตรวจสอบต้นทุนและราคาขาย"
        )

    }


    if (
        product.slowProducts &&
        product.slowProducts.length > 0
    ) {

        recommendations.push(
            "พิจารณาลด stock สินค้าขายช้า"
        )

    }


    if (
        product.bestProducts &&
        product.bestProducts.length > 0
    ) {

        recommendations.push(
            "เพิ่มโอกาสขายสินค้าขายดี"
        )

    }



    // ==================================================
    // RETURN
    // ==================================================

    return {


        health,


        sales:
            salesInsight,


        profit:
            profitInsight,


        products:
            productInsight,


        inventory:
            inventoryInsight,


        recommendations,


        generatedAt:
            new Date().toISOString()

    }

}



module.exports = {

    analyzeBusiness

}