// ======================================================
// PRODUCT HELPERS
// ======================================================


// ======================================================
// NUMBER
// ======================================================

export function safeNumber(value) {

    const result = Number(value)

    return Number.isFinite(result)
        ? result
        : 0
}


// ======================================================
// NUMBER FORMAT
// ======================================================

export function number(value) {

    return new Intl.NumberFormat(
        "th-TH"
    ).format(
        safeNumber(value)
    )
}


// ======================================================
// MONEY FORMAT
// ======================================================

export function money(value) {

    return new Intl.NumberFormat(
        "th-TH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(
        safeNumber(value)
    )
}


// ======================================================
// PRODUCT ID
// ======================================================

export function getProductId(product) {

    if (!product) {
        return null
    }

    const ids = [
        product?.id,
        product?.consignmentItemId,
        product?.consignmentItem?.id,
        product?.stockId,
        product?.stock?.id,
        product?.productId,
        product?.product?.id
    ]

    for (const id of ids) {

        if (
            id !== null &&
            id !== undefined &&
            id !== ""
        ) {
            return id
        }
    }

    return null
}


// ======================================================
// PRODUCT QUANTITY
// ======================================================

export function getQuantity(product) {

    const value =
        product?.quantity ??
        product?.stockQuantity ??
        0

    return Math.max(
        0,
        safeNumber(value)
    )
}


// ======================================================
// PRODUCT COST
// ======================================================

export function getCost(product) {

    const value =
        product?.costPrice ??
        product?.cost ??
        0

    return Math.max(
        0,
        safeNumber(value)
    )
}


// ======================================================
// PRODUCT SALE PRICE
// ======================================================

export function getSalePrice(product) {

    if (
        product?.salePrice === null ||
        product?.salePrice === undefined ||
        product?.salePrice === ""
    ) {
        return null
    }

    const price =
        safeNumber(
            product.salePrice
        )

    return Math.max(
        0,
        price
    )
}


// ======================================================
// STATUS
// ======================================================

export function normalizeStatus(product) {

    return String(
        product?.status || ""
    ).toUpperCase()
}


// ======================================================
// SOLD
// ======================================================

export function isSold(product) {

    return (
        normalizeStatus(product) ===
        "SOLD"
    )
}


// ======================================================
// CANCELLED
// ======================================================

export function isCancelled(product) {

    return (
        normalizeStatus(product) ===
        "CANCELLED"
    )
}


// ======================================================
// STOCK PRODUCT
// ======================================================

export function isStockProduct(product) {

    const status =
        normalizeStatus(product)

    return (
        status !== "SOLD" &&
        status !== "CANCELLED"
    )
}


// ======================================================
// STATUS CONFIG
// ======================================================

export const STATUS_CONFIG = {

    AVAILABLE: {
        label: "มีสินค้า",
        className: "status-available"
    },

    SOLD: {
        label: "ขายแล้ว",
        className: "status-sold"
    },

    CANCELLED: {
        label: "ยกเลิก",
        className: "status-cancelled"
    },

    OUT_OF_STOCK: {
        label: "หมดสต็อก",
        className: "status-out"
    }
}


// ======================================================
// STATUS BADGE CONFIG
// ======================================================

export function getStatusBadgeConfig(status) {

    const normalized =
        String(
            status || ""
        ).toUpperCase()

    return (
        STATUS_CONFIG[normalized] || {
            label: status || "-",
            className: "status-default"
        }
    )
}


// ======================================================
// DEFAULT EXPORT
// ======================================================

export default {

    safeNumber,

    number,

    money,

    getProductId,

    getQuantity,

    getCost,

    getSalePrice,

    normalizeStatus,

    isSold,

    isCancelled,

    isStockProduct,

    STATUS_CONFIG,

    getStatusBadgeConfig
}