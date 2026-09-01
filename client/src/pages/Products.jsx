import React, {
    useEffect,
    useState
} from "react"


// ======================================================
// STYLES
// ======================================================

import "../styles/Products.css"
import "../styles/ProductsSummary.css"
import "../styles/ProductsToolbar.css"
import "../styles/ProductsTable.css"
import "../styles/ProductsModal.css"


// ======================================================
// ICONS
// ======================================================

import {
    Package,
    Plus,
    ShoppingBag,
    Layers,
    X
} from "lucide-react"


// ======================================================
// COMPONENTS
// ======================================================

import StockProducts from "../pages/StockProducts"
import SoldProducts from "../pages/SoldProducts"
import ProductsModals from "../components/ProductsModals"
import ProductsSummary from "../components/ProductsSummary"
import ProductsToolbar from "../components/ProductsToolbar"
import ProductHistory from "../pages/ProductHistory"


// ======================================================
// HOOKS
// ======================================================

import useProducts from "../hooks/useProducts"
import useProductSales from "../hooks/useProductSales"
import useProductForm from "../hooks/useProductForm"
import useProductBulk from "../hooks/useProductBulk"
import useProductSelection from "../hooks/useProductSelection"


// ======================================================
// DATE HELPERS
// ======================================================

import {
    formatDate,
    formatDateTime
} from "../utils/dateHelpers"


// ======================================================
// PRODUCT HELPERS
// ======================================================

import {
    number,
    money,
    getProductId,
    getQuantity,
    getCost,
    getSalePrice,
    isCancelled,
    isStockProduct,
    getStatusBadgeConfig
} from "../utils/productHelpers"


// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({
    status
}) {

    const config =
        getStatusBadgeConfig(
            status
        )


    return (

        <span
            className={
                `status-badge ${config.className}`
            }
        >
            {config.label}
        </span>

    )
}


// ======================================================
// PRODUCTS
// ======================================================

