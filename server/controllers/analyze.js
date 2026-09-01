// ======================================================
// ANALYZE CONTROLLER
// controllers/analyze.js
// ======================================================
//
// FLOW:
//
// Request
//   ↓
// authCheck
//   ↓
// req.user.id
//   ↓
// analyzeDataService
//   ↓
// Prisma Data
//   ↓
// Analyze Engine
//   ↓
// Sales Analyzer
// Profit Analyzer
// Inventory Analyzer
// Product Analyzer
// Trend Analyzer
//   ↓
// Finding Engine
//   ↓
// AI Context
//   ↓
// Gemini
//   ↓
// Response
//
// ======================================================


const {
    getAnalyzeData
} = require("../services/analyze/analyzeDataService")


const {
    analyze
} = require("../services/analyze/analyzeEngine")


const {
    analyzeWithAI
} = require("../services/ai/aiService")



// ======================================================
// CONTROLLER
// ======================================================

async function analyzeController(
    req,
    res
) {


    try {


        console.log("")

        console.log(
            "========================================"
        )

        console.log(
            " ANALYZE CONTROLLER START "
        )

        console.log(
            "========================================"
        )



        // ==================================================
        // AUTH
        // ==================================================

        const userId =
            req.user?.id



        console.log(
            "USER ID:",
            userId
        )



        if (
            userId === undefined ||
            userId === null
        ) {


            return res.status(401).json({

                success:false,

                message:
                    "Unauthorized"

            })

        }




        // ==================================================
        // REQUEST OPTIONS
        // ==================================================

        const body =
            req.body || {}



        const options = {


            period:

                body.period ||
                "MONTH",



            referenceDate:

                body.referenceDate ||
                new Date(),



            includeDaily:

                body.includeDaily === true,



            includeMonthly:

                body.includeMonthly === true,



            inventoryOptions:

                body.inventoryOptions ||
                {},



            productOptions:

                body.productOptions ||
                {}

        }



        console.log(
            "ANALYZE OPTIONS:",
            options
        )





        // ==================================================
        // LOAD DATABASE DATA
        // ==================================================

        console.log("")

        console.log(
            "Loading analyze data..."
        )



        const databaseData =

            await getAnalyzeData(
                userId
            )




        if(
            !databaseData
        ){

            throw new Error(
                "Analyze data empty"
            )

        }




        // ==================================================
        // NORMALIZE DATA
        // ==================================================


        const orders =

            Array.isArray(
                databaseData.orders
            )

            ?

            databaseData.orders

            :

            []




        const sales =

            Array.isArray(
                databaseData.sales
            )

            ?

            databaseData.sales

            :

            []




        const inventory =

            Array.isArray(
                databaseData.inventory
            )

            ?

            databaseData.inventory

            :

            []




        const products =

            Array.isArray(
                databaseData.products
            )

            ?

            databaseData.products

            :

            []




        const expenses =

            Array.isArray(
                databaseData.expenses
            )

            ?

            databaseData.expenses

            :

            []






        // ==================================================
        // DATABASE DEBUG
        // ==================================================

        console.log("")

        console.log(
            "DATABASE SUMMARY"
        )


        console.log(
            "Orders:",
            orders.length
        )


        console.log(
            "Sales:",
            sales.length
        )


        console.log(
            "Inventory:",
            inventory.length
        )


        console.log(
            "Products:",
            products.length
        )


        console.log(
            "Expenses:",
            expenses.length
        )






        // ==================================================
        // SAMPLE DEBUG
        // ==================================================

        if(
            orders.length
        ){

            console.log("")

            console.log(
                "FIRST ORDER"
            )


            console.log({

                id:
                    orders[0].id,


                status:
                    orders[0].status,


                totalAmount:
                    orders[0].totalAmount,


                items:
                    orders[0].items?.length || 0

            })


        }



        if(
            inventory.length
        ){

            console.log("")

            console.log(
                "FIRST INVENTORY"
            )


            console.log({

                id:
                    inventory[0].id,


                status:
                    inventory[0].status,


                costPrice:
                    inventory[0].costPrice,


                salePrice:
                    inventory[0].actualSalePrice

            })

        }





        // ==================================================
        // RUN ANALYZE ENGINE
        // ==================================================

        console.log("")

        console.log(
            "Running Analyze Engine..."
        )



        const analysis =

            await analyze({

                orders,

                sales,

                inventory,

                products,

                expenses,


                period:
                    options.period,


                referenceDate:
                    options.referenceDate,


                includeDaily:
                    options.includeDaily,


                includeMonthly:
                    options.includeMonthly,


                inventoryOptions:
                    options.inventoryOptions,


                productOptions:
                    options.productOptions

            })




        console.log("")

        console.log(
            "ANALYSIS COMPLETED"
        )



        console.log({

            sales:
                !!analysis.sales,


            profit:
                !!analysis.profit,


            inventory:
                !!analysis.inventory,


            product:
                !!analysis.product,


            trends:
                !!analysis.trends,


            findings:
                !!analysis.findings

        })




        // ==================================================
        // AI CONTEXT CHECK
        // ==================================================

        if(
            !analysis.aiContext
        ){

            throw new Error(
                "AI Context missing"
            )

        }



        console.log("")

        console.log(
            "AI CONTEXT READY"
        )

                // ==================================================
        // CALL AI SERVICE
        // ==================================================

        console.log("")

        console.log(
            "Calling AI Service..."
        )


        let aiResult = {

            success:false,

            text:null,

            model:null,

            responseId:null

        }



        try {


            aiResult =

                await analyzeWithAI(
                    analysis.aiContext
                )



            console.log(
                "AI SERVICE SUCCESS"
            )



            console.log({

                model:
                    aiResult.model,


                responseId:
                    aiResult.responseId

            })



        }
        catch(aiError){


            console.error("")

            console.error(
                "AI SERVICE ERROR"
            )


            console.error(
                aiError.message
            )



            aiResult = {


                success:false,


                text:
                    null,


                model:
                    null,


                responseId:
                    null,


                error:
                    aiError.message

            }


        }




        // ==================================================
        // FINAL RESPONSE
        // ==================================================

        console.log("")

        console.log(
            "ANALYZE SUCCESS"
        )


        console.log(
            "========================================"
        )

        console.log("")




        return res.status(200).json({

            success:true,


            data:{



                // ==========================================
                // BUSINESS ANALYSIS
                // ==========================================


                sales:

                    analysis.sales,



                profit:

                    analysis.profit,



                inventory:

                    analysis.inventory,



                product:

                    analysis.product,



                trends:

                    analysis.trends,



                findings:

                    analysis.findings,





                // ==========================================
                // AI
                // ==========================================


                ai: {

    success:
        aiResult.success,

    data:
        aiResult.data,

    model:
        aiResult.model,

    responseId:
        aiResult.responseId,

    error:
        aiResult.error || null

},






                // ==========================================
                // META
                // ==========================================


                meta:{


                    ...analysis.meta,



                    userId,



                    database:{



                        orders:

                            orders.length,



                        sales:

                            sales.length,



                        inventory:

                            inventory.length,



                        products:

                            products.length,



                        expenses:

                            expenses.length


                    }


                }



            }


        })





    }

    catch(error){


        console.error("")

        console.error(
            "========================================"
        )


        console.error(
            "ANALYZE CONTROLLER ERROR"
        )


        console.error(
            error.message
        )


        console.error(
            error.stack
        )


        console.error(
            "========================================"
        )




        return res.status(

            error.status || 500

        )
        .json({


            success:false,


            message:

                error.message ||
                "Analyze failed"



        })

    }


}




// ======================================================
// EXPORT
// ======================================================


module.exports = {


    analyzeController


}