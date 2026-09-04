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


function isValidDate(value) {

    if (!value) {
        return false
    }

    const date =
        new Date(value)

    return !Number.isNaN(
        date.getTime()
    )
}


// ======================================================
// GET AUDIT LOGS
// GET /api/audit-logs
//
// รองรับ:
//
// GET /api/audit-logs
//
// Filter:
//
// ?action=CREATE
// ?entity=Sale
// ?entityId=45
// ?userId=4
//
// Date:
//
// ?startDate=2026-08-26
// ?endDate=2026-08-26
//
// Sort:
//
// createdAt DESC
//
// SECURITY:
//
// Audit Logs ถูกจำกัดให้อยู่ภายใน Account
// ของผู้ที่กำลัง Login เท่านั้น
//
// ไม่สามารถ:
// - อ่าน Log ของ Account อื่น
// - ใช้ userId ของ Account อื่นเพื่อดึง Log
// - ใช้ entityId เพื่อข้าม Account
//
// ======================================================

exports.getAuditLogs = async (req, res) => {

    try {

        // ==================================================
        // AUTH / ACCOUNT CONTEXT
        // ==================================================

        const accountId =
            Number(
                req.user?.accountId
            )


        if (
            !isPositiveInteger(accountId)
        ) {

            return res.status(403).json({

                message:
                    "Access denied"

            })

        }


        const {
            action,
            entity,
            entityId,
            userId,
            startDate,
            endDate
        } = req.query


        // ==================================================
        // WHERE
        //
        // IMPORTANT:
        //
        // AuditLog ไม่มี accountId โดยตรง
        //
        // จึง scope ผ่าน User.accountId
        //
        // ทำให้ Log ของ User ใน Account อื่น
        // ไม่สามารถถูกอ่านได้
        // ==================================================

        const where = {

            user: {

                accountId

            }

        }


        // ==================================================
        // ACTION
        // ==================================================

        if (action) {

            where.action =
                String(action).trim()

        }


        // ==================================================
        // ENTITY
        // ==================================================

        if (entity) {

            where.entity =
                String(entity).trim()

        }


        // ==================================================
        // ENTITY ID
        // ==================================================

        if (entityId) {

            if (
                !isPositiveInteger(entityId)
            ) {

                return res.status(400).json({

                    message:
                        "Invalid entity id"

                })

            }


            where.entityId =
                Number(entityId)

        }


        // ==================================================
        // USER ID
        // ==================================================

        if (userId) {

            if (
                !isPositiveInteger(userId)
            ) {

                return res.status(400).json({

                    message:
                        "Invalid user id"

                })

            }


            // ------------------------------------------------
            // NOTE:
            //
            // where.user.accountId ยังถูกล็อกไว้แล้ว
            //
            // ดังนั้นแม้ Client จะส่ง userId ของ Account อื่น
            // Prisma จะไม่คืนข้อมูลของ User นั้น
            // ------------------------------------------------

            where.userId =
                Number(userId)

        }


        // ==================================================
        // DATE FILTER
        // ==================================================

        if (
            startDate ||
            endDate
        ) {

            where.createdAt = {}


            // ----------------------------------------------
            // START DATE
            // ----------------------------------------------

            if (startDate) {

                const start =
                    new Date(
                        `${startDate}T00:00:00+07:00`
                    )


                if (
                    !isValidDate(start)
                ) {

                    return res.status(400).json({

                        message:
                            "Invalid start date"

                    })

                }


                where.createdAt.gte =
                    start

            }


            // ----------------------------------------------
            // END DATE
            // ----------------------------------------------

            if (endDate) {

                const end =
                    new Date(
                        `${endDate}T23:59:59.999+07:00`
                    )


                if (
                    !isValidDate(end)
                ) {

                    return res.status(400).json({

                        message:
                            "Invalid end date"

                    })

                }


                where.createdAt.lte =
                    end

            }

        }


        // ==================================================
        // GET LOGS
        // ==================================================

        const logs =
            await prisma.auditLog.findMany({

                where,

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


        // ==================================================
        // FORMAT LOGS
        //
        // details ถูกเก็บเป็น JSON string
        //
        // พยายาม parse ให้ frontend
        // ใช้งานง่ายขึ้น
        //
        // ถ้าเป็นข้อมูลเก่า / JSON เสีย
        // จะคืนค่าเดิมแทน
        // ==================================================

        const formattedLogs =
            logs.map(
                log => {

                    let parsedDetails =
                        null


                    if (
                        log.details
                    ) {

                        try {

                            parsedDetails =
                                typeof log.details === "string"
                                    ? JSON.parse(log.details)
                                    : log.details

                        } catch (error) {

                            parsedDetails =
                                log.details

                        }

                    }


                    return {

                        ...log,

                        details:
                            parsedDetails

                    }

                }
            )


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.json({

            count:
                formattedLogs.length,

            logs:
                formattedLogs

        })

    } catch (err) {

        console.error(
            "GET AUDIT LOGS ERROR:",
            err
        )


        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}


// ======================================================
// GET SINGLE AUDIT LOG
// GET /api/audit-logs/:id
//
// SECURITY:
//
// ต้องเป็น Audit Log ของ User
// ที่อยู่ใน Account เดียวกับผู้เรียก
//
// ป้องกัน IDOR / BOLA
//
// ======================================================

exports.getAuditLog = async (req, res) => {

    try {

        // ==================================================
        // AUTH / ACCOUNT CONTEXT
        // ==================================================

        const accountId =
            Number(
                req.user?.accountId
            )


        if (
            !isPositiveInteger(accountId)
        ) {

            return res.status(403).json({

                message:
                    "Access denied"

            })

        }


        const id =
            Number(
                req.params.id
            )


        // ==================================================
        // VALIDATE ID
        // ==================================================

        if (
            !isPositiveInteger(id)
        ) {

            return res.status(400).json({

                message:
                    "Invalid audit log id"

            })

        }


        // ==================================================
        // GET LOG
        //
        // IMPORTANT:
        //
        // ใช้ findFirst แทน findUnique
        //
        // เพราะต้องตรวจทั้ง:
        //
        // auditLog.id
        // +
        // user.accountId
        //
        // ==================================================

        const log =
            await prisma.auditLog.findFirst({

                where: {

                    id,

                    user: {

                        accountId

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

                }

            })


        // ==================================================
        // NOT FOUND
        //
        // รวมกรณี:
        //
        // - ไม่มี Log
        // - Log เป็นของ Account อื่น
        //
        // เพื่อไม่เปิดเผยว่าข้อมูลของ Account อื่นมีอยู่
        // ==================================================

        if (!log) {

            return res.status(404).json({

                message:
                    "Audit log not found"

            })

        }


        // ==================================================
        // PARSE DETAILS
        // ==================================================

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


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.json({

            log: {

                ...log,

                details

            }

        })

    } catch (err) {

        console.error(
            "GET AUDIT LOG ERROR:",
            err
        )


        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}