// ======================================================
// LOAD ENVIRONMENT VARIABLES
// ต้องอยู่บนสุด ก่อนโหลด Prisma / Routes
// ======================================================

require("dotenv").config()


// ======================================================
// IMPORTS
// ======================================================

const express = require("express")
const app = express()

const morgan = require("morgan")
const { readdirSync } = require("fs")
const cors = require("cors")
const cookieParser = require("cookie-parser")


// ======================================================
// SECURITY CONFIG
// ======================================================

// Frontend URL
//
// ตอน Development:
// http://localhost:5173
//
// ถ้า Vite ของคุณใช้ port อื่น
// ให้เปลี่ยน FRONTEND_URL ใน .env
//

const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    "http://localhost:5173"


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
    morgan("dev")
)


// ------------------------------------------------------
// JSON BODY
// ------------------------------------------------------

app.use(
    express.json({
        limit: "25mb"
    })
)


// ------------------------------------------------------
// COOKIE PARSER
// ------------------------------------------------------
//
// ใช้สำหรับอ่าน HttpOnly Cookie
//
// req.cookies.session
//

app.use(
    cookieParser()
)


// ------------------------------------------------------
// CORS
// ------------------------------------------------------
//
// สำคัญมากสำหรับ Cookie
//
// credentials: true
// ทำให้ Browser สามารถส่ง Cookie
// ไปยัง Backend ได้
//

app.use(
    cors({

        origin: FRONTEND_URL,

        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]

    })
)


// ======================================================
// HEALTH CHECK
// ======================================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({
            success: true,
            message: "Sale Record API is running"
        })

    }
)


// ======================================================
// ROUTES
// โหลดทุกไฟล์ใน routes อัตโนมัติ
// ======================================================

readdirSync("./routes")
    .filter(
        file => file.endsWith(".js")
    )
    .forEach(file => {

        app.use(
            "/api",
            require("./routes/" + file)
        )

    })


// ======================================================
// 404 HANDLER
// ======================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found"

        })

    }
)


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================
//
// สำคัญสำหรับ Production / Beta
//
// หลักการ:
//
// 1. Log error จริงไว้ที่ Server
// 2. ห้ามส่ง stack trace ให้ Client
// 3. ห้ามส่ง Prisma / Database error ให้ Client
// 4. ห้ามส่ง file path หรือข้อมูลภายในระบบ
// 5. Development ยังเห็น err.message ได้
// 6. Production ใช้ข้อความกลาง
//
// หมายเหตุ:
// Controller ที่ catch error แล้วส่ง response เอง
// จะไม่เข้ามาที่ Handler ตัวนี้
//
// ดังนั้น controller ที่ส่ง err.message / error
// ออกมาเอง ต้องแก้แยกอีกครั้ง
//

app.use(
    (err, req, res, next) => {

        // --------------------------------------------------
        // SERVER LOG
        // --------------------------------------------------

        console.error(
            "GLOBAL SERVER ERROR:",
            err
        )


        // --------------------------------------------------
        // HEADERS ALREADY SENT
        // --------------------------------------------------

        if (res.headersSent) {
            return next(err)
        }


        // --------------------------------------------------
        // STATUS CODE
        // --------------------------------------------------
        //
        // ป้องกัน err.status ที่ผิดรูปแบบ
        // เช่น 0, 200, 999 หรือ string แปลก ๆ
        //

        const status =
            Number.isInteger(err?.status) &&
            err.status >= 400 &&
            err.status < 600
                ? err.status
                : 500


        // --------------------------------------------------
        // ENVIRONMENT
        // --------------------------------------------------

        const isProduction =
            process.env.NODE_ENV === "production"


        // --------------------------------------------------
        // RESPONSE MESSAGE
        // --------------------------------------------------

        let message


        if (isProduction) {

            // ----------------------------------------------
            // PRODUCTION
            // ----------------------------------------------
            //
            // ไม่เปิดเผยรายละเอียดภายใน Server
            //

            if (status === 404) {

                message =
                    "ไม่พบข้อมูลหรือหน้าที่ต้องการ"

            } else {

                message =
                    "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง"

            }

        } else {

            // ----------------------------------------------
            // DEVELOPMENT
            // ----------------------------------------------
            //
            // ช่วยให้ Developer debug ได้
            //

            message =
                err?.message ||
                "Internal Server Error"

        }


        // --------------------------------------------------
        // RESPONSE
        // --------------------------------------------------

        res.status(status).json({

            success: false,

            message

        })

    }
)


// ======================================================
// START SERVER
// ======================================================

const PORT =
    process.env.PORT || 5000


app.listen(
    PORT,
    () => {

        console.log(
            `Server is running on port ${PORT}`
        )

        console.log(
            `Frontend URL: ${FRONTEND_URL}`
        )

    }
)