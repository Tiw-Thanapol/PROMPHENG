const prisma = require('../config/prisma')

// ======================================================
// CREATE REGISTRATION CODE
// POST /api/admin/registration-codes
// ======================================================

exports.create = async (req, res) => {
    try {

        const { code } = req.body

        if (!code || !code.trim()) {
            return res.status(400).json({
                message: 'Registration code is required'
            })
        }

        const normalizedCode = code.trim().toUpperCase()

        const existingCode = await prisma.registrationCode.findUnique({
            where: {
                code: normalizedCode
            }
        })

        if (existingCode) {
            return res.status(400).json({
                message: 'Registration code already exists'
            })
        }

        const registrationCode =
            await prisma.registrationCode.create({
                data: {
                    code: normalizedCode,
                    enabled: true,
                    used: false
                }
            })

        await prisma.auditLog.create({
            data: {
                userId: req.currentUser.id,
                action: 'CREATE',
                entity: 'RegistrationCode',
                entityId: registrationCode.id,
                details: JSON.stringify({
                    code: registrationCode.code
                })
            }
        })

        res.status(201).json({
            message: 'Registration code created successfully',
            registrationCode
        })

    } catch (err) {

        console.log(err)

        res.status(500).json({
            message: 'Server Error'
        })
    }
}


// ======================================================
// GET ALL REGISTRATION CODES
// GET /api/admin/registration-codes
// ======================================================

exports.list = async (req, res) => {
    try {

        const codes =
            await prisma.registrationCode.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            })

        res.json({
            codes
        })

    } catch (err) {

        console.log(err)

        res.status(500).json({
            message: 'Server Error'
        })
    }
}


// ======================================================
// UPDATE REGISTRATION CODE
// PUT /api/admin/registration-codes/:id
// ======================================================

exports.update = async (req, res) => {
    try {

        const id = Number(req.params.id)

        if (Number.isNaN(id)) {
            return res.status(400).json({
                message: 'Invalid registration code id'
            })
        }

        const existing =
            await prisma.registrationCode.findUnique({
                where: {
                    id
                }
            })

        if (!existing) {
            return res.status(404).json({
                message: 'Registration code not found'
            })
        }

        const {
            enabled
        } = req.body

        const registrationCode =
            await prisma.registrationCode.update({
                where: {
                    id
                },
                data: {
                    ...(enabled !== undefined && {
                        enabled: Boolean(enabled)
                    })
                }
            })

        await prisma.auditLog.create({
            data: {
                userId: req.currentUser.id,
                action: 'UPDATE',
                entity: 'RegistrationCode',
                entityId: id,
                details: JSON.stringify({
                    before: existing,
                    after: registrationCode
                })
            }
        })

        res.json({
            message: 'Registration code updated successfully',
            registrationCode
        })

    } catch (err) {

        console.log(err)

        res.status(500).json({
            message: 'Server Error'
        })
    }
}


// ======================================================
// DELETE REGISTRATION CODE
// DELETE /api/admin/registration-codes/:id
// ======================================================

exports.remove = async (req, res) => {
    try {

        const id = Number(req.params.id)

        if (Number.isNaN(id)) {
            return res.status(400).json({
                message: 'Invalid registration code id'
            })
        }

        const existing =
            await prisma.registrationCode.findUnique({
                where: {
                    id
                }
            })

        if (!existing) {
            return res.status(404).json({
                message: 'Registration code not found'
            })
        }

        // ห้ามลบ Code ที่ถูกใช้งานแล้ว
        if (existing.used) {
            return res.status(400).json({
                message: 'Cannot delete registration code because it has already been used'
            })
        }

        await prisma.registrationCode.delete({
            where: {
                id
            }
        })

        await prisma.auditLog.create({
            data: {
                userId: req.currentUser.id,
                action: 'DELETE',
                entity: 'RegistrationCode',
                entityId: id,
                details: JSON.stringify(existing)
            }
        })

        res.json({
            message: 'Registration code deleted successfully'
        })

    } catch (err) {

        console.log(err)

        res.status(500).json({
            message: 'Server Error'
        })
    }
}