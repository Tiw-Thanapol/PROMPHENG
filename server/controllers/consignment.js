const prisma = require('../config/prisma')


// ======================================================
// HELPERS
// ======================================================

const parseId = (value) => {

    const id = Number(value)

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        return null
    }

    return id
}


const getAccountId = (req) => {

    const accountId =
        Number(req.user?.accountId)

    if (
        !Number.isInteger(accountId) ||
        accountId <= 0
    ) {
        return null
    }

    return accountId
}


// ======================================================
// CREATE
// POST /api/consignment
// ======================================================

exports.create = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: 'ไม่พบ account ของผู้ใช้งาน'
            })

        }


        const {
            ownerId,
            name,
            description,
            costPrice,
            status
        } = req.body


        const parsedOwnerId =
            parseId(ownerId)


        // ==================================================
        // VALIDATE
        // ==================================================

        if (
            !parsedOwnerId ||
            name === undefined ||
            name === null ||
            !String(name).trim() ||
            costPrice === undefined
        ) {

            return res.status(400).json({
                message:
                    'ownerId, name and costPrice are required'
            })

        }


        const parsedCostPrice =
            Number(costPrice)


        if (
            !Number.isFinite(parsedCostPrice) ||
            parsedCostPrice < 0
        ) {

            return res.status(400).json({
                message: 'Invalid cost price'
            })

        }


        // ==================================================
        // CHECK OWNER
        // ==================================================
        //
        // สำคัญ:
        // owner ต้องอยู่ใน account เดียวกับ user
        //
        // ป้องกัน:
        // Account B ส่ง ownerId ของ Account A
        // แล้วสร้างสินค้าเข้า Owner ของ Account A
        // ==================================================

        const owner =
            await prisma.owner.findFirst({

                where: {

                    id:
                        parsedOwnerId,

                    accountId

                }

            })


        if (!owner) {

            return res.status(404).json({
                message: 'Owner not found'
            })

        }


        // ==================================================
        // CREATE
        // ==================================================

        const item =
            await prisma.consignmentItem.create({

                data: {

                    accountId,

                    ownerId:
                        parsedOwnerId,

                    name:
                        String(name).trim(),

                    description:
                        description !== undefined &&
                        description !== null
                            ? String(description).trim() || null
                            : null,

                    costPrice:
                        parsedCostPrice,

                    status:
                        status || 'AVAILABLE'

                },

                include: {

                    owner: true

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
                    'ConsignmentItem',

                entityId:
                    item.id,

                details:
                    JSON.stringify({

                        name:
                            item.name,

                        ownerId:
                            item.ownerId,

                        costPrice:
                            item.costPrice

                    })

            }

        })


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(201).json({

            message:
                'Consignment item created successfully',

            item

        })

    } catch (err) {

        console.log(err)

        return res.status(500).json({
            message: 'Server Error'
        })

    }

}


// ======================================================
// READ ALL
// GET /api/consignments
// ======================================================

exports.list = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: 'ไม่พบ account ของผู้ใช้งาน'
            })

        }


        const items =
            await prisma.consignmentItem.findMany({

                where: {

                    accountId

                },

                include: {

                    owner: true,

                    _count: {

                        select: {

                            saleItems: true

                        }

                    }

                },

                orderBy: {

                    id:
                        'desc'

                }

            })


        return res.json({

            items

        })

    } catch (err) {

        console.log(err)

        return res.status(500).json({
            message: 'Server Error'
        })

    }

}


// ======================================================
// READ ONE
// GET /api/consignment/:id
// ======================================================

exports.read = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: 'ไม่พบ account ของผู้ใช้งาน'
            })

        }


        const id =
            parseId(req.params.id)


        if (!id) {

            return res.status(400).json({
                message: 'Invalid consignment item id'
            })

        }


        // ==================================================
        // ACCOUNT SCOPED
        // ==================================================

        const item =
            await prisma.consignmentItem.findFirst({

                where: {

                    id,

                    accountId

                },

                include: {

                    owner: true,

                    saleItems: {

                        where: {

                            sale: {

                                accountId

                            }

                        },

                        include: {

                            sale: {

                                include: {

                                    customer: true

                                }

                            }

                        }

                    }

                }

            })


        if (!item) {

            return res.status(404).json({
                message:
                    'Consignment item not found'
            })

        }


        return res.json({

            item

        })

    } catch (err) {

        console.log(err)

        return res.status(500).json({
            message: 'Server Error'
        })

    }

}


// ======================================================
// UPDATE
// PUT /api/consignment/:id
// ======================================================

