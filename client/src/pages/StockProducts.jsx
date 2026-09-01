import React from "react";

import {
    Pencil,
    Tag,
    Trash2,
    Hash,
    CalendarDays,
    PackageOpen,
    History
} from "lucide-react";


function StockProducts({

    filteredProducts = [],
    loading,
    tableColumnCount = 10,

    allVisibleSelected,
    toggleSelectAllVisible,

    selectedIds = new Set(),
    toggleRowSelected,

    openEditModal,
    openHistoryModal,
    openSellModal,
    handleDelete,

    getQuantity,
    getCost,
    getSalePrice,
    getProfit,

    formatDate,
    money,
    number,
    StatusBadge

}) {


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div className="products-loading">

                <div className="loading-bear">
                    🧸
                </div>

                <strong>
                    กำลังโหลดสินค้า...
                </strong>

                <span>
                    แป๊บเดียวนะ ✨
                </span>

            </div>
        );
    }


    // ======================================================
    // EMPTY
    // ======================================================

    if (
        !Array.isArray(
            filteredProducts
        ) ||
        filteredProducts.length === 0
    ) {

        return (

            <table className="products-table">

                <thead>

                    <tr>

                        <th className="checkbox-col">

                            <input
                                type="checkbox"
                                checked={false}
                                disabled
                                aria-label="ไม่มีสินค้าให้เลือก"
                            />

                        </th>

                        <th>
                            สินค้า
                        </th>

                        <th className="quantity-col">
                            จำนวน
                        </th>

                        <th>
                            ต้นทุน/ชิ้น
                        </th>

                        <th>
                            ต้นทุนรวม
                        </th>

                        <th>
                            ราคาขายจริง
                        </th>

                        <th>
                            กำไร
                        </th>

                        <th>
                            วันที่
                        </th>

                        <th>
                            สถานะ
                        </th>

                        <th />

                    </tr>

                </thead>


                <tbody>

                    <tr>

                        <td
                            colSpan={
                                tableColumnCount
                            }
                            className="products-empty"
                        >

                            <div className="empty-state">

                                <div className="empty-bubble">

                                    <PackageOpen
                                        size={30}
                                    />

                                </div>

                                <h3>
                                    ยังไม่มีสินค้า
                                </h3>

                                <p>
                                    ลองเพิ่มสินค้าใหม่กันนะ ✨
                                </p>

                            </div>

                        </td>

                    </tr>

                </tbody>

            </table>
        );
    }


    // ======================================================
    // TABLE
    // ======================================================

    return (

        <table className="products-table">

            <thead>

                <tr>

                    <th className="checkbox-col">

                        <input
                            type="checkbox"
                            checked={
                                allVisibleSelected
                            }
                            onChange={
                                toggleSelectAllVisible
                            }
                            aria-label="เลือกสินค้าทั้งหมด"
                        />

                    </th>


                    <th>
                        สินค้า
                    </th>


                    <th className="quantity-col">
                        จำนวน
                    </th>


                    <th>
                        ต้นทุน/ชิ้น
                    </th>


                    <th>
                        ต้นทุนรวม
                    </th>


                    <th>
                        ราคาขายจริง
                    </th>


                    <th>
                        กำไร
                    </th>


                    <th>
                        วันที่
                    </th>


                    <th>
                        สถานะ
                    </th>


                    <th />

                </tr>

            </thead>


            <tbody>

                {filteredProducts.map(
                    product => {

                        const quantity =
                            getQuantity(
                                product
                            );

                        const costPrice =
                            getCost(
                                product
                            );

                        const totalCost =
                            costPrice *
                            quantity;

                        const salePrice =
                            getSalePrice(
                                product
                            );

                        const profit =
                            getProfit(
                                product
                            );

                        const productId =
                            product?.id;

                        const productName =
                            product?.name ||
                            "ไม่ระบุชื่อสินค้า";

                        const status =
                            String(
                                product?.status ||
                                ""
                            ).toUpperCase();

                        const isSelected =
                            selectedIds.has(
                                productId
                            );

                        const canSell =
                            quantity > 0 &&
                            status !== "SOLD" &&
                            status !== "CANCELLED";


                        return (

                            <tr
                                key={
                                    productId
                                }
                                className={
                                    isSelected
                                        ? "product-row-selected"
                                        : ""
                                }
                            >

                                {/* SELECT */}

                                <td className="checkbox-col">

                                    <input
                                        type="checkbox"
                                        checked={
                                            isSelected
                                        }
                                        onChange={() =>
                                            toggleRowSelected(
                                                productId
                                            )
                                        }
                                        aria-label={
                                            `เลือก ${productName}`
                                        }
                                    />

                                </td>


                                {/* PRODUCT */}

                                <td>

                                    <div className="product-name">

                                        <div className="product-mini-icon">
                                            🧸
                                        </div>

                                        <div className="product-name-content">

                                            <strong>
                                                {
                                                    productName
                                                }
                                            </strong>

                                            {product?.description && (

                                                <small>
                                                    {
                                                        product.description
                                                    }
                                                </small>

                                            )}

                                            {product?.note && (

                                                <small className="product-note">
                                                    {
                                                        product.note
                                                    }
                                                </small>

                                            )}

                                        </div>

                                    </div>

                                </td>


                                {/* QUANTITY */}

                                <td>

                                    <div className="quantity-cell">

                                        <span className="quantity-icon">

                                            <Hash
                                                size={14}
                                            />

                                        </span>

                                        <strong>
                                            {number(
                                                quantity
                                            )}
                                        </strong>

                                        <small>
                                            ชิ้น
                                        </small>

                                    </div>

                                </td>


                                {/* COST */}

                                <td>

                                    <span className="money-cost">
                                        ฿
                                        {money(
                                            costPrice
                                        )}
                                    </span>

                                </td>


                                {/* TOTAL COST */}

                                <td>

                                    <span className="money-total-cost">
                                        ฿
                                        {money(
                                            totalCost
                                        )}
                                    </span>

                                </td>


                                {/* SALE PRICE */}

                                <td>

                                    {salePrice !== null ? (

                                        <span className="money-sale">
                                            ฿
                                            {money(
                                                salePrice
                                            )}
                                        </span>

                                    ) : (

                                        <span className="not-sold-price">
                                            ยังไม่ขาย
                                        </span>

                                    )}

                                </td>


                                {/* PROFIT */}

                                <td>

                                    {profit !== null ? (

                                        <span
                                            className={
                                                profit >= 0
                                                    ? "profit-positive"
                                                    : "profit-negative"
                                            }
                                        >

                                            {profit >= 0
                                                ? "+"
                                                : ""
                                            }

                                            ฿
                                            {money(
                                                profit
                                            )}

                                        </span>

                                    ) : (

                                        <span className="profit-empty">
                                            -
                                        </span>

                                    )}

                                </td>


                                {/* DATE */}

                                <td>

                                    <div className="date-cell">

                                        <CalendarDays
                                            size={15}
                                        />

                                        <span>
                                            {formatDate(
                                                product?.purchaseDate
                                            )}
                                        </span>

                                    </div>

                                </td>


                                {/* STATUS */}

                                <td>

                                    <StatusBadge
                                        status={
                                            product?.status
                                        }
                                    />

                                </td>


                                {/* ACTIONS */}

                                <td>

                                    <div className="product-actions">

                                        {/* EDIT */}

                                        <button
                                            type="button"
                                            className="action-edit"
                                            title="แก้ไขสินค้า"
                                            aria-label={
                                                `แก้ไข ${productName}`
                                            }
                                            onClick={() =>
                                                openEditModal(
                                                    product
                                                )
                                            }
                                        >
                                            <History size={16} />


                                            <Pencil
                                                size={16}
                                            />

                                        </button>


                                        {/* SELL */}

                                        <button
                                            type="button"
                                            className="action-sell"
                                            title={
                                                canSell
                                                    ? "ขายสินค้า"
                                                    : "ไม่สามารถขายสินค้าได้"
                                            }
                                            aria-label={
                                                canSell
                                                    ? `ขาย ${productName}`
                                                    : `ไม่สามารถขาย ${productName}`
                                            }
                                            disabled={
                                                !canSell
                                            }
                                            onClick={() => {

                                                if (
                                                    !canSell
                                                ) {
                                                    return;
                                                }

                                                openSellModal(
                                                    product
                                                );

                                            }}
                                        >

                                            <Tag
                                                size={16}
                                            />

                                        </button>


                                        {/* DELETE */}

                                        <button
                                            type="button"
                                            className="action-delete"
                                            title="ลบสินค้า"
                                            aria-label={
                                                `ลบ ${productName}`
                                            }
                                            onClick={() =>
                                                handleDelete(
                                                    productId
                                                )
                                            }
                                        >

                                            <Trash2
                                                size={16}
                                            />

                                        </button>

                                    </div>

                                </td>

                            </tr>
                        );
                    }
                )}

            </tbody>

        </table>
    );
}


export default StockProducts;