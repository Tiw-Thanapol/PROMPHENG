import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react"

import api from "../api/axios"

import {
    getSaleExpenses,
    getSaleItems,
    getSaleTotalQuantity,
    getSaleCreatedAt
} from "../utils/saleHelpers"


// ======================================================
// USE PRODUCT SALES
// ======================================================
//
// SOURCE OF TRUTH
// ------------------------------------------------------
// Sale
//   └── SaleItem
//
// IMPORTANT
// ------------------------------------------------------
// SaleItem คือ "รายการขายจริง"
// ไม่ใช่ Stock ปัจจุบัน
//
// SaleItem:
// - id
// - consignmentItemId
// - quantity
// - salePrice
// - costPriceAtSale
// - soldAt
//
// ======================================================
//
// DATA STRUCTURE
//
// soldProductRows
//   = 1 product / 1 row
//   = ใช้สำหรับหน้า Products
//   = รวม SaleItem หลายรายการเข้าด้วยกัน
//
// soldItemRows
//   = 1 SaleItem / 1 row
//   = ใช้สำหรับ History
//   = quantity ยังเป็นจำนวนจริงของ SaleItem
//
// เช่น
//
// Sale #1
//   SaleItem #1
//   product A
//   quantity = 3
//
// History จะเป็น:
//
//   SaleItem #1 | quantity 3
//
// ไม่ใช่:
//
//   fake row 1 | quantity 1
//   fake row 2 | quantity 1
//   fake row 3 | quantity 1
//
// เพราะจะทำให้ข้อมูล SaleItem จริงหายความสัมพันธ์
//
// ======================================================


