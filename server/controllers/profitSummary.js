const prisma = require('../config/prisma')


// ======================================================
// PROFIT SUMMARY
// GET /api/profit/summary
//
// SOURCE OF TRUTH
// ------------------------------------------------------
// Sale
//   └─ SaleItem
//        └─ ConsignmentItem
//        └─ Return
//   └─ Expense (SHIPPING_ACTUAL, OTHER_SALE_COST, ...)
//
// IMPORTANT
// ------------------------------------------------------
// salePrice     = ราคาต่อชิ้น (รวมค่าส่งที่เรียกเก็บจากลูกค้า
//                 ไว้แล้ว ไม่มี "shipping income" แยกอีกต่อไป)
// quantity      = จำนวนที่ขาย
//
// ดังนั้นทุกยอดขายต้องคำนวณ:
// salePrice * quantity
//
// Return ต้องหักออกจากยอดขาย
// และสินค้าที่คืนเต็มจำนวนจะไม่คิดต้นทุน
//
// ==================================================
// BUSINESS LOGIC (อัปเดตล่าสุด - ตรงกับ orders.js / dashBoard.js)
// ==================================================
// ค่าส่งจริง (SHIPPING_ACTUAL) และค่าใช้จ่ายอื่นๆ (OTHER_SALE_COST)
// ไม่ใช่รายได้อีกต่อไป แต่เป็น Expense ที่ผูกกับ sale แล้วนำมา
// "หัก" ตอนคำนวณกำไร (sale.expenses ที่ query มาอยู่แล้วครอบคลุม
// อยู่แล้ว ไม่ต้องบวก sale.shippingCost ซึ่งไม่มีอยู่จริงใน schema)
//
// ACCOUNT ISOLATION
// ------------------------------------------------------
// เดิมทั้ง sale.findMany และ consignmentItem.findMany ไม่ scope
// accountId เลย ทำให้ตัวเลขกำไร/สต็อกสรุป เป็นยอดรวมข้าม
// account ทั้งระบบ ต้องดึง accountId จาก req.user แล้วแปะเข้า
// where ของทั้งสอง query
// ======================================================


// ======================================================
// HELPERS
// ======================================================

function toNumber(value) {

    return Number(value || 0)

}


function round(value) {

    return Number(
        toNumber(value).toFixed(2)
    )

}


// ======================================================
// EXPENSE CATEGORY
// ======================================================

const EXPENSE_CATEGORY = {

    SHIPPING_ACTUAL: 'SHIPPING_ACTUAL',

    OTHER_SALE_COST: 'OTHER_SALE_COST'

}


// ======================================================
// GET PROFIT SUMMARY
// ======================================================

