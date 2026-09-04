import React, {
    useState
} from "react"

import {
    Bug,
    Lightbulb,
    MessageCircle,
    Send,
    CheckCircle2,
    Headphones
} from "lucide-react"

import api from "../api/axios"

import "../styles/Support.css"


// ======================================================
// FEEDBACK TYPES
// ======================================================

const FEEDBACK_TYPES = [

    {
        id: "bug",

        icon:
            <Bug size={22} />,

        title:
            "แจ้งปัญหา",

        description:
            "พบข้อผิดพลาดหรือระบบทำงานไม่ถูกต้อง"

    },

    {
        id: "feature",

        icon:
            <Lightbulb size={22} />,

        title:
            "เสนอฟีเจอร์",

        description:
            "อยากให้พร้อมเฮงเพิ่มความสามารถอะไร"

    },

    {
        id: "suggestion",

        icon:
            <MessageCircle size={22} />,

        title:
            "ข้อเสนอแนะ",

        description:
            "ความคิดเห็นเกี่ยวกับการใช้งาน"

    }

]


// ======================================================
// SUPPORT PAGE
// ======================================================

export default function Support() {

    const [
        type,
        setType
    ] = useState("bug")


    const [
        message,
        setMessage
    ] = useState("")


    const [
        loading,
        setLoading
    ] = useState(false)


    const [
        success,
        setSuccess
    ] = useState(false)


    const [
        error,
        setError
    ] = useState("")


    // ==================================================
    // SUBMIT
    // ==================================================

    async function handleSubmit(e) {

        e.preventDefault()


        setError("")
        setSuccess(false)


        if (
            !message.trim()
        ) {

            setError(
                "กรุณากรอกรายละเอียด"
            )

            return

        }


        if (
            message.trim().length < 3
        ) {

            setError(
                "กรุณากรอกรายละเอียดเพิ่มเติม"
            )

            return

        }


        try {

            setLoading(true)


            await api.post(
                "/feedback",
                {

                    type,

                    message:
                        message.trim(),

                    page:
                        window.location.pathname

                }
            )


            setSuccess(true)

            setMessage("")


        } catch (err) {

            console.error(
                "FEEDBACK ERROR:",
                err
            )


            setError(

                err?.response?.data?.message ||

                "ไม่สามารถส่งข้อเสนอแนะได้ กรุณาลองใหม่อีกครั้ง"

            )

        } finally {

            setLoading(false)

        }

    }


    // ==================================================
    // SUCCESS SCREEN
    // ==================================================

    if (success) {

        return (

            <div className="support-page">

                <div className="support-card support-success">

                    <div className="support-success-icon">

                        <CheckCircle2
                            size={56}
                        />

                    </div>


                    <h1>
                        ส่งเรียบร้อยแล้ว 🎉
                    </h1>


                    <p>

                        ขอบคุณสำหรับข้อเสนอแนะ

                        <br />

                        ทุกความคิดเห็นช่วยให้
                        พร้อมเฮงพัฒนาดีขึ้น

                    </p>


                    <button
                        type="button"
                        className="support-submit"
                        onClick={() => {

                            setSuccess(false)

                            setType("bug")

                        }}
                    >

                        ส่งความคิดเห็นเพิ่มเติม

                    </button>

                </div>

            </div>

        )

    }


    // ==================================================
    // MAIN
    // ==================================================

    return (

        <div className="support-page">

            <div className="support-header">

                <div className="support-header-icon">

                    <Headphones
                        size={30}
                    />

                </div>


                <div>

                    <h1>
                        ติดต่อฝ่ายสนับสนุน
                    </h1>

                    <p>
                        แจ้งปัญหา เสนอฟีเจอร์
                        หรือส่งความคิดเห็นให้เรา
                    </p>

                </div>

            </div>


            <form
                className="support-card"
                onSubmit={handleSubmit}
            >

                <div className="support-section">

                    <h2>
                        คุณต้องการแจ้งเรื่องอะไร?
                    </h2>


                    <div className="feedback-types">

                        {
                            FEEDBACK_TYPES.map(
                                item => (

                                    <button
                                        key={item.id}
                                        type="button"
                                        className={`
                                            feedback-type
                                            ${
                                                type === item.id
                                                    ? "active"
                                                    : ""
                                            }
                                        `}
                                        onClick={() =>
                                            setType(item.id)
                                        }
                                    >

                                        <span className="feedback-type-icon">

                                            {item.icon}

                                        </span>


                                        <span className="feedback-type-content">

                                            <strong>
                                                {item.title}
                                            </strong>

                                            <small>
                                                {item.description}
                                            </small>

                                        </span>

                                    </button>

                                )
                            )

                        }

                    </div>

                </div>


                <div className="support-section">

                    <label
                        htmlFor="feedback-message"
                    >

                        รายละเอียด

                    </label>


                    <textarea
                        id="feedback-message"
                        value={message}
                        onChange={e =>
                            setMessage(
                                e.target.value
                            )
                        }
                        placeholder={
                            type === "bug"
                                ? "อธิบายปัญหาที่พบ เช่น เกิดอะไรขึ้น ทำอย่างไรจึงพบปัญหา..."
                                : type === "feature"
                                    ? "บอกเราได้เลยว่าอยากให้พร้อมเฮงเพิ่มอะไร..."
                                    : "บอกความคิดเห็นหรือสิ่งที่อยากให้เราปรับปรุง..."
                        }
                        maxLength={10000}
                        rows={8}
                        disabled={loading}
                    />


                    <div className="support-counter">

                        {message.length.toLocaleString()}

                        {" / 10,000"}

                    </div>

                </div>


                {
                    error && (

                        <div className="support-error">

                            {error}

                        </div>

                    )
                }


                <div className="support-footer">

                    <span>

                        Version v0.1.0-beta

                    </span>


                    <button
                        type="submit"
                        className="support-submit"
                        disabled={loading}
                    >

                        {
                            loading
                                ? (
                                    <>
                                        กำลังส่ง...
                                    </>
                                )
                                : (
                                    <>
                                        <Send
                                            size={18}
                                        />

                                        ส่งข้อเสนอแนะ
                                    </>
                                )
                        }

                    </button>

                </div>

            </form>

        </div>

    )

}