export default function useProductSales() {

    // ==================================================
    // STATE
    // ==================================================

    const [
        sales,
        setSales
    ] = useState([])

    const [
        salesLoading,
        setSalesLoading
    ] = useState(true)


    // ==================================================
    // LOAD SALES
    // ==================================================

    const loadSales =
        useCallback(
            async () => {

                try {

                    setSalesLoading(true)


                    const response =
                        await api.get(
                            "/sales",
                            {
                                params: {
                                    range: "all"
                                }
                            }
                        )


                    const data =
                        response.data?.sales ??
                        response.data ??
                        []


                    const nextSales =
                        Array.isArray(data)
                            ? data
                            : []


                    setSales(
                        nextSales
                    )


                    return nextSales

                }
                catch (err) {

                    console.error(
                        "useProductSales loadSales error:",
                        err
                    )


                    setSales([])


                    throw err

                }
                finally {

                    setSalesLoading(false)

                }

            },
            []
        )


    // ==================================================
    // LOAD ON MOUNT
    // ==================================================

    useEffect(() => {

        loadSales()
            .catch(() => {
                // caller สามารถจัดการ error ได้
            })

    }, [
        loadSales
    ])


    // ==================================================
    // TOTAL SOLD QUANTITY
    // ==================================================

    const totalSoldQuantity =
        useMemo(
            () => {

                if (
                    !Array.isArray(
                        sales
                    )
                ) {

                    return 0

                }


                return sales.reduce(
                    (
                        total,
                        sale
                    ) => {

                        const items =
                            getSaleItems(
                                sale
                            )


                        return (
                            total +
                            items.reduce(
                                (
                                    itemTotal,
                                    item
                                ) => {

                                    return (
                                        itemTotal +
                                        getItemQuantity(
                                            item
                                        )
                                    )

                                },
                                0
                            )
                        )

                    },
                    0
                )

            },
            [sales]
        )


    // ==================================================
    // TOTAL SALES
    // ==================================================

    const totalSales =
        useMemo(
            () => {

                if (
                    !Array.isArray(
                        sales
                    )
                ) {

                    return 0

                }


                return sales.reduce(
                    (
                        total,
                        sale
                    ) => {

                        const items =
                            getSaleItems(
                                sale
                            )


                        return (
                            total +
                            items.reduce(
                                (
                                    itemTotal,
                                    item
                                ) => {

                                    const quantity =
                                        getItemQuantity(
                                            item
                                        )


                                    const salePrice =
                                        getSalePrice(
                                            item
                                        )


                                    return (
                                        itemTotal +
                                        (
                                            salePrice *
                                            quantity
                                        )
                                    )

                                },
                                0
                            )
                        )

                    },
                    0
                )

            },
            [sales]
        )


    // ==================================================
    // TOTAL COST
    // ==================================================

    const totalCost =
        useMemo(
            () => {

                if (
                    !Array.isArray(
                        sales
                    )
                ) {

                    return 0

                }


                return sales.reduce(
                    (
                        total,
                        sale
                    ) => {

                        const items =
                            getSaleItems(
                                sale
                            )


                        return (
                            total +
                            items.reduce(
                                (
                                    itemTotal,
                                    item
                                ) => {

                                    const quantity =
                                        getItemQuantity(
                                            item
                                        )


                                    const costPriceAtSale =
                                        getCostPriceAtSale(
                                            item
                                        )


                                    return (
                                        itemTotal +
                                        (
                                            costPriceAtSale *
                                            quantity
                                        )
                                    )

                                },
                                0
                            )
                        )

                    },
                    0
                )

            },
            [sales]
        )


    // ==================================================
    // TOTAL PROFIT
    // ==================================================

    const totalProfit =
        useMemo(
            () => {

                if (
                    !Array.isArray(
                        sales
                    )
                ) {

                    return 0

                }


                return sales.reduce(
                    (
                        total,
                        sale
                    ) => {

                        return (
                            total +
                            calculateSaleProfit(
                                sale
                            )
                        )

                    },
                    0
                )

            },
            [sales]
        )


    // ==================================================
    // PROFIT BY PRODUCT ID
    // ==================================================

    const profitByProductId =
        useMemo(
            () => {

                const map =
                    new Map()


                if (
                    !Array.isArray(
                        sales
                    )
                ) {

                    return map

                }


                sales.forEach(
                    sale => {

                        const items =
                            getSaleItems(
                                sale
                            )


                        const saleTotalQuantity =
                            getEffectiveSaleTotalQuantity(
                                sale,
                                items
                            )


                        if (
                            saleTotalQuantity <= 0
                        ) {

                            return

                        }


                        const shippingCost =
                            getShippingCost(
                                sale
                            )


                        const otherExpenses =
                            getSaleExpenses(
                                sale
                            )


                        const extraCostPerUnit =
                            (
                                shippingCost +
                                otherExpenses
                            ) /
                            saleTotalQuantity


                        items.forEach(
                            item => {

                                const productId =
                                    getProductId(
                                        item
                                    )


                                if (
                                    !hasValue(
                                        productId
                                    )
                                ) {

                                    return

                                }


                                const quantity =
                                    getItemQuantity(
                                        item
                                    )


                                if (
                                    quantity <= 0
                                ) {

                                    return

                                }


                                const salePrice =
                                    getSalePrice(
                                        item
                                    )


                                const costPriceAtSale =
                                    getCostPriceAtSale(
                                        item
                                    )


                                const profit =
                                    (
                                        salePrice -
                                        costPriceAtSale -
                                        extraCostPerUnit
                                    ) *
                                    quantity


                                const key =
                                    String(
                                        productId
                                    )


                                map.set(
                                    key,
                                    (
                                        map.get(
                                            key
                                        ) || 0
                                    ) +
                                    profit
                                )

                            }
                        )

                    }
                )


                return map

            },
            [sales]
        )


    // ==================================================
    // SOLD PRODUCT GROUPS
    // ==================================================
    //
    // รวมตาม Product / ConsignmentItem ID
    //
    // SaleItem เดิมยังถูกเก็บครบใน group.items
    //
    // ==================================================

    const soldProductGroups =
        useMemo(
            () => {

                if (
                    !Array.isArray(
                        sales
                    )
                ) {

                    return []

                }


                const groups =
                    new Map()


                sales.forEach(
                    sale => {

                        const items =
                            getSaleItems(
                                sale
                            )


                        if (
                            !Array.isArray(
                                items
                            ) ||
                            items.length === 0
                        ) {

                            return

                        }


                        const saleTotalQuantity =
                            getEffectiveSaleTotalQuantity(
                                sale,
                                items
                            )


                        const shippingCost =
                            getShippingCost(
                                sale
                            )


                        const otherExpense =
                            getSaleExpenses(
                                sale
                            )


                        const saleCreatedAt =
                            getSaleCreatedAt(
                                sale
                            )


                        const saleId =
                            getSaleId(
                                sale
                            )


                        const extraCostPerUnit =
                            saleTotalQuantity > 0
                                ? (
                                    shippingCost +
                                    otherExpense
                                ) /
                                saleTotalQuantity
                                : 0


                        items.forEach(
                            item => {

                                const quantity =
                                    getItemQuantity(
                                        item
                                    )


                                if (
                                    quantity <= 0
                                ) {

                                    return

                                }


                                const product =
                                    getItemProduct(
                                        item
                                    )


                                const productId =
                                    getProductId(
                                        item
                                    )


                                if (
                                    !hasValue(
                                        productId
                                    )
                                ) {

                                    return

                                }


                                const key =
                                    String(
                                        productId
                                    )


                                if (
                                    !groups.has(
                                        key
                                    )
                                ) {

                                    groups.set(
                                        key,
                                        {

                                            productId,

                                            product,

                                            items: [],

                                            totalQuantity:
                                                0,

                                            totalSales:
                                                0,

                                            totalCost:
                                                0,

                                            totalProfit:
                                                0,

                                            latestItem:
                                                null,

                                            latestTimestamp:
                                                0,

                                            latestSalePrice:
                                                null,

                                            latestCostPriceAtSale:
                                                null,

                                            latestSaleId:
                                                null,

                                            latestSaleAt:
                                                null,

                                            latestSaleCreatedAt:
                                                null

                                        }
                                    )

                                }


                                const group =
                                    groups.get(
                                        key
                                    )


                                // ----------------------------------
                                // SALE DATA
                                // ----------------------------------

                                const saleItemId =
                                    getSaleItemId(
                                        item
                                    )


                                const soldAt =
                                    getSoldAt(
                                        item,
                                        sale
                                    )


                                const salePrice =
                                    getSalePrice(
                                        item
                                    )


                                const costPriceAtSale =
                                    getCostPriceAtSale(
                                        item
                                    )


                                const saleTotalAmount =
                                    salePrice *
                                    quantity


                                const productProfit =
                                    (
                                        salePrice -
                                        costPriceAtSale
                                    ) *
                                    quantity


                                const allocatedExpenses =
                                    extraCostPerUnit *
                                    quantity


                                const profit =
                                    productProfit -
                                    allocatedExpenses


                                // ----------------------------------
                                // PRESERVE REAL SALE ITEM
                                // ----------------------------------

                                const itemWithSaleInfo = {

                                    ...item,

                                    // IDs
                                    id:
                                        saleItemId,

                                    saleItemId,

                                    saleId,

                                    productId,

                                    consignmentItemId:
                                        item?.consignmentItemId ??
                                        product?.id ??
                                        productId,

                                    // Product
                                    name:
                                        getProductName(
                                            item,
                                            product
                                        ),

                                    description:
                                        getProductDescription(
                                            item,
                                            product
                                        ),

                                    note:
                                        getProductNote(
                                            item,
                                            product
                                        ),

                                    // Sale
                                    quantity,

                                    salePrice,

                                    costPriceAtSale,

                                    costPrice:
                                        costPriceAtSale,

                                    saleTotalAmount,

                                    productProfit,

                                    shippingCost,

                                    otherExpense,

                                    allocatedExpenses,

                                    profit,

                                    totalProfit:
                                        profit,

                                    // Time
                                    soldAt,

                                    saleCreatedAt,

                                    // Sale context
                                    saleTotalQuantity,

                                    saleShippingCost:
                                        shippingCost,

                                    saleOtherExpense:
                                        otherExpense

                                }


                                // ----------------------------------
                                // KEEP REAL SALE ITEM
                                // ----------------------------------

                                group.items.push(
                                    itemWithSaleInfo
                                )


                                // ----------------------------------
                                // TOTALS
                                // ----------------------------------

                                group.totalQuantity +=
                                    quantity


                                group.totalSales +=
                                    saleTotalAmount


                                group.totalCost +=
                                    costPriceAtSale *
                                    quantity


                                group.totalProfit +=
                                    profit


                                // ----------------------------------
                                // LATEST SALE
                                // ----------------------------------

                                const timestamp =
                                    getTimestamp(
                                        soldAt
                                    )


                                if (
                                    !group.latestItem ||
                                    timestamp >
                                    group.latestTimestamp
                                ) {

                                    group.latestItem =
                                        itemWithSaleInfo

                                    group.latestTimestamp =
                                        timestamp

                                    group.latestSalePrice =
                                        salePrice

                                    group.latestCostPriceAtSale =
                                        costPriceAtSale

                                    group.latestSaleId =
                                        saleId

                                    group.latestSaleAt =
                                        soldAt

                                    group.latestSaleCreatedAt =
                                        saleCreatedAt

                                }

                            }
                        )

                    }
                )


                return Array.from(
                    groups.values()
                ).sort(
                    (
                        a,
                        b
                    ) =>
                        b.latestTimestamp -
                        a.latestTimestamp
                )

            },
            [sales]
        )


    // ==================================================
    // SOLD PRODUCT ROWS
    // ==================================================
    //
    // 1 Product = 1 row
    //
    // ใช้สำหรับหน้า Products
    //
    // ==================================================

    const soldProductRows =
        useMemo(
            () => {

                return soldProductGroups.map(
                    group => {

                        const latestItem =
                            group.latestItem ||
                            {}


                        const product =
                            group.product ||
                            latestItem?.product ||
                            latestItem?.consignmentItem ||
                            {}


                        return {

                            ...product,

                            // ----------------------------------
                            // IDS
                            // ----------------------------------

                            id:
                                group.productId,

                            productId:
                                group.productId,

                            consignmentItemId:
                                group.productId,


                            // ----------------------------------
                            // PRODUCT INFO
                            // ----------------------------------

                            name:
                                getProductName(
                                    latestItem,
                                    product
                                ),

                            description:
                                getProductDescription(
                                    latestItem,
                                    product
                                ),

                            note:
                                getProductNote(
                                    latestItem,
                                    product
                                ),


                            // ----------------------------------
                            // LATEST SALE PRICE
                            // ----------------------------------

                            costPrice:
                                group.latestCostPriceAtSale ??
                                0,

                            costPriceAtSale:
                                group.latestCostPriceAtSale ??
                                0,

                            salePrice:
                                group.latestSalePrice ??
                                0,


                            // ----------------------------------
                            // TOTALS
                            // ----------------------------------

                            quantity:
                                group.totalQuantity,

                            totalQuantity:
                                group.totalQuantity,

                            totalSales:
                                group.totalSales,

                            totalCost:
                                group.totalCost,

                            totalProfit:
                                group.totalProfit,


                            // ----------------------------------
                            // LATEST SALE
                            // ----------------------------------

                            soldAt:
                                group.latestSaleAt,

                            saleCreatedAt:
                                group.latestSaleCreatedAt,

                            latestSaleId:
                                group.latestSaleId,

                            latestItem,


                            // ----------------------------------
                            // REAL SALE ITEMS
                            // ----------------------------------

                            saleItems:
                                group.items,

                            items:
                                group.items

                        }

                    }
                )

            },
            [
                soldProductGroups
            ]
        )


    // ==================================================
    // SOLD ITEM ROWS
    // ==================================================
    //
    // IMPORTANT
    // --------------------------------------------------
    // 1 SaleItem = 1 row
    //
    // quantity = quantity จริงของ SaleItem
    //
    // เช่น:
    //
    // SaleItem #123
    // quantity = 3
    //
    // จะได้:
    //
    // row:
    // {
    //     saleItemId: 123,
    //     quantity: 3
    // }
    //
    // ไม่สร้าง row ปลอม 3 ตัว
    //
    // ==================================================

    const soldItemRows =
        useMemo(
            () => {

                if (
                    !Array.isArray(
                        sales
                    )
                ) {

                    return []

                }


                const rows = []


                sales.forEach(
                    sale => {

                        const items =
                            getSaleItems(
                                sale
                            )


                        if (
                            !Array.isArray(
                                items
                            ) ||
                            items.length === 0
                        ) {

                            return

                        }


                        const saleTotalQuantity =
                            getEffectiveSaleTotalQuantity(
                                sale,
                                items
                            )


                        const shippingCost =
                            getShippingCost(
                                sale
                            )


                        const otherExpense =
                            getSaleExpenses(
                                sale
                            )


                        const saleId =
                            getSaleId(
                                sale
                            )


                        const saleCreatedAt =
                            getSaleCreatedAt(
                                sale
                            )


                        const extraCostPerUnit =
                            saleTotalQuantity > 0
                                ? (
                                    shippingCost +
                                    otherExpense
                                ) /
                                saleTotalQuantity
                                : 0


                        items.forEach(
                            (
                                item,
                                itemIndex
                            ) => {

                                const quantity =
                                    getItemQuantity(
                                        item
                                    )


                                if (
                                    quantity <= 0
                                ) {

                                    return

                                }


                                const product =
                                    getItemProduct(
                                        item
                                    )


                                const productId =
                                    getProductId(
                                        item
                                    )


                                const saleItemId =
                                    getSaleItemId(
                                        item
                                    )


                                const salePrice =
                                    getSalePrice(
                                        item
                                    )


                                const costPriceAtSale =
                                    getCostPriceAtSale(
                                        item
                                    )


                                const soldAt =
                                    getSoldAt(
                                        item,
                                        sale
                                    )


                                // ----------------------------------
                                // AMOUNTS
                                // ----------------------------------

                                const saleTotalAmount =
                                    salePrice *
                                    quantity


                                const productProfit =
                                    (
                                        salePrice -
                                        costPriceAtSale
                                    ) *
                                    quantity


                                const allocatedExpenses =
                                    extraCostPerUnit *
                                    quantity


                                const profit =
                                    productProfit -
                                    allocatedExpenses


                                // ----------------------------------
                                // STABLE ROW ID
                                // ----------------------------------

                                const rowId =
                                    hasValue(
                                        saleItemId
                                    )
                                        ? String(
                                            saleItemId
                                        )
                                        : (
                                            `${saleId ?? "sale"}-` +
                                            `${productId ?? "product"}-` +
                                            `${itemIndex}`
                                        )


                                // ----------------------------------
                                // HISTORY ROW
                                // ----------------------------------

                                rows.push({

                                    ...item,

                                    // ==================================
                                    // IDS
                                    // ==================================

                                    id:
                                        rowId,

                                    saleItemId,

                                    saleId,

                                    productId,

                                    consignmentItemId:
                                        item?.consignmentItemId ??
                                        product?.id ??
                                        productId,


                                    // ==================================
                                    // PRODUCT
                                    // ==================================

                                    name:
                                        getProductName(
                                            item,
                                            product
                                        ),

                                    description:
                                        getProductDescription(
                                            item,
                                            product
                                        ),

                                    note:
                                        getProductNote(
                                            item,
                                            product
                                        ),


                                    // ==================================
                                    // SALE DATA
                                    // ==================================

                                    quantity,

                                    salePrice,

                                    costPriceAtSale,

                                    // Compatibility
                                    costPrice:
                                        costPriceAtSale,

                                    saleTotalAmount,

                                    productProfit,

                                    shippingCost,

                                    otherExpense,

                                    allocatedExpenses,

                                    profit,

                                    totalProfit:
                                        profit,


                                    // ==================================
                                    // TIME
                                    // ==================================

                                    soldAt,

                                    saleCreatedAt,


                                    // ==================================
                                    // SALE CONTEXT
                                    // ==================================

                                    saleTotalQuantity,

                                    saleShippingCost:
                                        shippingCost,

                                    saleOtherExpense:
                                        otherExpense

                                })

                            }
                        )

                    }
                )


                // ==========================================
                // NEWEST FIRST
                // ==========================================

                return rows.sort(
                    (
                        a,
                        b
                    ) =>
                        getTimestamp(
                            b.soldAt
                        ) -
                        getTimestamp(
                            a.soldAt
                        )
                )

            },
            [sales]
        )


    // ==================================================
    // SOLD PRODUCTS
    // ==================================================
    //
    // Compatibility กับ code เดิม
    //
    // ==================================================

    const soldProducts =
        useMemo(
            () => {

                return soldProductRows

            },
            [
                soldProductRows
            ]
        )


    // ==================================================
    // RETURN
    // ==================================================

    return {

        sales,

        setSales,

        salesLoading,

        loadSales,

        totalSoldQuantity,

        totalSales,

        totalCost,

        totalProfit,

        profitByProductId,

        soldProductGroups,

        soldProductRows,

        soldItemRows,

        soldProducts

    }

}


