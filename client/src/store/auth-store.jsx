import { create } from "zustand"
import axios from "axios"


// ======================================================
// API
// ======================================================

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api"


const authApi = axios.create({

    baseURL: API_URL,

    withCredentials: true,

    headers: {

        "Content-Type":
            "application/json"

    }

})


// ======================================================
// AUTH STORE
// ======================================================

const useAuthStore = create((set, get) => ({

    // --------------------------------------------------
    // STATE
    // --------------------------------------------------

    user: null,

    loading: false,

    initialized: false,

    error: null,


    // --------------------------------------------------
    // SET USER
    // --------------------------------------------------

    setUser: (user) => {

        set({

            user,

            error: null

        })

    },


    // --------------------------------------------------
    // CLEAR ERROR
    // --------------------------------------------------

    clearError: () => {

        set({

            error: null

        })

    },


    // ==================================================
    // LOGIN
    // ==================================================

    login: async (email, password) => {

        set({

            loading: true,

            error: null

        })


        try {

            const response =
                await authApi.post(

                    "/login",

                    {

                        email,
                        password

                    }

                )


            const user =
                response.data?.user ||
                null


            set({

                user,

                loading: false,

                initialized: true,

                error: null

            })


            return {

                success: true,

                user,

                data:
                    response.data

            }


        } catch (error) {

            const message =
                error.response?.data?.message ||
                "Login failed."


            set({

                loading: false,

                error: message

            })


            throw error

        }

    },


    // ==================================================
    // CURRENT USER
    // ==================================================
    //
    // ใช้ตอนเปิดเว็บ / Refresh
    //
    // Cookie ยังอยู่
    // ↓
    // Backend ตรวจ Session
    // ↓
    // ส่ง user กลับมา
    //
    // ==================================================

    fetchCurrentUser: async () => {

        try {

            const response =
                await authApi.get(

                    "/current-user"

                )


            const user =
                response.data?.user ||
                null


            set({

                user,

                initialized: true,

                error: null

            })


            return user


        } catch (error) {

            // ------------------------------------------
            // ไม่มี Session
            // ------------------------------------------

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {

                set({

                    user: null,

                    initialized: true,

                    error: null

                })


                return null

            }


            // ------------------------------------------
            // Server Error
            // ------------------------------------------

            set({

                initialized: true,

                error:
                    error.response?.data?.message ||
                    "Could not verify authentication."

            })


            return null

        }

    },


    // ==================================================
    // INITIALIZE AUTH
    // ==================================================
    //
    // เรียกครั้งเดียวตอน App เริ่ม
    //
    // ==================================================

    initializeAuth: async () => {

        const {

            initialized,
            fetchCurrentUser

        } = get()


        if (initialized) {

            return get().user

        }


        set({

            loading: true

        })


        try {

            return await fetchCurrentUser()

        } finally {

            set({

                loading: false,

                initialized: true

            })

        }

    },


    // ==================================================
    // LOGOUT
    // ==================================================

    logout: async () => {

        set({

            loading: true,

            error: null

        })


        try {

            await authApi.post(

                "/logout"

            )

        } catch (error) {

            console.error(

                "Logout error:",

                error

            )

        } finally {

            set({

                user: null,

                loading: false,

                initialized: true,

                error: null

            })

        }

    },


    // ==================================================
    // LOGOUT ALL DEVICES
    // ==================================================

    logoutAll: async () => {

        set({

            loading: true,

            error: null

        })


        try {

            const response =
                await authApi.post(

                    "/logout-all"

                )


            set({

                user: null,

                loading: false,

                initialized: true,

                error: null

            })


            return response.data


        } catch (error) {

            const message =
                error.response?.data?.message ||
                "Could not logout from all devices."


            set({

                loading: false,

                error: message

            })


            throw error

        }

    }

}))


export default useAuthStore