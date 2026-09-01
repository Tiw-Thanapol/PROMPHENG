import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../styles/RegistrationSuccess.css"


export default function RegistrationSuccess() {

    const navigate = useNavigate()


    const [registration, setRegistration] =
        useState(null)


    // ======================================================
    // LOAD REGISTRATION DATA
    // ======================================================

    useEffect(() => {

        const stored =
            sessionStorage.getItem(
                "registrationSuccess"
            )


        // --------------------------------------------------
        // ถ้าเข้าหน้านี้โดยไม่ได้สมัครสมาชิก
        // ไม่ควรปล่อยให้ค้างอยู่หน้านี้
        // --------------------------------------------------

        if (!stored) {

            navigate(
                "/register",
                {
                    replace: true
                }
            )

            return

        }


        try {

            const data =
                JSON.parse(stored)


            setRegistration(data)

        } catch (error) {

            console.error(
                "REGISTRATION SUCCESS DATA ERROR:",
                error
            )


            sessionStorage.removeItem(
                "registrationSuccess"
            )


            navigate(
                "/register",
                {
                    replace: true
                }
            )

        }

    }, [navigate])


    // ======================================================
    // CLEAR TEMP DATA
    //
    // เมื่อผู้ใช้กด Login แล้ว
    // registrationSuccess ไม่จำเป็นต้องเก็บต่อ
    // ======================================================

    const handleLogin = () => {

        sessionStorage.removeItem(
            "registrationSuccess"
        )


        navigate(
            "/login"
        )

    }


    // ======================================================
    // LOADING
    // ======================================================

    if (!registration) {

        return (

            <div className="registration-success-page">

                <div className="registration-success-card">

                    <div className="registration-success-spinner" />

                    <p>
                        กำลังโหลด...
                    </p>

                </div>

            </div>

        )

    }


    // ======================================================
    // RENDER
    // ======================================================

    return (

        <div className="registration-success-page">

            <div className="registration-success-card">


                {/* ==================================================
                    SUCCESS ICON
                ================================================== */}

                <div className="registration-success-icon">

                    ✓

                </div>


                {/* ==================================================
                    TITLE
                ================================================== */}

                <h1>
                    สมัครสมาชิกสำเร็จ
                </h1>


                <h2>
                    กรุณาตรวจสอบ Email ของคุณ
                </h2>


                {/* ==================================================
                    DESCRIPTION
                ================================================== */}

                <p className="registration-success-description">

                    ระบบได้สร้างบัญชีของคุณเรียบร้อยแล้ว

                    <br />

                    เราได้ส่งลิงก์ยืนยันการสมัครสมาชิก
                    ไปยัง Email ของคุณแล้ว

                </p>


                {/* ==================================================
                    EMAIL
                ================================================== */}

                {registration.email && (

                    <div className="registration-success-email">

                        <span>
                            📧
                        </span>

                        <strong>
                            {registration.email}
                        </strong>

                    </div>

                )}


                {/* ==================================================
                    IMPORTANT NOTICE
                ================================================== */}

                <div className="registration-success-notice">

                    <div className="registration-success-notice-icon">
                        ✉
                    </div>


                    <div>

                        <strong>
                            ขั้นตอนถัดไป
                        </strong>

                        <p>

                            เปิด Email ของคุณ
                            แล้วกดลิงก์ยืนยันบัญชี
                            เพื่อเปิดใช้งานบัญชี

                        </p>

                    </div>

                </div>


                {/* ==================================================
                    CHECK EMAIL
                ================================================== */}

                <div className="registration-success-tips">

                    <p>
                        หากไม่พบ Email ใน Inbox
                    </p>

                    <ul>

                        <li>
                            ตรวจสอบโฟลเดอร์ Spam / Junk
                        </li>

                        <li>
                            ตรวจสอบว่า Email ที่กรอกถูกต้อง
                        </li>

                        <li>
                            รอสักครู่แล้วตรวจสอบอีกครั้ง
                        </li>

                    </ul>

                </div>


                {/* ==================================================
                    LOGIN
                ================================================== */}

                <button
                    type="button"
                    className="registration-success-button"
                    onClick={handleLogin}
                >

                    กลับไปหน้า Login

                </button>


                {/* ==================================================
                    REGISTER AGAIN
                ================================================== */}

                <div className="registration-success-footer">

                    <span>
                        ใช้ Email อื่น?
                    </span>


                    <Link
                        to="/register"
                        onClick={() =>
                            sessionStorage.removeItem(
                                "registrationSuccess"
                            )
                        }
                    >
                        สมัครสมาชิกใหม่
                    </Link>

                </div>


            </div>

        </div>

    )

}
