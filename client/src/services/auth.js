import axios from "axios"



// ======================================================
// API
// ======================================================

const API =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api"



// ======================================================
// AXIOS
// ======================================================
//
// Authentication ใช้:
//
// HttpOnly Cookie
//      ↓
// Server-side Session
//
// ไม่ใช้:
// localStorage token
// Authorization: Bearer
//
// withCredentials: true
// ทำให้ Browser ส่ง Cookie ไปกับ Backend
// ======================================================

const authApi =
    axios.create({

        baseURL: API,

        withCredentials: true,

        headers: {

            "Content-Type":
                "application/json"

        }

    })



// ======================================================
// GET CURRENT USER
// ======================================================
//
// ใช้สำหรับ Profile data
//
// Authentication:
// Browser ส่ง HttpOnly Cookie อัตโนมัติ
//
// ไม่อ่าน:
// localStorage
//
// ไม่ส่ง:
// Authorization Bearer
// ======================================================

export async function getCurrentUser() {

    const res =
        await authApi.get(

            "/profile"

        )


    return res.data.user

}



// ======================================================
// UPDATE PROFILE
// name
// phoneNumber
// ======================================================

export async function updateProfile(data) {

    const res =
        await authApi.put(

            "/profile",

            {

                name:
                    data.name,

                phoneNumber:
                    data.phoneNumber

            }

        )


    return res.data.user

}



// ======================================================
// UPDATE AVATAR
// upload image -> Cloudinary
// ======================================================

export async function updateProfilePicture(
    formData
) {

    const res =
        await authApi.put(

            "/profile/avatar",

            formData,

            {

                headers: {

                    "Content-Type":
                        "multipart/form-data"

                }

            }

        )


    return res.data.user

}



// ======================================================
// UPDATE PASSWORD
// password
// ======================================================

export async function updatePassword(data) {

    const res =
        await authApi.put(

            "/profile/password",

            {

                password:
                    data.password

            }

        )


    return res.data.user

}



// ======================================================
// EXPORT API INSTANCE
// ======================================================
//
// เผื่อ component/service อื่นต้องใช้
// Axios instance ที่มี withCredentials อยู่แล้ว
//
// ======================================================

export default authApi
