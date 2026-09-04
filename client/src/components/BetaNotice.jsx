import React, {
    useEffect,
    useState
} from "react";

import {
    Sparkles,
    Rocket,
    X
} from "lucide-react";

import "../styles/BetaNotice.css";


// ======================================================
// CONFIG
// ======================================================

const STORAGE_KEY =
    "prompheng_beta_notice_seen";

const VERSION =
    "v0.1.0-beta";


// ======================================================
// COMPONENT
// ======================================================

export default function BetaNotice() {

    const [open, setOpen] =
        useState(false);


    // ==================================================
    // CHECK FIRST VISIT
    // ==================================================

    useEffect(() => {

        try {

            const alreadySeen =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (alreadySeen !== "true") {

                setOpen(true);

            }

        } catch (error) {

            // ถ้า localStorage ใช้งานไม่ได้
            // ไม่ให้ Popup ทำให้ระบบพัง

            console.error(
                "Beta Notice Storage Error:",
                error
            );

            setOpen(true);

        }

    }, []);


    // ==================================================
    // CLOSE
    // ==================================================

    function handleClose() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                "true"
            );

        } catch (error) {

            console.error(
                "Beta Notice Save Error:",
                error
            );

        }

        setOpen(false);

    }


    // ==================================================
    // ESC
    // ==================================================

    useEffect(() => {

        if (!open) {
            return;
        }

        function handleKeyDown(event) {

            if (event.key === "Escape") {

                handleClose();

            }

        }

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {

            window.removeEventListener(
                "keydown",
                handleKeyDown
            );

        };

    }, [open]);


    // ==================================================
    // RENDER
    // ==================================================

    if (!open) {

        return null;

    }


    return (

        <div
            className="beta-notice-overlay"
            onMouseDown={event => {

                if (
                    event.target ===
                    event.currentTarget
                ) {

                    handleClose();

                }

            }}
        >

            <div
                className="beta-notice-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="beta-notice-title"
            >

                {/* ======================================
                    CLOSE
                ====================================== */}

                <button
                    type="button"
                    className="beta-notice-close"
                    onClick={handleClose}
                    aria-label="ปิด"
                >

                    <X size={20} />

                </button>


                {/* ======================================
                    ICON
                ====================================== */}

                <div className="beta-notice-icon">

                    <div className="beta-notice-icon-main">

                        <Rocket size={30} />

                    </div>

                    <span className="beta-notice-sparkle sparkle-one">
                        ✦
                    </span>

                    <span className="beta-notice-sparkle sparkle-two">
                        ✧
                    </span>

                </div>


                {/* ======================================
                    VERSION
                ====================================== */}

                <div className="beta-notice-version">

                    <Sparkles size={14} />

                    {VERSION}

                </div>


                {/* ======================================
                    CONTENT
                ====================================== */}

                <div className="beta-notice-content">

                    <h2 id="beta-notice-title">

                        🎉 พร้อมเฮง เปิด Beta แล้ว!

                    </h2>

                    <p className="beta-notice-lead">

                        ขอบคุณที่เข้ามาทดลองใช้งาน
                        พร้อมเฮง

                    </p>

                    <p>

                        ตอนนี้ระบบอยู่ในช่วง
                        <strong> Beta </strong>
                        เพื่อให้เราได้ทดสอบการใช้งานจริง
                        และปรับปรุงระบบให้ดีขึ้นก่อนเปิดให้บริการเต็มรูปแบบ

                    </p>


                    {/* ==================================
                        INFO
                    ================================== */}

                    <div className="beta-notice-info">

                        <div className="beta-notice-info-item">

                            <span className="beta-notice-info-icon">
                                🧪
                            </span>

                            <div>

                                <strong>
                                    ระบบยังอยู่ระหว่างพัฒนา
                                </strong>

                                <span>
                                    อาจพบข้อผิดพลาดหรือฟังก์ชันที่ยังไม่สมบูรณ์
                                </span>

                            </div>

                        </div>


                        <div className="beta-notice-info-item">

                            <span className="beta-notice-info-icon">
                                💬
                            </span>

                            <div>

                                <strong>
                                    ช่วยบอกเราได้
                                </strong>

                                <span>
                                    หากพบปัญหาหรือมีข้อเสนอแนะ
                                    สามารถแจ้งให้เราทราบได้
                                </span>

                            </div>

                        </div>


                        <div className="beta-notice-info-item">

                            <span className="beta-notice-info-icon">
                                💾
                            </span>

                            <div>

                                <strong>
                                    ข้อมูลของคุณมีความสำคัญ
                                </strong>

                                <span>
                                    กรุณาตรวจสอบข้อมูลก่อนใช้งานจริง
                                    โดยเฉพาะข้อมูลทางการเงินและรายการขาย
                                </span>

                            </div>

                        </div>

                    </div>


                    <p className="beta-notice-thanks">

                        🌸 เราจะนำ Feedback
                        จากผู้ใช้งาน Beta ไปพัฒนาพร้อมเฮงต่อไป

                    </p>

                </div>


                {/* ======================================
                    ACTION
                ====================================== */}

                <div className="beta-notice-actions">

                    <button
                        type="button"
                        className="beta-notice-button"
                        onClick={handleClose}
                    >

                        <Rocket size={18} />

                        รับทราบและเริ่มใช้งาน

                    </button>

                </div>


                {/* ======================================
                    FOOTER
                ====================================== */}

                <div className="beta-notice-footer">

                    {VERSION}

                </div>

            </div>

        </div>

    );

}