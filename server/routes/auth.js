const express = require("express")

const router = express.Router()


// ======================================================
// CONTROLLERS
// ======================================================

const {

    register,

    previewVerification,

    verifyEmail,

    resendVerification,

    login,

    logout,

    logoutAll,

    currentUser,

    forgotPassword,

    verifyResetOtp,

    resetPassword

} = require("../controllers/auth")


// ======================================================
// MIDDLEWARE
// ======================================================

const {

    authCheck,

    adminCheck

} = require("../middlewares/authCheck")


// ======================================================
// AUTH ROUTES
// ======================================================


// ======================================================
// REGISTER
// ======================================================
//
// POST /api/register
//
// สร้างบัญชีใหม่
// enabled = false
// ส่ง Verification Email
//
// ======================================================

router.post(

    "/register",

    register

)


// ======================================================
// EMAIL VERIFICATION
// ======================================================


// ------------------------------------------------------
// PREVIEW VERIFICATION
// ------------------------------------------------------
//
// GET /api/verify-email?token=xxxx
//
// ตรวจสอบ Token อย่างเดียว
// ไม่เปลี่ยน Database
//
// ======================================================

router.get(

    "/verify-email",

    previewVerification

)


// ------------------------------------------------------
// VERIFY EMAIL
// ------------------------------------------------------
//
// POST /api/verify-email
//
// ยืนยัน Email จริง
//
// enabled = true
// token.used = true
//
// ======================================================

router.post(

    "/verify-email",

    verifyEmail

)


// ------------------------------------------------------
// RESEND VERIFICATION
// ------------------------------------------------------
//
// POST /api/resend-verification
//
// Body:
//
// {
//     "email": "user@example.com"
// }
//
// ======================================================

router.post(

    "/resend-verification",

    resendVerification

)


// ======================================================
// LOGIN
// ======================================================
//
// POST /api/login
//
// Email + Password
//
// Login สำเร็จ:
//
// DB Session
//      ↓
// HttpOnly Cookie
//
// ไม่มี JWT Login
//
// ======================================================

router.post(

    "/login",

    login

)


// ======================================================
// LOGOUT
// ======================================================
//
// POST /api/logout
//
// อ่าน Session Cookie
//      ↓
// Delete DB Session
//      ↓
// Clear Cookie
//
// ไม่จำเป็นต้อง authCheck
//
// เพราะ Session อาจหมดอายุอยู่แล้ว
//
// ======================================================

router.post(

    "/logout",

    logout

)


// ======================================================
// CURRENT USER
// ======================================================
//
// GET /api/current-user
//
// ใช้ตรวจสอบ User ที่ Login อยู่
//
// Session Cookie
//      ↓
// authCheck
//      ↓
// currentUser
//
// ======================================================

router.get(

    "/current-user",

    authCheck,

    currentUser

)


// ======================================================
// CURRENT ADMIN
// ======================================================
//
// GET /api/current-admin
//
// ต้อง Login
// และต้องเป็น ADMIN
//
// ======================================================

router.get(

    "/current-admin",

    authCheck,

    adminCheck,

    currentUser

)


// ======================================================
// LOGOUT ALL DEVICES
// ======================================================
//
// POST /api/logout-all
//
// ต้อง Login
//
// ลบ Session ของ User ทุกอุปกรณ์
//
// ======================================================

router.post(

    "/logout-all",

    authCheck,

    logoutAll

)


// ======================================================
// FORGOT PASSWORD
// ======================================================
//
// POST /api/forgot-password
//
// Body:
//
// {
//     "identifier": "email@example.com"
// }
//
// หรือ:
//
// {
//     "identifier": "0812345678"
// }
//
// ส่ง OTP ไปยัง Email
//
// ======================================================

router.post(

    "/forgot-password",

    forgotPassword

)


// ======================================================
// VERIFY RESET OTP
// ======================================================
//
// POST /api/verify-reset-otp
//
// ตรวจ OTP
//
// สำเร็จ:
// ได้ resetToken
//
// ======================================================

router.post(

    "/verify-reset-otp",

    verifyResetOtp

)


// ======================================================
// RESET PASSWORD
// ======================================================
//
// POST /api/reset-password
//
// Body:
//
// {
//     "resetToken": "...",
//     "newPassword": "...",
//     "confirmPassword": "..."
// }
//
// สำเร็จ:
//
// - เปลี่ยน Password
// - Revoke/Delete Login Sessions
// - Clear Session Cookie
//
// ======================================================

router.post(

    "/reset-password",

    resetPassword

)


// ======================================================
// EXPORT
// ======================================================

module.exports = router