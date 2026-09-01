import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Mail, ArrowLeft, RefreshCw } from "lucide-react"

import "../styles/RegistrationSuccess.css"
import api from "../api/axios"


/* ==========================================================
   REGISTRATION PENDING

   Flow:

   Register
       ↓
   API /register success
       ↓
   /registration-pending
       ↓
   User checks Email
       ↓
   Click verification link
       ↓
   /verify-email?token=...
       ↓
   Login
========================================================== */


export default function RegistrationPending() {

    const location =
        useLocation()

    const navigate =
        useNavigate()


    // ======================================================
    // EMAIL
    //
    // Register.jsx จะส่ง email มาทาง navigate state
    //
    // ถ้าไม่มี state เช่น user refresh หน้า
    // จะไม่ทำให้หน้า crash
    // ======================================================

    const email =
        location.state?.email || ""


    // ======================================================
    // RESEND STATE
    // ======================================================

    const [resending, setResending] =
        useState(false)

    const [resendMessage, setResendMessage] =
        useState("")

    const [resendError, setResendError] =
        useState("")


    // ======================================================
    // RESEND EMAIL
    //
    // รองรับ backend ที่มี endpoint resend-verification
    //
    // ถ้า backend ของคุณใช้ endpoint ชื่ออื่น
    // เปลี่ยนเฉพาะ api.post ด้านล่าง
    // ======================================================

    const handleResendEmail =
        async () => {

            if (
                !email ||
                resending
            ) {

                return

            }


            setResending(true)

            setResendMessage("")

            setResendError("")


            try {

                const response =
                    await api.post(
                        "/resend-verification",
                        {
                            email
                        }
                    )


                setResendMessage(

                    response.data?.message ||

                    "ส่ง Email ยืนยันใหม่เรียบร้อยแล้ว"

                )


            } catch (err) {

                console.error(
                    "RESEND VERIFICATION ERROR:",
                    err
                )


                setResendError(

                    err.response?.data?.message ||

                    "ไม่สามารถส่ง Email ใหม่ได้ กรุณาลองอีกครั้ง"

                )

            } finally {

                setResending(false)

            }

        }


    // ======================================================
    // GO LOGIN
    // ======================================================

    const handleGoLogin =
        () => {

            navigate("/login")

        }


    // ======================================================
    // RENDER
    // ======================================================

    return (

        <div className="registration-success-page">


            {/* ==================================================
                DECORATIVE STARS
            ================================================== */}

            <div
                className="
                    registration-success-star
                    star-1
                "
            >
                ✦
            </div>


            <div
                className="
                    registration-success-star
                    star-2
                "
            >
                ✦
            </div>


            <div
                className="
                    registration-success-star
                    star-3
                "
            >
                ✦
            </div>


            {/* ==================================================
                MAIN CARD
            ================================================== */}

            <div className="registration-success-card">


                {/* ==================================================
                    SUCCESS ICON
                ================================================== */}

                <div
                    className="registration-success-icon"
                    aria-hidden="true"
                >
                    <Mail size={42} />
                </div>


                {/* ==================================================
                    TITLE
                ================================================== */}

                <h1 className="registration-success-title">
                    สมัครสมาชิกสำเร็จ 🎉
                </h1>


                {/* ==================================================
                    DESCRIPTION
                ================================================== */}

                <p className="registration-success-subtitle">

                    กรุณาตรวจสอบ Email ของคุณ
                    เพื่อยืนยันบัญชีและเปิดใช้งานระบบ

                </p>


                {/* ==================================================
                    EMAIL
                ================================================== */}

                {email && (

                    <div
                        className="
                            registration-success-email-box
                        "
                    >

                        <div
                            className="
                                registration-success-email-icon
                            "
                            aria-hidden="true"
                        >
                            ✉
                        </div>


                        <div
                            className="
                                registration-success-email-content
                            "
                        >

                            <span
                                className="
                                    registration-success-email-label
                                "
                            >
                                เราส่ง Email ไปที่
                            </span>


                            <span
                                className="
                                    registration-success-email
                                "
                                title={email}
                            >
                                {email}
                            </span>

                        </div>

                    </div>

                )}


                {/* ==================================================
                    NOTICE
                ================================================== */}

                <p className="registration-success-notice">

                    หากไม่พบ Email ในกล่อง Inbox
                    กรุณาตรวจสอบโฟลเดอร์
                    <strong> Spam / Junk</strong>
                    ด้วย

                </p>


                {/* ==================================================
                    RESEND MESSAGE
                ================================================== */}

                {resendMessage && (

                    <div
                        className="
                            registration-success-notice
                        "
                    >

                        <strong>
                            ✓ {resendMessage}
                        </strong>

                    </div>

                )}


                {resendError && (

                    <div
                        className="
                            registration-success-notice
                        "
                    >

                        <strong>
                            {resendError}
                        </strong>

                    </div>

                )}


                {/* ==================================================
                    RESEND EMAIL
                ================================================== */}

                {email && (

                    <button
                        type="button"
                        className="
                            registration-success-resend
                        "
                        onClick={
                            handleResendEmail
                        }
                        disabled={
                            resending
                        }
                    >

                        {resending ? (

                            <>

                                <RefreshCw
                                    size={15}
                                    style={{
                                        marginRight: 6,
                                        verticalAlign: "middle"
                                    }}
                                    className="registration-resend-spin"
                                />

                                กำลังส่ง Email...

                            </>

                        ) : (

                            <>

                                <RefreshCw
                                    size={15}
                                    style={{
                                        marginRight: 6,
                                        verticalAlign: "middle"
                                    }}
                                />

                                ส่ง Email ยืนยันอีกครั้ง

                            </>

                        )}

                    </button>

                )}


                {/* ==================================================
                    LOGIN BUTTON
                ================================================== */}

                <button
                    type="button"
                    className="
                        registration-success-button
                    "
                    onClick={
                        handleGoLogin
                    }
                >

                    <ArrowLeft
                        size={19}
                        style={{
                            marginRight: 8
                        }}
                    />

                    กลับไปหน้า Login

                </button>


                {/* ==================================================
                    LOGIN LINK
                ================================================== */}

                <div
                    className="
                        registration-success-login
                    "
                >

                    หากยืนยัน Email แล้ว

                    <Link to="/login">
                        เข้าสู่ระบบ
                    </Link>

                </div>


            </div>

        </div>

    )

}