// ======================================================
// CALCULATE SALE PROFIT
// ======================================================

function calculateSaleProfit(
    sale
) {

    const items =
        getSaleItems(
            sale
        )


    if (
        !Array.isArray(
            items
        ) ||
        items.length === 0
    ) {

        return 0

    }


    const totalQuantity =
        getEffectiveSaleTotalQuantity(
            sale,
            items
        )


    if (
        totalQuantity <= 0
    ) {

        return 0

    }


    const shippingCost =
        getShippingCost(
            sale
        )


    const otherExpenses =
        getSaleExpenses(
            sale
        )


    const extraCostPerUnit =
        (
            shippingCost +
            otherExpenses
        ) /
        totalQuantity


    return items.reduce(
        (
            total,
            item
        ) => {

            const quantity =
                getItemQuantity(
                    item
                )


            if (
                quantity <= 0
            ) {

                return total

            }


            const salePrice =
                getSalePrice(
                    item
                )


            const costPriceAtSale =
                getCostPriceAtSale(
                    item
                )


            return (
                total +
                (
                    salePrice -
                    costPriceAtSale -
                    extraCostPerUnit
                ) *
                quantity
            )

        },
        0
    )

}


// ======================================================
// EFFECTIVE SALE TOTAL QUANTITY
// ======================================================
//
// ใช้จำนวนจาก SaleItem จริงเป็นหลัก
//
// ป้องกันกรณี helper หรือ backend
// ส่ง total quantity มาไม่ตรงกับ items
//
// ======================================================

