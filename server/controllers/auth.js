const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
    //code
    try {
        //code
        const { email, password } = req.body
        if (!email) {
            //Step1 Validate body
            return res.status(400).json({ message: 'Email is require!' })
        }
        if (!password) {
            return res.status(400).json({ message: "Password is require!" })
        }

        //Step 2 Check Email in DB Already?
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        if (user) {
            return res.status(400).json({ message: 'Email is already registered!' })
        }
        //Step 3 HashPassword
        const hashPassword = await bcrypt.hash(password, 10)

        //Step 4 Register
        await prisma.user.create({
            data: {
                email: email,
                password: hashPassword
            }
        })

        res.send('Register Success!')
    } catch (err) {
        //err
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}
exports.login = async (req, res) => {
    //code
    try {
        //code
        const { email, password } = req.body
        //Step 1 Check Email
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        if (!user || !user.enabled) {
            return res.status(400).json({ message: 'User not found!' })
        }
        //Step 2 Check Pass
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Password invalid!' })
        }
        //Step 3 Create Payload
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        }
        //Step 4 Generate Token//Secret key ต้องตั้งให้ยากๆ
        jwt.sign(payload, process.env.SECRET,
            { expiresIn: '1d' },
            (err, token) => {
                if (err) {
                    return res.status(500).json({ message: 'Server ERROR!' })
                }
                res.json({ payload, token })
            })
        console.log(payload)
    } catch (err) {
        console.log(err)
        res.send(500).json({ message: "server Error" })
    }
}
exports.currentUser = async (req, res) => {
    //code
    try {
        //code
        const user = await prisma.user.findFirst({
            where: { email: req.user.email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            }
        })
        res.json({ user })
    } catch (err) {
        console.log(err)
        res.send(500).json({ message: "server Error" })
    }
}

