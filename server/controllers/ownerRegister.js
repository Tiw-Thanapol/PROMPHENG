const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')


// ======================================================
// HELPERS
// ======================================================

function cleanString(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return null
    }

    const result =
        String(value).trim()

    return result || null
}


// ======================================================
// REGISTER OWNER
// POST /api/register-owner
//
// FLOW:
//
// Registration Code
//       ↓
// Create Account
//       ↓
// Create OWNER User
//       ↓
// Consume Registration Code
//
// ทุกอย่างทำใน transaction เดียวกัน
// ======================================================

exports.registerOwner = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            phoneNumber,
            picture,
            registrationCode
        } = req.body


        // ==================================================
        // NORMALIZE INPUT
        // ==================================================

        const normalizedName =
            typeof name === 'string'
                ? name.trim()
                : ''

        const normalizedEmail =
            typeof email === 'string'
                ? email.trim().toLowerCase()
                : ''

        const normalizedCode =
            typeof registrationCode === 'string'
                ? registrationCode.trim().toUpperCase()
                : ''

        const normalizedPhone =
            cleanString(phoneNumber)

        const normalizedPicture =
            cleanString(picture)


        // ==================================================
        // VALIDATION
        // ==================================================

        if (!normalizedName) {

            return res.status(400).json({

                message:
                    'Name is required'

            })

        }


        if (!normalizedEmail) {

            return res.status(400).json({

                message:
                    'Email is required'

            })

        }


        if (
            typeof password !== 'string' ||
            password.length < 6
        ) {

            return res.status(400).json({

                message:
                    'Password must be at least 6 characters'

            })

        }


        if (!normalizedCode) {

            return res.status(400).json({

                message:
                    'Registration code is required'

            })

        }


        // ==================================================
        // CHECK EMAIL
        //
        // Email is globally unique in schema
        // ==================================================

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
                    'Email already exists'

            })

        }


        // ==================================================
        // HASH PASSWORD
        // ==================================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            )


        // ==================================================
        // CREATE ACCOUNT + USER + CONSUME CODE
        //
        // ทุก operation อยู่ใน transaction เดียวกัน
        // ==================================================

        const result =
            await prisma.$transaction(
                async (tx) => {

                    // --------------------------------------
                    // LOCK / CHECK REGISTRATION CODE
                    // --------------------------------------

                    const code =
                        await tx.registrationCode.findUnique({

                            where: {

                                code:
                                    normalizedCode

                            }

                        })


                    if (!code) {

                        throw new Error(
                            'REGISTRATION_CODE_INVALID'
                        )

                    }


                    if (!code.enabled) {

                        throw new Error(
                            'REGISTRATION_CODE_DISABLED'
                        )

                    }


                    if (code.used) {

                        throw new Error(
                            'REGISTRATION_CODE_USED'
                        )

                    }


                    // --------------------------------------
                    // CREATE ACCOUNT
                    // --------------------------------------

                    const account =
                        await tx.account.create({

                            data: {

                                name:
                                    normalizedName

                            }

                        })


                    // --------------------------------------
                    // CREATE OWNER USER
                    // --------------------------------------

                    const user =
                        await tx.user.create({

                            data: {

                                accountId:
                                    account.id,

                                name:
                                    normalizedName,

                                email:
                                    normalizedEmail,

                                password:
                                    hashedPassword,

                                phoneNumber:
                                    normalizedPhone,

                                picture:
                                    normalizedPicture,

                                // NEVER accept role from client
                                role:
                                    'OWNER',

                                enabled:
                                    true

                            }

                        })


                    // --------------------------------------
                    // CONSUME REGISTRATION CODE
                    //
                    // ใช้ updateMany พร้อม used:false
                    // เพื่อป้องกัน double-use
                    // --------------------------------------

                    const consumeResult =
                        await tx.registrationCode.updateMany({

                            where: {

                                id:
                                    code.id,

                                used:
                                    false,

                                enabled:
                                    true

                            },

                            data: {

                                used:
                                    true,

                                usedById:
                                    user.id,

                                usedAt:
                                    new Date()

                            }

                        })


                    if (
                        consumeResult.count !== 1
                    ) {

                        throw new Error(
                            'REGISTRATION_CODE_CONFLICT'
                        )

                    }


                    return {

                        account,

                        user,

                        registrationCodeId:
                            code.id

                    }

                }
            )


        // ==================================================
        // AUDIT LOG
        // ==================================================

        await prisma.auditLog.create({

            data: {

                userId:
                    result.user.id,

                action:
                    'REGISTER',

                entity:
                    'User',

                entityId:
                    result.user.id,

                details:
                    JSON.stringify({

                        accountId:
                            result.account.id,

                        email:
                            result.user.email,

                        role:
                            result.user.role

                    })

            }

        })


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(201).json({

            message:
                'Owner registered successfully',

            user: {

                id:
                    result.user.id,

                name:
                    result.user.name,

                email:
                    result.user.email,

                phoneNumber:
                    result.user.phoneNumber,

                picture:
                    result.user.picture,

                role:
                    result.user.role,

                enabled:
                    result.user.enabled

            }

        })

    }
    catch (err) {

        console.error(
            'Owner Registration Error:',
            err
        )


        // ==================================================
        // INTERNAL REGISTRATION CODE ERRORS
        // ==================================================

        if (
            err?.message ===
            'REGISTRATION_CODE_INVALID'
        ) {

            return res.status(400).json({

                message:
                    'Invalid registration code'

            })

        }


        if (
            err?.message ===
            'REGISTRATION_CODE_DISABLED'
        ) {

            return res.status(400).json({

                message:
                    'Registration code is disabled'

            })

        }


        if (
            err?.message ===
            'REGISTRATION_CODE_USED'
        ) {

            return res.status(400).json({

                message:
                    'Registration code has already been used'

            })

        }


        if (
            err?.message ===
            'REGISTRATION_CODE_CONFLICT'
        ) {

            return res.status(409).json({

                message:
                    'Registration code is no longer available'

            })

        }


        // ==================================================
        // UNIQUE CONSTRAINT
        // ==================================================

        if (
            err?.code === 'P2002'
        ) {

            return res.status(400).json({

                message:
                    'Registration information already exists'

            })

        }


        // ==================================================
        // GENERIC ERROR
        // ==================================================

        return res.status(500).json({

            message:
                'Server Error'

        })

    }

}