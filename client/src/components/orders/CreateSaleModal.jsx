import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    X,
    ShoppingBag,
    UserRound,
    Package,
    Trash2,
    FileText,
    Search,
    UserPlus,
    Plus,
    Minus,
    CalendarDays,
    Clock
} from "lucide-react";

import api from "../../api/axios";

import "../../styles/CreateSale.css";


// ======================================================
// API
// ======================================================

const CUSTOMER_API = "/customers";
const STOCK_API = "/stock";


// ======================================================
// HELPERS
// ======================================================

function num(value) {

    const n = Number(value);

    return Number.isFinite(n)
        ? n
        : 0;

}


function money(value) {

    return num(value).toLocaleString(
        "th-TH",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

}


// ======================================================
// WALK-IN CUSTOMER CHECK
// ======================================================

function isWalkInCustomer(customer) {

    if (!customer) {
        return false;
    }


    if (
        customer?.isWalkIn === true ||
        customer?.isWalkin === true ||
        customer?.is_walk_in === true
    ) {
        return true;
    }


    const type = String(
        customer?.type ??
        customer?.customerType ??
        customer?.customer_type ??
        ""
    )
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");


    if (
        type === "walkin" ||
        type === "walkincustomer"
    ) {
        return true;
    }


    const name = String(
        customer?.name ??
        ""
    )
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");


    if (
        name === "walkin" ||
        name === "walkincustomer"
    ) {
        return true;
    }


    return false;

}


// ======================================================
// CURRENT DATETIME
// ======================================================

function getCurrentDateTimeLocal() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );

    const hours =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );

    const minutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );

    return (
        `${year}-${month}-${day}` +
        `T${hours}:${minutes}`
    );

}


// ======================================================
// FORMAT DATETIME
// ======================================================

