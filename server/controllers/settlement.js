const prisma = require('../config/prisma')


// ======================================================
// GET OWNER SETTLEMENT
// GET /api/owners/:id/settlement
// ======================================================

exports.ownerSettlement = async (req, res) => {

    try {

        const ownerId = Number(req.params.id)


        // ==================================================
        // VALIDATE ID
        // ==================================================

        if (
            !Number.isInteger(ownerId) ||
            ownerId <= 0
        ) {

            return res.status(400).json({
                message: 'Invalid owner id'
            })
        }


        // ==================================================
        // CHECK OWNER
        // ==================================================

        const owner =
            await prisma.owner.findUnique({

                where: {
                    id: ownerId
                }

            })


        if (!owner) {

            return res.status(404).json({
                message: 'Owner not found'
            })
        }


        // ==================================================
        // GET SALE ITEMS
        // ==================================================

        const saleItems =
            await prisma.saleItem.findMany({

                where: {

                    consignmentItem: {

                        ownerId: ownerId

                    },

                    sale: {

                        status: 'COMPLETED'

                    }

                },

                include: {

                    sale: {

                        select: {

                            id: true,

                            createdAt: true,

                            discount: true

                        }

                    },

                    consignmentItem: {

                        select: {

                            id: true,

                            name: true,

                            description: true,

                            costPrice: true

                        }

                    },

                    returns: {

                        select: {

                            id: true,

                            refundAmount: true,

                            refundShipping: true,

                            reason: true,

                            note: true,

                            createdAt: true

                        }

                    }

                },

                orderBy: {

                    createdAt: 'asc'

                }

            })


        // ==================================================
        // SUMMARY
        // ==================================================

        let soldItems = 0
        let returnedItems = 0

        let salesBeforeDiscount = 0
        let discountAmount = 0
        let returnedAmount = 0

        let netSales = 0
        let ownerAmount = 0
        let shopProfit = 0


        // ==================================================
        // ITEM CALCULATION
        // ==================================================

        const items =
            saleItems.map(item => {

                const salePrice =
                    Number(item.salePrice)


                const costPrice =
                    Number(
                        item.consignmentItem.costPrice
                    )


                const saleDiscount =
                    Number(
                        item.sale.discount || 0
                    )


                // ------------------------------------------
                // PRODUCT TOTAL ของ Sale
                // ------------------------------------------

                const saleProductItems =
                    saleItems.filter(
                        x =>
                            x.sale.id === item.sale.id
                    )


                const saleProductsTotal =
                    saleProductItems.reduce(

                        (sum, x) =>
                            sum +
                            Number(x.salePrice),

                        0

                    )


                // ------------------------------------------
                // กระจาย Discount ตามสัดส่วนสินค้า
                // ------------------------------------------

                const itemDiscount =
                    saleProductsTotal > 0

                        ? (
                            salePrice /
                            saleProductsTotal
                        ) * saleDiscount

                        : 0


                const discountedSale =
                    Math.max(

                        0,

                        salePrice -
                        itemDiscount

                    )


                // ------------------------------------------
                // RETURN
                // ------------------------------------------

                const refundAmount =
                    item.returns.reduce(

                        (sum, returnItem) =>
                            sum +
                            Number(
                                returnItem.refundAmount
                            ),

                        0

                    )


                // ------------------------------------------
                // NET SALE
                // ------------------------------------------

                const itemNetSale =
                    Math.max(

                        0,

                        discountedSale -
                        refundAmount

                    )


                // ------------------------------------------
                // FULL RETURN
                // ------------------------------------------

                const isFullyReturned =
                    refundAmount >=
                    discountedSale


                // ------------------------------------------
                // OWNER AMOUNT
                //
                // คืนเต็มชิ้น = ไม่ต้องจ่าย Owner
                // ขายสุทธิ = จ่ายต้นทุน
                // ------------------------------------------

                const itemOwnerAmount =
                    isFullyReturned
                        ? 0
                        : costPrice


                // ------------------------------------------
                // PROFIT
                // ------------------------------------------

                const itemProfit =
                    itemNetSale -
                    itemOwnerAmount


                if (isFullyReturned) {

                    returnedItems++

                } else {

                    soldItems++

                }


                salesBeforeDiscount +=
                    salePrice


                discountAmount +=
                    itemDiscount


                returnedAmount +=
                    refundAmount


                netSales +=
                    itemNetSale


                ownerAmount +=
                    itemOwnerAmount


                shopProfit +=
                    itemProfit


                return {

                    saleItemId:
                        item.id,

                    saleId:
                        item.sale.id,

                    stockId:
                        item.consignmentItem.id,

                    name:
                        item.consignmentItem.name,

                    description:
                        item.consignmentItem.description,

                    salePrice,

                    discount:
                        Number(
                            itemDiscount.toFixed(2)
                        ),

                    discountedSale:
                        Number(
                            discountedSale.toFixed(2)
                        ),

                    costPrice,

                    refundAmount,

                    netSale:
                        Number(
                            itemNetSale.toFixed(2)
                        ),

                    ownerAmount:
                        itemOwnerAmount,

                    shopProfit:
                        Number(
                            itemProfit.toFixed(2)
                        ),

                    status:
                        isFullyReturned
                            ? 'RETURNED'
                            : 'SOLD',

                    soldAt:
                        item.sale.createdAt,

                    returns:
                        item.returns.map(returnItem => ({

                            id:
                                returnItem.id,

                            refundAmount:
                                Number(
                                    returnItem.refundAmount
                                ),

                            refundShipping:
                                Number(
                                    returnItem.refundShipping
                                ),

                            reason:
                                returnItem.reason,

                            note:
                                returnItem.note,

                            createdAt:
                                returnItem.createdAt

                        }))

                }

            })


        // ==================================================
        // ROUND SUMMARY
        // ==================================================

        salesBeforeDiscount =
            Number(
                salesBeforeDiscount.toFixed(2)
            )


        discountAmount =
            Number(
                discountAmount.toFixed(2)
            )


        returnedAmount =
            Number(
                returnedAmount.toFixed(2)
            )


        netSales =
            Number(
                netSales.toFixed(2)
            )


        ownerAmount =
            Number(
                ownerAmount.toFixed(2)
            )


        shopProfit =
            Number(
                shopProfit.toFixed(2)
            )


        // ==================================================
        // RESPONSE
        // ==================================================

        res.json({

            owner: {

                id:
                    owner.id,

                name:
                    owner.name,

                phone:
                    owner.phone,

                note:
                    owner.note

            },

            summary: {

                totalSaleItems:
                    saleItems.length,

                soldItems,

                returnedItems,

                salesBeforeDiscount,

                discountAmount,

                returnedAmount,

                netSales,

                ownerAmount,

                shopProfit

            },

            items

        })


    } catch (err) {

        console.log(err)

        res.status(500).json({
            message: 'Server Error'
        })

    }

}