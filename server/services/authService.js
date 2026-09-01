const bcrypt = require("bcryptjs")
const prisma = require("../config/prisma")
const {
    createSession,
    getSession,
    deleteSession,
    deleteAllUserSessions
} = require("./session")

/*
|--------------------------------------------------------------------------
| AUTH SERVICE
|--------------------------------------------------------------------------
|
| Authentication business logic
|
| Architecture:
|
| Frontend
|    ↓
| HttpOnly Cookie
|    ↓
| Controller
|    ↓
| Auth Service
|    ↓
| Session Service
|    ↓
| Prisma / Database
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| PASSWORD POLICY
|--------------------------------------------------------------------------
*/

/**
 * ตรวจสอบ Password Policy
 *
 * Requirements:
 * - อย่างน้อย 8 ตัว
 * - มีตัวพิมพ์ใหญ่
 * - มีตัวพิมพ์เล็ก
 * - มีตัวเลข
 * - มีอักขระพิเศษ
 */
function validatePasswordPolicy(password) {

    const errors = []

    if (
        !password ||
        typeof password !== "string" ||
        password.length < 8
    ) {

        errors.push(
            "Password must be at least 8 characters!"
        )

    }


    if (
        !/[A-Z]/.test(password || "")
    ) {

        errors.push(
            "Password must contain an uppercase letter!"
        )

    }


    if (
        !/[a-z]/.test(password || "")
    ) {

        errors.push(
            "Password must contain a lowercase letter!"
        )

    }


    if (
        !/[0-9]/.test(password || "")
    ) {

        errors.push(
            "Password must contain a number!"
        )

    }


    if (
        !/[^A-Za-z0-9]/.test(password || "")
    ) {

        errors.push(
            "Password must contain a special character!"
        )

    }


    return errors

}


/*
|--------------------------------------------------------------------------
| NORMALIZE EMAIL
|--------------------------------------------------------------------------
*/

function normalizeEmail(email) {

    return String(email || "")
        .trim()
        .toLowerCase()

}


/*
|--------------------------------------------------------------------------
| NORMALIZE PHONE
|--------------------------------------------------------------------------
*/

function normalizePhone(phone) {

    return String(phone || "")
        .trim()

}


/*
|--------------------------------------------------------------------------
| FIND USER
|--------------------------------------------------------------------------
*/

/**
 * หา User จาก Email
 */
async function findUserByEmail(email) {

    if (!email) {
        return null
    }


    return prisma.user.findUnique({

        where: {

            email:
                normalizeEmail(email)

        }

    })

}


/**
 * หา User จาก ID
 */
async function findUserById(userId) {

    if (!userId) {
        return null
    }


    return prisma.user.findUnique({

        where: {

            id:
                userId

        }

    })

}


/**
 * หา User จาก Email หรือ Phone
 */
async function findUserByIdentifier(identifier) {

    const raw =
        String(identifier || "").trim()


    if (!raw) {
        return null
    }


    if (raw.includes("@")) {

        return findUserByEmail(raw)

    }


    return prisma.user.findFirst({

        where: {

            phoneNumber:
                normalizePhone(raw)

        }

    })

}


/*
|--------------------------------------------------------------------------
| SAFE USER
|--------------------------------------------------------------------------
|
| ห้ามส่ง password / sensitive fields ออกไป
|
|--------------------------------------------------------------------------
*/

function sanitizeUser(user) {

    if (!user) {
        return null
    }


    return {

        id:
            user.id,

        email:
            user.email,

        name:
            user.name,

        phoneNumber:
            user.phoneNumber,

        picture:
            user.picture,

        role:
            user.role,

        enabled:
            user.enabled

    }

}


/*
|--------------------------------------------------------------------------
| VERIFY PASSWORD
|--------------------------------------------------------------------------
*/

async function verifyPassword(password, passwordHash) {

    if (
        !password ||
        !passwordHash
    ) {

        return false

    }


    return bcrypt.compare(
        password,
        passwordHash
    )

}


/*
|--------------------------------------------------------------------------
| CREATE PASSWORD HASH
|--------------------------------------------------------------------------
*/

async function hashPassword(password) {

    return bcrypt.hash(
        password,
        10
    )

}


