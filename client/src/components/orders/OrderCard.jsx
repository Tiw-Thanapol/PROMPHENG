import React from "react";

import {
Package,
Eye,
Pencil,
UserRound,
DollarSign,
CalendarDays,
Clock,
CheckCircle
} from "lucide-react";

// ======================================================
// ORDER CARD
// ======================================================

export default function OrderCard({
order,
onView,
onEdit
}) {


if (!order) {
    return null;
}


// ==================================================
// STATUS
// ==================================================

const status =
    String(
        order.status || ""
    )
        .trim()
        .toUpperCase();


const isCompleted =
    status === "COMPLETED" ||
    status === "COMPLETE" ||
    status === "SUCCESS";


// ==================================================
// CUSTOMER
// ==================================================

const customerName =
    order.customer?.name ||
    order.customerName ||
    "Walk in customer";


const customerPhone =
    order.customer?.phone ||
    order.customerPhone ||
    "-";


// ==================================================
// ITEMS
// ==================================================

const items =
    Array.isArray(order.items)
        ? order.items
        : Array.isArray(order.saleItems)
            ? order.saleItems
            : [];


const itemCount =
    items.length;


const totalQuantity =
    items.reduce(
        (sum, item) =>
            sum +
            (
                Number(
                    item.quantity ??
                    item.qty ??
                    0
                ) || 0
            ),
        0
    );


// ==================================================
// TOTAL
// ==================================================

const totalAmount =
    Number(
        order.totalAmount ??
        order.grandTotal ??
        order.total ??
        order.totalPrice ??
        0
    ) || 0;


// ==================================================
// MONEY
// ==================================================

function formatMoney(value) {

    const number =
        Number(value);


    if (!Number.isFinite(number)) {
        return "0";
    }


    return number.toLocaleString(
        "th-TH",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

}


// ==================================================
// DATE
// ==================================================

function formatDate(date) {

    if (!date) {
        return "-";
    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return "-";
    }


    return parsed.toLocaleDateString(
        "th-TH",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            timeZone: "Asia/Bangkok"
        }
    );

}


// ==================================================
// VIEW
// ==================================================

function handleView() {

    if (
        typeof onView ===
        "function"
    ) {

        onView(order);

    }

}


// ==================================================
// EDIT
// ==================================================

function handleEdit() {

    if (
        typeof onEdit ===
        "function"
    ) {

        onEdit(order);

    }

}


// ==================================================
// RENDER
// ==================================================

return (

    <div
        className="order-card"
        data-order-id={order.id}
    >


        {/* ==========================================
            TOP
        ========================================== */}

        <div className="order-card-top">

            <div className="order-number">

                <Package
                    size={15}
                />

                <span>
                    #{order.orderNo ?? order.id}
                </span>

            </div>


            <div className="order-actions">

                <button
                    type="button"
                    onClick={handleView}
                    title="View"
                    aria-label={`View order ${order.id}`}
                >

                    <Eye
                        size={16}
                    />

                </button>


                <button
                    type="button"
                    onClick={handleEdit}
                    title="Edit"
                    aria-label={`Edit order ${order.id}`}
                >

                    <Pencil
                        size={16}
                    />

                </button>

            </div>

        </div>


        {/* ==========================================
            CUSTOMER
        ========================================== */}

        <div className="order-customer">

            <div className="order-avatar">

                <UserRound
                    size={20}
                />

            </div>


            <div>

                <strong>
                    {customerName}
                </strong>

                <small>
                    {customerPhone}
                </small>

            </div>

        </div>


        {/* ==========================================
            ORDER INFO
        ========================================== */}

        <div className="order-info">


            {/* ITEMS */}

            <div>

                <Package
                    size={15}
                />

                <span>
                    {itemCount}
                </span>

                <span>
                    items
                </span>

                {totalQuantity > 0 && (

                    <small>
                        ({totalQuantity} pcs)
                    </small>

                )}

            </div>


            {/* TOTAL */}

            <div>

                <DollarSign
                    size={15}
                />

                <strong>

                    ฿
                    {formatMoney(
                        totalAmount
                    )}

                </strong>

            </div>


            {/* DATE */}

            <div>

                <CalendarDays
                    size={15}
                />

                <span>
                    {formatDate(
                        order.createdAt ??
                        order.saleDate ??
                        order.soldAt ??
                        order.updatedAt
                    )}
                </span>

            </div>

        </div>


        {/* ==========================================
            STATUS
        ========================================== */}

        <div
            className={
                "order-status " +
                (
                    isCompleted
                        ? "completed"
                        : "processing"
                )
            }
        >

            {isCompleted ? (

                <>

                    <CheckCircle
                        size={14}
                    />

                    <span>
                        Completed
                    </span>

                </>

            ) : (

                <>

                    <Clock
                        size={14}
                    />

                    <span>
                        Processing
                    </span>

                </>

            )}

        </div>


    </div>

);


}
