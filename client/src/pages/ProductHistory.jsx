// ======================================================
// PRODUCT HISTORY
// ======================================================

import React, {
    useEffect,
    useMemo,
    useState
} from "react"

import {
    X,
    Package,
    CalendarDays,
    Clock3,
    ShoppingBag,
    TrendingUp,
    TrendingDown,
    Coins,
    Boxes,
    History,
    FileText,
    CircleDollarSign,
    ReceiptText,
    User,
    Tag,
    Hash,
    ArrowUpRight,
    Minus,
    ChevronDown,
    ChevronUp
} from "lucide-react"

import "../styles/ProductHistory.css"


// ======================================================
// HELPERS
// ======================================================

function toNumber(value) {

    const number =
        Number(value)

    return Number.isFinite(number)
        ? number
        : 0
}


function formatMoney(value) {

    return toNumber(value).toLocaleString(
        "th-TH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )
}


function formatNumber(value) {

    return toNumber(value).toLocaleString(
        "th-TH",
        {
            maximumFractionDigits: 2
        }
    )
}


// ======================================================
// DATE / TIME
// ======================================================

function parseDate(value) {

    if (!value) {
        return null
    }

    const date =
        new Date(value)

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null
    }

    return date
}


function formatDateTime(value) {

    const date =
        parseDate(value)

    if (!date) {
        return "-"
    }

    return new Intl.DateTimeFormat(
        "th-TH",
        {
            timeZone: "Asia/Bangkok",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }
    ).format(date)
}


