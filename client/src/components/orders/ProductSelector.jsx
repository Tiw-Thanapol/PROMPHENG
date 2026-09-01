import React, {
    useMemo,
    useState
} from "react";

import {
    Search,
    X,
    Package,
    Plus,
    Minus,
    Trash2,
    Check,
    AlertCircle
} from "lucide-react";


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


function getProductName(product) {

    return (
        product?.name ||
        product?.productName ||
        product?.title ||
        "Product"
    );

}


function getStockQuantity(product) {

    const quantity =
        product?.quantity ??
        product?.stockQuantity ??
        product?.availableQuantity ??
        0;

    const value = Number(quantity);

    return Number.isFinite(value)
        ? Math.max(0, value)
        : 0;

}


function getCostPrice(product) {

    const value =
        product?.costPrice ??
        product?.cost ??
        0;

    const price = Number(value);

    return Number.isFinite(price)
        ? Math.max(0, price)
        : 0;

}


function getDefaultSalePrice(product) {

    const value =
        product?.salePrice ??
        product?.sellingPrice ??
        product?.sellPrice ??
        product?.actualSalePrice ??
        0;

    const price = Number(value);

    return Number.isFinite(price)
        ? Math.max(0, price)
        : 0;

}


function getProductId(product) {

    return (
        product?.id ??
        product?.consignmentItemId
    );

}


// ======================================================
// COMPONENT
// ======================================================