function getEffectiveSaleTotalQuantity(
    sale,
    items
) {

    if (
        Array.isArray(
            items
        ) &&
        items.length > 0
    ) {

        const calculated =
            items.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    getItemQuantity(
                        item
                    ),
                0
            )


        if (
            calculated > 0
        ) {

            return calculated

        }

    }


    return Math.max(
        0,
        safeNumber(
            getSaleTotalQuantity(
                sale
            )
        )
    )

}


// ======================================================
// GET SALE ID
// ======================================================

function getSaleId(
    sale
) {

    return (
        sale?.id ??
        sale?._id ??
        null
    )

}


// ======================================================
// GET SALE ITEM ID
// ======================================================

function getSaleItemId(
    item
) {

    return (
        item?.id ??
        item?._id ??
        item?.saleItemId ??
        null
    )

}


// ======================================================
// GET PRODUCT ID
// ======================================================

function getProductId(
    item
) {

    return (
        item?.consignmentItemId ??
        item?.consignmentItem?.id ??
        item?.productId ??
        item?.product?.id ??
        null
    )

}


// ======================================================
// GET PRODUCT OBJECT
// ======================================================

function getItemProduct(
    item
) {

    return (
        item?.consignmentItem ??
        item?.product ??
        {}
    )

}


// ======================================================
// GET PRODUCT NAME
// ======================================================

