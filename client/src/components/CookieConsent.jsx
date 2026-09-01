import React, {
    useEffect,
    useState
} from "react";

import {
    Cookie,
    Settings2,
    X
} from "lucide-react";

import "../styles/CookieConsent.css";


// ======================================================
// COOKIE CONSENT
// ======================================================
//
// ปัจจุบัน:
// - Necessary cookies = จำเป็นต่อระบบ
// - Analytics = ยังไม่เปิด
// - Marketing = ยังไม่เปิด
//
// ดังนั้นตอนนี้ component จะไม่บังคับแสดง Banner
//
// เมื่อเพิ่ม Analytics / Marketing:
// เปลี่ยน NON_ESSENTIAL_COOKIES_ENABLED = true
// แล้วระบบจะเริ่มแสดง Consent Banner
// ======================================================

const COOKIE_CONSENT_KEY =
    "sale_record_cookie_preferences";

const COOKIE_POLICY_VERSION =
    "1.0";

const NON_ESSENTIAL_COOKIES_ENABLED =
    false;


// ======================================================
// DEFAULT
// ======================================================

const DEFAULT_PREFERENCES = {
    necessary: true,
    analytics: false,
    marketing: false
};


// ======================================================
// LOAD
// ======================================================

function loadPreferences() {
    try {
        const raw =
            localStorage.getItem(
                COOKIE_CONSENT_KEY
            );

        if (!raw) {
            return null;
        }

        const parsed =
            JSON.parse(raw);

        if (
            parsed?.version !==
            COOKIE_POLICY_VERSION
        ) {
            return null;
        }

        return {
            ...DEFAULT_PREFERENCES,
            ...parsed.preferences
        };

    } catch (error) {

        console.warn(
            "Cookie preferences could not be loaded:",
            error
        );

        return null;
    }
}


// ======================================================
// SAVE
// ======================================================

function savePreferences(preferences) {

    const payload = {
        version:
            COOKIE_POLICY_VERSION,

        preferences,

        updatedAt:
            new Date().toISOString()
    };

    localStorage.setItem(
        COOKIE_CONSENT_KEY,
        JSON.stringify(payload)
    );

    window.dispatchEvent(
        new CustomEvent(
            "sale-record-cookie-preferences-changed",
            {
                detail: preferences
            }
        )
    );
}


// ======================================================
// COMPONENT
// ======================================================

