// ======================================================
// DATE HELPERS
// ======================================================

const BANGKOK_TIMEZONE = "Asia/Bangkok"


// ======================================================
// THAI DATE
// ======================================================

export function getThaiDateString(
    date = new Date()
) {

    const current =
        date instanceof Date
            ? date
            : new Date(date)

    if (
        Number.isNaN(
            current.getTime()
        )
    ) {
        return ""
    }

    return new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone: BANGKOK_TIMEZONE,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    ).format(current)
}


// ======================================================
// THAI DATE INPUT VALUE
// ======================================================

export function getThaiDateInputValue(
    value
) {

    if (!value) {
        return ""
    }

    const text =
        String(value)

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            text
        )
    ) {
        return text
    }

    const date =
        new Date(value)

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return ""
    }

    return getThaiDateString(
        date
    )
}


// ======================================================
// FORMAT DATE
// ======================================================

export function formatDate(
    value
) {

    if (!value) {
        return "-"
    }

    const text =
        String(value)

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            text
        )
    ) {

        const [
            year,
            month,
            day
        ] =
            text.split("-")

        return (
            `${day}/${month}/${Number(year) + 543}`
        )
    }

    const date =
        new Date(value)

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-"
    }

    return new Intl.DateTimeFormat(
        "th-TH",
        {
            timeZone: BANGKOK_TIMEZONE,
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(date)
}


// ======================================================
// FORMAT DATE TIME
// ======================================================

export function formatDateTime(
    value
) {

    if (!value) {
        return "-"
    }

    const date =
        new Date(value)

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-"
    }

    return new Intl.DateTimeFormat(
        "th-TH",
        {
            timeZone: BANGKOK_TIMEZONE,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }
    ).format(date)
}


// ======================================================
// DEFAULT EXPORT
// ======================================================

export default {
    getThaiDateString,
    getThaiDateInputValue,
    formatDate,
    formatDateTime
}