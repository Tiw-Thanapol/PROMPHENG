import axios from "axios";

// ======================================================
// API CLIENT
// ======================================================
const API =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const api = axios.create({
    baseURL: API,
    // ==================================================
    // IMPORTANT
    // ==================================================
    // ใช้ HttpOnly Cookie
    // ไม่ผ่าน token จาก localStorage
    // Browser จะส่ง Cookie: session
    // ไปกับ request ให้อัตโนมัติ
    // ==================================================
    withCredentials: true
});

export default api;