import {
    Menu,
    Bell,
    LogOut
} from "lucide-react"


import {
    useNavigate
} from "react-router-dom"


import {
    useEffect,
    useState
} from "react"


import CuteConfirm from "./CuteConfirm"


import useAuthStore from "../store/auth-store"


import "../styles/Navbar.css"



function Navbar({

    toggleSidebar

}) {


    const navigate =
        useNavigate()



    // ==================================================
    // AUTH STORE
    // ==================================================

    const user =
        useAuthStore(
            (state) => state.user
        )


    const logout =
        useAuthStore(
            (state) => state.logout
        )


    const loading =
        useAuthStore(
            (state) => state.loading
        )



    // ==================================================
    // LOCAL STATE
    // ==================================================

    const [
        showLogoutConfirm,
        setShowLogoutConfirm
    ] = useState(false)



    // ==================================================
    // PROFILE UPDATED
    // ==================================================
    //
    // Profile page อาจมีการแก้ชื่อ / plan / avatar
    //
    // Auth store เป็น source of truth
    // ดังนั้นไม่ต้องโหลด user ใหม่จาก API
    //
    // Event นี้ยังคงรองรับไว้เพื่อให้ Navbar
    // re-render เมื่อ Profile page แจ้ง update
    //
    // ==================================================

    const [
        profileVersion,
        setProfileVersion
    ] = useState(0)


    useEffect(() => {

        const handleProfileUpdated = () => {

            setProfileVersion(
                (version) => version + 1
            )

        }


        window.addEventListener(
            "profileUpdated",
            handleProfileUpdated
        )


        return () => {

            window.removeEventListener(
                "profileUpdated",
                handleProfileUpdated
            )

        }

    }, [])



    // ==================================================
    // LOGOUT
    // ==================================================

    async function handleLogout() {

        try {

            await logout()

        }
        finally {

            setShowLogoutConfirm(false)

            navigate(
                "/",
                {
                    replace: true
                }
            )

        }

    }



    // ==================================================
    // PLAN CONFIG
    // ==================================================

    const planConfig = {

        free: {
            label: "FREE",
            icon: "🐣"
        },

        silver: {
            label: "SILVER",
            icon: "🐰"
        },

        gold: {
            label: "GOLD",
            icon: "🦄"
        }

    }



    const currentPlan =
        (
            user?.plan ||
            "free"
        ).toLowerCase()



    const planInfo =
        planConfig[currentPlan] ||
        planConfig.free



    // ==================================================
    // RENDER
    // ==================================================

    return (

        <header className="navbar">


            {/* ==================================================
                LEFT
            ================================================== */}

            <div className="navbar-left">


                <button
                    className="navbar-menu-btn"
                    onClick={toggleSidebar}
                >

                    <Menu size={26} />

                </button>



                <div className="navbar-brand">


                    <div className="home-logo-icon">
                        <img
                            src="/PROMPHENG.png"
                            alt="PROMPHENG logo"

                        />
                    </div>



                    <div className="navbar-title">

                        <h1>
                            PROMPHENG
                        </h1>


                        <span>
                            พร้อมขาย พร้อมจัดการ พร้อมเติบโต
                        </span>

                    </div>


                </div>


            </div>



            {/* ==================================================
                RIGHT
            ================================================== */}

            <div className="navbar-right">


                {/* ==================================================
                    NOTIFICATION
                ================================================== */}

                <button
                    className="navbar-icon-btn"
                >

                    <Bell size={21} />

                    <span
                        className="notification-dot"
                    />

                </button>



                {/* ==================================================
                    PLAN
                ================================================== */}

                <button
                    className={`navbar-plan-badge plan-${currentPlan}`}
                    onClick={() =>
                        navigate(
                            "/subscription"
                        )
                    }
                >

                    <span className="plan-icon">

                        {planInfo.icon}

                    </span>


                    <span className="plan-label">

                        {planInfo.label}

                    </span>

                </button>



                {/* ==================================================
                    LOGOUT
                ================================================== */}

                <button
                    className="navbar-logout"
                    onClick={() =>
                        setShowLogoutConfirm(true)
                    }
                    disabled={loading}
                >

                    <LogOut size={18} />

                    <span>
                        {loading
                            ? "Logging out..."
                            : "Logout"
                        }
                    </span>

                </button>


            </div>



            {/* ==================================================
                LOGOUT CONFIRM
            ================================================== */}

            <CuteConfirm

                show={
                    showLogoutConfirm
                }


                title="จะออกจากระบบเหรอ?"


                message="เมื่อออกจากระบบแล้ว จะกลับไปที่หน้า Home ✨"


                confirmText="ออกจากระบบ"


                cancelText="อยู่ต่อ"


                onCancel={() =>
                    setShowLogoutConfirm(false)
                }


                onConfirm={
                    handleLogout
                }

            />


        </header>

    )

}


export default Navbar
