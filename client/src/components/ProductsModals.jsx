import React, {
    useMemo
} from "react";

import {
    Package,
    X,
    Sparkles,
    ClipboardPaste,
    Plus,
    CircleDollarSign,
    Hash,
    CalendarDays,
    Check,
    ListPlus,
    AlertCircle,
    Tag,
    TrendingUp,
    Clock
} from "lucide-react";


// ======================================================
// MODALS
// ======================================================

function ProductsModals({

    // ==================================================
    // ADD / EDIT
    // ==================================================

    showAddModal,
    closeAddModal,
    editingProduct,

    addMode,
    setAddMode,

    form,
    handleFormChange,
    handleSaveProduct,
    savingSingle,


    // ==================================================
    // BULK
    // ==================================================

    bulkText,
    setBulkText,

    bulkPreview,
    bulkInvalid,

    handleParseBulk,
    updateBulkQuantity,
    removeBulkItem,
    clearBulk,
    handleBulkAdd,

    savingBulk,
    bulkTotalQuantity,
    bulkTotalCost,


    // ==================================================
    // SELL
    // ==================================================

    sellingProduct,
    closeSellModal,

    sellQuantity,
    setSellQuantity,

    sellPrice,
    setSellPrice,

    sellShippingCost,
    setSellShippingCost,

    sellOtherExpense,
    setSellOtherExpense,

    // ==================================================
    // SOLD AT
    // ==================================================

    sellSoldAt,
    setSellSoldAt,

    confirmSell,
    savingSell,


    // ==================================================
    // HELPERS
    // ==================================================

    getQuantity,
    money,
    number

}) {


    // ======================================================
    // SELL CALCULATIONS
    // ======================================================

    const sellCalculation =
        useMemo(() => {

            if (
                !sellingProduct
            ) {

                return {

                    quantity: 0,

                    costPerUnit: 0,

                    salePrice: 0,

                    totalSales: 0,

                    totalCost: 0,

                    shipping: 0,

                    otherExpense: 0,

                    totalExpense: 0,

                    profitPerUnit: 0,

                    totalProfit: 0

                };

            }


            const quantity =
                Math.max(
                    0,
                    Number(
                        sellQuantity
                    ) || 0
                );


            const costPerUnit =
                Math.max(
                    0,
                    Number(
                        sellingProduct.costPrice ??
                        sellingProduct.cost ??
                        0
                    ) || 0
                );


            const salePrice =
                Math.max(
                    0,
                    Number(
                        sellPrice
                    ) || 0
                );


            const shipping =
                Math.max(
                    0,
                    Number(
                        sellShippingCost
                    ) || 0
                );


            const otherExpense =
                Math.max(
                    0,
                    Number(
                        sellOtherExpense
                    ) || 0
                );


            const totalSales =
                salePrice *
                quantity;


            const totalCost =
                costPerUnit *
                quantity;


            const totalExpense =
                shipping +
                otherExpense;


            const profitPerUnit =
                salePrice -
                costPerUnit;


            const totalProfit =
                totalSales -
                totalCost -
                totalExpense;


            return {

                quantity,

                costPerUnit,

                salePrice,

                totalSales,

                totalCost,

                shipping,

                otherExpense,

                totalExpense,

                profitPerUnit,

                totalProfit

            };

        }, [
            sellingProduct,
            sellQuantity,
            sellPrice,
            sellShippingCost,
            sellOtherExpense
        ]);


    // ======================================================
    // VALID SELL PREVIEW
    // ======================================================

    const hasValidSellPreview =
        sellingProduct &&
        Number(
            sellQuantity
        ) > 0 &&
        sellPrice !== "" &&
        Number.isFinite(
            Number(
                sellPrice
            )
        );


    // ======================================================
    // ADD MODAL
    // ======================================================

    const addModal =
        showAddModal && (

            <div
                className="product-modal-overlay"
                onMouseDown={e => {

                    if (
                        e.target ===
                        e.currentTarget
                    ) {

                        closeAddModal();

                    }

                }}
            >

                <div
                    className="product-modal"
                    onMouseDown={e =>
                        e.stopPropagation()
                    }
                >

                    {/* ==================================================
                        DECORATIONS
                    ================================================== */}

                    <div className="modal-cloud cloud-modal-one">
                        ☁
                    </div>

                    <div className="modal-cloud cloud-modal-two">
                        ☁
                    </div>

                    <div className="modal-sparkle modal-sparkle-one">
                        ✦
                    </div>

                    <div className="modal-sparkle modal-sparkle-two">
                        ✧
                    </div>


                    {/* ==================================================
                        CLOSE
                    ================================================== */}

                    <button
                        type="button"
                        className="modal-close"
                        onClick={
                            closeAddModal
                        }
                        disabled={
                            savingSingle ||
                            savingBulk
                        }
                    >

                        <X size={19} />

                    </button>


                    {/* ==================================================
                        HEADER
                    ================================================== */}

                    <div className="modal-header">

                        <div className="modal-icon-wrap">

                            <div className="modal-icon">

                                <Sparkles
                                    size={27}
                                />

                            </div>

                            <span>
                                ✨
                            </span>

                        </div>


                        <div>

                            <h2>

                                {
                                    editingProduct
                                        ? "แก้ไขสินค้า"
                                        : "เพิ่มสินค้าใหม่"
                                }

                            </h2>

                            <p>

                                {
                                    editingProduct
                                        ? "แก้ไขข้อมูลสินค้าชิ้นนี้ได้เลย"
                                        : "เพิ่มทีละชิ้น หรือโยนข้อมูลมาทั้งก้อนก็ได้ 🧸"
                                }

                            </p>

                        </div>

                    </div>


                    {/* ==================================================
                        ADD MODE
                    ================================================== */}

                    {!editingProduct && (

                        <div className="add-mode-switch">

                            <button
                                type="button"
                                className={
                                    addMode ===
                                        "single"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setAddMode(
                                        "single"
                                    )
                                }
                            >

                                <Plus
                                    size={17}
                                />

                                เพิ่มทีละรายการ

                            </button>


                            <button
                                type="button"
                                className={
                                    addMode ===
                                        "bulk"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setAddMode(
                                        "bulk"
                                    )
                                }
                            >

                                <ClipboardPaste
                                    size={17}
                                />

                                เพิ่มหลายรายการ

                            </button>

                        </div>

                    )}


                    {/* ==================================================
                        SINGLE PRODUCT
                    ================================================== */}

                    {(editingProduct ||
                        addMode === "single") && (

                        <form
                            className="product-form"
                            onSubmit={
                                handleSaveProduct
                            }
                        >

                            {/* ==================================================
                                NAME
                            ================================================== */}

                            <div className="form-group">

                                <label>

                                    <Package
                                        size={15}
                                    />

                                    ชื่อสินค้า

                                </label>

                                <input
                                    name="name"
                                    value={
                                        form.name
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="เช่น Jelly Bear"
                                    autoFocus
                                />

                            </div>


                            {/* ==================================================
                                DESCRIPTION
                            ================================================== */}

                            <div className="form-group">

                                <label>

                                    รายละเอียด

                                    <small>
                                        ถ้ามี
                                    </small>

                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="เช่น สีชมพู รุ่นพิเศษ..."
                                    rows="2"
                                />

                            </div>


                            {/* ==================================================
                                COST + QUANTITY
                            ================================================== */}

                            <div className="form-row">

                                <div className="form-group">

                                    <label>

                                        <CircleDollarSign
                                            size={15}
                                        />

                                        ต้นทุน/ชิ้น

                                    </label>

                                    <div className="money-input">

                                        <span>
                                            ฿
                                        </span>

                                        <input
                                            type="number"
                                            name="costPrice"
                                            value={
                                                form.costPrice
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            min="0"
                                            step="0.01"
                                            placeholder="0"
                                        />

                                    </div>

                                </div>


                                <div className="form-group">

                                    <label>

                                        <Hash
                                            size={15}
                                        />

                                        จำนวน

                                    </label>

                                    <div className="quantity-input">

                                        <input
                                            type="number"
                                            name="quantity"
                                            value={
                                                form.quantity
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            min="1"
                                            step="1"
                                        />

                                        <span>
                                            ชิ้น
                                        </span>

                                    </div>

                                </div>

                            </div>


                            {/* ==================================================
                                PURCHASE DATE
                            ================================================== */}

                            <div className="form-group">

                                <label>

                                    <CalendarDays
                                        size={15}
                                    />

                                    วันที่ซื้อ

                                </label>

                                <input
                                    type="date"
                                    name="purchaseDate"
                                    value={
                                        form.purchaseDate
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                />

                            </div>


                            {/* ==================================================
                                NOTE
                            ================================================== */}

                            <div className="form-group">

                                <label>

                                    หมายเหตุ

                                    <small>
                                        ถ้ามี
                                    </small>

                                </label>

                                <textarea
                                    name="note"
                                    value={
                                        form.note
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="เช่น ซื้อมาเพื่อขาย / รุ่นใหม่..."
                                    rows="3"
                                />

                            </div>


                            {/* ==================================================
                                HINT
                            ================================================== */}

                            {!editingProduct && (

                                <div className="form-hint">

                                    <span>
                                        💡
                                    </span>

                                    <p>

                                        ราคาที่กรอกคือ{" "}

                                        <strong>
                                            ต้นทุนต่อชิ้น
                                        </strong>

                                        {" "}และจำนวนเริ่มต้นคือ 1 ชิ้น

                                    </p>

                                </div>

                            )}


                            {/* ==================================================
                                ACTIONS
                            ================================================== */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={
                                        closeAddModal
                                    }
                                    disabled={
                                        savingSingle
                                    }
                                >

                                    ยกเลิก

                                </button>


                                <button
                                    type="submit"
                                    className="save-product-button"
                                    disabled={
                                        savingSingle
                                    }
                                >

                                    {savingSingle ? (

                                        <>

                                            <span className="button-spinner" />

                                            กำลังบันทึก...

                                        </>

                                    ) : (

                                        <>

                                            <Check
                                                size={19}
                                            />

                                            {
                                                editingProduct
                                                    ? "บันทึกการแก้ไข"
                                                    : "เพิ่มเข้าสต็อก"
                                            }

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    )}


                    {/* ==================================================
                        BULK
                    ================================================== */}

                    {!editingProduct &&
                        addMode === "bulk" && (

                            <div className="bulk-form">

                                <div className="bulk-instruction">

                                    <div className="bulk-instruction-icon">

                                        <ListPlus
                                            size={21}
                                        />

                                    </div>

                                    <div>

                                        <strong>
                                            ขั้นตอนที่ 1 — ใส่รายการสินค้า
                                        </strong>

                                        <p>
                                            ใส่ชื่อสินค้าและราคาทุนก่อน ยังไม่ต้องใส่จำนวน
                                        </p>

                                    </div>

                                </div>


                                <div className="bulk-example">

                                    <span>
                                        ตัวอย่าง
                                    </span>

                                    <pre>
{`อุ๋งชม 290
เบอร์เกอร์แมว 250
หมอนเชฟ 450
คิระชม 750
หมอนเชฟ 450`}
                                    </pre>

                                </div>


                                <div className="form-group bulk-text-group">

                                    <label>

                                        <ClipboardPaste
                                            size={15}
                                        />

                                        รายการสินค้า

                                    </label>

                                    <textarea
                                        className="bulk-textarea"
                                        value={
                                            bulkText
                                        }
                                        onChange={e =>
                                            setBulkText(
                                                e.target.value
                                            )
                                        }
                                        placeholder={`วางข้อมูลตรงนี้...

เช่น
อุ๋งชม 290
เบอร์เกอร์แมว 250
หมอนเชฟ 450`}
                                        rows="8"
                                    />

                                </div>


                                <div className="bulk-parse-row">

                                    <span>

                                        {
                                            bulkText
                                                .split(
                                                    /\r?\n/
                                                )
                                                .filter(
                                                    line =>
                                                        line.trim()
                                                )
                                                .length
                                        }{" "}
                                        รายการ

                                    </span>


                                    <button
                                        type="button"
                                        className="parse-button"
                                        onClick={
                                            handleParseBulk
                                        }
                                        disabled={
                                            !bulkText.trim()
                                        }
                                    >

                                        <Sparkles
                                            size={17}
                                        />

                                        แยกรายการให้ดู

                                    </button>

                                </div>


                                {bulkInvalid.length >
                                    0 && (

                                    <div className="bulk-invalid">

                                        <div className="bulk-invalid-title">

                                            <AlertCircle
                                                size={17}
                                            />

                                            อ่านไม่ออก{" "}
                                            {
                                                bulkInvalid.length
                                            }{" "}
                                            รายการ

                                        </div>


                                        {bulkInvalid.map(
                                            item => (

                                                <div
                                                    key={
                                                        item.lineNumber
                                                    }
                                                >

                                                    บรรทัด{" "}
                                                    {
                                                        item.lineNumber
                                                    }

                                                    {" : "}

                                                    {
                                                        item.text
                                                    }

                                                </div>

                                            )
                                        )}


                                        <small>
                                            ระบบจะไม่เพิ่มรายการที่อ่านไม่ออก
                                        </small>

                                    </div>

                                )}


                                {bulkPreview.length >
                                    0 && (

                                    <div className="bulk-preview">

                                        <div className="bulk-preview-header">

                                            <div>

                                                <strong>
                                                    ขั้นตอนที่ 2 — ตรวจสอบและใส่จำนวน
                                                </strong>

                                                <span>

                                                    {
                                                        bulkPreview.length
                                                    }{" "}
                                                    รายการ

                                                </span>

                                            </div>


                                            <button
                                                type="button"
                                                onClick={
                                                    clearBulk
                                                }
                                            >

                                                ล้าง

                                            </button>

                                        </div>


                                        <div className="bulk-list">

                                            {bulkPreview.map(
                                                (
                                                    item,
                                                    index
                                                ) => (

                                                    <div
                                                        className="bulk-item"
                                                        key={
                                                            item.tempId
                                                        }
                                                    >

                                                        <div className="bulk-number">

                                                            {
                                                                index +
                                                                1
                                                            }

                                                        </div>


                                                        <div className="bulk-item-icon">

                                                            🧸

                                                        </div>


                                                        <div className="bulk-item-info">

                                                            <strong>

                                                                {
                                                                    item.name
                                                                }

                                                            </strong>

                                                            <span>

                                                                ต้นทุน/ชิ้น ฿
                                                                {money(
                                                                    item.costPrice
                                                                )}

                                                            </span>

                                                        </div>


                                                        <div className="bulk-quantity">

                                                            <label>
                                                                จำนวน
                                                            </label>

                                                            <div className="bulk-quantity-input">

                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    step="1"
                                                                    value={
                                                                        item.quantity
                                                                    }
                                                                    onChange={e =>
                                                                        updateBulkQuantity(
                                                                            item.tempId,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />

                                                                <span>
                                                                    ชิ้น
                                                                </span>

                                                            </div>

                                                        </div>


                                                        <div className="bulk-item-total">

                                                            <small>
                                                                รวม
                                                            </small>

                                                            <strong>

                                                                ฿
                                                                {money(
                                                                    Number(
                                                                        item.costPrice
                                                                    ) *
                                                                    Number(
                                                                        item.quantity ||
                                                                        0
                                                                    )
                                                                )}

                                                            </strong>

                                                        </div>


                                                        <button
                                                            type="button"
                                                            className="bulk-remove"
                                                            onClick={() =>
                                                                removeBulkItem(
                                                                    item.tempId
                                                                )
                                                            }
                                                        >

                                                            <X
                                                                size={16}
                                                            />

                                                        </button>

                                                    </div>

                                                )
                                            )}

                                        </div>


                                        <div className="bulk-total">

                                            <div>

                                                <span>
                                                    รวมจำนวน
                                                </span>

                                                <strong>

                                                    {
                                                        number(
                                                            bulkTotalQuantity
                                                        )
                                                    }{" "}
                                                    ชิ้น

                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    รวมต้นทุน
                                                </span>

                                                <strong>

                                                    ฿
                                                    {
                                                        money(
                                                            bulkTotalCost
                                                        )
                                                    }

                                                </strong>

                                            </div>

                                        </div>

                                    </div>

                                )}


                                <div className="modal-actions">

                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={
                                            closeAddModal
                                        }
                                        disabled={
                                            savingBulk
                                        }
                                    >

                                        ยกเลิก

                                    </button>


                                    <button
                                        type="button"
                                        className="save-product-button"
                                        onClick={
                                            handleBulkAdd
                                        }
                                        disabled={
                                            savingBulk ||
                                            bulkPreview.length ===
                                                0
                                        }
                                    >

                                        {savingBulk ? (

                                            <>

                                                <span className="button-spinner" />

                                                กำลังเพิ่ม...

                                            </>

                                        ) : (

                                            <>

                                                <Check
                                                    size={19}
                                                />

                                                เพิ่ม{" "}
                                                {
                                                    bulkTotalQuantity
                                                }{" "}
                                                ชิ้น

                                            </>

                                        )}

                                    </button>

                                </div>

                            </div>

                        )}

                </div>

            </div>

        );


    // ======================================================
    // SELL MODAL
    // ======================================================

    const sellModal =
        sellingProduct && (

            <div
                className="product-modal-overlay"
                onMouseDown={e => {

                    if (
                        e.target ===
                        e.currentTarget
                    ) {

                        closeSellModal();

                    }

                }}
            >

                <div
                    className="product-modal sell-modal"
                    onMouseDown={e =>
                        e.stopPropagation()
                    }
                >

                    {/* ==================================================
                        CLOSE
                    ================================================== */}

                    <button
                        type="button"
                        className="modal-close"
                        onClick={
                            closeSellModal
                        }
                        disabled={
                            savingSell
                        }
                    >

                        <X
                            size={19}
                        />

                    </button>


                    {/* ==================================================
                        HEADER
                    ================================================== */}

                    <div className="modal-header">

                        <div className="modal-icon-wrap">

                            <div className="modal-icon sell-icon">

                                <Tag
                                    size={27}
                                />

                            </div>

                        </div>


                        <div>

                            <h2>
                                บันทึกการขาย
                            </h2>

                            <p>
                                {
                                    sellingProduct.name
                                }
                            </p>

                        </div>

                    </div>


                    <form
                        className="product-form"
                        onSubmit={
                            confirmSell
                        }
                    >

                        {/* ==================================================
                            STOCK
                        ================================================== */}

                        <div className="sell-product-summary">

                            <div>

                                <span>
                                    มีในสต็อก
                                </span>

                                <strong>

                                    {number(
                                        getQuantity(
                                            sellingProduct
                                        )
                                    )}{" "}
                                    ชิ้น

                                </strong>

                            </div>


                            <div>

                                <span>
                                    ต้นทุน/ชิ้น
                                </span>

                                <strong>

                                    ฿
                                    {money(
                                        sellingProduct.costPrice ??
                                        sellingProduct.cost ??
                                        0
                                    )}

                                </strong>

                            </div>

                        </div>


                        {/* ==================================================
                            QUANTITY
                        ================================================== */}

                        <div className="form-group">

                            <label>

                                <Hash
                                    size={15}
                                />

                                จำนวนที่ขาย

                            </label>


                            <div className="quantity-input">

                                <input
                                    type="number"
                                    value={
                                        sellQuantity
                                    }
                                    onChange={e =>
                                        setSellQuantity(
                                            e.target.value
                                        )
                                    }
                                    min="1"
                                    max={
                                        getQuantity(
                                            sellingProduct
                                        )
                                    }
                                    step="1"
                                    placeholder="1"
                                    autoFocus
                                />

                                <span>
                                    ชิ้น
                                </span>

                            </div>


                            <p className="sell-hint-cost">

                                ขายได้สูงสุด{" "}

                                <strong>

                                    {number(
                                        getQuantity(
                                            sellingProduct
                                        )
                                    )}{" "}
                                    ชิ้น

                                </strong>

                            </p>

                        </div>


                        {/* ==================================================
                            SALE PRICE
                        ================================================== */}

                        <div className="form-group">

                            <label>

                                <CircleDollarSign
                                    size={15}
                                />

                                ราคาขายจริง/ชิ้น

                            </label>


                            <div className="money-input">

                                <span>
                                    ฿
                                </span>

                                <input
                                    type="number"
                                    value={
                                        sellPrice
                                    }
                                    onChange={e =>
                                        setSellPrice(
                                            e.target.value
                                        )
                                    }
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                />

                            </div>

                        </div>


                        {/* ==================================================
                            SOLD AT
                        ================================================== */}

                        <div className="form-group">

                            <label>

                                <CalendarDays
                                    size={15}
                                />

                                วันที่ขายจริง

                                <small>
                                    ระบุย้อนหลังได้
                                </small>

                            </label>


                            <div className="money-input">

                                <span>
                                    <Clock
                                        size={15}
                                    />
                                </span>

                                <input
                                    type="datetime-local"
                                    value={
                                        sellSoldAt ?? ""
                                    }
                                    onChange={e =>
                                        setSellSoldAt?.(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            <p className="sell-hint-cost">

                                วันที่นี้จะถูกบันทึกเป็น{" "}
                                <strong>
                                    soldAt
                                </strong>
                                {" "}ของรายการขาย

                            </p>

                        </div>


                        {/* ==================================================
                            SHIPPING + OTHER
                        ================================================== */}

                        <div className="form-row">

                            <div className="form-group">

                                <label>

                                    <CircleDollarSign
                                        size={15}
                                    />

                                    ค่าส่ง

                                    <small>
                                        ถ้ามี
                                    </small>

                                </label>


                                <div className="money-input">

                                    <span>
                                        ฿
                                    </span>

                                    <input
                                        type="number"
                                        value={
                                            sellShippingCost
                                        }
                                        onChange={e =>
                                            setSellShippingCost(
                                                e.target.value
                                            )
                                        }
                                        min="0"
                                        step="0.01"
                                        placeholder="0"
                                    />

                                </div>

                            </div>


                            <div className="form-group">

                                <label>

                                    <CircleDollarSign
                                        size={15}
                                    />

                                    ค่าใช้จ่ายอื่นๆ

                                    <small>
                                        ถ้ามี
                                    </small>

                                </label>


                                <div className="money-input">

                                    <span>
                                        ฿
                                    </span>

                                    <input
                                        type="number"
                                        value={
                                            sellOtherExpense
                                        }
                                        onChange={e =>
                                            setSellOtherExpense(
                                                e.target.value
                                            )
                                        }
                                        min="0"
                                        step="0.01"
                                        placeholder="0"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* ==================================================
                            PROFIT CARD
                        ================================================== */}

                        {hasValidSellPreview && (

                            <div
                                className={
                                    `sell-profit-card ${
                                        sellCalculation.totalProfit >= 0
                                            ? "profit-card-positive"
                                            : "profit-card-negative"
                                    }`
                                }
                            >

                                <div className="sell-profit-header">

                                    <div className="sell-profit-icon">

                                        <TrendingUp
                                            size={20}
                                        />

                                    </div>


                                    <div>

                                        <span>
                                            กำไรโดยประมาณ
                                        </span>

                                        <small>
                                            หลังหักต้นทุน + ค่าใช้จ่าย
                                        </small>

                                    </div>

                                </div>


                                <strong className="sell-profit-value">

                                    {sellCalculation.totalProfit >= 0
                                        ? "+"
                                        : ""
                                    }

                                    ฿
                                    {money(
                                        sellCalculation.totalProfit
                                    )}

                                </strong>


                                <div className="sell-profit-details">

                                    <div>

                                        <span>
                                            กำไร/ชิ้น
                                        </span>

                                        <strong>

                                            {sellCalculation.profitPerUnit >= 0
                                                ? "+"
                                                : ""
                                            }

                                            ฿
                                            {money(
                                                sellCalculation.profitPerUnit
                                            )}

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            ยอดขาย
                                        </span>

                                        <strong>

                                            ฿
                                            {money(
                                                sellCalculation.totalSales
                                            )}

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            ต้นทุนสินค้า
                                        </span>

                                        <strong>

                                            ฿
                                            {money(
                                                sellCalculation.totalCost
                                            )}

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            ค่าส่ง + อื่นๆ
                                        </span>

                                        <strong>

                                            ฿
                                            {money(
                                                sellCalculation.totalExpense
                                            )}

                                        </strong>

                                    </div>

                                </div>

                            </div>

                        )}


                        {/* ==================================================
                            FORMULA HINT
                        ================================================== */}

                        {hasValidSellPreview && (

                            <p className="sell-hint-cost">

                                กำไร ={" "}

                                (
                                ฿
                                {money(
                                    sellCalculation.salePrice
                                )}

                                {" − "}

                                ฿
                                {money(
                                    sellCalculation.costPerUnit
                                )}

                                ) ×{" "}

                                {number(
                                    sellCalculation.quantity
                                )}

                                {" − "}

                                ฿
                                {money(
                                    sellCalculation.totalExpense
                                )}

                            </p>

                        )}


                        {/* ==================================================
                            ACTIONS
                        ================================================== */}

                        <div className="modal-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={
                                    closeSellModal
                                }
                                disabled={
                                    savingSell
                                }
                            >

                                ยกเลิก

                            </button>


                            <button
                                type="submit"
                                className="save-product-button"
                                disabled={
                                    savingSell ||
                                    !hasValidSellPreview
                                }
                            >

                                {savingSell ? (

                                    <>

                                        <span className="button-spinner" />

                                        กำลังบันทึก...

                                    </>

                                ) : (

                                    <>

                                        <Check
                                            size={19}
                                        />

                                        ยืนยันขาย

                                    </>

                                )}

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        );


    // ======================================================
    // RETURN
    // ======================================================

    return (
        <>
            {addModal}
            {sellModal}
        </>
    );

}


export default ProductsModals;