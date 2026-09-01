const crypto = require("crypto")
const prisma = require("../config/prisma")


// ======================================================
// SESSION CONFIG
// ======================================================

const SESSION_DURATION_MS =
    1000 *
    60 *
    60 *
    24 *
    7 // 7 days


// ======================================================
// TOKEN HELPERS
// ======================================================


// ------------------------------------------------------
// Generate Session Token
// ------------------------------------------------------
//
// Token จริงจะถูกส่งให้ Browser
// Database จะเก็บเฉพาะ SHA-256 hash
//

function generateSessionToken() {

    return crypto
        .randomBytes(32)
        .toString("base64url")

}


// ------------------------------------------------------
// Hash Session Token
// ------------------------------------------------------

function hashSessionToken(token) {

    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")

}


// ------------------------------------------------------
// Hash IP Address
// ------------------------------------------------------
//
// ไม่เก็บ IP จริงลง Database
//

function hashIpAddress(ip) {

    if (!ip) {
        return null
    }


    const secret =
        process.env.SESSION_IP_HASH_SECRET ||
        process.env.JWT_SECRET ||
        "sale-record-session-ip"


    return crypto
        .createHmac(
            "sha256",
            secret
        )
        .update(String(ip))
        .digest("hex")

}


// ======================================================
// CREATE SESSION
// ======================================================

/**
 * สร้าง Database Session ใหม่
 *
 * @param {number} userId
 * @param {object} options
 *
 * options:
 * - ipAddress
 * - userAgent
 */

async function createSession(
    userId,
    options = {}
) {

    if (!userId) {

        throw new Error(
            "userId is required"
        )

    }


    // --------------------------------------------------
    // GENERATE TOKEN
    // --------------------------------------------------

    const token =
        generateSessionToken()


    // --------------------------------------------------
    // HASH TOKEN
    // --------------------------------------------------

    const tokenHash =
        hashSessionToken(token)


    // --------------------------------------------------
    // HASH IP
    // --------------------------------------------------

    const ipHash =
        hashIpAddress(
            options.ipAddress
        )


    // --------------------------------------------------
    // EXPIRATION
    // --------------------------------------------------

    const expiresAt =
        new Date(
            Date.now() +
            SESSION_DURATION_MS
        )


    // --------------------------------------------------
    // CREATE SESSION
    // --------------------------------------------------

    const session =
        await prisma.session.create({

            data: {

                userId,

                tokenHash,

                expiresAt,

                ipHash,

                userAgent:
                    options.userAgent ||
                    null

            }

        })


    return {

        token,

        session

    }

}


// ======================================================
// GET SESSION
// ======================================================

/**
 * ตรวจสอบ Session จาก Token
 *
 * ขั้นตอน:
 *
 * token
 * ↓
 * hash
 * ↓
 * database
 * ↓
 * revoked?
 * ↓
 * expired?
 * ↓
 * user enabled?
 *
 * ถ้าไม่ผ่านคืน null
 */

async function getSession(token) {

    if (
        !token ||
        typeof token !== "string"
    ) {

        return null

    }


    // --------------------------------------------------
    // HASH TOKEN
    // --------------------------------------------------

    const tokenHash =
        hashSessionToken(token)


    // --------------------------------------------------
    // FIND SESSION
    // --------------------------------------------------

    const session =
        await prisma.session.findUnique({

            where: {

                tokenHash

            },

            include: {

                user: true

            }

        })


    if (!session) {

        return null

    }


    const now =
        new Date()


    // --------------------------------------------------
    // REVOKED SESSION
    // --------------------------------------------------

    if (
        session.revokedAt
    ) {

        return null

    }


    // --------------------------------------------------
    // EXPIRED SESSION
    // --------------------------------------------------

    if (
        session.expiresAt <= now
    ) {

        /*
         * Cleanup เฉพาะ Session นี้
         *
         * ไม่ให้ Login request
         * ล้มเพราะ delete ไม่สำเร็จ
         */

        try {

            await prisma.session.delete({

                where: {

                    id:
                        session.id

                }

            })

        } catch (error) {

            if (
                error.code !== "P2025"
            ) {

                console.error(
                    "EXPIRED SESSION CLEANUP ERROR:",
                    error
                )

            }

        }


        return null

    }


    // --------------------------------------------------
    // USER MUST EXIST
    // --------------------------------------------------

    if (!session.user) {

        return null

    }


    // --------------------------------------------------
    // USER MUST BE ENABLED
    // --------------------------------------------------

    if (
        !session.user.enabled
    ) {

        return null

    }


    // --------------------------------------------------
    // UPDATE LAST USED
    // --------------------------------------------------
    //
    // ไม่ต้อง await
    // เพื่อไม่ให้ Authentication ช้าลง
    //
    // --------------------------------------------------

    prisma.session.update({

        where: {

            id:
                session.id

        },

        data: {

            lastUsedAt:
                now

        }

    }).catch((error) => {

        /*
         * Logging อย่างเดียว
         * ไม่ทำให้ Request หลักล้ม
         */

        console.error(
            "UPDATE SESSION LAST USED ERROR:",
            error
        )

    })


    return session

}


