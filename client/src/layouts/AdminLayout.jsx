import { Outlet } from "react-router-dom"
import { useState } from "react"

import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"



function AdminLayout() {


    // ==================================================
    // SIDEBAR STATE
    // ==================================================

    const [
        sidebarOpen,
        setSidebarOpen
    ] = useState(false)



    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div className="main-layout">


            {/* ==================================================
                NAVBAR
            ================================================== */}

            <Navbar

                toggleSidebar={() =>
                    setSidebarOpen(true)
                }

            />



            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <Sidebar

                open={sidebarOpen}

                close={() =>
                    setSidebarOpen(false)
                }

            />



            {/* ==================================================
                CONTENT
            ================================================== */}

            <main className="main-content">

                <Outlet />

            </main>


        </div>

    )

}


export default AdminLayout
