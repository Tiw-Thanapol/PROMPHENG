import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Rocket, Cookie, FileText, ShieldCheck } from "lucide-react"
import "../styles/Register.css"
import api from "../api/axios"


/* ==========================================================
   CONSENT CONFIG
========================================================== */

const TERMS_VERSION = "1.0"
const PRIVACY_VERSION = "1.0"


/* ==========================================================
   DECORATIVE SVG ART
========================================================== */

function Moon() {
    return (
        <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
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

            <circle cx="42" cy="46" r="7" fill="#FBC978" opacity=".7" />
            <circle cx="72" cy="34" r="4.5" fill="#FBC978" opacity=".6" />
            <circle cx="80" cy="66" r="8" fill="#FBC978" opacity=".6" />
            <circle cx="46" cy="80" r="5" fill="#FBC978" opacity=".55" />

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
            aria-hidden="true"
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

            <ellipse
                cx="80"
                cy="55"
                rx="34"
                ry="26"
                fill="url(#regShipShade)"
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

            <defs>
                <linearGradient
                    id="regShipShade"
                    x1="46"
                    y1="30"
                    x2="114"
                    y2="80"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#ffffff" />
                    <stop offset="1" stopColor="#F0E4FF" />
                </linearGradient>
            </defs>
        </svg>
    )
}


function CatAstronaut() {
    return (
        <svg
            viewBox="0 0 160 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
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
                fill="#ffffff"
                opacity=".6"
            />

            <path
                d="M42 46 52 18 68 44Z"
                fill="#F5A468"
            />

            <path
                d="M118 46 108 18 92 44Z"
                fill="#F5A468"
            />

            <path
                d="M48 42 54 26 62 40Z"
                fill="#FFD3B0"
            />

            <path
                d="M112 42 106 26 98 40Z"
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

            <circle cx="66.5" cy="83" r="2" fill="#fff" />
            <circle cx="98.5" cy="83" r="2" fill="#fff" />

            <path
                d="M76 98c2.5 2.5 5.5 2.5 8 0"
                stroke="#B9663F"
                strokeWidth="2.6"
                strokeLinecap="round"
            />

            <path
                d="M80 92v6"
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
                opacity=".9"
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
                d="m18 60 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"
                fill="#FFD37A"
            />

            <path
                d="m142 100 1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6Z"
                fill="#FF9ECB"
            />
        </svg>
    )
}


/* ==========================================================
   REGISTER PAGE
========================================================== */