function formatDate(value) {

    const date =
        parseDate(value)

    if (!date) {
        return "-"
    }

    return new Intl.DateTimeFormat(
        "th-TH",
        {
            timeZone: "Asia/Bangkok",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    ).format(date)
}


function formatTime(value) {

    const date =
        parseDate(value)

    if (!date) {
        return "-"
    }

    return new Intl.DateTimeFormat(
        "th-TH",
        {
            timeZone: "Asia/Bangkok",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }
    ).format(date)
}


// ======================================================
// STATUS
// ======================================================

function getStatusLabel(status) {

    switch (status) {

        case "AVAILABLE":
            return "Available"

        case "SOLD":
            return "Sold"

        case "CANCELLED":
            return "Cancelled"

        default:
            return status || "-"
    }
}


function getStatusClass(status) {

    switch (status) {

        case "SOLD":
            return "is-sold"

        case "CANCELLED":
            return "is-cancelled"

        case "AVAILABLE":
            return "is-available"

        default:
            return ""
    }
}


// ======================================================
// SALE ITEM HELPERS
// ======================================================

function getSaleQuantity(item) {

    const quantity =
        item?.quantity ??
        item?.saleQuantity ??
        item?.soldQuantity ??
        item?.totalQuantity ??
        0

    return Math.max(
        0,
        toNumber(quantity)
    )
}


function getSalePrice(item) {

    return Math.max(
        0,
        toNumber(
            item?.salePrice ??
            item?.actualSalePrice ??
            item?.actual_sale_price ??
            item?.unitSalePrice ??
            item?.unit_sale_price ??
            item?.price ??
            0
        )
    )
}


function getCostPrice(item) {

    return Math.max(
        0,
        toNumber(
            item?.costPrice ??
            item?.cost_price ??
            item?.unitCost ??
            item?.unit_cost ??
            0
        )
    )
}


function getSalesTotal(item) {

    const explicit =
        item?.salesTotal ??
        item?.totalSale ??
        item?.totalSales ??
        item?.saleTotal ??
        item?.sale_total ??
        item?.totalAmount ??
        item?.total_amount

    if (
        explicit !== undefined &&
        explicit !== null &&
        explicit !== ""
    ) {

        return toNumber(explicit)
    }

    return (
        getSaleQuantity(item) *
        getSalePrice(item)
    )
}


function getTotalCost(item) {

    const explicit =
        item?.totalCost ??
        item?.total_cost ??
        item?.costTotal ??
        item?.cost_total

    if (
        explicit !== undefined &&
        explicit !== null &&
        explicit !== ""
    ) {

        return toNumber(explicit)
    }

    return (
        getSaleQuantity(item) *
        getCostPrice(item)
    )
}


function getProfit(item) {

    const explicit =
        item?.profit ??
        item?.totalProfit ??
        item?.total_profit ??
        item?.profitAmount ??
        item?.profit_amount

    if (
        explicit !== undefined &&
        explicit !== null &&
        explicit !== ""
    ) {

        return toNumber(explicit)
    }

    return (
        getSalesTotal(item) -
        getTotalCost(item)
    )
}


function getSaleDate(item) {

    return (
        item?.soldAt ??
        item?.saleCreatedAt ??
        item?.sale_created_at ??
        item?.saleDate ??
        item?.sale_date ??
        item?.createdAt ??
        item?.created_at ??
        item?.updatedAt ??
        item?.updated_at ??
        null
    )
}


function getSaleItemId(item) {

    return (
        item?.saleItemId ??
        item?.sale_item_id ??
        item?.id ??
        null
    )
}


function getSaleId(item) {

    return (
        item?.saleId ??
        item?.sale_id ??
        item?.sale?.id ??
        null
    )
}


function getProductItemId(item) {

    return (
        item?.consignmentItemId ??
        item?.consignment_item_id ??
        item?.productItemId ??
        item?.product_item_id ??
        item?.product?.id ??
        null
    )
}


function getItemName(item) {

    return (
        item?.name ??
        item?.productName ??
        item?.product_name ??
        item?.product?.name ??
        "สินค้า"
    )
}


function getCustomerName(item) {

    return (
        item?.customer?.name ??
        item?.customerName ??
        item?.customer_name ??
        item?.sale?.customer?.name ??
        "-"
    )
}


function getSaleUser(item) {

    return (
        item?.user?.name ??
        item?.createdBy?.name ??
        item?.sale?.user?.name ??
        "-"
    )
}


function getSource(item) {

    return (
        item?.source ??
        item?.sale?.source ??
        "SALE"
    )
}


// ======================================================
// EXPAND SALE ITEM
//
// IMPORTANT
//
// Backend:
// SaleItem quantity = 3
//
// UI:
// unit #1
// unit #2
// unit #3
//
// แต่ทั้ง 3 ยังใช้ Sale ID เดียวกัน
// และนับเป็น 1 Transaction
// ======================================================

function expandSaleItem(item) {

    const quantity =
        Math.floor(
            getSaleQuantity(item)
        )

    if (quantity <= 0) {
        return []
    }

    const salePrice =
        getSalePrice(item)

    const costPrice =
        getCostPrice(item)

    const saleId =
        getSaleId(item)

    const saleItemId =
        getSaleItemId(item)

    const saleDate =
        getSaleDate(item)

    const totalSales =
        getSalesTotal(item)

    const totalCost =
        getTotalCost(item)

    const totalProfit =
        getProfit(item)

    const hasExplicitProfit =
        item?.profit !== undefined ||
        item?.totalProfit !== undefined ||
        item?.total_profit !== undefined ||
        item?.profitAmount !== undefined ||
        item?.profit_amount !== undefined


    /*
     * ถ้า Backend ส่ง profit รวมมา
     * ต้องกระจายตามจำนวนชิ้น
     *
     * เช่น
     * quantity = 3
     * profit = 300
     *
     * แต่ละ row = 100
     */
    const profitPerUnit =
        hasExplicitProfit
            ? totalProfit / quantity
            : salePrice - costPrice


    const salesPerUnit =
        quantity > 0
            ? totalSales / quantity
            : salePrice


    const costPerUnit =
        quantity > 0
            ? totalCost / quantity
            : costPrice


    const result = []


    for (
        let unitIndex = 1;
        unitIndex <= quantity;
        unitIndex++
    ) {

        result.push({

            ...item,

            quantity: 1,

            unitQuantity: 1,

            unitIndex,

            saleId,

            saleItemId,

            saleDate,

            unitSalePrice:
                salesPerUnit,

            unitCostPrice:
                costPerUnit,

            salesTotal:
                salesPerUnit,

            totalCost:
                costPerUnit,

            profit:
                profitPerUnit

        })
    }


    return result
}


// ======================================================
// SALES HISTORY ROW
// ======================================================

function SalesHistoryTableRow({
    item,
    index
}) {

    const quantity = 1

    const salePrice =
        toNumber(
            item.unitSalePrice ??
            getSalePrice(item)
        )

    const costPrice =
        toNumber(
            item.unitCostPrice ??
            getCostPrice(item)
        )

    const salesTotal =
        toNumber(
            item.salesTotal ??
            salePrice
        )

    const totalCost =
        toNumber(
            item.totalCost ??
            costPrice
        )

    const profit =
        toNumber(
            item.profit ??
            (
                salesTotal -
                totalCost
            )
        )

    const saleDate =
        item.saleDate ??
        getSaleDate(item)

    const saleId =
        getSaleId(item)

    const saleItemId =
        getSaleItemId(item)


    const profitClass =
        profit > 0
            ? "profit-positive"
            : profit < 0
                ? "profit-negative"
                : "profit-zero"


    const rowKey =
        `${saleItemId || "sale-item"}-${saleId || "sale"}-${item.unitIndex || index}`


    return (

        <tr
            key={rowKey}
            className="product-history-sales-row"
        >

            {/* ==================================================
                #
            ================================================== */}

            <td className="product-history-sales-index">

                <strong>
                    {index + 1}
                </strong>

            </td>


            {/* ==================================================
                DATE / TIME
            ================================================== */}

            <td className="product-history-sales-date">

                <div className="product-history-table-date">

                    <CalendarDays size={15} />

                    <div>

                        <strong>
                            {formatDate(
                                saleDate
                            )}
                        </strong>

                        <span>
                            {formatTime(
                                saleDate
                            )}
                        </span>


                        {saleId && (

                            <small>
                                Sale #{saleId}
                            </small>

                        )}

                    </div>

                </div>

            </td>


            {/* ==================================================
                UNIT
            ================================================== */}

            <td className="product-history-sales-quantity">

                <div className="product-history-table-quantity">

                    <Boxes size={15} />

                    <strong>
                        1
                    </strong>

                    <span>
                        ชิ้น
                    </span>

                </div>

            </td>


            {/* ==================================================
                COST / UNIT
            ================================================== */}

            <td className="product-history-sales-money">

                ฿{formatMoney(
                    costPrice
                )}

            </td>


            {/* ==================================================
                SALE PRICE / UNIT
            ================================================== */}

            <td className="product-history-sales-money">

                <strong className="money-sale">

                    ฿{formatMoney(
                        salePrice
                    )}

                </strong>

            </td>


            {/* ==================================================
                TOTAL COST
            ================================================== */}

            <td className="product-history-sales-money">

                ฿{formatMoney(
                    totalCost
                )}

            </td>


            {/* ==================================================
                TOTAL SALES
            ================================================== */}

            <td className="product-history-sales-money">

                <strong className="money-sale">

                    ฿{formatMoney(
                        salesTotal
                    )}

                </strong>

            </td>


            {/* ==================================================
                PROFIT
            ================================================== */}

            <td className="product-history-sales-money">

                <strong
                    className={
                        profitClass
                    }
                >

                    {profit > 0
                        ? "+"
                        : ""
                    }

                    ฿{formatMoney(
                        profit
                    )}

                </strong>

            </td>

        </tr>

    )
}


// ======================================================
// AUDIT DETAIL
// ======================================================

function AuditValue({
    label,
    value,
    icon
}) {

    return (

        <div className="product-history-audit-value">

            <div className="product-history-audit-value-icon">
                {icon}
            </div>

            <div>

                <span>
                    {label}
                </span>

                <strong>
                    {value ?? "-"}
                </strong>

            </div>

        </div>
    )
}


// ======================================================
// AUDIT ITEM
// ======================================================

function AuditHistoryItem({
    log
}) {

    const [
        expanded,
        setExpanded
    ] = useState(false)


    const details =
        log?.details &&
        typeof log.details === "object"
            ? log.details
            : {}


    const productItem =
        log?.productItem ||
        log?.consignmentItem ||
        null


    const action =
        log?.action ||
        "ACTION"


    const entity =
        log?.entity ||
        "Product"


    const entityId =
        log?.entityId ??
        log?.entity_id


    const createdAt =
        log?.createdAt ??
        log?.created_at


    const userName =
        log?.user?.name ??
        log?.userName ??
        log?.createdBy?.name ??
        "Unknown user"


    const quantity =
        productItem?.quantity ??
        details?.quantity ??
        details?.soldQuantity ??
        details?.saleQuantity


    const salePrice =
        productItem?.salePrice ??
        details?.salePrice ??
        details?.actualSalePrice


    const costPrice =
        productItem?.costPrice ??
        details?.costPrice


    const profit =
        productItem?.profit ??
        details?.profit ??
        details?.totalProfit


    return (

        <div className="product-history-audit-item">

            <button
                type="button"
                className="product-history-audit-main"
                onClick={() =>
                    setExpanded(
                        value => !value
                    )
                }
            >

                <div className="product-history-audit-icon">

                    <FileText size={17} />

                </div>


                <div className="product-history-audit-info">

                    <div className="product-history-audit-heading">

                        <strong>
                            {action}
                        </strong>

                        <span>
                            {entity}

                            {entityId
                                ? ` #${entityId}`
                                : ""
                            }
                        </span>

                    </div>


                    <div className="product-history-audit-meta">

                        <span>
                            {userName}
                        </span>

                        <span>
                            •
                        </span>

                        <span>
                            {formatDateTime(
                                createdAt
                            )}
                        </span>

                    </div>

                </div>


                <div className="product-history-audit-expand">

                    {expanded
                        ? <ChevronUp size={18} />
                        : <ChevronDown size={18} />
                    }

                </div>

            </button>


            {expanded && (

                <div className="product-history-audit-details">

                    {(quantity !== undefined ||
                        salePrice !== undefined ||
                        costPrice !== undefined ||
                        profit !== undefined) && (

                        <div className="product-history-audit-product">

                            {quantity !== undefined && (

                                <AuditValue
                                    label="จำนวน"
                                    value={`${formatNumber(quantity)} ชิ้น`}
                                    icon={
                                        <Boxes size={16} />
                                    }
                                />

                            )}


                            {costPrice !== undefined && (

                                <AuditValue
                                    label="ต้นทุน"
                                    value={`฿${formatMoney(costPrice)}`}
                                    icon={
                                        <Coins size={16} />
                                    }
                                />

                            )}


                            {salePrice !== undefined && (

                                <AuditValue
                                    label="ราคาขาย"
                                    value={`฿${formatMoney(salePrice)}`}
                                    icon={
                                        <CircleDollarSign size={16} />
                                    }
                                />

                            )}


                            {profit !== undefined && (

                                <AuditValue
                                    label="กำไร"
                                    value={`฿${formatMoney(profit)}`}
                                    icon={
                                        <TrendingUp size={16} />
                                    }
                                />

                            )}

                        </div>

                    )}


                    <div className="product-history-audit-json">

                        <div className="product-history-audit-json-title">
                            รายละเอียด
                        </div>

                        <pre>
                            {JSON.stringify(
                                details,
                                null,
                                2
                            )}
                        </pre>

                    </div>

                </div>

            )}

        </div>

    )
}


// ======================================================
// MAIN COMPONENT
// ======================================================

export default function ProductHistory({

    productId,

    onClose

}) {

    const [
        data,
        setData
    ] = useState(null)


    const [
        loading,
        setLoading
    ] = useState(true)


    const [
        error,
        setError
    ] = useState("")


    const [
        activeTab,
        setActiveTab
    ] = useState("sales")


    // ==================================================
    // FETCH
    // ==================================================

    useEffect(() => {

        if (!productId) {

            setError(
                "ไม่พบ Product ID"
            )

            setLoading(false)

            return

        }


        let cancelled = false


        async function fetchHistory() {

            try {

                setLoading(true)

                setError("")


                const response =
                    await fetch(
                        `/api/product/${productId}/history`,
                        {
                            method: "GET",
                            credentials: "include",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            }
                        }
                    )


                const result =
                    await response.json()


                if (!response.ok) {

                    throw new Error(
                        result?.message ||
                        "ไม่สามารถโหลดประวัติสินค้าได้"
                    )

                }


                if (!cancelled) {

                    setData(
                        result || {}
                    )

                }

            } catch (err) {

                if (!cancelled) {

                    console.error(
                        "PRODUCT HISTORY ERROR:",
                        err
                    )

                    setError(
                        err?.message ||
                        "ไม่สามารถโหลดประวัติสินค้าได้"
                    )

                }

            } finally {

                if (!cancelled) {

                    setLoading(false)

                }

            }

        }


        fetchHistory()


        return () => {

            cancelled = true

        }

    }, [productId])


    // ==================================================
    // DATA
    // ==================================================

    const product =
        data?.product ||
        null


    const summary =
        data?.summary ||
        {}


    const salesHistory =
        Array.isArray(
            data?.salesHistory
        )
            ? data.salesHistory
            : []


    const auditLogs =
        Array.isArray(
            data?.auditLogs
        )
            ? data.auditLogs
            : []


    // ==================================================
    // SORT TRANSACTIONS
    //
    // 1 SaleItem = 1 Transaction
    //
    // ยังไม่แตก quantity
    // ==================================================

    const sortedSalesHistory =
        useMemo(() => {

            return [
                ...salesHistory
            ].sort(
                (
                    a,
                    b
                ) => {

                    const dateA =
                        parseDate(
                            getSaleDate(a)
                        )?.getTime() || 0

                    const dateB =
                        parseDate(
                            getSaleDate(b)
                        )?.getTime() || 0

                    return dateB - dateA

                }
            )

        }, [
            salesHistory
        ])


    // ==================================================
    // EXPANDED UNITS
    //
    // 1 SaleItem quantity = 3
    //
    // becomes:
    //
    // Unit 1
    // Unit 2
    // Unit 3
    //
    // Transaction remains 1
    // ==================================================

    const expandedSalesHistory =
        useMemo(() => {

            return sortedSalesHistory.flatMap(
                item =>
                    expandSaleItem(item)
            )

        }, [
            sortedSalesHistory
        ])


    // ==================================================
    // TABLE TOTALS
    //
    // ALWAYS calculate from original SaleItem
    //
    // NEVER from expanded rows
    // ==================================================

    const tableTotals =
        useMemo(() => {

            return sortedSalesHistory.reduce(
                (
                    result,
                    item
                ) => {

                    result.quantity +=
                        getSaleQuantity(item)


                    result.totalCost +=
                        getTotalCost(item)


                    result.totalSales +=
                        getSalesTotal(item)


                    result.profit +=
                        getProfit(item)


                    return result

                },
                {
                    quantity: 0,
                    totalCost: 0,
                    totalSales: 0,
                    profit: 0
                }
            )

        }, [
            sortedSalesHistory
        ])


    // ==================================================
    // SUMMARY
    //
    // Backend summary first
    // fallback = calculated SaleItem data
    // ==================================================

    const totalTransactions =
        summary.totalSales !== undefined
            ? toNumber(
                summary.totalSales
            )
            : sortedSalesHistory.length


    const totalSoldQuantity =
        summary.totalSoldQuantity !== undefined
            ? toNumber(
                summary.totalSoldQuantity
            )
            : tableTotals.quantity


    const totalSalesAmount =
        summary.totalSalesAmount !== undefined
            ? toNumber(
                summary.totalSalesAmount
            )
            : tableTotals.totalSales


    const totalProfit =
        summary.totalProfit !== undefined
            ? toNumber(
                summary.totalProfit
            )
            : tableTotals.profit


    const totalCost =
        summary.totalCost !== undefined
            ? toNumber(
                summary.totalCost
            )
            : tableTotals.totalCost


    // ==================================================
    // LAST SALE
    // ==================================================

    const latestSale =
        sortedSalesHistory.length > 0
            ? sortedSalesHistory[0]
            : null


    const latestSaleDate =
        latestSale
            ? getSaleDate(
                latestSale
            )
            : product?.soldAt


    // ==================================================
    // PROFIT MARGIN
    // ==================================================

    const profitMargin =
        totalSalesAmount > 0
            ? (
                totalProfit /
                totalSalesAmount
            ) * 100
            : 0


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <div className="product-history-overlay">

                <div className="product-history-loading">

                    <div className="product-history-loading-icon">

                        <History size={28} />

                    </div>

                    <h3>
                        กำลังโหลดประวัติสินค้า
                    </h3>

                    <p>
                        กำลังเตรียมข้อมูลการขายและ Audit Log...
                    </p>

                </div>

            </div>

        )

    }


    // ==================================================
    // ERROR
    // ==================================================

    if (error) {

        return (

            <div className="product-history-overlay">

                <div className="product-history-error">

                    <div className="product-history-error-icon">

                        <Package size={28} />

                    </div>

                    <h3>
                        โหลดข้อมูลไม่สำเร็จ
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={onClose}
                        className="product-history-close-error"
                    >
                        ปิด
                    </button>

                </div>

            </div>

        )

    }


    // ==================================================
    // MAIN
    // ==================================================

    return (

        <div
            className="product-history-overlay"
            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {

                    onClose?.()

                }

            }}
        >

            <div className="product-history-modal">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="product-history-header">

                    <div className="product-history-header-left">

                        <div className="product-history-header-icon">

                            <History size={25} />

                        </div>


                        <div>

                            <span className="product-history-eyebrow">
                                PRODUCT HISTORY
                            </span>

                            <h2>
                                {product?.name ||
                                    "Product"}
                            </h2>

                            <p>
                                ประวัติการขาย ต้นทุน กำไร และ Audit Log
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="product-history-close"
                        onClick={onClose}
                        aria-label="Close"
                    >

                        <X size={22} />

                    </button>

                </div>


                {/* ==================================================
                    PRODUCT SUMMARY
                ================================================== */}

                <div className="product-history-product-card">

                    <div className="product-history-product-main">

                        <div className="product-history-product-icon">

                            <Package size={27} />

                        </div>


                        <div>

                            <span>
                                Product #{product?.id || productId}
                            </span>

                            <h3>
                                {product?.name || "-"}
                            </h3>

                            <p>
                                {product?.description ||
                                    "ไม่มีรายละเอียดสินค้า"}
                            </p>

                        </div>

                    </div>


                    <div className="product-history-product-meta">

                        <div>

                            <span>
                                Owner
                            </span>

                            <strong>
                                {product?.owner?.name ||
                                    "-"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Stock เหลือ
                            </span>

                            <strong>
                                {formatNumber(
                                    product?.quantity ?? 0
                                )}
                                {" "}ชิ้น
                            </strong>

                        </div>


                        <div>

                            <span>
                                Status
                            </span>

                            <strong
                                className={
                                    getStatusClass(
                                        product?.status
                                    )
                                }
                            >
                                {getStatusLabel(
                                    product?.status
                                )}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    LAST SOLD
                ================================================== */}

                <div className="product-history-last-sale">

                    <div className="product-history-last-sale-icon">

                        <Clock3 size={20} />

                    </div>


                    <div>

                        <span>
                            ขายล่าสุด
                        </span>


                        <strong>

                            {latestSaleDate
                                ? formatDateTime(
                                    latestSaleDate
                                )
                                : "ยังไม่มีประวัติการขาย"
                            }

                        </strong>

                    </div>


                    {latestSale && (

                        <div className="product-history-last-sale-extra">

                            {getSaleId(
                                latestSale
                            ) && (

                                <span>
                                    Sale #{getSaleId(
                                        latestSale
                                    )}
                                </span>

                            )}

                        </div>

                    )}

                </div>


                {/* ==================================================
                    SUMMARY
                ================================================== */}

                <div className="product-history-summary-grid">

                    {/* TRANSACTIONS */}

                    <div className="product-history-summary-card">

                        <div className="product-history-summary-icon">

                            <ShoppingBag size={20} />

                        </div>

                        <span>
                            จำนวนครั้งที่ขาย
                        </span>

                        <strong>
                            {formatNumber(
                                totalTransactions
                            )}
                        </strong>

                        <small>
                            Transaction
                        </small>

                    </div>


                    {/* QUANTITY */}

                    <div className="product-history-summary-card">

                        <div className="product-history-summary-icon">

                            <Boxes size={20} />

                        </div>

                        <span>
                            ขายไปทั้งหมด
                        </span>

                        <strong>
                            {formatNumber(
                                totalSoldQuantity
                            )}
                        </strong>

                        <small>
                            ชิ้น
                        </small>

                    </div>


                    {/* SALES */}

                    <div className="product-history-summary-card">

                        <div className="product-history-summary-icon">

                            <CircleDollarSign size={20} />

                        </div>

                        <span>
                            ยอดขายรวม
                        </span>

                        <strong>
                            ฿{formatMoney(
                                totalSalesAmount
                            )}
                        </strong>

                        <small>
                            Revenue
                        </small>

                    </div>


                    {/* PROFIT */}

                    <div className="product-history-summary-card">

                        <div className="product-history-summary-icon">

                            {totalProfit >= 0
                                ? (
                                    <TrendingUp size={20} />
                                )
                                : (
                                    <TrendingDown size={20} />
                                )
                            }

                        </div>

                        <span>
                            กำไรรวม
                        </span>

                        <strong
                            className={
                                totalProfit > 0
                                    ? "profit"
                                    : totalProfit < 0
                                        ? "loss"
                                        : ""
                            }
                        >
                            {totalProfit > 0
                                ? "+"
                                : ""
                            }

                            ฿{formatMoney(
                                totalProfit
                            )}
                        </strong>

                        <small>
                            {profitMargin.toFixed(2)}% Margin
                        </small>

                    </div>

                </div>


                {/* ==================================================
                    FINANCIAL SUMMARY BAR
                ================================================== */}

                <div className="product-history-financial-bar">

                    <div>

                        <Coins size={17} />

                        <span>
                            ต้นทุนรวม
                        </span>

                        <strong>
                            ฿{formatMoney(
                                totalCost
                            )}
                        </strong>

                    </div>


                    <div>

                        <CircleDollarSign size={17} />

                        <span>
                            ยอดขาย
                        </span>

                        <strong>
                            ฿{formatMoney(
                                totalSalesAmount
                            )}
                        </strong>

                    </div>


                    <div>

                        {totalProfit >= 0
                            ? <ArrowUpRight size={17} />
                            : <TrendingDown size={17} />
                        }

                        <span>
                            Net Profit
                        </span>

                        <strong
                            className={
                                totalProfit >= 0
                                    ? "is-profit"
                                    : "is-loss"
                            }
                        >
                            {totalProfit >= 0
                                ? "+"
                                : ""
                            }

                            ฿{formatMoney(
                                totalProfit
                            )}
                        </strong>

                    </div>


                    <div>

                        <Tag size={17} />

                        <span>
                            Margin
                        </span>

                        <strong>
                            {profitMargin.toFixed(2)}%
                        </strong>

                    </div>

                </div>


                {/* ==================================================
                    TABS
                ================================================== */}

                <div className="product-history-tabs">

                    <button
                        type="button"
                        className={
                            activeTab === "sales"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab(
                                "sales"
                            )
                        }
                    >

                        <ReceiptText size={18} />

                        <span>
                            Sales History
                        </span>

                        <b>
                            {expandedSalesHistory.length}
                        </b>

                    </button>


                    <button
                        type="button"
                        className={
                            activeTab === "audit"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab(
                                "audit"
                            )
                        }
                    >

                        <FileText size={18} />

                        <span>
                            Audit History
                        </span>

                        <b>
                            {auditLogs.length}
                        </b>

                    </button>

                </div>


                {/* ==================================================
                    CONTENT
                ================================================== */}

                <div className="product-history-content">

                    {/* ==================================================
                        SALES HISTORY
                    ================================================== */}

                    {activeTab === "sales" && (

                        <section>

                            <div className="product-history-section-heading">

                                <div>

                                    <span>
                                        TRANSACTION HISTORY
                                    </span>

                                    <h3>
                                        Sales History
                                    </h3>

                                    <p>
                                        1 ชิ้น = 1 รายการ
                                        โดย Transaction เดียวกันยังคงใช้ Sale ID เดียวกัน
                                    </p>

                                </div>


                                <div className="product-history-section-total">

                                    <Coins size={17} />

                                    ฿{formatMoney(
                                        totalSalesAmount
                                    )}

                                </div>

                            </div>


                            {sortedSalesHistory.length === 0 ? (

                                <div className="product-history-empty">

                                    <ShoppingBag size={34} />

                                    <h3>
                                        ยังไม่มีประวัติการขาย
                                    </h3>

                                    <p>
                                        สินค้านี้ยังไม่เคยถูกขาย
                                    </p>

                                </div>

                            ) : (

                                <>

                                    <div className="product-history-sales-table-wrap">

                                        <table className="product-history-sales-table">

                                            <thead>

                                                <tr>

                                                    <th>
                                                        #
                                                    </th>

                                                    <th>
                                                        วันที่ขาย
                                                    </th>

                                                    <th>
                                                        จำนวน
                                                    </th>

                                                    <th>
                                                        ต้นทุน/ชิ้น
                                                    </th>

                                                    <th>
                                                        ราคาขาย/ชิ้น
                                                    </th>

                                                    <th>
                                                        ต้นทุนรวม
                                                    </th>

                                                    <th>
                                                        ยอดขาย
                                                    </th>

                                                    <th>
                                                        กำไร
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {expandedSalesHistory.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => (

                                                        <SalesHistoryTableRow
                                                            key={
                                                                `${getSaleItemId(item) || "sale-item"}-${getSaleId(item) || "sale"}-${item.unitIndex || index}`
                                                            }
                                                            item={item}
                                                            index={index}
                                                        />

                                                    )
                                                )}

                                            </tbody>


                                            <tfoot>

                                                <tr>

                                                    <td
                                                        colSpan={2}
                                                    >

                                                        <strong>
                                                            รวม
                                                        </strong>

                                                    </td>


                                                    <td>

                                                        <strong>
                                                            {formatNumber(
                                                                tableTotals.quantity
                                                            )}
                                                            {" "}ชิ้น
                                                        </strong>

                                                    </td>


                                                    <td>
                                                        -
                                                    </td>


                                                    <td>
                                                        -
                                                    </td>


                                                    <td>

                                                        <strong>
                                                            ฿{formatMoney(
                                                                tableTotals.totalCost
                                                            )}
                                                        </strong>

                                                    </td>


                                                    <td>

                                                        <strong className="money-sale">

                                                            ฿{formatMoney(
                                                                tableTotals.totalSales
                                                            )}

                                                        </strong>

                                                    </td>


                                                    <td>

                                                        <strong
                                                            className={
                                                                tableTotals.profit > 0
                                                                    ? "profit-positive"
                                                                    : tableTotals.profit < 0
                                                                        ? "profit-negative"
                                                                        : "profit-zero"
                                                            }
                                                        >

                                                            {tableTotals.profit > 0
                                                                ? "+"
                                                                : ""
                                                            }

                                                            ฿{formatMoney(
                                                                tableTotals.profit
                                                            )}

                                                        </strong>

                                                    </td>

                                                </tr>

                                            </tfoot>

                                        </table>

                                    </div>


                                    {/* ==================================================
                                        TABLE INFO
                                    ================================================== */}

                                    <div className="product-history-sales-count">

                                        <span>
                                            แสดง
                                        </span>

                                        <strong>
                                            {expandedSalesHistory.length}
                                        </strong>

                                        <span>
                                            รายการสินค้า
                                        </span>

                                        <span>
                                            •
                                        </span>

                                        <strong>
                                            {totalTransactions}
                                        </strong>

                                        <span>
                                            Transaction
                                        </span>

                                    </div>

                                </>

                            )}

                        </section>

                    )}


                    {/* ==================================================
                        AUDIT HISTORY
                    ================================================== */}

                    {activeTab === "audit" && (

                        <section>

                            <div className="product-history-section-heading">

                                <div>

                                    <span>
                                        AUDIT LOG
                                    </span>

                                    <h3>
                                        Audit Timeline
                                    </h3>

                                    <p>
                                        ประวัติการเปลี่ยนแปลงและการทำรายการของสินค้า
                                    </p>

                                </div>


                                <div className="product-history-section-total">

                                    <History size={17} />

                                    {auditLogs.length}
                                    {" "}รายการ

                                </div>

                            </div>


                            {auditLogs.length === 0 ? (

                                <div className="product-history-empty">

                                    <FileText size={34} />

                                    <h3>
                                        ยังไม่มี Audit Log
                                    </h3>

                                    <p>
                                        ไม่พบประวัติการทำรายการ
                                    </p>

                                </div>

                            ) : (

                                <div className="product-history-audit-list">

                                    {auditLogs.map(
                                        (
                                            log,
                                            index
                                        ) => (

                                            <AuditHistoryItem
                                                key={
                                                    log.id ||
                                                    `audit-${index}`
                                                }
                                                log={log}
                                            />

                                        )
                                    )}

                                </div>

                            )}

                        </section>

                    )}

                </div>


                {/* ==================================================
                    FOOTER
                ================================================== */}

                <div className="product-history-footer">

                    <div className="product-history-footer-info">

                        <CalendarDays size={17} />

                        <span>
                            Purchase Date:
                        </span>

                        <strong>
                            {formatDate(
                                product?.purchaseDate
                            )}
                        </strong>

                    </div>


                    <div className="product-history-footer-meta">

                        {product?.id && (

                            <span>
                                <Hash size={14} />
                                {product.id}
                            </span>

                        )}

                        {getProductItemId(product) && (

                            <span>
                                Product Item #{getProductItemId(product)}
                            </span>

                        )}

                    </div>


                    <button
                        type="button"
                        className="product-history-footer-close"
                        onClick={onClose}
                    >
                        ปิด
                    </button>

                </div>

            </div>

        </div>

    )
}