export default function ProductSelector({

    products = [],

    selectedItems = [],

    onChange,

    disabled = false,

    error = ""

}) {


    // ==================================================
    // STATE
    // ==================================================

    const [
        search,
        setSearch
    ] = useState("");


    // ==================================================
    // AVAILABLE PRODUCTS
    // ==================================================

    const availableProducts = useMemo(() => {

        return products.filter(product => {

            const quantity =
                getStockQuantity(product);

            if (
                product?.status &&
                product.status !== "AVAILABLE"
            ) {

                return false;

            }

            return quantity > 0;

        });

    }, [
        products
    ]);


    // ==================================================
    // SEARCH
    // ==================================================

    const filteredProducts = useMemo(() => {

        const key =
            search
                .trim()
                .toLowerCase();


        if (!key) {

            return availableProducts;

        }


        return availableProducts.filter(product => {

            const name =
                getProductName(product)
                    .toLowerCase();


            const id =
                String(
                    getProductId(product) ?? ""
                )
                    .toLowerCase();


            const owner =
                String(
                    product?.owner?.name ||
                    ""
                )
                    .toLowerCase();


            return (
                name.includes(key) ||
                id.includes(key) ||
                owner.includes(key)
            );

        });

    }, [
        availableProducts,
        search
    ]);


    // ==================================================
    // SELECTED IDS
    // ==================================================

    const selectedIds = useMemo(() => {

        return new Set(

            selectedItems
                .map(item =>
                    Number(
                        item.consignmentItemId
                    )
                )
                .filter(Boolean)

        );

    }, [
        selectedItems
    ]);


    // ==================================================
    // SELECT PRODUCT
    // ==================================================

    function addProduct(product) {

        if (disabled) {
            return;
        }


        const id =
            Number(
                getProductId(product)
            );


        if (!id) {
            return;
        }


        if (
            selectedIds.has(id)
        ) {

            return;

        }


        const stockQuantity =
            getStockQuantity(product);


        if (
            stockQuantity <= 0
        ) {

            return;

        }


        const costPrice =
            getCostPrice(product);


        const salePrice =
            getDefaultSalePrice(product);


        const newItem = {

            consignmentItemId:
                id,

            quantity:
                1,

            salePrice,

            /*
             * Snapshot ต้นทุน ณ ตอนเลือกสินค้า
             *
             * Backend จะใช้ costPriceAtSale
             * เป็น source of truth ตอนบันทึก SaleItem
             */

            costPriceAtSale:
                costPrice,

            /*
             * ข้อมูลสินค้าใช้เฉพาะ UI
             */

            product

        };


        onChange?.([

            ...selectedItems,

            newItem

        ]);

    }


    // ==================================================
    // REMOVE PRODUCT
    // ==================================================

    function removeProduct(
        consignmentItemId
    ) {

        if (disabled) {
            return;
        }


        const id =
            Number(
                consignmentItemId
            );


        const nextItems =
            selectedItems.filter(
                item =>
                    Number(
                        item.consignmentItemId
                    ) !== id
            );


        onChange?.(
            nextItems
        );

    }


    // ==================================================
    // UPDATE QUANTITY
    // ==================================================

    function updateQuantity(
        consignmentItemId,
        value
    ) {

        if (disabled) {
            return;
        }


        const id =
            Number(
                consignmentItemId
            );


        const item =
            selectedItems.find(
                selected =>
                    Number(
                        selected.consignmentItemId
                    ) === id
            );


        if (!item) {
            return;
        }


        const stockQuantity =
            getStockQuantity(
                item.product
            );


        let quantity =
            Number(value);


        if (
            !Number.isFinite(quantity)
        ) {

            quantity = 1;

        }


        quantity =
            Math.floor(
                quantity
            );


        if (
            quantity < 1
        ) {

            quantity = 1;

        }


        if (
            quantity > stockQuantity
        ) {

            quantity =
                stockQuantity;

        }


        const nextItems =
            selectedItems.map(
                selected => {

                    if (
                        Number(
                            selected.consignmentItemId
                        ) !== id
                    ) {

                        return selected;

                    }


                    return {

                        ...selected,

                        quantity

                    };

                }
            );


        onChange?.(
            nextItems
        );

    }


    // ==================================================
    // UPDATE SALE PRICE
    // ==================================================

    function updateSalePrice(
        consignmentItemId,
        value
    ) {

        if (disabled) {
            return;
        }


        const id =
            Number(
                consignmentItemId
            );


        let salePrice =
            Number(value);


        if (
            !Number.isFinite(
                salePrice
            )
        ) {

            salePrice = 0;

        }


        if (
            salePrice < 0
        ) {

            salePrice = 0;

        }


        const nextItems =
            selectedItems.map(
                selected => {

                    if (
                        Number(
                            selected.consignmentItemId
                        ) !== id
                    ) {

                        return selected;

                    }


                    return {

                        ...selected,

                        salePrice

                    };

                }
            );


        onChange?.(
            nextItems
        );

    }


    // ==================================================
    // INCREMENT
    // ==================================================

    function incrementQuantity(
        item
    ) {

        const stockQuantity =
            getStockQuantity(
                item.product
            );


        const current =
            Number(
                item.quantity
            ) || 1;


        if (
            current >= stockQuantity
        ) {

            return;

        }


        updateQuantity(

            item.consignmentItemId,

            current + 1

        );

    }


    // ==================================================
    // DECREMENT
    // ==================================================

    function decrementQuantity(
        item
    ) {

        const current =
            Number(
                item.quantity
            ) || 1;


        if (
            current <= 1
        ) {

            return;

        }


        updateQuantity(

            item.consignmentItemId,

            current - 1

        );

    }


    // ==================================================
    // SELECTED TOTAL
    // ==================================================

    const selectedTotal =
        useMemo(() => {

            return selectedItems.reduce(
                (
                    total,
                    item
                ) => {

                    const quantity =
                        Number(
                            item.quantity
                        ) || 0;


                    const salePrice =
                        Number(
                            item.salePrice
                        ) || 0;


                    return (
                        total +
                        quantity *
                        salePrice
                    );

                },
                0
            );

        }, [
            selectedItems
        ]);


    // ==================================================
    // SELECTED COST
    // ==================================================

    const selectedCost =
        useMemo(() => {

            return selectedItems.reduce(
                (
                    total,
                    item
                ) => {

                    const quantity =
                        Number(
                            item.quantity
                        ) || 0;


                    const costPrice =
                        Number(
                            item.costPriceAtSale ??
                            getCostPrice(
                                item.product
                            )
                        ) || 0;


                    return (
                        total +
                        quantity *
                        costPrice
                    );

                },
                0
            );

        }, [
            selectedItems
        ]);


    // ==================================================
    // SELECTED PROFIT
    // ==================================================

    const selectedProfit =
        useMemo(() => {

            return (
                selectedTotal -
                selectedCost
            );

        }, [
            selectedTotal,
            selectedCost
        ]);


    // ==================================================
    // SELECTED QUANTITY
    // ==================================================

    const selectedQuantity =
        useMemo(() => {

            return selectedItems.reduce(
                (
                    total,
                    item
                ) => {

                    return (
                        total +
                        (
                            Number(
                                item.quantity
                            ) || 0
                        )
                    );

                },
                0
            );

        }, [
            selectedItems
        ]);


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div className="product-selector">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="product-selector-header">

                <div>

                    <div className="product-selector-title">

                        <Package
                            size={18}
                        />

                        <strong>
                            เลือกสินค้า
                        </strong>

                    </div>


                    <span className="product-selector-subtitle">

                        เลือกสินค้าจาก Stock
                        เพื่อเพิ่มลงในการขาย

                    </span>

                </div>


                <div className="product-selector-count">

                    {selectedItems.length}

                    {" "}

                    รายการ

                </div>

            </div>


            {/* ==================================================
                SEARCH
            ================================================== */}

            <div className="product-selector-search">

                <Search
                    size={17}
                />


                <input
                    type="text"
                    placeholder="ค้นหาสินค้า..."
                    value={search}
                    disabled={disabled}
                    onChange={e =>
                        setSearch(
                            e.target.value
                        )
                    }
                />


                {search && (

                    <button
                        type="button"
                        onClick={() =>
                            setSearch("")
                        }
                        disabled={disabled}
                    >

                        <X
                            size={14}
                        />

                    </button>

                )}

            </div>


            {/* ==================================================
                PRODUCT LIST
            ================================================== */}

            <div className="product-selector-list">

                {filteredProducts.length === 0 ? (

                    <div className="product-selector-empty">

                        <Package
                            size={34}
                        />


                        <strong>

                            {
                                search
                                    ? "ไม่พบสินค้าที่ค้นหา"
                                    : "ไม่มีสินค้าพร้อมขาย"
                            }

                        </strong>


                        <span>

                            {
                                search
                                    ? "ลองค้นหาด้วยชื่อสินค้าอื่น"
                                    : "เพิ่มสินค้าเข้า Stock ก่อนสร้างการขาย"
                            }

                        </span>

                    </div>

                ) : (

                    filteredProducts.map(
                        product => {

                            const id =
                                Number(
                                    getProductId(
                                        product
                                    )
                                );


                            const selected =
                                selectedIds.has(
                                    id
                                );


                            const stockQuantity =
                                getStockQuantity(
                                    product
                                );


                            const costPrice =
                                getCostPrice(
                                    product
                                );


                            return (

                                <button
                                    type="button"
                                    key={id}
                                    className={
                                        "product-selector-item " +
                                        (
                                            selected
                                                ? "selected"
                                                : ""
                                        )
                                    }
                                    disabled={
                                        disabled ||
                                        selected
                                    }
                                    onClick={() =>
                                        addProduct(
                                            product
                                        )
                                    }
                                >

                                    <div className="product-selector-item-icon">

                                        {
                                            selected
                                                ? (
                                                    <Check
                                                        size={18}
                                                    />
                                                )
                                                : (
                                                    <Package
                                                        size={18}
                                                    />
                                                )
                                        }

                                    </div>


                                    <div className="product-selector-item-info">

                                        <strong>

                                            {
                                                getProductName(
                                                    product
                                                )
                                            }

                                        </strong>


                                        <span>

                                            ID #
                                            {id}

                                        </span>


                                        {product?.owner?.name && (

                                            <small>

                                                เจ้าของ:{" "}

                                                {
                                                    product
                                                        .owner
                                                        .name
                                                }

                                            </small>

                                        )}

                                    </div>


                                    <div className="product-selector-item-stock">

                                        <span>
                                            Stock
                                        </span>


                                        <strong>

                                            {stockQuantity}

                                        </strong>

                                        <small>
                                            ชิ้น
                                        </small>

                                    </div>


                                    <div className="product-selector-item-cost">

                                        <span>
                                            ต้นทุน
                                        </span>


                                        <strong>

                                            ฿
                                            {money(
                                                costPrice
                                            )}

                                        </strong>

                                    </div>


                                    <div className="product-selector-add">

                                        {
                                            selected
                                                ? (
                                                    <Check
                                                        size={17}
                                                    />
                                                )
                                                : (
                                                    <Plus
                                                        size={17}
                                                    />
                                                )
                                        }

                                    </div>

                                </button>

                            );

                        }

                    )

                )}

            </div>


            {/* ==================================================
                SELECTED PRODUCTS
            ================================================== */}

            <div className="product-selector-selected">

                <div className="product-selector-selected-header">

                    <div>

                        <strong>
                            รายการที่จะขาย
                        </strong>

                        <span>

                            {selectedItems.length}
                            {" "}
                            รายการ /
                            {" "}
                            {selectedQuantity}
                            {" "}
                            ชิ้น

                        </span>

                    </div>


                    {selectedItems.length > 0 && (

                        <button
                            type="button"
                            className="product-selector-clear"
                            disabled={disabled}
                            onClick={() =>
                                onChange?.([])
                            }
                        >

                            <Trash2
                                size={14}
                            />

                            ล้างทั้งหมด

                        </button>

                    )}

                </div>


                {selectedItems.length === 0 ? (

                    <div className="product-selector-no-selected">

                        <Package
                            size={28}
                        />


                        <span>
                            ยังไม่ได้เลือกสินค้า
                        </span>


                        <small>
                            กดสินค้าด้านบนเพื่อเพิ่มรายการขาย
                        </small>

                    </div>

                ) : (

                    <div className="product-selector-selected-list">

                        {selectedItems.map(
                            item => {

                                const product =
                                    item.product;


                                const id =
                                    Number(
                                        item.consignmentItemId
                                    );


                                const name =
                                    getProductName(
                                        product
                                    );


                                const stockQuantity =
                                    getStockQuantity(
                                        product
                                    );


                                const costPrice =
                                    Number(
                                        item.costPriceAtSale ??
                                        getCostPrice(
                                            product
                                        )
                                    ) || 0;


                                const quantity =
                                    Number(
                                        item.quantity
                                    ) || 1;


                                const salePrice =
                                    Number(
                                        item.salePrice
                                    ) || 0;


                                const lineTotal =
                                    quantity *
                                    salePrice;


                                const lineCost =
                                    quantity *
                                    costPrice;


                                const profit =
                                    lineTotal -
                                    lineCost;


                                const exceedsStock =
                                    quantity >
                                    stockQuantity;


                                return (

                                    <div
                                        className={
                                            "product-selector-selected-item " +
                                            (
                                                exceedsStock
                                                    ? "stock-error"
                                                    : ""
                                            )
                                        }
                                        key={id}
                                    >


                                        {/* INFO */}

                                        <div className="selected-product-info">

                                            <strong>
                                                {name}
                                            </strong>


                                            <span>

                                                ต้นทุน ฿
                                                {money(
                                                    costPrice
                                                )}

                                            </span>


                                            <small>

                                                เหลือ{" "}
                                                {stockQuantity}
                                                {" "}
                                                ชิ้น

                                            </small>

                                        </div>


                                        {/* QUANTITY */}

                                        <div className="selected-product-quantity">

                                            <label>
                                                จำนวน
                                            </label>


                                            <div className="quantity-control">

                                                <button
                                                    type="button"
                                                    disabled={
                                                        disabled ||
                                                        quantity <= 1
                                                    }
                                                    onClick={() =>
                                                        decrementQuantity(
                                                            item
                                                        )
                                                    }
                                                >

                                                    <Minus
                                                        size={14}
                                                    />

                                                </button>


                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={
                                                        stockQuantity
                                                    }
                                                    value={
                                                        item.quantity
                                                    }
                                                    disabled={
                                                        disabled
                                                    }
                                                    onChange={e =>
                                                        updateQuantity(
                                                            id,
                                                            e.target.value
                                                        )
                                                    }
                                                />


                                                <button
                                                    type="button"
                                                    disabled={
                                                        disabled ||
                                                        quantity >=
                                                        stockQuantity
                                                    }
                                                    onClick={() =>
                                                        incrementQuantity(
                                                            item
                                                        )
                                                    }
                                                >

                                                    <Plus
                                                        size={14}
                                                    />

                                                </button>

                                            </div>


                                            {exceedsStock && (

                                                <span className="quantity-error">

                                                    <AlertCircle
                                                        size={11}
                                                    />

                                                    เกิน Stock

                                                </span>

                                            )}

                                        </div>


                                        {/* SALE PRICE */}

                                        <div className="selected-product-price">

                                            <label>
                                                ราคาขาย/ชิ้น
                                            </label>


                                            <div className="price-input">

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
                                                    disabled={
                                                        disabled
                                                    }
                                                    onChange={e =>
                                                        updateSalePrice(
                                                            id,
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                            </div>

                                        </div>


                                        {/* TOTAL */}

                                        <div className="selected-product-total">

                                            <span>
                                                รวม
                                            </span>


                                            <strong>

                                                ฿
                                                {money(
                                                    lineTotal
                                                )}

                                            </strong>


                                            <small
                                                className={
                                                    profit >= 0
                                                        ? "profit-positive"
                                                        : "profit-negative"
                                                }
                                            >

                                                กำไร{" "}

                                                {profit >= 0
                                                    ? "+"
                                                    : "-"
                                                }

                                                ฿
                                                {money(
                                                    Math.abs(
                                                        profit
                                                    )
                                                )}

                                            </small>

                                        </div>


                                        {/* REMOVE */}

                                        <button
                                            type="button"
                                            className="selected-product-remove"
                                            disabled={
                                                disabled
                                            }
                                            title="ลบสินค้า"
                                            onClick={() =>
                                                removeProduct(
                                                    id
                                                )
                                            }
                                        >

                                            <Trash2
                                                size={15}
                                            />

                                        </button>

                                    </div>

                                );

                            }

                        )}

                    </div>

                )}

            </div>


            {/* ==================================================
                TOTAL
            ================================================== */}

            {selectedItems.length > 0 && (

                <div className="product-selector-total">

                    <div>

                        <span>
                            ยอดรวมสินค้า
                        </span>


                        <small>

                            {selectedItems.length}
                            {" "}
                            รายการ /
                            {" "}
                            {selectedQuantity}
                            {" "}
                            ชิ้น

                        </small>

                    </div>


                    <strong>

                        ฿
                        {money(
                            selectedTotal
                        )}

                    </strong>

                </div>

            )}


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div className="product-selector-error">

                    <AlertCircle
                        size={16}
                    />


                    <span>
                        {error}
                    </span>

                </div>

            )}

        </div>

    );

}