/*
|--------------------------------------------------------------------------
| AUTHENTICATE LOGIN
|--------------------------------------------------------------------------
|
| ตรวจสอบ:
|
| 1. Email
| 2. Password
| 3. Password hash
| 4. Email verification
| 5. Account enabled
|
| ไม่สร้าง Session ที่นี่
| เพราะ Controller จะเป็นคนกำหนด request metadata
|
|--------------------------------------------------------------------------
*/

async function authenticateUser(email, password) {

    const normalizedEmail =
        normalizeEmail(email)


    if (!normalizedEmail) {

        return {

            success:
                false,

            status:
                400,

            message:
                "Email is required!"

        }

    }


    if (!password) {

        return {

            success:
                false,

            status:
                400,

            message:
                "Password is required!"

        }

    }


    const user =
        await findUserByEmail(
            normalizedEmail
        )


    /*
    |--------------------------------------------------------------------------
    | USER NOT FOUND
    |--------------------------------------------------------------------------
    */

    if (!user) {

        return {

            success:
                false,

            status:
                401,

            message:
                "Email or password is invalid!"

        }

    }


    /*
    |--------------------------------------------------------------------------
    | ACCOUNT WITHOUT PASSWORD
    |--------------------------------------------------------------------------
    */

    if (!user.password) {

        return {

            success:
                false,

            status:
                400,

            message:
                "This account does not support password login."

        }

    }


    /*
    |--------------------------------------------------------------------------
    | PASSWORD
    |--------------------------------------------------------------------------
    */

    const passwordValid =
        await verifyPassword(

            password,

            user.password

        )


    if (!passwordValid) {

        return {

            success:
                false,

            status:
                401,

            message:
                "Email or password is invalid!"

        }

    }


    /*
    |--------------------------------------------------------------------------
    | EMAIL VERIFICATION
    |--------------------------------------------------------------------------
    */

    if (!user.enabled) {

        return {

            success:
                false,

            status:
                403,

            message:
                "Please verify your email before logging in.",

            emailVerified:
                false

        }

    }


    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    return {

        success:
            true,

        user:
            sanitizeUser(user)

    }

}


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
|
| ตรวจสอบ User + สร้าง Session
|
|--------------------------------------------------------------------------
*/

async function loginUser({

    email,

    password,

    ipAddress,

    userAgent

}) {

    const authentication =
        await authenticateUser(

            email,

            password

        )


    if (!authentication.success) {

        return authentication

    }


    const session =
        await createSession(

            authentication.user.id,

            {

                ipAddress,

                userAgent

            }

        )


    return {

        success:
            true,

        user:
            authentication.user,

        session:
            session.session,

        token:
            session.token

    }

}


/*
|--------------------------------------------------------------------------
| GET CURRENT USER
|--------------------------------------------------------------------------
|
| ใช้ Session Token จาก HttpOnly Cookie
|
|--------------------------------------------------------------------------
*/

async function getCurrentUser(token) {

    const session =
        await getSession(token)


    if (!session) {

        return null

    }


    return {

        user:
            sanitizeUser(session.user),

        session

    }

}


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

async function logoutUser(token) {

    if (!token) {

        return false

    }


    return deleteSession(token)

}


/*
|--------------------------------------------------------------------------
| LOGOUT ALL DEVICES
|--------------------------------------------------------------------------
*/

async function logoutAllDevices(userId) {

    return deleteAllUserSessions(userId)

}


/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
|
| เปลี่ยน Password แล้วบังคับ Logout ทุก Device
|
|--------------------------------------------------------------------------
*/

async function resetUserPassword(
    userId,
    newPassword
) {

    if (!userId) {

        throw new Error(
            "userId is required"
        )

    }


    const passwordErrors =
        validatePasswordPolicy(
            newPassword
        )


    if (
        passwordErrors.length > 0
    ) {

        const error =
            new Error(
                passwordErrors[0]
            )

        error.status = 400
        error.errors = passwordErrors

        throw error

    }


    const user =
        await findUserById(userId)


    if (!user) {

        const error =
            new Error(
                "User not found"
            )

        error.status = 404

        throw error

    }


    const passwordHash =
        await hashPassword(
            newPassword
        )


    /*
    |--------------------------------------------------------------------------
    | UPDATE PASSWORD + DELETE SESSIONS
    |--------------------------------------------------------------------------
    |
    | ทำใน Transaction เดียวกัน
    |
    |--------------------------------------------------------------------------
    */

    await prisma.$transaction(
        async (tx) => {

            await tx.user.update({

                where: {

                    id:
                        userId

                },

                data: {

                    password:
                        passwordHash

                }

            })


            await tx.session.deleteMany({

                where: {

                    userId

                }

            })

        }
    )


    return true

}


