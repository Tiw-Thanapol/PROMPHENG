const prisma = require('../config/prisma')


// ======================================================
// CREATE RETURN
// POST /api/returns/:saleItemId
//
// คืนสินค้ารายชิ้นจาก Sale
// ======================================================

exports.create = async (req, res) => {

    try {

        const saleItemId =
            Number(req.params.saleItemId)


        // ==================================================
        // VALIDATE ID
        // ==================================================

        if (Number.isNaN(saleItemId)) {

            return res.status(400).json({
                message: 'Invalid sale item id'
            })
        }


        // ==================================================
        // REQUEST DATA
        // ==================================================

        const {
            refundAmount,
            refundShipping,
            reason,
            note
        } = req.body


        // ==================================================
        // GET SALE ITEM
        // ==================================================

        const saleItem =
            await prisma.saleItem.findUnique({

                where: {
                    id: saleItemId
                },

                include: {

                    sale: true,

                    consignmentItem: {

                        include: {
                            owner: true
                        }
                    },

                    returns: true
                }
            })


        if (!saleItem) {

            return res.status(404).json({
                message: 'Sale item not found'
            })
        }


        // ==================================================
        // CHECK SALE STATUS
        // ==================================================

        if (
            saleItem.sale.status !== 'COMPLETED'
        ) {

            return res.status(400).json({

                message:
                    'Only completed sale can be returned'
            })
        }


        // ==================================================
        // CHECK ALREADY RETURNED
        // ==================================================

        if (
            saleItem.returns &&
            saleItem.returns.length > 0
        ) {

            return res.status(400).json({

                message:
                    'This item has already been returned'
            })
        }


        // ==================================================
        // CHECK STOCK STATUS
        // ==================================================

        if (
            saleItem.consignmentItem.status !== 'SOLD'
        ) {

            return res.status(400).json({

                message:
                    'This item cannot be returned',

                status:
                    saleItem.consignmentItem.status
            })
        }


        // ==================================================
        // CALCULATE REFUND
        // ==================================================

        let finalRefundAmount


        if (
            refundAmount === undefined ||
            refundAmount === null ||
            refundAmount === ''
        ) {

            finalRefundAmount =
                Number(saleItem.salePrice)

        } else {

            finalRefundAmount =
                Number(refundAmount)


            if (
                Number.isNaN(finalRefundAmount) ||
                finalRefundAmount < 0
            ) {

                return res.status(400).json({

                    message:
                        'Invalid refund amount'
                })
            }
        }


        // ==================================================
        // REFUND SHIPPING
        // ==================================================

        let finalRefundShipping = 0


        if (
            refundShipping !== undefined &&
            refundShipping !== null &&
            refundShipping !== ''
        ) {

            finalRefundShipping =
                Number(refundShipping)


            if (
                Number.isNaN(finalRefundShipping) ||
                finalRefundShipping < 0
            ) {

                return res.status(400).json({

                    message:
                        'Invalid refund shipping'
                })
            }
        }


        // ==================================================
        // TRANSACTION
        // ==================================================

        const result =
            await prisma.$transaction(
                async tx => {

                    // --------------------------------------
                    // CHECK AGAINST DUPLICATE
                    // --------------------------------------

                    const existingReturn =
                        await tx.return.findFirst({

                            where: {

                                saleItemId
                            }
                        })


                    if (existingReturn) {

                        throw new Error(
                            'RETURN_ALREADY_EXISTS'
                        )
                    }


                    // --------------------------------------
                    // CHANGE STOCK STATUS
                    // --------------------------------------

                    const updatedStock =
                        await tx.consignmentItem.updateMany({

                            where: {

                                id:
                                    saleItem.consignmentItemId,

                                status:
                                    'SOLD'
                            },

                            data: {

                                status:
                                    'RETURNED'
                            }
                        })


                    // --------------------------------------
                    // STOCK CONFLICT
                    // --------------------------------------

                    if (
                        updatedStock.count !== 1
                    ) {

                        throw new Error(
                            'RETURN_STOCK_CONFLICT'
                        )
                    }


                    // --------------------------------------
                    // CREATE RETURN RECORD
                    // --------------------------------------

                    const returnRecord =
                        await tx.return.create({

                            data: {

                                saleId:
                                    saleItem.saleId,

                                saleItemId:
                                    saleItem.id,

                                refundAmount:
                                    finalRefundAmount,

                                refundShipping:
                                    finalRefundShipping,

                                reason:
                                    reason
                                        ? String(reason).trim()
                                        : null,

                                note:
                                    note
                                        ? String(note).trim()
                                        : null,

                                createdById:
                                    req.user.id
                            },

                            include: {

                                saleItem: {

                                    include: {

                                        consignmentItem: {

                                            include: {
                                                owner: true
                                            }
                                        }
                                    }
                                }
                            }
                        })


                    // --------------------------------------
                    // AUDIT LOG
                    // --------------------------------------

                    await tx.auditLog.create({

                        data: {

                            userId:
                                req.user.id,

                            action:
                                'CREATE',

                            entity:
                                'Return',

                            entityId:
                                returnRecord.id,

                            details:
                                JSON.stringify({

                                    saleId:
                                        saleItem.saleId,

                                    saleItemId:
                                        saleItem.id,

                                    consignmentItemId:
                                        saleItem.consignmentItemId,

                                    refundAmount:
                                        finalRefundAmount,

                                    refundShipping:
                                        finalRefundShipping,

                                    reason:
                                        reason || null,

                                    note:
                                        note || null
                                })
                        }
                    })


                    return returnRecord
                }
            )


        // ==================================================
        // RESPONSE
        // ==================================================

        const returnedItem =
            result.saleItem


        res.status(201).json({

            message:
                'Item returned successfully',

            return: {

                id:
                    result.id,

                saleId:
                    result.saleId,

                saleItemId:
                    result.saleItemId,

                refundAmount:
                    Number(result.refundAmount),

                refundShipping:
                    Number(result.refundShipping),

                reason:
                    result.reason,

                note:
                    result.note,

                product: {

                    id:
                        returnedItem.consignmentItem.id,

                    name:
                        returnedItem.consignmentItem.name,

                    costPrice:
                        Number(
                            returnedItem
                                .consignmentItem
                                .costPrice
                        ),

                    status:
                        returnedItem
                            .consignmentItem
                            .status
                },

                salePrice:
                    Number(
                        returnedItem.salePrice
                    ),

                owner:
                    returnedItem
                        .consignmentItem
                        .owner,

                createdAt:
                    result.createdAt
            }
        })


    } catch (err) {

        console.log(err)


        // ==================================================
        // ALREADY RETURNED
        // ==================================================

        if (
            err.message ===
            'RETURN_ALREADY_EXISTS'
        ) {

            return res.status(409).json({

                message:
                    'This item has already been returned'
            })
        }


        // ==================================================
        // STOCK CONFLICT
        // ==================================================

        if (
            err.message ===
            'RETURN_STOCK_CONFLICT'
        ) {

            return res.status(409).json({

                message:
                    'Stock is no longer available for return'
            })
        }


        res.status(500).json({

            message:
                'Server Error'
        })
    }
}



