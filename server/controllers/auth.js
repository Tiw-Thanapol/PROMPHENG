const prisma = require("../config/prisma")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const nodemailer = require("nodemailer")

const {
    createSession,
    deleteSession,
    deleteAllUserSessions
} = require("../services/sessionService")


// ======================================================
// EMAIL TRANSPORTER
// ======================================================

const transporter = nodemailer.createTransport({

    host:
        process.env.SMTP_HOST,

    port:
        Number(process.env.SMTP_PORT || 587),

    secure:
        process.env.SMTP_SECURE === "true",

    auth: {

        user:
            process.env.SMTP_USER,

        pass:
            process.env.SMTP_PASS

    }

})


// ======================================================
// CHECK SMTP
// ======================================================

if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
) {

    transporter.verify()

        .then(() => {

            console.log(
                "SMTP server is ready"
            )

        })

        .catch((err) => {

            console.error(
                "SMTP connection error:",
                err.message
            )

        })

}


// ======================================================
// CONSTANTS
// ======================================================

const VERIFICATION_TOKEN_EXPIRES_MINUTES = 30

const OTP_EXPIRES_MINUTES = 10

const OTP_MAX_ATTEMPTS = 5

const OTP_MAX_REQUESTS_PER_HOUR = 3

const RESET_TOKEN_EXPIRES_MINUTES = 10

const SESSION_COOKIE_NAME =
    "session"

const SESSION_MAX_AGE =
    1000 *
    60 *
    60 *
    24 *
    7


// ======================================================
// HELPERS
// ======================================================


// ------------------------------------------------------
// Normalize Email
// ------------------------------------------------------

function normalizeEmail(email) {

    return String(email || "")
        .trim()
        .toLowerCase()

}


// ------------------------------------------------------
// Normalize Phone
// ------------------------------------------------------

function normalizePhone(phone) {

    return String(phone || "")
        .trim()

}


// ------------------------------------------------------
// Escape HTML
// ------------------------------------------------------

function escapeHtml(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")

}


// ------------------------------------------------------
// Create Verification Token
// ------------------------------------------------------

function createVerificationToken() {

    return crypto
        .randomBytes(32)
        .toString("hex")

}


// ------------------------------------------------------
// Create Verification Expiry
// ------------------------------------------------------

function createVerificationExpiry() {

    return new Date(

        Date.now() +
        VERIFICATION_TOKEN_EXPIRES_MINUTES *
        60 *
        1000

    )

}


// ------------------------------------------------------
// Create Verification URL
// ------------------------------------------------------

function createVerificationUrl(token) {

    const frontendUrl =
        process.env.FRONTEND_URL ||
        "http://localhost:5173"

    return (
        `${frontendUrl}/verify-email?token=` +
        encodeURIComponent(token)
    )

}


// ------------------------------------------------------
// Generate OTP
// ------------------------------------------------------

function generateOtp() {

    return String(
        crypto.randomInt(
            100000,
            1000000
        )
    )

}


// ------------------------------------------------------
// Create OTP Expiry
// ------------------------------------------------------

function createOtpExpiry() {

    return new Date(

        Date.now() +
        OTP_EXPIRES_MINUTES *
        60 *
        1000

    )

}


// ------------------------------------------------------
// Mask Email
// ------------------------------------------------------

function maskEmail(email) {

    const parts =
        String(email || "").split("@")

    if (parts.length !== 2) {

        return email

    }

    const [localPart, domain] =
        parts

    const visible =
        localPart.slice(0, 2)

    const stars =
        "*".repeat(
            Math.max(
                localPart.length - 2,
                3
            )
        )

    return `${visible}${stars}@${domain}`

}


// ------------------------------------------------------
// Find User By Email OR Phone
// ------------------------------------------------------

async function findUserByIdentifier(identifier) {

    const raw =
        String(identifier || "").trim()

    const isEmail =
        raw.includes("@")

    if (isEmail) {

        return prisma.user.findUnique({

            where: {

                email:
                    normalizeEmail(raw)

            }

        })

    }

    return prisma.user.findFirst({

        where: {

            phoneNumber:
                normalizePhone(raw)

        }

    })

}


// ------------------------------------------------------
// Password Policy
// ------------------------------------------------------

function validatePasswordPolicy(password) {

    const errors = []

    if (
        !password ||
        password.length < 8
    ) {

        errors.push(
            "Password must be at least 8 characters!"
        )

    }

    if (
        !/[A-Z]/.test(
            password || ""
        )
    ) {

        errors.push(
            "Password must contain an uppercase letter!"
        )

    }

    if (
        !/[a-z]/.test(
            password || ""
        )
    ) {

        errors.push(
            "Password must contain a lowercase letter!"
        )

    }

    if (
        !/[0-9]/.test(
            password || ""
        )
    ) {

        errors.push(
            "Password must contain a number!"
        )

    }

    if (
        !/[^A-Za-z0-9]/.test(
            password || ""
        )
    ) {

        errors.push(
            "Password must contain a special character!"
        )

    }

    return errors

}


