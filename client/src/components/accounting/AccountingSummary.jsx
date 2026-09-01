import React from "react";

// ======================================================
// ACCOUNTING SUMMARY
// ======================================================

export default function AccountingSummary({
summary = {}
}) {

// ==================================================
// NORMALIZE NUMBER
// ==================================================

function toNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    const normalized =
        typeof value === "string"
            ? value.replace(/,/g, "")
            : value;

    const number =
        Number(normalized);

    return Number.isFinite(number)
        ? number
        : 0;

}


// ==================================================
// MONEY
// ==================================================

function money(value) {

    return toNumber(value)
        .toLocaleString(
            "th-TH",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );

}


// ==================================================
// DATA
// ==================================================

const income =
    toNumber(
        summary?.income
    );

const expense =
    toNumber(
        summary?.expense
    );

const net =
    toNumber(
        summary?.net
    );


// ==================================================
// RENDER
// ==================================================

return (

    <section
        className="accounting-summary"
        aria-label="Accounting Summary"
    >

        {/* ==========================================
            INCOME
        ========================================== */}

        <div className="accounting-summary-card income">

            <div className="accounting-summary-card-content">

                <span>
                    รายรับรวม
                </span>

                <strong>
                    ฿{money(income)}
                </strong>

            </div>

        </div>


        {/* ==========================================
            EXPENSE
        ========================================== */}

        <div className="accounting-summary-card expense">

            <div className="accounting-summary-card-content">

                <span>
                    รายจ่ายรวม
                </span>

                <strong>
                    ฿{money(expense)}
                </strong>

            </div>

        </div>


        {/* ==========================================
            NET BALANCE
        ========================================== */}

        <div className="accounting-summary-card balance">

            <div className="accounting-summary-card-content">

                <span>
                    คงเหลือสุทธิ
                </span>

                <strong>
                    ฿{money(net)}
                </strong>

            </div>

        </div>

    </section>

);

}