import React, { useEffect, useMemo } from "react";

import {
Receipt,
X,
User,
Phone,
Clock,
Hash,
Package,
Pencil,
Truck,
Tag,
Calculator,
MapPin
} from "lucide-react";

import "../../styles/OrderDetailsModal.css";

// ======================================================
// ORDER DETAILS MODAL
// ======================================================

export default function OrderDetailsModal({
order = null,
onClose,
onEdit
}) {

// ==================================================
// ESC CLOSE
// ==================================================

useEffect(() => {

    if (!order) return;

    function handleKeyDown(event) {

        if (event.key === "Escape") {
            onClose?.();
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

}, [order, onClose]);


// ==================================================
// BODY SCROLL LOCK
// ==================================================

useEffect(() => {

    if (!order) return;

    const previousOverflow =
        document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {

        document.body.style.overflow =
            previousOverflow;

    };

}, [order]);


// ==================================================
// MONEY
// ==================================================

function formatMoney(value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "0.00";
    }

    return number.toLocaleString(
        "th-TH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


// ==================================================
// DATE
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


function formatDateTime(value) {

    const date =
        normalizeDate(value);

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

    const date =
        normalizeDate(value);

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


// ==================================================
// CUSTOMER
// ==================================================

function getCustomerName() {

    return (
        order?.customer?.name ||
        order?.customerName ||
        "Walk-in Customer"
    );

}


function getCustomerPhone() {

    return (
        order?.customer?.phone ||
        order?.customerPhone ||
        ""
    );

}


// ==================================================
// ADDRESS
// ==================================================

function getCustomerAddress() {

    return (
        order?.customer?.address ||
        order?.customerAddress ||
        order?.shippingAddress ||
        order?.deliveryAddress ||
        order?.address ||
        ""
    );

}


// ==================================================
// ITEMS
// ==================================================

const items = useMemo(() => {

    if (
        !order ||
        !Array.isArray(order.items)
    ) {
        return [];
    }

    return order.items;

}, [order]);


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


function getItemQuantity(item) {

    const quantity =
        Number(item?.quantity);

    return Number.isFinite(quantity)
        ? quantity
        : 0;

}


// ==================================================
// SALE PRICE
// ==================================================

function getItemPrice(item) {

    const value =
        item?.salePrice ??
        item?.sellingPrice ??
        item?.price ??
        0;

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


// ==================================================
// COST PRICE
//
// IMPORTANT:
// New architecture uses costPriceAtSale.
// Never use current stock cost as the primary
// source for historical sales.
// ==================================================

function getItemCost(item) {

    const value =
        item?.costPriceAtSale ??
        item?.costPrice ??
        item?.consignmentItem?.costPrice ??
        item?.cost ??
        0;

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


// ==================================================
// ITEM TOTALS
// ==================================================

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
// SHIPPING
//
// shippingCharged = revenue from customer
// shippingActual  = actual shipping expense
// ==================================================

function getShippingCharged() {

    const value =
        order?.shippingCharged ??
        0;

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


function getShippingActual() {

    const value =
        order?.shippingActual ??
        0;

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


// ==================================================
// DISCOUNT
// ==================================================

function getDiscount() {

    const value =
        order?.discountAmount ??
        order?.discount ??
        0;

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


// ==================================================
// EXPENSES
//
// Expenses can be returned by different API shapes.
// We normalize them without assuming one exact
// frontend response structure.
// ==================================================

const expenses = useMemo(() => {

    if (
        Array.isArray(order?.expenses)
    ) {
        return order.expenses;
    }

    if (
        Array.isArray(order?.expense)
    ) {
        return order.expense;
    }

    return [];

}, [order]);


function getExpenseAmount(expense) {

    const value =
        expense?.amount ??
        expense?.value ??
        expense?.cost ??
        0;

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


const otherExpenses = useMemo(() => {

    return expenses.reduce(
        (total, expense) =>
            total +
            getExpenseAmount(expense),
        0
    );

}, [expenses]);


// ==================================================
// CALCULATIONS
// ==================================================

const subtotal = useMemo(() => {

    return items.reduce(
        (total, item) =>
            total +
            getItemSubtotal(item),
        0
    );

}, [items]);


const totalQuantity = useMemo(() => {

    return items.reduce(
        (total, item) =>
            total +
            getItemQuantity(item),
        0
    );

}, [items]);


const totalCost = useMemo(() => {

    return items.reduce(
        (total, item) =>
            total +
            getItemCostTotal(item),
        0
    );

}, [items]);


const productProfit = useMemo(() => {

    return (
        subtotal -
        totalCost
    );

}, [
    subtotal,
    totalCost
]);


const shippingCharged =
    getShippingCharged();


const shippingActual =
    getShippingActual();


const discount =
    getDiscount();


// ==================================================
// REVENUE
//
// Product sales
// + shipping charged
// - discount
// ==================================================

const salesRevenue = useMemo(() => {

    return (
        subtotal +
        shippingCharged -
        discount
    );

}, [
    subtotal,
    shippingCharged,
    discount
]);


// ==================================================
// SHIPPING PROFIT
// ==================================================

const shippingProfit = useMemo(() => {

    return (
        shippingCharged -
        shippingActual
    );

}, [
    shippingCharged,
    shippingActual
]);


// ==================================================
// TOTAL SELLING COST
//
// product cost
// + actual shipping
// + other expenses
// ==================================================

const totalSellingCost = useMemo(() => {

    return (
        totalCost +
        shippingActual +
        otherExpenses
    );

}, [
    totalCost,
    shippingActual,
    otherExpenses
]);


// ==================================================
// FINAL PROFIT
//
// revenue - all selling costs
// ==================================================

const finalProfit = useMemo(() => {

    return (
        salesRevenue -
        totalSellingCost
    );

}, [
    salesRevenue,
    totalSellingCost
]);


// ==================================================
// GRAND TOTAL
//
// Prefer backend totalAmount because it is the
// persisted Sale total.
// ==================================================

const grandTotal = useMemo(() => {

    if (
        order?.totalAmount !== undefined &&
        order?.totalAmount !== null &&
        order?.totalAmount !== ""
    ) {

        const number =
            Number(order.totalAmount);

        if (Number.isFinite(number)) {
            return number;
        }

    }

    return (
        subtotal +
        shippingCharged -
        discount
    );

}, [
    order,
    subtotal,
    shippingCharged,
    discount
]);


// ==================================================
// STATUS
// ==================================================

const status = useMemo(() => {

    const rawStatus =
        String(
            order?.status ||
            order?.saleStatus ||
            "completed"
        ).toLowerCase();

    if (
        rawStatus === "pending" ||
        rawStatus === "processing"
    ) {

        return {
            label: "รอดำเนินการ",
            className: "pending"
        };

    }

    if (
        rawStatus === "cancelled" ||
        rawStatus === "canceled"
    ) {

        return {
            label: "ยกเลิก",
            className: "cancelled"
        };

    }

    if (
        rawStatus === "refunded"
    ) {

        return {
            label: "คืนเงิน",
            className: "refunded"
        };

    }

    return {
        label: "สำเร็จ",
        className: "completed"
    };

}, [order]);


// ==================================================
// PAYMENT
// ==================================================

function getPaymentMethod() {

    return (
        order?.paymentMethod ||
        order?.paymentType ||
        order?.payment?.method ||
        "-"
    );

}


// ==================================================
// DATE
// ==================================================

const createdAt =
    order?.createdAt;

const updatedAt =
    order?.updatedAt ||
    createdAt;


// ==================================================
// NOTHING TO SHOW
// ==================================================

if (!order) {
    return null;
}


// ==================================================
// RENDER
// ==================================================

return (

    <div
        className="order-detail-overlay"
        onMouseDown={(event) => {

            if (
                event.target ===
                event.currentTarget
            ) {
                onClose?.();
            }

        }}
    >

        <div
            className="order-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-label={
                `รายละเอียด Order #${order.orderNo ?? order.id}`
            }
        >

            {/* ======================================
                HEADER
            ====================================== */}

            <div className="order-detail-header">

                <div className="order-detail-header-left">

                    <div className="order-detail-icon">

                        <Receipt
                            size={22}
                            strokeWidth={2.2}
                        />

                    </div>

                    <div className="order-detail-title">

                        <span>
                            Order Details
                        </span>

                        <strong>
                            #{order.orderNo ?? order.id}
                        </strong>

                    </div>

                </div>


                <button
                    type="button"
                    className="order-detail-close"
                    onClick={() => onClose?.()}
                    aria-label="Close"
                >

                    <X size={20} />

                </button>

            </div>


            {/* ======================================
                CUSTOMER INFORMATION
            ====================================== */}

            <div className="order-detail-meta">

                {/* CUSTOMER */}

                <div className="order-detail-meta-card">

                    <div className="order-detail-meta-icon">

                        <User size={17} />

                    </div>

                    <div>

                        <span>
                            Customer
                        </span>

                        <strong>
                            {getCustomerName()}
                        </strong>

                    </div>

                </div>


                {/* PHONE */}

                <div className="order-detail-meta-card">

                    <div className="order-detail-meta-icon">

                        <Phone size={17} />

                    </div>

                    <div>

                        <span>
                            Phone
                        </span>

                        <strong>
                            {getCustomerPhone() || "-"}
                        </strong>

                    </div>

                </div>


                {/* UPDATED */}

                <div className="order-detail-meta-card">

                    <div className="order-detail-meta-icon">

                        <Clock size={17} />

                    </div>

                    <div>

                        <span>
                            Updated
                        </span>

                        <strong>
                            {formatDateTime(updatedAt)}
                        </strong>

                    </div>

                </div>


                {/* CREATED */}

                <div className="order-detail-meta-card">

                    <div className="order-detail-meta-icon">

                        <Hash size={17} />

                    </div>

                    <div>

                        <span>
                            Created
                        </span>

                        <strong>
                            {formatShortDate(createdAt)}
                        </strong>

                    </div>

                </div>


                {/* ADDRESS */}

                <div className="order-detail-address-card">

                    <div className="order-detail-address-card-header">

                        <div className="order-detail-address-icon">

                            <MapPin size={18} />

                        </div>

                        <div className="order-detail-address-title">

                            <span>
                                Shipping Address
                            </span>

                            <small>
                                ที่อยู่สำหรับจัดส่ง
                            </small>

                        </div>

                    </div>


                    <div className="order-detail-address-form">

                        <div className="order-detail-address-field">

                            <span>
                                Address
                            </span>

                            <div>

                                {getCustomerAddress()
                                    ? getCustomerAddress()
                                    : "ไม่ได้ระบุที่อยู่"}

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ======================================
                STATUS
            ====================================== */}

            <div className="order-detail-status-row">

                <div className="order-detail-status-label">

                    <span>
                        สถานะคำสั่งซื้อ
                    </span>

                    <small>
                        {getPaymentMethod()}
                    </small>

                </div>


                <span
                    className={
                        `order-status ${status.className}`
                    }
                >

                    <span className="order-status-dot" />

                    {status.label}

                </span>

            </div>


            {/* ======================================
                ITEMS
            ====================================== */}

            <div className="order-detail-section">

                <div className="order-detail-section-title">

                    <div className="order-detail-section-title-icon">

                        <Package size={18} />

                    </div>

                    <strong>
                        รายการสินค้า
                    </strong>

                    <span>
                        {items.length} รายการ
                    </span>

                    <small>
                        {totalQuantity} ชิ้น
                    </small>

                </div>


                <div className="order-detail-items">

                    {items.length === 0 ? (

                        <div className="order-detail-no-items">

                            <Package size={28} />

                            <span>
                                ไม่พบรายการสินค้า
                            </span>

                        </div>

                    ) : (

                        items.map((item, index) => {

                            const name =
                                getItemName(item);

                            const sku =
                                getItemSKU(item);

                            const quantity =
                                getItemQuantity(item);

                            const price =
                                getItemPrice(item);

                            const cost =
                                getItemCost(item);

                            const itemSubtotal =
                                getItemSubtotal(item);

                            const itemCost =
                                getItemCostTotal(item);

                            const itemProfit =
                                getItemProfit(item);

                            return (

                                <div
                                    key={
                                        item?.id ??
                                        `${order.id}-${index}`
                                    }
                                    className="order-detail-item"
                                >

                                    <div className="order-detail-item-number">
                                        {index + 1}
                                    </div>


                                    <div className="order-detail-item-main">

                                        <strong>
                                            {name}
                                        </strong>

                                        {sku && (

                                            <span>
                                                SKU: {sku}
                                            </span>

                                        )}

                                    </div>


                                    <div className="order-detail-item-qty">

                                        <span>
                                            จำนวน
                                        </span>

                                        <strong>
                                            {quantity}
                                        </strong>

                                        <span>
                                            ชิ้น
                                        </span>

                                    </div>


                                    <div className="order-detail-item-price">

                                        <span>
                                            ฿{formatMoney(price)} / ชิ้น
                                        </span>

                                        <strong>
                                            ฿{formatMoney(itemSubtotal)}
                                        </strong>

                                    </div>


                                    <div className="order-detail-item-profit">

                                        <span>
                                            ต้นทุน
                                        </span>

                                        <strong>
                                            ฿{formatMoney(itemCost)}
                                        </strong>

                                        <span>
                                            กำไร
                                        </span>

                                        <strong
                                            className={
                                                itemProfit < 0
                                                    ? "negative"
                                                    : ""
                                            }
                                        >
                                            ฿{formatMoney(itemProfit)}
                                        </strong>

                                    </div>

                                </div>

                            );

                        })

                    )}

                </div>

            </div>


            {/* ======================================
                SUMMARY
            ====================================== */}

            <div className="order-detail-summary">

                {/* PRODUCT REVENUE */}

                <div className="order-summary-line">

                    <div>

                        <Package size={15} />

                        <span>
                            ยอดสินค้า
                        </span>

                    </div>

                    <strong>
                        ฿{formatMoney(subtotal)}
                    </strong>

                </div>


                {/* SHIPPING CHARGED */}

                <div className="order-summary-line">

                    <div>

                        <Truck size={15} />

                        <span>
                            ค่าส่งที่เก็บลูกค้า
                        </span>

                    </div>

                    <strong>
                        ฿{formatMoney(shippingCharged)}
                    </strong>

                </div>


                {/* DISCOUNT */}

                <div className="order-summary-line">

                    <div>

                        <Tag size={15} />

                        <span>
                            Discount
                        </span>

                    </div>

                    <strong className="discount">
                        -฿{formatMoney(discount)}
                    </strong>

                </div>


                {/* GRAND TOTAL */}

                <div className="order-summary-line">

                    <div>

                        <Receipt size={15} />

                        <span>
                            รายรับจากลูกค้า
                        </span>

                    </div>

                    <strong>
                        ฿{formatMoney(grandTotal)}
                    </strong>

                </div>


                {/* PRODUCT COST */}

                <div className="order-summary-line order-summary-cost">

                    <div>

                        <Calculator size={15} />

                        <span>
                            ต้นทุนสินค้า
                        </span>

                    </div>

                    <strong>
                        ฿{formatMoney(totalCost)}
                    </strong>

                </div>


                {/* ACTUAL SHIPPING */}

                <div className="order-summary-line order-summary-cost">

                    <div>

                        <Truck size={15} />

                        <span>
                            ค่าส่งจริง
                        </span>

                    </div>

                    <strong>
                        ฿{formatMoney(shippingActual)}
                    </strong>

                </div>


                {/* OTHER EXPENSES */}

                <div className="order-summary-line order-summary-cost">

                    <div>

                        <Calculator size={15} />

                        <span>
                            ค่าใช้จ่ายอื่น
                        </span>

                    </div>

                    <strong>
                        ฿{formatMoney(otherExpenses)}
                    </strong>

                </div>


                {/* PRODUCT PROFIT */}

                <div className="order-summary-line order-summary-profit">

                    <div>

                        <span>
                            กำไรจากสินค้า
                        </span>

                    </div>

                    <strong
                        className={
                            productProfit < 0
                                ? "negative"
                                : ""
                        }
                    >
                        ฿{formatMoney(productProfit)}
                    </strong>

                </div>


                {/* SHIPPING PROFIT */}

                <div className="order-summary-line order-summary-profit">

                    <div>

                        <span>
                            กำไร/ขาดทุนค่าส่ง
                        </span>

                    </div>

                    <strong
                        className={
                            shippingProfit < 0
                                ? "negative"
                                : ""
                        }
                    >
                        ฿{formatMoney(shippingProfit)}
                    </strong>

                </div>


                <div className="order-summary-divider" />


                {/* TOTAL SELLING COST */}

                <div className="order-summary-line order-summary-cost">

                    <div>

                        <Calculator size={15} />

                        <span>
                            ต้นทุนการขายทั้งหมด
                        </span>

                    </div>

                    <strong>
                        ฿{formatMoney(totalSellingCost)}
                    </strong>

                </div>


                {/* FINAL PROFIT */}

                <div className="order-summary-profit-total">

                    <span>
                        กำไรสุทธิ
                    </span>

                    <strong
                        className={
                            finalProfit < 0
                                ? "negative"
                                : ""
                        }
                    >
                        ฿{formatMoney(finalProfit)}
                    </strong>

                </div>

            </div>


            {/* ======================================
                FOOTER
            ====================================== */}

            <div className="order-detail-footer">

                <button
                    type="button"
                    className="order-detail-footer-close"
                    onClick={() => onClose?.()}
                >
                    ปิด
                </button>


                {onEdit && (

                    <button
                        type="button"
                        className="order-detail-footer-edit"
                        onClick={() => {

                            onClose?.();

                            onEdit?.(order);

                        }}
                    >

                        <Pencil size={16} />

                        แก้ไข Order

                    </button>

                )}

            </div>

        </div>

    </div>

);


}
