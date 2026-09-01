
// ======================================================
// AUTHORIZATION MIDDLEWARE
// ======================================================
//
// หน้าที่:
// - ตรวจสอบว่า User Login แล้วหรือไม่
// - ตรวจสอบ Role
// - ใช้ป้องกัน API ที่ต้องการสิทธิ์เฉพาะ
//
// Authentication  = "คุณคือใคร?"
// Authorization   = "คุณมีสิทธิ์ทำอะไร?"
// ======================================================


// ======================================================
// REQUIRE AUTHENTICATED USER
// ======================================================

const requireAuth = (req, res, next) => {

    if (!req.currentUser) {

        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })

    }

    next()

}


// ======================================================
// REQUIRE ROLE
// ======================================================
//
// ตัวอย่าง:
//
// router.get(
//     "/something",
//     authCheck,
//     requireRole("ADMIN"),
//     controller
// )
//
// หรือ:
//
// requireRole("ADMIN", "OWNER")
//
// ======================================================

const requireRole = (...allowedRoles) => {

    return (req, res, next) => {

        // ----------------------------------------------
        // ต้อง Login ก่อน
        // ----------------------------------------------

        if (!req.currentUser) {

            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })

        }


        // ----------------------------------------------
        // ตรวจสอบ Role
        // ----------------------------------------------

        const userRole =
            String(req.currentUser.role || "")
                .trim()
                .toUpperCase()


        const roles =
            allowedRoles.map(role =>
                String(role)
                    .trim()
                    .toUpperCase()
            )


        if (!roles.includes(userRole)) {

            return res.status(403).json({
                success: false,
                message: "Access denied"
            })

        }


        next()

    }

}


// ======================================================
// ADMIN ONLY
// ======================================================

const requireAdmin =
    requireRole("ADMIN")


// ======================================================
// OWNER ONLY
// ======================================================

const requireOwner =
    requireRole("OWNER")


// ======================================================
// ADMIN OR OWNER
// ======================================================
//
// สำหรับระบบที่ User ทั้ง ADMIN และ OWNER
// สามารถใช้งานได้
//
// ======================================================

const requireAdminOrOwner =
    requireRole(
        "ADMIN",
        "OWNER"
    )


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    requireAuth,

    requireRole,

    requireAdmin,

    requireOwner,

    requireAdminOrOwner

}
