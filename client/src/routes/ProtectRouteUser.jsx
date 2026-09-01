import React, { useEffect } from "react"
import { Navigate, Outlet } from "react-router-dom"

import useAuthStore from "../store/auth-store"


const ProtectRouteUser = () => {

    const user =
        useAuthStore(
            (state) => state.user
        )

    const initialized =
        useAuthStore(
            (state) => state.initialized
        )

    const loading =
        useAuthStore(
            (state) => state.loading
        )

    const initializeAuth =
        useAuthStore(
            (state) => state.initializeAuth
        )


    // ==================================================
    // INITIALIZE AUTH
    // ==================================================

    useEffect(() => {

        if (!initialized) {

            initializeAuth()

        }

    }, [
        initialized,
        initializeAuth
    ])


    // ==================================================
    // WAIT FOR AUTH INITIALIZATION
    // ==================================================

    if (!initialized || loading) {

        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px"
                }}
            >
                Loading...
            </div>
        )

    }


    // ==================================================
    // NOT AUTHENTICATED
    // ==================================================

    if (!user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        )

    }


    // ==================================================
    // AUTHENTICATED
    // ==================================================

    return (
        <Outlet />
    )

}


export default ProtectRouteUser