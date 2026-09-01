import React from "react";

import {
X,
ArrowUpRight,
ArrowDownRight,
Package,
CalendarDays,
Hash,
Wallet,
Tag,
FileText
} from "lucide-react";

// ======================================================
// ACCOUNTING DETAIL MODAL
// ======================================================

export default function AccountingDetailModal({
accounting,
onClose
}) {

// ==================================================
// NO DATA
// ==================================================

if (!accounting) {
    return null;
}


// ==================================================
// HELPERS
// ==================================================

function money(value) {

    const number =
        Number(value);

    const safeNumber =
        Number.isFinite(number)
            ? number
            : 0;

    return safeNumber.toLocaleString(
        "th-TH",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );
}


function formatDateTime(value) {

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
        return "-";
    }

    return date.toLocaleString(
        "th-TH",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function getProductName(item) {

    return (
        item?.consignmentItem?.name ||
        item?.product?.name ||
        item?.name ||
        item?.productName ||
        "สินค้า"
    );
}


function getQuantity(item) {

    const quantity =
        Number(
            item?.quantity ??
            item?.saleQuantity ??
            1
        );

    return Number.isFinite(quantity)
        ? quantity
        : 1;
}


function getSalePrice(item) {

    return (
        item?.salePrice ??
        item?.actualSalePrice ??
        item?.price ??
        0
    );
}


function getCostPrice(item) {

    return (
        item?.costPrice ??
        item?.consignmentItem?.costPrice ??
        item?.product?.costPrice ??
        0
    );
}


function getProfit(item) {

    if (
        item?.profit !== undefined &&
        item?.profit !== null
    ) {
        return Number(item.profit) || 0;
    }

    const quantity =
        getQuantity(item);

    const salePrice =
        Number(getSalePrice(item)) || 0;

    const costPrice =
        Number(getCostPrice(item)) || 0;

    return (
        salePrice -
        costPrice
    ) * quantity;
}


// ==================================================
// TYPE
// ==================================================

const isIncome =
    accounting.type === "INCOME";

const typeClass =
    isIncome
        ? "income"
        : "expense";


// ==================================================
// ORDER
// ==================================================

const order =
    accounting.order || null;

const orderItems =
    Array.isArray(order?.items)
        ? order.items
        : [];


// ==================================================
// EXPENSE
// ==================================================

const expenseData =
    accounting.expenseData || null;


// ==================================================
// TOTALS
// ==================================================

const itemQuantity =
    orderItems.reduce(
        (total, item) =>
            total +
            getQuantity(item),
        0
    );


const itemCost =
    orderItems.reduce(
        (total, item) =>
            total +
            (
                getCostPrice(item) *
                getQuantity(item)
            ),
        0
    );


const itemProfit =
    orderItems.reduce(
        (total, item) =>
            total +
            getProfit(item),
        0
    );


// ==================================================
// CLOSE
// ==================================================

function handleBackdropMouseDown(event) {

    if (
        event.target ===
        event.currentTarget
    ) {
        onClose?.();
    }
}


// ==================================================
// RENDER
// ==================================================

return (

    <div
        className="order-modal"
        onMouseDown={
            handleBackdropMouseDown
        }
    >

        <div className="accounting-detail-modal">


            {/* ======================================
                CLOSE
            ====================================== */}

            <button
                type="button"
                className="modal-close"
                onClick={() =>
                    onClose?.()
                }
                aria-label="Close"
            >
                <X size={20} />
            </button>


            {/* ======================================
                ICON
            ====================================== */}

            <div
                className={
                    "accounting-detail-icon " +
                    typeClass
                }
            >
                {isIncome ? (
                    <ArrowUpRight />
                ) : (
                    <ArrowDownRight />
                )}
            </div>


            {/* ======================================
                TYPE
            ====================================== */}

            <div
                className={
                    "accounting-detail-badge " +
                    typeClass
                }
            >
                {accounting.typeLabel ||
                    (
                        isIncome
                            ? "รายรับ"
                            : "รายจ่าย"
                    )}
            </div>


            {/* ======================================
                TITLE
            ====================================== */}

            <h2>
                {accounting.title || "-"}
            </h2>


            {/* ======================================
                DESCRIPTION
            ====================================== */}

            <p>
                {accounting.description || "-"}
            </p>


            {/* ======================================
                AMOUNT
            ====================================== */}

            <div
                className={
                    "accounting-detail-amount " +
                    typeClass
                }
            >
                {isIncome ? "+" : "-"}฿
                {money(accounting.amount)}
            </div>


            {/* ======================================
                BASIC DETAILS
            ====================================== */}

            <div className="accounting-detail-grid">


                {/* REFERENCE */}

                <div>

                    <span>
                        <Hash size={14} />
                        เลขที่รายการ
                    </span>

                    <strong>
                        {accounting.reference || "-"}
                    </strong>

                </div>


                {/* DATE */}

                <div>

                    <span>
                        <CalendarDays size={14} />
                        วันที่
                    </span>

                    <strong>
                        {formatDateTime(
                            accounting.date
                        )}
                    </strong>

                </div>


                {/* INCOME */}

                <div>

                    <span>
                        <TrendingUpIcon />
                        รายรับ
                    </span>

                    <strong className="income-detail">

                        {Number(accounting.income) > 0
                            ? `฿${money(
                                accounting.income
                            )}`
                            : "-"
                        }

                    </strong>

                </div>


                {/* EXPENSE */}

                <div>

                    <span>
                        <TrendingDownIcon />
                        รายจ่าย
                    </span>

                    <strong className="expense-detail">

                        {Number(accounting.expense) > 0
                            ? `฿${money(
                                accounting.expense
                            )}`
                            : "-"
                        }

                    </strong>

                </div>


                {/* BALANCE */}

                <div>

                    <span>
                        <Wallet size={14} />
                        ยอดคงเหลือหลังรายการ
                    </span>

                    <strong>
                        ฿{money(
                            accounting.balance
                        )}
                    </strong>

                </div>

            </div>


            {/* ======================================
                SALE DETAILS
            ====================================== */}

            {isIncome && order && (

                <div className="accounting-detail-products">

                    <h3>
                        <Package size={18} />
                        รายการสินค้า
                    </h3>


                    {orderItems.length === 0 ? (

                        <div className="accounting-detail-empty">
                            <span>
                                ไม่มีรายการสินค้า
                            </span>
                        </div>

                    ) : (

                        <>

                            <div className="accounting-product-summary">

                                <span>
                                    จำนวนสินค้า
                                </span>

                                <strong>
                                    {itemQuantity} ชิ้น
                                </strong>

                            </div>


                            {orderItems.map(
                                (item, index) => {

                                    const quantity =
                                        getQuantity(item);

                                    const salePrice =
                                        Number(
                                            getSalePrice(item)
                                        ) || 0;

                                    const costPrice =
                                        Number(
                                            getCostPrice(item)
                                        ) || 0;

                                    const profit =
                                        getProfit(item);

                                    return (

                                        <div
                                            key={
                                                item?.id ||
                                                `accounting-item-${index}`
                                            }
                                            className="accounting-detail-product-item"
                                        >

                                            <div className="accounting-product-main">

                                                <strong>
                                                    {getProductName(
                                                        item
                                                    )}
                                                </strong>

                                                <span>
                                                    จำนวน {quantity} ชิ้น
                                                </span>

                                            </div>


                                            <div className="accounting-product-values">

                                                <div>
                                                    <span>
                                                        ราคาขาย
                                                    </span>

                                                    <strong>
                                                        ฿{money(
                                                            salePrice
                                                        )}
                                                    </strong>
                                                </div>


                                                <div>
                                                    <span>
                                                        ต้นทุน
                                                    </span>

                                                    <strong>
                                                        ฿{money(
                                                            costPrice *
                                                            quantity
                                                        )}
                                                    </strong>
                                                </div>


                                                <div>
                                                    <span>
                                                        กำไร
                                                    </span>

                                                    <strong
                                                        className={
                                                            profit >= 0
                                                                ? "income-detail"
                                                                : "expense-detail"
                                                        }
                                                    >
                                                        {profit >= 0
                                                            ? "+"
                                                            : "-"
                                                        }
                                                        ฿{money(
                                                            Math.abs(
                                                                profit
                                                            )
                                                        )}
                                                    </strong>
                                                </div>

                                            </div>

                                        </div>

                                    );

                                }
                            )}


                            <div className="accounting-product-total">

                                <div>

                                    <span>
                                        ต้นทุนรวม
                                    </span>

                                    <strong>
                                        ฿{money(
                                            itemCost
                                        )}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        กำไรรวม
                                    </span>

                                    <strong
                                        className={
                                            itemProfit >= 0
                                                ? "income-detail"
                                                : "expense-detail"
                                        }
                                    >
                                        {itemProfit >= 0
                                            ? "+"
                                            : "-"
                                        }
                                        ฿{money(
                                            Math.abs(
                                                itemProfit
                                            )
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </>

                    )}

                </div>

            )}


            {/* ======================================
                EXPENSE DETAILS
            ====================================== */}

            {!isIncome && expenseData && (

                <div className="accounting-detail-products">

                    <h3>
                        <FileText size={18} />
                        รายละเอียดรายจ่าย
                    </h3>


                    <div>

                        <span>
                            <Tag size={14} />
                            หมวดหมู่
                        </span>

                        <strong>
                            {expenseData.category || "-"}
                        </strong>

                    </div>


                    <div>

                        <span>
                            หมายเหตุ
                        </span>

                        <strong>
                            {expenseData.note || "-"}
                        </strong>

                    </div>

                </div>

            )}


            {/* ======================================
                SALE EXTRA INFORMATION
            ====================================== */}

            {isIncome && (

                <div className="accounting-detail-extra">

                    {accounting.customer?.name && (

                        <div>

                            <span>
                                ลูกค้า
                            </span>

                            <strong>
                                {accounting.customer.name}
                            </strong>

                        </div>

                    )}


                    {accounting.source && (

                        <div>

                            <span>
                                แหล่งที่มา
                            </span>

                            <strong>
                                {accounting.source}
                            </strong>

                        </div>

                    )}


                    {accounting.saleId && (

                        <div>

                            <span>
                                Sale ID
                            </span>

                            <strong>
                                #{accounting.saleId}
                            </strong>

                        </div>

                    )}

                </div>

            )}

        </div>

    </div>

);

}

// ======================================================
// SMALL ICON HELPERS
// ======================================================

function TrendingUpIcon() {

return (
    <ArrowUpRight size={14} />
);

}

function TrendingDownIcon() {

return (
    <ArrowDownRight size={14} />
);

}