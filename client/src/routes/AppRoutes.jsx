import React from "react";

import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
    Outlet
} from "react-router-dom";


// ======================================================
// LAYOUT
// ======================================================

import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";


// ======================================================
// GLOBAL
// ======================================================

import Footer from "../components/common/Footer";
import CookieConsent from "../components/CookieConsent";


// ======================================================
// PUBLIC
// ======================================================

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import RegistrationPending from "../pages/RegistrationPending";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";


// ======================================================
// LEGAL
// ======================================================

import TermsOfService from "../pages/legal/TermsOfService";
import PrivacyPolicy from "../pages/legal/PrivacyPolicy";
import CookiePolicy from "../pages/legal/CookiePolicy";


// ======================================================
// APPLICATION
// ======================================================

import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Customers from "../pages/Customers";
import Orders from "../pages/Orders";
import PrintLabel from "../pages/PrintLabel";
import Manage from "../pages/Manage";
import Settings from "../pages/Settings";
import CreateSale from "../pages/CreateSale";
import FinancialOverview from "../pages/FinancialOverview";
import ProfileSetting from "../pages/ProfileSetting";


// ======================================================
// ADMIN
// ======================================================

import Stock from "../pages/Stock";


// ======================================================
// PROTECT ROUTES
// ======================================================

import ProtectRouteUser from "./ProtectRouteUser";
import ProtectRouteAdmin from "./ProtectRouteAdmin";


// ======================================================
// ROOT LAYOUT
//
// ใช้สำหรับ Global UI
// - Cookie Consent
// - Footer
//
// ส่วน Router จะอยู่ภายใน Outlet
// ======================================================

function RootLayout() {

    return (
        <>
            <Outlet />

            <CookieConsent />

            <Footer />
        </>
    );

}


// ======================================================
// ROUTER
// ======================================================

