
const express = require("express")

const router = express.Router()


// ======================================================
// CONTROLLERS
// ======================================================

const {

    register,
    verifyEmail,
    previewVerification,
    resendVerification,
    login,
    currentUser,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    logout

} = require("../controllers/auth")


// ======================================================
// MIDDLEWARE
// ======================================================

const {

    authCheck,
    adminCheck

} = require("../middlewares/authCheck")

const {

    requireAuth

} = require("../middlewares/authorize")


// ======================================================
// PUBLIC AUTH ROUTES
// ======================================================


// ======================================================
// REGISTER
// POST /api/register
// ======================================================

router.post(
    "/register",
    register
)


// ======================================================
// VERIFY EMAIL PREVIEW
// GET /api/verify-email
//
// ห้ามเปลี่ยน Database
// ======================================================

router.get(
    "/verify-email",
    previewVerification
)


// ======================================================
// VERIFY EMAIL
// POST /api/verify-email
// ======================================================

router.post(
    "/verify-email",
    verifyEmail
)


// ======================================================
// RESEND VERIFICATION
// POST /api/resend-verification
// ======================================================

router.post(
    "/resend-verification",
    resendVerification
)


// ======================================================
// LOGIN
// POST /api/login
// ======================================================

router.post(
    "/login",
    login
)


// ======================================================
// FORGOT PASSWORD
// POST /api/forgot-password
// ======================================================

router.post(
    "/forgot-password",
    forgotPassword
)


// ======================================================
// VERIFY RESET OTP
// POST /api/verify-reset-otp
// ======================================================

router.post(
    "/verify-reset-otp",
    verifyResetOtp
)


// ======================================================
// RESET PASSWORD
// POST /api/reset-password
// ======================================================

router.post(
    "/reset-password",
    resetPassword
)


// ======================================================
// PROTECTED AUTH ROUTES
// ======================================================


// ======================================================
// CURRENT USER
// POST /api/current-user
// ======================================================

router.post(
    "/current-user",

    authCheck,
    requireAuth,

    currentUser
)


// ======================================================
// CURRENT ADMIN
// POST /api/current-admin
// ======================================================

router.post(
    "/current-admin",

    authCheck,
    requireAuth,
    adminCheck,

    currentUser
)


// ======================================================
// LOGOUT
// POST /api/logout
// ======================================================

router.post(
    "/logout",

    authCheck,
    requireAuth,

    logout
)


// ======================================================
// EXPORT
// ======================================================

module.exports = router