exports.profitSummary = async (req, res) => {

    try {

        // ==================================================
        // ACCOUNT ISOLATION
        // ==================================================

        const accountId =
            Number(req.user?.accountId)


        if (
            !Number.isInteger(accountId) ||
            accountId <= 0
        ) {

            return res.status(401).json({

                message:
                    'Unauthorized'

            })

        }


        // ==================================================
        // GET COMPLETED SALES
        // ==================================================

        const sales =
            await prisma.sale.findMany({

                where: {

                    accountId,

                    status:
                        'COMPLETED'

                },

                include: {

                    items: {

                        include: {

                            consignmentItem: {

                                select: {

                                    id:
                                        true,

                                    costPrice:
                                        true

                                }

                            },

                            returns:
                                true

                        },

                        orderBy: {

                            id:
                                'asc'

                        }

                    },

                    expenses:
                        true

                },

                orderBy: {

                    createdAt:
                        'asc'

                }

            })


        // ==================================================
        // GET STOCK
        // ==================================================

        const stock =
            await prisma.consignmentItem.findMany({

                where: {

                    accountId

                },

                select: {

                    id:
                        true,

                    status:
                        true,

                    quantity:
                        true,

                    costPrice:
                        true

                }

            })


        // ==================================================
        // INITIAL VALUES
        //
        // หมายเหตุ: ลบ shippingIncome / netShipping ออก
        // (เดิมอ้าง sale.shippingCost ที่ไม่มีจริง แล้วเอาไปบวก
        // เป็นรายได้ ซึ่งผิดตาม business logic ใหม่)
        //
        // returnedShippingRefund ยังเก็บไว้เป็นข้อมูลอ้างอิง
        // (ยอดที่ refund ให้ลูกค้าในส่วนที่เคยเป็นค่าส่ง) แต่
        // "ไม่" นำไปรวมในสูตรกำไรอีกต่อไป
        // ==================================================

        let productSales = 0

        let discount = 0

        let returnedAmount = 0

        let returnedShippingRefund = 0

        let productCost = 0

        let expenses = 0

        let shippingExpense = 0

        let otherExpense = 0

        let itemsSold = 0

        let itemsReturned = 0

        let salesCount =
            sales.length


        // ==================================================
        // CALCULATE SALES
        // ==================================================

        for (const sale of sales) {

            const saleDiscount =
                toNumber(
                    sale.discount
                )


            discount +=
                saleDiscount


            // ==============================================
            // PRODUCTS TOTAL
            // ==============================================

            const productsTotal =
                sale.items.reduce(

                    (sum, item) => {

                        const quantity =
                            toNumber(
                                item.quantity
                            )

                        const salePrice =
                            toNumber(
                                item.salePrice
                            )

                        return sum +
                            (
                                salePrice *
                                quantity
                            )

                    },

                    0
                )


            // ==============================================
            // ITEMS
            // ==============================================

            for (const item of sale.items) {

                const quantity =
                    toNumber(
                        item.quantity
                    )


                const unitSalePrice =
                    toNumber(
                        item.salePrice
                    )


                const unitCostPrice =
                    toNumber(
                        item.consignmentItem?.costPrice
                    )


                // ==========================================
                // GROSS ITEM SALES
                // ==========================================

                const grossItemSales =
                    unitSalePrice *
                    quantity


                // ==========================================
                // ALLOCATE DISCOUNT
                // ==========================================

                const itemDiscount =
                    productsTotal > 0

                        ? (
                            grossItemSales /
                            productsTotal
                        ) *
                        saleDiscount

                        : 0


                // ==========================================
                // RETURN
                // ==========================================

                const itemRefund =
                    item.returns.reduce(

                        (
                            sum,
                            returnItem
                        ) => {

                            return sum +
                                toNumber(
                                    returnItem.refundAmount
                                )

                        },

                        0
                    )


                const itemRefundShipping =
                    item.returns.reduce(

                        (
                            sum,
                            returnItem
                        ) => {

                            return sum +
                                toNumber(
                                    returnItem.refundShipping
                                )

                        },

                        0
                    )


                // ==========================================
                // DISCOUNTED SALES
                // ==========================================

                const discountedSale =
                    Math.max(

                        0,

                        grossItemSales -
                        itemDiscount

                    )


                // ==========================================
                // NET ITEM SALES
                // ==========================================

                const netItemSales =
                    Math.max(

                        0,

                        discountedSale -
                        itemRefund

                    )


                // ==========================================
                // RETURN STATUS
                //
                // Full return:
                // refund >= discounted sale
                // ==========================================

                const isReturned =
                    discountedSale > 0 &&
                    itemRefund >= discountedSale


                // ==========================================
                // COST
                //
                // Full returned item:
                // no product cost
                // ==========================================

                const effectiveCost =
                    isReturned

                        ? 0

                        : unitCostPrice *
                          quantity


                // ==========================================
                // SALES
                // ==========================================

                productSales +=
                    grossItemSales


                returnedAmount +=
                    itemRefund


                returnedShippingRefund +=
                    itemRefundShipping


                // ==========================================
                // COUNTERS
                // ==========================================

                if (isReturned) {

                    itemsReturned +=
                        quantity

                }

                else {

                    itemsSold +=
                        quantity

                    productCost +=
                        effectiveCost

                }

            }


            // ==============================================
            // EXPENSES (ค่าส่งจริง / ค่าใช้จ่ายอื่นๆ / อื่นๆ)
            // ==============================================

            for (
                const expense
                of sale.expenses
            ) {

                const amount =
                    toNumber(
                        expense.amount
                    )


                expenses +=
                    amount


                if (
                    expense.category ===
                    EXPENSE_CATEGORY.SHIPPING_ACTUAL
                ) {

                    shippingExpense +=
                        amount

                }
                else if (
                    expense.category ===
                    EXPENSE_CATEGORY.OTHER_SALE_COST
                ) {

                    otherExpense +=
                        amount

                }

            }

        }


        // ==================================================
        // GROSS SALES
        //
        // = productSales เท่านั้น (ราคาต่อชิ้นรวมค่าส่งที่เรียก
        // เก็บจากลูกค้าไว้แล้ว ไม่มีค่าส่งแยกมาบวกซ้ำ)
        // ==================================================

        const grossSales =
            productSales


        // ==================================================
        // NET PRODUCT SALES
        // ==================================================

        const netProductSales =
            Math.max(

                0,

                productSales -
                discount -
                returnedAmount

            )


        // ==================================================
        // NET SALES
        //
        // ไม่บวกค่าส่งแยกแล้ว
        // ==================================================

        const netSales =
            netProductSales


        // ==================================================
        // GROSS PROFIT
        // ==================================================

        const grossProfit =
            netSales -
            productCost


        // ==================================================
        // NET PROFIT
        //
        // หักค่าใช้จ่ายทั้งหมด (ค่าส่งจริง + ค่าใช้จ่ายอื่นๆ + อื่นๆ)
        // ==================================================

        const netProfit =
            grossProfit -
            expenses


        // ==================================================
        // PROFIT MARGIN
        // ==================================================

        const profitMargin =
            netSales > 0

                ? (
                    netProfit /
                    netSales
                ) *
                100

                : 0


        // ==================================================
        // STOCK SUMMARY
        // ==================================================

        let availableStock = 0

        let soldStock = 0

        let returnedStock = 0

        let cancelledStock = 0


        let availableQuantity = 0

        let soldQuantity = 0

        let returnedQuantity = 0

        let cancelledQuantity = 0


        let stockCostValue = 0


        for (
            const item
            of stock
        ) {

            const quantity =
                toNumber(
                    item.quantity
                )


            const costPrice =
                toNumber(
                    item.costPrice
                )


            // ==========================================
            // AVAILABLE
            // ==========================================

            if (
                item.status ===
                'AVAILABLE'
            ) {

                availableStock++

                availableQuantity +=
                    quantity

                stockCostValue +=
                    costPrice *
                    quantity

            }


            // ==========================================
            // SOLD
            // ==========================================

            else if (
                item.status ===
                'SOLD'
            ) {

                soldStock++

                soldQuantity +=
                    quantity

            }


            // ==========================================
            // RETURNED
            // ==========================================

            else if (
                item.status ===
                'RETURNED'
            ) {

                returnedStock++

                returnedQuantity +=
                    quantity

            }


            // ==========================================
            // CANCELLED
            // ==========================================

            else if (
                item.status ===
                'CANCELLED'
            ) {

                cancelledStock++

                cancelledQuantity +=
                    quantity

            }

        }


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.json({

            summary: {

                salesCount,

                itemsSold,

                itemsReturned,

                productSales:
                    round(
                        productSales
                    ),

                grossSales:
                    round(
                        grossSales
                    ),

                discount:
                    round(
                        discount
                    ),

                returnedAmount:
                    round(
                        returnedAmount
                    ),

                returnedShippingRefund:
                    round(
                        returnedShippingRefund
                    ),

                netProductSales:
                    round(
                        netProductSales
                    ),

                netSales:
                    round(
                        netSales
                    ),

                productCost:
                    round(
                        productCost
                    ),

                // ==================================================
                // แยกหมวดค่าใช้จ่าย (ค่าส่งจริง / อื่นๆ) + รวมทุกหมวด
                // ==================================================

                shippingExpense:
                    round(
                        shippingExpense
                    ),

                otherExpense:
                    round(
                        otherExpense
                    ),

                expenses:
                    round(
                        expenses
                    ),

                grossProfit:
                    round(
                        grossProfit
                    ),

                netProfit:
                    round(
                        netProfit
                    ),

                profitMargin:
                    round(
                        profitMargin
                    )

            },


            stock: {

                totalItems:
                    stock.length,

                available:
                    availableStock,

                sold:
                    soldStock,

                returned:
                    returnedStock,

                cancelled:
                    cancelledStock,

                availableQuantity,

                soldQuantity,

                returnedQuantity,

                cancelledQuantity,

                stockCostValue:
                    round(
                        stockCostValue
                    )

            }

        })


    } catch (err) {

        console.error(
            'Profit Summary Error:',
            err
        )


        return res.status(500).json({

            message:
                'Server Error',

            error:
                err.message

        })

    }

}