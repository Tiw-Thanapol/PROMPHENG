import React, { useEffect } from "react"
import { Navigate, Outlet } from "react-router-dom"

import useAuthStore from "../store/auth-store"
import LoadingToRedirect from "./LoadingToRedirect"


const ProtectRouteAdmin = () => {

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

    if (
        loading ||
        !initialized
    ) {

        return (
            <LoadingToRedirect />
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
    // CHECK ROLE
    // ==================================================

    const role =
        String(
            user.role || ""
        ).toUpperCase()


    const isAdmin =
        role === "ADMIN" ||
        role === "OWNER"


    // ==================================================
    // NOT AUTHORIZED
    // ==================================================

    if (!isAdmin) {

        return (
            <Navigate
                to="/"
                replace
            />
        )

    }


    // ==================================================
    // AUTHORIZED
    // ==================================================

    return (
        <Outlet />
    )

}


export default ProtectRouteAdmin