function getProductName(
    item,
    product
) {

    return (
        item?.name ||
        product?.name ||
        item?.product?.name ||
        item?.consignmentItem?.name ||
        "ไม่ทราบชื่อสินค้า"
    )

}


// ======================================================
// GET PRODUCT DESCRIPTION
// ======================================================

function getProductDescription(
    item,
    product
) {

    return (
        item?.description ||
        product?.description ||
        item?.product?.description ||
        item?.consignmentItem?.description ||
        ""
    )

}


// ======================================================
// GET PRODUCT NOTE
// ======================================================

function getProductNote(
    item,
    product
) {

    return (
        item?.note ||
        product?.note ||
        item?.product?.note ||
        item?.consignmentItem?.note ||
        ""
    )

}


// ======================================================
// GET QUANTITY
// ======================================================

function getItemQuantity(
    item
) {

    return Math.max(
        0,
        safeNumber(
            item?.quantity
        )
    )

}


// ======================================================
// GET SALE PRICE
// ======================================================

function getSalePrice(
    item
) {

    return Math.max(
        0,
        safeNumber(
            item?.salePrice
        )
    )

}


// ======================================================
// GET COST PRICE AT SALE
// ======================================================
//
// Priority:
//
// 1. costPriceAtSale
// 2. cost_price_at_sale
// 3. costAtSale
// 4. costPrice
// 5. consignmentItem.costPrice
// 6. product.costPrice
//
// ======================================================

