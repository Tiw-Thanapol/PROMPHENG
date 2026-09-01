import {
    useCallback,
    useEffect,
    useState
} from "react"

import api from "../api/axios"


// ======================================================
// USE PRODUCTS
// ======================================================

export default function useProducts() {

    // ==================================================
    // STATE
    // ==================================================

    const [
        products,
        setProducts
    ] = useState([])

    const [
        loading,
        setLoading
    ] = useState(true)

    const [
        error,
        setError
    ] = useState("")


    // ==================================================
    // LOAD PRODUCTS
    // GET /api/stock
    // ==================================================

    const loadProducts =
        useCallback(
            async () => {

                try {

                    setLoading(true)
                    setError("")

                    const response =
                        await api.get(
                            "/stock"
                        )

                    const data =
                        response.data?.products ??
                        response.data?.stock ??
                        response.data ??
                        []

                    const nextProducts =
                        Array.isArray(data)
                            ? data
                            : []

                    setProducts(
                        nextProducts
                    )

                    return nextProducts

                } catch (err) {

                    console.error(
                        "loadProducts error:",
                        err
                    )

                    setError(
                        err.response?.data?.message ||
                        "ไม่สามารถโหลดข้อมูลสินค้าได้"
                    )

                    setProducts([])

                    throw err

                } finally {

                    setLoading(false)

                }

            },
            []
        )


    // ==================================================
    // LOAD ON MOUNT
    // ==================================================

    useEffect(() => {

        loadProducts()
            .catch(() => {
                // error ถูกจัดการใน loadProducts แล้ว
            })

    }, [
        loadProducts
    ])


    // ==================================================
    // REFRESH PRODUCTS
    // ==================================================

    const refreshProducts =
        useCallback(
            async () => {

                return await loadProducts()

            },
            [
                loadProducts
            ]
        )


    // ==================================================
    // LOAD ALL
    //
    // ตอนนี้ useProducts รับผิดชอบ stock
    // ส่วน sales จะถูกโหลดจาก useProductSales
    // ใน Products.jsx
    //
    // จึงทำ alias ไว้เพื่อให้ Products.jsx
    // เรียก loadAll ได้โดยไม่พัง
    // ==================================================

    const loadAll =
        useCallback(
            async () => {

                return await loadProducts()

            },
            [
                loadProducts
            ]
        )


    // ==================================================
    // CLEAR ERROR
    // ==================================================

    const clearError =
        useCallback(
            () => {

                setError("")

            },
            []
        )


    // ==================================================
    // ADD PRODUCT TO LOCAL STATE
    // ==================================================

    const addProduct =
        useCallback(
            product => {

                if (!product) {
                    return
                }

                setProducts(
                    prev => [
                        product,
                        ...prev
                    ]
                )

            },
            []
        )


    // ==================================================
    // UPDATE PRODUCT IN LOCAL STATE
    // ==================================================

    const updateProduct =
        useCallback(
            (
                productId,
                updatedProduct
            ) => {

                if (
                    productId === null ||
                    productId === undefined ||
                    !updatedProduct
                ) {
                    return
                }

                setProducts(
                    prev =>
                        prev.map(
                            product =>
                                getProductId(
                                    product
                                ) === productId
                                    ? updatedProduct
                                    : product
                        )
                )

            },
            []
        )


    // ==================================================
    // REMOVE PRODUCT FROM LOCAL STATE
    // ==================================================

    const removeProduct =
        useCallback(
            productId => {

                if (
                    productId === null ||
                    productId === undefined
                ) {
                    return
                }

                setProducts(
                    prev =>
                        prev.filter(
                            product =>
                                getProductId(
                                    product
                                ) !== productId
                        )
                )

            },
            []
        )


    // ==================================================
    // REPLACE PRODUCTS
    // ==================================================

    const replaceProducts =
        useCallback(
            nextProducts => {

                setProducts(
                    Array.isArray(
                        nextProducts
                    )
                        ? nextProducts
                        : []
                )

            },
            []
        )


    // ==================================================
    // RETURN
    // ==================================================

    return {

        products,
        setProducts,

        loading,

        error,
        setError,

        loadProducts,
        refreshProducts,
        loadAll,

        clearError,

        addProduct,
        updateProduct,
        removeProduct,

        replaceProducts

    }
}


// ======================================================
// INTERNAL PRODUCT ID HELPER
// ======================================================

function getProductId(product) {

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

    for (
        const id
        of ids
    ) {

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