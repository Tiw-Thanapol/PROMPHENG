const prisma = require("../config/prisma")


// ======================================================
// HELPERS
// ======================================================

function isPositiveInteger(value) {

    const number =
        Number(value)

    return (
        Number.isInteger(number) &&
        number > 0
    )
}


// ======================================================
// GET PRODUCT HISTORY
// GET /api/product/:id/history
//
// แสดงประวัติของ ConsignmentItem
//
// IMPORTANT
//
// SaleItem 1 record สามารถมี quantity หลายชิ้นได้
//
// เช่น:
//
// SaleItem
// quantity = 3
// salePrice = 199
//
// Product History ต้องแสดง:
//
// ครั้งที่ขาย = 1
// ขายทั้งหมด = 3 ชิ้น
//
// และตาราง:
//
// 1  quantity 1
// 2  quantity 1
// 3  quantity 1
//
// ดังนั้น salesHistory จะ EXPAND
// quantity ออกเป็นรายการละ 1 ชิ้น
// ======================================================

exports.getProductHistory = async (req, res) => {

    try {

        // ==================================================
        // PRODUCT ID
        // ==================================================

        const productId =
            Number(
                req.params.id
            )


        if (
            !isPositiveInteger(productId)
        ) {

            return res.status(400).json({

                message:
                    "Invalid product id"

            })

        }


        // ==================================================
        // GET PRODUCT
        // ==================================================

        const product =
            await prisma.consignmentItem.findUnique({

                where: {

                    id:
                        productId

                },

                include: {

                    owner: true,

                    saleItems: {

                        orderBy: {

                            createdAt:
                                "desc"

                        },

                        include: {

                            sale: {

                                include: {

                                    customer: true,

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

                            },

                            returns: true

                        }

                    }

                }

            })


        // ==================================================
        // PRODUCT NOT FOUND
        // ==================================================

        if (!product) {

            return res.status(404).json({

                message:
                    "Product not found"

            })

        }


        // ==================================================
        // SALES HISTORY
        //
        // IMPORTANT
        //
        // SaleItem:
        //
        // quantity = 3
        //
        // จะถูกแปลงเป็น:
        //
        // row 1 = quantity 1
        // row 2 = quantity 1
        // row 3 = quantity 1
        //
        // แต่ยังใช้ saleItemId / saleId เดิม
        // ==================================================

        const salesHistory =
            product.saleItems.flatMap(
                saleItem => {

                    const quantity =
                        Number(
                            saleItem.quantity
                        )


                    const salePrice =
                        Number(
                            saleItem.salePrice
                        )


                    const costPrice =
                        Number(
                            product.costPrice
                        )


                    // --------------------------------------
                    // RETURN
                    // --------------------------------------

                    const refundAmount =
                        saleItem.returns.reduce(
                            (
                                total,
                                returnItem
                            ) =>
                                total +
                                Number(
                                    returnItem.refundAmount || 0
                                ),
                            0
                        )


                    // --------------------------------------
                    // สร้าง 1 row ต่อ 1 ชิ้น
                    // --------------------------------------

                    return Array.from(
                        {
                            length:
                                quantity
                        },
                        (
                            _,
                            index
                        ) => {

                            const salesTotal =
                                salePrice


                            const totalCost =
                                costPrice


                            const profit =
                                salesTotal -
                                totalCost


                            return {

                                // --------------------------------
                                // SALE ITEM
                                // --------------------------------

                                saleItemId:
                                    saleItem.id,

                                saleId:
                                    saleItem.saleId,

                                productId:
                                    saleItem.consignmentItemId,


                                // --------------------------------
                                // 1 ROW = 1 PIECE
                                // --------------------------------

                                quantity:
                                    1,


                                // --------------------------------
                                // UNIT NUMBER
                                //
                                // เช่นขาย 3 ชิ้น:
                                //
                                // 1 / 3
                                // 2 / 3
                                // 3 / 3
                                // --------------------------------

                                unitNumber:
                                    index + 1,

                                unitTotal:
                                    quantity,


                                // --------------------------------
                                // PRICE
                                // --------------------------------

                                salePrice,

                                salesTotal,

                                costPrice,

                                totalCost,

                                profit,


                                // --------------------------------
                                // DATE
                                // --------------------------------

                                soldAt:
                                    saleItem.createdAt,

                                saleCreatedAt:
                                    saleItem.sale.createdAt,


                                // --------------------------------
                                // STATUS
                                // --------------------------------

                                saleStatus:
                                    saleItem.sale.status,


                                // --------------------------------
                                // CUSTOMER
                                // --------------------------------

                                customer:
                                    saleItem.sale.customer
                                        ? {

                                            id:
                                                saleItem.sale.customer.id,

                                            name:
                                                saleItem.sale.customer.name,

                                            phone:
                                                saleItem.sale.customer.phone

                                        }
                                        : null,


                                // --------------------------------
                                // CREATED BY
                                // --------------------------------

                                createdBy:
                                    saleItem.sale.createdBy
                                        ? {

                                            id:
                                                saleItem.sale.createdBy.id,

                                            name:
                                                saleItem.sale.createdBy.name,

                                            email:
                                                saleItem.sale.createdBy.email

                                        }
                                        : null,


                                // --------------------------------
                                // RETURNS
                                // --------------------------------

                                returns: {

                                    count:
                                        saleItem.returns.length,

                                    refundAmount,

                                    // Return schema ตอนนี้
                                    // ไม่มี quantity
                                    returnedQuantity:
                                        0

                                }

                            }

                        }
                    )

                }
            )


        // ==================================================
        // SALES SUMMARY
        //
        // totalSales
        // = จำนวนครั้งที่ขายจริง
        //
        // ไม่ใช่ salesHistory.length
        //
        // เพราะ salesHistory ถูก expand แล้ว
        // ==================================================

        const totalSalesCount =
            product.saleItems.length


        // ==================================================
        // TOTAL SOLD QUANTITY
        // ==================================================

        const totalSoldQuantity =
            salesHistory.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.quantity,
                0
            )


        // ==================================================
        // TOTAL SALES AMOUNT
        // ==================================================

        const totalSalesAmount =
            salesHistory.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.salesTotal,
                0
            )


        // ==================================================
        // TOTAL COST
        // ==================================================

        const totalCost =
            salesHistory.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.totalCost,
                0
            )


        // ==================================================
        // TOTAL PROFIT
        // ==================================================

        const totalProfit =
            salesHistory.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.profit,
                0
            )


        // ==================================================
        // GET AUDIT LOGS
        //
        // AuditLog ของ Sale
        //
        // entity = Sale
        // entityId = Sale ID
        // ==================================================

        const saleIds =
            [
                ...new Set(
                    product.saleItems.map(
                        saleItem =>
                            saleItem.saleId
                    )
                )
            ]


        let auditLogs = []


        if (
            saleIds.length > 0
        ) {

            auditLogs =
                await prisma.auditLog.findMany({

                    where: {

                        entity:
                            "Sale",

                        entityId: {

                            in:
                                saleIds

                        }

                    },

                    include: {

                        user: {

                            select: {

                                id:
                                    true,

                                name:
                                    true,

                                email:
                                    true,

                                role:
                                    true,

                                picture:
                                    true

                            }

                        }

                    },

                    orderBy: {

                        createdAt:
                            "desc"

                    }

                })

        }


        // ==================================================
        // FORMAT AUDIT LOGS
        // ==================================================

        const formattedAuditLogs =
            auditLogs.map(
                log => {

                    let details =
                        null


                    if (
                        log.details
                    ) {

                        try {

                            details =
                                typeof log.details === "string"
                                    ? JSON.parse(log.details)
                                    : log.details

                        } catch (error) {

                            details =
                                log.details

                        }

                    }


                    // --------------------------------------
                    // FIND PRODUCT ITEM
                    //
                    // Sale หนึ่งรายการอาจมีหลายสินค้า
                    // --------------------------------------

                    let itemDetails =
                        null


                    if (
                        details &&
                        Array.isArray(
                            details.items
                        )
                    ) {

                        itemDetails =
                            details.items.find(
                                item =>
                                    Number(
                                        item.consignmentItemId
                                    ) === productId
                            ) || null

                    }


                    return {

                        id:
                            log.id,

                        userId:
                            log.userId,

                        action:
                            log.action,

                        entity:
                            log.entity,

                        entityId:
                            log.entityId,

                        createdAt:
                            log.createdAt,

                        user:
                            log.user,

                        details,

                        productItem:
                            itemDetails

                    }

                }
            )


        // ==================================================
        // PRODUCT RESPONSE
        // ==================================================

        const formattedProduct = {

            id:
                product.id,

            ownerId:
                product.ownerId,

            name:
                product.name,

            description:
                product.description,

            quantity:
                Number(
                    product.quantity
                ),

            costPrice:
                Number(
                    product.costPrice
                ),

            actualSalePrice:
                product.actualSalePrice !== null
                    ? Number(
                        product.actualSalePrice
                    )
                    : null,

            status:
                product.status,

            purchaseDate:
                product.purchaseDate,

            soldAt:
                product.soldAt,

            note:
                product.note,

            createdAt:
                product.createdAt,

            updatedAt:
                product.updatedAt,

            owner:
                product.owner

        }


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.json({

            product:
                formattedProduct,


            // ----------------------------------------------
            // SUMMARY
            // ----------------------------------------------

            summary: {

                // จำนวนครั้งที่ขาย
                // เช่น SaleItem 1 record = 1 ครั้ง

                totalSales:
                    totalSalesCount,


                // จำนวนชิ้นทั้งหมด
                // เช่น quantity 3 = 3 ชิ้น

                totalSoldQuantity,


                // ยอดขายรวม
                // 3 × 199 = 597

                totalSalesAmount,


                // ต้นทุนรวม
                // 3 × 99 = 297

                totalCost,


                // กำไรรวม
                // 597 - 297 = 300

                totalProfit

            },


            // ----------------------------------------------
            // SALES HISTORY
            //
            // 1 ชิ้น = 1 row
            // ----------------------------------------------

            salesHistory,


            // ----------------------------------------------
            // AUDIT LOGS
            // ----------------------------------------------

            auditLogs:
                formattedAuditLogs

        })

    } catch (err) {

        console.error(
            "GET PRODUCT HISTORY ERROR:",
            err
        )


        return res.status(500).json({

            message:
                err.message ||
                "Server Error"

        })

    }

}