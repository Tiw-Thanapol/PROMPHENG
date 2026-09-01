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
// ใช้สำหรับ:
// - Audit Log page
// - ERP / POS history
// - ตรวจสอบว่าใครทำอะไร
// - Product History ในอนาคต
// ======================================================

exports.getAuditLogs = async (req, res) => {

    try {

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
        // ==================================================

        const where = {}


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
        // ตรงนี้พยายาม parse ให้ frontend
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
                err.message ||
                "Server Error"

        })

    }

}


// ======================================================
// GET SINGLE AUDIT LOG
// GET /api/audit-logs/:id
//
// ใช้สำหรับเปิดรายละเอียด Log รายการเดียว
// ======================================================

exports.getAuditLog = async (req, res) => {

    try {

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
        // ==================================================

        const log =
            await prisma.auditLog.findUnique({

                where: {

                    id

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
                err.message ||
                "Server Error"

        })

    }

}