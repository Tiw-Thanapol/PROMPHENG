import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react"

import api from "../api/axios"

import {
    getProductId,
    isStockProduct
} from "../utils/productHelpers"


// ======================================================
// USE PRODUCT SELECTION
// ======================================================
//
// รับผิดชอบ:
// - selectedIds
// - เลือกสินค้าแต่ละรายการ
// - เลือกทั้งหมดที่มองเห็น
// - ล้าง selection
// - ล้าง ID ที่ไม่อยู่ใน stock แล้ว
// - Delete Product
// - Bulk Delete
// - Bulk Cancel
//
// ไม่รับผิดชอบ:
// - Load products
// - Sales
// - Add / Edit
// - Bulk Add
// ======================================================

export default function useProductSelection({

    products,
    filteredProducts,

    setProducts,
    setError

}) {

    // ==================================================
    // STATE
    // ==================================================

    const [
        selectedIds,
        setSelectedIds
    ] = useState(
        () => new Set()
    )


    const [
        bulkActionBusy,
        setBulkActionBusy
    ] = useState(false)


    // ==================================================
    // VISIBLE STOCK IDS
    // ==================================================

    const visibleStockIds =
        useMemo(
            () =>
                (
                    Array.isArray(
                        filteredProducts
                    )
                        ? filteredProducts
                        : []
                )
                    .filter(
                        isStockProduct
                    )
                    .map(
                        getProductId
                    )
                    .filter(
                        id =>
                            id !== null &&
                            id !== undefined
                    ),
            [
                filteredProducts
            ]
        )


    // ==================================================
    // ALL VISIBLE SELECTED
    // ==================================================

    const allVisibleSelected =
        visibleStockIds.length > 0 &&
        visibleStockIds.every(
            id =>
                selectedIds.has(
                    id
                )
        )


    // ==================================================
    // TOGGLE ROW
    // ==================================================

    const toggleRowSelected =
        useCallback(
            id => {

                if (
                    id === null ||
                    id === undefined
                ) {
                    return
                }

                setSelectedIds(
                    prev => {

                        const next =
                            new Set(
                                prev
                            )

                        if (
                            next.has(
                                id
                            )
                        ) {

                            next.delete(
                                id
                            )

                        } else {

                            next.add(
                                id
                            )

                        }

                        return next

                    }
                )

            },
            []
        )


    // ==================================================
    // TOGGLE SELECT ALL VISIBLE
    // ==================================================

    const toggleSelectAllVisible =
        useCallback(
            () => {

                setSelectedIds(
                    prev => {

                        const next =
                            new Set(
                                prev
                            )


                        if (
                            allVisibleSelected
                        ) {

                            visibleStockIds.forEach(
                                id =>
                                    next.delete(
                                        id
                                    )
                            )

                        } else {

                            visibleStockIds.forEach(
                                id =>
                                    next.add(
                                        id
                                    )
                            )

                        }


                        return next

                    }
                )

            },
            [
                allVisibleSelected,
                visibleStockIds
            ]
        )


    // ==================================================
    // CLEAR SELECTION
    // ==================================================

    const clearSelection =
        useCallback(
            () => {

                setSelectedIds(
                    new Set()
                )

            },
            []
        )


    // ==================================================
    // CLEAN SELECTED
    // ==================================================
    //
    // ถ้าสินค้าถูกลบ / ถูกเปลี่ยน status
    // แล้วไม่ใช่ stock อีกต่อไป
    // ให้เอา ID ออกจาก selection
    // ==================================================

    useEffect(
        () => {

            setSelectedIds(
                prev => {

                    const validIds =
                        new Set(
                            (
                                Array.isArray(
                                    products
                                )
                                    ? products
                                    : []
                            )
                                .filter(
                                    isStockProduct
                                )
                                .map(
                                    getProductId
                                )
                                .filter(
                                    id =>
                                        id !== null &&
                                        id !== undefined
                                )
                        )


                    const next =
                        new Set(
                            Array.from(
                                prev
                            ).filter(
                                id =>
                                    validIds.has(
                                        id
                                    )
                            )
                        )


                    return (
                        next.size ===
                        prev.size
                    )
                        ? prev
                        : next

                }
            )

        },
        [
            products
        ]
    )


    // ==================================================
    // DELETE PRODUCT
    // ==================================================
    //
    // ลบสินค้าทีละรายการ
    //
    // เรียกจาก Products.jsx:
    //
    //     await deleteProduct(id)
    //
    // หน้าที่:
    // 1. DELETE backend
    // 2. ลบสินค้าออกจาก local state
    // 3. ลบ ID ออกจาก selection
    //
    // ==================================================

    const deleteProduct =
        useCallback(
            async id => {

                if (
                    id === null ||
                    id === undefined
                ) {

                    throw new Error(
                        "ไม่พบรหัสสินค้า"
                    )

                }


                try {

                    setError?.("")


                    // --------------------------------------
                    // DELETE BACKEND
                    // --------------------------------------

                    await api.delete(
                        `/stock/${id}`
                    )


                    // --------------------------------------
                    // REMOVE FROM LOCAL STATE
                    // --------------------------------------

                    setProducts(
                        previousProducts =>
                            previousProducts.filter(
                                item =>
                                    getProductId(
                                        item
                                    ) !== id
                            )
                    )


                    // --------------------------------------
                    // REMOVE FROM SELECTION
                    // --------------------------------------

                    setSelectedIds(
                        previousSelectedIds => {

                            const next =
                                new Set(
                                    previousSelectedIds
                                )


                            next.delete(
                                id
                            )


                            return next

                        }
                    )


                    return {
                        success: true
                    }

                } catch (err) {

                    console.error(
                        "deleteProduct error:",
                        err
                    )


                    throw err

                }

            },
            [
                setProducts,
                setError
            ]
        )


    // ==================================================
    // BULK DELETE
    // ==================================================

    const bulkDeleteSelected =
        useCallback(
            async () => {

                if (
                    selectedIds.size === 0 ||
                    bulkActionBusy
                ) {

                    return {
                        success: false,
                        reason: "empty"
                    }

                }


                const count =
                    selectedIds.size


                // ------------------------------------------
                // CONFIRM
                // ------------------------------------------

                const confirmed =
                    window.confirm(
                        `ต้องการลบ ${count} รายการที่เลือกหรือไม่?`
                    )


                if (!confirmed) {

                    return {
                        success: false,
                        reason: "cancelled"
                    }

                }


                try {

                    setBulkActionBusy(
                        true
                    )

                    setError?.("")


                    const ids =
                        Array.from(
                            selectedIds
                        )


                    const removedIds =
                        []

                    const failedNames =
                        []


                    // --------------------------------------
                    // DELETE ONE BY ONE
                    // --------------------------------------

                    for (
                        const id
                        of ids
                    ) {

                        try {

                            await api.delete(
                                `/stock/${id}`
                            )


                            removedIds.push(
                                id
                            )

                        } catch (err) {

                            const product =
                                (
                                    Array.isArray(
                                        products
                                    )
                                        ? products
                                        : []
                                ).find(
                                    item =>
                                        getProductId(
                                            item
                                        ) === id
                                )


                            failedNames.push(
                                product?.name ||
                                `#${id}`
                            )

                        }

                    }


                    // --------------------------------------
                    // REMOVE SUCCESSFUL ITEMS
                    // --------------------------------------

                    if (
                        removedIds.length > 0
                    ) {

                        setProducts(
                            prev =>
                                prev.filter(
                                    item =>
                                        !removedIds.includes(
                                            getProductId(
                                                item
                                            )
                                        )
                                )
                        )

                    }


                    // --------------------------------------
                    // CLEAR SELECTION
                    // --------------------------------------

                    setSelectedIds(
                        new Set()
                    )


                    // --------------------------------------
                    // FAILED MESSAGE
                    // --------------------------------------

                    if (
                        failedNames.length > 0
                    ) {

                        alert(
                            `ลบไม่สำเร็จ ${failedNames.length} รายการ`
                        )

                    }


                    return {

                        success: true,

                        removedCount:
                            removedIds.length,

                        failedCount:
                            failedNames.length,

                        failedNames

                    }


                } catch (err) {

                    console.error(
                        "bulkDeleteSelected error:",
                        err
                    )


                    alert(
                        err.response?.data?.message ||
                        err.message ||
                        "ลบสินค้าไม่สำเร็จ"
                    )


                    return {

                        success: false,

                        error: err

                    }

                } finally {

                    setBulkActionBusy(
                        false
                    )

                }

            },
            [
                selectedIds,
                bulkActionBusy,

                products,

                setProducts,
                setError
            ]
        )


    // ==================================================
    // BULK CANCEL
    // ==================================================

    const bulkCancelSelected =
        useCallback(
            async () => {

                if (
                    selectedIds.size === 0 ||
                    bulkActionBusy
                ) {

                    return {
                        success: false,
                        reason: "empty"
                    }

                }


                const count =
                    selectedIds.size


                // ------------------------------------------
                // CONFIRM
                // ------------------------------------------

                const confirmed =
                    window.confirm(
                        `ต้องการยกเลิก ${count} รายการที่เลือกหรือไม่?`
                    )


                if (!confirmed) {

                    return {
                        success: false,
                        reason: "cancelled"
                    }

                }


                try {

                    setBulkActionBusy(
                        true
                    )

                    setError?.("")


                    const ids =
                        Array.from(
                            selectedIds
                        )


                    const updated =
                        []

                    const failedNames =
                        []


                    // --------------------------------------
                    // UPDATE ONE BY ONE
                    // --------------------------------------

                    for (
                        const id
                        of ids
                    ) {

                        try {

                            const response =
                                await api.put(
                                    `/stock/${id}`,
                                    {
                                        status:
                                            "CANCELLED"
                                    }
                                )


                            const updatedProduct =
                                response.data?.stock ||
                                response.data?.product


                            if (
                                updatedProduct
                            ) {

                                updated.push(
                                    updatedProduct
                                )

                            } else {

                                const current =
                                    (
                                        Array.isArray(
                                            products
                                        )
                                            ? products
                                            : []
                                    ).find(
                                        item =>
                                            getProductId(
                                                item
                                            ) === id
                                    )


                                if (
                                    current
                                ) {

                                    updated.push({

                                        ...current,

                                        status:
                                            "CANCELLED"

                                    })

                                }

                            }

                        } catch (err) {

                            const product =
                                (
                                    Array.isArray(
                                        products
                                    )
                                        ? products
                                        : []
                                ).find(
                                    item =>
                                        getProductId(
                                            item
                                        ) === id
                                )


                            failedNames.push(
                                product?.name ||
                                `#${id}`
                            )

                        }

                    }


                    // --------------------------------------
                    // UPDATE LOCAL PRODUCTS
                    // --------------------------------------

                    if (
                        updated.length > 0
                    ) {

                        const updatedMap =
                            new Map(
                                updated.map(
                                    product => [
                                        getProductId(
                                            product
                                        ),
                                        product
                                    ]
                                )
                            )


                        setProducts(
                            prev =>
                                prev.map(
                                    item => {

                                        const id =
                                            getProductId(
                                                item
                                            )


                                        return updatedMap.has(
                                            id
                                        )
                                            ? updatedMap.get(
                                                id
                                            )
                                            : item

                                    }
                                )
                        )

                    }


                    // --------------------------------------
                    // CLEAR SELECTION
                    // --------------------------------------

                    setSelectedIds(
                        new Set()
                    )


                    // --------------------------------------
                    // FAILED MESSAGE
                    // --------------------------------------

                    if (
                        failedNames.length > 0
                    ) {

                        alert(
                            `ยกเลิกไม่สำเร็จ ${failedNames.length} รายการ`
                        )

                    }


                    return {

                        success: true,

                        updatedCount:
                            updated.length,

                        failedCount:
                            failedNames.length,

                        failedNames

                    }


                } catch (err) {

                    console.error(
                        "bulkCancelSelected error:",
                        err
                    )


                    alert(
                        err.response?.data?.message ||
                        err.message ||
                        "ยกเลิกสินค้าไม่สำเร็จ"
                    )


                    return {

                        success: false,

                        error: err

                    }

                } finally {

                    setBulkActionBusy(
                        false
                    )

                }

            },
            [
                selectedIds,
                bulkActionBusy,

                products,

                setProducts,
                setError
            ]
        )


    // ==================================================
    // RETURN
    // ==================================================

    return {

        // ----------------------------------------------
        // STATE
        // ----------------------------------------------

        selectedIds,
        setSelectedIds,

        bulkActionBusy,


        // ----------------------------------------------
        // VISIBLE
        // ----------------------------------------------

        visibleStockIds,

        allVisibleSelected,


        // ----------------------------------------------
        // SELECTION
        // ----------------------------------------------

        toggleRowSelected,

        toggleSelectAllVisible,

        clearSelection,


        // ----------------------------------------------
        // SINGLE ACTION
        // ----------------------------------------------

        deleteProduct,


        // ----------------------------------------------
        // BULK ACTION
        // ----------------------------------------------

        bulkDeleteSelected,

        bulkCancelSelected

    }
}
