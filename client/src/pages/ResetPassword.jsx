
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import api from "../api/axios"


export default function ResetPassword() {

    const navigate = useNavigate()
    const location = useLocation()


    const resetToken =
        location.state?.resetToken || ""


    const [newPassword, setNewPassword] =
        useState("")

    const [confirmPassword, setConfirmPassword] =
        useState("")


    const [showPassword, setShowPassword] =
        useState(false)

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false)


    const [loading, setLoading] =
        useState(false)

    const [error, setError] =
        useState("")

    const [success, setSuccess] =
        useState("")


    // ======================================================
    // PASSWORD POLICY
    // ======================================================

    const passwordRules = [

        {
            valid:
                newPassword.length >= 8,
            text:
                "อย่างน้อย 8 ตัวอักษร"
        },

        {
            valid:
                /[A-Z]/.test(newPassword),
            text:
                "มีตัวพิมพ์ใหญ่"
        },

        {
            valid:
                /[a-z]/.test(newPassword),
            text:
                "มีตัวพิมพ์เล็ก"
        },

        {
            valid:
                /[0-9]/.test(newPassword),
            text:
                "มีตัวเลข"
        },

        {
            valid:
                /[^A-Za-z0-9]/.test(newPassword),
            text:
                "มีอักขระพิเศษ"
        }

    ]


    // ======================================================
    // SUBMIT
    // ======================================================

    const handleSubmit = async (e) => {

        e.preventDefault()

        setError("")
        setSuccess("")


        // --------------------------------------------------
        // Reset Token
        // --------------------------------------------------

        if (!resetToken) {

            setError(
                "Reset session ไม่ถูกต้องหรือหมดอายุ กรุณาเริ่มใหม่"
            )

            return

        }


        // --------------------------------------------------
        // Password
        // --------------------------------------------------

        if (!newPassword) {

            setError(
                "กรุณากรอกรหัสผ่านใหม่"
            )

            return

        }


        if (newPassword !== confirmPassword) {

            setError(
                "รหัสผ่านไม่ตรงกัน"
            )

            return

        }


        const invalidRule =
            passwordRules.find(
                rule => !rule.valid
            )


        if (invalidRule) {

            setError(
                invalidRule.text
            )

            return

        }


        try {

            setLoading(true)


            const response =
                await api.post(
                    "/reset-password",
                    {
                        resetToken,
                        newPassword,
                        confirmPassword
                    }
                )


            setSuccess(
                response.data?.message ||
                "เปลี่ยนรหัสผ่านสำเร็จ"
            )


            setNewPassword("")
            setConfirmPassword("")


        } catch (err) {

            console.error(
                "RESET PASSWORD ERROR:",
                err
            )


            setError(
                err.response?.data?.message ||
                "ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง"
            )

        } finally {

            setLoading(false)

        }

    }


    // ======================================================
    // UI
    // ======================================================

    return (

        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                background: "#f8f5ff"
            }}
        >

            <div
                style={{
                    width: "100%",
                    maxWidth: "500px",
                    background: "#ffffff",
                    padding: "40px",
                    borderRadius: "20px",
                    boxShadow:
                        "0 10px 30px rgba(0,0,0,0.08)"
                }}
            >

                {!success ? (

                    <form
                        onSubmit={handleSubmit}
                    >

                        <div
                            style={{
                                textAlign: "center"
                            }}
                        >

                            <div
                                style={{
                                    fontSize: "42px"
                                }}
                            >
                                🔑
                            </div>

                            <h1>
                                Reset Password
                            </h1>

                            <p>
                                ตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ
                            </p>

                        </div>


                        {/* ==================================================
                            NEW PASSWORD
                        ================================================== */}

                        <div
                            style={{
                                position: "relative",
                                marginTop: "25px"
                            }}
                        >

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="New Password"
                                autoComplete="new-password"
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "14px 50px 14px 14px",
                                    borderRadius: "10px",
                                    border: "1px solid #ddd",
                                    fontSize: "16px"
                                }}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        prev => !prev
                                    )
                                }
                                disabled={loading}
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform:
                                        "translateY(-50%)",
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer"
                                }}
                            >
                                {showPassword
                                    ? "◉"
                                    : "◌"
                                }
                            </button>

                        </div>


                        {/* ==================================================
                            CONFIRM PASSWORD
                        ================================================== */}

                        <div
                            style={{
                                position: "relative",
                                marginTop: "15px"
                            }}
                        >

                            <input
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Confirm New Password"
                                autoComplete="new-password"
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "14px 50px 14px 14px",
                                    borderRadius: "10px",
                                    border: "1px solid #ddd",
                                    fontSize: "16px"
                                }}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        prev => !prev
                                    )
                                }
                                disabled={loading}
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform:
                                        "translateY(-50%)",
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer"
                                }}
                            >
                                {showConfirmPassword
                                    ? "◉"
                                    : "◌"
                                }
                            </button>

                        </div>


                        {/* ==================================================
                            PASSWORD RULES
                        ================================================== */}

                        <div
                            style={{
                                marginTop: "20px",
                                fontSize: "14px"
                            }}
                        >

                            {passwordRules.map(
                                (rule, index) => (

                                    <div
                                        key={index}
                                        style={{
                                            marginTop: "5px",
                                            color:
                                                rule.valid
                                                    ? "#16a34a"
                                                    : "#777"
                                        }}
                                    >

                                        {rule.valid
                                            ? "✓"
                                            : "○"
                                        }

                                        {" "}

                                        {rule.text}

                                    </div>

                                )
                            )}

                        </div>


                        {/* ==================================================
                            ERROR
                        ================================================== */}

                        {error && (

                            <div
                                style={{
                                    marginTop: "15px",
                                    color: "#dc2626"
                                }}
                            >
                                {error}
                            </div>

                        )}


                        {/* ==================================================
                            SUBMIT
                        ================================================== */}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                marginTop: "20px",
                                padding: "14px",
                                border: "none",
                                borderRadius: "10px",
                                fontSize: "16px",
                                cursor: "pointer"
                            }}
                        >

                            {loading
                                ? "กำลังเปลี่ยนรหัสผ่าน..."
                                : "เปลี่ยนรหัสผ่าน"
                            }

                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                navigate("/login")
                            }
                            disabled={loading}
                            style={{
                                width: "100%",
                                marginTop: "10px",
                                padding: "12px",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer"
                            }}
                        >
                            กลับหน้า Login
                        </button>

                    </form>

                ) : (

                    /* ==================================================
                       SUCCESS
                    ================================================== */

                    <div
                        style={{
                            textAlign: "center"
                        }}
                    >

                        <div
                            style={{
                                fontSize: "50px"
                            }}
                        >
                            ✅
                        </div>

                        <h1>
                            เปลี่ยนรหัสผ่านสำเร็จ
                        </h1>

                        <p>
                            {success}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/login")
                            }
                            style={{
                                width: "100%",
                                marginTop: "20px",
                                padding: "14px",
                                border: "none",
                                borderRadius: "10px",
                                fontSize: "16px",
                                cursor: "pointer"
                            }}
                        >
                            ไปหน้า Login
                        </button>

                    </div>

                )}

            </div>

        </div>

    )

}
