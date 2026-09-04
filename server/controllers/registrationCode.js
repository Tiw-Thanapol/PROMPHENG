const prisma = require('../config/prisma')


// ======================================================
// HELPERS
// ======================================================

function parseId(value) {

    const id = Number(value)

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        return null
    }

    return id
}


function getCurrentUserId(req) {

    const userId =
        Number(
            req.currentUser?.id ||
            req.user?.id
        )

    if (
        !Number.isInteger(userId) ||
        userId <= 0
    ) {
        return null
    }

    return userId
}


function parseBoolean(value) {

    if (typeof value === 'boolean') {
        return value
    }

    if (typeof value === 'string') {

        const normalized =
            value.trim().toLowerCase()

        if (
            normalized === 'true' ||
            normalized === '1'
        ) {
            return true
        }

        if (
            normalized === 'false' ||
            normalized === '0'
        ) {
            return false
        }

    }

    if (
        typeof value === 'number'
    ) {

        if (value === 1) {
            return true
        }

        if (value === 0) {
            return false
        }

    }

    return null
}


// ======================================================
// CREATE REGISTRATION CODE
// POST /api/admin/registration-codes
//
// RegistrationCode เป็น GLOBAL resource
// เพราะใช้สำหรับสมัคร Account/User ก่อนที่จะมี account
//
// ดังนั้น:
// - ไม่ผูก accountId
// - ต้องป้องกันด้วย admin authorization ที่ route
// ======================================================

exports.create = async (req, res) => {

    try {

        const userId =
            getCurrentUserId(req)


        if (!userId) {

            return res.status(403).json({
                message:
                    'Access denied'
            })

        }


        const {
            code
        } = req.body


        // ==================================================
        // VALIDATE CODE
        // ==================================================

        if (
            typeof code !== 'string' ||
            !code.trim()
        ) {

            return res.status(400).json({
                message:
                    'Registration code is required'
            })

        }


        const normalizedCode =
            code.trim().toUpperCase()


        // ==================================================
        // CHECK DUPLICATE
        // ==================================================

        const existingCode =
            await prisma.registrationCode.findUnique({

                where: {

                    code:
                        normalizedCode

                }

            })


        if (existingCode) {

            return res.status(400).json({
                message:
                    'Registration code already exists'
            })

        }


        // ==================================================
        // CREATE
        // ==================================================

        const registrationCode =
            await prisma.registrationCode.create({

                data: {

                    code:
                        normalizedCode,

                    enabled:
                        true,

                    used:
                        false

                }

            })


        // ==================================================
        // AUDIT
        // ==================================================

        await prisma.auditLog.create({

            data: {

                userId,

                action:
                    'CREATE',

                entity:
                    'RegistrationCode',

                entityId:
                    registrationCode.id,

                details:
                    JSON.stringify({

                        code:
                            registrationCode.code

                    })

            }

        })


        return res.status(201).json({

            message:
                'Registration code created successfully',

            registrationCode

        })

    } catch (err) {

        console.error(
            'Create Registration Code Error:',
            err
        )

        return res.status(500).json({
            message:
                'Server Error'
        })

    }

}


// ======================================================
// GET ALL REGISTRATION CODES
// GET /api/admin/registration-codes
//
// GLOBAL RESOURCE
// ======================================================

exports.list = async (req, res) => {

    try {

        const userId =
            getCurrentUserId(req)


        if (!userId) {

            return res.status(403).json({
                message:
                    'Access denied'
            })

        }


        const codes =
            await prisma.registrationCode.findMany({

                orderBy: {

                    createdAt:
                        'desc'

                }

            })


        return res.json({

            codes

        })

    } catch (err) {

        console.error(
            'List Registration Codes Error:',
            err
        )

        return res.status(500).json({
            message:
                'Server Error'
        })

    }

}


// ======================================================
// UPDATE REGISTRATION CODE
// PUT /api/admin/registration-codes/:id
// ======================================================

