
import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import axios from "axios"


const API =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";



export default function VerifyEmail() {


    const [searchParams] =
        useSearchParams()


    const navigate =
        useNavigate()


    const [status, setStatus] =
        useState("checking")


    const [message, setMessage] =
        useState(
            "กำลังตรวจสอบ Verification Token..."
        )


    const [token, setToken] =
        useState(null)


    const [loading, setLoading] =
        useState(false)



    // ======================================================
    // CHECK TOKEN
    // ======================================================

    useEffect(() => {


        const verificationToken =
            searchParams.get("token")


        // --------------------------------------------------
        // NO TOKEN
        // --------------------------------------------------

        if (!verificationToken) {

            setStatus("error")

            setMessage(
                "ไม่พบ Verification Token"
            )

            return

        }


        setToken(
            verificationToken
        )


        // --------------------------------------------------
        // IMPORTANT
        //
        // GET นี้แค่ตรวจ Token
        // ไม่มีการ Verify
        // --------------------------------------------------

        axios.get(

            `${API}/verify-email`,

            {

                params: {

                    token:
                        verificationToken

                }

            }

        )

        .then((res) => {


            console.log(
                "VERIFY TOKEN CHECK:",
                res.data
            )


            // --------------------------------------------------
            // ALREADY VERIFIED
            // --------------------------------------------------

            if (
                res.data.alreadyVerified
            ) {

                setStatus(
                    "alreadyVerified"
                )

                setMessage(
                    "Email นี้ได้รับการยืนยันแล้ว"
                )

                return

            }


            // --------------------------------------------------
            // VALID TOKEN
            // --------------------------------------------------

            if (
                res.data.valid
            ) {

                setStatus(
                    "ready"
                )

                setMessage(
                    "กรุณากดปุ่มด้านล่างเพื่อยืนยัน Email"
                )

                return

            }


            // --------------------------------------------------
            // UNKNOWN RESPONSE
            // --------------------------------------------------

            setStatus("error")

            setMessage(
                res.data.message ||
                "Verification Token ไม่ถูกต้อง"
            )


        })

        .catch((err) => {


            console.error(
                "VERIFY TOKEN CHECK ERROR:",
                err
            )


            setStatus("error")


            setMessage(

                err.response?.data?.message ||

                "ไม่สามารถตรวจสอบ Verification Token ได้"

            )

        })


    }, [searchParams])



    // ======================================================
    // VERIFY BUTTON
    // ======================================================

    const handleVerify =
        async () => {


            if (
                !token ||
                loading
            ) {

                return

            }


            setLoading(true)


            setStatus("verifying")


            setMessage(
                "กำลังยืนยัน Email..."
            )


            try {


                const res =
                    await axios.post(

                        `${API}/verify-email`,

                        {

                            token

                        }

                    )


                console.log(
                    "VERIFY EMAIL SUCCESS:",
                    res.data
                )


                setStatus(
                    "success"
                )


                setMessage(
                    "ยืนยัน Email สำเร็จแล้ว บัญชีของคุณเปิดใช้งานแล้ว"
                )


            } catch (err) {


                console.error(
                    "VERIFY EMAIL ERROR:",
                    err
                )


                setStatus(
                    "error"
                )


                setMessage(

                    err.response?.data?.message ||

                    "ไม่สามารถยืนยัน Email ได้"

                )

            } finally {

                setLoading(false)

            }

        }



    // ======================================================
    // UI
    // ======================================================

    return (

        <div
            style={{

                minHeight:
                    "100vh",

                display:
                    "flex",

                alignItems:
                    "center",

                justifyContent:
                    "center",

                padding:
                    "20px"

            }}
        >

            <div
                style={{

                    width:
                        "100%",

                    maxWidth:
                        "500px",

                    textAlign:
                        "center",

                    padding:
                        "40px",

                    borderRadius:
                        "20px",

                    background:
                        "#ffffff",

                    boxShadow:
                        "0 10px 30px rgba(0,0,0,0.08)"

                }}
            >


                {/* ==================================================
                    CHECKING
                ================================================== */}

                {status === "checking" && (

                    <>

                        <h2>
                            🔄
                        </h2>

                        <h2>
                            กำลังตรวจสอบ Email
                        </h2>

                        <p>
                            กรุณารอสักครู่...
                        </p>

                    </>

                )}



                {/* ==================================================
                    READY
                ================================================== */}

                {status === "ready" && (

                    <>

                        <h2>
                            📧
                        </h2>

                        <h2>
                            ยืนยัน Email ของคุณ
                        </h2>

                        <p>
                            {message}
                        </p>


                        <button
                            onClick={
                                handleVerify
                            }
                            disabled={
                                loading
                            }
                            style={{

                                marginTop:
                                    "20px",

                                padding:
                                    "12px 28px",

                                border:
                                    "none",

                                borderRadius:
                                    "10px",

                                cursor:
                                    "pointer",

                                fontSize:
                                    "16px"

                            }}
                        >

                            ยืนยัน Email

                        </button>

                    </>

                )}



                {/* ==================================================
                    VERIFYING
                ================================================== */}

                {status === "verifying" && (

                    <>

                        <h2>
                            🔄
                        </h2>

                        <h2>
                            กำลังยืนยัน Email...
                        </h2>

                        <p>
                            กรุณารอสักครู่
                        </p>

                    </>

                )}



                {/* ==================================================
                    SUCCESS
                ================================================== */}

                {status === "success" && (

                    <>

                        <h2>
                            ✅
                        </h2>

                        <h2>
                            ยืนยัน Email สำเร็จ
                        </h2>

                        <p>
                            {message}
                        </p>


                        <button
                            onClick={() =>
                                navigate(
                                    "/login"
                                )
                            }
                            style={{

                                marginTop:
                                    "20px",

                                padding:
                                    "12px 28px",

                                border:
                                    "none",

                                borderRadius:
                                    "10px",

                                cursor:
                                    "pointer",

                                fontSize:
                                    "16px"

                            }}
                        >

                            เข้าสู่ระบบ

                        </button>

                    </>

                )}



                {/* ==================================================
                    ALREADY VERIFIED
                ================================================== */}

                {status === "alreadyVerified" && (

                    <>

                        <h2>
                            ✅
                        </h2>

                        <h2>
                            Email ได้รับการยืนยันแล้ว
                        </h2>

                        <p>
                            {message}
                        </p>


                        <button
                            onClick={() =>
                                navigate(
                                    "/login"
                                )
                            }
                            style={{

                                marginTop:
                                    "20px",

                                padding:
                                    "12px 28px",

                                border:
                                    "none",

                                borderRadius:
                                    "10px",

                                cursor:
                                    "pointer",

                                fontSize:
                                    "16px"

                            }}
                        >

                            ไปหน้า Login

                        </button>

                    </>

                )}



                {/* ==================================================
                    ERROR
                ================================================== */}

                {status === "error" && (

                    <>

                        <h2>
                            ❌
                        </h2>

                        <h2>
                            ยืนยัน Email ไม่สำเร็จ
                        </h2>

                        <p>
                            {message}
                        </p>


                        <button
                            onClick={() =>
                                navigate(
                                    "/login"
                                )
                            }
                            style={{

                                marginTop:
                                    "20px",

                                padding:
                                    "12px 28px",

                                border:
                                    "none",

                                borderRadius:
                                    "10px",

                                cursor:
                                    "pointer",

                                fontSize:
                                    "16px"

                            }}
                        >

                            กลับหน้า Login

                        </button>

                    </>

                )}


            </div>

        </div>

    )

}
