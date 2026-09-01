import React from "react"

import {
    Search,
    RefreshCw,
    X,
    Ban,
    Trash2
} from "lucide-react"


// ======================================================
// PRODUCTS TOOLBAR
// ======================================================

function ProductsToolbar({

    // ==================================================
    // SEARCH
    // ==================================================

    search = "",
    setSearch,

    // ==================================================
    // REFRESH
    // ==================================================

    handleRefresh,
    loading = false,
    salesLoading = false,

    // ==================================================
    // BULK
    // ==================================================

    showBulkToolbar = false,
    selectedCount = 0,

    bulkCancelSelected,
    bulkDeleteSelected,
    clearSelection,

    bulkActionBusy = false

}) {

    return (

        <>

            {/* ==================================================
                SEARCH / REFRESH TOOLBAR
            ================================================== */}

            <div className="products-toolbar">

                {/* ==================================================
                    SEARCH
                ================================================== */}

                <div className="products-search">

                    <Search size={19} />

                    <input
                        type="text"
                        placeholder="ค้นหาชื่อสินค้า..."
                        value={search}
                        onChange={
                            e =>
                                setSearch(
                                    e.target.value
                                )
                        }
                    />

                    {search && (

                        <button
                            type="button"
                            className="clear-search"
                            onClick={() =>
                                setSearch("")
                            }
                            aria-label="ล้างการค้นหา"
                        >
                            <X size={16} />
                        </button>

                    )}

                </div>


                {/* ==================================================
                    REFRESH
                ================================================== */}

                <button
                    type="button"
                    className="refresh-button"
                    onClick={
                        handleRefresh
                    }
                    disabled={
                        loading ||
                        salesLoading
                    }
                >

                    <RefreshCw
                        size={17}
                        className={
                            loading ||
                            salesLoading
                                ? "spin"
                                : ""
                        }
                    />

                    รีเฟรช

                </button>

            </div>


            {/* ==================================================
                BULK TOOLBAR
            ================================================== */}

            {showBulkToolbar && (

                <div className="bulk-toolbar">

                    {/* ==================================================
                        COUNT
                    ================================================== */}

                    <span className="bulk-toolbar-count">

                        เลือกอยู่{" "}

                        {selectedCount}

                        {" "}รายการ

                    </span>


                    {/* ==================================================
                        ACTIONS
                    ================================================== */}

                    <div className="bulk-toolbar-actions">

                        {/* ==================================================
                            CANCEL
                        ================================================== */}

                        <button
                            type="button"
                            className="bulk-btn bulk-btn-cancel"
                            onClick={
                                bulkCancelSelected
                            }
                            disabled={
                                bulkActionBusy
                            }
                        >

                            <Ban size={15} />

                            ยกเลิกที่เลือก

                        </button>


                        {/* ==================================================
                            DELETE
                        ================================================== */}

                        <button
                            type="button"
                            className="bulk-btn bulk-btn-danger"
                            onClick={
                                bulkDeleteSelected
                            }
                            disabled={
                                bulkActionBusy
                            }
                        >

                            <Trash2 size={15} />

                            ลบที่เลือก

                        </button>


                        {/* ==================================================
                            CLEAR SELECTION
                        ================================================== */}

                        <button
                            type="button"
                            className="bulk-btn bulk-btn-plain"
                            onClick={
                                clearSelection
                            }
                            disabled={
                                bulkActionBusy
                            }
                        >

                            ล้างการเลือก

                        </button>

                    </div>

                </div>

            )}

        </>

    )
}


export default ProductsToolbar