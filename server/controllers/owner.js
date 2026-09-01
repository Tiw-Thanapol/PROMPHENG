const prisma = require('../config/prisma')


// ======================================================
// HELPERS
// ======================================================

const parseId = (value) => {

    const id = Number(value)

    if (!Number.isInteger(id) || id <= 0) {
        return null
    }

    return id
}


const cleanString = (value) => {

    if (value === undefined || value === null) {
        return null
    }

    const result = String(value).trim()

    return result || null
}


const toNumber = (value) => {

    const number = Number(value)

    return Number.isFinite(number)
        ? number
        : 0
}


// ======================================================
// ACCOUNT HELPER
// ======================================================
//
// เช็คว่า user ที่ login อยู่มี accountId ผูกอยู่ก่อนเสมอ
// ไม่งั้นห้าม query/เขียนข้อมูลใดๆ เพราะไม่รู้จะ scope
// เข้า account ไหน
// ======================================================

function getAccountId(req) {

    const accountId =
        Number(
            req.user?.accountId
        )

    if (
        !Number.isInteger(accountId) ||
        accountId <= 0
    ) {

        return null

    }

    return accountId

}


// ======================================================
// CREATE OWNER
// POST /api/owner
// ======================================================

exports.createOwner = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: 'ไม่พบ account ของผู้ใช้งาน'
            })

        }


        const {
            name,
            phone,
            note
        } = req.body


        // ==================================================
        // VALIDATE
        // ==================================================

        if (
            name === undefined ||
            name === null ||
            !String(name).trim()
        ) {

            return res.status(400).json({
                message: 'Owner name is required'
            })

        }


        // ==================================================
        // CREATE
        // ==================================================

        const owner =
            await prisma.owner.create({

                data: {

                    accountId,

                    name:
                        String(name).trim(),

                    phone:
                        cleanString(phone),

                    note:
                        cleanString(note)

                }

            })


        // ==================================================
        // AUDIT
        // ==================================================

        await prisma.auditLog.create({

            data: {

                userId:
                    req.user.id,

                action:
                    'CREATE',

                entity:
                    'Owner',

                entityId:
                    owner.id,

                details:
                    JSON.stringify({

                        name:
                            owner.name,

                        phone:
                            owner.phone,

                        note:
                            owner.note

                    })

            }

        })


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(201).json({

            message:
                'Owner created successfully',

            owner

        })

    } catch (err) {

        console.log(err)

        return res.status(500).json({
            message: 'Server Error'
        })

    }

}


// ======================================================
// GET ALL OWNERS
// GET /api/owners
// ======================================================

exports.getOwners = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: 'ไม่พบ account ของผู้ใช้งาน'
            })

        }


        const owners =
            await prisma.owner.findMany({

                where: {

                    accountId

                },

                include: {

                    _count: {

                        select: {

                            items: true

                        }

                    }

                },

                orderBy: {

                    id:
                        'desc'

                }

            })


        return res.json({

            count:
                owners.length,

            owners:
                owners.map(owner => ({

                    id:
                        owner.id,

                    name:
                        owner.name,

                    phone:
                        owner.phone,

                    note:
                        owner.note,

                    itemsCount:
                        owner._count.items,

                    createdAt:
                        owner.createdAt,

                    updatedAt:
                        owner.updatedAt

                }))

        })

    } catch (err) {

        console.log(err)

        return res.status(500).json({
            message: 'Server Error'
        })

    }

}


// ======================================================
// GET OWNER BY ID
// GET /api/owner/:id
// ======================================================