const router = createBrowserRouter([


    // ==================================================
    // ROOT
    // ==================================================

    {
        element: (
            <RootLayout />
        ),

        children: [


            // ==========================================
            // PUBLIC
            // ==========================================

            {
                path: "/",

                element: (
                    <Home />
                )
            },


            {
                path: "/login",

                element: (
                    <Login />
                )
            },


            {
                path: "/register",

                element: (
                    <Register />
                )
            },


            {
                path: "/registration-pending",

                element: (
                    <RegistrationPending />
                )
            },


            {
                path: "/verify-email",

                element: (
                    <VerifyEmail />
                )
            },


            {
                path: "/forgot-password",

                element: (
                    <ForgotPassword />
                )
            },


            // ==========================================
            // LEGAL
            // ==========================================

            {
                path: "/terms",

                element: (
                    <TermsOfService />
                )
            },


            {
                path: "/privacy",

                element: (
                    <PrivacyPolicy />
                )
            },


            {
                path: "/cookies",

                element: (
                    <CookiePolicy />
                )
            },


            // ==========================================
            // CREATE SALE
            //
            // Protected
            // ไม่มี Sidebar / Navbar
            //
            // ProtectRouteUser ไม่รับ prop `element`
            // ต้องใช้ path บน ProtectRouteUser เอง
            // แล้วให้ CreateSale เป็น index child
            // ที่ render ผ่าน <Outlet /> ของมัน
            // ==========================================

            {
                path: "/sale/create",

                element: (
                    <ProtectRouteUser />
                ),

                children: [

                    {
                        index: true,

                        element: (
                            <CreateSale />
                        )
                    }

                ]
            },


            // ==========================================
            // USER APPLICATION
            //
            // ProtectRouteUser
            //       ↓ (Outlet)
            // MainLayout
            //       ↓ (Outlet)
            // Sidebar / Navbar / หน้า Content
            //
            // ProtectRouteUser และ MainLayout ไม่รับ
            // prop `element` — ทั้งคู่ทำงานผ่าน
            // <Outlet /> ของตัวเองเท่านั้น จึงต้อง
            // ซ้อน (nest) เป็น children แทนการส่ง prop
            // ==========================================

            {
                element: (
                    <ProtectRouteUser />
                ),

                children: [

                    {
                        element: (
                            <MainLayout />
                        ),

                        children: [


                            // ======================================
                            // DASHBOARD
                            // ======================================

                            {
                                path: "/dashboard",

                                element: (
                                    <Dashboard />
                                )
                            },


                            // ======================================
                            // ORDERS
                            // ======================================

                            {
                                path: "/orders",

                                element: (
                                    <Orders />
                                )
                            },


                            // ======================================
                            // PRODUCTS
                            // ======================================

                            {
                                path: "/products",

                                element: (
                                    <Products />
                                )
                            },


                            // ======================================
                            // CUSTOMERS
                            // ======================================

                            {
                                path: "/customers",

                                element: (
                                    <Customers />
                                )
                            },


                            // ======================================
                            // PRINT LABEL
                            // ======================================

                            {
                                path: "/print-label",

                                element: (
                                    <PrintLabel />
                                )
                            },


                            // ======================================
                            // FINANCIAL OVERVIEW
                            // ======================================

                            {
                                path: "/FinancialOverview",

                                element: (
                                    <FinancialOverview />
                                )
                            },


                            // ======================================
                            // SETTINGS
                            // ======================================

                            {
                                path: "/settings",

                                element: (
                                    <Settings />
                                )
                            },


                            // ======================================
                            // PROFILE
                            // ======================================

                            {
                                path: "/settings/profile",

                                element: (
                                    <ProfileSetting />
                                )
                            },


                            // ======================================
                            // MANAGE
                            //
                            // เดิมมีอยู่ใน App.jsx
                            // ======================================

                            {
                                path: "/manage",

                                element: (
                                    <Manage />
                                )
                            }

                        ]

                    }

                ]

            },


            // ==========================================
            // ADMIN
            //
            // ProtectRouteAdmin
            //       ↓ (Outlet)
            // AdminLayout
            //       ↓ (Outlet)
            // Sidebar / Navbar / หน้า Content
            //
            // เช่นเดียวกับ USER APPLICATION —
            // ProtectRouteAdmin ไม่รับ prop `element`
            // จึงต้อง nest AdminLayout เป็น children
            // ==========================================

            {
                path: "/admin",

                element: (
                    <ProtectRouteAdmin />
                ),

                children: [

                    {
                        element: (
                            <AdminLayout />
                        ),

                        children: [


                            // ======================================
                            // ADMIN DASHBOARD
                            // /admin
                            // ======================================

                            {
                                index: true,

                                element: (
                                    <Dashboard />
                                )
                            },


                            // ======================================
                            // MANAGE
                            // /admin/manage
                            // ======================================

                            {
                                path: "manage",

                                element: (
                                    <Manage />
                                )
                            },


                            // ======================================
                            // STOCK
                            // /admin/stock
                            // ======================================

                            {
                                path: "stock",

                                element: (
                                    <Stock />
                                )
                            },


                            // ======================================
                            // ORDERS
                            // /admin/orders
                            // ======================================

                            {
                                path: "orders",

                                element: (
                                    <Orders />
                                )
                            },


                            // ======================================
                            // PRODUCTS
                            // /admin/products
                            // ======================================

                            {
                                path: "products",

                                element: (
                                    <Products />
                                )
                            },


                            // ======================================
                            // CUSTOMERS
                            // /admin/customers
                            // ======================================

                            {
                                path: "customers",

                                element: (
                                    <Customers />
                                )
                            },


                            // ======================================
                            // FINANCIAL OVERVIEW
                            // /admin/financial-overview
                            // ======================================

                            {
                                path: "financial-overview",

                                element: (
                                    <FinancialOverview />
                                )
                            }

                        ]

                    }

                ]

            },


            // ==========================================
            // NOT FOUND
            //
            // เดิมมีอยู่ใน App.jsx
            // Path ที่ไม่ตรงกับ route ใดเลย
            // จะ redirect กลับหน้าแรก
            // ==========================================

            {
                path: "*",

                element: (
                    <Navigate
                        to="/"
                        replace
                    />
                )
            }

        ]

    }

]);


// ======================================================
// APP ROUTES
// ======================================================

function AppRoutes() {

    return (
        <RouterProvider
            router={router}
        />
    );

}


export default AppRoutes;