/*
|--------------------------------------------------------------------------
| CHANGE PASSWORD
|--------------------------------------------------------------------------
|
| สำหรับ User ที่ Login อยู่แล้ว
|
|--------------------------------------------------------------------------
*/

async function changeUserPassword(
    userId,
    currentPassword,
    newPassword
) {

    if (!userId) {

        throw new Error(
            "userId is required"
        )

    }


    if (!currentPassword) {

        const error =
            new Error(
                "Current password is required!"
            )

        error.status = 400

        throw error

    }


    const passwordErrors =
        validatePasswordPolicy(
            newPassword
        )


    if (
        passwordErrors.length > 0
    ) {

        const error =
            new Error(
                passwordErrors[0]
            )

        error.status = 400
        error.errors = passwordErrors

        throw error

    }


    const user =
        await findUserById(userId)


    if (!user) {

        const error =
            new Error(
                "User not found"
            )

        error.status = 404

        throw error

    }


    if (!user.password) {

        const error =
            new Error(
                "This account does not support password login."
            )

        error.status = 400

        throw error

    }


    const currentPasswordValid =
        await verifyPassword(

            currentPassword,

            user.password

        )


    if (!currentPasswordValid) {

        const error =
            new Error(
                "Current password is incorrect!"
            )

        error.status = 400

        throw error

    }


    const passwordHash =
        await hashPassword(
            newPassword
        )


    await prisma.$transaction(
        async (tx) => {

            await tx.user.update({

                where: {

                    id:
                        userId

                },

                data: {

                    password:
                        passwordHash

                }

            })


            /*
            |--------------------------------------------------------------------------
            | SECURITY
            |--------------------------------------------------------------------------
            |
            | เมื่อ Password เปลี่ยน
            | Session เก่าทั้งหมดต้องถูกยกเลิก
            |
            |--------------------------------------------------------------------------
            */

            await tx.session.deleteMany({

                where: {

                    userId

                }

            })

        }
    )


    return true

}


/*
|--------------------------------------------------------------------------
| REGISTER USER
|--------------------------------------------------------------------------
|
| Register logic สำหรับ Auth Service
|
| Email verification token จะถูกสร้างโดย
| controller / verification service ในขั้นต่อไป
|
|--------------------------------------------------------------------------
*/

async function registerUser({

    email,

    password,

    name,

    phoneNumber

}) {

    const normalizedEmail =
        normalizeEmail(email)


    if (!normalizedEmail) {

        const error =
            new Error(
                "Email is required!"
            )

        error.status = 400

        throw error

    }


    if (!password) {

        const error =
            new Error(
                "Password is required!"
            )

        error.status = 400

        throw error

    }


    const passwordErrors =
        validatePasswordPolicy(
            password
        )


    if (
        passwordErrors.length > 0
    ) {

        const error =
            new Error(
                passwordErrors[0]
            )

        error.status = 400
        error.errors = passwordErrors

        throw error

    }


    const existingUser =
        await findUserByEmail(
            normalizedEmail
        )


    if (existingUser) {

        const error =
            new Error(
                "Email is already registered!"
            )

        error.status = 400

        throw error

    }


    const passwordHash =
        await hashPassword(
            password
        )


    try {

        const user =
            await prisma.user.create({

                data: {

                    email:
                        normalizedEmail,

                    password:
                        passwordHash,

                    name:
                        name
                            ? String(name).trim()
                            : null,

                    phoneNumber:
                        phoneNumber
                            ? normalizePhone(phoneNumber)
                            : null,

                    role:
                        "OWNER",

                    enabled:
                        false

                }

            })


        return {

            user:
                sanitizeUser(user)

        }

    } catch (error) {

        if (
            error.code === "P2002"
        ) {

            const duplicateError =
                new Error(
                    "Email is already registered!"
                )

            duplicateError.status = 400

            throw duplicateError

        }


        throw error

    }

}


/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = {

    normalizeEmail,

    normalizePhone,

    validatePasswordPolicy,

    findUserByEmail,

    findUserById,

    findUserByIdentifier,

    sanitizeUser,

    verifyPassword,

    hashPassword,

    authenticateUser,

    loginUser,

    getCurrentUser,

    logoutUser,

    logoutAllDevices,

    resetUserPassword,

    changeUserPassword,

    registerUser

}
