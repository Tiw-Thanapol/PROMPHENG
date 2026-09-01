import React from "react"
import { Link } from "react-router-dom"
import "../styles/Home.css"


/* ==========================================================
   DECORATIVE SVG ART — shared visual language with Login/Register
========================================================== */

function Moon() {
    return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="52" fill="#FFE8B8" />
            <path
                d="M60 8a52 52 0 1 0 52 52c0-2-.1-4-.3-6a40 40 0 1 1-45.7-45.7c-2-.2-4-.3-6-.3Z"
                fill="#FFDA8C"
            />
            <circle cx="42" cy="46" r="7" fill="#FBC978" opacity=".7" />
            <circle cx="72" cy="34" r="4.5" fill="#FBC978" opacity=".6" />
            <circle cx="80" cy="66" r="8" fill="#FBC978" opacity=".6" />
            <circle cx="46" cy="80" r="5" fill="#FBC978" opacity=".55" />
            <path d="M50 58c1.5-2 5.5-2 7 0" stroke="#B9863F" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M64 58c1.5-2 5.5-2 7 0" stroke="#B9863F" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M55 70c2.5 2.5 7.5 2.5 10 0" stroke="#B9863F" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <ellipse cx="46" cy="66" rx="4" ry="2.6" fill="#FFB4B4" opacity=".6" />
            <ellipse cx="74" cy="66" rx="4" ry="2.6" fill="#FFB4B4" opacity=".6" />
        </svg>
    )
}


function Spaceship({ gradientId }) {
    return (
        <svg viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 78c14 6 24 6 34 2" stroke="#FFD37A" strokeWidth="5" strokeLinecap="round" opacity=".55" />
            <path d="M14 64c10 5 18 6 26 3" stroke="#FF9ECB" strokeWidth="4" strokeLinecap="round" opacity=".45" />
            <ellipse cx="80" cy="55" rx="34" ry="26" fill="#FFF7EC" />
            <ellipse cx="80" cy="55" rx="34" ry="26" fill={`url(#${gradientId})`} />
            <path d="M52 60c4 18 20 30 28 30s24-12 28-30" fill="#B587FF" opacity=".18" />
            <circle cx="82" cy="50" r="13" fill="#9AD8FF" />
            <circle cx="82" cy="50" r="13" stroke="#6FB8E8" strokeWidth="3" />
            <circle cx="77" cy="45" r="3.2" fill="#fff" opacity=".8" />
            <path d="M52 62c-10 2-16 10-16 18 8 0 16-4 20-12Z" fill="#FF9ECB" />
            <path d="M108 62c10 2 16 10 16 18-8 0-16-4-20-12Z" fill="#FF9ECB" />
            <path d="M70 84c2 8 6 14 10 16 4-2 8-8 10-16-6 4-14 4-20 0Z" fill="#FFD37A" />
            <defs>
                <linearGradient id={gradientId} x1="46" y1="30" x2="114" y2="80" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ffffff" />
                    <stop offset="1" stopColor="#F0E4FF" />
                </linearGradient>
            </defs>
        </svg>
    )
}


function CatAstronaut() {
    return (
        <svg viewBox="0 0 160 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="80" cy="82" r="58" fill="#EAF6FF" opacity=".9" />
            <circle cx="80" cy="82" r="58" stroke="#DCEBF7" strokeWidth="6" />
            <circle cx="60" cy="62" r="10" fill="#ffffff" opacity=".6" />
            <path d="M42 46 L52 18 L68 44Z" fill="#F5A468" />
            <path d="M118 46 L108 18 L92 44Z" fill="#F5A468" />
            <path d="M48 42 L54 26 L62 40Z" fill="#FFD3B0" />
            <path d="M112 42 L106 26 L98 40Z" fill="#FFD3B0" />
            <circle cx="80" cy="90" r="46" fill="#F8B57E" />
            <path d="M34 88a46 46 0 0 0 92 4c-10 6-24 9-46 9s-36-3-46-9Z" fill="#FCCB9C" />
            <path d="M50 56c4 4 4 10 0 14" stroke="#E28F52" strokeWidth="4" strokeLinecap="round" />
            <path d="M110 56c-4 4-4 10 0 14" stroke="#E28F52" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="56" cy="100" rx="9" ry="6" fill="#FF9EAE" opacity=".55" />
            <ellipse cx="104" cy="100" rx="9" ry="6" fill="#FF9EAE" opacity=".55" />
            <ellipse cx="64" cy="86" rx="6" ry="7.5" fill="#4B3F6B" />
            <ellipse cx="96" cy="86" rx="6" ry="7.5" fill="#4B3F6B" />
            <circle cx="66.5" cy="83" r="2" fill="#fff" />
            <circle cx="98.5" cy="83" r="2" fill="#fff" />
            <path d="M76 98c2.5 2.5 5.5 2.5 8 0" stroke="#B9663F" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            <path d="M80 92v6" stroke="#B9663F" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M74 90c-3-1-6 0-7 2M86 90c3-1 6 0 7 2" stroke="#B9663F" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M28 84h20M28 94h18M112 84h20M114 94h18" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity=".9" />
            <path d="M22 92a58 58 0 0 1 116 0" stroke="#DCEBF7" strokeWidth="8" fill="none" />
            <circle cx="122" cy="42" r="6" fill="#FF9ECB" />
            <path d="M112 54c4-6 8-10 10-12" stroke="#DCEBF7" strokeWidth="5" strokeLinecap="round" />
            <path d="M18 60l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#FFD37A" />
            <path d="M142 100l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6Z" fill="#FF9ECB" />
        </svg>
    )
}


