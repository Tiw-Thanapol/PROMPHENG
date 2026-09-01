const prisma = require("./config/prisma")

// ======================================================
// SALE SCHEMA / RELATION FLOW CHECK
// ======================================================

async function main() {

    console.log("")
    console.log("======================================================")
    console.log(" SALE SCHEMA / RELATION FLOW CHECK")
    console.log("======================================================")
    console.log("")

    const result = {
        sales: 0,
        saleItems: 0,
        products: 0,
        owners: 0,
        expenses: 0,

        saleItemSaleRelation: 0,
        saleItemProductRelation: 0,
        productOwnerRelation: 0,

        brokenSaleItems: 0,
        brokenProducts: 0,
        brokenOwners: 0,

        relationErrors: []
    }

    // ==================================================
    // 1. COUNTS
    // ==================================================

    console.log("------------------------------------------------------")
    console.log("1. TABLE COUNTS")
    console.log("------------------------------------------------------")

    result.sales =
        await prisma.sale.count()

    result.saleItems =
        await prisma.saleItem.count()

    result.products =
        await prisma.consignmentItem.count()

    result.owners =
        await prisma.owner.count()

    result.expenses =
        await prisma.expense.count()

    console.table({

        Sale: result.sales,

        SaleItem: result.saleItems,

        ConsignmentItem: result.products,

        Owner: result.owners,

        Expense: result.expenses

    })


    // ==================================================
    // 2. SALE SAMPLE
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("2. SALE SAMPLE")
    console.log("------------------------------------------------------")

    const sales =
        await prisma.sale.findMany({

            take: 5,

            orderBy: {

                id: "asc"

            },

            select: {

                id: true,

                accountId: true,

                createdById: true,

                customerId: true,

                totalAmount: true,

                status: true,

                createdAt: true

            }

        })

    console.table(sales)


    // ==================================================
    // 3. SALE ITEM SAMPLE
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("3. SALE ITEM SAMPLE")
    console.log("------------------------------------------------------")

    const saleItems =
        await prisma.saleItem.findMany({

            take: 10,

            orderBy: {

                id: "asc"

            },

            select: {

                id: true,

                saleId: true,

                consignmentItemId: true,

                quantity: true,

                salePrice: true

            }

        })

    console.table(saleItems)


    // ==================================================
    // 4. PRODUCT SAMPLE
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("4. PRODUCT / CONSIGNMENT ITEM SAMPLE")
    console.log("------------------------------------------------------")

    const products =
        await prisma.consignmentItem.findMany({

            take: 10,

            orderBy: {

                id: "asc"

            },

            select: {

                id: true,

                name: true,

                ownerId: true,

                accountId: true,

                costPrice: true

            }

        })

    console.table(products)


    // ==================================================
    // 5. OWNER SAMPLE
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("5. OWNER SAMPLE")
    console.log("------------------------------------------------------")

    const owners =
        await prisma.owner.findMany({

            take: 10,

            orderBy: {

                id: "asc"

            },

            select: {

                id: true,

                name: true,

                accountId: true

            }

        })

    console.table(owners)


    // ==================================================
    // 6. EXPENSE SAMPLE
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("6. EXPENSE SAMPLE")
    console.log("------------------------------------------------------")

    const expenses =
        await prisma.expense.findMany({

            take: 10,

            orderBy: {

                id: "asc"

            },

            select: {

                id: true,

                name: true,

                category: true,

                amount: true,

                accountId: true,

                saleId: true,

                createdById: true

            }

        })

    console.table(expenses)


    // ==================================================
    // 7. SALE ITEM → SALE
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("7. SALE ITEM → SALE")
    console.log("------------------------------------------------------")

    if (saleItems.length === 0) {

        console.log(
            "NO SALE ITEMS FOUND"
        )

    } else {

        for (const item of saleItems) {

            const sale =
                await prisma.sale.findUnique({

                    where: {

                        id: item.saleId

                    },

                    select: {

                        id: true,

                        accountId: true

                    }

                })

            const valid =
                !!sale

            if (!valid) {

                result.brokenSaleItems++

                result.relationErrors.push({

                    type:
                        "SALE_ITEM_TO_SALE",

                    saleItemId:
                        item.id,

                    saleId:
                        item.saleId,

                    reason:
                        "Sale not found"

                })

            }

            console.log({

                saleItemId:
                    item.id,

                saleId:
                    item.saleId,

                saleExists:
                    valid,

                saleAccountId:
                    sale?.accountId ?? null

            })

        }

    }


    // ==================================================
    // 8. SALE ITEM → PRODUCT
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("8. SALE ITEM → PRODUCT")
    console.log("------------------------------------------------------")

    if (saleItems.length === 0) {

        console.log(
            "NO SALE ITEMS FOUND"
        )

    } else {

        for (const item of saleItems) {

            const product =
                item.consignmentItemId
                    ? await prisma.consignmentItem.findUnique({

                        where: {

                            id:
                                item.consignmentItemId

                        },

                        select: {

                            id: true,

                            name: true,

                            ownerId: true,

                            accountId: true

                        }

                    })
                    : null

            const valid =
                !!product

            if (!valid) {

                result.brokenProducts++

                result.relationErrors.push({

                    type:
                        "SALE_ITEM_TO_PRODUCT",

                    saleItemId:
                        item.id,

                    productId:
                        item.consignmentItemId,

                    reason:
                        "Product / ConsignmentItem not found"

                })

            }

            console.log({

                saleItemId:
                    item.id,

                productId:
                    item.consignmentItemId,

                productExists:
                    valid,

                productAccountId:
                    product?.accountId ?? null,

                ownerId:
                    product?.ownerId ?? null

            })

        }

    }


    // ==================================================
    // 9. PRODUCT → OWNER
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("9. PRODUCT → OWNER")
    console.log("------------------------------------------------------")

    if (products.length === 0) {

        console.log(
            "NO PRODUCTS FOUND"
        )

    } else {

        for (const product of products) {

            const owner =
                product.ownerId
                    ? await prisma.owner.findUnique({

                        where: {

                            id:
                                product.ownerId

                        },

                        select: {

                            id: true,

                            name: true,

                            accountId: true

                        }

                    })
                    : null

            const valid =
                !!owner

            if (!valid) {

                result.brokenOwners++

                result.relationErrors.push({

                    type:
                        "PRODUCT_TO_OWNER",

                    productId:
                        product.id,

                    ownerId:
                        product.ownerId,

                    reason:
                        "Owner not found"

                })

            }

            console.log({

                productId:
                    product.id,

                productName:
                    product.name,

                ownerId:
                    product.ownerId,

                ownerExists:
                    valid,

                productAccountId:
                    product.accountId,

                ownerAccountId:
                    owner?.accountId ?? null

            })

        }

    }


    // ==================================================
    // 10. ACCOUNT CROSS CHECK
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("10. ACCOUNT CROSS CHECK")
    console.log("------------------------------------------------------")

    let accountMismatch = 0

    for (const item of saleItems) {

        const sale =
            await prisma.sale.findUnique({

                where: {

                    id:
                        item.saleId

                },

                select: {

                    id: true,

                    accountId: true

                }

            })

        const product =
            item.consignmentItemId
                ? await prisma.consignmentItem.findUnique({

                    where: {

                        id:
                            item.consignmentItemId

                    },

                    select: {

                        id: true,

                        accountId: true,

                        ownerId: true

                    }

                })
                : null

        if (
            sale &&
            product &&
            sale.accountId !== product.accountId
        ) {

            accountMismatch++

            result.relationErrors.push({

                type:
                    "SALE_PRODUCT_ACCOUNT_MISMATCH",

                saleId:
                    sale.id,

                saleAccountId:
                    sale.accountId,

                productId:
                    product.id,

                productAccountId:
                    product.accountId

            })

        }

        if (product?.ownerId) {

            const owner =
                await prisma.owner.findUnique({

                    where: {

                        id:
                            product.ownerId

                    },

                    select: {

                        id: true,

                        accountId: true

                    }

                })

            if (
                owner &&
                product.accountId !== owner.accountId
            ) {

                accountMismatch++

                result.relationErrors.push({

                    type:
                        "PRODUCT_OWNER_ACCOUNT_MISMATCH",

                    productId:
                        product.id,

                    productAccountId:
                        product.accountId,

                    ownerId:
                        owner.id,

                    ownerAccountId:
                        owner.accountId

                })

            }

        }

    }

    console.log({

        accountMismatch

    })


    // ==================================================
    // 11. FULL CHAIN
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("11. FULL CHAIN")
    console.log("------------------------------------------------------")

    console.log("")
    console.log(
        "User"
    )

    console.log(
        "  ↓"
    )

    console.log(
        "Account"
    )

    console.log(
        "  ↓"
    )

    console.log(
        "Sale"
    )

    console.log(
        "  ↓"
    )

    console.log(
        "SaleItem"
    )

    console.log(
        "  ↓"
    )

    console.log(
        "Product / ConsignmentItem"
    )

    console.log(
        "  ↓"
    )

    console.log(
        "Owner"
    )

    console.log(
        "  ↓"
    )

    console.log(
        "Expense"
    )


    // ==================================================
    // 12. FINAL
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("12. FINAL CHECK")
    console.log("------------------------------------------------------")

    console.table({

        sales:
            result.sales,

        saleItems:
            result.saleItems,

        products:
            result.products,

        owners:
            result.owners,

        expenses:
            result.expenses,

        brokenSaleItems:
            result.brokenSaleItems,

        brokenProducts:
            result.brokenProducts,

        brokenOwners:
            result.brokenOwners,

        accountMismatch:
            accountMismatch,

        totalRelationErrors:
            result.relationErrors.length

    })


    console.log("")
    console.log("======================================================")

    if (
        result.relationErrors.length === 0
    ) {

        console.log(
            " SCHEMA / RELATION CHECK PASSED"
        )

        console.log(
            " No detected relation or account mismatch."
        )

    } else {

        console.log(
            " SCHEMA / RELATION CHECK FOUND ISSUES"
        )

        console.log("")
        console.table(
            result.relationErrors
        )

    }

    console.log("======================================================")
    console.log("")

}


// ======================================================
// RUN
// ======================================================

main()
    .catch(error => {

        console.error("")
        console.error(
            "CHECK SALE SCHEMA ERROR:"
        )

        console.error(
            error
        )

        process.exitCode = 1

    })
    .finally(async () => {

        await prisma.$disconnect()

    })