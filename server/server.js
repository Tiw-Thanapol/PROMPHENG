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
const path = require("path")
const cors = require("cors")
const cookieParser = require("cookie-parser")


// ======================================================
// SECURITY CONFIG
// ======================================================

const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    "http://localhost:5173"


// ======================================================
// TRUST PROXY
// ======================================================

if (
    process.env.TRUST_PROXY === "true"
) {

    app.set(
        "trust proxy",
        1
    )

}


// ======================================================
// MIDDLEWARE
// ======================================================


// ------------------------------------------------------
// MORGAN
// ------------------------------------------------------

app.use(
    morgan("dev")
)


// ------------------------------------------------------
// JSON BODY
// ------------------------------------------------------

app.use(
    express.json({

        limit:
            "25mb"

    })
)


// ------------------------------------------------------
// COOKIE PARSER
// ------------------------------------------------------
//
// ใช้สำหรับ:
//
// req.cookies.session
//
// ต้องอยู่ก่อน Routes
//

app.use(
    cookieParser()
)


// ------------------------------------------------------
// CORS
// ------------------------------------------------------
//
// Authentication ใช้ HttpOnly Cookie
//
// ดังนั้นต้อง:
//
// credentials: true
//
// ------------------------------------------------------

app.use(
    cors({

        origin:
            FRONTEND_URL,

        credentials:
            true,

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
            "Authorization",
            "X-Requested-With"

        ]

    })
)


// ======================================================
// HEALTH CHECK
// ======================================================

app.get(

    "/api/health",

    (req, res) => {

        return res.status(200).json({

            success:
                true,

            message:
                "PROMPHENG API is running"

        })

    }

)


// ======================================================
// ROUTES
// ======================================================
//
// โหลดทุกไฟล์:
//
// server/routes/*.js
//
// แล้ว Mount:
//
// /api/...
//
// ใช้ __dirname เพื่อไม่ขึ้นกับ
// Current Working Directory
//

const routesPath =
    path.join(
        __dirname,
        "routes"
    )


readdirSync(routesPath)

    .filter(

        file =>
            file.endsWith(".js")

    )

    .forEach(

        file => {

            try {

                const route =
                    require(
                        path.join(
                            routesPath,
                            file
                        )
                    )


                app.use(
                    "/api",
                    route
                )


                console.log(
                    `Route loaded: ${file}`
                )


            } catch (error) {

                console.error(

                    `Failed to load route: ${file}`,

                    error

                )


                throw error

            }

        }

    )


// ======================================================
// 404 HANDLER
// ======================================================

app.use(

    (req, res) => {

        return res.status(404).json({

            success:
                false,

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


        if (
            res.headersSent
        ) {

            return next(err)

        }


        return res.status(

            err.status || 500

        ).json({

            success:
                false,

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
            "========================================"
        )

        console.log(
            "PROMPHENG SERVER"
        )

        console.log(
            "========================================"
        )

        console.log(
            `Server is running on port ${PORT}`
        )

        console.log(
            `Frontend URL: ${FRONTEND_URL}`
        )

        console.log(
            `Environment: ${
                process.env.NODE_ENV ||
                "development"
            }`
        )

        console.log(
            "Authentication: Database Session"
        )

        console.log(
            "Session Cookie: HTTPOnly"
        )

        console.log(
            "========================================"
        )

    }
)