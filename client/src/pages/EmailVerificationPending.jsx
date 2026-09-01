import { Link } from "react-router-dom"
import { MailCheck } from "lucide-react"
import "../styles/EmailVerificationPending.css"


export default function EmailVerificationPending() {

    return (

        <div className="email-pending-page">

            <div className="email-pending-card">

                {/* ==================================================
                    ICON
                ================================================== */}

                <div className="email-pending-icon">

                    <MailCheck size={58} strokeWidth={1.8} />

                </div>


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="email-pending-header">

                    <h1>
                        สมัครสมาชิกสำเร็จ 🎉
                    </h1>

                    <p className="email-pending-main-message">
                        กรุณาตรวจสอบ Email เพื่อยืนยันบัญชีของคุณ
                    </p>

                    <p className="email-pending-sub-message">
                        ระบบได้ส่งลิงก์ยืนยันไปยัง Email ของคุณแล้ว
                        กรุณาเปิด Email และกดลิงก์เพื่อยืนยันบัญชี
                    </p>

                </div>


                {/* ==================================================
                    NOTICE
                ================================================== */}

                <div className="email-pending-notice">

                    <span className="email-pending-notice-icon">
                        ✉
                    </span>

                    <div>

                        <strong>
                            Email verification required
                        </strong>

                        <p>
                            หากไม่พบ Email ในกล่องข้อความ
                            กรุณาตรวจสอบโฟลเดอร์ Spam หรือ Junk
                        </p>

                    </div>

                </div>


                {/* ==================================================
                    BACK TO LOGIN
                ================================================== */}

                <Link
                    to="/login"
                    className="email-pending-login-button"
                >
                    กลับไปหน้า Login
                </Link>


                {/* ==================================================
                    FOOTER
                ================================================== */}

                <p className="email-pending-footer">
                    หลังจากยืนยัน Email แล้ว
                    คุณสามารถเข้าสู่ระบบได้ตามปกติ
                </p>

            </div>

        </div>

    )

}
