import {
    useCallback,
    useMemo,
    useState
} from "react"

import api from "../api/axios"

import {
    safeNumber
} from "../utils/productHelpers"

import {
    getThaiDateString
} from "../utils/dateHelpers"


// ======================================================
// USE PRODUCT BULK
// ======================================================
//
// รับผิดชอบ:
// - Bulk text input
// - Parse bulk products
// - Bulk preview
// - Invalid rows
// - Duplicate product validation
// - Update quantity
// - Remove preview item
// - Clear bulk
// - Bulk add products
//
// Duplicate rule:
// - ชื่อสินค้า + ราคาทุนเท่ากัน = สินค้าซ้ำ
// - ชื่อเหมือนกัน แต่ราคาทุนต่างกัน = เพิ่มได้
//
// ======================================================

export default function useProductBulk({

    setProducts,
    setError,
    setShowAddModal,
    setEditingProduct,
    resetForm,
    loadProducts,
    products = []

}) {

    // ==================================================
    // STATE
    // ==================================================

    const [
        bulkText,
        setBulkText
    ] = useState("")


    const [
        bulkPreview,
        setBulkPreview
    ] = useState([])


    const [
        bulkInvalid,
        setBulkInvalid
    ] = useState([])


    const [
        savingBulk,
        setSavingBulk
    ] = useState(false)


    // ==================================================
    // NORMALIZE PRODUCT NAME
    // ==================================================

    const normalizeProductName =
        useCallback(
            value => {

                return String(
                    value ?? ""
                )
                    .trim()
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .toLowerCase()

            },
            []
        )


    // ==================================================
    // CREATE DUPLICATE KEY
    // ==================================================

    const getDuplicateKey =
        useCallback(
            (
                name,
                costPrice
            ) => {

                const normalizedName =
                    normalizeProductName(
                        name
                    )

                const normalizedCost =
                    safeNumber(
                        costPrice
                    )


                return (
                    `${normalizedName}::${normalizedCost}`
                )

            },
            [
                normalizeProductName
            ]
        )


    // ==================================================
    // RESET BULK
    // ==================================================

    const resetBulk =
        useCallback(
            () => {

                setBulkText("")

                setBulkPreview([])

                setBulkInvalid([])

            },
            []
        )


    // ==================================================
    // PARSE BULK
    // ==================================================
    //
    // Format:
    //
    // Product Name 100
    // Product Name 250.50
    //
    // Last numeric value = costPrice
    // Quantity starts at 1
    //
    // ==================================================

    const handleParseBulk =
        useCallback(
            () => {

                const lines =
                    String(
                        bulkText || ""
                    )
                        .split(
                            /\r?\n/
                        )
                        .map(
                            (
                                text,
                                index
                            ) => ({

                                text:
                                    text.trim(),

                                lineNumber:
                                    index + 1

                            })
                        )
                        .filter(
                            item =>
                                item.text.length > 0
                        )


                const preview = []

                const invalid = []

                const duplicateKeys =
                    new Set()


                // ==================================================
                // EXISTING PRODUCTS
                // ==================================================

                const existingProductKeys =
                    new Set(

                        Array.isArray(
                            products
                        )

                            ? products
                                .map(
                                    product => {

                                        const name =
                                            product?.name ??
                                            ""

                                        const costPrice =
                                            product?.costPrice ??
                                            product?.cost ??
                                            0


                                        return getDuplicateKey(
                                            name,
                                            costPrice
                                        )

                                    }
                                )
                                .filter(
                                    key =>
                                        !key.startsWith(
                                            "::"
                                        )
                                )

                            : []

                    )


                // ==================================================
                // PARSE EACH LINE
                // ==================================================

                lines.forEach(
                    item => {

                        const match =
                            item.text.match(
                                /^(.+?)\s+(\d+(?:\.\d+)?)$/
                            )


                        // ------------------------------------------
                        // INVALID FORMAT
                        // ------------------------------------------

                        if (!match) {

                            invalid.push({

                                ...item,

                                reason:
                                    "รูปแบบไม่ถูกต้อง"

                            })

                            return

                        }


                        const name =
                            match[1].trim()


                        const costPrice =
                            Number(
                                match[2]
                            )


                        // ------------------------------------------
                        // INVALID VALUE
                        // ------------------------------------------

                        if (

                            !name ||

                            !Number.isFinite(
                                costPrice
                            ) ||

                            costPrice < 0

                        ) {

                            invalid.push({

                                ...item,

                                reason:
                                    "ชื่อสินค้าหรือราคาทุนไม่ถูกต้อง"

                            })

                            return

                        }


                        // ------------------------------------------
                        // DUPLICATE KEY
                        // ------------------------------------------

                        const duplicateKey =
                            getDuplicateKey(
                                name,
                                costPrice
                            )


                        // ------------------------------------------
                        // DUPLICATE IN CURRENT BULK
                        // ------------------------------------------

                        if (
                            duplicateKeys.has(
                                duplicateKey
                            )
                        ) {

                            invalid.push({

                                ...item,

                                reason:
                                    "สินค้าซ้ำกันในรายการ Bulk เดียวกัน"

                            })

                            return

                        }


                        // ------------------------------------------
                        // DUPLICATE IN EXISTING PRODUCTS
                        // ------------------------------------------

                        if (
                            existingProductKeys.has(
                                duplicateKey
                            )
                        ) {

                            invalid.push({

                                ...item,

                                reason:
                                    "มีสินค้า ชื่อและราคาทุนเดียวกันอยู่ในระบบแล้ว"

                            })

                            return

                        }


                        // ------------------------------------------
                        // ADD DUPLICATE KEY
                        // ------------------------------------------

                        duplicateKeys.add(
                            duplicateKey
                        )


                        // ------------------------------------------
                        // ADD PREVIEW
                        // ------------------------------------------

                        preview.push({

                            tempId:
                                `${Date.now()}-${item.lineNumber}-${Math.random()
                                    .toString(36)
                                    .slice(2)}`,

                            name,

                            costPrice,

                            quantity: 1

                        })

                    }
                )


                // ==================================================
                // SET RESULT
                // ==================================================

                setBulkPreview(
                    preview
                )

                setBulkInvalid(
                    invalid
                )

            },
            [
                bulkText,
                products,
                getDuplicateKey
            ]
        )


    // ==================================================
    // UPDATE BULK QUANTITY
    // ==================================================

    const updateBulkQuantity =
        useCallback(
            (
                tempId,
                value
            ) => {

                const numericValue =
                    Number(
                        value
                    )


                const quantity =
                    Number.isFinite(
                        numericValue
                    )
                        ? Math.max(
                            1,
                            Math.floor(
                                numericValue
                            )
                        )
                        : 1


                setBulkPreview(
                    prev =>
                        prev.map(
                            item =>

                                item.tempId === tempId

                                    ? {

                                        ...item,

                                        quantity

                                    }

                                    : item

                        )
                )

            },
            []
        )


    // ==================================================
    // REMOVE BULK ITEM
    // ==================================================

    const removeBulkItem =
        useCallback(
            tempId => {

                setBulkPreview(
                    prev =>
                        prev.filter(
                            item =>
                                item.tempId !==
                                tempId
                        )
                )

            },
            []
        )


    // ==================================================
    // CLEAR BULK
    // ==================================================

    const clearBulk =
        useCallback(
            () => {

                resetBulk()

            },
            [
                resetBulk
            ]
        )


    // ==================================================
    // TOTAL QUANTITY
    // ==================================================

    const bulkTotalQuantity =
        useMemo(
            () =>
                bulkPreview.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        safeNumber(
                            item.quantity
                        ),
                    0
                ),
            [
                bulkPreview
            ]
        )


    // ==================================================
    // TOTAL COST
    // ==================================================

    const bulkTotalCost =
        useMemo(
            () =>
                bulkPreview.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        (
                            safeNumber(
                                item.costPrice
                            ) *
                            safeNumber(
                                item.quantity
                            )
                        ),
                    0
                ),
            [
                bulkPreview
            ]
        )


    // ==================================================
    // VALIDATE DUPLICATES BEFORE SAVE
    // ==================================================
    //
    // ตรวจอีกครั้งก่อนยิง API
    // เพื่อป้องกันกรณีข้อมูล products เปลี่ยน
    // หลังจาก Parse แล้ว
    //
    // ==================================================

    const validateBulkDuplicates =
        useCallback(
            async () => {

                if (
                    !Array.isArray(
                        bulkPreview
                    ) ||
                    bulkPreview.length === 0
                ) {

                    return {

                        valid: false,

                        duplicates: []

                    }

                }


                const duplicates = []

                const seen =
                    new Set()


                // ------------------------------------------
                // CURRENT PREVIEW DUPLICATES
                // ------------------------------------------

                bulkPreview.forEach(
                    item => {

                        const key =
                            getDuplicateKey(
                                item.name,
                                item.costPrice
                            )


                        if (
                            seen.has(
                                key
                            )
                        ) {

                            duplicates.push({

                                ...item,

                                reason:
                                    "สินค้าซ้ำกันในรายการ Bulk เดียวกัน"

                            })

                            return

                        }


                        seen.add(
                            key
                        )

                    }
                )


                // ------------------------------------------
                // EXISTING PRODUCTS
                // ------------------------------------------

                const existingProductKeys =
                    new Set(

                        Array.isArray(
                            products
                        )

                            ? products.map(
                                product => {

                                    const name =
                                        product?.name ??
                                        ""

                                    const costPrice =
                                        product?.costPrice ??
                                        product?.cost ??
                                        0


                                    return getDuplicateKey(
                                        name,
                                        costPrice
                                    )

                                }
                            )

                            : []

                    )


                bulkPreview.forEach(
                    item => {

                        const key =
                            getDuplicateKey(
                                item.name,
                                item.costPrice
                            )


                        if (
                            existingProductKeys.has(
                                key
                            )
                        ) {

                            duplicates.push({

                                ...item,

                                reason:
                                    "มีสินค้า ชื่อและราคาทุนเดียวกันอยู่ในระบบแล้ว"

                            })

                        }

                    }
                )


                return {

                    valid:
                        duplicates.length === 0,

                    duplicates

                }

            },
            [
                bulkPreview,
                products,
                getDuplicateKey
            ]
        )


    // ==================================================
    // BULK ADD
    // ==================================================

    const handleBulkAdd =
        useCallback(
            async () => {

                if (

                    bulkPreview.length === 0 ||

                    savingBulk

                ) {

                    return {

                        success: false,

                        reason: "empty"

                    }

                }


                // ==================================================
                // DUPLICATE CHECK BEFORE SAVE
                // ==================================================

                const duplicateValidation =
                    await validateBulkDuplicates()


                if (
                    !duplicateValidation.valid
                ) {

                    const duplicates =
                        duplicateValidation
                            .duplicates


                    const duplicateNames =
                        [
                            ...new Set(
                                duplicates.map(
                                    item =>
                                        `"${item.name}"`
                                )
                            )
                        ]


                    const message =
                        duplicateNames.length === 1

                            ? `ไม่สามารถเพิ่มสินค้าได้ เนื่องจาก ${duplicateNames[0]} มีชื่อและราคาทุนซ้ำกับสินค้าในระบบหรือรายการที่กำลังเพิ่ม`

                            : `ไม่สามารถเพิ่มสินค้าได้ เนื่องจากมีสินค้าซ้ำ ${duplicateNames.length} รายการ: ${duplicateNames.join(", ")}`


                    setBulkInvalid(
                        previous => {

                            const current =
                                Array.isArray(
                                    previous
                                )
                                    ? previous
                                    : []


                            const existingLineNumbers =
                                new Set(
                                    current.map(
                                        item =>
                                            item.lineNumber
                                    )
                                )


                            const newInvalid =
                                duplicates.filter(
                                    item =>
                                        !existingLineNumbers.has(
                                            item.lineNumber
                                        )
                                )


                            return [
                                ...current,
                                ...newInvalid
                            ]

                        }
                    )


                    setError?.(
                        message
                    )


                    alert(
                        message
                    )


                    return {

                        success: false,

                        reason:
                            "duplicate",

                        duplicates

                    }

                }


                try {

                    setSavingBulk(
                        true
                    )


                    setError?.(
                        ""
                    )


                    // --------------------------------------
                    // PURCHASE DATE
                    // --------------------------------------

                    const purchaseDate =
                        getThaiDateString()


                    // --------------------------------------
                    // CREATE PRODUCTS
                    // --------------------------------------

                    let createdCount = 0


                    for (
                        const item
                        of bulkPreview
                    ) {

                        const response =
                            await api.post(
                                "/stock",
                                {

                                    name:
                                        item.name,

                                    costPrice:
                                        safeNumber(
                                            item.costPrice
                                        ),

                                    quantity:
                                        safeNumber(
                                            item.quantity
                                        ),

                                    purchaseDate

                                }
                            )


                        const saved =
                            response.data?.stock ||
                            response.data?.product


                        if (
                            saved
                        ) {

                            createdCount += 1

                        }

                    }


                    // --------------------------------------
                    // RELOAD FROM BACKEND
                    // --------------------------------------

                    if (
                        typeof loadProducts ===
                        "function"
                    ) {

                        await loadProducts()

                    } else {

                        console.warn(
                            "useProductBulk: loadProducts is not provided"
                        )

                    }


                    // --------------------------------------
                    // CLOSE MODAL
                    // --------------------------------------

                    setShowAddModal?.(
                        false
                    )


                    setEditingProduct?.(
                        null
                    )


                    resetForm?.()

                    resetBulk()


                    // --------------------------------------
                    // RETURN SUCCESS
                    // --------------------------------------

                    return {

                        success: true,

                        shouldReload: false,

                        createdCount

                    }

                } catch (err) {

                    console.error(
                        "handleBulkAdd error:",
                        err
                    )


                    const message =
                        err
                            ?.response
                            ?.data
                            ?.message ||

                        err?.message ||

                        "เพิ่มสินค้าแบบหลายรายการไม่สำเร็จ"


                    setError?.(
                        message
                    )


                    alert(
                        message
                    )


                    return {

                        success: false,

                        shouldReload: false,

                        error: err

                    }

                } finally {

                    setSavingBulk(
                        false
                    )

                }

            },
            [
                bulkPreview,
                savingBulk,
                setError,
                setShowAddModal,
                setEditingProduct,
                resetForm,
                resetBulk,
                loadProducts,
                validateBulkDuplicates
            ]
        )


    // ==================================================
    // RETURN
    // ==================================================

    return {

        // ----------------------------------------------
        // STATE
        // ----------------------------------------------

        bulkText,

        setBulkText,

        bulkPreview,

        setBulkPreview,

        bulkInvalid,

        setBulkInvalid,

        savingBulk,


        // ----------------------------------------------
        // RESET
        // ----------------------------------------------

        resetBulk,


        // ----------------------------------------------
        // PARSE
        // ----------------------------------------------

        handleParseBulk,


        // ----------------------------------------------
        // PREVIEW
        // ----------------------------------------------

        updateBulkQuantity,

        removeBulkItem,

        clearBulk,


        // ----------------------------------------------
        // SUMMARY
        // ----------------------------------------------

        bulkTotalQuantity,

        bulkTotalCost,


        // ----------------------------------------------
        // SAVE
        // ----------------------------------------------

        handleBulkAdd

    }

}