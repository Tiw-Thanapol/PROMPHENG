import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import api from "../../api/axios";


// ======================================================
// API
// ======================================================

const ORDER_API = "/orders";


// ======================================================
// HELPERS
// ======================================================

function normalizeText(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase();

}


function normalizeStatus(value) {

    return String(value ?? "")
        .trim()
        .toUpperCase();

}


function getOrderCustomerName(order) {

    return (
        order?.customer?.name ??
        order?.customerName ??
        ""
    );

}


function getOrderCustomerPhone(order) {

    return (
        order?.customer?.phone ??
        order?.customerPhone ??
        ""
    );

}


function getOrderNumber(order) {

    return (
        order?.orderNumber ??
        order?.orderNo ??
        order?.id ??
        ""
    );

}


// ======================================================
// HOOK
// ======================================================

export default function useOrders() {

    // ==================================================
    // STATE
    // ==================================================

    const [orders, setOrders] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [selected, setSelected] =
        useState(null);


    // ==================================================
    // LOAD ORDERS
    // ==================================================

    const loadOrders =
        useCallback(
            async () => {

                try {

                    setLoading(true);
                    setError("");


                    const response =
                        await api.get(
                            ORDER_API,
                            {
                                withCredentials: true
                            }
                        );


                    const data =
                        response?.data;


                    /*
                     * รองรับ response หลายรูปแบบ
                     *
                     * {
                     *   orders: [...]
                     * }
                     *
                     * หรือ
                     *
                     * [...]
                     */

                    const nextOrders =
                        Array.isArray(data)

                            ? data

                            : Array.isArray(
                                data?.orders
                            )

                                ? data.orders

                                : Array.isArray(
                                    data?.data
                                )

                                    ? data.data

                                    : [];


                    setOrders(
                        nextOrders
                    );


                }
                catch (err) {

                    console.error(
                        "Failed to load orders:",
                        err
                    );


                    setOrders([]);


                    setSelected(null);


                    setError(

                        err?.response?.data?.message ||

                        err?.response?.data?.error ||

                        "ไม่สามารถโหลดรายการขายได้"

                    );

                }
                finally {

                    setLoading(false);

                }

            },
            []
        );


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {

        loadOrders();

    }, [
        loadOrders
    ]);


    // ==================================================
    // FILTERED ORDERS
    // ==================================================

    const filteredOrders =
        useMemo(() => {

            const key =
                normalizeText(
                    search
                );


            if (!key) {

                return orders;

            }


            return orders.filter(
                order => {

                    const orderId =
                        normalizeText(
                            getOrderNumber(
                                order
                            )
                        );


                    const customerName =
                        normalizeText(
                            getOrderCustomerName(
                                order
                            )
                        );


                    const customerPhone =
                        normalizeText(
                            getOrderCustomerPhone(
                                order
                            )
                        );


                    /*
                     * รองรับการค้นหา:
                     *
                     * - Order ID
                     * - Order Number
                     * - ชื่อลูกค้า
                     * - เบอร์โทร
                     */

                    return (

                        orderId.includes(key) ||

                        customerName.includes(key) ||

                        customerPhone.includes(key)

                    );

                }
            );

        }, [
            orders,
            search
        ]);


    // ==================================================
    // ORDER SUMMARY
    // ==================================================

    const orderSummary =
        useMemo(() => {

            const total =
                orders.length;


            /*
             * Sale ที่ระบบสร้างสำเร็จ
             * โดย architecture ปัจจุบัน
             * ให้ถือ COMPLETED เป็นรายการขายสำเร็จ
             */

            const completed =
                orders.filter(
                    order =>

                        normalizeStatus(
                            order?.status
                        ) === "COMPLETED"

                ).length;


            const processing =
                orders.filter(
                    order =>

                        normalizeStatus(
                            order?.status
                        ) !== "COMPLETED"

                ).length;


            /*
             * ยอดรวมของรายการขาย
             *
             * รองรับ field:
             * totalAmount
             * grandTotal
             * total
             */

            const totalAmount =
                orders.reduce(
                    (
                        sum,
                        order
                    ) => {

                        const value =

                            order?.totalAmount ??

                            order?.grandTotal ??

                            order?.total ??

                            0;


                        const number =
                            Number(value);


                        return (

                            sum +

                            (
                                Number.isFinite(
                                    number
                                )
                                    ? number
                                    : 0
                            )

                        );

                    },
                    0
                );


            /*
             * จำนวนสินค้า
             *
             * Sale.items เป็น source of truth
             * สำหรับรายการสินค้าที่ขาย
             */

            const totalQuantity =
                orders.reduce(
                    (
                        sum,
                        order
                    ) => {

                        const items =
                            Array.isArray(
                                order?.items
                            )

                                ? order.items

                                : Array.isArray(
                                    order?.saleItems
                                )

                                    ? order.saleItems

                                    : [];


                        const quantity =
                            items.reduce(
                                (
                                    itemSum,
                                    item
                                ) => {

                                    const value =
                                        Number(
                                            item?.quantity ??
                                            0
                                        );


                                    return (

                                        itemSum +

                                        (
                                            Number.isFinite(
                                                value
                                            )
                                                ? value
                                                : 0
                                        )

                                    );

                                },
                                0
                            );


                        return (
                            sum +
                            quantity
                        );

                    },
                    0
                );


            return {

                total,

                processing,

                completed,

                totalAmount,

                totalQuantity

            };

        }, [
            orders
        ]);


    // ==================================================
    // OPEN ORDER
    // ==================================================

    const openOrder =
        useCallback(
            order => {

                if (!order) {

                    return;

                }


                setSelected(
                    order
                );

            },
            []
        );


    // ==================================================
    // CLOSE ORDER
    // ==================================================

    const closeOrder =
        useCallback(() => {

            setSelected(
                null
            );

        }, []);


    // ==================================================
    // CLEAR SEARCH
    // ==================================================

    const clearSearch =
        useCallback(() => {

            setSearch("");

        }, []);


    // ==================================================
    // RETRY
    // ==================================================

    const retry =
        useCallback(
            async () => {

                return loadOrders();

            },
            [
                loadOrders
            ]
        );


    // ==================================================
    // RETURN
    // ==================================================

    return {

        // ----------------------------------------------
        // DATA
        // ----------------------------------------------

        orders,

        filteredOrders,


        // ----------------------------------------------
        // LOADING / ERROR
        // ----------------------------------------------

        loading,

        error,


        // ----------------------------------------------
        // SEARCH
        // ----------------------------------------------

        search,

        setSearch,

        clearSearch,


        // ----------------------------------------------
        // SELECTED ORDER
        // ----------------------------------------------

        selected,

        setSelected,

        openOrder,

        closeOrder,


        // ----------------------------------------------
        // SUMMARY
        // ----------------------------------------------

        orderSummary,


        // ----------------------------------------------
        // ACTIONS
        // ----------------------------------------------

        loadOrders,

        reloadOrders:
            loadOrders,

        retry

    };

}