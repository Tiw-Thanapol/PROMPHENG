import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
    User,
    Lock,
    Eye,
    EyeOff,
    Rocket
} from "lucide-react"
import axios from "axios"

import "../styles/Login.css"


// ==========================================================
// DECORATIVE SVG
// ==========================================================

function Moon() {

    return (

        <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >

            <circle
                cx="60"
                cy="60"
                r="52"
                fill="#FFE8B8"
            />

            <path
                d="M60 8a52 52 0 1 0 52 52c0-2-.1-4-.3-6a40 40 0 1 1-45.7-45.7c-2-.2-4-.3-6-.3Z"
                fill="#FFDA8C"
            />

            <circle
                cx="42"
                cy="46"
                r="7"
                fill="#FBC978"
                opacity=".7"
            />

            <circle
                cx="72"
                cy="34"
                r="4.5"
                fill="#FBC978"
                opacity=".6"
            />

            <circle
                cx="80"
                cy="66"
                r="8"
                fill="#FBC978"
                opacity=".6"
            />

            <circle
                cx="46"
                cy="80"
                r="5"
                fill="#FBC978"
                opacity=".55"
            />

            <path
                d="M50 58c1.5-2 5.5-2 7 0"
                stroke="#B9863F"
                strokeWidth="2.4"
                strokeLinecap="round"
            />

            <path
                d="M64 58c1.5-2 5.5-2 7 0"
                stroke="#B9863F"
                strokeWidth="2.4"
                strokeLinecap="round"
            />

            <path
                d="M55 70c2.5 2.5 7.5 2.5 10 0"
                stroke="#B9863F"
                strokeWidth="2.4"
                strokeLinecap="round"
            />

            <ellipse
                cx="46"
                cy="66"
                rx="4"
                ry="2.6"
                fill="#FFB4B4"
                opacity=".6"
            />

            <ellipse
                cx="74"
                cy="66"
                rx="4"
                ry="2.6"
                fill="#FFB4B4"
                opacity=".6"
            />

        </svg>

    )

}


function Spaceship() {

    return (

        <svg
            viewBox="0 0 140 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >

            <path
                d="M18 78c14 6 24 6 34 2"
                stroke="#FFD37A"
                strokeWidth="5"
                strokeLinecap="round"
                opacity=".55"
            />

            <path
                d="M14 64c10 5 18 6 26 3"
                stroke="#FF9ECB"
                strokeWidth="4"
                strokeLinecap="round"
                opacity=".45"
            />

            <ellipse
                cx="80"
                cy="55"
                rx="34"
                ry="26"
                fill="#FFF7EC"
            />

            <path
                d="M52 60c4 18 20 30 28 30s24-12 28-30"
                fill="#B587FF"
                opacity=".18"
            />

            <circle
                cx="82"
                cy="50"
                r="13"
                fill="#9AD8FF"
            />

            <circle
                cx="82"
                cy="50"
                r="13"
                stroke="#6FB8E8"
                strokeWidth="3"
            />

            <circle
                cx="77"
                cy="45"
                r="3.2"
                fill="#fff"
                opacity=".8"
            />

            <path
                d="M52 62c-10 2-16 10-16 18 8 0 16-4 20-12Z"
                fill="#FF9ECB"
            />

            <path
                d="M108 62c10 2 16 10 16 18-8 0-16-4-20-12Z"
                fill="#FF9ECB"
            />

            <path
                d="M70 84c2 8 6 14 10 16 4-2 8-8 10-16-6 4-14 4-20 0Z"
                fill="#FFD37A"
            />

        </svg>

    )

}


function CatAstronaut() {

    return (

        <svg
            viewBox="0 0 160 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >

            <circle
                cx="80"
                cy="82"
                r="58"
                fill="#EAF6FF"
                opacity=".9"
            />

            <circle
                cx="80"
                cy="82"
                r="58"
                stroke="#DCEBF7"
                strokeWidth="6"
            />

            <circle
                cx="60"
                cy="62"
                r="10"
                fill="#fff"
                opacity=".6"
            />

            <path
                d="M42 46 52 18l16 26Z"
                fill="#F5A468"
            />

            <path
                d="M118 46 108 18 92 44Z"
                fill="#F5A468"
            />

            <path
                d="M48 42 54 26l8 14Z"
                fill="#FFD3B0"
            />

            <path
                d="M112 42 106 26l-8 14Z"
                fill="#FFD3B0"
            />

            <circle
                cx="80"
                cy="90"
                r="46"
                fill="#F8B57E"
            />

            <path
                d="M34 88a46 46 0 0 0 92 4c-10 6-24 9-46 9s-36-3-46-9Z"
                fill="#FCCB9C"
            />

            <path
                d="M50 56c4 4 4 10 0 14"
                stroke="#E28F52"
                strokeWidth="4"
                strokeLinecap="round"
            />

            <path
                d="M110 56c-4 4-4 10 0 14"
                stroke="#E28F52"
                strokeWidth="4"
                strokeLinecap="round"
            />

            <ellipse
                cx="56"
                cy="100"
                rx="9"
                ry="6"
                fill="#FF9EAE"
                opacity=".55"
            />

            <ellipse
                cx="104"
                cy="100"
                rx="9"
                ry="6"
                fill="#FF9EAE"
                opacity=".55"
            />

            <ellipse
                cx="64"
                cy="86"
                rx="6"
                ry="7.5"
                fill="#4B3F6B"
            />

            <ellipse
                cx="96"
                cy="86"
                rx="6"
                ry="7.5"
                fill="#4B3F6B"
            />

            <circle
                cx="66.5"
                cy="83"
                r="2"
                fill="#fff"
            />

            <circle
                cx="98.5"
                cy="83"
                r="2"
                fill="#fff"
            />

            <path
                d="M80 92v6"
                stroke="#B9663F"
                strokeWidth="2.6"
                strokeLinecap="round"
            />

            <path
                d="M76 98c2.5 2.5 5.5 2.5 8 0"
                stroke="#B9663F"
                strokeWidth="2.6"
                strokeLinecap="round"
            />

            <path
                d="M74 90c-3-1-6 0-7 2M86 90c3-1 6 0 7 2"
                stroke="#B9663F"
                strokeWidth="2.2"
                strokeLinecap="round"
            />

            <path
                d="M28 84h20M28 94h18M112 84h20M114 94h18"
                stroke="#fff"
                strokeWidth="2.6"
                strokeLinecap="round"
            />

            <path
                d="M22 92a58 58 0 0 1 116 0"
                stroke="#DCEBF7"
                strokeWidth="8"
                fill="none"
            />

            <circle
                cx="122"
                cy="42"
                r="6"
                fill="#FF9ECB"
            />

            <path
                d="M112 54c4-6 8-10 10-12"
                stroke="#DCEBF7"
                strokeWidth="5"
                strokeLinecap="round"
            />

            <path
                d="M18 60l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"
                fill="#FFD37A"
            />

            <path
                d="M142 100l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6Z"
                fill="#FF9ECB"
            />

        </svg>

    )

}