// ======================================================
// DELETE SESSION
// ======================================================

/**
 * Logout จาก Session ปัจจุบัน
 *
 * ลบ Session ออกจาก Database
 */

async function deleteSession(token) {

    if (
        !token ||
        typeof token !== "string"
    ) {

        return false

    }


    const tokenHash =
        hashSessionToken(token)


    try {

        await prisma.session.delete({

            where: {

                tokenHash

            }

        })


        return true

    } catch (error) {

        // Session ไม่มีอยู่แล้ว

        if (
            error.code === "P2025"
        ) {

            return false

        }


        throw error

    }

}


// ======================================================
// REVOKE SESSION
// ======================================================

/**
 * Revoke Session โดยไม่ลบ Record
 *
 * ใช้กรณี:
 * - Security incident
 * - Admin revoke session
 * - ต้องการเก็บ audit history
 */

async function revokeSession(token) {

    if (
        !token ||
        typeof token !== "string"
    ) {

        return false

    }


    const tokenHash =
        hashSessionToken(token)


    const result =
        await prisma.session.updateMany({

            where: {

                tokenHash,

                revokedAt:
                    null

            },

            data: {

                revokedAt:
                    new Date()

            }

        })


    return result.count > 0

}


// ======================================================
// DELETE ALL USER SESSIONS
// ======================================================

/**
 * Logout ทุกอุปกรณ์ของ User
 *
 * ใช้ในกรณี:
 *
 * - เปลี่ยน Password
 * - Reset Password
 * - บัญชีถูกขโมย
 * - User เลือก Logout ทุกอุปกรณ์
 */

async function deleteAllUserSessions(
    userId
) {

    if (!userId) {

        throw new Error(
            "userId is required"
        )

    }


    const result =
        await prisma.session.deleteMany({

            where: {

                userId

            }

        })


    return result.count

}


// ======================================================
// REVOKE ALL USER SESSIONS
// ======================================================

/**
 * Revoke ทุก Session
 *
 * ต่างจาก deleteAllUserSessions()
 * ตรงที่ยังเก็บ Record เอาไว้
 */

async function revokeAllUserSessions(
    userId
) {

    if (!userId) {

        throw new Error(
            "userId is required"
        )

    }


    const result =
        await prisma.session.updateMany({

            where: {

                userId,

                revokedAt:
                    null

            },

            data: {

                revokedAt:
                    new Date()

            }

        })


    return result.count

}


// ======================================================
// CLEANUP EXPIRED SESSIONS
// ======================================================

/**
 * ลบ Session ที่:
 *
 * - หมดอายุ
 *
 * หรือ
 *
 * - ถูก revoke แล้ว
 */

async function cleanupExpiredSessions() {

    const result =
        await prisma.session.deleteMany({

            where: {

                OR: [

                    {

                        expiresAt: {

                            lt:
                                new Date()

                        }

                    },

                    {

                        revokedAt: {

                            not:
                                null

                        }

                    }

                ]

            }

        })


    return result.count

}


// ======================================================
// GET USER SESSION COUNT
// ======================================================

/**
 * จำนวน Session ที่ยังใช้งานได้
 */

async function getActiveSessionCount(
    userId
) {

    if (!userId) {

        throw new Error(
            "userId is required"
        )

    }


    const count =
        await prisma.session.count({

            where: {

                userId,

                revokedAt:
                    null,

                expiresAt: {

                    gt:
                        new Date()

                }

            }

        })


    return count

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createSession,

    getSession,

    deleteSession,

    revokeSession,

    deleteAllUserSessions,

    revokeAllUserSessions,

    cleanupExpiredSessions,

    getActiveSessionCount,

    generateSessionToken,

    hashSessionToken,

    hashIpAddress

}