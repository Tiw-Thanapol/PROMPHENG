import React, {
    useEffect,
    useState
} from "react";

import {
    ShoppingBag,
    Plus
} from "lucide-react";

import "../styles/orders.css";


// ======================================================
// ORDERS COMPONENTS
// ======================================================

import OrderList
    from "../components/orders/OrderList";

import OrderDetailsModal
    from "../components/orders/OrderDetailsModal";

import CreateSaleModal
    from "../components/orders/CreateSaleModal";


// ======================================================
// ORDERS HOOKS
// ======================================================

import useOrders
    from "../hooks/orders/useOrders";

import useCreateSale
    from "../hooks/orders/useCreateSale";


// ======================================================
// PAGE
// ======================================================

export default function Orders() {

    // ==================================================
    // CREATE SALE MODAL
    // ==================================================

    const [
        createSaleOpen,
        setCreateSaleOpen
    ] = useState(false);


    // ==================================================
    // ORDERS
    // ==================================================

    const {
        orders,
        filteredOrders,

        loading,
        error,

        search,
        setSearch,
        clearSearch,

        selected,
        openOrder,
        closeOrder,

        orderSummary,

        loadOrders,
        reloadOrders,
        retry
    } = useOrders();


    // ==================================================
    // CREATE SALE
    // ==================================================

    const {
        creating,
        error: createSaleError,
        success: createSaleSuccess,

        createSale,
        resetCreateSale
    } = useCreateSale({

        onSuccess: async () => {

            /*
             * หลังสร้าง Sale สำเร็จ
             *
             * 1. Reload Orders
             * 2. ปิด Create Sale Modal
             */

            try {

                await reloadOrders();

            } catch (err) {

                console.error(
                    "Failed to reload orders after sale:",
                    err
                );

            }

            setCreateSaleOpen(false);

        }

    });


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {

        loadOrders();

    }, [loadOrders]);


    // ==================================================
    // OPEN CREATE SALE
    // ==================================================

    function handleOpenCreateSale() {

        /*
         * ป้องกันการเปิด Modal ซ้ำ
         * ขณะกำลังสร้าง Sale
         */

        if (creating) {

            return;

        }


        /*
         * Reset state จากการสร้าง Sale ครั้งก่อน
         */

        resetCreateSale();


        /*
         * เปิด Modal
         */

        setCreateSaleOpen(true);

    }


    // ==================================================
    // CLOSE CREATE SALE
    // ==================================================

    function handleCloseCreateSale() {

        /*
         * ไม่อนุญาตให้ปิด Modal
         * ขณะกำลัง submit
         */

        if (creating) {

            return;

        }


        /*
         * Clear state
         */

        resetCreateSale();


        /*
         * ปิด Modal
         */

        setCreateSaleOpen(false);

    }


    // ==================================================
    // EDIT ORDER
    // ==================================================

    function handleEditOrder(order) {

        /*
         * Edit Order ยังไม่ได้เปิดใช้งาน
         *
         * เก็บ callback นี้ไว้เพื่อให้
         * OrderList / OrderCard
         * ใช้ interface เดิมได้
         */

        console.log(
            "Edit order:",
            order
        );

    }


    // ==================================================
    // RETRY
    // ==================================================

    async function handleRetry() {

        try {

            await retry();

        } catch (err) {

            console.error(
                "Retry orders failed:",
                err
            );

        }

    }


    // ==================================================
    // LOADING SCREEN
    // ==================================================

    if (loading) {

        return (

            <div className="orders-page">

                {/* ======================================
                    BACKGROUND DECORATION
                ====================================== */}

                <div className="orders-background">

                    <span className="sparkle-one">
                        ✦
                    </span>

                    <span className="sparkle-two">
                        ✧
                    </span>

                    <span className="sparkle-three">
                        ✦
                    </span>

                    <span className="sparkle-four">
                        ✨
                    </span>

                </div>


                {/* ======================================
                    LOADING
                ====================================== */}

                <div className="orders-loading-screen">

                    <div className="loading-character">
                        🧸
                    </div>


                    <strong>
                        กำลังโหลดข้อมูลการขาย...
                    </strong>


                    <span>
                        กำลังเตรียมข้อมูลให้คุณ ✨
                    </span>

                </div>

            </div>

        );

    }


    // ==================================================
    // PAGE
    // ==================================================

    return (

        <div className="orders-page">


            {/* ==================================================
                BACKGROUND
            ================================================== */}

            <div className="orders-background">

                <span className="sparkle-one">
                    ✦
                </span>

                <span className="sparkle-two">
                    ✧
                </span>

                <span className="sparkle-three">
                    ✦
                </span>

                <span className="sparkle-four">
                    ✨
                </span>

            </div>


            {/* ==================================================
                MAIN CONTAINER
            ================================================== */}

            <div className="orders-container">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <header className="orders-header">


                    {/* ==========================================
                        TITLE
                    ========================================== */}

                    <div className="orders-title-area">

                        <div className="orders-title-icon">

                            <ShoppingBag
                                size={28}
                            />

                        </div>


                        <div>

                            <div className="orders-title-line">

                                <h1>
                                    การขายและจัดการออร์เดอร์
                                </h1>

                                <span>
                                    ✨
                                </span>

                            </div>


                            <p>
                                Manage customer orders
                            </p>

                        </div>

                    </div>


                    {/* ==========================================
                        HEADER ACTIONS
                    ========================================== */}

                    <div className="orders-header-actions">

                        <button
                            type="button"
                            className="orders-action-btn create-sale"
                            onClick={
                                handleOpenCreateSale
                            }
                            disabled={
                                creating
                            }
                        >

                            <Plus
                                size={28}
                            />

                            <span>
                                สร้างการขาย
                            </span>

                        </button>

                    </div>

                </header>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div className="orders-error">

                        <strong>
                            ⚠️
                        </strong>


                        <span>
                            {error}
                        </span>


                        <button
                            type="button"
                            onClick={
                                handleRetry
                            }
                        >
                            ลองใหม่
                        </button>

                    </div>

                )}


                {/* ==================================================
                    ORDER LIST
                ================================================== */}

                <OrderList

                    orders={
                        filteredOrders
                    }

                    search={
                        search
                    }

                    onSearchChange={
                        setSearch
                    }

                    onClearSearch={
                        clearSearch
                    }

                    onViewOrder={
                        openOrder
                    }

                    onEditOrder={
                        handleEditOrder
                    }

                    orderSummary={
                        orderSummary
                    }

                />

            </div>


            {/* ==================================================
                ORDER DETAILS MODAL
            ================================================== */}

            {selected && (

                <OrderDetailsModal

                    order={
                        selected
                    }

                    onClose={
                        closeOrder
                    }

                />

            )}


            {/* ==================================================
                CREATE SALE MODAL
            ================================================== */}

            {createSaleOpen && (

                <CreateSaleModal

                    open={
                        createSaleOpen
                    }

                    onClose={
                        handleCloseCreateSale
                    }

                    onSubmit={
                        createSale
                    }

                    creating={
                        creating
                    }

                    error={
                        createSaleError
                    }

                    success={
                        createSaleSuccess
                    }

                />

            )}

        </div>

    );

}