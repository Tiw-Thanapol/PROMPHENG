import {
    NavLink,
    useNavigate
} from "react-router-dom"

import {
    useEffect,
    useState
} from "react"

import "../styles/Sidebar.css"

import {
    getCurrentUser
} from "../services/auth"


/* =========================================================
   DECORATIVE SVG ART
   SHARED VISUAL LANGUAGE WITH HOME
   SPACE CAT / TOY 3D
   ========================================================= */


/* =========================================================
   MOON
   ========================================================= */

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


/* =========================================================
   SPACESHIP
   ========================================================= */

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


/* =========================================================
   CAT ASTRONAUT
   ========================================================= */

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


/* =========================================================
   STAR
   ========================================================= */

function Star({ className }) {

    return (

        <div className={`sidebar-star ${className}`}>
            ✦
        </div>

    )

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function Sidebar({

    open,
    close

}) {


    const navigate = useNavigate()


    const [user, setUser] = useState(null)


    /* =====================================================
       LOAD USER
       ===================================================== */

    useEffect(() => {

        loadUser()


        window.addEventListener(
            "profileUpdated",
            loadUser
        )


        return () => {

            window.removeEventListener(
                "profileUpdated",
                loadUser
            )

        }

    }, [])


    async function loadUser() {

        try {

            const data =
                await getCurrentUser()

            setUser(data)

        }
        catch (err) {

            console.log(err)

        }

    }


    /* =====================================================
       MAIN MENU
       ===================================================== */

    const menuItems = [

        {
            path: "/dashboard",
            icon: "💰",
            label: "ภาพรวม"
        },

        {
            path: "/orders",
            icon: "🏷️",
            label: "การขาย"
        },

        {
            path: "/products",
            icon: "📦",
            label: "สินค้า"
        },

        {
            path: "/customers",
            icon: "👥",
            label: "ลูกค้า"
        },

        {
            path: "/FinancialOverview",
            icon: "📈",
            label: "ข้อมูลทางบัญชี"
        },

        {
            path: "/print-label",
            icon: "🖨️",
            label: "พิมพ์ใบปะหน้า"
        }

    ]


    /* =====================================================
       ACCOUNT MENU
       ===================================================== */

    const accountItems = [

        {
            path: "/subscription",
            icon: "💳",
            label: "แพ็กเกจของฉัน"
        },

        {
            path: "/billing-history",
            icon: "🧾",
            label: "ประวัติการชำระเงิน"
        },

        {
            path: "/settings",
            icon: "⚙️",
            label: "ตั้งค่าร้าน"
        },

        {
            path: "/support",
            icon: "💬",
            label: "ติดต่อฝ่ายสนับสนุน"
        }

    ]


    /* =====================================================
       CLOSE + NAVIGATE
       ===================================================== */

    function handleProfileClick() {

        navigate("/settings/profile")

        close()

    }


    /* =====================================================
       RENDER
       ===================================================== */

    return (

        <>

            {/* =================================================
                OVERLAY
            ================================================= */}

            <div

                className={
                    open
                        ? "sidebar-overlay show"
                        : "sidebar-overlay"
                }

                onClick={close}

            />


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside

                className={
                    open
                        ? "sidebar open"
                        : "sidebar"
                }

            >


                {/* =================================================
                    DECORATIVE BACKGROUND
                ================================================= */}

                <div className="sidebar-decorations">

                    <div className="sidebar-moon">
                        <Moon />
                    </div>


                    <div className="sidebar-ship sidebar-ship-one">

                        <Spaceship
                            gradientId="sidebarShipGradientOne"
                        />

                    </div>


                    <div className="sidebar-ship sidebar-ship-two">

                        <Spaceship
                            gradientId="sidebarShipGradientTwo"
                        />

                    </div>


                    <Star className="sidebar-star-one" />

                    <Star className="sidebar-star-two" />

                    <Star className="sidebar-star-three" />


                    <div className="sidebar-cat">

                        <CatAstronaut />

                    </div>

                </div>


                {/* =================================================
                    SIDEBAR CONTENT
                ================================================= */}

                <div className="sidebar-content">


                    {/* =================================================
                        USER PROFILE
                    ================================================= */}

                    <div

                        className="sidebar-user"

                        onClick={handleProfileClick}

                    >

                        <div className="sidebar-avatar">

                            {

                                user?.picture

                                    ?

                                    <img

                                        src={user.picture}

                                        alt="profile"

                                    />

                                    :

                                    <div className="avatar-default">

                                        👤

                                    </div>

                            }

                        </div>


                        <div className="sidebar-user-info">

                            <h3>

                                {
                                    user?.name ||
                                    "ผู้ใช้งาน"
                                }

                            </h3>


                            <span>

                                จัดการบัญชี

                            </span>

                        </div>


                        <div className="sidebar-profile-arrow">

                            ›

                        </div>

                    </div>


                    {/* =================================================
                        DIVIDER
                    ================================================= */}

                    <div className="sidebar-divider" />


                    {/* =================================================
                        MAIN MENU
                    ================================================= */}

                    <div className="sidebar-section-title">

                        เมนูหลัก

                    </div>


                    <nav className="sidebar-menu">

                        {

                            menuItems.map(item => (

                                <NavLink

                                    key={item.path}

                                    to={item.path}

                                    onClick={close}

                                    className={({ isActive }) =>

                                        isActive

                                            ?

                                            "sidebar-link active"

                                            :

                                            "sidebar-link"

                                    }

                                >

                                    <span className="sidebar-icon">

                                        {item.icon}

                                    </span>


                                    <span className="sidebar-link-text">

                                        {item.label}

                                    </span>


                                </NavLink>

                            ))

                        }

                    </nav>


                    {/* =================================================
                        DIVIDER
                    ================================================= */}

                    <div className="sidebar-divider" />


                    {/* =================================================
                        ACCOUNT
                    ================================================= */}

                    <div className="sidebar-menu-label">

                        บัญชี & สมัครสมาชิก

                    </div>


                    <nav className="sidebar-menu">

                        {

                            accountItems.map(item => (

                                <NavLink

                                    key={item.path}

                                    to={item.path}

                                    onClick={close}

                                    className={({ isActive }) =>

                                        isActive

                                            ?

                                            "sidebar-link active"

                                            :

                                            "sidebar-link"

                                    }

                                >

                                    <span className="sidebar-icon">

                                        {item.icon}

                                    </span>


                                    <span className="sidebar-link-text">

                                        {item.label}

                                    </span>


                                </NavLink>

                            ))

                        }

                    </nav>


                </div>


                {/* =================================================
                    BOTTOM MESSAGE
                ================================================= */}

                <div className="sidebar-bottom">

                    <div className="sidebar-bottom-icon">

                        ✨

                    </div>


                    <div>

                        <strong>
                            จัดการร้านให้น่ารักขึ้น
                        </strong>

                        <span>
                            Sale Record
                        </span>

                    </div>

                </div>


            </aside>

        </>

    )

}


export default Sidebar