// ==========================================================
// LOGIN
// ==========================================================

export default function Login() {

    const navigate = useNavigate()

    const [email, setEmail] =
        useState("")

    const [password, setPassword] =
        useState("")

    const [showPassword, setShowPassword] =
        useState(false)

    const [loading, setLoading] =
        useState(false)

    const [error, setError] =
        useState("")


    // ======================================================
    // LOGIN
    // ======================================================

    const handleSubmit = async (e) => {

        e.preventDefault()

        setError("")


        if (!email.trim()) {

            setError(
                "กรุณากรอก Email"
            )

            return

        }


        if (!password) {

            setError(
                "กรุณากรอก Password"
            )

            return

        }


        try {

            setLoading(true)


            const API =
                import.meta.env.VITE_API_URL ||
                "http://localhost:5000/api"


            const response =
                await axios.post(

                    `${API}/login`,

                    {
                        email:
                            email.trim(),

                        password
                    },

                    {
                        withCredentials:
                            true
                    }

                )


            console.log(
                "LOGIN SUCCESS:",
                response.data
            )


            // ==================================================
            // SESSION AUTH
            // ==================================================
            //
            // Backend ใช้ HttpOnly Cookie
            // ไม่ต้องเก็บ token ใน localStorage
            //
            // ==================================================


            navigate(
                "/dashboard",
                {
                    replace: true
                }
            )


        }
        catch (err) {

            console.error(
                "LOGIN ERROR:",
                err
            )


            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Email หรือ Password ไม่ถูกต้อง"


            setError(message)

        }
        finally {

            setLoading(false)

        }

    }


    // ======================================================
    // RENDER
    // ======================================================

    return (

        <div className="login-page">


            {/* ==================================================
                BACKGROUND
            ================================================== */}

            <div className="login-moon">
                <Moon />
            </div>


            <div className="login-ship">
                <Spaceship />
            </div>


            <div className="login-ship-2">
                <Spaceship />
            </div>


            <div className="login-sparkle sparkle-1">
                ✦
            </div>


            <div className="login-sparkle sparkle-2">
                ✦
            </div>


            <div className="login-sparkle sparkle-3">
                ✦
            </div>


            {/* ==================================================
                LOGIN CARD
            ================================================== */}

            <main className="login-card">


                <div className="login-cat">
                    <CatAstronaut />
                </div>


                <div className="login-header">

                    <h1>
                        Welcome!
                    </h1>

                    <p>
                        เข้าสู่ระบบเพื่อไปต่อในความมั่งคั่งของคุณ 🚀
                    </p>

                </div>


                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                    autoComplete="off"
                >


                    {/* EMAIL */}

                    <div className="login-input-wrapper">

                        <div className="login-input-icon">
                            <User size={21} />
                        </div>

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                            autoComplete="off"
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="login-input-wrapper">

                        <div className="login-input-icon">
                            <Lock size={21} />
                        </div>

                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            autoComplete="new-password"
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() =>
                                setShowPassword(
                                    current =>
                                        !current
                                )
                            }
                            aria-label={
                                showPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >

                            {showPassword
                                ? <EyeOff size={20} />
                                : <Eye size={20} />
                            }

                        </button>

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className="login-error">
                            {error}
                        </div>

                    )}


                    {/* FORGOT PASSWORD */}

                    <div className="login-forgot">

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/forgot-password"
                                )
                            }
                        >
                            Forgot Password?
                        </button>

                    </div>


                    {/* LOGIN */}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >

                        {loading
                            ? "กำลังเข้าสู่ระบบ..."
                            : "Login"
                        }

                        <Rocket size={20} />

                    </button>

                </form>


                {/* REGISTER */}

                <div className="login-register">

                    <span>
                        Don't have an account?
                    </span>

                    <Link to="/register">
                        Sign Up
                    </Link>

                </div>


                {/* BRAND */}

                <div className="login-brand">
                    ระบบบันทึกการขาย
                </div>


                {/* BACK HOME */}

                <button
                    type="button"
                    className="login-back-home"
                    onClick={() =>
                        navigate("/")
                    }
                >
                    ← กลับหน้าหลัก
                </button>


            </main>

        </div>

    )

}