const prisma = require('../config/prisma')


// ======================================================
// GET OWNER PROFIT
// GET /api/owners/:id/profit
// ======================================================

exports.ownerProfit = async (req, res) => {

    try {

        const ownerId =
            Number(req.params.id)


        // ==================================================
        // VALIDATE OWNER ID
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
        // GET OWNER
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
        //
        // เอาเฉพาะ Sale ที่ COMPLETED
        // และเป็นสินค้าของ Owner คนนี้
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

                        include: {

                            items: {

                                select: {

                                    id: true,

                                    salePrice: true

                                }
                            }
                        }
                    },

                    consignmentItem: {

                        select: {

                            id: true,

                            ownerId: true,

                            name: true,

                            description: true,

                            costPrice: true
                        }
                    },

                    returns: true
                },

                orderBy: {

                    createdAt: 'asc'
                }
            })


        // ==================================================
        // INITIAL SUMMARY
        // ==================================================

        let totalSaleItems = 0

        let soldItems = 0

        let returnedItems = 0

        let salesBeforeDiscount = 0

        let discountAmount = 0

        let returnedAmount = 0

        let netSales = 0

        let ownerAmount = 0

        let shopProfit = 0


        // ==================================================
        // CALCULATE EACH ITEM
        // ==================================================

        const items =
            saleItems.map(item => {


                // ==================================================
                // BASIC VALUES
                // ==================================================

                const salePrice =
                    Number(
                        item.salePrice || 0
                    )


                const costPrice =
                    Number(
                        item.consignmentItem.costPrice || 0
                    )


                // ==================================================
                // TOTAL PRODUCT VALUE IN THIS SALE
                //
                // ใช้สำหรับกระจาย Discount
                // ==================================================

                const saleProductsTotal =
                    item.sale.items.reduce(

                        (sum, saleItem) =>
                            sum +
                            Number(
                                saleItem.salePrice || 0
                            ),

                        0
                    )


                // ==================================================
                // SALE DISCOUNT
                //
                // เช่น
                //
                // Item 100
                // Item 150
                // Discount 20
                //
                // Item 100 -> discount 8
                // Item 150 -> discount 12
                // ==================================================

                const saleDiscount =
                    Number(
                        item.sale.discount || 0
                    )


                const itemDiscount =
                    saleProductsTotal > 0

                        ? (
                            salePrice /
                            saleProductsTotal
                        ) *
                        saleDiscount

                        : 0


                // ==================================================
                // RETURN AMOUNT
                // ==================================================

                const refundAmount =
                    item.returns.reduce(

                        (sum, returnItem) =>
                            sum +
                            Number(
                                returnItem.refundAmount || 0
                            ),

                        0
                    )


                // ==================================================
                // PRICE AFTER DISCOUNT
                // ==================================================

                const discountedSale =
                    Math.max(

                        0,

                        salePrice -
                        itemDiscount

                    )


                // ==================================================
                // NET SALE AFTER RETURN
                // ==================================================

                const netSale =
                    Math.max(

                        0,

                        discountedSale -
                        refundAmount

                    )


                // ==================================================
                // FULL RETURN
                //
                // ถ้าคืนเงิน >= ราคาขายเดิม
                // ถือว่าคืนทั้งชิ้น
                // ==================================================

                const isReturned =
                    refundAmount >= salePrice


                // ==================================================
                // OWNER AMOUNT
                //
                // คืนเต็ม -> Owner ไม่ได้รับต้นทุน
                //
                // คืนบางส่วน -> ยังถือว่าขายอยู่
                // Owner ได้ต้นทุนเต็ม
                // ==================================================

                const itemOwnerAmount =
                    isReturned
                        ? 0
                        : costPrice


                // ==================================================
                // SHOP PROFIT
                // ==================================================

                const itemShopProfit =
                    netSale -
                    itemOwnerAmount


                // ==================================================
                // SUMMARY
                // ==================================================

                totalSaleItems += 1


                if (isReturned) {

                    returnedItems += 1

                } else {

                    soldItems += 1

                }


                salesBeforeDiscount +=
                    salePrice


                discountAmount +=
                    itemDiscount


                returnedAmount +=
                    refundAmount


                netSales +=
                    netSale


                ownerAmount +=
                    itemOwnerAmount


                shopProfit +=
                    itemShopProfit


                // ==================================================
                // RESPONSE ITEM
                // ==================================================

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

                    salePrice:
                        Number(
                            salePrice.toFixed(2)
                        ),

                    discount:
                        Number(
                            itemDiscount.toFixed(2)
                        ),

                    discountedSale:
                        Number(
                            discountedSale.toFixed(2)
                        ),

                    costPrice:
                        Number(
                            costPrice.toFixed(2)
                        ),

                    refundAmount:
                        Number(
                            refundAmount.toFixed(2)
                        ),

                    netSale:
                        Number(
                            netSale.toFixed(2)
                        ),

                    ownerAmount:
                        Number(
                            itemOwnerAmount.toFixed(2)
                        ),

                    shopProfit:
                        Number(
                            itemShopProfit.toFixed(2)
                        ),

                    status:
                        isReturned
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
                                    returnItem.refundAmount || 0
                                ),

                            refundShipping:
                                Number(
                                    returnItem.refundShipping || 0
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

                totalSaleItems,

                soldItems,

                returnedItems,

                salesBeforeDiscount:
                    Number(
                        salesBeforeDiscount.toFixed(2)
                    ),

                discountAmount:
                    Number(
                        discountAmount.toFixed(2)
                    ),

                returnedAmount:
                    Number(
                        returnedAmount.toFixed(2)
                    ),

                netSales:
                    Number(
                        netSales.toFixed(2)
                    ),

                ownerAmount:
                    Number(
                        ownerAmount.toFixed(2)
                    ),

                shopProfit:
                    Number(
                        shopProfit.toFixed(2)
                    )
            },


            items

        })


    } catch (err) {

        console.error(
            'ownerProfit error:',
            err
        )

        res.status(500).json({

            message: 'Server Error'

        })
    }

}
