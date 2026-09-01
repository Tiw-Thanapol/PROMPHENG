const prisma = require("./config/prisma")

// ======================================================
// OWNER → PRODUCT → SALE → SALE ITEM FLOW CHECK
// ======================================================

async function main() {

    console.log("")
    console.log("======================================================")
    console.log(" OWNER → PRODUCT → SALE → SALE ITEM FLOW CHECK")
    console.log("======================================================")

    const result = {
        ownersWithoutAccount: 0,
        productsWithoutAccount: 0,
        productOwnerMismatch: 0,
        salesWithoutAccount: 0,
        saleCreatorMismatch: 0,
        saleItemsBrokenRelation: 0,
        saleItemAccountMismatch: 0,
        saleItemOwnerMismatch: 0,
        fullChainMismatch: 0
    }

    // ==================================================
    // 1. OWNER → ACCOUNT
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("1. OWNER → ACCOUNT")
    console.log("------------------------------------------------------")

    const owners = await prisma.owner.findMany({
        orderBy: {
            id: "asc"
        }
    })

    const ownerRows = owners.map(owner => {

        const accountId = owner.accountId

        return {
            ownerId: owner.id,
            ownerName: owner.name,
            accountId,
            accountValid: !!accountId
        }

    })

    console.table(ownerRows)

    result.ownersWithoutAccount =
        ownerRows.filter(x => !x.accountValid).length

    console.log(
        "Total owners:",
        owners.length
    )

    console.log(
        "Owners without valid account:",
        result.ownersWithoutAccount
    )

    // ==================================================
    // 2. PRODUCT → ACCOUNT + OWNER
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("2. PRODUCT → ACCOUNT + OWNER")
    console.log("------------------------------------------------------")

    const products =
        await prisma.consignmentItem.findMany({

            include: {

                owner: true

            },

            orderBy: {
                id: "asc"
            }

        })

    const productRows =
        products.map(product => {

            const accountId =
                product.accountId

            const ownerAccountId =
                product.owner?.accountId ?? null

            const accountValid =
                !!accountId

            const ownerAccountValid =
                !!product.owner &&
                !!ownerAccountId

            const ownerMismatch =
                accountValid &&
                ownerAccountValid &&
                accountId !== ownerAccountId

            return {

                productId:
                    product.id,

                productName:
                    product.name,

                accountId,

                ownerId:
                    product.ownerId,

                ownerAccountId,

                accountValid,

                ownerAccountValid,

                ownerMismatch

            }

        })

    console.table(productRows)

    result.productsWithoutAccount =
        productRows.filter(
            x => !x.accountValid
        ).length

    result.productOwnerMismatch =
        productRows.filter(
            x => x.ownerMismatch
        ).length

    console.log(
        "Total products:",
        products.length
    )

    console.log(
        "Products without valid account:",
        result.productsWithoutAccount
    )

    console.log(
        "Products with OWNER ACCOUNT mismatch:",
        result.productOwnerMismatch
    )

    // ==================================================
    // 3. SALE → ACCOUNT + USER
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("3. SALE → ACCOUNT + USER")
    console.log("------------------------------------------------------")

    const sales =
        await prisma.sale.findMany({

            include: {

                createdBy: true,

                items: true

            },

            orderBy: {
                id: "asc"
            }

        })

    const saleRows =
        sales.map(sale => {

            const accountId =
                sale.accountId

            const creatorAccountId =
                sale.createdBy?.accountId ?? null

            const accountValid =
                !!accountId

            const creatorAccountValid =
                !!sale.createdBy &&
                !!creatorAccountId

            const creatorMismatch =
                accountValid &&
                creatorAccountValid &&
                accountId !== creatorAccountId

            return {

                saleId:
                    sale.id,

                accountId,

                creatorId:
                    sale.createdById,

                creatorAccountId,

                accountValid,

                creatorAccountValid,

                creatorMismatch,

                totalAmount:
                    Number(sale.totalAmount ?? 0),

                status:
                    sale.status

            }

        })

    console.table(saleRows)

    result.salesWithoutAccount =
        saleRows.filter(
            x => !x.accountValid
        ).length

    result.saleCreatorMismatch =
        saleRows.filter(
            x => x.creatorMismatch
        ).length

    console.log(
        "Total sales:",
        sales.length
    )

    console.log(
        "Sales without valid account:",
        result.salesWithoutAccount
    )

    console.log(
        "Sale / creator account mismatch:",
        result.saleCreatorMismatch
    )

    // ==================================================
    // 4. SALE ITEM → SALE + PRODUCT
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("4. SALE ITEM → SALE + PRODUCT")
    console.log("------------------------------------------------------")

    const saleItems =
        await prisma.saleItem.findMany({

            include: {

                sale: true,

                consignmentItem: {

                    include: {

                        owner: true

                    }

                }

            },

            orderBy: {
                id: "asc"
            }

        })

    const saleItemRows =
        saleItems.map(item => {

            const sale =
                item.sale

            const product =
                item.consignmentItem

            const saleAccountId =
                sale?.accountId ?? null

            const productAccountId =
                product?.accountId ?? null

            const ownerAccountId =
                product?.owner?.accountId ?? null

            const brokenRelation =
                !sale ||
                !product

            const accountMismatch =
                !!sale &&
                !!product &&
                saleAccountId !== productAccountId

            const ownerMismatch =
                !!product &&
                !!product.owner &&
                productAccountId !== ownerAccountId

            return {

                saleItemId:
                    item.id,

                saleId:
                    item.saleId,

                productId:
                    item.consignmentItemId,

                saleAccountId,

                productAccountId,

                ownerAccountId,

                brokenRelation,

                accountMismatch,

                ownerMismatch

            }

        })

    console.table(saleItemRows)

    result.saleItemsBrokenRelation =
        saleItemRows.filter(
            x => x.brokenRelation
        ).length

    result.saleItemAccountMismatch =
        saleItemRows.filter(
            x => x.accountMismatch
        ).length

    result.saleItemOwnerMismatch =
        saleItemRows.filter(
            x => x.ownerMismatch
        ).length

    console.log(
        "Total sale items:",
        saleItems.length
    )

    console.log(
        "SaleItems with broken relation:",
        result.saleItemsBrokenRelation
    )

    console.log(
        "SaleItem SALE / PRODUCT account mismatch:",
        result.saleItemAccountMismatch
    )

    console.log(
        "SaleItem PRODUCT / OWNER account mismatch:",
        result.saleItemOwnerMismatch
    )

    // ==================================================
    // 5. FULL CROSS-CHAIN
    //
    // SALE ACCOUNT
    //      ↓
    // SALE ITEM
    //      ↓
    // PRODUCT ACCOUNT
    //      ↓
    // OWNER ACCOUNT
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("5. FULL CROSS-CHAIN CHECK")
    console.log("------------------------------------------------------")

    const chainRows = []

    for (const item of saleItems) {

        const sale =
            item.sale

        const product =
            item.consignmentItem

        const owner =
            product?.owner

        if (
            !sale ||
            !product ||
            !owner
        ) {

            chainRows.push({

                saleItemId:
                    item.id,

                saleId:
                    item.saleId,

                productId:
                    item.consignmentItemId,

                saleAccountId:
                    sale?.accountId ?? null,

                productAccountId:
                    product?.accountId ?? null,

                ownerAccountId:
                    owner?.accountId ?? null,

                chainValid:
                    false

            })

            continue

        }

        const chainValid =
            sale.accountId ===
            product.accountId &&
            product.accountId ===
            owner.accountId

        chainRows.push({

            saleItemId:
                item.id,

            saleId:
                item.saleId,

            productId:
                product.id,

            saleAccountId:
                sale.accountId,

            productAccountId:
                product.accountId,

            ownerAccountId:
                owner.accountId,

            chainValid

        })

    }

    console.table(chainRows)

    result.fullChainMismatch =
        chainRows.filter(
            x => !x.chainValid
        ).length

    console.log(
        "Full chain mismatches:",
        result.fullChainMismatch
    )

    // ==================================================
    // 6. ACCOUNT SUMMARY
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("6. ACCOUNT SUMMARY")
    console.log("------------------------------------------------------")

    const accounts =
        await prisma.account.findMany({

            orderBy: {
                id: "asc"
            }

        })

    const summary = []

    for (const account of accounts) {

        const ownerCount =
            owners.filter(
                x => x.accountId === account.id
            ).length

        const productCount =
            products.filter(
                x => x.accountId === account.id
            ).length

        const saleCount =
            sales.filter(
                x => x.accountId === account.id
            ).length

        const accountSaleItems =
            saleItems.filter(item => {

                const sale =
                    item.sale

                return (
                    sale &&
                    sale.accountId ===
                    account.id
                )

            }).length

        summary.push({

            accountId:
                account.id,

            accountName:
                account.name,

            owners:
                ownerCount,

            products:
                productCount,

            sales:
                saleCount,

            saleItems:
                accountSaleItems

        })

    }

    console.table(summary)

    // ==================================================
    // FINAL
    // ==================================================

    console.log("")
    console.log("------------------------------------------------------")
    console.log("FINAL CHECK")
    console.log("------------------------------------------------------")

    console.table(result)

    const totalErrors =
        Object.values(result)
            .reduce(
                (sum, value) =>
                    sum + Number(value || 0),
                0
            )

    console.log("")

    if (totalErrors === 0) {

        console.log(
            "=============================================="
        )

        console.log(
            " ALL OWNER / PRODUCT / SALE FLOW CHECKS PASSED"
        )

        console.log(
            " User → Account → Owner → Product"
        )

        console.log(
            " → Sale → SaleItem"
        )

        console.log(
            " No detected account mismatch."
        )

        console.log(
            "=============================================="
        )

    } else {

        console.log(
            "=============================================="
        )

        console.log(
            " FLOW INTEGRITY CHECK FAILED"
        )

        console.log(
            " Found:",
            totalErrors,
            "problem(s)"
        )

        console.log(
            "=============================================="
        )

        process.exitCode = 1
    }

}


// ======================================================
// RUN
// ======================================================

main()

    .catch(error => {

        console.error("")
        console.error(
            "OWNER / PRODUCT / SALE FLOW CHECK ERROR:"
        )

        console.error(error)

        process.exitCode = 1

    })

    .finally(async () => {

        await prisma.$disconnect()

    })
