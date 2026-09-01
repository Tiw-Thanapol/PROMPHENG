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

app.use(
    (err, req, res, next) => {

        console.error(
            "GLOBAL SERVER ERROR:",
            err
        )


        if (res.headersSent) {
            return next(err)
        }


        res.status(
            err.status || 500
        ).json({

            success: false,

            message:
                process.env.NODE_ENV === "production"
                    ? "Internal Server Error"
                    : err.message

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
