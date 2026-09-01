import React, {
    useMemo,
    useState
} from "react"

import {
    createPortal
} from "react-dom"

import {
    CalendarDays,
    Hash,
    PackageOpen,
    ChevronUp,
    ChevronDown,
    ArrowUpDown,
    History,
    X
} from "lucide-react"


// ======================================================
// SOLD PRODUCTS
//
// SOURCE OF TRUTH
// Sale / SaleItem
//
// Parent Products.jsx ส่ง saleItems แบบ flat
//
// MAIN TABLE
//     1 row = 1 product
//
// HISTORY LOG
//     1 row = 1 SaleItem
//
// IMPORTANT
// - quantity มาจาก SaleItem.quantity
// - ราคาขายมาจาก SaleItem.salePrice
// - ต้นทุนใช้ SaleItem.costPriceAtSale
// - วันขายย้อนหลังใช้ SaleItem.soldAt
// - ถ้าไม่มี soldAt จึง fallback ไป createdAt
//
// ======================================================


function SoldProducts({
    saleItems = [],
    soldProducts = [],

    money,
    number,
    StatusBadge
}) {

    // ======================================================
    // SORT
    // ======================================================

    const [
        sortBy,
        setSortBy
    ] = useState("soldDate")

    const [
        sortDirection,
        setSortDirection
    ] = useState("desc")


    // ======================================================
    // HISTORY POPUP
    // ======================================================

    const [
        historyProduct,
        setHistoryProduct
    ] = useState(null)


    // ======================================================
    // SAFE NUMBER
    // ======================================================

    const safeNumber = value => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return 0
        }

        const result =
            Number(value)

        return Number.isFinite(result)
            ? result
            : 0
    }


    // ======================================================
    // FORMAT NUMBER
    // ======================================================

    const formatNumber = value => {

        const result =
            safeNumber(value)

        if (
            typeof number ===
            "function"
        ) {
            return number(result)
        }

        return result.toLocaleString(
            "en-US"
        )
    }


    // ======================================================
    // FORMAT MONEY
    // ======================================================

    const formatMoney = value => {

        const result =
            safeNumber(value)

        if (
            typeof money ===
            "function"
        ) {
            return money(result)
        }

        return result.toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    }


    // ======================================================
    // PRODUCT FROM SALE ITEM
    // ======================================================

    const getProduct = item => {

        return (
            item?.consignmentItem ??
            item?.product ??
            item?.stock ??
            item ??
            {}
        )
    }


    // ======================================================
    // PRODUCT ID
    // ======================================================

    const getProductId = item => {

        const product =
            getProduct(item)

        const ids = [

            item?.consignmentItemId,

            item?.consignment_item_id,

            product?.id,

            product?._id,

            item?.productId,

            item?.product_id,

            item?.stockId,

            item?.stock_id,

            product?.productId,

            product?.product_id

        ]

        for (
            const id of ids
        ) {

            if (
                id !== null &&
                id !== undefined &&
                id !== ""
            ) {

                return String(id)

            }

        }


        const name =
            String(
                product?.name ??
                item?.name ??
                ""
            ).trim()

        const description =
            String(
                product?.description ??
                item?.description ??
                ""
            ).trim()

        const note =
            String(
                product?.note ??
                item?.note ??
                ""
            ).trim()

        return [
            name,
            description,
            note
        ].join("|")
    }


    // ======================================================
    // PRODUCT NAME
    // ======================================================

    const getProductName = item => {

        const product =
            getProduct(item)

        return (
            product?.name ??
            item?.name ??
            "ไม่ระบุชื่อสินค้า"
        )
    }


    // ======================================================
    // DESCRIPTION
    // ======================================================

    const getDescription = item => {

        const product =
            getProduct(item)

        return (
            product?.description ??
            item?.description ??
            ""
        )
    }


    // ======================================================
    // NOTE
    // ======================================================

    const getNote = item => {

        const product =
            getProduct(item)

        return (
            product?.note ??
            item?.note ??
            ""
        )
    }


    // ======================================================
    // QUANTITY
    // ======================================================

    const getItemQuantity = item => {

        const value =
            item?.quantity ??
            item?.soldQuantity ??
            item?.sold_quantity ??
            0

        return Math.max(
            0,
            safeNumber(value)
        )
    }


    // ======================================================
    // COST PRICE AT SALE
    // ======================================================

    const getItemCost = item => {

        const value =
            item?.costPriceAtSale ??
            item?.cost_price_at_sale

        if (
            value !== null &&
            value !== undefined &&
            value !== ""
        ) {

            return Math.max(
                0,
                safeNumber(value)
            )

        }

        const product =
            getProduct(item)

        return Math.max(
            0,
            safeNumber(
                product?.costPrice ??
                product?.cost_price ??
                product?.cost ??
                product?.purchasePrice ??
                0
            )
        )
    }


    // ======================================================
    // SALE PRICE
    // ======================================================

    const getItemSalePrice = item => {

        const value =
            item?.salePrice ??
            item?.sale_price

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return null

        }

        const result =
            Number(value)

        return Number.isFinite(result)
            ? Math.max(0, result)
            : null
    }


    // ======================================================
    // SOLD DATE
    //
    // IMPORTANT
    //
    // วันขายย้อนหลัง:
    //
    // 1. SaleItem.soldAt
    // 2. SaleItem.sold_at
    // 3. Sale.soldAt
    // 4. Sale.sold_at
    // 5. Sale.saleDate
    // 6. Sale.createdAt
    // 7. ConsignmentItem.soldAt
    // 8. SaleItem.createdAt
    //
    // soldAt ต้องมาก่อน createdAt
    // เพราะ soldAt คือ "วันขายจริง"
    // ที่ผู้ใช้สามารถกำหนดย้อนหลังได้
    //
    // ======================================================

    const getSoldDate = item => {

        const product =
            getProduct(item)

        return (

            // ----------------------------------------------
            // SaleItem soldAt
            // ----------------------------------------------

            item?.soldAt ??

            item?.sold_at ??

            // ----------------------------------------------
            // Nested Sale soldAt
            // ----------------------------------------------

            item?.sale?.soldAt ??

            item?.sale?.sold_at ??

            // ----------------------------------------------
            // Explicit sale date
            // ----------------------------------------------

            item?.saleDate ??

            item?.sale_date ??

            // ----------------------------------------------
            // Sale createdAt
            // ----------------------------------------------

            item?.saleCreatedAt ??

            item?.sale_created_at ??

            item?.sale?.createdAt ??

            item?.sale?.created_at ??

            // ----------------------------------------------
            // ConsignmentItem soldAt
            // ----------------------------------------------

            item?.consignmentItem?.soldAt ??

            item?.consignmentItem?.sold_at ??

            product?.soldAt ??

            product?.sold_at ??

            // ----------------------------------------------
            // Last fallback
            // ----------------------------------------------

            item?.createdAt ??

            item?.created_at ??

            null
        )
    }


    // ======================================================
    // SOLD TIMESTAMP
    // ======================================================

    const getSoldTimestamp = item => {

        const value =
            getSoldDate(item)

        if (!value) {
            return 0
        }

        const timestamp =
            new Date(value).getTime()

        return Number.isFinite(timestamp)
            ? timestamp
            : 0
    }


    // ======================================================
    // FORMAT SOLD DATE TIME
    // ======================================================

    const formatSoldDateTime = item => {

        const value =
            getSoldDate(item)

        if (!value) {
            return "-"
        }

        const date =
            new Date(value)

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "-"
        }

        return new Intl.DateTimeFormat(
            "th-TH",
            {
                timeZone:
                    "Asia/Bangkok",

                day: "2-digit",
                month: "2-digit",
                year: "numeric",

                hour: "2-digit",
                minute: "2-digit",

                hour12: false
            }
        ).format(date)
    }


    // ======================================================
    // SALE TOTAL QUANTITY
    // ======================================================

    const getSaleTotalQuantity = item => {

        const value =
            safeNumber(
                item?.saleTotalQuantity ??
                item?.sale_total_quantity
            )

        if (value > 0) {
            return value
        }

        return getItemQuantity(item)
    }


    // ======================================================
    // SHIPPING COST
    // ======================================================

    const getSaleShippingCost = item => {

        return Math.max(
            0,
            safeNumber(
                item?.saleShippingActual ??
                item?.shippingActual ??
                item?.shipping_actual ??
                item?.saleShippingCost ??
                item?.shippingCost ??
                item?.shipping_cost ??
                0
            )
        )
    }


    // ======================================================
    // OTHER EXPENSE
    // ======================================================

    const getSaleOtherExpense = item => {

        return Math.max(
            0,
            safeNumber(
                item?.saleOtherExpense ??
                item?.otherExpense ??
                item?.other_expense ??
                0
            )
        )
    }


    // ======================================================
    // TOTAL COST
    // ======================================================

    const getItemTotalCost = item => {

        const quantity =
            getItemQuantity(item)

        const cost =
            getItemCost(item)

        return (
            quantity *
            cost
        )
    }


    // ======================================================
    // TOTAL SALE
    // ======================================================

    const getItemTotalSale = item => {

        const quantity =
            getItemQuantity(item)

        const salePrice =
            getItemSalePrice(item)

        if (salePrice === null) {
            return 0
        }

        return (
            quantity *
            salePrice
        )
    }


    // ======================================================
    // ITEM PROFIT
    // ======================================================

    const getItemProfit = item => {

        const quantity =
            getItemQuantity(item)

        const salePrice =
            getItemSalePrice(item)

        const cost =
            getItemCost(item)

        if (
            salePrice === null ||
            quantity <= 0
        ) {
            return 0
        }

        const saleTotalQuantity =
            getSaleTotalQuantity(item)

        const shipping =
            getSaleShippingCost(item)

        const otherExpense =
            getSaleOtherExpense(item)

        const extraCostPerUnit =
            saleTotalQuantity > 0
                ? (
                    shipping +
                    otherExpense
                ) /
                saleTotalQuantity
                : 0

        return (
            (
                salePrice -
                cost -
                extraCostPerUnit
            ) *
            quantity
        )
    }


    // ======================================================
    // SOURCE DATA
    // ======================================================

    const sourceItems =
        useMemo(() => {

            if (
                Array.isArray(
                    saleItems
                ) &&
                saleItems.length > 0
            ) {

                return saleItems
                    .filter(
                        item =>
                            getItemQuantity(
                                item
                            ) > 0
                    )

            }


            if (
                Array.isArray(
                    soldProducts
                ) &&
                soldProducts.length > 0
            ) {

                return soldProducts
                    .flatMap(
                        group => {

                            if (
                                Array.isArray(
                                    group?.items
                                )
                            ) {

                                return group.items

                            }

                            return [
                                group
                            ]

                        }
                    )
                    .filter(
                        item =>
                            getItemQuantity(
                                item
                            ) > 0
                    )

            }

            return []

        }, [
            saleItems,
            soldProducts
        ])


    // ======================================================
    // GROUP SALE ITEMS BY PRODUCT
    // ======================================================

    const groupedProducts =
        useMemo(() => {

            const map =
                new Map()

            sourceItems.forEach(
                (
                    item,
                    index
                ) => {

                    const productId =
                        getProductId(
                            item
                        )

                    const key =
                        productId ||
                        `fallback-${index}`


                    if (
                        !map.has(key)
                    ) {

                        map.set(
                            key,
                            {

                                productId:
                                    key,

                                product:
                                    getProduct(
                                        item
                                    ),

                                latestItem:
                                    item,

                                items: [],

                                totalQuantity:
                                    0

                            }
                        )

                    }


                    const group =
                        map.get(key)


                    group.items.push(
                        item
                    )


                    group.totalQuantity +=
                        getItemQuantity(
                            item
                        )


                    // ------------------------------------------
                    // latest sale
                    //
                    // ใช้ soldAt
                    // ดังนั้นรายการขายย้อนหลังจะเรียงถูกต้อง
                    // ------------------------------------------

                    if (
                        getSoldTimestamp(
                            item
                        ) >=
                        getSoldTimestamp(
                            group.latestItem
                        )
                    ) {

                        group.latestItem =
                            item

                        group.product =
                            getProduct(
                                item
                            )

                    }

                }
            )


            return Array.from(
                map.values()
            )

        }, [
            sourceItems
        ])


    // ======================================================
    // HISTORY ITEMS
    //
    // 1 SaleItem = 1 row
    // ======================================================

    const getHistoryItems = group => {

        if (
            !group ||
            !Array.isArray(
                group.items
            )
        ) {
            return []
        }

        return [
            ...group.items
        ].sort(
            (
                a,
                b
            ) =>
                getSoldTimestamp(b) -
                getSoldTimestamp(a)
        )
    }


    // ======================================================
    // TOTAL PROFIT
    // ======================================================

    const getTotalProfit = group => {

        if (
            !group ||
            !Array.isArray(
                group.items
            )
        ) {
            return 0
        }

        return group.items.reduce(
            (
                total,
                item
            ) =>
                total +
                getItemProfit(
                    item
                ),
            0
        )
    }


    // ======================================================
    // LATEST SALE PRICE
    // ======================================================

    const getLatestSalePrice = group => {

        const item =
            group?.latestItem

        if (!item) {
            return null
        }

        return getItemSalePrice(
            item
        )
    }


    // ======================================================
    // PRODUCT COST
    // ======================================================

    const getProductCost = group => {

        const item =
            group?.latestItem

        if (!item) {
            return 0
        }

        return getItemCost(
            item
        )
    }


    // ======================================================
    // SORT VALUE
    // ======================================================

    const getSortValue = (
        group,
        field
    ) => {

        switch (field) {

            case "name":

                return String(
                    getProductName(
                        group?.latestItem
                    )
                ).toLowerCase()


            case "quantity":

                return safeNumber(
                    group?.totalQuantity
                )


            case "cost":

                return getProductCost(
                    group
                )


            case "totalCost":

                return (
                    getProductCost(
                        group
                    ) *
                    safeNumber(
                        group?.totalQuantity
                    )
                )


            case "salePrice":

                return (
                    getLatestSalePrice(
                        group
                    ) ?? -Infinity
                )


            case "profit":

                return getTotalProfit(
                    group
                )


            case "soldDate":

                return getSoldTimestamp(
                    group?.latestItem
                )


            default:

                return ""

        }

    }


    // ======================================================
    // SORTED PRODUCTS
    // ======================================================

    const sortedProducts =
        useMemo(() => {

            const list =
                [
                    ...groupedProducts
                ]

            list.sort(
                (
                    a,
                    b
                ) => {

                    const valueA =
                        getSortValue(
                            a,
                            sortBy
                        )

                    const valueB =
                        getSortValue(
                            b,
                            sortBy
                        )


                    if (
                        typeof valueA ===
                            "string" ||
                        typeof valueB ===
                            "string"
                    ) {

                        const result =
                            String(
                                valueA
                            ).localeCompare(
                                String(
                                    valueB
                                ),
                                "th",
                                {
                                    sensitivity:
                                        "base"
                                }
                            )

                        return (
                            sortDirection ===
                            "asc"
                        )
                            ? result
                            : -result

                    }


                    if (
                        valueA < valueB
                    ) {

                        return (
                            sortDirection ===
                            "asc"
                        )
                            ? -1
                            : 1

                    }


                    if (
                        valueA > valueB
                    ) {

                        return (
                            sortDirection ===
                            "asc"
                        )
                            ? 1
                            : -1

                    }


                    return 0

                }
            )

            return list

        }, [
            groupedProducts,
            sortBy,
            sortDirection
        ])


    // ======================================================
    // SORT BUTTON
    // ======================================================

    const ListBy = ({
        field,
        children
    }) => {

        const active =
            sortBy === field


        const handleClick =
            () => {

                if (active) {

                    setSortDirection(
                        previous =>
                            previous ===
                            "asc"
                                ? "desc"
                                : "asc"
                    )

                    return
                }


                setSortBy(
                    field
                )

                setSortDirection(
                    field === "name"
                        ? "asc"
                        : "desc"
                )

            }


        return (

            <button
                type="button"
                className={`
                    products-listby
                    ${
                        active
                            ? "products-listby-active"
                            : ""
                    }
                `}
                onClick={
                    handleClick
                }
            >

                <span>
                    {children}
                </span>


                {!active && (

                    <ArrowUpDown
                        size={13}
                    />

                )}


                {active &&
                    sortDirection ===
                        "asc" && (

                    <ChevronUp
                        size={15}
                    />

                )}


                {active &&
                    sortDirection ===
                        "desc" && (

                    <ChevronDown
                        size={15}
                    />

                )}

            </button>

        )

    }


    // ======================================================
    // TABLE HEADER
    // ======================================================

    const TableHeader = () => (

        <thead>

            <tr>

                <th>

                    <ListBy
                        field="name"
                    >
                        สินค้า
                    </ListBy>

                </th>


                <th>

                    <ListBy
                        field="quantity"
                    >
                        ขายรวม
                    </ListBy>

                </th>


                <th>

                    <ListBy
                        field="cost"
                    >
                        ต้นทุน/ชิ้น
                    </ListBy>

                </th>


                <th>

                    <ListBy
                        field="totalCost"
                    >
                        ต้นทุนรวม
                    </ListBy>

                </th>


                <th>

                    <ListBy
                        field="salePrice"
                    >
                        ราคาขายล่าสุด
                    </ListBy>

                </th>


                <th>

                    <ListBy
                        field="profit"
                    >
                        กำไรรวม
                    </ListBy>

                </th>


                <th>

                    <ListBy
                        field="soldDate"
                    >
                        ขายล่าสุด
                    </ListBy>

                </th>


                <th>
                    History
                </th>

            </tr>

        </thead>

    )


    // ======================================================
    // EMPTY
    // ======================================================

    if (
        sortedProducts.length === 0
    ) {

        return (

            <table
                className="products-table"
            >

                <TableHeader />

                <tbody>

                    <tr>

                        <td
                            colSpan={8}
                            className="products-empty"
                        >

                            <div
                                className="empty-state"
                            >

                                <div
                                    className="empty-bubble"
                                >

                                    <PackageOpen
                                        size={30}
                                    />

                                </div>


                                <h3>
                                    ยังไม่มีรายการขาย
                                </h3>


                                <p>
                                    เมื่อมีการขายสินค้า
                                    รายการจะแสดงที่นี่ ✨
                                </p>

                            </div>

                        </td>

                    </tr>

                </tbody>

            </table>

        )
    }


    // ======================================================
    // FOOTER TOTAL QUANTITY
    // ======================================================

    const totalQuantity =
        sortedProducts.reduce(
            (
                total,
                group
            ) =>
                total +
                safeNumber(
                    group?.totalQuantity
                ),
            0
        )


    // ======================================================
    // FOOTER TOTAL PROFIT
    // ======================================================

    const totalProfit =
        sortedProducts.reduce(
            (
                total,
                group
            ) =>
                total +
                getTotalProfit(
                    group
                ),
            0
        )


    // ======================================================
    // HISTORY MODAL
    // ======================================================

    const historyModalNode =
        historyProduct &&
        createPortal(

            <div
                className="sold-history-overlay"
                onMouseDown={
                    event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            setHistoryProduct(
                                null
                            )

                        }

                    }
                }
            >

                <div
                    className="sold-history-modal"
                >

                    <div
                        className="sold-history-header"
                    >

                        <div>

                            <div
                                className="sold-history-title"
                            >

                                <History
                                    size={20}
                                />

                                <h3>
                                    History Log
                                </h3>

                            </div>


                            <p>

                                {
                                    getProductName(
                                        historyProduct?.latestItem
                                    )
                                }

                                {" · "}

                                ขายทั้งหมด{" "}

                                <strong>
                                    {
                                        formatNumber(
                                            historyProduct?.totalQuantity ??
                                            0
                                        )
                                    }
                                </strong>

                                {" "}ชิ้น

                            </p>

                        </div>


                        <button
                            type="button"
                            className="sold-history-close"
                            onClick={() =>
                                setHistoryProduct(
                                    null
                                )
                            }
                            aria-label="ปิดประวัติการขาย"
                        >

                            <X
                                size={20}
                            />

                        </button>

                    </div>


                    {/* ==================================================
                        SUMMARY
                    ================================================== */}

                    <div
                        className="sold-history-summary"
                    >

                        <div>

                            <span>
                                จำนวนครั้งที่ขาย
                            </span>

                            <strong>
                                {
                                    getHistoryItems(
                                        historyProduct
                                    ).length
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                ขายรวม
                            </span>

                            <strong>

                                {
                                    formatNumber(
                                        historyProduct?.totalQuantity ??
                                        0
                                    )
                                }

                                {" "}ชิ้น

                            </strong>

                        </div>


                        <div>

                            <span>
                                กำไรรวม
                            </span>

                            <strong>

                                ฿
                                {
                                    formatMoney(
                                        getTotalProfit(
                                            historyProduct
                                        )
                                    )
                                }

                            </strong>

                        </div>

                    </div>


                    {/* ==================================================
                        HISTORY TABLE
                    ================================================== */}

                    <div
                        className="sold-history-table-wrap"
                    >

                        <table
                            className="sold-history-table"
                        >

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
                                        ยอดขายรวม
                                    </th>

                                    <th>
                                        กำไร
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {
                                    getHistoryItems(
                                        historyProduct
                                    ).map(
                                        (
                                            item,
                                            index
                                        ) => {

                                            const quantity =
                                                getItemQuantity(
                                                    item
                                                )

                                            const cost =
                                                getItemCost(
                                                    item
                                                )

                                            const salePrice =
                                                getItemSalePrice(
                                                    item
                                                )

                                            const totalCost =
                                                getItemTotalCost(
                                                    item
                                                )

                                            const totalSale =
                                                getItemTotalSale(
                                                    item
                                                )

                                            const profit =
                                                getItemProfit(
                                                    item
                                                )


                                            const profitClass =
                                                profit > 0
                                                    ? "profit-positive"
                                                    : profit < 0
                                                        ? "profit-negative"
                                                        : "profit-zero"


                                            const itemKey =
                                                item?.id ??
                                                item?.saleItemId ??
                                                item?.sale_item_id ??
                                                `${item?.saleId ?? item?.sale_id ?? "sale"}-${getSoldTimestamp(item)}-${index}`


                                            return (

                                                <tr
                                                    key={
                                                        itemKey
                                                    }
                                                >

                                                    {/* ==================================
                                                        #
                                                    ================================== */}

                                                    <td>

                                                        <strong>
                                                            {
                                                                index +
                                                                1
                                                            }
                                                        </strong>

                                                    </td>


                                                    {/* ==================================
                                                        DATE
                                                    ================================== */}

                                                    <td>

                                                        <div
                                                            className="date-cell"
                                                        >

                                                            <CalendarDays
                                                                size={14}
                                                            />

                                                            <span>
                                                                {
                                                                    formatSoldDateTime(
                                                                        item
                                                                    )
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* ==================================
                                                        QUANTITY
                                                    ================================== */}

                                                    <td>

                                                        <strong>
                                                            {
                                                                formatNumber(
                                                                    quantity
                                                                )
                                                            }
                                                        </strong>

                                                        {" "}ชิ้น

                                                    </td>


                                                    {/* ==================================
                                                        COST
                                                    ================================== */}

                                                    <td>

                                                        ฿
                                                        {
                                                            formatMoney(
                                                                cost
                                                            )
                                                        }

                                                    </td>


                                                    {/* ==================================
                                                        SALE PRICE
                                                    ================================== */}

                                                    <td>

                                                        <strong
                                                            className="money-sale"
                                                        >

                                                            ฿
                                                            {
                                                                formatMoney(
                                                                    salePrice ??
                                                                    0
                                                                )
                                                            }

                                                        </strong>

                                                    </td>


                                                    {/* ==================================
                                                        TOTAL COST
                                                    ================================== */}

                                                    <td>

                                                        ฿
                                                        {
                                                            formatMoney(
                                                                totalCost
                                                            )
                                                        }

                                                    </td>


                                                    {/* ==================================
                                                        TOTAL SALE
                                                    ================================== */}

                                                    <td>

                                                        <strong
                                                            className="money-sale"
                                                        >

                                                            ฿
                                                            {
                                                                formatMoney(
                                                                    totalSale
                                                                )
                                                            }

                                                        </strong>

                                                    </td>


                                                    {/* ==================================
                                                        PROFIT
                                                    ================================== */}

                                                    <td>

                                                        <strong
                                                            className={
                                                                profitClass
                                                            }
                                                        >

                                                            {
                                                                profit >
                                                                0
                                                                    ? "+"
                                                                    : ""
                                                            }

                                                            ฿

                                                            {
                                                                formatMoney(
                                                                    profit
                                                                )
                                                            }

                                                        </strong>

                                                    </td>

                                                </tr>

                                            )

                                        }
                                    )
                                }


                                {/* ==================================
                                    NO HISTORY
                                ================================== */}

                                {
                                    getHistoryItems(
                                        historyProduct
                                    ).length === 0 && (

                                        <tr>

                                            <td
                                                colSpan={8}
                                                className="products-empty"
                                            >

                                                <div
                                                    className="empty-state"
                                                >

                                                    <div
                                                        className="empty-bubble"
                                                    >

                                                        <History
                                                            size={28}
                                                        />

                                                    </div>


                                                    <h3>
                                                        ยังไม่มีประวัติการขาย
                                                    </h3>


                                                    <p>
                                                        ไม่พบรายการขายของสินค้านี้
                                                    </p>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                }

                            </tbody>

                        </table>

                    </div>


                    {/* ==================================================
                        FOOTER
                    ================================================== */}

                    <div
                        className="sold-history-footer"
                    >

                        <span>

                            แสดง{" "}

                            <strong>
                                {
                                    getHistoryItems(
                                        historyProduct
                                    ).length
                                }
                            </strong>

                            {" "}รายการขาย

                        </span>


                        <button
                            type="button"
                            onClick={() =>
                                setHistoryProduct(
                                    null
                                )
                            }
                        >
                            ปิด
                        </button>

                    </div>

                </div>

            </div>,

            document.body
        )


    // ======================================================
    // MAIN TABLE
    // ======================================================

    return (

        <>

            <table
                className="products-table"
            >

                <TableHeader />


                <tbody>

                    {
                        sortedProducts.map(
                            (
                                group,
                                index
                            ) => {

                                const latestItem =
                                    group?.latestItem


                                const product =
                                    getProduct(
                                        latestItem
                                    )


                                const productName =
                                    getProductName(
                                        latestItem
                                    )


                                const description =
                                    getDescription(
                                        latestItem
                                    )


                                const note =
                                    getNote(
                                        latestItem
                                    )


                                const quantity =
                                    safeNumber(
                                        group?.totalQuantity
                                    )


                                const cost =
                                    getProductCost(
                                        group
                                    )


                                const totalCost =
                                    cost *
                                    quantity


                                const latestPrice =
                                    getLatestSalePrice(
                                        group
                                    )


                                const groupProfit =
                                    getTotalProfit(
                                        group
                                    )


                                const history =
                                    getHistoryItems(
                                        group
                                    )


                                const productId =
                                    group?.productId ??
                                    product?.id ??
                                    index


                                const profitClass =
                                    groupProfit > 0
                                        ? "profit-positive"
                                        : groupProfit < 0
                                            ? "profit-negative"
                                            : "profit-zero"


                                return (

                                    <tr
                                        key={
                                            productId
                                        }
                                        className="sold-product-row"
                                    >

                                        {/* =================================
                                            PRODUCT
                                        ================================= */}

                                        <td>

                                            <div
                                                className="product-name"
                                            >

                                                <div
                                                    className="product-mini-icon"
                                                >
                                                    🧸
                                                </div>


                                                <div
                                                    className="product-name-content"
                                                >

                                                    <strong>
                                                        {
                                                            productName
                                                        }
                                                    </strong>


                                                    {description && (

                                                        <small>
                                                            {
                                                                description
                                                            }
                                                        </small>

                                                    )}


                                                    {note && (

                                                        <small
                                                            className="product-note"
                                                        >
                                                            📝{" "}
                                                            {
                                                                note
                                                            }
                                                        </small>

                                                    )}

                                                </div>

                                            </div>

                                        </td>


                                        {/* =================================
                                            QUANTITY
                                        ================================= */}

                                        <td>

                                            <div
                                                className="quantity-cell"
                                            >

                                                <span
                                                    className="quantity-icon"
                                                >

                                                    <Hash
                                                        size={14}
                                                    />

                                                </span>


                                                <strong>
                                                    {
                                                        formatNumber(
                                                            quantity
                                                        )
                                                    }
                                                </strong>


                                                <small>
                                                    ชิ้น
                                                </small>

                                            </div>

                                        </td>


                                        {/* =================================
                                            COST
                                        ================================= */}

                                        <td>

                                            <span
                                                className="money-cost"
                                            >

                                                ฿
                                                {
                                                    formatMoney(
                                                        cost
                                                    )
                                                }

                                            </span>

                                        </td>


                                        {/* =================================
                                            TOTAL COST
                                        ================================= */}

                                        <td>

                                            <span
                                                className="money-total-cost"
                                            >

                                                ฿
                                                {
                                                    formatMoney(
                                                        totalCost
                                                    )
                                                }

                                            </span>

                                        </td>


                                        {/* =================================
                                            LATEST SALE PRICE
                                        ================================= */}

                                        <td>

                                            {
                                                latestPrice !==
                                                null
                                                    ? (

                                                        <span
                                                            className="money-sale"
                                                        >

                                                            ฿
                                                            {
                                                                formatMoney(
                                                                    latestPrice
                                                                )
                                                            }

                                                        </span>

                                                    )
                                                    : (

                                                        <span
                                                            className="not-sold-price"
                                                        >
                                                            ไม่พบราคาขาย
                                                        </span>

                                                    )
                                            }

                                        </td>


                                        {/* =================================
                                            PROFIT
                                        ================================= */}

                                        <td>

                                            <span
                                                className={
                                                    profitClass
                                                }
                                            >

                                                {
                                                    groupProfit >
                                                    0
                                                        ? "+"
                                                        : ""
                                                }

                                                ฿

                                                {
                                                    formatMoney(
                                                        groupProfit
                                                    )
                                                }

                                            </span>

                                        </td>


                                        {/* =================================
                                            LATEST SOLD DATE
                                        ================================= */}

                                        <td>

                                            <div
                                                className="date-cell"
                                            >

                                                <CalendarDays
                                                    size={15}
                                                />

                                                <span>
                                                    {
                                                        formatSoldDateTime(
                                                            latestItem
                                                        )
                                                    }
                                                </span>

                                            </div>

                                        </td>


                                        {/* =================================
                                            HISTORY BUTTON
                                        ================================= */}

                                        <td>

                                            <button
                                                type="button"
                                                className="sold-history-button"
                                                onClick={() =>
                                                    setHistoryProduct(
                                                        group
                                                    )
                                                }
                                            >

                                                <History
                                                    size={16}
                                                />

                                                <span>
                                                    History
                                                </span>

                                                <small>
                                                    {
                                                        history.length
                                                    }
                                                </small>

                                            </button>

                                        </td>

                                    </tr>

                                )

                            }
                        )
                    }

                </tbody>

            </table>


            {/* ======================================================
                FOOTER
            ====================================================== */}

            <div
                className="products-footer"
            >

                <span>

                    แสดง{" "}

                    <strong>
                        {
                            sortedProducts.length
                        }
                    </strong>

                    {" "}รายการสินค้า

                </span>


                <span>

                    ขายรวม{" "}

                    <strong>
                        {
                            formatNumber(
                                totalQuantity
                            )
                        }
                    </strong>

                    {" "}ชิ้น

                </span>


                <span>

                    กำไรรวม{" "}

                    <strong
                        className="sold-footer-profit"
                    >

                        ฿
                        {
                            formatMoney(
                                totalProfit
                            )
                        }

                    </strong>

                </span>

            </div>


            {
                historyModalNode
            }

        </>

    )
}


export default SoldProducts
