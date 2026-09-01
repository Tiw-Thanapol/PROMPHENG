import React, {
useMemo,
useRef,
useState,
useEffect
} from "react";

import {
ShoppingBag,
Package,
Search,
X,
ChevronDown,
ChevronLeft,
ChevronRight,
Eye,
Pencil,
ArrowUpDown,
CalendarDays
} from "lucide-react";

import "../../styles/OrderList.css";

// ======================================================
// ORDER LIST
// ======================================================
//
// ACCOUNTING MODEL
// ------------------------------------------------------
// Sale.totalAmount
//     = product sales
//     + shippingCharged
//     - discount
//
// Sale.shippingCharged
//     = shipping paid by customer
//
// Sale.shippingActual
//     = actual shipping expense
//
// SaleItem.costPriceAtSale
//     = historical product cost snapshot
//
// IMPORTANT
// ------------------------------------------------------
// - ห้ามใช้ shippingCost เป็น source of truth
// - ห้ามใช้ consignmentItem.costPrice สำหรับ Sale เก่า
// - ใช้ SaleItem.costPriceAtSale เท่านั้น
// - OrderList ไม่มี Modal ภายในตัวเอง
// - Orders.jsx เป็นคนควบคุม OrderDetailsModal
//
// ======================================================

export default function OrderList({


orders = [],

search = "",

onSearchChange,

onClearSearch,

onViewOrder,

onEditOrder


}) {


// ==================================================
// SORT
// ==================================================

const [
    sortBy,
    setSortBy
] = useState("updated_desc");


// ==================================================
// PAGINATION
// ==================================================

const [
    itemsPerPage,
    setItemsPerPage
] = useState(10);


const [
    currentPage,
    setCurrentPage
] = useState(1);


// ==================================================
// DATE PICKER
// ==================================================

const [
    selectedDate,
    setSelectedDate
] = useState(null);


const [
    calendarOpen,
    setCalendarOpen
] = useState(false);


const [
    calendarMonth,
    setCalendarMonth
] = useState(new Date());


const calendarRef = useRef(null);


// ==================================================
// CLOSE CALENDAR OUTSIDE
// ==================================================

useEffect(() => {

    function handleClickOutside(event) {

        if (
            calendarRef.current &&
            !calendarRef.current.contains(event.target)
        ) {
            setCalendarOpen(false);
        }

    }

    if (calendarOpen) {
        document.addEventListener(
            "mousedown",
            handleClickOutside
        );
    }

    return () => {
        document.removeEventListener(
            "mousedown",
            handleClickOutside
        );
    };

}, [calendarOpen]);


// ==================================================
// ESC
// ==================================================

useEffect(() => {

    function handleKeyDown(event) {

        if (
            event.key === "Escape" &&
            calendarOpen
        ) {
            setCalendarOpen(false);
        }

    }

    document.addEventListener(
        "keydown",
        handleKeyDown
    );

    return () => {
        document.removeEventListener(
            "keydown",
            handleKeyDown
        );
    };

}, [calendarOpen]);


// ==================================================
// RESET PAGE
// ==================================================

useEffect(() => {

    setCurrentPage(1);

}, [
    search,
    selectedDate,
    sortBy,
    itemsPerPage
]);


// ==================================================
// DATE HELPERS
// ==================================================

function normalizeDate(value) {

    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;

}


function dateKey(date) {

    if (!date) {
        return "";
    }

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");

}


function isSameDay(a, b) {

    if (!a || !b) {
        return false;
    }

    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );

}


function startOfDay(date) {

    const result = new Date(date);

    result.setHours(
        0,
        0,
        0,
        0
    );

    return result;

}


function isFutureDate(date) {

    return (
        startOfDay(date) >
        startOfDay(new Date())
    );

}


function isToday(date) {

    return isSameDay(
        date,
        new Date()
    );

}


// ==================================================
// MONEY
// ==================================================

function toNumber(value) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