const Home = () => {
    return (
        <div className="home-page">

            {/* ==================================================
                NAVBAR
            ================================================== */}
            <header className="home-navbar">
                <div className="home-logo">
                    <div className="home-logo-icon">
                        <img
                            src="PROMPHENG.png"
                            alt="PROMPHENG logo"

                        />
                    </div>

                    <div className="home-logo-text">
                        <strong>PROMPHENG</strong>
                        <span>พร้อมขาย พร้อมจัดการ พร้อมเติบโต</span>
                    </div>
                </div>

                <nav className="home-nav">
                    <a href="#features">Features</a>
                    <a href="#about">About</a>
                    {/* <Link to="/login" className="home-login-button">
                        Login
                    </Link> */}
                </nav>
            </header>

            {/* ==================================================
                HERO
            ================================================== */}
            <main>
                <section className="home-hero">

                    {/* SPACE SCENE — matches Login / Register */}
                    <div className="home-moon">
                        <Moon />
                    </div>

                    <div className="home-ship home-ship-1">
                        <Spaceship gradientId="homeShipShade1" />
                    </div>

                    <div className="home-ship home-ship-2">
                        <Spaceship gradientId="homeShipShade2" />
                    </div>

                    <div className="home-star home-star-1">✦</div>
                    <div className="home-star home-star-2">✦</div>
                    <div className="home-star home-star-3">✦</div>

                    <div className="home-hero-content">
                        <div className="home-badge">
                            <span className="home-badge-dot"></span>
                            Simple Sales Management
                        </div>

                        <h1>
                            จัดการยอดขาย
                            <br />
                            </h1>
                            <h1>
                            <span>
                                ให้ง่ายกว่าที่เคย
                            </span>
                        </h1>

                        <p className="home-hero-description">
                            PROMPHENG พร้อมขาย พร้อมเฮง
                            ระบบบันทึกและจัดการการขาย
                            สำหรับร้านค้าขนาดเล็กและธุรกิจที่ต้องการ
                            จัดการสินค้า ลูกค้า รายรับ และรายจ่าย
                            ได้ในที่เดียว
                        </p>

                        <div className="home-hero-actions">
                            <Link to="/login" className="home-primary-button">
                                เข้าสู่ระบบ

                            </Link>

                            <Link to="/register" className="home-secondary-button">
                                สมัครสมาชิก
                            </Link>
                        </div>

                        <div className="home-trust">
                            <div className="home-trust-item">
                                <strong>Simple</strong>
                                <span>ใช้งานง่าย</span>
                            </div>
                            <div className="home-trust-divider"></div>
                            <div className="home-trust-item">
                                <strong>Secure</strong>
                                <span>ปลอดภัย</span>
                            </div>
                            <div className="home-trust-divider"></div>
                            <div className="home-trust-item">
                                <strong>Organized</strong>
                                <span>จัดการเป็นระบบ</span>
                            </div>
                        </div>
                    </div>

                    {/* ==================================================
                        3D DASHBOARD
                    ================================================== */}
                    <div className="home-hero-visual">
                        <div className="home-orbit orbit-one"></div>
                        <div className="home-orbit orbit-two"></div>

                        {/* CAT ASTRONAUT PEEKING OVER THE DASHBOARD CARD */}
                        <div className="home-cat">
                            <CatAstronaut />
                        </div>

                        <div className="home-dashboard-card">
                            <div className="dashboard-top">
                                <div>
                                    <span className="dashboard-small-title">OVERVIEW</span>
                                    <h3>Sales Overview</h3>
                                </div>
                                <div className="dashboard-menu">•َا•</div>
                            </div>

                            <div className="dashboard-total">
                                <span>Total Sales</span>
                                <strong>฿48,250</strong>
                                <small>+18.6% this month</small>
                            </div>

                            <div className="dashboard-chart">
                                <div className="chart-grid grid-one"></div>
                                <div className="chart-grid grid-two"></div>
                                <div className="chart-grid grid-three"></div>

                                <svg viewBox="0 0 500 180" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopOpacity="0.35" />
                                            <stop offset="100%" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        className="chart-area"
                                        d="M0,140 C40,130 55,115 90,120 C125,125 140,95 175,105 C210,115 230,70 260,85 C295,100 310,55 345,65 C380,75 395,35 425,48 C450,58 470,25 500,35 L500,180 L0,180 Z"
                                    />
                                    <path
                                        className="chart-line"
                                        d="M0,140 C40,130 55,115 90,120 C125,125 140,95 175,105 C210,115 230,70 260,85 C295,100 310,55 345,65 C380,75 395,35 425,48 C450,58 470,25 500,35"
                                    />
                                </svg>
                            </div>

                            <div className="dashboard-bottom">
                                <div className="dashboard-stat">
                                    <div className="stat-icon">฿</div>
                                    <div>
                                        <span>Revenue</span>
                                        <strong>32,850</strong>
                                    </div>
                                </div>
                                <div className="dashboard-stat">
                                    <div className="stat-icon">#</div>
                                    <div>
                                        <span>Orders</span>
                                        <strong>128</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Cards */}
                        <div className="floating-card floating-sale">
                            <div className="floating-icon">✓</div>
                            <div>
                                <span>New Sale</span>
                                <strong>+฿1,250</strong>
                            </div>
                        </div>

                        <div className="floating-card floating-product">
                            <div className="floating-product-icon">📦</div>
                            <div>
                                <span>Products</span>
                                <strong>248 Items</strong>
                            </div>
                        </div>

                        <div className="floating-coin coin-one">฿</div>
                        <div className="floating-coin coin-two">+</div>
                    </div>
                </section>

                {/* ==================================================
                    FEATURES
                ================================================== */}
                <section id="features" className="home-features">
                    <div className="section-heading">
                        <span>POWERFUL & SIMPLE</span>
                        <h2>ทุกอย่างที่คุณต้องการ</h2>
                        <p>เครื่องมือที่ช่วยให้การจัดการร้าน เป็นเรื่องง่าย</p>
                    </div>

                    <div className="feature-grid">
                        <div className="feature-card">
                            <div className="feature-icon">฿</div>
                            <h3>บันทึกการขาย</h3>
                            <p>บันทึกรายการขายและยอดเงิน ได้อย่างเป็นระบบ</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📦</div>
                            <h3>จัดการสินค้า</h3>
                            <p>ตรวจสอบสินค้า เจ้าของสินค้า และสถานะสินค้าได้ง่าย</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">👥</div>
                            <h3>จัดการลูกค้า</h3>
                            <p>เก็บข้อมูลลูกค้าและประวัติ การซื้อไว้ในที่เดียว</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">◴</div>
                            <h3>ดูประวัติ</h3>
                            <p>ตรวจสอบรายการขายย้อนหลัง และติดตามข้อมูลได้ตลอดเวลา</p>
                        </div>
                    </div>
                </section>

                {/* ==================================================
                    ABOUT
                ================================================== */}
                <section id="about" className="home-about">
                    <div className="about-card">
                        <div className="about-icon">PROMPHENG</div>
                        <div className="about-content">
                            <span>PROMPHENG</span>
                            <h2>ระบบ <br />สำหรับธุรกิจที่จริงจัง</h2>
                            <p>ออกแบบมาเพื่อช่วยให้การขาย และการจัดการข้อมูลหลังบ้าน เป็นเรื่องที่ง่ายและไม่ซับซ้อน</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* ==================================================
                FOOTER
            ================================================== */}
            {/* <footer className="home-footer">
                <div>© {new Date().getFullYear()} PROMPHENG</div>
                <div>Sales Management System</div>
            </footer> */}
        </div>
    )
}

export default Home