function formatSoldAt(value) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }


    return date.toLocaleString(
        "th-TH",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


// ======================================================
// CREATE SALE MODAL
// ======================================================

export default function CreateSaleModal({

    open,

    onClose,

    onSubmit,

    creating = false,

    error = "",

    success = false

}) {


    // ==================================================
    // DATA STATE
    // ==================================================

    const [customers, setCustomers] =
        useState([]);

    const [stocks, setStocks] =
        useState([]);

    const [loadingData, setLoadingData] =
        useState(false);

    const [dataError, setDataError] =
        useState("");


    // ==================================================
    // FORM STATE
    // ==================================================

    const [customerId, setCustomerId] =
        useState("");

    const [items, setItems] =
        useState([]);

    const [shippingCost, setShippingCost] =
        useState("");

    const [discount, setDiscount] =
        useState("");

    const [otherExpense, setOtherExpense] =
        useState("");

    const [note, setNote] =
        useState("");


    // ==================================================
    // SALE DATE / TIME
    // ==================================================

    const [soldAt, setSoldAt] =
        useState(
            getCurrentDateTimeLocal()
        );


    // ==================================================
    // CUSTOMER STATE
    // ==================================================

    const [customerTab, setCustomerTab] =
        useState("existing");

    const [newCustomerName, setNewCustomerName] =
        useState("");

    const [newCustomerPhone, setNewCustomerPhone] =
        useState("");

    const [newCustomerAddress, setNewCustomerAddress] =
        useState("");

    const [creatingCustomer, setCreatingCustomer] =
        useState(false);

    const [customerFormError, setCustomerFormError] =
        useState("");


    // ==================================================
    // SEARCH
    // ==================================================

    const [productSearch, setProductSearch] =
        useState("");

    const [customerSearch, setCustomerSearch] =
        useState("");


    // ==================================================
    // LOAD DATA
    // ==================================================

    useEffect(() => {

        if (!open) {
            return;
        }

        loadCreateSaleData();

    }, [
        open
    ]);


    // ==================================================
    // RESET SOLD AT WHEN OPEN
    // ==================================================

    useEffect(() => {

        if (!open) {
            return;
        }

        setSoldAt(
            getCurrentDateTimeLocal()
        );

    }, [
        open
    ]);


    // ==================================================
    // LOAD CREATE SALE DATA
    // ==================================================

    async function loadCreateSaleData() {

        try {

            setLoadingData(true);

            setDataError("");


            const [
                customersResponse,
                stockResponse
            ] = await Promise.all([

                api.get(
                    CUSTOMER_API,
                    {
                        withCredentials: true
                    }
                ),

                api.get(
                    STOCK_API,
                    {
                        withCredentials: true
                    }
                )

            ]);


            // ------------------------------------------
            // CUSTOMERS
            // ------------------------------------------

            const customerData =
                customersResponse?.data;

            const customerList =
                customerData?.customers ||
                customerData?.data ||
                customerData ||
                [];


            setCustomers(
                Array.isArray(
                    customerList
                )
                    ? customerList
                    : []
            );


            // ------------------------------------------
            // STOCK
            // ------------------------------------------

            const stockData =
                stockResponse?.data;

            const stockList =
                stockData?.stocks ||
                stockData?.stock ||
                stockData?.data ||
                stockData ||
                [];


            const normalizedStocks =
                Array.isArray(
                    stockList
                )
                    ? stockList
                    : [];


            setStocks(
                normalizedStocks
            );

        }
        catch (err) {

            console.error(
                "CreateSaleModal load error:",
                err
            );


            setDataError(

                err.response?.data?.message ||

                "ไม่สามารถโหลดข้อมูล Stock หรือลูกค้าได้"

            );

        }
        finally {

            setLoadingData(false);

        }

    }


    // ==================================================
    // RESET
    // ==================================================

    function resetForm() {

        setCustomerId("");

        setItems([]);

        setShippingCost("");

        setDiscount("");

        setOtherExpense("");

        setNote("");

        setSoldAt(
            getCurrentDateTimeLocal()
        );

        setProductSearch("");

        setCustomerSearch("");

        setCustomerTab("existing");

        setNewCustomerName("");

        setNewCustomerPhone("");

        setNewCustomerAddress("");

        setCustomerFormError("");

        setDataError("");

    }


    // ==================================================
    // CLOSE
    // ==================================================

    function handleClose() {

        if (
            creating ||
            creatingCustomer
        ) {
            return;
        }


        resetForm();


        if (
            typeof onClose ===
            "function"
        ) {
            onClose();
        }

    }


    // ==================================================
    // CUSTOMER SEARCH
    // ==================================================

    const filteredCustomers =
        useMemo(() => {

            const key =
                customerSearch
                    .trim()
                    .toLowerCase();


            return customers.filter(
                customer => {

                    if (
                        isWalkInCustomer(
                            customer
                        )
                    ) {
                        return false;
                    }


                    if (!key) {
                        return false;
                    }


                    const name =
                        String(
                            customer?.name ||
                            ""
                        ).toLowerCase();


                    const phone =
                        String(
                            customer?.phone ||
                            ""
                        ).toLowerCase();


                    return (

                        name.includes(key) ||

                        phone.includes(key)

                    );

                }
            );

        }, [
            customers,
            customerSearch
        ]);


    // ==================================================
    // STOCK HELPERS
    // ==================================================

    function getStockId(stock) {

        return (

            stock?.consignmentItemId ??

            stock?.consignmentItem?.id ??

            stock?.id

        );

    }


    function getStockName(stock) {

        return (

            stock?.name ??

            stock?.productName ??

            stock?.product?.name ??

            stock?.consignmentItem?.product?.name ??

            stock?.consignmentItem?.name ??

            "Product"

        );

    }


    function getStockSku(stock) {

        return (

            stock?.sku ??

            stock?.productSku ??

            stock?.product?.sku ??

            stock?.consignmentItem?.product?.sku ??

            stock?.consignmentItem?.sku ??

            ""

        );

    }


    function getStockCost(stock) {

        return (

            stock?.costPrice ??

            stock?.product?.costPrice ??

            stock?.consignmentItem?.costPrice ??

            0

        );

    }


    function getStockQuantity(stock) {

        return (

            stock?.quantityAvailable ??

            stock?.availableQuantity ??

            stock?.quantity ??

            stock?.stockQuantity ??

            stock?.remainingQuantity ??

            stock?.consignmentItem?.quantity ??

            0

        );

    }


    function getStockSalePrice(stock) {

        return (

            stock?.salePrice ??

            stock?.sellingPrice ??

            stock?.defaultSalePrice ??

            stock?.actualSalePrice ??

            stock?.product?.salePrice ??

            stock?.product?.sellingPrice ??

            getStockCost(stock)

        );

    }


    function getStockStatus(stock) {

        return String(

            stock?.status ??

            stock?.stockStatus ??

            stock?.consignmentItem?.status ??

            ""

        )
            .trim()
            .toUpperCase();

    }


    function isStockAvailable(stock) {

        if (!stock) {
            return false;
        }


        const quantity =
            getStockQuantity(
                stock
            );


        const status =
            getStockStatus(
                stock
            );


        if (
            status &&
            status !== "AVAILABLE"
        ) {
            return false;
        }


        return quantity > 0;

    }


    // ==================================================
    // AVAILABLE STOCK
    // ==================================================

    const availableStocks =
        useMemo(() => {

            const key =
                productSearch
                    .trim()
                    .toLowerCase();


            const selectedIds =
                new Set(

                    items.map(
                        item =>
                            String(
                                item.consignmentItemId
                            )
                    )

                );


            return stocks.filter(
                stock => {

                    if (
                        !isStockAvailable(
                            stock
                        )
                    ) {
                        return false;
                    }


                    const stockId =
                        getStockId(
                            stock
                        );


                    if (!stockId) {
                        return false;
                    }


                    if (
                        selectedIds.has(
                            String(
                                stockId
                            )
                        )
                    ) {
                        return false;
                    }


                    if (!key) {
                        return true;
                    }


                    const name =
                        getStockName(
                            stock
                        ).toLowerCase();


                    const sku =
                        getStockSku(
                            stock
                        ).toLowerCase();


                    return (

                        name.includes(key) ||

                        sku.includes(key)

                    );

                }
            );

        }, [
            stocks,
            productSearch,
            items
        ]);


    // ==================================================
    // ADD STOCK
    // ==================================================

    function handleAddStock(stock) {

        if (
            !stock ||
            !isStockAvailable(
                stock
            )
        ) {
            return;
        }


        const consignmentItemId =
            getStockId(
                stock
            );


        if (!consignmentItemId) {
            return;
        }


        const exists =
            items.some(
                item =>

                    String(
                        item.consignmentItemId
                    ) ===

                    String(
                        consignmentItemId
                    )

            );


        if (exists) {
            return;
        }


        const stockQuantity =
            getStockQuantity(
                stock
            );


        const costPrice =
            getStockCost(
                stock
            );


        const salePrice =
            getStockSalePrice(
                stock
            );


        setItems(prev => [

            ...prev,

            {

                id:
                    `${consignmentItemId}-${Date.now()}`,

                consignmentItemId:
                    Number(
                        consignmentItemId
                    ),

                name:
                    getStockName(
                        stock
                    ),

                sku:
                    getStockSku(
                        stock
                    ),

                costPrice:
                    costPrice,

                salePrice:
                    salePrice,

                quantity:
                    1,

                stockQuantity:
                    stockQuantity,

                stock:
                    stock

            }

        ]);


        setProductSearch("");

    }


    // ==================================================
    // REMOVE ITEM
    // ==================================================

    function handleRemoveProduct(
        itemId
    ) {

        setItems(prev =>

            prev.filter(
                item =>
                    item.id !== itemId
            )

        );

    }


    // ==================================================
    // QUANTITY
    // ==================================================

    function updateQuantity(
        itemId,
        value
    ) {

        setItems(prev =>

            prev.map(item => {

                if (
                    item.id !== itemId
                ) {
                    return item;
                }


                const max =
                    Math.floor(
                        num(
                            item.stockQuantity
                        )
                    );


                let next =
                    Number(
                        value
                    );


                if (
                    !Number.isFinite(next)
                ) {
                    next = 1;
                }


                next =
                    Math.floor(
                        next
                    );


                if (
                    next < 1
                ) {
                    next = 1;
                }


                if (
                    max > 0 &&
                    next > max
                ) {
                    next = max;
                }


                return {

                    ...item,

                    quantity:
                        next

                };

            })

        );

    }


    function decreaseQuantity(
        itemId
    ) {

        setItems(prev =>

            prev.map(item => {

                if (
                    item.id !== itemId
                ) {
                    return item;
                }


                const current =
                    Math.floor(
                        num(
                            item.quantity
                        )
                    );


                return {

                    ...item,

                    quantity:
                        Math.max(
                            1,
                            current - 1
                        )

                };

            })

        );

    }


    function increaseQuantity(
        itemId
    ) {

        setItems(prev =>

            prev.map(item => {

                if (
                    item.id !== itemId
                ) {
                    return item;
                }


                const current =
                    Math.floor(
                        num(
                            item.quantity
                        )
                    );


                const max =
                    Math.floor(
                        num(
                            item.stockQuantity
                        )
                    );


                if (
                    max <= 0
                ) {
                    return item;
                }


                if (
                    current >= max
                ) {
                    return item;
                }


                return {

                    ...item,

                    quantity:
                        current + 1

                };

            })

        );

    }


    // ==================================================
    // QUANTITY BUTTON HANDLERS
    // ==================================================
    //
    // เดิมมี onMouseDown + preventDefault + stopPropagation
    // ซ้อนกันหลายชั้นทั้ง div ครอบ / ปุ่ม / input
    // ซึ่งชนกันเองจนบางครั้งกดปุ่ม +/- หรือพิมพ์จำนวนไม่ได้
    // แก้เป็น onClick ธรรมดา ไม่ต้อง stopPropagation เพราะ
    // ปุ่มเป็น type="button" และ backdrop เช็คจาก
    // event.target === event.currentTarget อยู่แล้ว
    //

    function handleDecreaseClick(
        itemId
    ) {

        decreaseQuantity(
            itemId
        );

    }


    function handleIncreaseClick(
        itemId
    ) {

        increaseQuantity(
            itemId
        );

    }


    // ==================================================
    // SALE PRICE
    // ==================================================

    function updateSalePrice(
        itemId,
        value
    ) {

        setItems(prev =>

            prev.map(item => {

                if (
                    item.id !== itemId
                ) {
                    return item;
                }


                return {

                    ...item,

                    salePrice:
                        value

                };

            })

        );

    }


    // ==================================================
    // CUSTOMER TAB
    // ==================================================

    function handleSwitchCustomerTab(
        tab
    ) {

        setCustomerFormError("");

        setCustomerTab(
            tab
        );

    }


    // ==================================================
    // CREATE CUSTOMER
    // ==================================================

    async function createNewCustomerIfNeeded() {

        if (
            customerTab !== "new"
        ) {

            return customerId
                ? Number(
                    customerId
                )
                : null;

        }


        const name =
            newCustomerName.trim();


        if (!name) {

            setCustomerFormError(
                "กรุณากรอกชื่อลูกค้า"
            );

            throw new Error(
                "Customer name is required"
            );

        }


        try {

            setCreatingCustomer(true);

            setCustomerFormError("");


            const response =
                await api.post(

                    CUSTOMER_API,

                    {

                        name:
                            name,

                        phone:
                            newCustomerPhone.trim() ||
                            null,

                        address:
                            newCustomerAddress.trim() ||
                            null

                    },

                    {

                        withCredentials:
                            true

                    }

                );


            const created =
                response?.data?.customer ||
                response?.data;


            const newId =
                created?.id;


            if (!newId) {

                throw new Error(
                    "ไม่พบ id ลูกค้าที่สร้างใหม่"
                );

            }


            setCustomers(
                prev => [
                    ...prev,
                    created
                ]
            );


            return Number(
                newId
            );

        }
        catch (err) {

            console.error(
                "Create customer error:",
                err
            );


            setCustomerFormError(

                err.response?.data?.message ||

                "สร้างลูกค้าใหม่ไม่สำเร็จ"

            );


            throw err;

        }
        finally {

            setCreatingCustomer(false);

        }

    }


    // ==================================================
    // TOTAL
    // ==================================================

    const subtotal =
        useMemo(() => {

            return items.reduce(
                (
                    sum,
                    item
                ) => {

                    return (

                        sum +

                        (
                            num(
                                item.salePrice
                            ) *

                            num(
                                item.quantity
                            )
                        )

                    );

                },
                0
            );

        }, [
            items
        ]);


    // ==================================================
    // PRODUCT COST
    // ==================================================

    const totalProductCost =
        useMemo(() => {

            return items.reduce(
                (
                    sum,
                    item
                ) => {

                    return (

                        sum +

                        (
                            num(
                                item.costPrice
                            ) *

                            num(
                                item.quantity
                            )
                        )

                    );

                },
                0
            );

        }, [
            items
        ]);


    const shipping =
        num(
            shippingCost
        );


    const otherExpenseAmount =
        num(
            otherExpense
        );


    const discountAmount =
        num(
            discount
        );


    // ==================================================
    // AMOUNT TO COLLECT
    // ==================================================

    const amountToCollect =
        Math.max(

            0,

            Number(
                subtotal
            ) -

            Number(
                discountAmount
            )

        );


    // ==================================================
    // ESTIMATED PROFIT
    // ==================================================

    const estimatedProfit =
        Number(
            amountToCollect
        ) -

        Number(
            shipping
        ) -

        Number(
            otherExpenseAmount
        ) -

        Number(
            totalProductCost
        );


    // ==================================================
    // SUBMIT
    // ==================================================

    async function handleSubmit(
        event
    ) {

        event.preventDefault();


        if (
            creating ||
            creatingCustomer
        ) {
            return;
        }


        setCustomerFormError("");

        setDataError("");


        // ----------------------------------------------
        // SOLD AT
        // ----------------------------------------------

        if (
            !soldAt ||
            !String(
                soldAt
            ).trim()
        ) {

            setDataError(
                "กรุณาระบุวันที่และเวลาที่ขายจริง"
            );

            return;

        }


        // ----------------------------------------------
        // ITEMS
        // ----------------------------------------------

        if (
            items.length === 0
        ) {

            setDataError(
                "กรุณาเลือกสินค้าที่ต้องการขาย"
            );

            return;

        }


        // ----------------------------------------------
        // DISCOUNT
        // ----------------------------------------------

        if (
            discountAmount >
            subtotal
        ) {

            setDataError(
                "ส่วนลดต้องไม่มากกว่ายอดขายสินค้า"
            );

            return;

        }


        // ----------------------------------------------
        // VALIDATE ITEMS
        // ----------------------------------------------

        for (
            const item of items
        ) {

            const stockQuantity =
                num(
                    item.stockQuantity
                );


            const quantity =
                num(
                    item.quantity
                );


            if (
                !item.consignmentItemId
            ) {

                console.error(
                    "Missing consignmentItemId",
                    item
                );


                setDataError(
                    "พบสินค้าที่ไม่มีรหัสสินค้า"
                );

                return;

            }


            if (
                quantity < 1
            ) {

                setDataError(
                    `จำนวนสินค้า ${item.name || ""} ต้องมากกว่า 0`
                );

                return;

            }


            if (
                num(
                    item.salePrice
                ) < 0
            ) {

                setDataError(
                    `ราคาขายของ ${item.name || "สินค้า"} ไม่สามารถติดลบได้`
                );

                return;

            }


            if (
                stockQuantity <= 0
            ) {

                setDataError(
                    `สินค้า ${item.name || "รายการนี้"} ไม่มี Stock`
                );

                return;

            }


            if (
                quantity >
                stockQuantity
            ) {

                setDataError(
                    `สินค้า ${item.name || "รายการนี้"} มีจำนวนคงเหลือไม่เพียงพอ`
                );

                return;

            }

        }


        // ----------------------------------------------
        // CUSTOMER
        // ----------------------------------------------

        let resolvedCustomerId;


        try {

            resolvedCustomerId =
                await createNewCustomerIfNeeded();

        }
        catch (err) {

            return;

        }


        // ----------------------------------------------
        // PAYLOAD
        // ----------------------------------------------

        const payload = {

            customerId:
                resolvedCustomerId,

            soldAt:
                soldAt,

            items:

                items.map(
                    item => ({

                        consignmentItemId:
                            Number(
                                item.consignmentItemId
                            ),

                        quantity:
                            Number(
                                item.quantity
                            ),

                        salePrice:
                            num(
                                item.salePrice
                            )

                    })
                ),

            shippingCost:
                num(
                    shippingCost
                ),

            discount:
                num(
                    discount
                ),

            otherExpense:
                otherExpenseAmount,

            note:
                note.trim() || ""

        };


        console.log(
            "CREATE SALE PAYLOAD:",
            payload
        );


        if (
            typeof onSubmit !==
            "function"
        ) {

            console.error(
                "CreateSaleModal: onSubmit is not a function"
            );

            return;

        }


        try {

            await onSubmit(
                payload
            );

        }
        catch (err) {

            console.error(
                "CreateSaleModal submit error:",
                err
            );

        }

    }


    // ==================================================
    // SELECTED CUSTOMER
    // ==================================================

    const selectedCustomer =
        customers.find(
            customer =>

                String(
                    customer?.id
                ) ===

                String(
                    customerId
                )
        );


    // ==================================================
    // MODAL
    // ==================================================

    if (!open) {
        return null;
    }


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div

            className="create-sale-overlay"

            onMouseDown={event => {

                if (
                    event.target ===
                    event.currentTarget
                ) {

                    handleClose();

                }

            }}

        >

            {/* ==================================================
                SPACE DECOR
            ================================================== */}

            <div
                className="create-sale-space"
                aria-hidden="true"
            >

                <div
                    className="create-sale-glow create-sale-glow-one"
                />

                <div
                    className="create-sale-glow create-sale-glow-two"
                />


                {/* MOON */}

                <div className="create-sale-moon">

                    <svg
                        viewBox="0 0 120 120"
                        fill="none"
                    >

                        <circle
                            cx="60"
                            cy="60"
                            r="52"
                            fill="#FFE8B8"
                        />

                        <path
                            d="M60 8a52 52 0 1 0 52 52c0-2-.1-4-.3-6a40 40 0 1 1-45.7-45.7c-2-.2-4-.3-6-.3Z"
                            fill="#FFDA8C"
                        />

                        <circle
                            cx="42"
                            cy="46"
                            r="7"
                            fill="#FBC978"
                            opacity=".7"
                        />

                        <circle
                            cx="72"
                            cy="34"
                            r="4.5"
                            fill="#FBC978"
                            opacity=".6"
                        />

                        <circle
                            cx="80"
                            cy="66"
                            r="8"
                            fill="#FBC978"
                            opacity=".6"
                        />

                        <circle
                            cx="46"
                            cy="80"
                            r="5"
                            fill="#FBC978"
                            opacity=".55"
                        />

                    </svg>

                </div>


                {/* SPACESHIP */}

                <div className="create-sale-spaceship">

                    <svg
                        viewBox="0 0 140 120"
                        fill="none"
                    >

                        <path
                            d="M18 78c14 6 24 6 34 2"
                            stroke="#FFD37A"
                            strokeWidth="5"
                            strokeLinecap="round"
                            opacity=".55"
                        />

                        <path
                            d="M14 64c10 5 18 6 26 3"
                            stroke="#FF9ECB"
                            strokeWidth="4"
                            strokeLinecap="round"
                            opacity=".45"
                        />

                        <ellipse
                            cx="80"
                            cy="55"
                            rx="34"
                            ry="26"
                            fill="#FFF7EC"
                        />

                        <ellipse
                            cx="80"
                            cy="55"
                            rx="34"
                            ry="26"
                            fill="url(#createSaleShipGradient)"
                        />

                        <path
                            d="M52 60c4 18 20 30 28 30s24-12 28-30"
                            fill="#B587FF"
                            opacity=".18"
                        />

                        <circle
                            cx="82"
                            cy="50"
                            r="13"
                            fill="#9AD8FF"
                        />

                        <circle
                            cx="82"
                            cy="50"
                            r="13"
                            stroke="#6FB8E8"
                            strokeWidth="3"
                        />

                        <circle
                            cx="77"
                            cy="45"
                            r="3.2"
                            fill="#fff"
                            opacity=".8"
                        />

                        <path
                            d="M52 62c-10 2-16 10-16 18 8 0 16-4 20-12Z"
                            fill="#FF9ECB"
                        />

                        <path
                            d="M108 62c10 2 16 10 16 18-8 0-16-4-20-12Z"
                            fill="#FF9ECB"
                        />

                        <path
                            d="M70 84c2 8 6 14 10 16 4-2 8-8 10-16-6 4-14 4-20 0Z"
                            fill="#FFD37A"
                        />

                        <defs>

                            <linearGradient
                                id="createSaleShipGradient"
                                x1="46"
                                y1="30"
                                x2="114"
                                y2="80"
                            >

                                <stop
                                    stopColor="#ffffff"
                                />

                                <stop
                                    offset="1"
                                    stopColor="#F0E4FF"
                                />

                            </linearGradient>

                        </defs>

                    </svg>

                </div>


                {/* STARS */}

                <span className="create-sale-star star-gold star-one">
                    ✦
                </span>

                <span className="create-sale-star star-pink star-two">
                    ✦
                </span>

                <span className="create-sale-star star-purple star-three">
                    ✧
                </span>

                <span className="create-sale-star star-gold star-four">
                    ★
                </span>

                <span className="create-sale-star star-pink star-five">
                    ✦
                </span>

                <span className="create-sale-star star-purple star-six">
                    ⋆
                </span>


                {/* ORBITS */}

                <div
                    className="create-sale-orbit orbit-one"
                />

                <div
                    className="create-sale-orbit orbit-two"
                />


                {/* CAT */}

                <div className="create-sale-cat">

                    <svg
                        viewBox="0 0 160 150"
                        fill="none"
                    >

                        <circle
                            cx="80"
                            cy="82"
                            r="58"
                            fill="#EAF6FF"
                            opacity=".9"
                        />

                        <circle
                            cx="80"
                            cy="82"
                            r="58"
                            stroke="#DCEBF7"
                            strokeWidth="6"
                        />

                        <path
                            d="M42 46 L52 18 L68 44Z"
                            fill="#F5A468"
                        />

                        <path
                            d="M118 46 L108 18 L92 44Z"
                            fill="#F5A468"
                        />

                        <path
                            d="M48 42 L54 26 L62 40Z"
                            fill="#FFD3B0"
                        />

                        <path
                            d="M112 42 L106 26 L98 40Z"
                            fill="#FFD3B0"
                        />

                        <circle
                            cx="80"
                            cy="90"
                            r="46"
                            fill="#F8B57E"
                        />

                        <path
                            d="M34 88a46 46 0 0 0 92 4c-10 6-24 9-46 9s-36-3-46-9Z"
                            fill="#FCCB9C"
                        />

                        <ellipse
                            cx="56"
                            cy="100"
                            rx="9"
                            ry="6"
                            fill="#FF9EAE"
                            opacity=".55"
                        />

                        <ellipse
                            cx="104"
                            cy="100"
                            rx="9"
                            ry="6"
                            fill="#FF9EAE"
                            opacity=".55"
                        />

                        <ellipse
                            cx="64"
                            cy="86"
                            rx="6"
                            ry="7.5"
                            fill="#4B3F6B"
                        />

                        <ellipse
                            cx="96"
                            cy="86"
                            rx="6"
                            ry="7.5"
                            fill="#4B3F6B"
                        />

                        <circle
                            cx="66.5"
                            cy="83"
                            r="2"
                            fill="#fff"
                        />

                        <circle
                            cx="98.5"
                            cy="83"
                            r="2"
                            fill="#fff"
                        />

                        <path
                            d="M76 98c2.5 2.5 5.5 2.5 8 0M80 92v6"
                            stroke="#B9663F"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                        />

                    </svg>

                </div>

            </div>


            {/* ==================================================
                MODAL
            ================================================== */}

            <div className="create-sale-modal">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="create-sale-header">

                    <div className="create-sale-title">

                        <div className="create-sale-title-icon">

                            <ShoppingBag
                                size={27}
                            />

                        </div>

                        <div>

                            <h2>
                                สร้างรายการขาย
                            </h2>

                            <span>
                                เพิ่มสินค้าและข้อมูลการขาย
                            </span>

                        </div>

                    </div>


                    <button

                        type="button"

                        className="modal-close"

                        onClick={
                            handleClose
                        }

                        disabled={
                            creating ||
                            creatingCustomer
                        }

                        aria-label="ปิด"

                    >

                        <X
                            size={25}
                        />

                    </button>

                </div>


                {/* ==================================================
                    STATUS
                ================================================== */}

                {(error || dataError) && (

                    <div className="create-sale-error">

                        <strong>
                            ⚠️
                        </strong>

                        <span>
                            {
                                error ||
                                dataError
                            }
                        </span>

                    </div>

                )}


                {success && (

                    <div className="create-sale-success">

                        <strong>
                            ✓
                        </strong>

                        <span>
                            สร้างรายการขายสำเร็จ
                        </span>

                    </div>

                )}


                {/* ==================================================
                    LOADING
                ================================================== */}

                {loadingData ? (

                    <div className="orders-loading-screen">

                        <div className="loading-character">
                            🐱‍🚀
                        </div>

                        <strong>
                            กำลังโหลดข้อมูล...
                        </strong>

                        <span>
                            กำลังโหลด Stock และข้อมูลลูกค้า
                        </span>

                    </div>

                ) : (

                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >


                        {/* ==================================================
                            SALE DATE / TIME
                        ================================================== */}

                        <div className="sale-date-time-card">

                            <div className="sale-date-time-header">

                                <div className="sale-date-time-icon">

                                    <CalendarDays
                                        size={19}
                                    />

                                </div>

                                <div>

                                    <strong>
                                        วันที่และเวลาที่ขายจริง
                                    </strong>

                                    <small>
                                        วันที่ / เวลาที่เกิดการขายจริง
                                    </small>

                                </div>

                            </div>


                            <div className="customer-form-row">

                                <div className="customer-form-field full">

                                    <label>

                                        <CalendarDays
                                            size={16}
                                        />

                                        วันที่และเวลาขายจริง

                                    </label>

                                    <div className="money-input sale-datetime-input">

                                        <CalendarDays
                                            size={18}
                                        />

                                        <input

                                            type="datetime-local"

                                            value={
                                                soldAt
                                            }

                                            onChange={e =>
                                                setSoldAt(
                                                    e.target.value
                                                )
                                            }

                                            disabled={
                                                creating
                                            }

                                            required

                                        />

                                    </div>

                                </div>

                            </div>


                            <div className="sale-date-time-preview">

                                <Clock
                                    size={16}
                                />

                                <span>
                                    ขายจริง:
                                </span>

                                <strong>
                                    {
                                        formatSoldAt(
                                            soldAt
                                        )
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* ==================================================
                            BODY
                        ================================================== */}

                        <div className="create-sale-body">


                            {/* ==================================================
                                LEFT — PRODUCT
                            ================================================== */}

                            <div className="create-sale-section">

                                <div className="create-sale-section-title">

                                    <Package
                                        size={21}
                                    />

                                    <span>
                                        สินค้าใน Stock
                                    </span>

                                </div>


                                {/* PRODUCT SEARCH */}

                                <div className="product-selector-search">

                                    <Search
                                        size={20}
                                    />

                                    <input

                                        type="text"

                                        placeholder="ค้นหาชื่อสินค้า / SKU..."

                                        value={
                                            productSearch
                                        }

                                        onChange={e =>
                                            setProductSearch(
                                                e.target.value
                                            )
                                        }

                                        disabled={
                                            creating
                                        }

                                    />

                                </div>


                                {/* PRODUCT LIST */}

                                <div className="product-selector-list">

                                    {availableStocks.map(
                                        stock => {

                                            const stockQuantity =
                                                getStockQuantity(
                                                    stock
                                                );


                                            return (

                                                <button

                                                    type="button"

                                                    key={
                                                        getStockId(
                                                            stock
                                                        )
                                                    }

                                                    className="product-selector-item"

                                                    onClick={() =>
                                                        handleAddStock(
                                                            stock
                                                        )
                                                    }

                                                    disabled={
                                                        creating
                                                    }

                                                >

                                                    <div className="product-selector-item-info">

                                                        <strong>

                                                            {
                                                                getStockName(
                                                                    stock
                                                                )
                                                            }

                                                        </strong>

                                                        <span>

                                                            {
                                                                getStockSku(
                                                                    stock
                                                                )
                                                                    ? `SKU: ${getStockSku(stock)} · `
                                                                    : ""
                                                            }

                                                            <span className="product-selector-stock">

                                                                คงเหลือ{" "}

                                                                {
                                                                    stockQuantity
                                                                }

                                                            </span>

                                                        </span>

                                                    </div>


                                                    <div className="product-selector-price">

                                                        ฿

                                                        {money(
                                                            getStockSalePrice(
                                                                stock
                                                            )
                                                        )}

                                                        <Plus
                                                            size={19}
                                                        />

                                                    </div>

                                                </button>

                                            );

                                        }
                                    )}


                                    {availableStocks.length === 0 && (

                                        <div className="product-selector-empty">

                                            <Package
                                                size={31}
                                            />

                                            <strong>

                                                {
                                                    stocks.length === 0

                                                        ? "ไม่พบข้อมูล Stock"

                                                        : "ไม่มีสินค้าที่ AVAILABLE"

                                                }

                                            </strong>

                                            <span>
                                                ลองค้นหาสินค้าอื่น
                                            </span>

                                        </div>

                                    )}

                                </div>


                                {/* SELECTED PRODUCTS */}

                                <div className="selected-products-card">

                                    <div className="selected-products-card-header">

                                        <div>

                                            <Package
                                                size={21}
                                            />

                                            <strong>
                                                รายการสินค้าที่กำลังจะขาย
                                            </strong>

                                        </div>

                                        <span>

                                            {items.length}

                                            {" "}

                                            รายการ

                                        </span>

                                    </div>


                                    <div className="selected-products">

                                        {items.length === 0 ? (

                                            <div className="product-selector-empty">

                                                <Package
                                                    size={34}
                                                />

                                                <strong>
                                                    ยังไม่มีสินค้า
                                                </strong>

                                                <small>
                                                    เลือกสินค้าจาก Stock ด้านบน
                                                </small>

                                            </div>

                                        ) : (

                                            items.map(
                                                item => {

                                                    const currentQuantity =
                                                        num(
                                                            item.quantity
                                                        );

                                                    const maxQuantity =
                                                        num(
                                                            item.stockQuantity
                                                        );


                                                    return (

                                                        <div

                                                            className="selected-product-row"

                                                            key={
                                                                item.id
                                                            }

                                                        >

                                                            <div className="selected-product-name">

                                                                <strong>
                                                                    {
                                                                        item.name
                                                                    }
                                                                </strong>

                                                                <span>

                                                                    {item.sku
                                                                        ? `SKU: ${item.sku} · `
                                                                        : ""
                                                                    }

                                                                    ต้นทุน ฿

                                                                    {money(
                                                                        item.costPrice
                                                                    )}

                                                                </span>

                                                                <small>

                                                                    Stock:

                                                                    {" "}

                                                                    {
                                                                        item.stockQuantity
                                                                    }

                                                                </small>

                                                            </div>


                                                            {/* ==================================================
                                                                QUANTITY
                                                                ใช้ onClick ธรรมดา ไม่มี
                                                                preventDefault/stopPropagation
                                                                ซ้อนหลายชั้นแล้ว
                                                            ================================================== */}

                                                            <div className="create-sale-quantity">

                                                                <button

                                                                    type="button"

                                                                    className="quantity-decrease-button"

                                                                    onClick={() =>
                                                                        handleDecreaseClick(
                                                                            item.id
                                                                        )
                                                                    }

                                                                    disabled={

                                                                        creating ||

                                                                        currentQuantity <= 1

                                                                    }

                                                                    aria-label={`ลดจำนวน ${item.name}`}

                                                                >

                                                                    <Minus
                                                                        size={18}
                                                                    />

                                                                </button>


                                                                <input

                                                                    type="number"

                                                                    className="quantity-input"

                                                                    min="1"

                                                                    max={
                                                                        maxQuantity
                                                                    }

                                                                    step="1"

                                                                    value={
                                                                        currentQuantity
                                                                    }

                                                                    onChange={event =>
                                                                        updateQuantity(
                                                                            item.id,
                                                                            event.target.value
                                                                        )
                                                                    }

                                                                    disabled={
                                                                        creating
                                                                    }

                                                                    aria-label={`จำนวน ${item.name}`}

                                                                />


                                                                <button

                                                                    type="button"

                                                                    className="quantity-increase-button"

                                                                    onClick={() =>
                                                                        handleIncreaseClick(
                                                                            item.id
                                                                        )
                                                                    }

                                                                    disabled={

                                                                        creating ||

                                                                        maxQuantity <= 0 ||

                                                                        currentQuantity >= maxQuantity

                                                                    }

                                                                    aria-label={`เพิ่มจำนวน ${item.name}`}

                                                                >

                                                                    <Plus
                                                                        size={18}
                                                                    />

                                                                </button>

                                                            </div>


                                                            {/* ==================================================
                                                                SALE PRICE
                                                            ================================================== */}

                                                            <div className="create-sale-price">

                                                                <label>
                                                                    ราคาขาย / ชิ้น
                                                                </label>

                                                                <div>

                                                                    <span>
                                                                        ฿
                                                                    </span>

                                                                    <input

                                                                        type="number"

                                                                        min="0"

                                                                        step="0.01"

                                                                        value={
                                                                            item.salePrice
                                                                        }

                                                                        onChange={e =>
                                                                            updateSalePrice(
                                                                                item.id,
                                                                                e.target.value
                                                                            )
                                                                        }

                                                                        disabled={
                                                                            creating
                                                                        }

                                                                    />

                                                                </div>

                                                            </div>


                                                            {/* TOTAL */}

                                                            <div className="selected-product-total">

                                                                <small>
                                                                    รวม
                                                                </small>

                                                                <strong>

                                                                    ฿

                                                                    {money(

                                                                        num(
                                                                            item.salePrice
                                                                        ) *

                                                                        currentQuantity

                                                                    )}

                                                                </strong>

                                                            </div>


                                                            {/* REMOVE */}

                                                            <button

                                                                type="button"

                                                                className="selected-product-remove"

                                                                onClick={() =>
                                                                    handleRemoveProduct(
                                                                        item.id
                                                                    )
                                                                }

                                                                disabled={
                                                                    creating
                                                                }

                                                                aria-label="ลบสินค้า"

                                                            >

                                                                <Trash2
                                                                    size={20}
                                                                />

                                                            </button>

                                                        </div>

                                                    );

                                                }
                                            )

                                        )}

                                    </div>

                                </div>

                            </div>


                            {/* ==================================================
                                RIGHT — CUSTOMER / SALE
                            ================================================== */}

                            <div className="create-sale-section">


                                {/* CUSTOMER */}

                                <div className="create-sale-section-title">

                                    <UserRound
                                        size={21}
                                    />

                                    <span>
                                        ลูกค้า
                                    </span>

                                </div>


                                {/* CUSTOMER TABS */}

                                <div className="customer-tabs">

                                    <button

                                        type="button"

                                        className={

                                            "customer-tab" +

                                            (

                                                customerTab ===
                                                "existing"

                                                    ? " active"

                                                    : ""

                                            )

                                        }

                                        onClick={() =>
                                            handleSwitchCustomerTab(
                                                "existing"
                                            )
                                        }

                                        disabled={
                                            creating ||
                                            creatingCustomer
                                        }

                                    >

                                        <UserRound
                                            size={18}
                                        />

                                        ลูกค้าเดิม

                                    </button>


                                    <button

                                        type="button"

                                        className={

                                            "customer-tab" +

                                            (

                                                customerTab ===
                                                "new"

                                                    ? " active"

                                                    : ""

                                            )

                                        }

                                        onClick={() =>
                                            handleSwitchCustomerTab(
                                                "new"
                                            )
                                        }

                                        disabled={
                                            creating ||
                                            creatingCustomer
                                        }

                                    >

                                        <UserPlus
                                            size={18}
                                        />

                                        ลูกค้าใหม่

                                    </button>

                                </div>


                                {/* EXISTING CUSTOMER */}

                                {customerTab === "existing" && (

                                    <>

                                        <div className="product-selector-search">

                                            <Search
                                                size={20}
                                            />

                                            <input

                                                type="text"

                                                placeholder="ค้นหาชื่อลูกค้า / เบอร์โทร..."

                                                value={
                                                    customerSearch
                                                }

                                                onChange={e =>
                                                    setCustomerSearch(
                                                        e.target.value
                                                    )
                                                }

                                                disabled={
                                                    creating
                                                }

                                            />

                                        </div>


                                        <div className="customer-list">

                                            {filteredCustomers.map(
                                                customer => (

                                                    <button

                                                        type="button"

                                                        key={
                                                            customer.id
                                                        }

                                                        className={

                                                            "customer-option" +

                                                            (

                                                                String(
                                                                    customer.id
                                                                ) ===

                                                                String(
                                                                    customerId
                                                                )

                                                                    ? " selected"

                                                                    : ""

                                                            )

                                                        }

                                                        onClick={() =>
                                                            setCustomerId(
                                                                customer.id
                                                            )
                                                        }

                                                        disabled={
                                                            creating
                                                        }

                                                    >

                                                        <UserRound
                                                            size={20}
                                                        />

                                                        <div>

                                                            <strong>
                                                                {
                                                                    customer.name
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    customer.phone ||
                                                                    "-"
                                                                }
                                                            </small>

                                                        </div>

                                                    </button>

                                                )
                                            )}


                                            {customerSearch &&
                                                filteredCustomers.length === 0 && (

                                                    <div className="product-selector-empty">

                                                        <UserRound
                                                            size={28}
                                                        />

                                                        <strong>
                                                            ไม่พบลูกค้า
                                                        </strong>

                                                        <span>
                                                            ลองค้นหาด้วยชื่อหรือเบอร์โทรอื่น
                                                        </span>

                                                    </div>

                                                )}


                                            {!customerSearch && (

                                                <div className="product-selector-empty customer-search-empty">

                                                    <Search
                                                        size={28}
                                                    />

                                                    <strong>
                                                        ค้นหาลูกค้าเดิม
                                                    </strong>

                                                    <span>
                                                        พิมพ์ชื่อลูกค้าหรือเบอร์โทรเพื่อค้นหา
                                                    </span>

                                                </div>

                                            )}

                                        </div>


                                        {selectedCustomer && (

                                            <div className="selected-customer-info">

                                                <div>

                                                    <span>
                                                        ชื่อ
                                                    </span>

                                                    <strong>
                                                        {
                                                            selectedCustomer.name
                                                        }
                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        เบอร์โทร
                                                    </span>

                                                    <strong>
                                                        {
                                                            selectedCustomer.phone ||
                                                            "-"
                                                        }
                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        ที่อยู่
                                                    </span>

                                                    <strong>
                                                        {
                                                            selectedCustomer.address ||
                                                            "-"
                                                        }
                                                    </strong>

                                                </div>

                                            </div>

                                        )}

                                    </>

                                )}


                                {/* NEW CUSTOMER */}

                                {customerTab === "new" && (

                                    <div className="customer-form">

                                        {customerFormError && (

                                            <div className="customer-form-error">

                                                ⚠️

                                                <span>
                                                    {
                                                        customerFormError
                                                    }
                                                </span>

                                            </div>

                                        )}


                                        <div className="customer-form-row">

                                            <div className="customer-form-field full">

                                                <label>
                                                    ชื่อลูกค้า
                                                </label>

                                                <input

                                                    type="text"

                                                    placeholder="ชื่อ-นามสกุล"

                                                    value={
                                                        newCustomerName
                                                    }

                                                    onChange={e =>
                                                        setNewCustomerName(
                                                            e.target.value
                                                        )
                                                    }

                                                    disabled={
                                                        creating ||
                                                        creatingCustomer
                                                    }

                                                />

                                            </div>

                                        </div>


                                        <div className="customer-form-row">

                                            <div className="customer-form-field">

                                                <label>
                                                    เบอร์โทร
                                                </label>

                                                <input

                                                    type="text"

                                                    placeholder="08X-XXX-XXXX"

                                                    value={
                                                        newCustomerPhone
                                                    }

                                                    onChange={e =>
                                                        setNewCustomerPhone(
                                                            e.target.value
                                                        )
                                                    }

                                                    disabled={
                                                        creating ||
                                                        creatingCustomer
                                                    }

                                                />

                                            </div>


                                            <div className="customer-form-field customer-address-field">

                                                <label>
                                                    ที่อยู่
                                                </label>

                                                <textarea

                                                    className="customer-address-textarea"

                                                    rows={4}

                                                    placeholder={
                                                        "ที่อยู่จัดส่ง\nบ้านเลขที่ / หมู่ / ถนน / ตำบล / อำเภอ / จังหวัด / รหัสไปรษณีย์"
                                                    }

                                                    value={
                                                        newCustomerAddress
                                                    }

                                                    onChange={e =>
                                                        setNewCustomerAddress(
                                                            e.target.value
                                                        )
                                                    }

                                                    disabled={
                                                        creating ||
                                                        creatingCustomer
                                                    }

                                                    aria-label="ที่อยู่จัดส่ง"

                                                />

                                            </div>

                                        </div>


                                        <div className="customer-form-hint">

                                            💡

                                            <span>
                                                กรอกชื่อแล้วระบบจะสร้าง Customer ก่อนสร้าง Sale
                                            </span>

                                        </div>

                                    </div>

                                )}


                                {/* ==================================================
                                    SALE OPTIONS
                                ================================================== */}

                                <div className="sale-options">


                                    <div className="customer-form-row">

                                        <div className="customer-form-field">

                                            <label>
                                                ค่าจัดส่ง
                                            </label>

                                            <div className="money-input">

                                                <span>
                                                    ฿
                                                </span>

                                                <input

                                                    type="number"

                                                    min="0"

                                                    step="0.01"

                                                    placeholder="0"

                                                    value={
                                                        shippingCost
                                                    }

                                                    onChange={e =>
                                                        setShippingCost(
                                                            e.target.value
                                                        )
                                                    }

                                                    disabled={
                                                        creating
                                                    }

                                                />

                                            </div>

                                        </div>


                                        <div className="customer-form-field">

                                            <label>
                                                ส่วนลด
                                            </label>

                                            <div className="money-input">

                                                <span>
                                                    ฿
                                                </span>

                                                <input

                                                    type="number"

                                                    min="0"

                                                    step="0.01"

                                                    placeholder="0"

                                                    value={
                                                        discount
                                                    }

                                                    onChange={e =>
                                                        setDiscount(
                                                            e.target.value
                                                        )
                                                    }

                                                    disabled={
                                                        creating
                                                    }

                                                />

                                            </div>

                                        </div>

                                    </div>


                                    <div className="customer-form-row">

                                        <div className="customer-form-field full">

                                            <label>
                                                ค่าใช้จ่ายอื่นๆ
                                            </label>

                                            <div className="money-input">

                                                <span>
                                                    ฿
                                                </span>

                                                <input

                                                    type="number"

                                                    min="0"

                                                    step="1"

                                                    placeholder="0"

                                                    value={
                                                        otherExpense
                                                    }

                                                    onChange={e =>
                                                        setOtherExpense(
                                                            e.target.value
                                                        )
                                                    }

                                                    disabled={
                                                        creating
                                                    }

                                                />

                                            </div>


                                            <small className="create-sale-field-hint">
                                                ค่าใช้จ่ายที่เกิดขึ้นจากการขายครั้งนี้ เช่น ค่าธรรมเนียม หรือค่าใช้จ่ายเพิ่มเติม
                                            </small>

                                        </div>

                                    </div>


                                    <div className="customer-form-row">

                                        <div className="customer-form-field full">

                                            <label>

                                                <FileText
                                                    size={17}
                                                />

                                                หมายเหตุ

                                            </label>

                                            <textarea

                                                rows={3}

                                                placeholder="เพิ่มรายละเอียดหรือหมายเหตุของรายการขาย..."

                                                value={
                                                    note
                                                }

                                                onChange={e =>
                                                    setNote(
                                                        e.target.value
                                                    )
                                                }

                                                disabled={
                                                    creating
                                                }

                                            />

                                        </div>

                                    </div>


                                    {/* SUMMARY */}

                                    <div className="create-sale-summary">

                                        <div className="create-sale-summary-title">

                                            <ReceiptIcon />

                                            <span>
                                                สรุปรายการขาย
                                            </span>

                                        </div>


                                        <div className="create-sale-summary-row sale-date-summary-row">

                                            <span>

                                                <CalendarDays
                                                    size={16}
                                                />

                                                วันที่ขาย

                                            </span>

                                            <strong>
                                                {
                                                    formatSoldAt(
                                                        soldAt
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div className="create-sale-summary-row">

                                            <span>
                                                สินค้า
                                            </span>

                                            <strong>

                                                {items.length}

                                                {" "}

                                                รายการ

                                            </strong>

                                        </div>


                                        <div className="create-sale-summary-row">

                                            <span>
                                                Subtotal
                                            </span>

                                            <strong>
                                                ฿
                                                {money(
                                                    subtotal
                                                )}
                                            </strong>

                                        </div>


                                        <div className="create-sale-summary-row discount-row">

                                            <span>
                                                Discount
                                            </span>

                                            <strong>
                                                -฿
                                                {money(
                                                    discountAmount
                                                )}
                                            </strong>

                                        </div>


                                        <div className="create-sale-summary-total">

                                            <div>

                                                <span>
                                                    ยอดที่ลูกค้าต้องชำระ
                                                </span>

                                                <small>
                                                    รวมค่าจัดส่งไว้ในราคาสินค้าแล้ว
                                                </small>

                                            </div>

                                            <strong>
                                                ฿
                                                {money(
                                                    amountToCollect
                                                )}
                                            </strong>

                                        </div>


                                        <div className="create-sale-summary-row">

                                            <span>
                                                ค่าส่งจริง (ต้นทุน)
                                            </span>

                                            <strong>
                                                -฿
                                                {money(
                                                    shipping
                                                )}
                                            </strong>

                                        </div>


                                        <div className="create-sale-summary-row">

                                            <span>
                                                ค่าใช้จ่ายอื่นๆ (ต้นทุน)
                                            </span>

                                            <strong>
                                                -฿
                                                {money(
                                                    otherExpenseAmount
                                                )}
                                            </strong>

                                        </div>


                                        <div className="create-sale-summary-row">

                                            <span>
                                                ต้นทุนสินค้ารวม
                                            </span>

                                            <strong>
                                                -฿
                                                {money(
                                                    totalProductCost
                                                )}
                                            </strong>

                                        </div>


                                        <div className="create-sale-summary-total profit-row">

                                            <div>

                                                <span>
                                                    กำไรโดยประมาณ
                                                </span>

                                                <small>
                                                    ยอดที่ลูกค้าชำระ - ค่าส่งจริง - ค่าใช้จ่ายอื่นๆ - ต้นทุนสินค้า
                                                </small>

                                            </div>

                                            <strong>
                                                ฿
                                                {money(
                                                    estimatedProfit
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* ==================================================
                            FOOTER
                        ================================================== */}

                        <div className="create-sale-footer">

                            <button

                                type="button"

                                className="create-sale-cancel"

                                onClick={
                                    handleClose
                                }

                                disabled={
                                    creating ||
                                    creatingCustomer
                                }

                            >
                                ยกเลิก
                            </button>


                            <button

                                type="submit"

                                className="create-sale-submit"

                                disabled={

                                    creating ||

                                    creatingCustomer ||

                                    loadingData ||

                                    items.length === 0 ||

                                    !soldAt

                                }

                            >

                                <ShoppingBag
                                    size={20}
                                />

                                {creatingCustomer

                                    ? "กำลังสร้างลูกค้า..."

                                    : creating

                                        ? "กำลังสร้างการขาย..."

                                        : "สร้างการขาย"

                                }

                            </button>

                        </div>

                    </form>

                )}

            </div>

        </div>

    );

}


// ======================================================
// SMALL ICON
// ======================================================

function ReceiptIcon() {

    return (

        <div className="summary-receipt-icon">

            <span>
                🧾
            </span>

        </div>

    );

}