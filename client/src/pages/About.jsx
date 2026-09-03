import React from "react"

import {
    Link
} from "react-router-dom"

import "../styles/About.css"


/* ==========================================================
   DECORATIVE SVG ART
   ใช้ Visual Language เดียวกับ Home
========================================================== */

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
                fill="none"
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


function Spaceship({ gradientId }) {
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

            <ellipse
                cx="80"
                cy="55"
                rx="34"
                ry="26"
                fill={`url(#${gradientId})`}
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
                    id={gradientId}
                    x1="46"
                    y1="30"
                    x2="114"
                    y2="80"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop
                        stopColor="#ffffff"
                    />

                    <stop
                        offset="1"
                        stopColor="#F0E4FF"
                    />
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
                d="M42 46 L52 18 L68 44Z"
                fill="#F5A468"
            />

            <path
                d="M118 46 L108 18 L92 44Z"
                fill="#F5A468"
            />

            <path
                d="M48 42 L54 26 L62 40Z"
                fill="#FFD3B0"
            />

            <path
                d="M112 42 L106 26 L98 40Z"
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
                d="M76 98c2.5 2.5 5.5 2.5 8 0"
                stroke="#B9663F"
                strokeWidth="2.6"
                strokeLinecap="round"
                fill="none"
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


/* ==========================================================
   ABOUT PAGE
========================================================== */

const About = () => {

    return (
        <div className="about-page">

            {/* ==================================================
                NAVBAR
            ================================================== */}

            <header className="about-navbar">

                <Link
                    to="/"
                    className="about-logo"
                >

                    <div className="about-logo-icon">

                        <img
                            src="/PROMPHENG.png"
                            alt="PROMPHENG logo"
                        />

                    </div>

                    <div className="about-logo-text">

                        <strong>
                            PROMPHENG
                        </strong>

                        <span>
                            พร้อมขาย พร้อมจัดการ พร้อมเติบโต
                        </span>

                    </div>

                </Link>


                <nav className="about-nav">

                    <Link to="/">
                        หน้าหลัก
                    </Link>

                    <Link to="/#features">
                        Features
                    </Link>

                    <span className="about-nav-active">
                        About
                    </span>

                    <Link
                        to="/login"
                        className="about-login-button"
                    >
                        เข้าสู่ระบบ
                    </Link>

                </nav>

            </header>


            {/* ==================================================
                DECORATIONS
            ================================================== */}

            <div className="about-moon">
                <Moon />
            </div>


            <div className="about-ship about-ship-1">

                <Spaceship
                    gradientId="aboutShipShade1"
                />

            </div>


            <div className="about-ship about-ship-2">

                <Spaceship
                    gradientId="aboutShipShade2"
                />

            </div>


            <div className="about-star about-star-1">
                ✦
            </div>

            <div className="about-star about-star-2">
                ✦
            </div>

            <div className="about-star about-star-3">
                ✦
            </div>


            {/* ==================================================
                HERO
            ================================================== */}

            <main>

                <section className="about-hero">

                    <div className="about-hero-content">

                        <div className="about-badge">

                            <span className="about-badge-dot"></span>

                            About PROMPHENG

                        </div>


                        <h1>

                            พร้อมขาย
                            <br />

                            <span>
                                พร้อมจัดการ
                            </span>

                        </h1>


                        <p className="about-hero-description">

                            PROMPHENG คือระบบจัดการการขาย
                            ที่ออกแบบมาเพื่อช่วยให้ร้านค้า
                            และธุรกิจขนาดเล็กจัดการงานหลังบ้าน
                            ได้ง่ายขึ้น เป็นระบบมากขึ้น
                            และมองเห็นภาพรวมของธุรกิจได้ชัดเจนขึ้น

                        </p>


                        <div className="about-hero-actions">

                            <Link
                                to="/register"
                                className="about-primary-button"
                            >
                                เริ่มต้นใช้งาน
                            </Link>

                            <Link
                                to="/"
                                className="about-secondary-button"
                            >
                                กลับหน้าหลัก
                            </Link>

                        </div>

                    </div>


                    {/* ==================================================
                        HERO VISUAL
                    ================================================== */}

                    <div className="about-hero-visual">

                        <div className="about-orbit about-orbit-one"></div>

                        <div className="about-orbit about-orbit-two"></div>


                        <div className="about-cat">

                            <CatAstronaut />

                        </div>


                        <div className="about-main-card">

                            <div className="about-card-top">

                                <div>

                                    <span>
                                        PROMPHENG
                                    </span>

                                    <h3>
                                        Sales Management
                                    </h3>

                                </div>

                                <div className="about-card-menu">
                                    ✦
                                </div>

                            </div>


                            <div className="about-card-message">

                                <div className="about-card-icon">
                                    ✓
                                </div>

                                <div>

                                    <strong>
                                        พร้อมขาย
                                    </strong>

                                    <span>
                                        จัดการทุกอย่างได้ในที่เดียว
                                    </span>

                                </div>

                            </div>


                            <div className="about-mini-grid">

                                <div className="about-mini-card">

                                    <div className="about-mini-icon">
                                        ฿
                                    </div>

                                    <div>

                                        <span>
                                            Sales
                                        </span>

                                        <strong>
                                            บันทึกการขาย
                                        </strong>

                                    </div>

                                </div>


                                <div className="about-mini-card">

                                    <div className="about-mini-icon">
                                        📦
                                    </div>

                                    <div>

                                        <span>
                                            Products
                                        </span>

                                        <strong>
                                            จัดการสินค้า
                                        </strong>

                                    </div>

                                </div>


                                <div className="about-mini-card">

                                    <div className="about-mini-icon">
                                        👥
                                    </div>

                                    <div>

                                        <span>
                                            Customers
                                        </span>

                                        <strong>
                                            จัดการลูกค้า
                                        </strong>

                                    </div>

                                </div>


                                <div className="about-mini-card">

                                    <div className="about-mini-icon">
                                        ◴
                                    </div>

                                    <div>

                                        <span>
                                            History
                                        </span>

                                        <strong>
                                            ดูประวัติ
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>


                        <div className="about-floating-card about-floating-one">

                            <div className="about-floating-icon">
                                ✓
                            </div>

                            <div>

                                <span>
                                    Simple
                                </span>

                                <strong>
                                    ใช้งานง่าย
                                </strong>

                            </div>

                        </div>


                        <div className="about-floating-card about-floating-two">

                            <div className="about-floating-icon purple">
                                ✦
                            </div>

                            <div>

                                <span>
                                    Organized
                                </span>

                                <strong>
                                    จัดการเป็นระบบ
                                </strong>

                            </div>

                        </div>


                        <div className="about-floating-coin about-coin-one">
                            ฿
                        </div>

                        <div className="about-floating-coin about-coin-two">
                            +
                        </div>

                    </div>

                </section>


                {/* ==================================================
                    STORY
                ================================================== */}

                <section className="about-story">

                    <div className="about-section-heading">

                        <span>
                            WHY PROMPHENG
                        </span>

                        <h2>
                            เพราะการขายไม่ควรยุ่งยาก
                        </h2>

                        <p>
                            เราอยากให้เจ้าของร้านใช้เวลาไปกับการขาย
                            มากกว่าการจัดการข้อมูลที่ซับซ้อน
                        </p>

                    </div>


                    <div className="about-story-card">

                        <div className="about-story-visual">

                            <div className="about-story-bubble bubble-one">
                                ฿
                            </div>

                            <div className="about-story-bubble bubble-two">
                                📦
                            </div>

                            <div className="about-story-bubble bubble-three">
                                ✦
                            </div>

                            <div className="about-story-circle">

                                <img
                                    src="/PROMPHENG.png"
                                    alt="PROMPHENG"
                                />

                            </div>

                        </div>


                        <div className="about-story-content">

                            <span>
                                OUR IDEA
                            </span>

                            <h3>
                                จากเรื่องยุ่ง ๆ
                                <br />
                                ให้กลายเป็นเรื่องง่าย
                            </h3>

                            <p>
                                ร้านค้าขนาดเล็กต้องจัดการหลายอย่างในแต่ละวัน
                                ทั้งรายการขาย สินค้า ลูกค้า รายรับ รายจ่าย
                                และประวัติการทำรายการ
                            </p>

                            <p>
                                PROMPHENG จึงถูกออกแบบให้ข้อมูลเหล่านี้
                                อยู่ในระบบเดียวกัน เพื่อให้เจ้าของร้าน
                                สามารถจัดการธุรกิจได้ง่ายและเป็นระเบียบมากขึ้น
                            </p>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    WHAT WE DO
                ================================================== */}

                <section className="about-features">

                    <div className="about-section-heading">

                        <span>
                            WHAT PROMPHENG DOES
                        </span>

                        <h2>
                            เครื่องมือที่สร้างมาเพื่อร้านค้า
                        </h2>

                        <p>
                            ทุกส่วนออกแบบให้ใช้งานง่ายและเชื่อมโยงกัน
                        </p>

                    </div>


                    <div className="about-feature-grid">

                        <div className="about-feature-card">

                            <div className="about-feature-icon">
                                ฿
                            </div>

                            <h3>
                                การขาย
                            </h3>

                            <p>
                                บันทึกและติดตามรายการขาย
                                ให้ข้อมูลการขายเป็นระบบ
                                และค้นหาข้อมูลย้อนหลังได้ง่าย
                            </p>

                        </div>


                        <div className="about-feature-card">

                            <div className="about-feature-icon">
                                📦
                            </div>

                            <h3>
                                สินค้า
                            </h3>

                            <p>
                                จัดการข้อมูลสินค้า ตรวจสอบรายการ
                                และติดตามข้อมูลที่เกี่ยวข้องกับการขาย
                            </p>

                        </div>


                        <div className="about-feature-card">

                            <div className="about-feature-icon">
                                👥
                            </div>

                            <h3>
                                ลูกค้า
                            </h3>

                            <p>
                                เก็บข้อมูลลูกค้าและประวัติการซื้อ
                                เพื่อให้จัดการความสัมพันธ์กับลูกค้า
                                ได้สะดวกขึ้น
                            </p>

                        </div>


                        <div className="about-feature-card">

                            <div className="about-feature-icon">
                                ◴
                            </div>

                            <h3>
                                ภาพรวมธุรกิจ
                            </h3>

                            <p>
                                ดูข้อมูลการขาย รายรับ รายจ่าย
                                และข้อมูลทางการเงินในภาพรวม
                                จากระบบเดียว
                            </p>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    BETA
                ================================================== */}

                <section className="about-beta">

                    <div className="about-beta-card">

                        <div className="about-beta-icon">

                            <span>
                                β
                            </span>

                        </div>


                        <div className="about-beta-content">

                            <span>
                                CURRENT VERSION
                            </span>

                            <h2>
                                v0.1.0-beta
                            </h2>

                            <p>
                                PROMPHENG อยู่ในช่วง Beta
                                เพื่อพัฒนา ปรับปรุง และเก็บประสบการณ์
                                จากการใช้งานจริงอย่างต่อเนื่อง
                            </p>

                        </div>


                        <div className="about-beta-decoration">

                            <div>
                                ✦
                            </div>

                            <div>
                                ✦
                            </div>

                            <div>
                                ✦
                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    CTA
                ================================================== */}

                <section className="about-cta">

                    <div className="about-cta-card">

                        <div className="about-cta-cat">

                            <CatAstronaut />

                        </div>


                        <div className="about-cta-content">

                            <span>
                                READY TO GROW?
                            </span>

                            <h2>
                                พร้อมขาย
                                <br />
                                พร้อมเฮงไปด้วยกัน
                            </h2>

                            <p>
                                เริ่มต้นจัดการร้านของคุณ
                                ให้เป็นระบบมากขึ้นกับ PROMPHENG
                            </p>


                            <div className="about-cta-actions">

                                <Link
                                    to="/register"
                                    className="about-primary-button"
                                >
                                    สมัครสมาชิก
                                </Link>

                                <Link
                                    to="/login"
                                    className="about-secondary-button"
                                >
                                    เข้าสู่ระบบ
                                </Link>

                            </div>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    )
}


export default About