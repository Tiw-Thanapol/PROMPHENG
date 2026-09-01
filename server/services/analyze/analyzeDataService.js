// ======================================================
// ANALYZE DATA SERVICE
// services/analyze/analyzeDataService.js
// ======================================================
//
// RESPONSIBILITY
// ------------------------------------------------------
// ดึงข้อมูลจาก Database สำหรับ Analyzer
//
// ไม่คำนวณ
// ไม่วิเคราะห์
// ไม่แตะ Profit Logic
//
// ส่งข้อมูล:
// Sale
// Sale Items
// Product Cost
// Expenses
//
// ======================================================


const prisma =
    require("../../config/prisma")




// ======================================================
// VALIDATION
// ======================================================

function validateUserId(userId) {


    if (
        userId === null ||
        userId === undefined ||
        userId === ""
    ) {

        throw new Error(
            "userId is required"
        )

    }


    const id =
        Number(userId)



    if (
        !Number.isInteger(id)
    ) {

        throw new TypeError(
            "userId must be integer"
        )

    }


    return id

}




// ======================================================
// ARRAY NORMALIZER
// ======================================================

function normalizeArray(value) {

    return Array.isArray(value)
        ? value
        : []

}




// ======================================================
// ORDERS
// ======================================================

async function getOrders(userId) {


    const orders =

        await prisma.sale.findMany({


            where: {

                createdById:
                    userId

            },


            include: {


                customer: true,


                items: {


                    include: {


                        // ทุนสินค้า
                        consignmentItem: true


                    }

                },


                // ค่าใช้จ่ายที่ผูกกับ Order
                expenses: true


            },


            orderBy: {


                createdAt:
                    "desc"


            }


        })



    return normalizeArray(
        orders
    )

}




// ======================================================
// EXPENSES
// ======================================================
//
// Global expense
// saleId = null
//
// เช่น
// - ซื้อกล่อง
// - ค่าอุปกรณ์
// - ค่าใช้จ่ายร้าน
//
// ======================================================

async function getExpenses(userId) {


    const expenses =

        await prisma.expense.findMany({


            where: {

                createdById:
                    userId

            },


            orderBy: {

                createdAt:
                    "desc"

            }


        })



    return normalizeArray(
        expenses
    )

}




// ======================================================
// PRODUCTS
// ======================================================
//
// ใช้สำหรับ Product Analyzer
//
// ======================================================

async function getProducts(userId) {


    const products =


        await prisma.consignmentItem.findMany({


            where: {


                saleItems: {


                    some: {


                        sale: {


                            createdById:
                                userId


                        }


                    }


                }


            },


            orderBy: {


                createdAt:
                    "desc"


            }


        })



    return normalizeArray(
        products
    )

}




// ======================================================
// MAIN
// ======================================================

async function getAnalyzeData(userId) {


    const numericUserId =
        validateUserId(
            userId
        )



    const [

        orders,

        expenses,

        products


    ] = await Promise.all([


        getOrders(
            numericUserId
        ),


        getExpenses(
            numericUserId
        ),


        getProducts(
            numericUserId
        )


    ])





    console.log(
        "[ANALYZE DATA]"
    )


    console.log({

        userId:
            numericUserId,

        orders:
            orders.length,

        expenses:
            expenses.length,

        products:
            products.length

    })





    return {


        orders,


        expenses,


        products


    }


}




// ======================================================
// EXPORT
// ======================================================

module.exports = {


    getAnalyzeData,


    getOrders,


    getExpenses,


    getProducts


}