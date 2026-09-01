const prisma = require('../config/prisma')

// ======================================================
// CREATE
// POST /api/consignment
// ======================================================

exports.create = async (req, res) => {
    try {
        const { ownerId, name, description, costPrice, status } = req.body

        if (!ownerId || !name || costPrice === undefined) {
            return res.status(400).json({
                message: 'ownerId, name and costPrice are required'
            })
        }

        const owner = await prisma.owner.findUnique({
            where: {
                id: Number(ownerId)
            }
        })

        if (!owner) {
            return res.status(404).json({
                message: 'Owner not found'
            })
        }

        const item = await prisma.consignmentItem.create({
            data: {
                ownerId: Number(ownerId),
                name,
                description: description || null,
                costPrice: Number(costPrice),
                status: status || 'AVAILABLE'
            },
            include: {
                owner: true
            }
        })

        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'CREATE',
                entity: 'ConsignmentItem',
                entityId: item.id,
                details: JSON.stringify({
                    name: item.name,
                    ownerId: item.ownerId,
                    costPrice: item.costPrice
                })
            }
        })

        res.status(201).json({
            message: 'Consignment item created successfully',
            item
        })

    } catch (err) {
        console.log(err)

        res.status(500).json({
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

        const items = await prisma.consignmentItem.findMany({
            include: {
                owner: true,
                _count: {
                    select: {
                        saleItems: true
                    }
                }
            },
            orderBy: {
                id: 'desc'
            }
        })

        res.json({
            items
        })

    } catch (err) {
        console.log(err)

        res.status(500).json({
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

        const id = Number(req.params.id)

        const item = await prisma.consignmentItem.findUnique({
            where: {
                id
            },
            include: {
                owner: true,
                saleItems: {
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
                message: 'Consignment item not found'
            })
        }

        res.json({
            item
        })

    } catch (err) {
        console.log(err)

        res.status(500).json({
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

        const id = Number(req.params.id)

        const {
            ownerId,
            name,
            description,
            costPrice,
            status
        } = req.body

        const oldItem = await prisma.consignmentItem.findUnique({
            where: {
                id
            }
        })

        if (!oldItem) {
            return res.status(404).json({
                message: 'Consignment item not found'
            })
        }

        if (ownerId !== undefined) {
            const owner = await prisma.owner.findUnique({
                where: {
                    id: Number(ownerId)
                }
            })

            if (!owner) {
                return res.status(404).json({
                    message: 'Owner not found'
                })
            }
        }

        const item = await prisma.consignmentItem.update({
            where: {
                id
            },
            data: {
                ...(ownerId !== undefined && {
                    ownerId: Number(ownerId)
                }),

                ...(name !== undefined && {
                    name
                }),

                ...(description !== undefined && {
                    description
                }),

                ...(costPrice !== undefined && {
                    costPrice: Number(costPrice)
                }),

                ...(status !== undefined && {
                    status
                })
            },
            include: {
                owner: true
            }
        })

        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'UPDATE',
                entity: 'ConsignmentItem',
                entityId: item.id,
                details: JSON.stringify({
                    before: oldItem,
                    after: item
                })
            }
        })

        res.json({
            message: 'Consignment item updated successfully',
            item
        })

    } catch (err) {
        console.log(err)

        res.status(500).json({
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

        const id = Number(req.params.id)

        const item = await prisma.consignmentItem.findUnique({
            where: {
                id
            }
        })

        if (!item) {
            return res.status(404).json({
                message: 'Consignment item not found'
            })
        }

        // ป้องกันลบสินค้าที่มีประวัติการขาย
        const saleCount = await prisma.saleItem.count({
            where: {
                consignmentItemId: id
            }
        })

        if (saleCount > 0) {
            return res.status(400).json({
                message: 'Cannot delete item because it has sale history'
            })
        }

        await prisma.consignmentItem.delete({
            where: {
                id
            }
        })

        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'DELETE',
                entity: 'ConsignmentItem',
                entityId: id,
                details: JSON.stringify(item)
            }
        })

        res.json({
            message: 'Consignment item deleted successfully'
        })

    } catch (err) {
        console.log(err)

        res.status(500).json({
            message: 'Server Error'
        })
    }
}