// ======================================================
// SESSION COOKIE
// ======================================================


// ------------------------------------------------------
// Cookie Options
// ------------------------------------------------------
//
// Production:
// - HttpOnly
// - Secure
// - SameSite ตาม env หรือ lax
//
// Development:
// - HttpOnly
// - Secure false
//
// สามารถกำหนด:
// SESSION_COOKIE_SAMESITE=lax
// SESSION_COOKIE_SAMESITE=strict
// SESSION_COOKIE_SAMESITE=none
//
// ------------------------------------------------------

function getSessionCookieOptions() {

    const isProduction =
        process.env.NODE_ENV === "production"

    const sameSite =
        String(
            process.env.SESSION_COOKIE_SAMESITE ||
            "lax"
        ).toLowerCase()

    const options = {

        httpOnly:
            true,

        secure:
            isProduction,

        sameSite,

        maxAge:
            SESSION_MAX_AGE,

        path:
            "/"

    }


    if (
        process.env.SESSION_COOKIE_DOMAIN
    ) {

        options.domain =
            process.env.SESSION_COOKIE_DOMAIN

    }


    return options

}


// ------------------------------------------------------
// Set Session Cookie
// ------------------------------------------------------

function setSessionCookie(
    res,
    token
) {

    res.cookie(

        SESSION_COOKIE_NAME,

        token,

        getSessionCookieOptions()

    )

}


// ------------------------------------------------------
// Clear Session Cookie
// ------------------------------------------------------

function clearSessionCookie(res) {

    const options =
        getSessionCookieOptions()

    delete options.maxAge

    res.clearCookie(

        SESSION_COOKIE_NAME,

        options

    )

}


// ------------------------------------------------------
// Get Session Token
// ------------------------------------------------------

function getSessionToken(req) {

    if (
        !req ||
        !req.cookies
    ) {

        return null

    }

    const token =
        req.cookies[
            SESSION_COOKIE_NAME
        ]

    if (
        !token ||
        typeof token !== "string"
    ) {

        return null

    }

    return token

}


// ======================================================
// EMAIL
// ======================================================


// ------------------------------------------------------
// Send Verification Email
// ------------------------------------------------------

async function sendVerificationEmail({

    email,
    name,
    token

}) {

    const verifyUrl =
        createVerificationUrl(token)

    const safeName =
        escapeHtml(
            name || "ผู้ใช้งาน"
        )

    await transporter.sendMail({

        from:
            process.env.SMTP_FROM ||
            process.env.SMTP_USER,

        to:
            email,

        subject:
            "ยืนยัน Email - PROMPHENG",

        html: `

            <!DOCTYPE html>

            <html>

            <head>

                <meta charset="UTF-8">

                <title>
                    ยืนยัน Email - PROMPHENG
                </title>

            </head>

            <body
                style="
                    margin:0;
                    padding:0;
                    background:#f5f5f5;
                    font-family:Arial,sans-serif;
                "
            >

                <div
                    style="
                        max-width:600px;
                        margin:40px auto;
                        background:#ffffff;
                        padding:30px;
                        border-radius:12px;
                    "
                >

                    <h2>
                        ยืนยัน Email ของคุณ
                    </h2>

                    <p>
                        สวัสดี ${safeName}
                    </p>

                    <p>
                        ขอบคุณที่สมัครสมาชิก PROMPHENG
                    </p>

                    <p>
                        กรุณากดปุ่มด้านล่าง
                        เพื่อยืนยัน Email
                        และเปิดใช้งานบัญชีของคุณ
                    </p>

                    <div
                        style="
                            margin:30px 0;
                            text-align:center;
                        "
                    >

                        <a
                            href="${verifyUrl}"
                            style="
                                display:inline-block;
                                padding:14px 24px;
                                background:#2563eb;
                                color:#ffffff;
                                text-decoration:none;
                                border-radius:8px;
                                font-weight:bold;
                            "
                        >
                            ยืนยัน Email
                        </a>

                    </div>

                    <p>
                        ลิงก์นี้มีอายุ
                        ${VERIFICATION_TOKEN_EXPIRES_MINUTES}
                        นาที
                    </p>

                    <p
                        style="
                            color:#666666;
                            font-size:13px;
                        "
                    >
                        หากคุณไม่ได้สมัครสมาชิก
                        สามารถเพิกเฉยต่อ Email นี้ได้
                    </p>

                </div>

            </body>

            </html>

        `

    })

}


// ------------------------------------------------------
// Send OTP Email
// ------------------------------------------------------

