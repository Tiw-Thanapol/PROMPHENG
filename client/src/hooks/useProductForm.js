import {
    useCallback,
    useState
} from "react"

import api from "../api/axios"

import {
    getProductId,
    getQuantity
} from "../utils/productHelpers"

import {
    getThaiDateInputValue
} from "../utils/dateHelpers"


// ======================================================
// USE PRODUCT FORM
// ======================================================
//
// รับผิดชอบ:
// - Add Product
// - Edit Product
// - Sell Product
// - Single Product Form
//
// ไม่รับผิดชอบ:
// - Bulk Product
// - Product Selection
// - Sales List
//
// IMPORTANT
// - Frontend สามารถระบุ soldAt ได้
// - soldAt = วันที่ / เวลาที่ขายจริง
// - Backend รับ soldAt และบันทึกลง Sale / SaleItem
// - ถ้าไม่ได้ระบุ soldAt จะใช้เวลาปัจจุบัน
// - การขายใช้ POST /api/sales
// ======================================================


export default function useProductForm({

    setProducts,
    setError,
    loadProducts

}) {

    // ==================================================
    // ADD / EDIT MODAL
    // ==================================================

    const [
        showAddModal,
        setShowAddModal
    ] = useState(false)


    const [
        editingProduct,
        setEditingProduct
    ] = useState(null)


    const [
        addMode,
        setAddMode
    ] = useState("single")


    const [
        savingSingle,
        setSavingSingle
    ] = useState(false)


    // ==================================================
    // SINGLE PRODUCT FORM
    // ==================================================

    const [
        form,
        setForm
    ] = useState({

        name: "",
        description: "",
        costPrice: "",
        quantity: "1",
        purchaseDate: "",
        note: ""

    })


    // ==================================================
    // SELL STATE
    // ==================================================

    const [
        sellingProduct,
        setSellingProduct
    ] = useState(null)


    const [
        sellQuantity,
        setSellQuantity
    ] = useState("1")


    const [
        sellPrice,
        setSellPrice
    ] = useState("")


    const [
        sellShippingCost,
        setSellShippingCost
    ] = useState("")


    const [
        sellOtherExpense,
        setSellOtherExpense
    ] = useState("")


    // ==================================================
    // SOLD AT
    // ==================================================

    const [
        sellSoldAt,
        setSellSoldAt
    ] = useState("")


    const [
        savingSell,
        setSavingSell
    ] = useState(false)


    // ==================================================
    // GET CURRENT DATETIME LOCAL
    // ==================================================

    const getCurrentDateTimeLocal =
        useCallback(() => {

            const now =
                new Date()


            const year =
                now.getFullYear()


            const month =
                String(
                    now.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                )


            const day =
                String(
                    now.getDate()
                ).padStart(
                    2,
                    "0"
                )


            const hours =
                String(
                    now.getHours()
                ).padStart(
                    2,
                    "0"
                )


            const minutes =
                String(
                    now.getMinutes()
                ).padStart(
                    2,
                    "0"
                )


            return (
                `${year}-${month}-${day}` +
                `T${hours}:${minutes}`
            )

        }, [])


    // ==================================================
    // NORMALIZE SOLD AT
    // ==================================================

    const normalizeSoldAt =
        useCallback(
            value => {

                if (
                    value === undefined ||
                    value === null ||
                    value === ""
                ) {

                    return null

                }


                if (
                    value instanceof Date
                ) {

                    if (
                        Number.isNaN(
                            value.getTime()
                        )
                    ) {

                        throw new Error(
                            "วันที่ขายจริงไม่ถูกต้อง"
                        )

                    }


                    return value.toISOString()

                }


                const stringValue =
                    String(
                        value
                    ).trim()


                if (!stringValue) {

                    return null

                }


                const date =
                    new Date(
                        stringValue
                    )


                if (
                    Number.isNaN(
                        date.getTime()
                    )
                ) {

                    throw new Error(
                        "วันที่ขายจริงไม่ถูกต้อง"
                    )

                }


                return date.toISOString()

            },
            []
        )


    // ==================================================
    // RESET PRODUCT FORM
    // ==================================================

    const resetForm =
        useCallback(() => {

            setForm({

                name: "",
                description: "",
                costPrice: "",
                quantity: "1",
                purchaseDate: "",
                note: ""

            })

        }, [])


    // ==================================================
    // RESET SELL FORM
    // ==================================================

    const resetSellForm =
        useCallback(() => {

            setSellingProduct(
                null
            )


            setSellQuantity(
                "1"
            )


            setSellPrice(
                ""
            )


            setSellShippingCost(
                ""
            )


            setSellOtherExpense(
                ""
            )


            setSellSoldAt(
                ""

            )

        }, [])


    // ==================================================
    // OPEN ADD MODAL
    // ==================================================

    const openAddModal =
        useCallback(() => {

            resetForm()


            setEditingProduct(
                null
            )


            setAddMode(
                "single"
            )


            setShowAddModal(
                true
            )

        }, [
            resetForm
        ])


    // ==================================================
    // CLOSE ADD MODAL
    // ==================================================

    const closeAddModal =
        useCallback(() => {

            if (
                savingSingle
            ) {

                return

            }


            setShowAddModal(
                false
            )


            setEditingProduct(
                null
            )


            setAddMode(
                "single"
            )


            resetForm()

        }, [
            savingSingle,
            resetForm
        ])


    // ==================================================
    // OPEN EDIT MODAL
    // ==================================================

    const openEditModal =
        useCallback(
            product => {

                if (!product) {

                    return

                }


                const quantity =
                    getQuantity(
                        product
                    )


                setEditingProduct(
                    product
                )


                setAddMode(
                    "single"
                )


                setForm({

                    name:
                        product?.name ??
                        "",


                    description:
                        product?.description ??
                        "",


                    costPrice:
                        product?.costPrice ??
                        product?.cost ??
                        "",


                    quantity:
                        String(
                            quantity
                        ),


                    purchaseDate:
                        getThaiDateInputValue(
                            product?.purchaseDate
                        ),


                    note:
                        product?.note ??
                        ""

                })


                setShowAddModal(
                    true
                )

            },
            []
        )


    // ==================================================
    // FORM CHANGE
    // ==================================================

    const handleFormChange =
        useCallback(
            event => {

                const {
                    name,
                    value
                } = event.target


                setForm(
                    previous => ({

                        ...previous,

                        [name]:
                            value

                    })
                )

            },
            []
        )


    // ==================================================
    // SAVE SINGLE PRODUCT
    // ==================================================

    const handleSaveProduct =
        useCallback(
            async event => {

                event?.preventDefault()


                if (
                    savingSingle
                ) {

                    return

                }


                // ==========================================
                // NORMALIZE
                // ==========================================

                const name =
                    String(
                        form?.name ?? ""
                    ).trim()


                const description =
                    String(
                        form?.description ?? ""
                    ).trim()


                const note =
                    String(
                        form?.note ?? ""
                    ).trim()


                const costPrice =
                    Number(
                        form?.costPrice
                    )


                const quantity =
                    Number(
                        form?.quantity
                    )


                const purchaseDate =
                    form?.purchaseDate ||
                    ""


                // ==========================================
                // VALIDATE NAME
                // ==========================================

                if (!name) {

                    alert(
                        "กรุณากรอกชื่อสินค้า"
                    )

                    return

                }


                // ==========================================
                // VALIDATE COST
                // ==========================================

                if (
                    !Number.isFinite(
                        costPrice
                    ) ||
                    costPrice < 0
                ) {

                    alert(
                        "กรุณากรอกราคาทุนให้ถูกต้อง"
                    )

                    return

                }


                // ==========================================
                // VALIDATE QUANTITY
                // ==========================================

                if (
                    !Number.isInteger(
                        quantity
                    ) ||
                    quantity <= 0
                ) {

                    alert(
                        "จำนวนสินค้าต้องเป็นจำนวนเต็มมากกว่า 0"
                    )

                    return

                }


                // ==========================================
                // PAYLOAD
                // ==========================================

                const payload = {

                    name,
                    description,
                    costPrice,
                    quantity,
                    purchaseDate,
                    note

                }


                try {

                    setSavingSingle(
                        true
                    )


                    setError?.(
                        ""
                    )


                    // ======================================
                    // EDIT
                    // ======================================

                    if (
                        editingProduct
                    ) {

                        const id =
                            getProductId(
                                editingProduct
                            )


                        if (
                            id === null ||
                            id === undefined ||
                            id === ""
                        ) {

                            throw new Error(
                                "ไม่พบรหัสสินค้า"
                            )

                        }


                        const response =
                            await api.put(
                                `/stock/${id}`,
                                payload
                            )


                        const saved =
                            response
                                ?.data
                                ?.stock ??
                            response
                                ?.data
                                ?.product ??
                            response
                                ?.data


                        // ----------------------------------
                        // UPDATE LOCAL STATE
                        // ----------------------------------

                        if (
                            saved &&
                            typeof saved ===
                            "object"
                        ) {

                            setProducts(
                                previousProducts => {

                                    if (
                                        !Array.isArray(
                                            previousProducts
                                        )
                                    ) {

                                        return previousProducts

                                    }


                                    return previousProducts.map(
                                        item => {

                                            const itemId =
                                                getProductId(
                                                    item
                                                )


                                            return (
                                                String(
                                                    itemId
                                                ) ===
                                                String(
                                                    id
                                                )
                                            )
                                                ? saved
                                                : item

                                        }
                                    )

                                }
                            )

                        } else if (
                            typeof loadProducts ===
                            "function"
                        ) {

                            await loadProducts()

                        }


                    // ======================================
                    // CREATE
                    // ======================================

                    } else {

                        await api.post(
                            "/stock",
                            payload
                        )


                        // ----------------------------------
                        // IMPORTANT
                        // ----------------------------------
                        //
                        // Backend อาจ:
                        //
                        // 1. CREATE สินค้าใหม่
                        // 2. MERGE กับสินค้าที่มีอยู่
                        //
                        // ดังนั้นห้าม prepend response
                        // เข้า local state โดยตรง
                        //
                        // ให้ backend เป็น source of truth
                        // แล้วโหลดรายการใหม่ทั้งหมด
                        //
                        // ----------------------------------

                        if (
                            typeof loadProducts ===
                            "function"
                        ) {

                            await loadProducts()

                        } else {

                            // ----------------------------------
                            // Fallback:
                            // ไม่มี loadProducts
                            // ไม่สามารถ sync state จาก backend ได้
                            // ----------------------------------

                            console.warn(
                                "handleSaveProduct: loadProducts is not available after CREATE"
                            )

                        }

                    }


                    // ==========================================
                    // CLOSE
                    // ==========================================

                    setShowAddModal(
                        false
                    )


                    setEditingProduct(
                        null
                    )


                    setAddMode(
                        "single"
                    )


                    resetForm()


                    return {

                        success: true

                    }


                } catch (error) {

                    console.error(
                        "handleSaveProduct error:",
                        error
                    )


                    const message =
                        error
                            ?.response
                            ?.data
                            ?.message ??
                        error
                            ?.response
                            ?.data
                            ?.error ??
                        error?.message ??
                        "บันทึกสินค้าไม่สำเร็จ"


                    setError?.(
                        message
                    )


                    alert(
                        message
                    )


                    return {

                        success: false,
                        error

                    }


                } finally {

                    setSavingSingle(
                        false
                    )

                }

            },
            [
                savingSingle,
                form,
                editingProduct,
                setProducts,
                setError,
                loadProducts,
                resetForm
            ]
        )


    // ==================================================
    // OPEN SELL MODAL
    // ==================================================

    const openSellModal =
        useCallback(
            product => {

                if (!product) {

                    return

                }


                const quantity =
                    getQuantity(
                        product
                    )


                if (
                    !Number.isFinite(
                        quantity
                    ) ||
                    quantity <= 0
                ) {

                    alert(
                        "สินค้านี้ไม่มีสินค้าเหลือในสต็อก"
                    )

                    return

                }


                setSellingProduct(
                    product
                )


                setSellQuantity(
                    "1"
                )


                setSellPrice(
                    ""
                )


                setSellShippingCost(
                    ""
                )


                setSellOtherExpense(
                    ""
                )


                setSellSoldAt(
                    getCurrentDateTimeLocal()
                )

            },
            [
                getCurrentDateTimeLocal
            ]
        )


    // ==================================================
    // CLOSE SELL MODAL
    // ==================================================

    const closeSellModal =
        useCallback(() => {

            if (
                savingSell
            ) {

                return

            }


            resetSellForm()

        }, [
            savingSell,
            resetSellForm
        ])


    // ==================================================
    // CONFIRM SELL
    // ==================================================

    const confirmSell =
        useCallback(
            async event => {

                event?.preventDefault()


                if (
                    savingSell
                ) {

                    return

                }


                // ==========================================
                // CHECK PRODUCT
                // ==========================================

                if (!sellingProduct) {

                    alert(
                        "ไม่พบสินค้าที่ต้องการขาย"
                    )

                    return

                }


                // ==========================================
                // PRODUCT ID
                // ==========================================

                const productId =
                    getProductId(
                        sellingProduct
                    )


                if (
                    productId === null ||
                    productId === undefined ||
                    productId === ""
                ) {

                    alert(
                        "ไม่พบรหัสสินค้า"
                    )

                    return

                }


                // ==========================================
                // NORMALIZE
                // ==========================================

                const quantity =
                    Number(
                        sellQuantity
                    )


                const salePrice =
                    Number(
                        sellPrice
                    )


                const shippingCost =
                    sellShippingCost === "" ||
                    sellShippingCost === null ||
                    sellShippingCost === undefined
                        ? 0
                        : Number(
                            sellShippingCost
                        )


                const otherExpense =
                    sellOtherExpense === "" ||
                    sellOtherExpense === null ||
                    sellOtherExpense === undefined
                        ? 0
                        : Number(
                            sellOtherExpense
                        )


                const stockQuantity =
                    getQuantity(
                        sellingProduct
                    )


                // ==========================================
                // SOLD AT
                // ==========================================

                let normalizedSoldAt = null


                try {

                    normalizedSoldAt =
                        normalizeSoldAt(
                            sellSoldAt
                        )

                } catch (error) {

                    alert(
                        error?.message ??
                        "วันที่ขายจริงไม่ถูกต้อง"
                    )

                    return

                }


                // ==========================================
                // VALIDATE QUANTITY
                // ==========================================

                if (
                    !Number.isInteger(
                        quantity
                    ) ||
                    quantity <= 0
                ) {

                    alert(
                        "จำนวนที่ขายต้องเป็นจำนวนเต็มมากกว่า 0"
                    )

                    return

                }


                if (
                    quantity >
                    stockQuantity
                ) {

                    alert(
                        `ขายได้สูงสุด ${stockQuantity} ชิ้น`
                    )

                    return

                }


                // ==========================================
                // VALIDATE SALE PRICE
                // ==========================================

                if (
                    !Number.isFinite(
                        salePrice
                    ) ||
                    salePrice < 0
                ) {

                    alert(
                        "กรุณากรอกราคาขายให้ถูกต้อง"
                    )

                    return

                }


                // ==========================================
                // VALIDATE SHIPPING
                // ==========================================

                if (
                    !Number.isFinite(
                        shippingCost
                    ) ||
                    shippingCost < 0
                ) {

                    alert(
                        "กรุณากรอกค่าส่งให้ถูกต้อง"
                    )

                    return

                }


                // ==========================================
                // VALIDATE OTHER EXPENSE
                // ==========================================

                if (
                    !Number.isFinite(
                        otherExpense
                    ) ||
                    otherExpense < 0
                ) {

                    alert(
                        "กรุณากรอกค่าใช้จ่ายอื่นๆ ให้ถูกต้อง"
                    )

                    return

                }


                // ==========================================
                // VALIDATE SOLD AT
                // ==========================================

                if (
                    !normalizedSoldAt
                ) {

                    alert(
                        "กรุณาระบุวันที่และเวลาที่ขาย"
                    )

                    return

                }


                // ==========================================
                // SALE PAYLOAD
                // ==========================================

                const payload = {

                    productId,

                    quantity,

                    salePrice,

                    shippingCost,

                    otherExpense,

                    soldAt:
                        normalizedSoldAt

                }


                try {

                    setSavingSell(
                        true
                    )


                    setError?.(
                        ""
                    )


                    console.log(
                        "CREATE SALE PAYLOAD:",
                        payload
                    )


                    // ======================================
                    // CREATE SALE
                    // ======================================

                    const response =
                        await api.post(
                            "/sales",
                            payload
                        )


                    // ======================================
                    // RESPONSE
                    // ======================================

                    const responseData =
                        response?.data


                    const updatedProduct =
                        responseData?.stock ??
                        responseData?.product ??
                        null


                    // ======================================
                    // UPDATE LOCAL STOCK
                    // ======================================

                    if (
                        updatedProduct &&
                        typeof updatedProduct ===
                        "object"
                    ) {

                        setProducts(
                            previousProducts => {

                                if (
                                    !Array.isArray(
                                        previousProducts
                                    )
                                ) {

                                    return previousProducts

                                }


                                return previousProducts.map(
                                    item => {

                                        const itemId =
                                            getProductId(
                                                item
                                            )


                                        if (
                                            String(
                                                itemId
                                            ) ===
                                            String(
                                                productId
                                            )
                                        ) {

                                            return updatedProduct

                                        }


                                        return item

                                    }
                                )

                            }
                        )

                    } else if (
                        typeof loadProducts ===
                        "function"
                    ) {

                        await loadProducts()

                    }


                    // ======================================
                    // RESET / CLOSE
                    // ======================================

                    resetSellForm()


                    return {

                        success: true,

                        data:
                            responseData

                    }


                } catch (error) {

                    console.error(
                        "confirmSell error:",
                        error
                    )


                    const message =
                        error
                            ?.response
                            ?.data
                            ?.message ??
                        error
                            ?.response
                            ?.data
                            ?.error ??
                        error?.message ??
                        "บันทึกการขายไม่สำเร็จ"


                    setError?.(
                        message
                    )


                    alert(
                        message
                    )


                    return {

                        success: false,
                        error

                    }

                } finally {

                    setSavingSell(
                        false
                    )

                }

            },
            [
                savingSell,
                sellingProduct,
                sellQuantity,
                sellPrice,
                sellShippingCost,
                sellOtherExpense,
                sellSoldAt,
                normalizeSoldAt,
                setProducts,
                setError,
                loadProducts,
                resetSellForm
            ]
        )


    // ==================================================
    // RETURN
    // ==================================================

    return {

        // ==============================================
        // ADD / EDIT STATE
        // ==============================================

        showAddModal,

        setShowAddModal,

        editingProduct,

        setEditingProduct,

        addMode,

        setAddMode,

        savingSingle,

        form,

        setForm,


        // ==============================================
        // ADD / EDIT ACTIONS
        // ==============================================

        resetForm,

        openAddModal,

        closeAddModal,

        openEditModal,

        handleFormChange,

        handleSaveProduct,


        // ==============================================
        // SELL STATE
        // ==============================================

        sellingProduct,

        setSellingProduct,

        sellQuantity,

        setSellQuantity,

        sellPrice,

        setSellPrice,

        sellShippingCost,

        setSellShippingCost,

        sellOtherExpense,

        setSellOtherExpense,


        // ==============================================
        // SOLD AT
        // ==============================================

        sellSoldAt,

        setSellSoldAt,


        savingSell,


        // ==============================================
        // SELL ACTIONS
        // ==============================================

        openSellModal,

        closeSellModal,

        confirmSell,

        resetSellForm

    }

}