function getCostPriceAtSale(
    item
) {

    const value =
        item?.costPriceAtSale ??
        item?.cost_price_at_sale ??
        item?.costAtSale ??
        item?.costPrice ??
        item?.consignmentItem?.costPrice ??
        item?.consignmentItem?.cost ??
        item?.product?.costPrice ??
        item?.product?.cost ??
        0


    return Math.max(
        0,
        safeNumber(
            value
        )
    )

}


// ======================================================
// GET SOLD AT
// ======================================================
//
// Priority:
//
// 1. SaleItem.soldAt
// 2. SaleItem.sold_at
// 3. SaleItem.saleCreatedAt
// 4. Sale.soldAt
// 5. Sale.saleDate
// 6. Sale.createdAt
//
// ======================================================

function getSoldAt(
    item,
    sale
) {

    return (
        item?.soldAt ??
        item?.sold_at ??
        item?.saleCreatedAt ??
        sale?.soldAt ??
        sale?.saleDate ??
        sale?.createdAt ??
        null
    )

}


// ======================================================
// GET SHIPPING COST
// ======================================================

function getShippingCost(
    sale
) {

    return Math.max(
        0,
        safeNumber(
            sale?.shippingCost
        )
    )

}


// ======================================================
// GET TIMESTAMP
// ======================================================

function getTimestamp(
    value
) {

    if (
        !value
    ) {

        return 0

    }


    const timestamp =
        new Date(
            value
        ).getTime()


    return Number.isFinite(
        timestamp
    )
        ? timestamp
        : 0

}


// ======================================================
// HAS VALUE
// ======================================================

function hasValue(
    value
) {

    return (
        value !== null &&
        value !== undefined &&
        value !== ""
    )

}


// ======================================================
// SAFE NUMBER
// ======================================================

function safeNumber(
    value
) {

    const result =
        Number(
            value
        )


    return Number.isFinite(
        result
    )
        ? result
        : 0

}