exports.update = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: 'ไม่พบ account ของผู้ใช้งาน'
            })

        }


        const id =
            parseId(req.params.id)


        if (!id) {

            return res.status(400).json({
                message: 'Invalid consignment item id'
            })

        }


        const {
            ownerId,
            name,
            description,
            costPrice,
            status
        } = req.body


        // ==================================================
        // GET OLD ITEM
        // ==================================================

        const oldItem =
            await prisma.consignmentItem.findFirst({

                where: {

                    id,

                    accountId

                }

            })


        if (!oldItem) {

            return res.status(404).json({
                message:
                    'Consignment item not found'
            })

        }


        // ==================================================
        // VALIDATE OWNER
        // ==================================================

        let parsedOwnerId = null


        if (ownerId !== undefined) {

            parsedOwnerId =
                parseId(ownerId)


            if (!parsedOwnerId) {

                return res.status(400).json({
                    message: 'Invalid owner id'
                })

            }


            const owner =
                await prisma.owner.findFirst({

                    where: {

                        id:
                            parsedOwnerId,

                        accountId

                    }

                })


            if (!owner) {

                return res.status(404).json({
                    message:
                        'Owner not found'
                })

            }

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
                message:
                    'Item name cannot be empty'
            })

        }


        // ==================================================
        // VALIDATE COST PRICE
        // ==================================================

        let parsedCostPrice = null


        if (costPrice !== undefined) {

            parsedCostPrice =
                Number(costPrice)


            if (
                !Number.isFinite(parsedCostPrice) ||
                parsedCostPrice < 0
            ) {

                return res.status(400).json({
                    message:
                        'Invalid cost price'
                })

            }

        }


        // ==================================================
        // UPDATE
        // ==================================================
        //
        // ใช้ updateMany + accountId
        // เพื่อให้ mutation เองก็มี account scope
        // ==================================================

        const updateResult =
            await prisma.consignmentItem.updateMany({

                where: {

                    id,

                    accountId

                },

                data: {

                    ...(ownerId !== undefined && {

                        ownerId:
                            parsedOwnerId

                    }),

                    ...(name !== undefined && {

                        name:
                            String(name).trim()

                    }),

                    ...(description !== undefined && {

                        description:
                            description === null
                                ? null
                                : String(description).trim() || null

                    }),

                    ...(costPrice !== undefined && {

                        costPrice:
                            parsedCostPrice

                    }),

                    ...(status !== undefined && {

                        status

                    })

                }

            })


        if (updateResult.count !== 1) {

            return res.status(404).json({
                message:
                    'Consignment item not found'
            })

        }


        // ==================================================
        // GET UPDATED ITEM
        // ==================================================

        const item =
            await prisma.consignmentItem.findFirst({

                where: {

                    id,

                    accountId

                },

                include: {

                    owner: true

                }

            })


        if (!item) {

            return res.status(404).json({
                message:
                    'Consignment item not found'
            })

        }


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
                    'ConsignmentItem',

                entityId:
                    item.id,

                details:
                    JSON.stringify({

                        before:
                            oldItem,

                        after:
                            item

                    })

            }

        })


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.json({

            message:
                'Consignment item updated successfully',

            item

        })

    } catch (err) {

        console.log(err)

        return res.status(500).json({
            message: 'Server Error'
        })

    }

}


// ======================================================
// DELETE
// DELETE /api/consignment/:id
// ======================================================

exports.remove = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: 'ไม่พบ account ของผู้ใช้งาน'
            })

        }


        const id =
            parseId(req.params.id)


        if (!id) {

            return res.status(400).json({
                message:
                    'Invalid consignment item id'
            })

        }


        // ==================================================
        // GET ITEM
        // ==================================================

        const item =
            await prisma.consignmentItem.findFirst({

                where: {

                    id,

                    accountId

                }

            })


        if (!item) {

            return res.status(404).json({
                message:
                    'Consignment item not found'
            })

        }


        // ==================================================
        // CHECK SALE HISTORY
        // ==================================================

        const saleCount =
            await prisma.saleItem.count({

                where: {

                    consignmentItemId:
                        id,

                    sale: {

                        accountId

                    }

                }

            })


        if (saleCount > 0) {

            return res.status(400).json({

                message:
                    'Cannot delete item because it has sale history'

            })

        }


        // ==================================================
        // DELETE
        // ==================================================

        const deleteResult =
            await prisma.consignmentItem.deleteMany({

                where: {

                    id,

                    accountId

                }

            })


        if (deleteResult.count !== 1) {

            return res.status(404).json({
                message:
                    'Consignment item not found'
            })

        }


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
                    'ConsignmentItem',

                entityId:
                    id,

                details:
                    JSON.stringify(item)

            }

        })


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.json({

            message:
                'Consignment item deleted successfully'

        })

    } catch (err) {

        console.log(err)

        return res.status(500).json({
            message: 'Server Error'
        })

    }

}