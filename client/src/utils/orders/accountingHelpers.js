// ======================================================
// ORDER HELPERS
// ======================================================
// รวม Helper Functions ที่ใช้ใน Orders
//
// หน้าที่ของไฟล์นี้:
// - แปลงค่าตัวเลข
// - จัดรูปแบบจำนวนเงิน
// - จัดรูปแบบวันที่
// - คำนวณช่วงเวลา
// - ตรวจสอบว่าวันที่อยู่ในช่วงที่กำหนดหรือไม่
//
// ไม่มี React / API / State อยู่ในไฟล์นี้
// ======================================================


// ======================================================
// NUMBER
// ======================================================

export function num(value) {

    const n = Number(value);

    return Number.isFinite(n)
        ? n
        : 0;

}


// ======================================================
// MONEY
// ======================================================

export function money(value) {

    return num(value).toLocaleString(
        "th-TH",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

}


// ======================================================
// FORMAT DATE
// ======================================================

export function formatDate(date) {

    if (!date) {
        return "-";
    }

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
        return "-";
    }

    return d.toLocaleDateString(
        "th-TH",
        {
            timeZone: "Asia/Bangkok",
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


// ======================================================
// FORMAT DATE + TIME
// ======================================================

export function formatDateTime(date) {

    if (!date) {
        return "-";
    }

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
        return "-";
    }

    return d.toLocaleString(
        "th-TH",
        {
            timeZone: "Asia/Bangkok",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ======================================================
// START OF DAY
// ======================================================

export function getStartOfDay(date = new Date()) {

    const d = new Date(date);

    d.setHours(
        0,
        0,
        0,
        0
    );

    return d;

}


// ======================================================
// END OF DAY
// ======================================================

export function getEndOfDay(date = new Date()) {

    const d = new Date(date);

    d.setHours(
        23,
        59,
        59,
        999
    );

    return d;

}


// ======================================================
// GET MONDAY
// ======================================================
// คืนค่าวันจันทร์ของสัปดาห์ปัจจุบัน
// ======================================================

export function getMonday(date = new Date()) {

    const d = getStartOfDay(date);

    const day = d.getDay();

    const diff =
        day === 0
            ? -6
            : 1 - day;

    d.setDate(
        d.getDate() + diff
    );

    return d;

}


// ======================================================
// GET PERIOD RANGE
// ======================================================
//
// รองรับ:
//
// TODAY
// WEEK
// MONTH
// YEAR
//
// ======================================================

export function getPeriodRange(period) {

    const now = new Date();

    let start;
    let end;


    switch (period) {


        // ----------------------------------------------
        // TODAY
        // ----------------------------------------------

        case "TODAY":

            start =
                getStartOfDay(now);

            end =
                getEndOfDay(now);

            break;


        // ----------------------------------------------
        // THIS WEEK
        // ----------------------------------------------

        case "WEEK":

            start =
                getMonday(now);

            end =
                getEndOfDay(now);

            break;


        // ----------------------------------------------
        // THIS MONTH
        // ----------------------------------------------

        case "MONTH":

            start = new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

            end = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0,
                23,
                59,
                59,
                999
            );

            break;


        // ----------------------------------------------
        // THIS YEAR
        // ----------------------------------------------

        case "YEAR":

            start = new Date(
                now.getFullYear(),
                0,
                1
            );

            end = new Date(
                now.getFullYear(),
                11,
                31,
                23,
                59,
                59,
                999
            );

            break;


        // ----------------------------------------------
        // DEFAULT
        // ----------------------------------------------

        default:

            start =
                getStartOfDay(now);

            end =
                getEndOfDay(now);

            break;

    }


    return {
        start,
        end
    };

}


// ======================================================
// DATE IN RANGE
// ======================================================

export function dateInRange(
    date,
    start,
    end
) {

    if (!date || !start || !end) {
        return false;
    }

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
        return false;
    }

    return (
        d >= start &&
        d <= end
    );

}


// ======================================================
// GET CUSTOM PERIOD RANGE
// ======================================================

export function getCustomPeriodRange(
    startDate,
    endDate
) {

    if (!startDate || !endDate) {
        return null;
    }


    const start =
        getStartOfDay(
            new Date(startDate)
        );


    const end =
        getEndOfDay(
            new Date(endDate)
        );


    return {
        start,
        end
    };

}


// ======================================================
// PERIOD LABEL
// ======================================================

export function getPeriodLabel(period) {

    switch (period) {

        case "TODAY":
            return "Today";

        case "WEEK":
            return "This Week";

        case "MONTH":
            return "This Month";

        case "YEAR":
            return "This Year";

        case "CUSTOM":
            return "Custom Range";

        default:
            return "Today";

    }

}


// ======================================================
// ESCAPE HTML
// ======================================================

export function escapeHtml(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
