const sessionService = require("../services/sessionService")


// ======================================================
// SESSION COOKIE
// ======================================================

const SESSION_COOKIE_NAME =
    "session"


// ======================================================
// CLEAR SESSION COOKIE
// ======================================================

function clearSessionCookie(res) {

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

        path:
            "/"

    }


    if (
        process.env.SESSION_COOKIE_DOMAIN
    ) {

        options.domain =
            process.env.SESSION_COOKIE_DOMAIN

    }


    res.clearCookie(

        SESSION_COOKIE_NAME,

        options

    )

}


// ======================================================
// AUTH CHECK
// Server-side Session Authentication
//
// Flow:
//
// HTTP Request
//      ↓
// HttpOnly Cookie
//      ↓
// sessionService.getSession()
//      ↓
// Database Session
//      ↓
// User
//      ↓
// req.user
// req.currentUser
// req.session
//
// ======================================================

exports.authCheck = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // GET SESSION TOKEN
        // ==================================================

        const token =
            req.cookies?.[
                SESSION_COOKIE_NAME
            ]


        if (
            !token ||
            typeof token !== "string"
        ) {

            return res.status(401).json({

                message:
                    "Unauthorized"

            })

        }


        // ==================================================
        // VERIFY SESSION
        // ==================================================

        const session =
            await sessionService.getSession(
                token
            )


        if (!session) {

            // ----------------------------------------------
            // Session ไม่มีอยู่ / หมดอายุ / invalid
            // ----------------------------------------------

            clearSessionCookie(res)


            return res.status(401).json({

                message:
                    "Session expired or invalid"

            })

        }


        // ==================================================
        // GET USER
        // ==================================================

        const user =
            session.user


        if (!user) {

            clearSessionCookie(res)


            return res.status(401).json({

                message:
                    "User not found"

            })

        }


        // ==================================================
        // ACCOUNT STATUS
        // ==================================================

        if (
            !user.enabled
        ) {

            // ----------------------------------------------
            // Account ถูก disabled
            //
            // ลบ Session ปัจจุบันด้วย
            // เพื่อไม่ให้ Session เดิมกลับมาใช้งานได้
            // ----------------------------------------------

            try {

                await sessionService.deleteSession(
                    token
                )

            } catch (sessionError) {

                console.error(
                    "DELETE DISABLED USER SESSION ERROR:",
                    sessionError
                )

            }


            clearSessionCookie(res)


            return res.status(403).json({

                message:
                    "Account is disabled"

            })

        }


        // ==================================================
        // ATTACH USER
        // ==================================================

        req.user =
            user


        // --------------------------------------------------
        // Backward compatibility
        // Route / Controller เก่าที่ใช้ req.currentUser
        // ยังสามารถทำงานได้
        // --------------------------------------------------

        req.currentUser =
            user


        // ==================================================
        // ATTACH SESSION
        // ==================================================

        req.session =
            session


        // ==================================================
        // CONTINUE
        // ==================================================

        return next()


    } catch (err) {

        console.error(
            "AUTH CHECK ERROR:",
            err
        )


        return res.status(500).json({

            message:
                "Authentication server error"

        })

    }

}


// ======================================================
// ADMIN CHECK
// Legacy middleware
//
// เก็บไว้เพื่อไม่ให้ Route เดิมพัง
// ======================================================

exports.adminCheck = async (
    req,
    res,
    next
) => {

    try {

        // ==================================================
        // AUTH REQUIRED
        // ==================================================

        if (
            !req.currentUser
        ) {

            return res.status(401).json({

                message:
                    "Unauthorized"

            })

        }


        // ==================================================
        // ADMIN ROLE
        // ==================================================

        if (
            req.currentUser.role !==
            "ADMIN"
        ) {

            return res.status(403).json({

                message:
                    "Access denied: Admin Only"

            })

        }


        return next()


    } catch (err) {

        console.error(
            "ADMIN CHECK ERROR:",
            err
        )


        return res.status(500).json({

            message:
                "Admin access denied!"

        })

    }

}


// ======================================================
// ADMIN ONLY
// New Routes
// ======================================================

exports.adminOnly = (
    req,
    res,
    next
) => {

    // ==================================================
    // AUTH REQUIRED
    // ==================================================

    if (
        !req.currentUser
    ) {

        return res.status(401).json({

            message:
                "Unauthorized"

        })

    }


    // ==================================================
    // ADMIN ROLE
    // ==================================================

    if (
        req.currentUser.role !==
        "ADMIN"
    ) {

        return res.status(403).json({

            message:
                "Admin access required"

        })

    }


    return next()

}