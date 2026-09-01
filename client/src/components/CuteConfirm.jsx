import {
    X,
    Check
} from "lucide-react";

import "../styles/CuteConfirm.css";


// ======================================================
// CUTE CONFIRM
// ======================================================

function CuteConfirm({
    show,
    title = "ยืนยันรายการ",
    message = "ต้องการทำรายการนี้หรือไม่?",
    confirmText = "ยืนยัน",
    cancelText = "ยกเลิก",
    onConfirm,
    onCancel
}) {

    // ==================================================
    // HIDDEN
    // ==================================================

    if (!show) {
        return null;
    }


    // ==================================================
    // CONFIRM
    // ==================================================

    const handleConfirm = () => {

        // เรียก callback จาก component ที่นำไปใช้
        onConfirm?.();

    };


    // ==================================================
    // CANCEL
    // ==================================================

    const handleCancel = () => {

        onCancel?.();

    };


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div
            className="cute-confirm-overlay"
            onMouseDown={(event) => {

                // คลิกพื้นที่ด้านนอก Popup
                // = ยกเลิก
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    handleCancel();
                }

            }}
        >

            <div
                className="cute-confirm-box"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cute-confirm-title"
            >


                {/* ==================================================
                    CLOSE
                ================================================== */}

                <button
                    type="button"
                    className="cute-confirm-close"
                    onClick={handleCancel}
                    aria-label="ปิด"
                >
                    <X size={18} />
                </button>


                {/* ==================================================
                    CHARACTER
                ================================================== */}

                <div className="cute-confirm-character">
                    ⁉️
                </div>


                {/* ==================================================
                    TITLE
                ================================================== */}

                <h2 id="cute-confirm-title">
                    {title}
                </h2>


                {/* ==================================================
                    MESSAGE
                ================================================== */}

                <p>
                    {message}
                </p>


                {/* ==================================================
                    ACTIONS
                ================================================== */}

                <div className="cute-confirm-actions">


                    {/* CANCEL */}

                    <button
                        type="button"
                        className="cute-confirm-cancel"
                        onClick={handleCancel}
                    >
                        {cancelText}
                    </button>


                    {/* CONFIRM */}

                    <button
                        type="button"
                        className="cute-confirm-ok"
                        onClick={handleConfirm}
                    >
                        <Check size={18} />
                        {confirmText}
                    </button>


                </div>

            </div>

        </div>

    );

}


export default CuteConfirm;