exports.getOwnerById = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: 'ไม่พบ account ของผู้ใช้งาน'
            })

        }


        const ownerId =
            parseId(req.params.id)


        if (!ownerId) {

            return res.status(400).json({
                message: 'Invalid owner id'
            })

        }


        // ==================================================
        // ใช้ findFirst + accountId แทน findUnique({ id })
        // เพื่อกันดึงข้อมูลข้าม account
        // ==================================================

        const owner =
            await prisma.owner.findFirst({

                where: {

                    id:
                        ownerId,

                    accountId

                },

                include: {

                    items: {

                        orderBy: {

                            id:
                                'desc'

                        }

                    }

                }

            })


        if (!owner) {

            return res.status(404).json({
                message: 'Owner not found'
            })

        }


        return res.json({

            owner

        })

    } catch (err) {

        console.log(err)

        return res.status(500).json({
            message: 'Server Error'
        })

    }

}


// ======================================================
// UPDATE OWNER
// PUT /api/owner/:id
// ======================================================

exports.updateOwner = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: 'ไม่พบ account ของผู้ใช้งาน'
            })

        }


        const ownerId =
            parseId(req.params.id)


        if (!ownerId) {

            return res.status(400).json({
                message: 'Invalid owner id'
            })

        }


        const {
            name,
            phone,
            note
        } = req.body


        // ==================================================
        // GET OLD OWNER
        // scoped ด้วย accountId กันแก้ข้าม account
        // ==================================================

        const oldOwner =
            await prisma.owner.findFirst({

                where: {

                    id:
                        ownerId,

                    accountId

                }

            })


        if (!oldOwner) {

            return res.status(404).json({
                message: 'Owner not found'
            })

        }


        // ==================================================
        // VALIDATE NAME
        // ==================================================

        if (
            name !== undefined &&
            (
                name === null ||
                !String(name).trim()
            )
        ) {

            return res.status(400).json({
                message: 'Owner name cannot be empty'
            })

        }


        // ==================================================
        // UPDATE
        // ==================================================

        const owner =
            await prisma.owner.update({

                where: {

                    id:
                        oldOwner.id

                },

                data: {

                    ...(name !== undefined && {

                        name:
                            String(name).trim()

                    }),

                    ...(phone !== undefined && {

                        phone:
                            cleanString(phone)

                    }),

                    ...(note !== undefined && {

                        note:
                            cleanString(note)

                    })

                }

            })


        // ==================================================
        // AUDIT
        // ==================================================

        await prisma.auditLog.create({

            data: {

                userId:
                    req.user.id,

                action:
                    'UPDATE',

                entity:
                    'Owner',

                entityId:
                    owner.id,

                details:
                    JSON.stringify({

                        before: {

                            name:
                                oldOwner.name,

                            phone:
                                oldOwner.phone,

                            note:
                                oldOwner.note

                        },

                        after: {

                            name:
                                owner.name,

                            phone:
                                owner.phone,

                            note:
                                owner.note

                        }

                    })

            }

        })


        return res.json({

            message:
                'Owner updated successfully',

            owner

        })

    } catch (err) {

        console.log(err)

        return res.status(500).json({
            message: 'Server Error'
        })

    }

}


// ======================================================
// DELETE OWNER
// DELETE /api/owner/:id
// ======================================================

exports.deleteOwner = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: 'ไม่พบ account ของผู้ใช้งาน'
            })

        }


        const ownerId =
            parseId(req.params.id)


        if (!ownerId) {

            return res.status(400).json({
                message: 'Invalid owner id'
            })

        }


        // ==================================================
        // GET OWNER
        // scoped ด้วย accountId กันลบข้าม account
        // ==================================================

        const owner =
            await prisma.owner.findFirst({

                where: {

                    id:
                        ownerId,

                    accountId

                },

                include: {

                    _count: {

                        select: {

                            items: true

                        }

                    }

                }

            })


        if (!owner) {

            return res.status(404).json({
                message: 'Owner not found'
            })

        }


        // ==================================================
        // CHECK STOCK
        // ==================================================

        if (owner._count.items > 0) {

            return res.status(400).json({

                message:
                    'Cannot delete owner because owner still has consignment items'

            })

        }


        // ==================================================
        // DELETE
        // ==================================================

        await prisma.owner.delete({

            where: {

                id:
                    owner.id

            }

        })


        // ==================================================
        // AUDIT
        // ==================================================

        await prisma.auditLog.create({

            data: {

                userId:
                    req.user.id,

                action:
                    'DELETE',

                entity:
                    'Owner',

                entityId:
                    ownerId,

                details:
                    JSON.stringify({

                        name:
                            owner.name,

                        phone:
                            owner.phone,

                        note:
                            owner.note

                    })

            }

        })


        return res.json({

            message:
                'Owner deleted successfully'

        })

    } catch (err) {

        console.log(err)

        return res.status(500).json({
            message: 'Server Error'
        })

    }

}