export default function CookieConsent() {

    const [
        preferences,
        setPreferences
    ] = useState(null);

    const [
        showSettings,
        setShowSettings
    ] = useState(false);


    // ==================================================
    // INITIALIZE
    // ==================================================

    useEffect(() => {

        const existing =
            loadPreferences();

        if (existing) {

            setPreferences(
                existing
            );

            return;
        }

        // ----------------------------------------------
        // ถ้ายังไม่มี non-essential cookies
        // ไม่ต้องรบกวนผู้ใช้
        // ----------------------------------------------

        if (
            !NON_ESSENTIAL_COOKIES_ENABLED
        ) {

            const necessaryOnly = {
                ...DEFAULT_PREFERENCES
            };

            savePreferences(
                necessaryOnly
            );

            setPreferences(
                necessaryOnly
            );

            return;
        }

        setPreferences(null);

    }, []);


    // ==================================================
    // ACCEPT ALL
    // ==================================================

    function acceptAll() {

        const next = {
            necessary: true,
            analytics: true,
            marketing: true
        };

        savePreferences(next);

        setPreferences(next);
        setShowSettings(false);
    }


    // ==================================================
    // REJECT NON-ESSENTIAL
    // ==================================================

    function rejectNonEssential() {

        const next = {
            necessary: true,
            analytics: false,
            marketing: false
        };

        savePreferences(next);

        setPreferences(next);
        setShowSettings(false);
    }


    // ==================================================
    // SAVE SETTINGS
    // ==================================================

    function saveSettings() {

        const next = {
            necessary: true,
            analytics:
                Boolean(
                    preferences?.analytics
                ),
            marketing:
                Boolean(
                    preferences?.marketing
                )
        };

        savePreferences(next);

        setPreferences(next);
        setShowSettings(false);
    }


    // ==================================================
    // NOTHING TO SHOW
    // ==================================================

    if (
        preferences !== null
        &&
        !showSettings
    ) {
        return null;
    }


    // ==================================================
    // IF NON-ESSENTIAL DISABLED
    // ==================================================

    if (
        !NON_ESSENTIAL_COOKIES_ENABLED
    ) {
        return null;
    }


    // ==================================================
    // RENDER
    // ==================================================

    return (
        <div
            className="cookie-consent"
            role="dialog"
            aria-label="Cookie preferences"
        >

            <div className="cookie-consent-icon">
                <Cookie size={22} />
            </div>


            <div className="cookie-consent-content">

                <h3>
                    เราใช้ Cookies
                </h3>

                <p>
                    เว็บไซต์ใช้ Cookies
                    และเทคโนโลยีที่เกี่ยวข้อง
                    เพื่อให้ระบบทำงานอย่างปลอดภัย
                    วิเคราะห์การใช้งาน
                    และปรับปรุงบริการ
                </p>

                <a
                    href="/legal/cookies"
                    className="cookie-consent-policy"
                >
                    อ่านนโยบาย Cookies
                </a>

            </div>


            {!showSettings ? (

                <div className="cookie-consent-actions">

                    <button
                        type="button"
                        className="cookie-button secondary"
                        onClick={
                            rejectNonEssential
                        }
                    >
                        ปฏิเสธที่ไม่จำเป็น
                    </button>

                    <button
                        type="button"
                        className="cookie-button secondary"
                        onClick={() =>
                            setShowSettings(true)
                        }
                    >
                        <Settings2 size={15} />
                        ตั้งค่า
                    </button>

                    <button
                        type="button"
                        className="cookie-button primary"
                        onClick={acceptAll}
                    >
                        ยอมรับทั้งหมด
                    </button>

                </div>

            ) : (

                <div className="cookie-settings">

                    <div className="cookie-settings-header">

                        <strong>
                            ตั้งค่า Cookies
                        </strong>

                        <button
                            type="button"
                            onClick={() =>
                                setShowSettings(false)
                            }
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>

                    </div>


                    <div className="cookie-setting-row">

                        <div>
                            <strong>
                                Necessary
                            </strong>

                            <span>
                                จำเป็นต่อการทำงาน
                                และความปลอดภัยของระบบ
                            </span>
                        </div>

                        <span className="cookie-always-on">
                            เปิดตลอด
                        </span>

                    </div>


                    <label className="cookie-setting-row">

                        <div>
                            <strong>
                                Analytics
                            </strong>

                            <span>
                                ใช้เพื่อวิเคราะห์
                                การใช้งานเว็บไซต์
                            </span>
                        </div>

                        <input
                            type="checkbox"
                            checked={
                                Boolean(
                                    preferences?.analytics
                                )
                            }
                            onChange={event =>
                                setPreferences(
                                    current => ({
                                        ...DEFAULT_PREFERENCES,
                                        ...current,
                                        analytics:
                                            event.target.checked
                                    })
                                )
                            }
                        />

                    </label>


                    <label className="cookie-setting-row">

                        <div>
                            <strong>
                                Marketing
                            </strong>

                            <span>
                                ใช้สำหรับการตลาด
                                และการติดตาม
                            </span>
                        </div>

                        <input
                            type="checkbox"
                            checked={
                                Boolean(
                                    preferences?.marketing
                                )
                            }
                            onChange={event =>
                                setPreferences(
                                    current => ({
                                        ...DEFAULT_PREFERENCES,
                                        ...current,
                                        marketing:
                                            event.target.checked
                                    })
                                )
                            }
                        />

                    </label>


                    <button
                        type="button"
                        className="cookie-button primary cookie-save-button"
                        onClick={
                            saveSettings
                        }
                    >
                        บันทึกการตั้งค่า
                    </button>

                </div>

            )}

        </div>
    );
}
