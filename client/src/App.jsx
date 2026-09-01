import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom"


// ======================================================
// PUBLIC PAGES
// ======================================================

import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import RegistrationPending from "./pages/RegistrationPending"
import VerifyEmail from "./pages/VerifyEmail"
import ForgotPassword from "./pages/ForgotPassword"


// ======================================================
// APPLICATION PAGES
// ======================================================

import Dashboard from "./pages/Dashboard"
import Products from "./pages/Products"
import Customers from "./pages/Customers"
import Orders from "./pages/Orders"
import PrintLabel from "./pages/PrintLabel"
import Manage from "./pages/Manage"
import Settings from "./pages/Settings"
import CreateSale from "./pages/CreateSale"
import FinancialOverview from "./pages/FinancialOverview"
import ProfileSetting from "./pages/ProfileSetting"


// ======================================================
// LAYOUT
// ======================================================

import MainLayout from "./layouts/MainLayout"



function App() {

    return (

        <BrowserRouter>

            <Routes>


                {/* ==================================================
                    PUBLIC
                ================================================== */}

                <Route
                    path="/"
                    element={
                        <Home />
                    }
                />


                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />


                <Route
                    path="/forgot-password"
                    element={
                        <ForgotPassword />
                    }
                />


                {/* ==================================================
                    REGISTER

                    สมัครสมาชิกสำเร็จแล้ว
                    Register จะ navigate ไป
                    /registration-pending
                ================================================== */}

                <Route
                    path="/register"
                    element={
                        <Register />
                    }
                />


                {/* ==================================================
                    REGISTRATION PENDING

                    หน้านี้แสดงหลังสมัครสมาชิกสำเร็จ

                    ไม่เข้า Dashboard
                    ไม่เข้า Login อัตโนมัติ

                    แจ้งให้ผู้ใช้ตรวจสอบ Email
                ================================================== */}

                <Route
                    path="/registration-pending"
                    element={
                        <RegistrationPending />
                    }
                />


                {/* ==================================================
                    VERIFY EMAIL

                    หน้าที่ผู้ใช้เข้ามาจากลิงก์ใน Email

                    ตัวอย่าง:

                    /verify-email?token=xxxxxxxx
                ================================================== */}

                <Route
                    path="/verify-email"
                    element={
                        <VerifyEmail />
                    }
                />


                {/* ==================================================
                    CREATE SALE

                    ไม่มี Sidebar
                ================================================== */}

                <Route
                    path="/sale/create"
                    element={
                        <CreateSale />
                    }
                />


                {/* ==================================================
                    APPLICATION
                    มี MainLayout / Sidebar
                ================================================== */}

                <Route
                    element={
                        <MainLayout />
                    }
                >


                    {/* ==================================================
                        DASHBOARD
                    ================================================== */}

                    <Route
                        path="/dashboard"
                        element={
                            <Dashboard />
                        }
                    />


                    {/* ==================================================
                        ORDERS
                    ================================================== */}

                    <Route
                        path="/orders"
                        element={
                            <Orders />
                        }
                    />


                    {/* ==================================================
                        PRODUCTS
                    ================================================== */}

                    <Route
                        path="/products"
                        element={
                            <Products />
                        }
                    />


                    {/* ==================================================
                        CUSTOMERS
                    ================================================== */}

                    <Route
                        path="/customers"
                        element={
                            <Customers />
                        }
                    />


                    {/* ==================================================
                        PRINT LABEL
                    ================================================== */}

                    <Route
                        path="/print-label"
                        element={
                            <PrintLabel />
                        }
                    />


                    {/* ==================================================
                        FINANCIAL OVERVIEW
                    ================================================== */}

                    <Route
                        path="/FinancialOverview"
                        element={
                            <FinancialOverview />
                        }
                    />


                    {/* ==================================================
                        SETTINGS
                    ================================================== */}

                    <Route
                        path="/settings"
                        element={
                            <Settings />
                        }
                    />


                    {/* ==================================================
                        USER PROFILE SETTING
                    ================================================== */}

                    <Route
                        path="/settings/profile"
                        element={
                            <ProfileSetting />
                        }
                    />


                    {/* ==================================================
                        MANAGE

                        เก็บไว้เผื่อมีการใช้งานในระบบเดิม
                    ================================================== */}

                    <Route
                        path="/manage"
                        element={
                            <Manage />
                        }
                    />


                </Route>


                {/* ==================================================
                    NOT FOUND
                ================================================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />


            </Routes>

        </BrowserRouter>

    )

}


export default App