async function sendOtpEmail({

    email,
    name,
    otp

}) {

    const safeName =
        escapeHtml(
            name || "ผู้ใช้งาน"
        )

    await transporter.sendMail({

        from:
            process.env.SMTP_FROM ||
            process.env.SMTP_USER,

        to:
            email,

        subject:
            "รหัสยืนยันการตั้งรหัสผ่านใหม่ - PROMPHENG",

        html: `

            <!DOCTYPE html>

            <html>

            <head>

                <meta charset="UTF-8">

                <title>
                    รหัสยืนยัน - PROMPHENG
                </title>

            </head>

            <body
                style="
                    margin:0;
                    padding:0;
                    background:#f5f5f5;
                    font-family:Arial,sans-serif;
                "
            >

                <div
                    style="
                        max-width:600px;
                        margin:40px auto;
                        background:#ffffff;
                        padding:30px;
                        border-radius:12px;
                    "
                >

                    <h2>
                        รีเซ็ตรหัสผ่านของคุณ
                    </h2>

                    <p>
                        สวัสดี ${safeName}
                    </p>

                    <p>
                        เราได้รับคำขอรีเซ็ตรหัสผ่านของบัญชีนี้
                        กรุณาใช้รหัสด้านล่างเพื่อยืนยันตัวตน
                    </p>

                    <div
                        style="
                            margin:30px 0;
                            text-align:center;
                        "
                    >

                        <span
                            style="
                                display:inline-block;
                                padding:14px 28px;
                                background:#f0f4ff;
                                color:#12213b;
                                letter-spacing:6px;
                                font-size:28px;
                                font-weight:bold;
                                border-radius:8px;
                            "
                        >
                            ${otp}
                        </span>

                    </div>

                    <p>
                        รหัสนี้มีอายุ
                        ${OTP_EXPIRES_MINUTES}
                        นาที
                    </p>

                    <p
                        style="
                            color:#666666;
                            font-size:13px;
                        "
                    >
                        หากคุณไม่ได้ทำรายการนี้
                        สามารถเพิกเฉยต่อ Email นี้ได้
                    </p>

                </div>

            </body>

            </html>

        `

    })

}


// ======================================================
// REGISTER
// ======================================================
//
// แก้ไข:
// เดิม prisma.user.create ไม่เคยผูก accountId เลย
// ทำให้ user ทุกคนมี accountId เป็น null เหมือนกันหมด
// ส่งผลให้ query ที่ filter ด้วย accountId ในทุก controller
// เพิกเฉยต่อ filter (Prisma ตัด field ที่เป็น undefined/null
// ทิ้งจาก where) และดึงข้อมูลข้าม account ปนกันหมด
//
// ตอนนี้ทุกครั้งที่ register จะสร้าง Account ใหม่ 1 อัน
// คู่กับ User แรกที่สมัคร แล้วผูก accountId ให้ user นั้น
// ในธุรกรรมเดียวกัน (atomic)
//
// ======================================================