function Products() {

    // ==================================================
    // PRODUCT DATA
    // ==================================================

    const {
        products,
        setProducts,

        loading,
        error,
        setError,

        loadProducts
    } = useProducts()


    // ==================================================
    // SALES DATA
    // ==================================================

    const {

        sales = [],

        salesLoading = false,

        totalProfit = 0,

        profitByProductId =
            new Map(),

        soldProductGroups = [],

        soldProductRows = [],

        soldItemRows = [],

        soldProducts = []

    } = useProductSales()


    // ==================================================
    // SEARCH
    // ==================================================

    const [
        search,
        setSearch
    ] = useState("")


    // ==================================================
    // ACTIVE TAB
    // ==================================================

    const [
        activeTab,
        setActiveTab
    ] = useState("all")


    // ==================================================
    // NORMALIZED SEARCH
    // ==================================================

    const normalizedSearch =
        String(
            search || ""
        )
            .trim()
            .toLowerCase()


    // ==================================================
    // FILTER PRODUCTS
    // ==================================================

    const filteredProducts =
        Array.isArray(products)
            ? products.filter(
                product => {

                    // ----------------------------------
                    // STOCK TAB
                    // ----------------------------------

                    if (
                        activeTab === "stock" &&
                        !isStockProduct(
                            product
                        )
                    ) {

                        return false

                    }


                    // ----------------------------------
                    // SEARCH
                    // ----------------------------------

                    if (
                        !normalizedSearch
                    ) {

                        return true

                    }


                    const name =
                        String(
                            product?.name ||
                            ""
                        )
                            .toLowerCase()


                    const description =
                        String(
                            product?.description ||
                            ""
                        )
                            .toLowerCase()


                    const note =
                        String(
                            product?.note ||
                            ""
                        )
                            .toLowerCase()


                    return (
                        name.includes(
                            normalizedSearch
                        ) ||
                        description.includes(
                            normalizedSearch
                        ) ||
                        note.includes(
                            normalizedSearch
                        )
                    )

                }
            )
            : []


    // ==================================================
    // SOLD SALE ITEMS
    // ==================================================

    const soldSaleItems =
        Array.isArray(
            soldItemRows
        )
            ? soldItemRows
            : []


    // ==================================================
    // FILTER SOLD SALE ITEMS
    // ==================================================

    const filteredSoldSaleItems =
        !normalizedSearch
            ? soldSaleItems
            : soldSaleItems.filter(
                saleItem => {

                    const name =
                        String(
                            saleItem?.name ||
                            saleItem?.product?.name ||
                            saleItem?.consignmentItem?.name ||
                            saleItem?.stock?.name ||
                            saleItem?.productName ||
                            ""
                        )
                            .toLowerCase()


                    const description =
                        String(
                            saleItem?.description ||
                            saleItem?.product?.description ||
                            saleItem?.consignmentItem?.description ||
                            saleItem?.stock?.description ||
                            saleItem?.productDescription ||
                            ""
                        )
                            .toLowerCase()


                    const note =
                        String(
                            saleItem?.note ||
                            saleItem?.product?.note ||
                            saleItem?.consignmentItem?.note ||
                            saleItem?.stock?.note ||
                            ""
                        )
                            .toLowerCase()


                    return (
                        name.includes(
                            normalizedSearch
                        ) ||
                        description.includes(
                            normalizedSearch
                        ) ||
                        note.includes(
                            normalizedSearch
                        )
                    )

                }
            )


    // ==================================================
    // CANCELLED PRODUCTS
    // ==================================================

    const cancelledProducts =
        Array.isArray(products)
            ? products.filter(
                isCancelled
            )
            : []


    // ==================================================
    // STOCK PRODUCTS
    // ==================================================

    const stockProducts =
        Array.isArray(products)
            ? products.filter(
                isStockProduct
            )
            : []


    // ==================================================
    // TOTAL STOCK ITEMS
    // ==================================================

    const totalStockItems =
        stockProducts.reduce(
            (
                total,
                product
            ) => {

                return (
                    total +
                    getQuantity(
                        product
                    )
                )

            },
            0
        )


    // ==================================================
    // STOCK VALUE
    // ==================================================

    const stockValue =
        stockProducts.reduce(
            (
                total,
                product
            ) => {

                const cost =
                    getCost(
                        product
                    )


                const quantity =
                    getQuantity(
                        product
                    )


                return (
                    total +
                    (
                        cost *
                        quantity
                    )
                )

            },
            0
        )


    // ==================================================
    // PRODUCT FORM
    // ==================================================

    const productForm =
        useProductForm({

            setProducts,

            loadProducts,

            setError

        })


    // ==================================================
    // PRODUCT FORM STATE
    // ==================================================

    const {

        showAddModal,
        setShowAddModal,

        editingProduct,
        setEditingProduct,

        addMode,
        setAddMode,

        savingSingle,

        form,
        setForm,

        handleFormChange,
        handleSaveProduct,

        resetForm,

        openAddModal,
        closeAddModal,

        openEditModal,

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

        savingSell,

        openSellModal,
        closeSellModal,

        confirmSell,

        resetSellForm

    } = productForm


    // ==================================================
    // SAFE SELL MODAL
    // ==================================================

    function handleOpenSellModal(
        product
    ) {

        if (
            typeof openSellModal !==
            "function"
        ) {

            console.error(
                "Products: openSellModal is not available",
                {
                    product,
                    productForm
                }
            )


            alert(
                "ระบบเปิดหน้าขายสินค้าไม่พร้อมใช้งาน กรุณาตรวจสอบ useProductForm"
            )


            return

        }


        openSellModal(
            product
        )

    }


    // ==================================================
    // SAFE CLOSE SELL MODAL
    // ==================================================

    function handleCloseSellModal() {

        if (
            typeof closeSellModal ===
            "function"
        ) {

            closeSellModal()

            return

        }


        setSellingProduct(
            null
        )


        if (
            typeof resetSellForm ===
            "function"
        ) {

            resetSellForm()

        }

    }


    // ==================================================
    // SAFE CONFIRM SELL
    // ==================================================

    async function handleConfirmSell(
        event
    ) {

        if (
            typeof confirmSell !==
            "function"
        ) {

            console.error(
                "Products: confirmSell is not available"
            )


            alert(
                "ระบบบันทึกการขายไม่พร้อมใช้งาน กรุณาตรวจสอบ useProductForm"
            )


            return

        }


        return confirmSell(
            event
        )

    }


    // ==================================================
    // BULK
    // ==================================================

    const productBulk =
        useProductBulk({

            loadProducts,

            setError,

            setShowAddModal,

            setEditingProduct,

            resetForm

        })


    // ==================================================
    // BULK STATE
    // ==================================================

    const {

        bulkText,
        setBulkText,

        bulkPreview,
        bulkInvalid,

        savingBulk,

        handleParseBulk,
        updateBulkQuantity,
        removeBulkItem,
        clearBulk,
        handleBulkAdd,

        bulkTotalQuantity,
        bulkTotalCost

    } = productBulk


    // ==================================================
    // SELECTION
    // ==================================================

    const productSelection =
        useProductSelection({

            products,

            filteredProducts,

            setProducts,

            setError

        })


    // ==================================================
    // SELECTION STATE
    // ==================================================

    const {

        selectedIds,
        setSelectedIds,

        allVisibleSelected,

        toggleRowSelected,
        toggleSelectAllVisible,

        bulkActionBusy,

        bulkDeleteSelected,
        bulkCancelSelected,

        deleteProduct

    } = productSelection


    // ==================================================
    // HISTORY
    // ==================================================

    const [
        showHistoryModal,
        setShowHistoryModal
    ] = useState(false)


    const [
        historyProductId,
        setHistoryProductId
    ] = useState(null)


    // ==================================================
    // OPEN HISTORY
    // ==================================================

    function openHistoryModal(
        product
    ) {

        const productId =
            getProductId(
                product
            )


        if (
            productId === null ||
            productId === undefined
        ) {

            alert(
                "ไม่พบรหัสสินค้าสำหรับดูประวัติ"
            )


            return

        }


        setHistoryProductId(
            productId
        )


        setShowHistoryModal(
            true
        )

    }


    // ==================================================
    // CLOSE HISTORY
    // ==================================================

    function closeHistoryModal() {

        setShowHistoryModal(
            false
        )


        setHistoryProductId(
            null
        )

    }


    // ==================================================
    // DELETE PRODUCT
    // ==================================================

    async function handleDelete(
        id
    ) {

        const product =
            products.find(
                item =>
                    getProductId(
                        item
                    ) === id
            )


        const productName =
            product?.name ||
            `#${id}`


        const confirmed =
            window.confirm(
                `ต้องการลบ "${productName}" หรือไม่?`
            )


        if (
            !confirmed
        ) {

            return

        }


        try {

            setError("")


            if (
                typeof deleteProduct !==
                "function"
            ) {

                throw new Error(
                    "ไม่พบฟังก์ชัน deleteProduct"
                )

            }


            await deleteProduct(
                id
            )


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

        } catch (err) {

            console.error(
                "handleDelete error:",
                err
            )


            alert(
                err?.response?.data?.message ||
                err?.message ||
                "ลบสินค้าไม่สำเร็จ"
            )

        }

    }


    // ==================================================
    // LOAD ALL
    // ==================================================

    async function loadAllData() {

        await loadProducts()

    }


    // ==================================================
    // REFRESH
    // ==================================================

    async function handleRefresh() {

        if (
            loading ||
            salesLoading
        ) {

            return

        }


        try {

            setError("")


            await loadAllData()

        } catch (err) {

            console.error(
                "handleRefresh error:",
                err
            )

        }

    }


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {

        loadAllData()
            .catch(
                err => {

                    console.error(
                        "initial product load error:",
                        err
                    )

                }
            )

    }, [])


    // ==================================================
    // ESCAPE KEY
    // ==================================================

    useEffect(() => {

        function handleEscape(
            event
        ) {

            if (
                event.key !==
                "Escape"
            ) {

                return

            }


            // ------------------------------------------
            // HISTORY
            // ------------------------------------------

            if (
                showHistoryModal
            ) {

                closeHistoryModal()

                return

            }


            // ------------------------------------------
            // ADD / EDIT
            // ------------------------------------------

            if (
                showAddModal &&
                !savingSingle &&
                !savingBulk
            ) {

                closeAddModal()

                return

            }


            // ------------------------------------------
            // SELL
            // ------------------------------------------

            if (
                sellingProduct &&
                !savingSell
            ) {

                handleCloseSellModal()

            }

        }


        window.addEventListener(
            "keydown",
            handleEscape
        )


        return () => {

            window.removeEventListener(
                "keydown",
                handleEscape
            )

        }

    }, [
        showHistoryModal,
        showAddModal,
        savingSingle,
        savingBulk,
        sellingProduct,
        savingSell
    ])


    // ==================================================
    // BULK TOOLBAR
    // ==================================================

    const showBulkToolbar =
        activeTab === "stock" &&
        selectedIds.size > 0


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div className="products-page">


            {/* ==================================================
                BACKGROUND
            ================================================== */}

            <div className="products-background">

                <span className="decor-sparkle sparkle-1">
                    ✦
                </span>

                <span className="decor-sparkle sparkle-2">
                    ✧
                </span>

                <span className="decor-sparkle sparkle-3">
                    ✦
                </span>

                <span className="decor-sparkle sparkle-4">
                    ⋆
                </span>


                <div className="decor-cloud cloud-1">

                    <span className="cloud-bubble bubble-a" />
                    <span className="cloud-bubble bubble-b" />
                    <span className="cloud-bubble bubble-c" />

                    <span className="cloud-base" />

                </div>


                <div className="decor-cloud cloud-2">

                    <span className="cloud-bubble bubble-a" />
                    <span className="cloud-bubble bubble-b" />
                    <span className="cloud-bubble bubble-c" />

                    <span className="cloud-base" />

                </div>


                <div className="decor-tree tree-left">

                    <div className="tree-crown crown-one" />
                    <div className="tree-crown crown-two" />
                    <div className="tree-crown crown-three" />

                    <div className="tree-trunk" />

                </div>


                <div className="decor-tree tree-right">

                    <div className="tree-crown crown-one" />
                    <div className="tree-crown crown-two" />
                    <div className="tree-crown crown-three" />

                    <div className="tree-trunk" />

                </div>


                <span className="decor-flower flower-1">
                    ✿
                </span>

                <span className="decor-flower flower-2">
                    ✿
                </span>

            </div>


            {/* ==================================================
                MAIN CONTAINER
                ================================================== */}

            <div className="products-container">


                {/* ==================================================
                    HEADER
                    ================================================== */}

                <header className="products-header">

                    <div className="products-title-area">

                        <div className="products-title-icon">

                            <Package
                                size={28}
                            />

                        </div>


                        <div>

                            <div className="products-title-line">

                                <h1>
                                    สินค้าของฉัน
                                </h1>

                                <span className="title-sparkle">
                                    ✨
                                </span>

                            </div>


                            <p>
                                จัดการสินค้าในสต็อก และดูประวัติสินค้าที่ขายไปแล้ว
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="products-add-button"
                        onClick={
                            openAddModal
                        }
                    >

                        <span className="button-icon">

                            <Plus
                                size={20}
                            />

                        </span>


                        <span>
                            เพิ่มสินค้า
                        </span>

                    </button>

                </header>


                {/* ==================================================
                    ERROR
                    ================================================== */}

                {error && (

                    <div className="products-error">

                        <span>
                            ⚠️
                        </span>


                        <span>
                            {error}
                        </span>


                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                            aria-label="ปิดข้อความแจ้งเตือน"
                        >

                            <X
                                size={16}
                            />

                        </button>

                    </div>

                )}


                {/* ==================================================
                    SUMMARY
                    ================================================== */}

                <ProductsSummary

                    totalStockItems={
                        totalStockItems
                    }

                    soldProductsCount={
                        soldSaleItems.length
                    }

                    stockValue={
                        stockValue
                    }

                    totalProfit={
                        totalProfit
                    }

                    number={
                        number
                    }

                    money={
                        money
                    }

                />


                {/* ==================================================
                    CONTENT
                    ================================================== */}

                <section className="products-content">


                    {/* ==================================================
                        TABS
                        ================================================== */}

                    <div className="products-tabs">


                        {/* ALL */}

                        <button
                            type="button"
                            className={
                                activeTab === "all"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setActiveTab(
                                    "all"
                                )
                            }
                        >

                            <Layers
                                size={18}
                            />

                            <span>
                                รายการสินค้า
                            </span>

                            <b>
                                {
                                    Array.isArray(
                                        products
                                    )
                                        ? products.length
                                        : 0
                                }
                            </b>

                        </button>


                        {/* STOCK */}

                        <button
                            type="button"
                            className={
                                activeTab === "stock"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setActiveTab(
                                    "stock"
                                )
                            }
                        >

                            <Package
                                size={18}
                            />

                            <span>
                                สินค้าในสต็อก
                            </span>

                            <b>
                                {number(
                                    totalStockItems
                                )}
                            </b>

                        </button>


                        {/* SOLD */}

                        <button
                            type="button"
                            className={
                                activeTab === "sold"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setActiveTab(
                                    "sold"
                                )
                            }
                        >

                            <ShoppingBag
                                size={18}
                            />

                            <span>
                                ขายไปแล้ว
                            </span>

                            <b>
                                {
                                    soldSaleItems.length
                                }
                            </b>

                        </button>

                    </div>


                    {/* ==================================================
                        TOOLBAR
                        ================================================== */}

                    <ProductsToolbar

                        search={
                            search
                        }

                        setSearch={
                            setSearch
                        }

                        handleRefresh={
                            handleRefresh
                        }

                        loading={
                            loading
                        }

                        salesLoading={
                            salesLoading
                        }

                        showBulkToolbar={
                            showBulkToolbar
                        }

                        selectedCount={
                            selectedIds.size
                        }

                        bulkCancelSelected={
                            bulkCancelSelected
                        }

                        bulkDeleteSelected={
                            bulkDeleteSelected
                        }

                        clearSelection={() =>
                            setSelectedIds(
                                new Set()
                            )
                        }

                        bulkActionBusy={
                            bulkActionBusy
                        }

                    />


                    {/* ==================================================
                        TABLE
                        ================================================== */}

                    <div className="products-table-wrapper">


                        {/* ==================================================
                            SOLD
                            ================================================== */}

                        {activeTab === "sold" ? (

                            <SoldProducts

                                saleItems={
                                    filteredSoldSaleItems
                                }

                                openEditModal={
                                    openEditModal
                                }

                                openHistoryModal={
                                    openHistoryModal
                                }

                                handleDelete={
                                    handleDelete
                                }

                                money={
                                    money
                                }

                                number={
                                    number
                                }

                                StatusBadge={
                                    StatusBadge
                                }

                                formatDateTime={
                                    formatDateTime
                                }

                            />

                        ) : (

                            <StockProducts

                                filteredProducts={
                                    filteredProducts
                                }

                                loading={
                                    loading
                                }

                                tableColumnCount={
                                    10
                                }

                                allVisibleSelected={
                                    allVisibleSelected
                                }

                                toggleSelectAllVisible={
                                    toggleSelectAllVisible
                                }

                                selectedIds={
                                    selectedIds
                                }

                                toggleRowSelected={
                                    toggleRowSelected
                                }

                                openEditModal={
                                    openEditModal
                                }

                                openHistoryModal={
                                    openHistoryModal
                                }

                                openSellModal={
                                    handleOpenSellModal
                                }

                                handleDelete={
                                    handleDelete
                                }

                                getQuantity={
                                    getQuantity
                                }

                                getCost={
                                    getCost
                                }

                                getSalePrice={
                                    getSalePrice
                                }

                                getProfit={
                                    product => {

                                        const id =
                                            getProductId(
                                                product
                                            )


                                        const value =
                                            profitByProductId?.get?.(
                                                String(
                                                    id
                                                )
                                            )


                                        return (
                                            value !==
                                            undefined
                                                ? value
                                                : null
                                        )

                                    }
                                }

                                formatDate={
                                    formatDate
                                }

                                money={
                                    money
                                }

                                number={
                                    number
                                }

                                StatusBadge={
                                    StatusBadge
                                }

                            />

                        )}

                    </div>


                    {/* ==================================================
                        FOOTER
                        ================================================== */}

                    {!loading &&
                        activeTab !== "sold" &&
                        filteredProducts.length > 0 && (

                        <div className="products-footer">

                            <span>

                                แสดง{" "}

                                <strong>
                                    {
                                        filteredProducts.length
                                    }
                                </strong>

                                {" "}รายการ

                            </span>


                            <span>

                                รวม{" "}

                                <strong>

                                    {number(
                                        filteredProducts.reduce(
                                            (
                                                total,
                                                product
                                            ) => {

                                                return (
                                                    total +
                                                    getQuantity(
                                                        product
                                                    )
                                                )

                                            },
                                            0
                                        )
                                    )}

                                </strong>

                                {" "}ชิ้น

                            </span>


                            {cancelledProducts.length > 0 && (

                                <span>

                                    ยกเลิกแล้ว{" "}

                                    <strong>
                                        {
                                            cancelledProducts.length
                                        }
                                    </strong>

                                    {" "}รายการ

                                </span>

                            )}

                        </div>

                    )}

                </section>

            </div>


            {/* ==================================================
                PRODUCT MODALS
                ================================================== */}

            <ProductsModals

                showAddModal={
                    showAddModal
                }

                closeAddModal={
                    closeAddModal
                }

                editingProduct={
                    editingProduct
                }

                addMode={
                    addMode
                }

                setAddMode={
                    setAddMode
                }

                form={
                    form
                }

                setForm={
                    setForm
                }

                handleFormChange={
                    handleFormChange
                }

                handleSaveProduct={
                    handleSaveProduct
                }

                savingSingle={
                    savingSingle
                }


                // ----------------------------------------------
                // BULK
                // ----------------------------------------------

                bulkText={
                    bulkText
                }

                setBulkText={
                    setBulkText
                }

                bulkPreview={
                    bulkPreview
                }

                bulkInvalid={
                    bulkInvalid
                }

                handleParseBulk={
                    handleParseBulk
                }

                updateBulkQuantity={
                    updateBulkQuantity
                }

                removeBulkItem={
                    removeBulkItem
                }

                clearBulk={
                    clearBulk
                }

                handleBulkAdd={
                    handleBulkAdd
                }

                savingBulk={
                    savingBulk
                }

                bulkTotalQuantity={
                    bulkTotalQuantity
                }

                bulkTotalCost={
                    bulkTotalCost
                }


                // ----------------------------------------------
                // SELL
                // ----------------------------------------------

                sellingProduct={
                    sellingProduct
                }

                closeSellModal={
                    handleCloseSellModal
                }

                sellQuantity={
                    sellQuantity
                }

                setSellQuantity={
                    setSellQuantity
                }

                sellPrice={
                    sellPrice
                }

                setSellPrice={
                    setSellPrice
                }

                sellShippingCost={
                    sellShippingCost
                }

                setSellShippingCost={
                    setSellShippingCost
                }

                sellOtherExpense={
                    sellOtherExpense
                }

                setSellOtherExpense={
                    setSellOtherExpense
                }

                confirmSell={
                    handleConfirmSell
                }

                savingSell={
                    savingSell
                }

                getQuantity={
                    getQuantity
                }

                money={
                    money
                }

                number={
                    number
                }

            />


            {/* ==================================================
                HISTORY
                ================================================== */}

            {showHistoryModal &&
                historyProductId !== null &&
                historyProductId !== undefined && (

                <ProductHistory

                    productId={
                        historyProductId
                    }

                    onClose={
                        closeHistoryModal
                    }

                />

            )}

        </div>

    )
}


// ======================================================
// EXPORT
// ======================================================

export default Products