function formatMoney(value) {

    return toNumber(value).toLocaleString(
        "th-TH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


// ==================================================
// DATE TIME
// ==================================================

function formatDateTime(value) {

    const date = normalizeDate(value);

    if (!date) {
        return "-";
    }

    return date.toLocaleString(
        "th-TH",
        {
            timeZone: "Asia/Bangkok",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function formatShortDate(value) {

    const date = normalizeDate(value);

    if (!date) {
        return "-";
    }

    return date.toLocaleDateString(
        "th-TH",
        {
            timeZone: "Asia/Bangkok",
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function formatSelectedDate(date) {

    if (!date) {
        return "เลือกวันที่";
    }

    return date.toLocaleDateString(
        "th-TH",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


// ==================================================
// CUSTOMER
// ==================================================

function getCustomerName(order) {

    return (
        order?.customer?.name ||
        order?.customerName ||
        "Walk-in Customer"
    );

}


function getOrderNo(order) {

    // ==================================================
    // SALE ORDER NUMBER
    // ==================================================
    // Source of truth MUST be the backend Sale.orderNo.
    // Do NOT generate / increment / fallback to order.id
    // on the frontend.
    // ==================================================

    const value = order?.orderNo;

    if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
    ) {
        return "-";
    }

    return String(value).trim();

}


function getCustomerPhone(order) {

    return (
        order?.customer?.phone ||
        order?.customerPhone ||
        ""
    );

}


// ==================================================
// ITEMS
// ==================================================

function getItems(order) {

    return Array.isArray(order?.items)
        ? order.items
        : [];

}


function getItemCount(order) {

    return getItems(order).reduce(
        (total, item) => {

            return (
                total +
                toNumber(item?.quantity)
            );

        },
        0
    );

}


function getProductCount(order) {

    return getItems(order).length;

}


function getItemName(item) {

    return (
        item?.consignmentItem?.product?.name ||
        item?.consignmentItem?.productName ||
        item?.consignmentItem?.name ||
        item?.product?.name ||
        item?.productName ||
        item?.name ||
        "สินค้า"
    );

}


function getItemSKU(item) {

    return (
        item?.consignmentItem?.sku ||
        item?.sku ||
        item?.product?.sku ||
        ""
    );

}


// ==================================================
// SALE PRICE
// ==================================================

function getItemPrice(item) {

    return toNumber(
        item?.salePrice ??
        item?.sellingPrice ??
        item?.price
    );

}


// ==================================================
// HISTORICAL COST
// ==================================================
//
// PRIORITY:
//
// 1. costPriceAtSale
// 2. legacy costPrice
// 3. legacy nested cost
//
// costPriceAtSale MUST be source of truth
// for migrated SaleItem records.
//
// ==================================================

function getItemCost(item) {

    if (
        item?.costPriceAtSale !== undefined &&
        item?.costPriceAtSale !== null &&
        item?.costPriceAtSale !== ""
    ) {
        return toNumber(
            item.costPriceAtSale
        );
    }

    return toNumber(
        item?.costPrice ??
        item?.cost ??
        item?.consignmentItem?.costPrice
    );

}


function getItemQuantity(item) {

    return toNumber(
        item?.quantity
    );

}


function getItemSubtotal(item) {

    return (
        getItemPrice(item) *
        getItemQuantity(item)
    );

}


function getItemCostTotal(item) {

    return (
        getItemCost(item) *
        getItemQuantity(item)
    );

}


function getItemProfit(item) {

    return (
        getItemSubtotal(item) -
        getItemCostTotal(item)
    );

}


// ==================================================
// PRODUCT SALES
// ==================================================

function getProductSubtotal(order) {

    return getItems(order).reduce(
        (total, item) => {

            return (
                total +
                getItemSubtotal(item)
            );

        },
        0
    );

}


// ==================================================
// SHIPPING CHARGED
// ==================================================
//
// Customer-paid shipping.
//
// DO NOT use shippingActual here.
//
// Legacy fields are kept only as fallback for
// older API payloads during migration.
//
// ==================================================

function getShippingCharged(order) {

    if (
        order?.shippingCharged !== undefined &&
        order?.shippingCharged !== null &&
        order?.shippingCharged !== ""
    ) {
        return toNumber(
            order.shippingCharged
        );
    }

    return toNumber(
        order?.shippingAmount ??
        order?.shipping
    );

}


// ==================================================
// SHIPPING ACTUAL
// ==================================================

function getShippingActual(order) {

    if (
        order?.shippingActual !== undefined &&
        order?.shippingActual !== null &&
        order?.shippingActual !== ""
    ) {
        return toNumber(
            order.shippingActual
        );
    }

    return 0;

}


// ==================================================
// SHIPPING PROFIT
// ==================================================

function getShippingProfit(order) {

    return (
        getShippingCharged(order) -
        getShippingActual(order)
    );

}


// ==================================================
// DISCOUNT
// ==================================================

function getDiscount(order) {

    return toNumber(
        order?.discountAmount ??
        order?.discount
    );

}


// ==================================================
// ORDER TOTAL
// ==================================================
//
// Financial source of truth:
//
// totalAmount
//
// fallback:
//
// product subtotal
// + shippingCharged
// - discount
//
// ==================================================

function getOrderTotal(order) {

    if (
        order?.totalAmount !== undefined &&
        order?.totalAmount !== null &&
        order?.totalAmount !== ""
    ) {
        return toNumber(
            order.totalAmount
        );
    }

    if (
        order?.grandTotal !== undefined &&
        order?.grandTotal !== null &&
        order?.grandTotal !== ""
    ) {
        return toNumber(
            order.grandTotal
        );
    }

    if (
        order?.finalAmount !== undefined &&
        order?.finalAmount !== null &&
        order?.finalAmount !== ""
    ) {
        return toNumber(
            order.finalAmount
        );
    }

    return (
        getProductSubtotal(order) +
        getShippingCharged(order) -
        getDiscount(order)
    );

}


// ==================================================
// ORDER PRODUCT COST
// ==================================================

function getOrderProductCost(order) {

    return getItems(order).reduce(
        (total, item) => {

            return (
                total +
                getItemCostTotal(item)
            );

        },
        0
    );

}


// ==================================================
// ORDER PRODUCT PROFIT
// ==================================================

function getOrderProductProfit(order) {

    return getItems(order).reduce(
        (total, item) => {

            return (
                total +
                getItemProfit(item)
            );

        },
        0
    );

}


// ==================================================
// ORDER GROSS PROFIT
// ==================================================
//
// Product profit
// +
// shipping profit
//
// NOTE:
// Other Expense entities are not automatically
// included here because they belong to Accounting.
//
// ==================================================

function getOrderGrossProfit(order) {

    return (
        getOrderProductProfit(order) +
        getShippingProfit(order)
    );

}


// ==================================================
// STATUS
// ==================================================

function getStatus(order) {

    const status = String(
        order?.status ||
        order?.saleStatus ||
        "completed"
    ).toLowerCase();

    if (
        status === "pending" ||
        status === "processing"
    ) {
        return {
            label: "รอดำเนินการ",
            className: "pending"
        };
    }

    if (
        status === "cancelled" ||
        status === "canceled"
    ) {
        return {
            label: "ยกเลิก",
            className: "cancelled"
        };
    }

    if (status === "refunded") {
        return {
            label: "คืนเงิน",
            className: "refunded"
        };
    }

    return {
        label: "สำเร็จ",
        className: "completed"
    };

}


// ==================================================
// ORDER DATE
// ==================================================

function getOrderDate(order) {

    return (
        normalizeDate(
            order?.updatedAt
        ) ||
        normalizeDate(
            order?.createdAt
        )
    );

}


// ==================================================
// DAILY SALES
// ==================================================

const dailySales = useMemo(() => {

    const map = new Map();

    orders.forEach(order => {

        const date =
            getOrderDate(order);

        if (!date) {
            return;
        }

        const key =
            dateKey(date);

        const current =
            map.get(key) || {
                count: 0,
                total: 0
            };

        current.count += 1;

        current.total +=
            getOrderTotal(order);

        map.set(
            key,
            current
        );

    });

    return map;

}, [orders]);


// ==================================================
// CALENDAR DAYS
// ==================================================

const calendarDays = useMemo(() => {

    const year =
        calendarMonth.getFullYear();

    const month =
        calendarMonth.getMonth();

    const firstDay =
        new Date(
            year,
            month,
            1
        );

    const lastDay =
        new Date(
            year,
            month + 1,
            0
        );

    const startDay =
        firstDay.getDay();

    const totalDays =
        lastDay.getDate();

    const days = [];

    for (
        let i = 0;
        i < startDay;
        i++
    ) {
        days.push(null);
    }

    for (
        let day = 1;
        day <= totalDays;
        day++
    ) {
        days.push(
            new Date(
                year,
                month,
                day
            )
        );
    }

    return days;

}, [calendarMonth]);


// ==================================================
// MONTH OPTIONS
// ==================================================

const monthOptions = useMemo(
    () => {

        return Array.from(
            { length: 12 },
            (_, index) => {

                const date =
                    new Date(
                        2020,
                        index,
                        1
                    );

                return {
                    value: index,
                    label:
                        date.toLocaleDateString(
                            "th-TH",
                            {
                                month: "long"
                            }
                        )
                };

            }
        );

    },
    []
);


// ==================================================
// YEAR OPTIONS
// ==================================================

const yearOptions = useMemo(
    () => {

        const currentYear =
            new Date().getFullYear();

        const years = [];

        for (
            let year = currentYear;
            year >= currentYear - 10;
            year--
        ) {
            years.push(year);
        }

        return years;

    },
    []
);


// ==================================================
// CALENDAR MONTH LABEL
// ==================================================

const calendarMonthLabel =
    calendarMonth.toLocaleDateString(
        "th-TH",
        {
            month: "long",
            year: "numeric"
        }
    );


// ==================================================
// CHANGE CALENDAR MONTH
// ==================================================

function changeCalendarMonth(amount) {

    setCalendarMonth(current => {

        const next =
            new Date(
                current.getFullYear(),
                current.getMonth() + amount,
                1
            );

        const now =
            new Date();

        const currentMonth =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

        if (
            next > currentMonth
        ) {
            return current;
        }

        return next;

    });

}


// ==================================================
// MONTH CHANGE
// ==================================================

function handleMonthChange(event) {

    const month =
        Number(
            event.target.value
        );

    setCalendarMonth(current => {

        const next =
            new Date(
                current.getFullYear(),
                month,
                1
            );

        const now =
            new Date();

        const currentMonth =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

        if (
            next > currentMonth
        ) {
            return current;
        }

        return next;

    });

}


// ==================================================
// YEAR CHANGE
// ==================================================

function handleYearChange(event) {

    const year =
        Number(
            event.target.value
        );

    const next =
        new Date(
            year,
            calendarMonth.getMonth(),
            1
        );

    const now =
        new Date();

    const currentMonth =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

    if (
        next > currentMonth
    ) {
        return;
    }

    setCalendarMonth(next);

}


// ==================================================
// SELECT DATE
// ==================================================

function handleSelectDate(date) {

    if (!date) {
        return;
    }

    if (
        isFutureDate(date)
    ) {
        return;
    }

    setSelectedDate(date);

    setCalendarOpen(false);

}


// ==================================================
// TODAY
// ==================================================

function handleToday() {

    const today =
        new Date();

    setSelectedDate(today);

    setCalendarMonth(
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        )
    );

    setCalendarOpen(false);

}


// ==================================================
// CLEAR DATE
// ==================================================

function handleClearDate() {

    setSelectedDate(null);

    setCalendarOpen(false);

}


// ==================================================
// OPEN CALENDAR
// ==================================================

function openCalendar() {

    if (!calendarOpen) {

        const baseDate =
            selectedDate ||
            new Date();

        setCalendarMonth(
            new Date(
                baseDate.getFullYear(),
                baseDate.getMonth(),
                1
            )
        );

    }

    setCalendarOpen(
        current => !current
    );

}


// ==================================================
// OPEN ORDER
// ==================================================

function openOrderPopup(order) {

    if (!order) {
        return;
    }

    if (
        typeof onViewOrder ===
        "function"
    ) {
        onViewOrder(order);
    }

}


// ==================================================
// SEARCH + DATE + SORT
// ==================================================

const visibleOrders = useMemo(() => {

    const key =
        search
            .trim()
            .toLowerCase();

    let result =
        [...orders];


    // ------------------------------------------
    // SEARCH
    // ------------------------------------------

    if (key) {

        result =
            result.filter(order => {

                const name =
                    getCustomerName(
                        order
                    ).toLowerCase();

                const phone =
                    getCustomerPhone(
                        order
                    ).toLowerCase();

                const orderNo =
                    getOrderNo(order).toLowerCase();

                const id =
                    String(
                        order?.id ?? ""
                    ).toLowerCase();

                const itemNames =
                    getItems(order)
                        .map(item =>
                            getItemName(item)
                        )
                        .join(" ")
                        .toLowerCase();

                const sku =
                    getItems(order)
                        .map(item =>
                            getItemSKU(item)
                        )
                        .join(" ")
                        .toLowerCase();

                return (
                    orderNo.includes(key) ||
                    id.includes(key) ||
                    name.includes(key) ||
                    phone.includes(key) ||
                    itemNames.includes(key) ||
                    sku.includes(key)
                );

            });

    }


    // ------------------------------------------
    // DATE FILTER
    // ------------------------------------------

    if (selectedDate) {

        const selectedKey =
            dateKey(
                selectedDate
            );

        result =
            result.filter(order => {

                const orderDate =
                    getOrderDate(order);

                if (!orderDate) {
                    return false;
                }

                return (
                    dateKey(orderDate) ===
                    selectedKey
                );

            });

    }


    // ------------------------------------------
    // SORT
    // ------------------------------------------

    result.sort((a, b) => {

        switch (sortBy) {

            case "updated_desc": {

                const aTime =
                    getOrderDate(a)?.getTime() || 0;

                const bTime =
                    getOrderDate(b)?.getTime() || 0;

                return (
                    bTime -
                    aTime
                );

            }


            case "created_desc": {

                const aTime =
                    normalizeDate(
                        a?.createdAt
                    )?.getTime() || 0;

                const bTime =
                    normalizeDate(
                        b?.createdAt
                    )?.getTime() || 0;

                return (
                    bTime -
                    aTime
                );

            }


            case "created_asc": {

                const aTime =
                    normalizeDate(
                        a?.createdAt
                    )?.getTime() || 0;

                const bTime =
                    normalizeDate(
                        b?.createdAt
                    )?.getTime() || 0;

                return (
                    aTime -
                    bTime
                );

            }


            case "total_desc":

                return (
                    getOrderTotal(b) -
                    getOrderTotal(a)
                );


            case "total_asc":

                return (
                    getOrderTotal(a) -
                    getOrderTotal(b)
                );


            case "customer_asc":

                return (
                    getCustomerName(a)
                        .localeCompare(
                            getCustomerName(b),
                            "th"
                        )
                );


            case "customer_desc":

                return (
                    getCustomerName(b)
                        .localeCompare(
                            getCustomerName(a),
                            "th"
                        )
                );


            default:
                return 0;

        }

    });

    return result;

}, [
    orders,
    search,
    selectedDate,
    sortBy
]);


// ==================================================
// PAGINATION
// ==================================================

const totalItems =
    visibleOrders.length;

const totalPages =
    Math.max(
        1,
        Math.ceil(
            totalItems /
            itemsPerPage
        )
    );


useEffect(() => {

    if (
        currentPage >
        totalPages
    ) {
        setCurrentPage(
            totalPages
        );
    }

}, [
    currentPage,
    totalPages
]);


const paginatedOrders =
    useMemo(() => {

        const start =
            (
                currentPage - 1
            ) *
            itemsPerPage;

        const end =
            start +
            itemsPerPage;

        return visibleOrders.slice(
            start,
            end
        );

    }, [
        visibleOrders,
        currentPage,
        itemsPerPage
    ]);


const paginationStart =
    totalItems === 0
        ? 0
        : (
            (
                currentPage - 1
            ) *
            itemsPerPage
        ) + 1;


const paginationEnd =
    Math.min(
        currentPage *
        itemsPerPage,
        totalItems
    );


// ==================================================
// PAGE
// ==================================================

function goToPage(page) {

    const nextPage =
        Math.max(
            1,
            Math.min(
                page,
                totalPages
            )
        );

    setCurrentPage(
        nextPage
    );

}


// ==================================================
// ITEMS PER PAGE
// ==================================================

function handleItemsPerPageChange(event) {

    const value =
        Number(
            event.target.value
        );

    if (
        value !== 10 &&
        value !== 20
    ) {
        return;
    }

    setItemsPerPage(value);

    setCurrentPage(1);

}


// ==================================================
// SORT LABEL
// ==================================================

const sortLabel = {

    updated_desc:
        "อัปเดตล่าสุด",

    created_desc:
        "สร้างล่าสุด",

    created_asc:
        "สร้างเก่าสุด",

    total_desc:
        "ยอดขายมาก → น้อย",

    total_asc:
        "ยอดขายน้อย → มาก",

    customer_asc:
        "ลูกค้า A → Z",

    customer_desc:
        "ลูกค้า Z → A"

}[sortBy];


// ==================================================
// PAGINATION CONTROLS
// ==================================================

function PaginationControls() {

    return (

        <div className="orders-pagination">

            <div className="orders-pagination-left">

                <span>
                    Show
                </span>

                <div className="orders-per-page">

                    <select
                        value={itemsPerPage}
                        onChange={
                            handleItemsPerPageChange
                        }
                        aria-label="Items per page"
                    >

                        <option value={10}>
                            10
                        </option>

                        <option value={20}>
                            20
                        </option>

                    </select>

                    <ChevronDown
                        size={14}
                        className="orders-per-page-icon"
                    />

                </div>

                <span>
                    per page
                </span>

            </div>


            <div className="orders-pagination-right">

                <span className="orders-pagination-range">

                    {paginationStart}
                    -
                    {paginationEnd}

                    {" "}
                    of
                    {" "}
                    {totalItems}

                </span>


                <button
                    type="button"
                    className="orders-pagination-btn"
                    disabled={
                        currentPage <= 1
                    }
                    onClick={() => {
                        goToPage(
                            currentPage - 1
                        );
                    }}
                >

                    <ChevronLeft
                        size={16}
                    />

                    <span>
                        Previous
                    </span>

                </button>


                <span className="orders-pagination-page">

                    {currentPage}
                    {" "}
                    /
                    {" "}
                    {totalPages}

                </span>


                <button
                    type="button"
                    className="orders-pagination-btn"
                    disabled={
                        currentPage >=
                        totalPages
                    }
                    onClick={() => {
                        goToPage(
                            currentPage + 1
                        );
                    }}
                >

                    <span>
                        Next
                    </span>

                    <ChevronRight
                        size={16}
                    />

                </button>

            </div>

        </div>

    );

}


// ==================================================
// RENDER
// ==================================================

return (

    <section className="orders-content">


        {/* ==================================================
            TOOLBAR
        ================================================== */}

        <div className="orders-toolbar">


            {/* TITLE */}

            <div className="orders-section-title">

                <div className="section-title-icon">

                    <ShoppingBag
                        size={19}
                        strokeWidth={2.3}
                    />

                </div>

                <div>

                    <strong>
                        รายการออเดอร์
                    </strong>

                    <span>
                        All customer purchases
                    </span>

                </div>

            </div>


            {/* CONTROLS */}

            <div className="orders-list-controls">


                {/* SEARCH */}

                <div className="orders-search">

                    <Search
                        size={18}
                        strokeWidth={2}
                    />

                    <input
                        type="text"
                        placeholder="ค้นหา Sale Order / ลูกค้า / เบอร์โทร..."
                        value={search}
                        onChange={event => {

                            onSearchChange?.(
                                event.target.value
                            );

                        }}
                    />

                    {search && (

                        <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => {

                                onClearSearch?.();

                            }}
                        >

                            <X size={15} />

                        </button>

                    )}

                </div>


                {/* DATE PICKER */}

                <div
                    className="orders-date-picker"
                    ref={calendarRef}
                >

                    <button
                        type="button"
                        className={`orders-date-trigger ${
                            selectedDate
                                ? "has-date"
                                : ""
                        }`}
                        onClick={
                            openCalendar
                        }
                    >

                        <CalendarDays
                            size={17}
                            strokeWidth={2.2}
                        />

                        <span>

                            {selectedDate
                                ? formatSelectedDate(
                                    selectedDate
                                )
                                : "เลือกวันที่"}

                        </span>

                    </button>


                    {calendarOpen && (

                        <div
                            className="orders-calendar"
                            onClick={event => {
                                event.stopPropagation();
                            }}
                        >


                            {/* CALENDAR TOP */}

                            <div className="orders-calendar-top">

                                <div className="calendar-title">

                                    <CalendarDays
                                        size={17}
                                    />

                                    <span>
                                        เลือกวันที่
                                    </span>

                                </div>


                                <button
                                    type="button"
                                    className="calendar-close-btn"
                                    onClick={() => {
                                        setCalendarOpen(
                                            false
                                        );
                                    }}
                                >

                                    <X size={16} />

                                </button>

                            </div>


                            {/* MONTH / YEAR */}

                            <div className="orders-calendar-selectors">

                                <button
                                    type="button"
                                    className="calendar-month-nav"
                                    onClick={() => {
                                        changeCalendarMonth(
                                            -1
                                        );
                                    }}
                                    aria-label="Previous month"
                                >

                                    <ChevronLeft
                                        size={18}
                                    />

                                </button>


                                <div className="calendar-select-wrap">

                                    <select
                                        value={
                                            calendarMonth.getMonth()
                                        }
                                        onChange={
                                            handleMonthChange
                                        }
                                        aria-label="เลือกเดือน"
                                    >

                                        {monthOptions.map(
                                            month => (

                                                <option
                                                    key={
                                                        month.value
                                                    }
                                                    value={
                                                        month.value
                                                    }
                                                >

                                                    {month.label}

                                                </option>

                                            )
                                        )}

                                    </select>

                                    <ChevronDown
                                        size={14}
                                        className="calendar-select-icon"
                                    />

                                </div>


                                <div className="calendar-select-wrap year">

                                    <select
                                        value={
                                            calendarMonth.getFullYear()
                                        }
                                        onChange={
                                            handleYearChange
                                        }
                                        aria-label="เลือกปี"
                                    >

                                        {yearOptions.map(
                                            year => (

                                                <option
                                                    key={year}
                                                    value={year}
                                                >

                                                    {year + 543}

                                                </option>

                                            )
                                        )}

                                    </select>

                                    <ChevronDown
                                        size={14}
                                        className="calendar-select-icon"
                                    />

                                </div>


                                <button
                                    type="button"
                                    className="calendar-month-nav"
                                    onClick={() => {
                                        changeCalendarMonth(
                                            1
                                        );
                                    }}
                                    aria-label="Next month"
                                >

                                    <ChevronRight
                                        size={18}
                                    />

                                </button>

                            </div>


                            {/* SHORTCUTS */}

                            <div className="calendar-shortcuts">

                                <button
                                    type="button"
                                    className="calendar-today-btn"
                                    onClick={
                                        handleToday
                                    }
                                >
                                    วันนี้
                                </button>


                                {selectedDate && (

                                    <button
                                        type="button"
                                        className="calendar-clear-btn"
                                        onClick={
                                            handleClearDate
                                        }
                                    >

                                        <X size={13} />

                                        ล้างวันที่

                                    </button>

                                )}

                            </div>


                            {/* MONTH LABEL */}

                            <div className="calendar-current-month">

                                {calendarMonthLabel}

                            </div>


                            {/* WEEK DAYS */}

                            <div className="calendar-weekdays">

                                <span>อา</span>
                                <span>จ</span>
                                <span>อ</span>
                                <span>พ</span>
                                <span>พฤ</span>
                                <span>ศ</span>
                                <span>ส</span>

                            </div>


                            {/* DAYS */}

                            <div className="calendar-days">

                                {calendarDays.map(
                                    (
                                        date,
                                        index
                                    ) => {

                                        if (!date) {

                                            return (
                                                <span
                                                    key={
                                                        `empty-${index}`
                                                    }
                                                    className="calendar-day empty"
                                                />
                                            );

                                        }


                                        const key =
                                            dateKey(date);

                                        const sales =
                                            dailySales.get(
                                                key
                                            );

                                        const future =
                                            isFutureDate(
                                                date
                                            );

                                        const selected =
                                            selectedDate &&
                                            isSameDay(
                                                date,
                                                selectedDate
                                            );

                                        const today =
                                            isToday(date);


                                        return (

                                            <button
                                                key={key}
                                                type="button"
                                                disabled={
                                                    future
                                                }
                                                className={`
                                                    calendar-day
                                                    ${selected ? "selected" : ""}
                                                    ${today ? "today" : ""}
                                                    ${future ? "future" : ""}
                                                    ${sales ? "has-sales" : ""}
                                                `}
                                                onClick={() => {
                                                    handleSelectDate(
                                                        date
                                                    );
                                                }}
                                            >

                                                <span className="calendar-day-number">

                                                    {date.getDate()}

                                                </span>


                                                {sales && !future && (

                                                    <span className="calendar-day-sales">

                                                        ฿
                                                        {formatMoney(
                                                            sales.total
                                                        )}

                                                    </span>

                                                )}

                                            </button>

                                        );

                                    }
                                )}

                            </div>


                            {/* FOOTER */}

                            <div className="orders-calendar-footer">

                                <span>
                                    วันที่ในอนาคตไม่สามารถเลือกได้
                                </span>

                            </div>

                        </div>

                    )}

                </div>


                {/* SORT */}

                <div className="orders-sort">

                    <ArrowUpDown
                        size={17}
                        strokeWidth={2.1}
                    />

                    <span>
                        Sort by
                    </span>

                    <select
                        value={sortBy}
                        onChange={event => {
                            setSortBy(
                                event.target.value
                            );
                        }}
                        aria-label="Sort orders"
                    >

                        <option value="updated_desc">
                            อัปเดตล่าสุด
                        </option>

                        <option value="created_desc">
                            สร้างล่าสุด
                        </option>

                        <option value="created_asc">
                            สร้างเก่าสุด
                        </option>

                        <option value="total_desc">
                            ยอดขายมาก → น้อย
                        </option>

                        <option value="total_asc">
                            ยอดขายน้อย → มาก
                        </option>

                        <option value="customer_asc">
                            ลูกค้า A → Z
                        </option>

                        <option value="customer_desc">
                            ลูกค้า Z → A
                        </option>

                    </select>

                    <ChevronDown
                        size={16}
                        className="orders-sort-chevron"
                    />

                </div>

            </div>

        </div>


        {/* ==================================================
            ACTIVE DATE
        ================================================== */}

        {selectedDate && (

            <div className="orders-active-date">

                <div>

                    <CalendarDays
                        size={15}
                    />

                    <span>
                        แสดงรายการของวันที่
                    </span>

                    <strong>
                        {formatSelectedDate(
                            selectedDate
                        )}
                    </strong>

                </div>


                <button
                    type="button"
                    onClick={
                        handleClearDate
                    }
                >

                    <X size={14} />

                    ล้าง

                </button>

            </div>

        )}


        {/* ==================================================
            RESULT INFO
        ================================================== */}

        <div className="orders-result-info">

            <span>

                แสดง{" "}

                <strong>
                    {paginationStart}
                    -
                    {paginationEnd}
                </strong>

                {" "}จาก{" "}

                <strong>
                    {totalItems}
                </strong>

                {" "}รายการ

            </span>


            <span className="orders-current-sort">

                <ArrowUpDown
                    size={14}
                />

                {sortLabel}

            </span>

        </div>


        {/* ==================================================
            PAGINATION TOP
        ================================================== */}

        {totalItems > 0 && (
            <PaginationControls />
        )}


        {/* ==================================================
            TABLE
        ================================================== */}

        <div className="orders-table-wrapper">

            {visibleOrders.length === 0 ? (

                <div className="orders-empty">

                    <div className="orders-empty-icon">

                        <Package
                            size={40}
                            strokeWidth={1.8}
                        />

                    </div>


                    <strong>

                        {selectedDate
                            ? "ไม่มียอดขาย"
                            : "No orders found"}

                    </strong>


                    <span>

                        {selectedDate
                            ? `ไม่มีรายการขายในวันที่ ${formatSelectedDate(
                                selectedDate
                            )}`
                            : "ไม่พบรายการขาย"}

                    </span>

                </div>

            ) : (

                <table className="orders-table">

                    <thead>

                        <tr>

                            <th>
                                Order
                            </th>

                            <th>
                                Customer
                            </th>

                            <th>
                                Items
                            </th>

                            <th>
                                Total
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Updated
                            </th>

                            <th className="orders-table-action-header">
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {paginatedOrders.map(
                            order => {

                                const status =
                                    getStatus(
                                        order
                                    );

                                const itemCount =
                                    getItemCount(
                                        order
                                    );

                                const productCount =
                                    getProductCount(
                                        order
                                    );

                                const total =
                                    getOrderTotal(
                                        order
                                    );

                                const updatedAt =
                                    order?.updatedAt ||
                                    order?.createdAt;

                                const customerName =
                                    getCustomerName(
                                        order
                                    );

                                const customerPhone =
                                    getCustomerPhone(
                                        order
                                    );

                                const orderNo =
                                    getOrderNo(order);

                                return (

                                    <tr
                                        key={
                                            order.id
                                        }
                                        className="orders-table-row"
                                        onClick={() => {
                                            openOrderPopup(
                                                order
                                            );
                                        }}
                                    >


                                        {/* ORDER */}

                                        <td>

                                            <div className="order-id-cell">

                                                <div className="order-id-icon">

                                                    <ShoppingBag
                                                        size={16}
                                                    />

                                                </div>

                                                <div>

                                                    <strong>
                                                        #{orderNo}
                                                    </strong>

                                                    <span>
                                                        Order
                                                    </span>

                                                </div>

                                            </div>

                                        </td>


                                        {/* CUSTOMER */}

                                        <td>

                                            <div className="order-customer-cell">

                                                <strong>
                                                    {customerName}
                                                </strong>

                                                {customerPhone && (

                                                    <span>
                                                        {customerPhone}
                                                    </span>

                                                )}

                                            </div>

                                        </td>


                                        {/* ITEMS */}

                                        <td>

                                            <div className="order-items-cell">

                                                <Package
                                                    size={17}
                                                />

                                                <strong>
                                                    {itemCount}
                                                </strong>

                                                <span>
                                                    ชิ้น
                                                </span>

                                                {productCount > 0 && (

                                                    <small>
                                                        · {productCount} รายการ
                                                    </small>

                                                )}

                                            </div>

                                        </td>


                                        {/* TOTAL */}

                                        <td>

                                            <div className="order-total-cell">

                                                <strong>
                                                    ฿
                                                    {formatMoney(
                                                        total
                                                    )}
                                                </strong>

                                            </div>

                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <span
                                                className={
                                                    `order-status ${status.className}`
                                                }
                                            >

                                                <span className="order-status-dot" />

                                                {status.label}

                                            </span>

                                        </td>


                                        {/* UPDATED */}

                                        <td>

                                            <div className="order-updated-cell">

                                                <strong>
                                                    {formatDateTime(
                                                        updatedAt
                                                    )}
                                                </strong>

                                            </div>

                                        </td>


                                        {/* ACTION */}

                                        <td>

                                            <div className="order-table-actions">

                                                <button
                                                    type="button"
                                                    className="order-view-btn"
                                                    title="ดูรายละเอียด"
                                                    onClick={event => {

                                                        event.stopPropagation();

                                                        openOrderPopup(
                                                            order
                                                        );

                                                    }}
                                                >

                                                    <Eye
                                                        size={17}
                                                    />

                                                    <span>
                                                        ดู
                                                    </span>

                                                </button>


                                                {onEditOrder && (

                                                    <button
                                                        type="button"
                                                        className="order-edit-btn"
                                                        title="แก้ไข"
                                                        onClick={event => {

                                                            event.stopPropagation();

                                                            onEditOrder(
                                                                order
                                                            );

                                                        }}
                                                    >

                                                        <Pencil
                                                            size={16}
                                                        />

                                                    </button>

                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                );

                            }
                        )}

                    </tbody>

                </table>

            )}

        </div>


        {/* ==================================================
            PAGINATION BOTTOM
        ================================================== */}

        {totalItems > 0 && (
            <PaginationControls />
        )}

    </section>

);


}
