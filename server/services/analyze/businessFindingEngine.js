// ======================================================
// BUSINESS FINDING ENGINE
// services/analyze/businessFindingEngine.js
// ======================================================



function createBusinessFinding({

    code,

    severity,

    title,

    message,

    data={}

}){


    return {

        code,

        severity,

        title,

        message,

        data

    }

}



// ======================================================
// PROFIT BUSINESS RULE
// ======================================================

function analyzeProfitBusiness(
    metrics,
    findings
){


    const profit =
        metrics.profit || {}



    const trend =
        metrics.trend || {}



    if(

        profit.profit > 0 &&

        trend.revenueGrowth > 0 &&

        trend.profitGrowth < 0

    ){

        findings.push(

            createBusinessFinding({

                code:
                    "BUSINESS_GROWTH_RISK",

                severity:
                    "critical",

                title:
                    "ธุรกิจกำลังโตแต่กำไรลดลง",

                message:
                    "ยอดขายเพิ่มขึ้นแต่ประสิทธิภาพการทำกำไรลดลง",

                data:{
                    revenueGrowth:
                        trend.revenueGrowth,

                    profitGrowth:
                        trend.profitGrowth
                }

            })

        )

    }



}




// ======================================================
// INVENTORY BUSINESS RULE
// ======================================================

function analyzeInventoryBusiness(
    metrics,
    findings
){


    const inventory =
        metrics.inventory || {}



    if(

        inventory.stockValue > 0 &&

        inventory.deadStock > 0

    ){

        findings.push(

            createBusinessFinding({

                code:
                    "CAPITAL_LOCKED",

                severity:
                    "warning",

                title:
                    "มีเงินทุนจมในสต็อก",

                message:
                    "มีสินค้าบางส่วนไม่หมุนเวียน ทำให้เงินทุนถูกล็อก",

                data:{
                    stockValue:
                        inventory.stockValue,

                    deadStock:
                        inventory.deadStock
                }

            })

        )

    }


}




// ======================================================
// PRODUCT BUSINESS RULE
// ======================================================

function analyzeProductBusiness(
    metrics,
    findings
){


    const product =
        metrics.product || {}



    if(
        product.lossMaking > 0
    ){

        findings.push(

            createBusinessFinding({

                code:
                    "PRODUCT_PRICING_PROBLEM",

                severity:
                    "critical",

                title:
                    "มีปัญหาราคาสินค้า",

                message:
                    "พบสินค้าที่ขายแล้วไม่สร้างกำไร",

                data:{
                    count:
                        product.lossMaking
                }

            })

        )

    }



    if(
        product.lowMargin > 0
    ){

        findings.push(

            createBusinessFinding({

                code:
                    "LOW_MARGIN_CATALOG",

                severity:
                    "warning",

                title:
                    "สินค้าหลายรายการกำไรต่ำ",

                message:
                    "ควรตรวจสอบต้นทุนหรือราคาขาย",

                data:{
                    count:
                        product.lowMargin
                }

            })

        )

    }


}




// ======================================================
// MAIN
// ======================================================

function generateBusinessFindings(
    metrics
){


    const findings=[]



    analyzeProfitBusiness(
        metrics,
        findings
    )


    analyzeInventoryBusiness(
        metrics,
        findings
    )


    analyzeProductBusiness(
        metrics,
        findings
    )



    return {


        total:
            findings.length,


        critical:

            findings.filter(
                x =>
                x.severity==="critical"
            ).length,


        warning:

            findings.filter(
                x =>
                x.severity==="warning"
            ).length,


        items:
            findings


    }


}



// ======================================================
// EXPORT
// ======================================================

module.exports={

    generateBusinessFindings,

    createBusinessFinding

}