exports.update = async (req, res) => {

    try {

        const userId =
            getCurrentUserId(req)


        if (!userId) {

            return res.status(403).json({
                message:
                    'Access denied'
            })

        }


        const id =
            parseId(
                req.params.id
            )


        if (!id) {

            return res.status(400).json({
                message:
                    'Invalid registration code id'
            })

        }


        // ==================================================
        // GET EXISTING
        // ==================================================

        const existing =
            await prisma.registrationCode.findUnique({

                where: {

                    id

                }

            })


        if (!existing) {

            return res.status(404).json({
                message:
                    'Registration code not found'
            })

        }


        const {
            enabled
        } = req.body


        const data = {}


        // ==================================================
        // ENABLED
        // ==================================================

        if (
            enabled !== undefined
        ) {

            const parsedEnabled =
                parseBoolean(enabled)


            if (
                parsedEnabled === null
            ) {

                return res.status(400).json({
                    message:
                        'Invalid enabled value'
                })

            }


            data.enabled =
                parsedEnabled

        }


        // ==================================================
        // UPDATE
        // ==================================================

        const updateResult =
            await prisma.registrationCode.updateMany({

                where: {

                    id

                },

                data

            })


        if (
            updateResult.count !== 1
        ) {

            return res.status(404).json({
                message:
                    'Registration code not found'
            })

        }


        // ==================================================
        // GET UPDATED
        // ==================================================

        const registrationCode =
            await prisma.registrationCode.findUnique({

                where: {

                    id

                }

            })


        if (!registrationCode) {

            return res.status(404).json({
                message:
                    'Registration code not found'
            })

        }


        // ==================================================
        // AUDIT
        // ==================================================

        await prisma.auditLog.create({

            data: {

                userId,

                action:
                    'UPDATE',

                entity:
                    'RegistrationCode',

                entityId:
                    id,

                details:
                    JSON.stringify({

                        before:
                            existing,

                        after:
                            registrationCode

                    })

            }

        })


        return res.json({

            message:
                'Registration code updated successfully',

            registrationCode

        })

    } catch (err) {

        console.error(
            'Update Registration Code Error:',
            err
        )

        return res.status(500).json({
            message:
                'Server Error'
        })

    }

}


// ======================================================
// DELETE REGISTRATION CODE
// DELETE /api/admin/registration-codes/:id
// ======================================================

exports.remove = async (req, res) => {

    try {

        const userId =
            getCurrentUserId(req)


        if (!userId) {

            return res.status(403).json({
                message:
                    'Access denied'
            })

        }


        const id =
            parseId(
                req.params.id
            )


        if (!id) {

            return res.status(400).json({
                message:
                    'Invalid registration code id'
            })

        }


        // ==================================================
        // GET EXISTING
        // ==================================================

        const existing =
            await prisma.registrationCode.findUnique({

                where: {

                    id

                }

            })


        if (!existing) {

            return res.status(404).json({
                message:
                    'Registration code not found'
            })

        }


        // ==================================================
        // USED CHECK
        // ==================================================

        if (existing.used) {

            return res.status(400).json({

                message:
                    'Cannot delete registration code because it has already been used'

            })

        }


        // ==================================================
        // DELETE
        // ==================================================

        const deleteResult =
            await prisma.registrationCode.deleteMany({

                where: {

                    id,

                    used:
                        false

                }

            })


        if (
            deleteResult.count !== 1
        ) {

            return res.status(400).json({
                message:
                    'Cannot delete registration code because it has already been used'
            })

        }


        // ==================================================
        // AUDIT
        // ==================================================

        await prisma.auditLog.create({

            data: {

                userId,

                action:
                    'DELETE',

                entity:
                    'RegistrationCode',

                entityId:
                    id,

                details:
                    JSON.stringify(
                        existing
                    )

            }

        })


        return res.json({

            message:
                'Registration code deleted successfully'

        })

    } catch (err) {

        console.error(
            'Delete Registration Code Error:',
            err
        )

        return res.status(500).json({
            message:
                'Server Error'
        })

    }

}