// ======================================================
// OWNER SUMMARY
// GET /api/owner/:id/summary
// ======================================================

exports.summary = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: 'ไม่พบ account ของผู้ใช้งาน'
            })

        }


        const ownerId =
            parseId(req.params.id)


        if (!ownerId) {

            return res.status(400).json({
                message: 'Invalid owner id'
            })

        }


        // ==================================================
        // CHECK OWNER
        // scoped ด้วย accountId
        // ==================================================

        const owner =
            await prisma.owner.findFirst({

                where: {

                    id:
                        ownerId,

                    accountId

                }

            })


        if (!owner) {

            return res.status(404).json({
                message: 'Owner not found'
            })

        }


        // ==================================================
        // STOCK SUMMARY
        // เพิ่ม accountId กันรั่วซ้ำอีกชั้น แม้ ownerId
        // จะ scope อยู่แล้วก็ตาม (defense in depth)
        // ==================================================

        const stock =
            await prisma.consignmentItem.findMany({

                where: {

                    ownerId,

                    accountId

                },

                select: {

                    id: true,

                    status: true

                }

            })


        const totalStock =
            stock.length


        const availableCount =
            stock.filter(
                item =>
                    item.status === 'AVAILABLE'
            ).length


        const soldStockCount =
            stock.filter(
                item =>
                    item.status === 'SOLD'
            ).length


        const returnedStockCount =
            stock.filter(
                item =>
                    item.status === 'RETURNED'
            ).length


        // ==================================================
        // SALE ITEMS
        // scoped ด้วย accountId ผ่าน consignmentItem และ sale
        // ==================================================

        const saleItems =
            await prisma.saleItem.findMany({

                where: {

                    consignmentItem: {

                        ownerId,

                        accountId

                    },

                    sale: {

                        accountId,

                        status:
                            'COMPLETED'

                    }

                },

                include: {

                    consignmentItem: true,

                    returns: true

                },

                orderBy: {

                    createdAt:
                        'desc'

                }

            })


        // ==================================================
        // CALCULATE SALES
        // ==================================================

        let grossSales = 0
        let returnedAmount = 0
        let netSales = 0
        let totalCost = 0
        let totalProfit = 0

        let soldCount = 0
        let returnedCount = 0


        saleItems.forEach(item => {

            const salePrice =
                toNumber(item.salePrice)


            const costPrice =
                toNumber(
                    item.consignmentItem.costPrice
                )


            const refundAmount =
                item.returns.reduce(

                    (sum, itemReturn) => {

                        return sum +
                            toNumber(
                                itemReturn.refundAmount
                            )

                    },

                    0

                )


            const netSale =
                Math.max(
                    0,
                    salePrice - refundAmount
                )


            const fullyReturned =
                refundAmount >= salePrice


            grossSales +=
                salePrice


            returnedAmount +=
                refundAmount


            netSales +=
                netSale


            totalCost +=
                costPrice


            totalProfit +=
                netSale -
                costPrice


            if (fullyReturned) {

                returnedCount++

            } else {

                soldCount++

            }

        })


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.json({

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

                // STOCK
                totalStock,

                availableCount,

                soldStockCount,

                returnedStockCount,

                // SALES
                totalSaleItems:
                    saleItems.length,

                soldCount,

                returnedCount,

                // MONEY
                grossSales,

                returnedAmount,

                netSales,

                totalCost,

                totalProfit

            }

        })

    } catch (err) {

        console.log(err)

        return res.status(500).json({
            message: 'Server Error'
        })

    }

}