export default function Register() {

    const navigate = useNavigate()

    const [form, setForm] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    })

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)

    const [showPolicy, setShowPolicy] = useState(false)
    const [policyType, setPolicyType] = useState("terms")


    /* ======================================================
       HANDLE INPUT
    ====================================================== */

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target

        setForm(prev => ({
            ...prev,
            [name]: value
        }))

        setError("")
    }


    /* ======================================================
       PASSWORD VALIDATION
    ====================================================== */

    const validatePassword = (password) => {

        if (password.length < 8) {
            return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
        }

        if (!/[A-Z]/.test(password)) {
            return "รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว"
        }

        if (!/[a-z]/.test(password)) {
            return "รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษตัวพิมพ์เล็กอย่างน้อย 1 ตัว"
        }

        if (!/[0-9]/.test(password)) {
            return "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว"
        }

        if (!/[^A-Za-z0-9]/.test(password)) {
            return "รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว"
        }

        return null
    }


    /* ======================================================
       SUBMIT
    ====================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault()
        setError("")

        if (!acceptedTerms) {
            setError("กรุณายอมรับข้อกำหนดและเงื่อนไขการใช้บริการ")
            return
        }

        if (!acceptedPrivacy) {
            setError("กรุณายอมรับนโยบายความเป็นส่วนตัว")
            return
        }

        if (!form.name.trim()) {
            setError("กรุณากรอกชื่อ")
            return
        }

        if (!form.email.trim()) {
            setError("กรุณากรอก Email")
            return
        }

        if (!form.password) {
            setError("กรุณากรอกรหัสผ่าน")
            return
        }

        const passwordError = validatePassword(form.password)

        if (passwordError) {
            setError(passwordError)
            return
        }

        if (form.password !== form.confirmPassword) {
            setError("รหัสผ่านไม่ตรงกัน")
            return
        }

        try {

            setLoading(true)

            const email =
                form.email
                    .trim()
                    .toLowerCase()

            const consentTimestamp =
                new Date().toISOString()

            const response = await api.post(
                "/register",
                {
                    name: form.name.trim(),
                    email,
                    phoneNumber:
                        form.phoneNumber.trim() || null,
                    password: form.password,

                    consent: {
                        terms: {
                            accepted: acceptedTerms,
                            version: TERMS_VERSION,
                            timestamp: consentTimestamp
                        },

                        privacy: {
                            accepted: acceptedPrivacy,
                            version: PRIVACY_VERSION,
                            timestamp: consentTimestamp
                        }
                    }
                }
            )

            setForm(prev => ({
                ...prev,
                password: "",
                confirmPassword: ""
            }))

            sessionStorage.setItem(
                "registrationSuccess",
                JSON.stringify({
                    email,
                    message:
                        response.data?.message ||
                        "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบ Email ของคุณ"
                })
            )

            navigate(
                "/registration-pending",
                {
                    replace: true
                }
            )

        } catch (err) {

            console.error(
                "REGISTER ERROR:",
                err
            )

            const message =
                err.response?.data?.message ||
                "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง"

            setError(message)

        } finally {

            setLoading(false)

        }
    }


    /* ======================================================
       POLICY
    ====================================================== */

    const openPolicy = (type) => {
        setPolicyType(type)
        setShowPolicy(true)
    }


    const closePolicy = () => {
        setShowPolicy(false)
    }


    /* ======================================================
       RENDER
    ====================================================== */

    return (
        <div className="register-page">

            <div className="register-background">

                {/* ==================================================
                    SPACE SCENE
                ================================================== */}

                <div className="register-moon">
                    <Moon />
                </div>

                <div className="register-ship">
                    <Spaceship />
                </div>

                <div className="register-ship-2">
                    <Spaceship />
                </div>

                <div className="register-sparkle sparkle-1">
                    ✦
                </div>

                <div className="register-sparkle sparkle-2">
                    ✦
                </div>

                <div className="register-sparkle sparkle-3">
                    ✦
                </div>


                {/* ==================================================
                    MAIN CARD
                ================================================== */}

                <div className="register-card">

                    <div className="register-cat">
                        <CatAstronaut />
                    </div>


                    {/* ==================================================
                        HEADER
                    ================================================== */}

                    <div className="register-header">

                        <h1>
                            Create Account
                        </h1>

                        <p>
                            ออกเดินทางสู่ความมั่งคั่งไปด้วยกัน 🚀
                        </p>

                    </div>


                    {/* ==================================================
                        FORM
                    ================================================== */}

                    <form
                        className="register-form"
                        onSubmit={handleSubmit}
                    >

                        {/* NAME */}

                        <div className="register-field">

                            <div className="register-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <circle
                                        cx="12"
                                        cy="8"
                                        r="4"
                                    />

                                    <path
                                        d="M4 21c0-4 3.2-6 8-6s8 2 8 6"
                                    />
                                </svg>
                            </div>

                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="name"
                                disabled={loading}
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="register-field">

                            <div className="register-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <rect
                                        x="3"
                                        y="5"
                                        width="18"
                                        height="14"
                                        rx="3"
                                    />

                                    <path
                                        d="m4 7 8 6 8-6"
                                    />
                                </svg>
                            </div>

                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                disabled={loading}
                            />

                        </div>


                        {/* PHONE */}

                        <div className="register-field">

                            <div className="register-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M7 3h3l2 5-2 2c1 2 3 3 4 4l2-2 5 2v3c0 1-1 2-2 2C10 19 5 14 5 5c0-1 1-2 2-2Z"
                                    />
                                </svg>
                            </div>

                            <input
                                type="tel"
                                name="phoneNumber"
                                placeholder="Phone Number"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                autoComplete="tel"
                                disabled={loading}
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="register-field">

                            <div className="register-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <rect
                                        x="5"
                                        y="10"
                                        width="14"
                                        height="10"
                                        rx="2"
                                    />

                                    <path
                                        d="M8 10V7a4 4 0 0 1 8 0v3"
                                    />
                                </svg>
                            </div>

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                disabled={loading}
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(prev => !prev)
                                }
                                disabled={loading}
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? "◉" : "◌"}
                            </button>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="register-field">

                            <div className="register-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <rect
                                        x="5"
                                        y="10"
                                        width="14"
                                        height="10"
                                        rx="2"
                                    />

                                    <path
                                        d="M8 10V7a4 4 0 0 1 8 0v3"
                                    />

                                    <path
                                        d="m9 15 2 2 4-4"
                                    />
                                </svg>
                            </div>

                            <input
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                                disabled={loading}
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        prev => !prev
                                    )
                                }
                                disabled={loading}
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showConfirmPassword ? "◉" : "◌"}
                            </button>

                        </div>


                        {/* ==================================================
                            TERMS + PRIVACY
                        ================================================== */}

                        <div className="register-consent">

                            {/* TERMS */}

                            <label className="register-consent-row">

                                <input
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) =>
                                        setAcceptedTerms(
                                            e.target.checked
                                        )
                                    }
                                    disabled={loading}
                                />

                                <span>
                                    ฉันยอมรับ{" "}
                                    <button
                                        type="button"
                                        className="register-policy-link"
                                        onClick={() =>
                                            openPolicy("terms")
                                        }
                                    >
                                        ข้อกำหนดและเงื่อนไขการใช้บริการ
                                    </button>
                                </span>

                            </label>


                            {/* PRIVACY */}

                            <label className="register-consent-row">

                                <input
                                    type="checkbox"
                                    checked={acceptedPrivacy}
                                    onChange={(e) =>
                                        setAcceptedPrivacy(
                                            e.target.checked
                                        )
                                    }
                                    disabled={loading}
                                />

                                <span>
                                    ฉันรับทราบและยอมรับ{" "}
                                    <button
                                        type="button"
                                        className="register-policy-link"
                                        onClick={() =>
                                            openPolicy("privacy")
                                        }
                                    >
                                        นโยบายความเป็นส่วนตัว
                                    </button>
                                </span>

                            </label>


                            {/* COOKIE NOTICE */}

                            <div className="register-consent-note">

                                <Cookie
                                    className="register-cookie-icon"
                                    size={17}
                                    aria-hidden="true"
                                />

                                <span>
                                    เว็บไซต์อาจใช้ Cookies
                                    และเทคโนโลยีที่เกี่ยวข้อง
                                    เพื่อให้ระบบทำงานปลอดภัย
                                    และปรับปรุงการให้บริการ
                                </span>

                            </div>

                        </div>


                        {/* ==================================================
                            ERROR
                        ================================================== */}

                        {error && (

                            <div
                                className="register-message register-error"
                                role="alert"
                            >

                                <span className="message-icon">
                                    !
                                </span>

                                <span>
                                    {error}
                                </span>

                            </div>

                        )}


                        {/* ==================================================
                            REGISTER BUTTON
                        ================================================== */}

                        <button
                            type="submit"
                            className="register-button"
                            disabled={
                                loading ||
                                !acceptedTerms ||
                                !acceptedPrivacy
                            }
                        >

                            {loading ? (

                                <>
                                    <span className="register-spinner" />
                                    กำลังสร้างบัญชี...
                                </>

                            ) : (

                                <>
                                    Create Account
                                    <Rocket
                                        size={19}
                                        className="register-button-icon"
                                    />
                                </>

                            )}

                        </button>

                    </form>


                    {/* ==================================================
                        EMAIL NOTICE
                    ================================================== */}

                    <div className="register-email-note">

                        <div className="email-note-icon">
                            ✉
                        </div>

                        <div>

                            <strong>
                                Email verification required
                            </strong>

                            <p>
                                หลังจากสมัครสมาชิก
                                ระบบจะส่งลิงก์ยืนยันไปยัง Email ของคุณ
                            </p>

                        </div>

                    </div>


                    {/* ==================================================
                        LOGIN
                    ================================================== */}

                    <div className="register-login">

                        <span>
                            Already have an account?
                        </span>

                        <Link to="/login">
                            Login
                        </Link>




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
                </div>


                {/* ======================================================
                    POLICY MODAL
                ====================================================== */}

                {showPolicy && (

                    <div
                        className="register-policy-overlay"
                        onMouseDown={(e) => {

                            if (
                                e.target === e.currentTarget
                            ) {
                                closePolicy()
                            }

                        }}
                    >

                        <div
                            className="register-policy-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="register-policy-title"
                        >

                            <button
                                type="button"
                                className="register-policy-close"
                                onClick={closePolicy}
                                aria-label="ปิด"
                            >
                                ×
                            </button>


                            {/* TERMS */}

                            {policyType === "terms" ? (

                                <>
                                    <div
                                        className="register-policy-title"
                                        id="register-policy-title"
                                    >
                                        <FileText size={24} />

                                        <h2>
                                            ข้อกำหนดและเงื่อนไขการใช้บริการ
                                        </h2>
                                    </div>

                                    <div className="register-policy-content">

                                        <h3>1. การสมัครสมาชิก</h3>

                                        <p>
                                            ผู้สมัครต้องให้ข้อมูลที่ถูกต้อง
                                            เป็นปัจจุบัน
                                            และไม่แอบอ้างเป็นบุคคลอื่น
                                        </p>

                                        <h3>2. บัญชีผู้ใช้งาน</h3>

                                        <p>
                                            ผู้ใช้มีหน้าที่รักษาข้อมูลเข้าสู่ระบบ
                                            และรับผิดชอบกิจกรรมที่เกิดขึ้น
                                            ภายใต้บัญชีของตน
                                        </p>

                                        <h3>3. การใช้งานระบบ</h3>

                                        <p>
                                            ห้ามใช้ระบบเพื่อกระทำการที่ผิดกฎหมาย
                                            หลอกลวงผู้อื่น
                                            หรือพยายามเข้าถึงระบบ
                                            โดยไม่ได้รับอนุญาต
                                        </p>

                                        <h3>4. ความถูกต้องของข้อมูล</h3>

                                        <p>
                                            ผู้ใช้รับผิดชอบข้อมูลสินค้า
                                            รายการขาย ลูกค้า
                                            และข้อมูลทางธุรกิจ
                                            ที่นำเข้าสู่ระบบ
                                        </p>

                                        <h3>5. การปรับปรุงบริการ</h3>

                                        <p>
                                            เราอาจปรับปรุง แก้ไข
                                            หรือเพิ่มเติมฟังก์ชันของระบบ
                                            เพื่อความปลอดภัย
                                            และประสิทธิภาพของบริการ
                                        </p>

                                        <h3>6. การระงับบัญชี</h3>

                                        <p>
                                            เราอาจระงับหรือจำกัดการใช้งานบัญชี
                                            หากพบการใช้งานที่ผิดกฎหมาย
                                            ผิดเงื่อนไข
                                            หรือก่อให้เกิดความเสี่ยง
                                            ต่อระบบหรือผู้ใช้อื่น
                                        </p>

                                    </div>
                                </>

                            ) : (

                                /* PRIVACY */

                                <>
                                    <div
                                        className="register-policy-title"
                                        id="register-policy-title"
                                    >
                                        <ShieldCheck size={24} />

                                        <h2>
                                            นโยบายความเป็นส่วนตัว
                                        </h2>
                                    </div>

                                    <div className="register-policy-content">

                                        <h3>1. ข้อมูลที่เราเก็บ</h3>

                                        <p>
                                            เราอาจเก็บข้อมูลที่ผู้ใช้ให้แก่เรา
                                            เช่น ชื่อ Email เบอร์โทรศัพท์
                                            ข้อมูลบัญชี ข้อมูลธุรกรรม
                                            และข้อมูลที่จำเป็นต่อการให้บริการ
                                        </p>

                                        <h3>2. ข้อมูลทางเทคนิค</h3>

                                        <p>
                                            ระบบอาจเก็บข้อมูลทางเทคนิค เช่น
                                            IP Address ข้อมูลอุปกรณ์
                                            Browser ข้อมูลการเข้าสู่ระบบ
                                            และข้อมูล Log เพื่อความปลอดภัย
                                            และการดูแลระบบ
                                        </p>

                                        <h3>3. Cookies</h3>

                                        <p>
                                            เราอาจใช้ Cookies
                                            หรือเทคโนโลยีที่เกี่ยวข้อง
                                            เพื่อให้ระบบทำงาน
                                            จดจำการตั้งค่า
                                            รักษาความปลอดภัย
                                            และวิเคราะห์การใช้งาน
                                        </p>

                                        <h3>4. วัตถุประสงค์</h3>

                                        <p>
                                            เราใช้ข้อมูลเพื่อสร้างและดูแลบัญชี
                                            ให้บริการระบบ
                                            ประมวลผลธุรกรรม
                                            ยืนยันตัวตน
                                            ป้องกันการทุจริต
                                            รักษาความปลอดภัย
                                            และปรับปรุงบริการ
                                        </p>

                                        <h3>5. การเปิดเผยข้อมูล</h3>

                                        <p>
                                            เราจะไม่เปิดเผยข้อมูลส่วนบุคคล
                                            โดยไม่มีเหตุอันสมควร
                                            และอาจใช้ผู้ให้บริการภายนอก
                                            ที่จำเป็นต่อการให้บริการ
                                            เช่น Email Hosting Cloud
                                            หรือระบบวิเคราะห์
                                            โดยอยู่ภายใต้ข้อกำหนดที่เหมาะสม
                                        </p>

                                        <h3>6. การเก็บรักษาข้อมูล</h3>

                                        <p>
                                            เราจะเก็บข้อมูลเท่าที่จำเป็น
                                            ต่อวัตถุประสงค์ของการให้บริการ
                                            หรือเท่าที่กฎหมายกำหนด
                                            และจะดำเนินการลบ
                                            หรือทำให้ข้อมูลไม่สามารถ
                                            ระบุตัวบุคคลได้
                                            เมื่อหมดความจำเป็น
                                        </p>

                                        <h3>7. สิทธิของเจ้าของข้อมูล</h3>

                                        <p>
                                            ผู้ใช้สามารถใช้สิทธิของเจ้าของ
                                            ข้อมูลส่วนบุคคลตามกฎหมาย
                                            ที่เกี่ยวข้อง เช่น ขอเข้าถึง
                                            แก้ไข ลบ หรือขอให้จำกัด
                                            การประมวลผล
                                            ภายใต้เงื่อนไขของกฎหมาย
                                        </p>

                                        <h3>8. การเปลี่ยนแปลงนโยบาย</h3>

                                        <p>
                                            เราอาจปรับปรุงนโยบายนี้
                                            เมื่อมีการเปลี่ยนแปลง
                                            การให้บริการ เทคโนโลยี
                                            หรือข้อกำหนดทางกฎหมาย
                                        </p>

                                    </div>
                                </>
                            )}


                            {/* OK */}

                            <button
                                type="button"
                                className="register-policy-ok"
                                onClick={closePolicy}
                            >
                                รับทราบ
                            </button>

                        </div>


                    </div>



                )}


            </div>



        </div>
    )
}
