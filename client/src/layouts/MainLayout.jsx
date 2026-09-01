import React, {
    useState
} from "react";

import {
    Outlet
} from "react-router-dom";


// ======================================================
// COMPONENTS
// ======================================================

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";


// ======================================================
// STYLES
// ======================================================

import "../styles/MainLayout.css";


// ======================================================
// MAIN LAYOUT
// ======================================================

function MainLayout() {

    // ==================================================
    // SIDEBAR STATE
    // ==================================================

    const [
        sidebarOpen,
        setSidebarOpen
    ] = useState(false);


    // ==================================================
    // TOGGLE SIDEBAR
    // ==================================================

    function toggleSidebar() {

        setSidebarOpen(
            (prev) => !prev
        );

    }


    // ==================================================
    // CLOSE SIDEBAR
    // ==================================================

    function closeSidebar() {

        setSidebarOpen(false);

    }


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div className="app-layout">


            {/* ==================================================
                NAVBAR
            ================================================== */}

            <Navbar
                toggleSidebar={
                    toggleSidebar
                }
            />


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <Sidebar

                open={
                    sidebarOpen
                }

                close={
                    closeSidebar
                }

            />


            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <main className="app-content">

                <Outlet />

            </main>


        </div>

    );

}


export default MainLayout;