// ======================================================
// GET RETURN HISTORY BY SALE
// GET /api/returns/sale/:saleId
// ======================================================

exports.listBySale = async (req, res) => {

    try {

        const saleId =
            Number(req.params.saleId)


        // ==================================================
        // VALIDATE ID
        // ==================================================

        if (Number.isNaN(saleId)) {

            return res.status(400).json({

                message:
                    'Invalid sale id'
            })
        }


        // ==================================================
        // CHECK SALE
        // ==================================================

        const sale =
            await prisma.sale.findUnique({

                where: {
                    id: saleId
                }
            })


        if (!sale) {

            return res.status(404).json({

                message:
                    'Sale not found'
            })
        }


        // ==================================================
        // GET RETURN RECORDS
        // ==================================================

        const returns =
            await prisma.return.findMany({

                where: {

                    saleId
                },

                include: {

                    saleItem: {

                        include: {

                            consignmentItem: {

                                include: {
                                    owner: true
                                }
                            }
                        }
                    },

                    createdBy: {

                        select: {

                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },

                orderBy: {

                    createdAt:
                        'desc'
                }
            })


        // ==================================================
        // FORMAT
        // ==================================================

        const returnedItems =
            returns.map(item => ({

                returnId:
                    item.id,

                saleItemId:
                    item.saleItemId,

                consignmentItemId:
                    item.saleItem.consignmentItemId,

                product:
                    item.saleItem
                        .consignmentItem
                        .name,

                salePrice:
                    Number(
                        item.saleItem.salePrice
                    ),

                costPrice:
                    Number(
                        item.saleItem
                            .consignmentItem
                            .costPrice
                    ),

                refundAmount:
                    Number(
                        item.refundAmount
                    ),

                refundShipping:
                    Number(
                        item.refundShipping
                    ),

                reason:
                    item.reason,

                note:
                    item.note,

                owner:
                    item.saleItem
                        .consignmentItem
                        .owner,

                status:
                    item.saleItem
                        .consignmentItem
                        .status,

                createdBy:
                    item.createdBy,

                createdAt:
                    item.createdAt,

                updatedAt:
                    item.updatedAt
            }))


        // ==================================================
        // SUMMARY
        // ==================================================

        const totalRefund =
            returnedItems.reduce(

                (sum, item) =>
                    sum +
                    item.refundAmount,

                0
            )


        const totalRefundShipping =
            returnedItems.reduce(

                (sum, item) =>
                    sum +
                    item.refundShipping,

                0
            )


        // ==================================================
        // RESPONSE
        // ==================================================

        res.json({

            saleId,

            count:
                returnedItems.length,

            totalRefund,

            totalRefundShipping,

            returnedItems
        })


    } catch (err) {

        console.log(err)

        res.status(500).json({

            message:
                'Server Error'
        })
    }
}