// ======================================================
// OWNER SALES
// GET /api/owner/:id/sales
// ======================================================

exports.sales = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: 'ไม่พบ account ของผู้ใช้งาน'
            })

        }


        const ownerId =
            parseId(req.params.id)


        if (!ownerId) {

            return res.status(400).json({
                message: 'Invalid owner id'
            })

        }


        // ==================================================
        // CHECK OWNER
        // scoped ด้วย accountId
        // ==================================================

        const owner =
            await prisma.owner.findFirst({

                where: {

                    id:
                        ownerId,

                    accountId

                }

            })


        if (!owner) {

            return res.status(404).json({
                message: 'Owner not found'
            })

        }


        // ==================================================
        // GET SALE ITEMS
        // scoped ด้วย accountId ผ่าน consignmentItem และ sale
        // ==================================================

        const saleItems =
            await prisma.saleItem.findMany({

                where: {

                    consignmentItem: {

                        ownerId,

                        accountId

                    },

                    sale: {

                        accountId,

                        status:
                            'COMPLETED'

                    }

                },

                include: {

                    consignmentItem: {

                        include: {

                            owner: true

                        }

                    },

                    returns: true,

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

        const sales =
            saleItems.map(item => {

                const salePrice =
                    toNumber(item.salePrice)


                const costPrice =
                    toNumber(
                        item.consignmentItem.costPrice
                    )


                const refundAmount =
                    item.returns.reduce(

                        (sum, itemReturn) => {

                            return sum +
                                toNumber(
                                    itemReturn.refundAmount
                                )

                        },

                        0

                    )


                const netSale =
                    Math.max(
                        0,
                        salePrice - refundAmount
                    )


                const isReturned =
                    refundAmount >= salePrice


                return {

                    saleId:
                        item.sale.id,

                    saleItemId:
                        item.id,

                    soldAt:
                        item.sale.createdAt,

                    status:
                        isReturned
                            ? 'RETURNED'
                            : 'SOLD',

                    product: {

                        id:
                            item.consignmentItem.id,

                        name:
                            item.consignmentItem.name,

                        description:
                            item.consignmentItem.description

                    },

                    owner: {

                        id:
                            item.consignmentItem.owner.id,

                        name:
                            item.consignmentItem.owner.name

                    },

                    salePrice,

                    costPrice,

                    refundAmount,

                    netSale,

                    profit:
                        netSale -
                        costPrice,

                    customer:
                        item.sale.customer
                            ? {

                                id:
                                    item.sale.customer.id,

                                name:
                                    item.sale.customer.name,

                                phone:
                                    item.sale.customer.phone,

                                address:
                                    item.sale.customer.address

                            }
                            : null,

                    createdBy:
                        item.sale.createdBy

                }

            })


        // ==================================================
        // SUMMARY
        // ==================================================

        const summary = {

            totalItems:
                sales.length,

            soldCount:
                sales.filter(
                    item =>
                        item.status === 'SOLD'
                ).length,

            returnedCount:
                sales.filter(
                    item =>
                        item.status === 'RETURNED'
                ).length,

            grossSales:
                sales.reduce(
                    (sum, item) =>
                        sum +
                        item.salePrice,
                    0
                ),

            returnedAmount:
                sales.reduce(
                    (sum, item) =>
                        sum +
                        item.refundAmount,
                    0
                ),

            netSales:
                sales.reduce(
                    (sum, item) =>
                        sum +
                        item.netSale,
                    0
                ),

            totalCost:
                sales.reduce(
                    (sum, item) =>
                        sum +
                        item.costPrice,
                    0
                ),

            totalProfit:
                sales.reduce(
                    (sum, item) =>
                        sum +
                        item.profit,
                    0
                )

        }


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.json({

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

            count:
                sales.length,

            summary,

            sales

        })

    } catch (err) {

        console.log(err)

        return res.status(500).json({
            message: 'Server Error'
        })

    }

}