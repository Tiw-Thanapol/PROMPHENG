const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')

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

        // ---------------------------------------------
        // Validation
        // ---------------------------------------------

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: 'Name is required'
            })
        }

        if (!email || !email.trim()) {
            return res.status(400).json({
                message: 'Email is required'
            })
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters'
            })
        }

        if (!registrationCode || !registrationCode.trim()) {
            return res.status(400).json({
                message: 'Registration code is required'
            })
        }

        // ---------------------------------------------
        // Check email
        // ---------------------------------------------

        const existingUser = await prisma.user.findUnique({
            where: {
                email: email.trim().toLowerCase()
            }
        })

        if (existingUser) {
            return res.status(400).json({
                message: 'Email already exists'
            })
        }

        // ---------------------------------------------
        // Check Registration Code
        // ---------------------------------------------

        const code = await prisma.registrationCode.findUnique({
            where: {
                code: registrationCode.trim()
            }
        })

        if (!code) {
            return res.status(400).json({
                message: 'Invalid registration code'
            })
        }

        if (!code.enabled) {
            return res.status(400).json({
                message: 'Registration code is disabled'
            })
        }

        if (code.used) {
            return res.status(400).json({
                message: 'Registration code has already been used'
            })
        }

        // ---------------------------------------------
        // Hash password
        // ---------------------------------------------

        const hashedPassword = await bcrypt.hash(password, 10)

        // ---------------------------------------------
        // Create User + consume Code
        // ---------------------------------------------

        const result = await prisma.$transaction(async (tx) => {

            const user = await tx.user.create({
                data: {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password: hashedPassword,
                    phoneNumber: phoneNumber || null,
                    picture: picture || null,

                    // ห้ามให้ client กำหนด role เอง
                    role: 'OWNER',

                    enabled: true
                }
            })

            await tx.registrationCode.update({
                where: {
                    id: code.id
                },
                data: {
                    used: true,
                    usedById: user.id,
                    usedAt: new Date()
                }
            })

            return user
        })

        // ---------------------------------------------
        // Audit Log
        // ---------------------------------------------

        await prisma.auditLog.create({
            data: {
                userId: result.id,
                action: 'REGISTER',
                entity: 'User',
                entityId: result.id,
                details: JSON.stringify({
                    email: result.email,
                    role: result.role
                })
            }
        })

        // ---------------------------------------------
        // Response
        // ---------------------------------------------

        res.status(201).json({
            message: 'Owner registered successfully',

            user: {
                id: result.id,
                name: result.name,
                email: result.email,
                phoneNumber: result.phoneNumber,
                picture: result.picture,
                role: result.role,
                enabled: result.enabled
            }
        })

    } catch (err) {

        console.log(err)

        res.status(500).json({
            message: 'Server Error'
        })
    }
}