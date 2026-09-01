const prisma = require('../config/prisma')


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
// GET PROFIT BY SALE
// GET /api/sales/:id/profit
//
// SOURCE OF TRUTH
//
// Sale
// ├── SaleItem.salePrice
// ├── SaleItem.quantity
// ├── SaleItem.costPriceAtSale   <-- ต้นทุน snapshot
// ├── Sale.shippingCharged
// ├── Sale.shippingActual
// ├── Sale.discount
// ├── Sale.expenses
// └── SaleItem.returns
//
// IMPORTANT
//
// ห้ามใช้ ConsignmentItem.costPrice
// เพื่อคำนวณกำไรย้อนหลัง
//
// เพราะราคาต้นทุนอาจถูกแก้ไขภายหลัง
//
// กำไรของ SaleItem ต้องใช้:
// costPriceAtSale
// ======================================================

exports.saleProfit = async (req, res) => {

    try {

        const saleId =
            Number(req.params.id)


        // ==================================================
        // VALIDATE ID
        // ==================================================

        if (
            !Number.isInteger(saleId) ||
            saleId <= 0
        ) {

            return res.status(400).json({

                message:
                    'Invalid sale id'

            })

        }


        // ==================================================
        // ACCOUNT ISOLATION
        //
        // CRITICAL:
        //
        // ต้องดึง accountId ของผู้ใช้ที่ล็อกอินอยู่ก่อนเสมอ
        // แล้ว scope ทุก query ด้วย accountId นี้
        //
        // เดิมไฟล์นี้ query sale ด้วย id อย่างเดียว ทำให้
        // user account ไหนก็ตาม เดา/ลอง id แล้วเปิดดูกำไร,
        // ต้นทุน, ข้อมูลลูกค้าของ order ร้านอื่นได้ทันที
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
        // GET SALE
        //
        // เปลี่ยนจาก findUnique({ id }) เป็น findFirst
        // พร้อม scope accountId เพื่อกัน sale ข้าม account
        // ==================================================

        const sale =
            await prisma.sale.findFirst({

                where: {

                    id:
                        saleId,

                    accountId

                },

                include: {

                    items: {

                        include: {

                            consignmentItem: {

                                include: {

                                    owner:
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
                        true,

                    customer:
                        true,

                    createdBy: {

                        select: {

                            id:
                                true,

                            name:
                                true,

                            email:
                                true

                        }

                    }

                }

            })


        // ==================================================
        // NOT FOUND
        //
        // หมายเหตุ: ถ้า sale มีอยู่จริงแต่เป็นของ account อื่น
        // จะตกมาที่ 404 นี้เหมือนกัน (ไม่ leak ว่า id นี้มีอยู่
        // จริงหรือไม่ ในระบบของ account อื่น) ถือเป็นพฤติกรรม
        // ที่ถูกต้องแล้วสำหรับความปลอดภัย
        // ==================================================

        if (!sale) {

            return res.status(404).json({

                message:
                    'Sale not found'

            })

        }


        // ==================================================
        // BASIC VALUES
        // ==================================================

        const shippingCharged =
            toNumber(
                sale.shippingCharged
            )


        const shippingActual =
            toNumber(
                sale.shippingActual
            )


        const saleDiscount =
            toNumber(
                sale.discount
            )


        // ==================================================
        // SHIPPING PROFIT
        // ==================================================

        const shippingProfit =
            shippingCharged -
            shippingActual


        // ==================================================
        // PRODUCT TOTAL
        //
        // SaleItem.salePrice
        // เป็นราคาต่อหน่วย
        //
        // quantity
        // เป็นจำนวนที่ขาย
        // ==================================================

        const productsTotal =
            sale.items.reduce(

                (sum, item) => {

                    const salePrice =
                        toNumber(
                            item.salePrice
                        )


                    const quantity =
                        toNumber(
                            item.quantity
                        )


                    return (
                        sum +
                        (
                            salePrice *
                            quantity
                        )
                    )

                },

                0

            )


        // ==================================================
        // CALCULATE ITEMS
        // ==================================================

        const items =
            sale.items.map(item => {

                // ==========================================
                // QUANTITY
                // ==========================================

                const quantity =
                    toNumber(
                        item.quantity
                    )


                // ==========================================
                // SALE PRICE
                // ==========================================

                const unitSalePrice =
                    toNumber(
                        item.salePrice
                    )


                const grossSalePrice =
                    unitSalePrice *
                    quantity


                // ==========================================
                // COST SNAPSHOT
                //
                // IMPORTANT:
                //
                // ใช้ SaleItem.costPriceAtSale
                //
                // ไม่ใช้:
                // item.consignmentItem.costPrice
                // ==========================================

                const unitCostPrice =
                    toNumber(
                        item.costPriceAtSale
                    )


                const totalCostPrice =
                    unitCostPrice *
                    quantity


                // ==========================================
                // DISCOUNT ALLOCATION
                //
                // กระจายส่วนลดตามสัดส่วนยอดสินค้า
                // ==========================================

                const itemDiscount =
                    productsTotal > 0

                        ? (
                            grossSalePrice /
                            productsTotal
                        ) *
                        saleDiscount

                        : 0


                // ==========================================
                // RETURNS
                // ==========================================

                const refundAmount =
                    item.returns.reduce(

                        (
                            sum,
                            returnItem
                        ) => {

                            return (
                                sum +
                                toNumber(
                                    returnItem.refundAmount
                                )
                            )

                        },

                        0

                    )


                // ==========================================
                // PRICE AFTER DISCOUNT
                // ==========================================

                const discountedSale =
                    Math.max(

                        0,

                        grossSalePrice -
                        itemDiscount

                    )


                // ==========================================
                // NET SALE
                // ==========================================

                const netSale =
                    Math.max(

                        0,

                        discountedSale -
                        refundAmount

                    )


                // ==========================================
                // RETURN STATUS
                //
                // ถ้าคืนเงินเต็มยอดของ SaleItem
                // ถือว่า RETURNED
                // ==========================================

                const isReturned =
                    discountedSale > 0 &&
                    refundAmount >=
                    discountedSale


                // ==========================================
                // EFFECTIVE COST
                //
                // สินค้าที่คืนเต็มจำนวน
                // ไม่คิดต้นทุนในกำไร
                // ==========================================

                const effectiveCost =
                    isReturned
                        ? 0
                        : totalCostPrice


                // ==========================================
                // OWNER AMOUNT
                //
                // สำหรับสินค้าฝากขาย
                //
                // ใช้ต้นทุน snapshot
                // ==========================================

                const ownerAmount =
                    isReturned
                        ? 0
                        : totalCostPrice


                // ==========================================
                // SHOP PROFIT
                // ==========================================

                const shopProfit =
                    netSale -
                    effectiveCost


                // ==========================================
                // OWNER
                // ==========================================

                const owner =
                    item.consignmentItem?.owner


                return {

                    id:
                        item.id,

                    consignmentItemId:
                        item.consignmentItemId,

                    name:
                        item.consignmentItem?.name ??
                        null,

                    description:
                        item.consignmentItem?.description ??
                        null,

                    quantity,

                    unitSalePrice:
                        round(
                            unitSalePrice
                        ),

                    salePrice:
                        round(
                            grossSalePrice
                        ),

                    // ======================================
                    // SNAPSHOT COST
                    // ======================================

                    unitCostPrice:
                        round(
                            unitCostPrice
                        ),

                    costPriceAtSale:
                        round(
                            unitCostPrice
                        ),

                    costPrice:
                        round(
                            totalCostPrice
                        ),

                    // ======================================
                    // FINANCIAL
                    // ======================================

                    discount:
                        round(
                            itemDiscount
                        ),

                    discountedSale:
                        round(
                            discountedSale
                        ),

                    refundAmount:
                        round(
                            refundAmount
                        ),

                    netSale:
                        round(
                            netSale
                        ),

                    ownerAmount:
                        round(
                            ownerAmount
                        ),

                    effectiveCost:
                        round(
                            effectiveCost
                        ),

                    shopProfit:
                        round(
                            shopProfit
                        ),

                    status:
                        isReturned
                            ? 'RETURNED'
                            : 'SOLD',

                    // ======================================
                    // SALE TIME
                    //
                    // Sale.createdAt คือเวลาของ Sale
                    // ======================================

                    soldAt:
                        sale.createdAt,

                    saleCreatedAt:
                        sale.createdAt,

                    saleUpdatedAt:
                        sale.updatedAt,

                    // ======================================
                    // OWNER
                    // ======================================

                    owner:
                        owner
                            ? {

                                id:
                                    owner.id,

                                name:
                                    owner.name,

                                phone:
                                    owner.phone,

                                note:
                                    owner.note

                            }
                            : null,

                    // ======================================
                    // RETURNS
                    // ======================================

                    returns:
                        item.returns.map(
                            returnItem => ({

                                id:
                                    returnItem.id,

                                refundAmount:
                                    round(
                                        returnItem.refundAmount
                                    ),

                                refundShipping:
                                    round(
                                        returnItem.refundShipping
                                    ),

                                reason:
                                    returnItem.reason,

                                note:
                                    returnItem.note,

                                createdAt:
                                    returnItem.createdAt

                            })
                        )

                }

            })


        // ==================================================
        // RETURNED SHIPPING
        // ==================================================

        const returnedShipping =
            sale.items.reduce(

                (
                    sum,
                    item
                ) => {

                    return (
                        sum +
                        item.returns.reduce(

                            (
                                returnSum,
                                returnItem
                            ) => {

                                return (
                                    returnSum +
                                    toNumber(
                                        returnItem.refundShipping
                                    )
                                )

                            },

                            0

                        )
                    )

                },

                0

            )


        // ==================================================
        // NET SHIPPING
        // ==================================================

        const netShipping =
            Math.max(

                0,

                shippingCharged -
                returnedShipping

            )


        // ==================================================
        // RETURNED AMOUNT
        // ==================================================

        const returnedAmount =
            items.reduce(

                (
                    sum,
                    item
                ) =>
                    sum +
                    item.refundAmount,

                0

            )


        // ==================================================
        // NET PRODUCT SALES
        // ==================================================

        const netProductSales =
            items.reduce(

                (
                    sum,
                    item
                ) =>
                    sum +
                    item.netSale,

                0

            )


        // ==================================================
        // NET SALES
        //
        // สินค้า net
        // +
        // ค่าส่งสุทธิ
        // ==================================================

        const netSales =
            netProductSales +
            netShipping


        // ==================================================
        // PRODUCT COST
        // ==================================================

        const productCost =
            items.reduce(

                (
                    sum,
                    item
                ) =>
                    sum +
                    item.effectiveCost,

                0

            )


        // ==================================================
        // EXPENSE
        // ==================================================

        const expenseTotal =
            sale.expenses.reduce(

                (
                    sum,
                    expense
                ) =>
                    sum +
                    toNumber(
                        expense.amount
                    ),

                0

            )


        // ==================================================
        // GROSS SALES
        //
        // ยอดก่อน discount / refund
        //
        // product
        // +
        // shipping charged
        // ==================================================

        const grossSales =
            productsTotal +
            shippingCharged


        // ==================================================
        // GROSS PROFIT
        // ==================================================

        const grossProfit =
            netSales -
            productCost


        // ==================================================
        // NET PROFIT
        // ==================================================

        const netProfit =
            grossProfit -
            expenseTotal


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
        // COUNTERS
        // ==================================================

        const soldCount =
            items.filter(

                item =>
                    item.status ===
                    'SOLD'

            ).length


        const returnedCount =
            items.filter(

                item =>
                    item.status ===
                    'RETURNED'

            ).length


        // ==================================================
        // QUANTITY COUNTERS
        // ==================================================

        const soldQuantity =
            items.reduce(

                (
                    sum,
                    item
                ) => {

                    if (
                        item.status ===
                        'SOLD'
                    ) {

                        return (
                            sum +
                            item.quantity
                        )

                    }

                    return sum

                },

                0

            )


        const returnedQuantity =
            items.reduce(

                (
                    sum,
                    item
                ) => {

                    if (
                        item.status ===
                        'RETURNED'
                    ) {

                        return (
                            sum +
                            item.quantity
                        )

                    }

                    return sum

                },

                0

            )


        // ==================================================
        // OWNER SUMMARY
        // ==================================================

        const ownerMap = {}


        for (const item of items) {

            if (!item.owner) {
                continue
            }


            const ownerId =
                item.owner.id


            if (!ownerMap[ownerId]) {

                ownerMap[ownerId] = {

                    owner: {

                        id:
                            item.owner.id,

                        name:
                            item.owner.name,

                        phone:
                            item.owner.phone,

                        note:
                            item.owner.note

                    },

                    totalItems:
                        0,

                    totalQuantity:
                        0,

                    soldCount:
                        0,

                    returnedCount:
                        0,

                    soldQuantity:
                        0,

                    returnedQuantity:
                        0,

                    grossSales:
                        0,

                    discountAmount:
                        0,

                    returnedAmount:
                        0,

                    netSales:
                        0,

                    ownerAmount:
                        0,

                    shopProfit:
                        0

                }

            }


            const owner =
                ownerMap[ownerId]


            // ==============================================
            // COUNTERS
            // ==============================================

            owner.totalItems++

            owner.totalQuantity +=
                item.quantity


            if (
                item.status ===
                'RETURNED'
            ) {

                owner.returnedCount++

                owner.returnedQuantity +=
                    item.quantity

            }

            else {

                owner.soldCount++

                owner.soldQuantity +=
                    item.quantity

            }


            // ==============================================
            // MONEY
            // ==============================================

            owner.grossSales +=
                item.salePrice

            owner.discountAmount +=
                item.discount

            owner.returnedAmount +=
                item.refundAmount

            owner.netSales +=
                item.netSale

            owner.ownerAmount +=
                item.ownerAmount

            owner.shopProfit +=
                item.shopProfit

        }


        // ==================================================
        // FORMAT OWNER SUMMARY
        // ==================================================

        const owners =
            Object.values(ownerMap).map(
                owner => ({

                    ...owner,

                    grossSales:
                        round(
                            owner.grossSales
                        ),

                    discountAmount:
                        round(
                            owner.discountAmount
                        ),

                    returnedAmount:
                        round(
                            owner.returnedAmount
                        ),

                    netSales:
                        round(
                            owner.netSales
                        ),

                    ownerAmount:
                        round(
                            owner.ownerAmount
                        ),

                    shopProfit:
                        round(
                            owner.shopProfit
                        )

                })
            )


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.json({

            saleId:
                sale.id,

            sale: {

                id:
                    sale.id,

                customer:
                    sale.customer,

                createdBy:
                    sale.createdBy,

                status:
                    sale.status,

                createdAt:
                    sale.createdAt,

                updatedAt:
                    sale.updatedAt,

                shippingCharged:
                    round(
                        shippingCharged
                    ),

                shippingActual:
                    round(
                        shippingActual
                    ),

                shippingProfit:
                    round(
                        shippingProfit
                    ),

                discount:
                    round(
                        saleDiscount
                    )

            },

            summary: {

                // ==========================================
                // COUNTS
                // ==========================================

                totalItems:
                    items.length,

                totalQuantity:
                    items.reduce(
                        (
                            sum,
                            item
                        ) =>
                            sum +
                            item.quantity,

                        0
                    ),

                soldCount,

                returnedCount,

                soldQuantity,

                returnedQuantity,

                // ==========================================
                // SALES
                // ==========================================

                productsTotal:
                    round(
                        productsTotal
                    ),

                shippingCharged:
                    round(
                        shippingCharged
                    ),

                shippingActual:
                    round(
                        shippingActual
                    ),

                shippingProfit:
                    round(
                        shippingProfit
                    ),

                discountAmount:
                    round(
                        saleDiscount
                    ),

                grossSales:
                    round(
                        grossSales
                    ),

                returnedAmount:
                    round(
                        returnedAmount
                    ),

                returnedShipping:
                    round(
                        returnedShipping
                    ),

                netShipping:
                    round(
                        netShipping
                    ),

                netProductSales:
                    round(
                        netProductSales
                    ),

                netSales:
                    round(
                        netSales
                    ),

                // ==========================================
                // COST / PROFIT
                // ==========================================

                productCost:
                    round(
                        productCost
                    ),

                expenseTotal:
                    round(
                        expenseTotal
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

            // ==================================================
            // ITEM DETAILS
            // ==================================================

            items,

            // ==================================================
            // OWNER SUMMARY
            // ==================================================

            owners,

            // ==================================================
            // EXPENSES
            // ==================================================

            expenses:
                sale.expenses.map(
                    expense => ({

                        id:
                            expense.id,

                        name:
                            expense.name,

                        category:
                            expense.category,

                        amount:
                            round(
                                expense.amount
                            ),

                        note:
                            expense.note

                    })
                )

        })


    } catch (err) {

        console.error(
            'SALE PROFIT ERROR:',
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