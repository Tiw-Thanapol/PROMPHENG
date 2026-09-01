// ======================================================
// SALE HELPERS
// ======================================================

import {
    safeNumber
} from "./productHelpers"


// ======================================================
// EXPENSE AMOUNT
// ======================================================

export function getExpenseAmount(
    expense
) {

    if (!expense) {
        return 0
    }

    return Math.max(
        0,
        safeNumber(
            expense.amount ??
            expense.cost ??
            expense.price ??
            expense.value ??
            0
        )
    )
}


// ======================================================
// SALE EXPENSES
// ======================================================

export function getSaleExpenses(
    sale
) {

    if (
        !Array.isArray(
            sale?.expenses
        )
    ) {
        return 0
    }

    return sale.expenses.reduce(
        (
            total,
            expense
        ) =>
            total +
            getExpenseAmount(
                expense
            ),
        0
    )
}


// ======================================================
// SALE ITEMS
// ======================================================

export function getSaleItems(
    sale
) {

    return Array.isArray(
        sale?.items
    )
        ? sale.items
        : []
}


// ======================================================
// SALE TOTAL QUANTITY
// ======================================================

export function getSaleTotalQuantity(
    sale
) {

    return getSaleItems(
        sale
    ).reduce(
        (
            total,
            item
        ) =>
            total +
            Math.max(
                0,
                safeNumber(
                    item?.quantity
                )
            ),
        0
    )
}


// ======================================================
// SALE CREATED AT
// ======================================================

export function getSaleCreatedAt(
    sale
) {

    return (
        sale?.createdAt ??
        sale?.created_at ??
        sale?.soldAt ??
        sale?.sold_at ??
        null
    )
}


// ======================================================
// SALE SHIPPING COST
// ======================================================

export function getSaleShippingCost(
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
// SALE OTHER EXPENSE
// ======================================================

export function getSaleOtherExpense(
    sale
) {

    return getSaleExpenses(
        sale
    )
}


// ======================================================
// SALE EXTRA COST PER UNIT
// ======================================================

export function getSaleExtraCostPerUnit(
    sale
) {

    const totalQuantity =
        getSaleTotalQuantity(
            sale
        )

    if (
        totalQuantity <= 0
    ) {
        return 0
    }

    const shippingCost =
        getSaleShippingCost(
            sale
        )

    const otherExpenses =
        getSaleExpenses(
            sale
        )

    return (
        shippingCost +
        otherExpenses
    ) / totalQuantity
}


// ======================================================
// SALE ITEM PRODUCT
// ======================================================

export function getSaleItemProduct(
    item
) {

    return (
        item?.consignmentItem ??
        item?.product ??
        {}
    )
}


// ======================================================
// SALE ITEM COST
// ======================================================

export function getSaleItemCost(
    item
) {

    const product =
        getSaleItemProduct(
            item
        )

    return Math.max(
        0,
        safeNumber(
            product?.costPrice ??
            product?.cost ??
            item?.costPrice ??
            0
        )
    )
}


// ======================================================
// SALE ITEM PRICE
// ======================================================

export function getSaleItemPrice(
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
// SALE ITEM QUANTITY
// ======================================================

export function getSaleItemQuantity(
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
// SALE ITEM PRODUCT ID
// ======================================================

export function getSaleItemProductId(
    item
) {

    const product =
        getSaleItemProduct(
            item
        )

    return (
        item?.consignmentItemId ??
        product?.id ??
        product?._id ??
        item?.productId ??
        item?.product?.id ??
        null
    )
}


// ======================================================
// SALE ITEM PROFIT
// ======================================================

export function calculateSaleItemProfit(
    item,
    extraCostPerUnit = 0
) {

    const quantity =
        getSaleItemQuantity(
            item
        )

    if (
        quantity <= 0
    ) {
        return 0
    }

    const salePrice =
        getSaleItemPrice(
            item
        )

    const costPrice =
        getSaleItemCost(
            item
        )

    const extraCost =
        Math.max(
            0,
            safeNumber(
                extraCostPerUnit
            )
        )

    return (
        salePrice -
        costPrice -
        extraCost
    ) * quantity
}


// ======================================================
// SALE PROFIT
// ======================================================

export function calculateSaleProfit(
    sale
) {

    const items =
        getSaleItems(
            sale
        )

    if (
        items.length === 0
    ) {
        return 0
    }

    const totalQuantity =
        getSaleTotalQuantity(
            sale
        )

    if (
        totalQuantity <= 0
    ) {
        return 0
    }

    const shippingCost =
        getSaleShippingCost(
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
        ) / totalQuantity

    return items.reduce(
        (
            total,
            item
        ) =>
            total +
            calculateSaleItemProfit(
                item,
                extraCostPerUnit
            ),
        0
    )
}


// ======================================================
// PROFIT BY PRODUCT ID
// ======================================================

export function calculateProfitByProductId(
    sales
) {

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

            const totalQuantity =
                getSaleTotalQuantity(
                    sale
                )

            if (
                totalQuantity <= 0
            ) {
                return
            }

            const shippingCost =
                getSaleShippingCost(
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
                ) / totalQuantity

            items.forEach(
                item => {

                    const productId =
                        getSaleItemProductId(
                            item
                        )

                    if (
                        productId === null ||
                        productId === undefined
                    ) {
                        return
                    }

                    const profit =
                        calculateSaleItemProfit(
                            item,
                            extraCostPerUnit
                        )

                    map.set(
                        productId,
                        (
                            map.get(
                                productId
                            ) || 0
                        ) +
                        profit
                    )
                }
            )
        }
    )

    return map
}


// ======================================================
// SALE TOTAL AMOUNT
// ======================================================

export function getSaleTotalAmount(
    sale
) {

    return getSaleItems(
        sale
    ).reduce(
        (
            total,
            item
        ) => {

            const quantity =
                getSaleItemQuantity(
                    item
                )

            const salePrice =
                getSaleItemPrice(
                    item
                )

            return (
                total +
                (
                    salePrice *
                    quantity
                )
            )
        },
        0
    )
}


// ======================================================
// SALE ID
// ======================================================

export function getSaleId(
    sale
) {

    return (
        sale?.id ??
        sale?._id ??
        null
    )
}


// ======================================================
// DEFAULT EXPORT
// ======================================================

export default {
    getExpenseAmount,
    getSaleExpenses,
    getSaleItems,
    getSaleTotalQuantity,
    getSaleCreatedAt,
    getSaleShippingCost,
    getSaleOtherExpense,
    getSaleExtraCostPerUnit,
    getSaleItemProduct,
    getSaleItemCost,
    getSaleItemPrice,
    getSaleItemQuantity,
    getSaleItemProductId,
    calculateSaleItemProfit,
    calculateSaleProfit,
    calculateProfitByProductId,
    getSaleTotalAmount,
    getSaleId
}