exports.register = async (req, res) => {

    try {

        const {

            email,
            password,
            name,
            phoneNumber

        } = req.body


        // --------------------------------------------------
        // VALIDATE
        // --------------------------------------------------

        if (!email) {

            return res.status(400).json({

                message:
                    "Email is required!"

            })

        }


        if (!password) {

            return res.status(400).json({

                message:
                    "Password is required!"

            })

        }


        const passwordErrors =
            validatePasswordPolicy(
                password
            )


        if (
            passwordErrors.length > 0
        ) {

            return res.status(400).json({

                message:
                    passwordErrors[0],

                errors:
                    passwordErrors

            })

        }


        const normalizedEmail =
            normalizeEmail(email)


        // --------------------------------------------------
        // CHECK EXISTING EMAIL
        // --------------------------------------------------

        const existingUser =
            await prisma.user.findUnique({

                where: {

                    email:
                        normalizedEmail

                }

            })


        if (existingUser) {

            return res.status(400).json({

                message:
                    "Email is already registered!"

            })

        }


        // --------------------------------------------------
        // HASH PASSWORD
        // --------------------------------------------------

        const hashPassword =
            await bcrypt.hash(
                password,
                10
            )


        const cleanName =
            name
                ? String(name).trim()
                : null


        // --------------------------------------------------
        // CREATE ACCOUNT + USER (atomic)
        // --------------------------------------------------
        //
        // Account ใหม่ 1 อัน ต่อการ register 1 ครั้ง
        // User คนแรกที่สมัครจะกลายเป็นเจ้าของ Account นี้
        //
        // --------------------------------------------------

        const user =
            await prisma.$transaction(
                async (tx) => {

                    const account =
                        await tx.account.create({

                            data: {

                                name:
                                    cleanName ||
                                    normalizedEmail

                            }

                        })


                    const createdUser =
                        await tx.user.create({

                            data: {

                                accountId:
                                    account.id,

                                email:
                                    normalizedEmail,

                                password:
                                    hashPassword,

                                name:
                                    cleanName,

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


                    return createdUser

                }
            )


        // --------------------------------------------------
        // CREATE VERIFICATION TOKEN
        // --------------------------------------------------

        const token =
            createVerificationToken()

        const expiresAt =
            createVerificationExpiry()


        await prisma.emailVerificationToken.create({

            data: {

                token,

                userId:
                    user.id,

                expiresAt

            }

        })


        // --------------------------------------------------
        // SEND EMAIL
        // --------------------------------------------------

        try {

            await sendVerificationEmail({

                email:
                    user.email,

                name:
                    user.name,

                token

            })

        } catch (emailError) {

            console.error(
                "SEND VERIFICATION EMAIL ERROR:",
                emailError
            )

            return res.status(201).json({

                message:
                    "Registration successful, but verification email could not be sent. Please request a new verification email.",

                emailSent:
                    false

            })

        }


        return res.status(201).json({

            message:
                "Registration successful. Please check your email to verify your account.",

            emailSent:
                true

        })


    } catch (err) {

        if (
            err.code === "P2002"
        ) {

            return res.status(400).json({

                message:
                    "Email is already registered!"

            })

        }


        console.error(
            "REGISTER ERROR:",
            err
        )


        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}


// ======================================================
// PREVIEW VERIFY EMAIL
// ======================================================
//
// GET /api/verify-email?token=xxxx
//
// GET ไม่มีสิทธิ์เปลี่ยน Database
//
// ======================================================

exports.previewVerification = async (
    req,
    res
) => {

    try {

        const { token } =
            req.query


        if (!token) {

            return res.status(400).json({

                valid:
                    false,

                message:
                    "Verification token is required!"

            })

        }


        const verificationToken =
            await prisma.emailVerificationToken.findUnique({

                where: {

                    token:
                        String(token)

                },

                include: {

                    user: {

                        select: {

                            id:
                                true,

                            email:
                                true,

                            name:
                                true,

                            enabled:
                                true

                        }

                    }

                }

            })


        if (!verificationToken) {

            return res.status(400).json({

                valid:
                    false,

                message:
                    "Invalid verification token!"

            })

        }


        // --------------------------------------------------
        // ALREADY USED
        // --------------------------------------------------

        if (
            verificationToken.used
        ) {

            if (
                verificationToken.user.enabled
            ) {

                return res.status(200).json({

                    valid:
                        false,

                    alreadyVerified:
                        true,

                    message:
                        "This Email has already been verified."

                })

            }


            return res.status(400).json({

                valid:
                    false,

                message:
                    "Verification token has already been used!"

            })

        }


        // --------------------------------------------------
        // EXPIRED
        // --------------------------------------------------

        if (
            verificationToken.expiresAt <=
            new Date()
        ) {

            return res.status(400).json({

                valid:
                    false,

                message:
                    "Verification token has expired!"

            })

        }


        return res.status(200).json({

            valid:
                true,

            message:
                "Verification token is valid."

        })


    } catch (err) {

        console.error(
            "PREVIEW VERIFY EMAIL ERROR:",
            err
        )


        return res.status(500).json({

            valid:
                false,

            message:
                "Server Error"

        })

    }

}


// ======================================================
// VERIFY EMAIL
// ======================================================
//
// POST /api/verify-email
//
// ======================================================

exports.verifyEmail = async (
    req,
    res
) => {

    try {

        const { token } =
            req.body


        if (!token) {

            return res.status(400).json({

                message:
                    "Verification token is required!"

            })

        }


        const verificationToken =
            await prisma.emailVerificationToken.findUnique({

                where: {

                    token:
                        String(token)

                },

                include: {

                    user:
                        true

                }

            })


        if (!verificationToken) {

            return res.status(400).json({

                message:
                    "Invalid verification token!"

            })

        }


        // --------------------------------------------------
        // ALREADY VERIFIED
        // --------------------------------------------------

        if (
            verificationToken.used
        ) {

            if (
                verificationToken.user.enabled
            ) {

                return res.status(200).json({

                    alreadyVerified:
                        true,

                    message:
                        "Email has already been verified."

                })

            }


            return res.status(400).json({

                message:
                    "Verification token has already been used!"

            })

        }


        // --------------------------------------------------
        // EXPIRED
        // --------------------------------------------------

        if (
            verificationToken.expiresAt <=
            new Date()
        ) {

            return res.status(400).json({

                message:
                    "Verification token has expired!"

            })

        }


        // --------------------------------------------------
        // CLAIM TOKEN + ENABLE USER
        // --------------------------------------------------

        await prisma.$transaction(
            async (tx) => {

                const now =
                    new Date()


                const claimedToken =
                    await tx.emailVerificationToken.updateMany({

                        where: {

                            id:
                                verificationToken.id,

                            used:
                                false,

                            expiresAt: {

                                gt:
                                    now

                            }

                        },

                        data: {

                            used:
                                true,

                            usedAt:
                                now

                        }

                    })


                if (
                    claimedToken.count !== 1
                ) {

                    throw new Error(
                        "VERIFICATION_TOKEN_ALREADY_USED"
                    )

                }


                await tx.user.update({

                    where: {

                        id:
                            verificationToken.userId

                    },

                    data: {

                        enabled:
                            true

                    }

                })

            }
        )


        console.log(

            "EMAIL VERIFIED USER:",

            verificationToken.user.id,

            verificationToken.user.email

        )


        return res.status(200).json({

            success:
                true,

            message:
                "Email verified successfully!"

        })


    } catch (err) {

        if (
            err.message ===
            "VERIFICATION_TOKEN_ALREADY_USED"
        ) {

            return res.status(200).json({

                alreadyVerified:
                    true,

                message:
                    "Email has already been verified."

            })

        }


        console.error(
            "VERIFY EMAIL ERROR:",
            err
        )


        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}


// ======================================================
// RESEND VERIFICATION EMAIL
// ======================================================

exports.resendVerification = async (
    req,
    res
) => {

    try {

        const { email } =
            req.body


        if (!email) {

            return res.status(400).json({

                message:
                    "Email is required!"

            })

        }


        const normalizedEmail =
            normalizeEmail(email)


        const user =
            await prisma.user.findUnique({

                where: {

                    email:
                        normalizedEmail

                }

            })


        // --------------------------------------------------
        // GENERIC RESPONSE
        // --------------------------------------------------

        if (!user) {

            return res.status(200).json({

                message:
                    "If this account exists and is not verified, a verification email has been sent."

            })

        }


        // --------------------------------------------------
        // ALREADY VERIFIED
        // --------------------------------------------------

        if (
            user.enabled
        ) {

            return res.status(400).json({

                message:
                    "This Email has already been verified."

            })

        }


        // --------------------------------------------------
        // INVALIDATE OLD UNUSED TOKENS
        // --------------------------------------------------

        await prisma.emailVerificationToken.updateMany({

            where: {

                userId:
                    user.id,

                used:
                    false

            },

            data: {

                used:
                    true,

                usedAt:
                    new Date()

            }

        })


        // --------------------------------------------------
        // CREATE NEW TOKEN
        // --------------------------------------------------

        const token =
            createVerificationToken()

        const expiresAt =
            createVerificationExpiry()


        await prisma.emailVerificationToken.create({

            data: {

                token,

                userId:
                    user.id,

                expiresAt

            }

        })


        // --------------------------------------------------
        // SEND EMAIL
        // --------------------------------------------------

        await sendVerificationEmail({

            email:
                user.email,

            name:
                user.name,

            token

        })


        return res.status(200).json({

            message:
                "Verification email has been sent."

        })


    } catch (err) {

        console.error(
            "RESEND VERIFICATION ERROR:",
            err
        )


        return res.status(500).json({

            message:
                "Could not send verification email."

        })

    }

}


// ======================================================
// LOGIN
// ======================================================
//
// POST /api/login
//
// Authentication:
// Email + Password
//        ↓
// DB Session
//        ↓
// HttpOnly Cookie
//
// ไม่มี JWT Login แล้ว
//
// ======================================================

exports.login = async (
    req,
    res
) => {

    try {

        const {

            email,
            password

        } = req.body


        // --------------------------------------------------
        // VALIDATE
        // --------------------------------------------------

        if (!email) {

            return res.status(400).json({

                message:
                    "Email is required!"

            })

        }


        if (!password) {

            return res.status(400).json({

                message:
                    "Password is required!"

            })

        }


        const normalizedEmail =
            normalizeEmail(email)


        // --------------------------------------------------
        // FIND USER
        // --------------------------------------------------

        const user =
            await prisma.user.findUnique({

                where: {

                    email:
                        normalizedEmail

                }

            })


        if (!user) {

            return res.status(400).json({

                message:
                    "Email or password is invalid!"

            })

        }


        // --------------------------------------------------
        // PASSWORD LOGIN SUPPORTED?
        // --------------------------------------------------

        if (!user.password) {

            return res.status(400).json({

                message:
                    "This account does not support password login."

            })

        }


        // --------------------------------------------------
        // CHECK PASSWORD
        // --------------------------------------------------

        const isMatch =
            await bcrypt.compare(

                password,

                user.password

            )


        if (!isMatch) {

            return res.status(400).json({

                message:
                    "Email or password is invalid!"

            })

        }


        // --------------------------------------------------
        // EMAIL VERIFIED
        // --------------------------------------------------

        if (!user.enabled) {

            return res.status(403).json({

                message:
                    "Please verify your email before logging in.",

                emailVerified:
                    false

            })

        }


        // --------------------------------------------------
        // CREATE DATABASE SESSION
        // --------------------------------------------------

        const {
            token,
            session
        } =
            await createSession(

                user.id,

                {

                    ipAddress:
                        req.ip,

                    userAgent:
                        req.get(
                            "user-agent"
                        )

                }

            )


        // --------------------------------------------------
        // SET HTTPONLY COOKIE
        // --------------------------------------------------

        setSessionCookie(
            res,
            token
        )


        // --------------------------------------------------
        // SAFE USER PAYLOAD
        // --------------------------------------------------

        const payload = {

            id:
                user.id,

            email:
                user.email,

            name:
                user.name,

            picture:
                user.picture,

            role:
                user.role

        }


        // --------------------------------------------------
        // RESPONSE
        // --------------------------------------------------

        return res.status(200).json({

            success:
                true,

            user:
                payload,

            session: {

                id:
                    session.id,

                expiresAt:
                    session.expiresAt

            }

        })


    } catch (err) {

        console.error(
            "LOGIN ERROR:",
            err
        )


        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}


// ======================================================
// LOGOUT
// ======================================================
//
// POST /api/logout
//
// อ่าน Session Cookie
//        ↓
// Delete DB Session
//        ↓
// Clear Cookie
//
// ======================================================

exports.logout = async (
    req,
    res
) => {

    try {

        const token =
            getSessionToken(req)


        // --------------------------------------------------
        // DELETE SESSION
        // --------------------------------------------------

        if (token) {

            try {

                await deleteSession(
                    token
                )

            } catch (sessionError) {

                console.error(
                    "DELETE SESSION ERROR:",
                    sessionError
                )

            }

        }


        // --------------------------------------------------
        // CLEAR COOKIE
        // --------------------------------------------------

        clearSessionCookie(res)


        return res.status(200).json({

            success:
                true,

            message:
                "Logged out successfully."

        })


    } catch (err) {

        console.error(
            "LOGOUT ERROR:",
            err
        )


        clearSessionCookie(res)


        return res.status(500).json({

            success:
                false,

            message:
                "Could not complete logout."

        })

    }

}


// ======================================================
// LOGOUT ALL SESSIONS
// ======================================================
//
// ต้องใช้ Auth Middleware
//
// POST /api/logout-all
//
// ======================================================

exports.logoutAll = async (
    req,
    res
) => {

    try {

        if (
            !req.user ||
            !req.user.id
        ) {

            clearSessionCookie(res)

            return res.status(401).json({

                message:
                    "Authentication required."

            })

        }


        const deletedCount =
            await deleteAllUserSessions(
                req.user.id
            )


        clearSessionCookie(res)


        return res.status(200).json({

            success:
                true,

            message:
                "Logged out from all devices successfully.",

            sessionsRevoked:
                deletedCount

        })


    } catch (err) {

        console.error(
            "LOGOUT ALL ERROR:",
            err
        )


        return res.status(500).json({

            success:
                false,

            message:
                "Could not logout from all devices."

        })

    }

}


// ======================================================
// CURRENT USER
// ======================================================
//
// GET /api/current-user
//
// req.user มาจาก Auth Middleware
//
// ======================================================

exports.currentUser = async (
    req,
    res
) => {

    try {

        if (
            !req.user ||
            !req.user.id
        ) {

            return res.status(401).json({

                message:
                    "Authentication required."

            })

        }


        const user =
            await prisma.user.findUnique({

                where: {

                    id:
                        req.user.id

                },

                select: {

                    id:
                        true,

                    email:
                        true,

                    name:
                        true,

                    phoneNumber:
                        true,

                    picture:
                        true,

                    role:
                        true,

                    enabled:
                        true

                }

            })


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            })

        }


        // --------------------------------------------------
        // ACCOUNT DISABLED
        // --------------------------------------------------

        if (
            !user.enabled
        ) {

            return res.status(403).json({

                message:
                    "Account is disabled."

            })

        }


        return res.status(200).json({

            user

        })


    } catch (err) {

        console.error(
            "CURRENT USER ERROR:",
            err
        )


        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}


// ======================================================
// FORGOT PASSWORD
// ======================================================

exports.forgotPassword = async (
    req,
    res
) => {

    try {

        const { identifier } =
            req.body


        if (!identifier) {

            return res.status(400).json({

                message:
                    "Email or phone number is required!"

            })

        }


        const user =
            await findUserByIdentifier(
                identifier
            )


        // --------------------------------------------------
        // GENERIC RESPONSE
        // ป้องกัน Email Enumeration
        // --------------------------------------------------

        if (
            !user ||
            !user.password
        ) {

            return res.status(200).json({

                message:
                    "If this account exists, a verification code has been sent to the registered email."

            })

        }


        // --------------------------------------------------
        // RATE LIMIT
        // --------------------------------------------------

        const recentRequestCount =
            await prisma.verificationCode.count({

                where: {

                    userId:
                        user.id,

                    purpose:
                        "PASSWORD_RESET",

                    createdAt: {

                        gt:
                            new Date(

                                Date.now() -
                                60 *
                                60 *
                                1000

                            )

                    }

                }

            })


        if (
            recentRequestCount >=
            OTP_MAX_REQUESTS_PER_HOUR
        ) {

            return res.status(429).json({

                message:
                    "Too many requests. Please try again later."

            })

        }


        // --------------------------------------------------
        // INVALIDATE OLD OTP
        // --------------------------------------------------

        await prisma.verificationCode.updateMany({

            where: {

                userId:
                    user.id,

                purpose:
                    "PASSWORD_RESET",

                consumed:
                    false

            },

            data: {

                consumed:
                    true,

                consumedAt:
                    new Date()

            }

        })


        // --------------------------------------------------
        // CREATE OTP
        // --------------------------------------------------

        const otp =
            generateOtp()

        const codeHash =
            await bcrypt.hash(
                otp,
                10
            )

        const expiresAt =
            createOtpExpiry()


        await prisma.verificationCode.create({

            data: {

                userId:
                    user.id,

                purpose:
                    "PASSWORD_RESET",

                codeHash,

                expiresAt,

                requestIp:
                    req.ip,

                maxAttempts:
                    OTP_MAX_ATTEMPTS

            }

        })


        // --------------------------------------------------
        // SEND OTP
        // --------------------------------------------------

        try {

            await sendOtpEmail({

                email:
                    user.email,

                name:
                    user.name,

                otp

            })

        } catch (emailError) {

            console.error(
                "SEND OTP EMAIL ERROR:",
                emailError
            )


            return res.status(500).json({

                message:
                    "Could not send verification code. Please try again."

            })

        }


        return res.status(200).json({

            message:
                "If this account exists, a verification code has been sent to the registered email.",

            maskedEmail:
                maskEmail(
                    user.email
                )

        })


    } catch (err) {

        console.error(
            "FORGOT PASSWORD ERROR:",
            err
        )


        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}


// ======================================================
// VERIFY RESET OTP
// ======================================================

exports.verifyResetOtp = async (
    req,
    res
) => {

    try {

        const {

            identifier,
            otp

        } = req.body


        if (!identifier) {

            return res.status(400).json({

                message:
                    "Email or phone number is required!"

            })

        }


        if (!otp) {

            return res.status(400).json({

                message:
                    "Verification code is required!"

            })

        }


        const user =
            await findUserByIdentifier(
                identifier
            )


        if (!user) {

            return res.status(400).json({

                message:
                    "Invalid or expired verification code!"

            })

        }


        const verificationCode =
            await prisma.verificationCode.findFirst({

                where: {

                    userId:
                        user.id,

                    purpose:
                        "PASSWORD_RESET",

                    consumed:
                        false

                },

                orderBy: {

                    createdAt:
                        "desc"

                }

            })


        if (!verificationCode) {

            return res.status(400).json({

                message:
                    "Invalid or expired verification code!"

            })

        }


        // --------------------------------------------------
        // EXPIRED
        // --------------------------------------------------

        if (
            verificationCode.expiresAt <=
            new Date()
        ) {

            await prisma.verificationCode.update({

                where: {

                    id:
                        verificationCode.id

                },

                data: {

                    consumed:
                        true,

                    consumedAt:
                        new Date()

                }

            })


            return res.status(400).json({

                message:
                    "Verification code has expired. Please request a new one."

            })

        }


        // --------------------------------------------------
        // MAX ATTEMPTS
        // --------------------------------------------------

        if (
            verificationCode.attempts >=
            verificationCode.maxAttempts
        ) {

            await prisma.verificationCode.update({

                where: {

                    id:
                        verificationCode.id

                },

                data: {

                    consumed:
                        true,

                    consumedAt:
                        new Date()

                }

            })


            return res.status(400).json({

                message:
                    "Too many incorrect attempts. Please request a new code."

            })

        }


        // --------------------------------------------------
        // CHECK OTP
        // --------------------------------------------------

        const isMatch =
            await bcrypt.compare(

                String(otp).trim(),

                verificationCode.codeHash

            )


        if (!isMatch) {

            const updated =
                await prisma.verificationCode.update({

                    where: {

                        id:
                            verificationCode.id

                    },

                    data: {

                        attempts: {

                            increment:
                                1

                        }

                    }

                })


            if (
                updated.attempts >=
                updated.maxAttempts
            ) {

                await prisma.verificationCode.update({

                    where: {

                        id:
                            verificationCode.id

                    },

                    data: {

                        consumed:
                            true,

                        consumedAt:
                            new Date()

                    }

                })

            }


            return res.status(400).json({

                message:
                    "Invalid verification code!",

                attemptsRemaining:
                    Math.max(

                        updated.maxAttempts -
                        updated.attempts,

                        0

                    )

            })

        }


        // --------------------------------------------------
        // CONSUME OTP
        // --------------------------------------------------

        await prisma.verificationCode.update({

            where: {

                id:
                    verificationCode.id

            },

            data: {

                consumed:
                    true,

                consumedAt:
                    new Date()

            }

        })


        // --------------------------------------------------
        // CREATE SHORT-LIVED RESET TOKEN
        // --------------------------------------------------
        //
        // JWT ตรงนี้ไม่ใช่ Login Session
        // ใช้เฉพาะ Password Reset
        //
        // --------------------------------------------------

        const resetToken =
            jwt.sign(

                {

                    userId:
                        user.id,

                    verificationCodeId:
                        verificationCode.id,

                    purpose:
                        "password_reset"

                },

                process.env.JWT_SECRET,

                {

                    expiresIn:
                        `${RESET_TOKEN_EXPIRES_MINUTES}m`

                }

            )


        return res.status(200).json({

            message:
                "Verification code confirmed.",

            resetToken

        })


    } catch (err) {

        console.error(
            "VERIFY RESET OTP ERROR:",
            err
        )


        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}


// ======================================================
// RESET PASSWORD
// ======================================================

exports.resetPassword = async (
    req,
    res
) => {

    try {

        const {

            resetToken,
            newPassword,
            confirmPassword

        } = req.body


        // --------------------------------------------------
        // VALIDATE
        // --------------------------------------------------

        if (!resetToken) {

            return res.status(400).json({

                message:
                    "Reset token is required!"

            })

        }


        if (!newPassword) {

            return res.status(400).json({

                message:
                    "New password is required!"

            })

        }


        if (
            newPassword !==
            confirmPassword
        ) {

            return res.status(400).json({

                message:
                    "Passwords do not match!"

            })

        }


        // --------------------------------------------------
        // PASSWORD POLICY
        // --------------------------------------------------

        const passwordErrors =
            validatePasswordPolicy(
                newPassword
            )


        if (
            passwordErrors.length > 0
        ) {

            return res.status(400).json({

                message:
                    passwordErrors[0],

                errors:
                    passwordErrors

            })

        }


        // --------------------------------------------------
        // VERIFY RESET TOKEN
        // --------------------------------------------------

        let payload

        try {

            payload =
                jwt.verify(

                    resetToken,

                    process.env.JWT_SECRET

                )

        } catch (jwtError) {

            return res.status(400).json({

                message:
                    "Invalid or expired reset session. Please start again."

            })

        }


        // --------------------------------------------------
        // CHECK PURPOSE
        // --------------------------------------------------

        if (
            payload.purpose !==
            "password_reset"
        ) {

            return res.status(400).json({

                message:
                    "Invalid or expired reset session. Please start again."

            })

        }


        // --------------------------------------------------
        // CHECK USER
        // --------------------------------------------------

        const user =
            await prisma.user.findUnique({

                where: {

                    id:
                        payload.userId

                }

            })


        if (!user) {

            return res.status(400).json({

                message:
                    "Invalid or expired reset session. Please start again."

            })

        }


        // --------------------------------------------------
        // HASH NEW PASSWORD
        // --------------------------------------------------

        const hashPassword =
            await bcrypt.hash(

                newPassword,

                10

            )


        // --------------------------------------------------
        // UPDATE PASSWORD
        // --------------------------------------------------

        await prisma.$transaction(
            async (tx) => {

                await tx.user.update({

                    where: {

                        id:
                            user.id

                    },

                    data: {

                        password:
                            hashPassword

                    }

                })

            }
        )


        // --------------------------------------------------
        // REVOKE ALL LOGIN SESSIONS
        // --------------------------------------------------
        //
        // Password ถูกเปลี่ยนแล้ว
        // Session เก่าทั้งหมดต้องใช้ไม่ได้
        //
        // --------------------------------------------------

        await deleteAllUserSessions(
            user.id
        )


        // --------------------------------------------------
        // CLEAR CURRENT SESSION COOKIE
        // --------------------------------------------------

        clearSessionCookie(res)


        return res.status(200).json({

            success:
                true,

            message:
                "Password has been reset successfully. Please login with your new password."

        })


    } catch (err) {

        console.error(
            "RESET PASSWORD ERROR:",
            err
        )


        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}


// ======================================================
// EXPORT INTERNAL HELPERS
// ======================================================
//
// ไม่จำเป็นสำหรับ Routes
// แต่เปิดไว้สำหรับ unit test / service test ในอนาคต
//
// ======================================================

exports.normalizeEmail =
    normalizeEmail

exports.normalizePhone =
    normalizePhone

exports.validatePasswordPolicy =
    validatePasswordPolicy