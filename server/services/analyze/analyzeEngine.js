// ======================================================
// ANALYZE ENGINE
// services/analyze/analyzeEngine.js
// ======================================================
//
// RESPONSIBILITY
// ------------------------------------------------------
// รวมผลการวิเคราะห์ธุรกิจทั้งหมด
//
// Flow:
//
// Controller
//      |
//      v
// Analyze Data
//      |
//      v
// Analyze Engine
//      |
//      + Sales
//      + Profit
//      + Inventory
//      + Product
//      + Trend
//      + Findings
//      |
//      v
// AI Context Builder
//
// NOTE:
// - ไม่เรียก Gemini
// - ไม่อ่าน Database
// - ไม่ทำ Controller Logic
//
// ======================================================



// ======================================================
// IMPORT
// ======================================================


// SALES

const salesModule =
    require("./SalesAnalyzer")


const analyzeSales =

    typeof salesModule === "function"
        ? salesModule
        : salesModule.analyzeSales




// PROFIT

const profitModule =
    require("./profitAnalyzer")


const analyzeProfit =

    typeof profitModule === "function"
        ? profitModule
        : profitModule.analyzeProfit




// INVENTORY

const inventoryModule =
    require("./inventoryAnalyzer")


const analyzeInventory =

    typeof inventoryModule === "function"
        ? inventoryModule
        : inventoryModule.analyzeInventory




// PRODUCT

const productModule =
    require("./productAnalyzer")


const analyzeProducts =

    typeof productModule === "function"
        ? productModule
        : productModule.analyzeProducts




// TREND

const trendModule =
    require("./trendAnalyzer")


const analyzeTrends =

    typeof trendModule === "function"
        ? trendModule
        :
        trendModule.analyzeTrends ||
        trendModule.analyzeTrend




// FINDINGS

const findingModule =
    require("./findingEngine")


const generateFindings =

    typeof findingModule === "function"
        ? findingModule
        : findingModule.generateFindings




// AI CONTEXT

const {
    buildAIContext
}
=
require("./aiAnalyzer")




// ======================================================
// VALIDATION
// ======================================================


function checkFunction(
    name,
    fn
){

    if(
        typeof fn !== "function"
    ){

        throw new TypeError(
            `${name} is not a function`
        )

    }

}




checkFunction(
    "analyzeSales",
    analyzeSales
)


checkFunction(
    "analyzeProfit",
    analyzeProfit
)


checkFunction(
    "analyzeInventory",
    analyzeInventory
)


checkFunction(
    "analyzeProducts",
    analyzeProducts
)


checkFunction(
    "analyzeTrends",
    analyzeTrends
)


checkFunction(
    "generateFindings",
    generateFindings
)


checkFunction(
    "buildAIContext",
    buildAIContext
)




// ======================================================
// HELPERS
// ======================================================


function normalizeArray(value){

    return Array.isArray(value)
        ? value
        : []

}




// ======================================================
// MAIN
// ======================================================


async function analyze(
    data = {}
){




    const orders =

        normalizeArray(
            data.orders
        )



    const expenses =

        normalizeArray(
            data.expenses
        )



    const inventory =

        normalizeArray(
            data.inventory ||
            data.products
        )





    console.log("")

    console.log(
        "========================================"
    )

    console.log(
        "ANALYZE ENGINE START"
    )


    console.log({

        orders:
            orders.length,

        expenses:
            expenses.length,

        inventory:
            inventory.length

    })





    // ==================================================
    // SALES
    // ==================================================

    const sales =

        analyzeSales(
            orders
        )






    // ==================================================
    // PROFIT
    // ==================================================

    const profit =

        analyzeProfit({

            orders,

            expenses

        })






    // ==================================================
    // INVENTORY
    // ==================================================

    const inventoryResult =

        analyzeInventory(

            inventory,

            data.inventoryOptions || {}

        )






    // ==================================================
    // PRODUCT
    // ==================================================

    const product =

        analyzeProducts(

            orders,

            inventory,

            data.productOptions || {}

        )






    // ==================================================
    // TREND
    // ==================================================

    const trends =

        analyzeTrends(

            orders,

            {

                period:

                    data.period ||
                    "MONTH",


                referenceDate:

                    data.referenceDate ||
                    new Date(),


                includeDaily:

                    data.includeDaily === true,


                includeMonthly:

                    data.includeMonthly === true,


                profitAnalysis:

                    profit

            }

        )







    // ==================================================
    // FINDINGS
    // ==================================================

    const findings =

        generateFindings({

            sales,

            profit,


            inventory:
                inventoryResult,


            product,


            trends

        })







    // ==================================================
    // BUILD AI CONTEXT
    // ==================================================

    const aiContext =

        buildAIContext({

            sales,

            profit,


            inventory:
                inventoryResult,


            product,


            trends,


            findings

        })







    console.log(
        "ANALYZE ENGINE COMPLETE"
    )

    console.log(
        "========================================"
    )







    return {



        sales,



        profit,



        inventory:

            inventoryResult,



        product,



        trends,



        findings,



        aiContext,



        meta:{


            ordersLoaded:

                orders.length,


            expensesLoaded:

                expenses.length,


            inventoryLoaded:

                inventory.length,


            analyzedAt:

                new Date()
                .toISOString()


        }


    }


}




// ======================================================
// EXPORT
// ======================================================


module.exports = {

    analyze

}