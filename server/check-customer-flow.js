const prisma = require("./config/prisma")


// ======================================================
// CUSTOMER FLOW INTEGRITY CHECK
//
// User
//   ↓
// Account
//   ↓
// Customer
//   ↓
// Sale
//   ↓
// SaleItem
//   ↓
// ConsignmentItem (Product)
//   ↓
// Owner
//
// จุดประสงค์:
// - ตรวจว่า User มี Account จริง
// - Customer อยู่ Account ที่ถูกต้อง
// - Sale อยู่ Account เดียวกับ Customer
// - Sale creator อยู่ Account เดียวกับ Sale
// - SaleItem เชื่อม Sale + Product จริง
// - Product อยู่ Account เดียวกับ Sale
// - Product Owner อยู่ Account เดียวกับ Product
// - ตรวจข้อมูลข้าม Account
// ======================================================


// ======================================================
// HELPERS
// ======================================================

function printSection(title) {

    console.log("")
    console.log("-".repeat(54))
    console.log(title)
    console.log("-".repeat(54))

}


function num(value) {

    const n = Number(value)

    return Number.isFinite(n) ? n : 0

}


function addError(errors, type, details) {

    errors.push({
        type,
        ...details
    })

}


// ======================================================
// MAIN
// ======================================================

async function main() {

    const errors = []


    console.log("")
    console.log("======================================================")
    console.log(" CUSTOMER FLOW / ACCOUNT INTEGRITY CHECK")
    console.log("======================================================")


    // ==================================================
    // 1. ACCOUNTS
    // ==================================================

    printSection("1. ACCOUNTS")

    const accounts =
        await prisma.account.findMany({

            select: {
                id: true,
                name: true,
                createdAt: true
            },

            orderBy: {
                id: "asc"
            }

        })


    console.table(accounts)

    console.log(`Total accounts: ${accounts.length}`)


    const accountMap =
        new Map(
            accounts.map(account => [
                account.id,
                account
            ])
        )


    // ==================================================
    // 2. USER → ACCOUNT
    // ==================================================

    printSection("2. USER → ACCOUNT")

    const users =
        await prisma.user.findMany({

            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                accountId: true,
                account: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },

            orderBy: {
                id: "asc"
            }

        })


    const userRows =
        users.map(user => {

            const valid =
                user.accountId !== null &&
                accountMap.has(user.accountId) &&
                user.account?.id === user.accountId


            if (!valid) {

                addError(
                    errors,
                    "USER_ACCOUNT_MISMATCH",
                    {
                        userId: user.id,
                        email: user.email,
                        accountId: user.accountId,
                        accountExists: accountMap.has(
                            user.accountId
                        )
                    }
                )

            }


            return {

                userId: user.id,

                email: user.email,

                role: user.role,

                accountId: user.accountId,

                accountExists:
                    !!user.account,

                accountName:
                    user.account?.name || null

            }

        })


    console.table(userRows)


    const usersWithoutAccount =
        userRows.filter(
            row => !row.accountExists
        ).length


    console.log(
        `Users without valid account: ${usersWithoutAccount}`
    )


    // ==================================================
    // 3. CUSTOMER → ACCOUNT
    // ==================================================

    printSection("3. CUSTOMER → ACCOUNT")

    const customers =
        await prisma.customer.findMany({

            select: {

                id: true,

                accountId: true,

                name: true,

                phone: true,

                customerCode: true,

                account: {
                    select: {
                        id: true,
                        name: true
                    }
                },

                _count: {
                    select: {
                        sales: true
                    }
                }

            },

            orderBy: {
                id: "asc"
            }

        })


    const customerMap =
        new Map(
            customers.map(customer => [
                customer.id,
                customer
            ])
        )


    const customerRows =
        customers.map(customer => {

            const valid =
                customer.accountId !== null &&
                accountMap.has(customer.accountId) &&
                customer.account?.id === customer.accountId


            if (!valid) {

                addError(
                    errors,
                    "CUSTOMER_ACCOUNT_MISMATCH",
                    {
                        customerId: customer.id,
                        customerName: customer.name,
                        accountId: customer.accountId
                    }
                )

            }


            return {

                customerId: customer.id,

                customerCode:
                    customer.customerCode,

                name:
                    customer.name,

                accountId:
                    customer.accountId,

                accountExists:
                    !!customer.account,

                accountName:
                    customer.account?.name || null,

                sales:
                    customer._count.sales

            }

        })


    console.table(customerRows)


    const customersWithoutAccount =
        customerRows.filter(
            row => !row.accountExists
        ).length


    console.log(
        `Total customers: ${customers.length}`
    )

    console.log(
        `Customers without valid account: ${customersWithoutAccount}`
    )


    // ==================================================
    // 4. OWNER → ACCOUNT
    // ==================================================

    printSection("4. OWNER → ACCOUNT")

    const owners =
        await prisma.owner.findMany({

            select: {

                id: true,

                accountId: true,

                name: true,

                account: {
                    select: {
                        id: true,
                        name: true
                    }
                },

                _count: {
                    select: {
                        items: true,
                        payments: true
                    }
                }

            },

            orderBy: {
                id: "asc"
            }

        })


    const ownerMap =
        new Map(
            owners.map(owner => [
                owner.id,
                owner
            ])
        )


    const ownerRows =
        owners.map(owner => {

            const valid =
                owner.accountId !== null &&
                accountMap.has(owner.accountId) &&
                owner.account?.id === owner.accountId


            if (!valid) {

                addError(
                    errors,
                    "OWNER_ACCOUNT_MISMATCH",
                    {
                        ownerId: owner.id,
                        ownerName: owner.name,
                        accountId: owner.accountId
                    }
                )

            }


            return {

                ownerId:
                    owner.id,

                name:
                    owner.name,

                accountId:
                    owner.accountId,

                accountExists:
                    !!owner.account,

                accountName:
                    owner.account?.name || null,

                products:
                    owner._count.items,

                payments:
                    owner._count.payments

            }

        })


    console.table(ownerRows)


    const ownersWithoutAccount =
        ownerRows.filter(
            row => !row.accountExists
        ).length


    console.log(
        `Total owners: ${owners.length}`
    )

    console.log(
        `Owners without valid account: ${ownersWithoutAccount}`
    )


    // ==================================================
    // 5. PRODUCT → ACCOUNT + OWNER
    // ==================================================

    printSection(
        "5. PRODUCT → ACCOUNT + OWNER"
    )

    const products =
        await prisma.consignmentItem.findMany({

            select: {

                id: true,

                accountId: true,

                ownerId: true,

                name: true,

                status: true,

                quantity: true,

                costPrice: true,

                owner: {

                    select: {

                        id: true,

                        name: true,

                        accountId: true,

                        account: {

                            select: {

                                id: true,

                                name: true

                            }

                        }

                    }

                },

                account: {

                    select: {

                        id: true,

                        name: true

                    }

                }

            },

            orderBy: {
                id: "asc"
            }

        })


    const productMap =
        new Map(
            products.map(product => [
                product.id,
                product
            ])
        )


    let productsWithoutAccount = 0
    let productOwnerMismatch = 0


    const productRows =
        products.map(product => {

            const validAccount =
                product.accountId !== null &&
                accountMap.has(product.accountId) &&
                product.account?.id === product.accountId


            const validOwner =
                !!product.owner &&
                product.owner.accountId ===
                    product.accountId &&
                product.owner.account?.id ===
                    product.accountId


            if (!validAccount) {

                productsWithoutAccount++

                addError(
                    errors,
                    "PRODUCT_ACCOUNT_MISMATCH",
                    {
                        productId: product.id,
                        productName: product.name,
                        accountId: product.accountId
                    }
                )

            }


            if (!validOwner) {

                productOwnerMismatch++

                addError(
                    errors,
                    "PRODUCT_OWNER_ACCOUNT_MISMATCH",
                    {
                        productId: product.id,
                        productName: product.name,
                        productAccountId:
                            product.accountId,
                        ownerId:
                            product.ownerId,
                        ownerAccountId:
                            product.owner?.accountId || null
                    }
                )

            }


            return {

                productId:
                    product.id,

                name:
                    product.name,

                accountId:
                    product.accountId,

                accountName:
                    product.account?.name || null,

                ownerId:
                    product.ownerId,

                ownerName:
                    product.owner?.name || null,

                ownerAccountId:
                    product.owner?.accountId || null,

                status:
                    product.status,

                quantity:
                    num(product.quantity),

                accountValid:
                    validAccount,

                ownerAccountValid:
                    validOwner

            }

        })


    console.table(productRows)


    console.log(
        `Total products: ${products.length}`
    )

    console.log(
        `Products without valid account: ${productsWithoutAccount}`
    )

    console.log(
        `Products with OWNER ACCOUNT mismatch: ${productOwnerMismatch}`
    )


    // ==================================================
    // 6. SALE → ACCOUNT + USER + CUSTOMER
    // ==================================================

    printSection(
        "6. SALE → ACCOUNT + USER + CUSTOMER"
    )

    const sales =
        await prisma.sale.findMany({

            select: {

                id: true,

                accountId: true,

                createdById: true,

                customerId: true,

                totalAmount: true,

                status: true,

                soldAt: true,

                account: {

                    select: {

                        id: true,

                        name: true

                    }

                },

                createdBy: {

                    select: {

                        id: true,

                        email: true,

                        name: true,

                        accountId: true

                    }

                },

                customer: {

                    select: {

                        id: true,

                        name: true,

                        accountId: true

                    }

                }

            },

            orderBy: {
                id: "asc"
            }

        })


    const saleMap =
        new Map(
            sales.map(sale => [
                sale.id,
                sale
            ])
        )


    let salesWithoutAccount = 0
    let saleCreatorMismatch = 0
    let saleCustomerMismatch = 0


    const saleRows =
        sales.map(sale => {

            const validSaleAccount =
                sale.accountId !== null &&
                accountMap.has(sale.accountId) &&
                sale.account?.id === sale.accountId


            const validCreator =
                !!sale.createdBy &&
                sale.createdBy.accountId ===
                    sale.accountId


            const validCustomer =
                sale.customer === null ||
                sale.customer.accountId ===
                    sale.accountId


            if (!validSaleAccount) {

                salesWithoutAccount++

                addError(
                    errors,
                    "SALE_ACCOUNT_MISMATCH",
                    {
                        saleId: sale.id,
                        accountId: sale.accountId
                    }
                )

            }


            if (!validCreator) {

                saleCreatorMismatch++

                addError(
                    errors,
                    "SALE_CREATOR_ACCOUNT_MISMATCH",
                    {
                        saleId: sale.id,
                        saleAccountId:
                            sale.accountId,
                        createdById:
                            sale.createdById,
                        creatorAccountId:
                            sale.createdBy?.accountId ||
                            null
                    }
                )

            }


            if (!validCustomer) {

                saleCustomerMismatch++

                addError(
                    errors,
                    "SALE_CUSTOMER_ACCOUNT_MISMATCH",
                    {
                        saleId: sale.id,
                        saleAccountId:
                            sale.accountId,
                        customerId:
                            sale.customerId,
                        customerAccountId:
                            sale.customer?.accountId ||
                            null
                    }
                )

            }


            return {

                saleId:
                    sale.id,

                accountId:
                    sale.accountId,

                accountName:
                    sale.account?.name || null,

                createdById:
                    sale.createdById,

                creatorEmail:
                    sale.createdBy?.email || null,

                creatorAccountId:
                    sale.createdBy?.accountId || null,

                customerId:
                    sale.customerId,

                customerName:
                    sale.customer?.name || null,

                customerAccountId:
                    sale.customer?.accountId || null,

                totalAmount:
                    num(sale.totalAmount),

                status:
                    sale.status,

                accountValid:
                    validSaleAccount,

                creatorAccountValid:
                    validCreator,

                customerAccountValid:
                    validCustomer

            }

        })


    console.table(saleRows)


    console.log(
        `Total sales: ${sales.length}`
    )

    console.log(
        `Sales without valid account: ${salesWithoutAccount}`
    )

    console.log(
        `Sale / creator account mismatch: ${saleCreatorMismatch}`
    )

    console.log(
        `Sale / customer account mismatch: ${saleCustomerMismatch}`
    )


    // ==================================================
    // 7. SALE ITEM → SALE + PRODUCT
    // ==================================================

    printSection(
        "7. SALE ITEM → SALE + PRODUCT"
    )

    const saleItems =
        await prisma.saleItem.findMany({

            select: {

                id: true,

                saleId: true,

                consignmentItemId: true,

                quantity: true,

                salePrice: true,

                costPriceAtSale: true,

                sale: {

                    select: {

                        id: true,

                        accountId: true

                    }

                },

                consignmentItem: {

                    select: {

                        id: true,

                        name: true,

                        accountId: true,

                        ownerId: true,

                        owner: {

                            select: {

                                id: true,

                                name: true,

                                accountId: true

                            }

                        }

                    }

                }

            },

            orderBy: {
                id: "asc"
            }

        })


    let saleItemBrokenRelation = 0
    let saleItemAccountMismatch = 0
    let saleItemOwnerMismatch = 0


    const saleItemRows =
        saleItems.map(item => {

            const saleExists =
                !!item.sale


            const productExists =
                !!item.consignmentItem


            const accountMatch =
                saleExists &&
                productExists &&
                item.sale.accountId ===
                    item.consignmentItem.accountId


            const ownerMatch =
                productExists &&
                !!item.consignmentItem.owner &&
                item.consignmentItem.owner.accountId ===
                    item.consignmentItem.accountId


            if (!saleExists || !productExists) {

                saleItemBrokenRelation++

                addError(
                    errors,
                    "SALE_ITEM_BROKEN_RELATION",
                    {
                        saleItemId: item.id,
                        saleId: item.saleId,
                        productId:
                            item.consignmentItemId,
                        saleExists,
                        productExists
                    }
                )

            }


            if (!accountMatch) {

                saleItemAccountMismatch++

                addError(
                    errors,
                    "SALE_ITEM_ACCOUNT_MISMATCH",
                    {
                        saleItemId: item.id,
                        saleId: item.saleId,
                        saleAccountId:
                            item.sale?.accountId ||
                            null,
                        productId:
                            item.consignmentItemId,
                        productAccountId:
                            item.consignmentItem?.accountId ||
                            null
                    }
                )

            }


            if (!ownerMatch) {

                saleItemOwnerMismatch++

                addError(
                    errors,
                    "SALE_ITEM_OWNER_ACCOUNT_MISMATCH",
                    {
                        saleItemId: item.id,
                        productId:
                            item.consignmentItemId,
                        productAccountId:
                            item.consignmentItem?.accountId ||
                            null,
                        ownerId:
                            item.consignmentItem?.ownerId ||
                            null,
                        ownerAccountId:
                            item.consignmentItem?.owner?.accountId ||
                            null
                    }
                )

            }


            return {

                saleItemId:
                    item.id,

                saleId:
                    item.saleId,

                saleAccountId:
                    item.sale?.accountId || null,

                productId:
                    item.consignmentItemId,

                productName:
                    item.consignmentItem?.name || null,

                productAccountId:
                    item.consignmentItem?.accountId ||
                    null,

                ownerId:
                    item.consignmentItem?.ownerId ||
                    null,

                ownerAccountId:
                    item.consignmentItem?.owner?.accountId ||
                    null,

                quantity:
                    num(item.quantity),

                saleExists,

                productExists,

                accountMatch,

                ownerMatch

            }

        })


    console.table(saleItemRows)


    console.log(
        `Total sale items: ${saleItems.length}`
    )

    console.log(
        `SaleItems with broken relation: ${saleItemBrokenRelation}`
    )

    console.log(
        `SaleItem SALE / PRODUCT account mismatch: ${saleItemAccountMismatch}`
    )

    console.log(
        `SaleItem PRODUCT / OWNER account mismatch: ${saleItemOwnerMismatch}`
    )


    // ==================================================
    // 8. EXPENSE → ACCOUNT + SALE + USER
    // ==================================================

    printSection(
        "8. EXPENSE → ACCOUNT + SALE + USER"
    )

    const expenses =
        await prisma.expense.findMany({

            select: {

                id: true,

                accountId: true,

                saleId: true,

                createdById: true,

                name: true,

                category: true,

                amount: true,

                account: {

                    select: {

                        id: true,

                        name: true

                    }

                },

                sale: {

                    select: {

                        id: true,

                        accountId: true

                    }

                },

                createdBy: {

                    select: {

                        id: true,

                        email: true,

                        accountId: true

                    }

                }

            },

            orderBy: {
                id: "asc"
            }

        })


    let expensesWithoutAccount = 0
    let expenseSaleMismatch = 0
    let expenseCreatorMismatch = 0
    let expensesBrokenSale = 0


    const expenseRows =
        expenses.map(expense => {

            const validAccount =
                expense.accountId !== null &&
                accountMap.has(expense.accountId) &&
                expense.account?.id ===
                    expense.accountId


            const validSale =
                expense.sale === null ||
                expense.sale.accountId ===
                    expense.accountId


            const validCreator =
                !!expense.createdBy &&
                expense.createdBy.accountId ===
                    expense.accountId


            if (!validAccount) {

                expensesWithoutAccount++

                addError(
                    errors,
                    "EXPENSE_ACCOUNT_MISMATCH",
                    {
                        expenseId: expense.id,
                        accountId:
                            expense.accountId
                    }
                )

            }


            if (!validSale) {

                expenseSaleMismatch++

                addError(
                    errors,
                    "EXPENSE_SALE_ACCOUNT_MISMATCH",
                    {
                        expenseId: expense.id,
                        expenseAccountId:
                            expense.accountId,
                        saleId:
                            expense.saleId,
                        saleAccountId:
                            expense.sale?.accountId ||
                            null
                    }
                )

            }


            if (!validCreator) {

                expenseCreatorMismatch++

                addError(
                    errors,
                    "EXPENSE_CREATOR_ACCOUNT_MISMATCH",
                    {
                        expenseId: expense.id,
                        expenseAccountId:
                            expense.accountId,
                        createdById:
                            expense.createdById,
                        creatorAccountId:
                            expense.createdBy?.accountId ||
                            null
                    }
                )

            }


            if (
                expense.saleId !== null &&
                !expense.sale
            ) {

                expensesBrokenSale++

                addError(
                    errors,
                    "EXPENSE_BROKEN_SALE",
                    {
                        expenseId: expense.id,
                        saleId:
                            expense.saleId
                    }
                )

            }


            return {

                expenseId:
                    expense.id,

                name:
                    expense.name,

                category:
                    expense.category,

                amount:
                    num(expense.amount),

                accountId:
                    expense.accountId,

                accountName:
                    expense.account?.name || null,

                saleId:
                    expense.saleId,

                saleAccountId:
                    expense.sale?.accountId || null,

                createdById:
                    expense.createdById,

                creatorAccountId:
                    expense.createdBy?.accountId || null,

                accountValid:
                    validAccount,

                saleAccountValid:
                    validSale,

                creatorAccountValid:
                    validCreator

            }

        })


    console.table(expenseRows)


    console.log(
        `Total expenses: ${expenses.length}`
    )

    console.log(
        `Expenses without valid account: ${expensesWithoutAccount}`
    )

    console.log(
        `Expense / sale account mismatch: ${expenseSaleMismatch}`
    )

    console.log(
        `Expense / creator account mismatch: ${expenseCreatorMismatch}`
    )

    console.log(
        `Expenses with broken sale relation: ${expensesBrokenSale}`
    )


    // ==================================================
    // 9. FULL CROSS-CHAIN CHECK
    //
    // User → Account → Sale → SaleItem → Product → Owner
    // ==================================================

    printSection(
        "9. FULL CROSS-CHAIN CHECK"
    )


    let fullChainMismatch = 0


    for (const sale of sales) {

        const saleAccountId =
            sale.accountId


        // ----------------------------------------------
        // SALE → CREATOR
        // ----------------------------------------------

        if (
            sale.createdBy &&
            sale.createdBy.accountId !==
                saleAccountId
        ) {

            fullChainMismatch++

            addError(
                errors,
                "CHAIN_USER_ACCOUNT_SALE",
                {
                    saleId: sale.id,
                    saleAccountId,
                    userId: sale.createdById,
                    userAccountId:
                        sale.createdBy.accountId
                }
            )

        }


        // ----------------------------------------------
        // SALE → CUSTOMER
        // ----------------------------------------------

        if (
            sale.customer &&
            sale.customer.accountId !==
                saleAccountId
        ) {

            fullChainMismatch++

            addError(
                errors,
                "CHAIN_CUSTOMER_ACCOUNT_SALE",
                {
                    saleId: sale.id,
                    saleAccountId,
                    customerId:
                        sale.customerId,
                    customerAccountId:
                        sale.customer.accountId
                }
            )

        }


        // ----------------------------------------------
        // SALE → SALE ITEMS
        // ----------------------------------------------

        const relatedItems =
            saleItems.filter(
                item =>
                    item.saleId === sale.id
            )


        for (const saleItem of relatedItems) {

            const product =
                saleItem.consignmentItem


            if (!product) {

                continue

            }


            // ------------------------------------------
            // SALE → PRODUCT
            // ------------------------------------------

            if (
                product.accountId !==
                saleAccountId
            ) {

                fullChainMismatch++

                addError(
                    errors,
                    "CHAIN_SALE_PRODUCT",
                    {
                        saleId:
                            sale.id,
                        saleAccountId,
                        saleItemId:
                            saleItem.id,
                        productId:
                            product.id,
                        productAccountId:
                            product.accountId
                    }
                )

            }


            // ------------------------------------------
            // PRODUCT → OWNER
            // ------------------------------------------

            if (
                product.owner &&
                product.owner.accountId !==
                    product.accountId
            ) {

                fullChainMismatch++

                addError(
                    errors,
                    "CHAIN_PRODUCT_OWNER",
                    {
                        saleId:
                            sale.id,
                        productId:
                            product.id,
                        productAccountId:
                            product.accountId,
                        ownerId:
                            product.owner.id,
                        ownerAccountId:
                            product.owner.accountId
                    }
                )

            }

        }

    }


    console.log(
        `Full chain mismatches: ${fullChainMismatch}`
    )


    // ==================================================
    // 10. ACCOUNT DATA SUMMARY
    // ==================================================

    printSection(
        "10. ACCOUNT DATA SUMMARY"
    )


    const summaryRows =
        accounts.map(account => {

            const accountUsers =
                users.filter(
                    user =>
                        user.accountId ===
                        account.id
                ).length


            const accountCustomers =
                customers.filter(
                    customer =>
                        customer.accountId ===
                        account.id
                ).length


            const accountOwners =
                owners.filter(
                    owner =>
                        owner.accountId ===
                        account.id
                ).length


            const accountProducts =
                products.filter(
                    product =>
                        product.accountId ===
                        account.id
                ).length


            const accountSales =
                sales.filter(
                    sale =>
                        sale.accountId ===
                        account.id
                )


            const accountExpenses =
                expenses.filter(
                    expense =>
                        expense.accountId ===
                        account.id
                )


            const salesAmount =
                accountSales.reduce(
                    (total, sale) =>
                        total +
                        num(sale.totalAmount),
                    0
                )


            const expensesAmount =
                accountExpenses.reduce(
                    (total, expense) =>
                        total +
                        num(expense.amount),
                    0
                )


            return {

                accountId:
                    account.id,

                accountName:
                    account.name,

                users:
                    accountUsers,

                customers:
                    accountCustomers,

                owners:
                    accountOwners,

                products:
                    accountProducts,

                sales:
                    accountSales.length,

                expenses:
                    accountExpenses.length,

                salesAmount:
                    Number(
                        salesAmount.toFixed(2)
                    ),

                expensesAmount:
                    Number(
                        expensesAmount.toFixed(2)
                    )

            }

        })


    console.table(summaryRows)


    // ==================================================
    // 11. FINAL CHECK
    // ==================================================

    printSection("FINAL CHECK")


    const finalResult = {

        usersWithoutAccount,

        customersWithoutAccount,

        ownersWithoutAccount,

        productsWithoutAccount,

        productOwnerMismatch,

        salesWithoutAccount,

        saleCreatorMismatch,

        saleCustomerMismatch,

        saleItemBrokenRelation,

        saleItemAccountMismatch,

        saleItemOwnerMismatch,

        expensesWithoutAccount,

        expenseSaleMismatch,

        expenseCreatorMismatch,

        expensesBrokenSale,

        fullChainMismatch

    }


    console.table(finalResult)


    // ==================================================
    // ERRORS
    // ==================================================

    if (errors.length > 0) {

        console.log("")
        console.log(
            "======================================================"
        )
        console.log(
            ` INTEGRITY CHECK FAILED - ${errors.length} ISSUE(S)`
        )
        console.log(
            "======================================================"
        )


        console.table(errors)


    }
    else {

        console.log("")
        console.log(
            "=============================================="
        )
        console.log(
            " ALL CUSTOMER FLOW INTEGRITY CHECKS PASSED"
        )
        console.log(
            " User → Account → Customer → Sale → SaleItem"
        )
        console.log(
            " → Product → Owner → Expense"
        )
        console.log(
            " No detected account mismatch."
        )
        console.log(
            "=============================================="
        )

    }

}


// ======================================================
// RUN
// ======================================================

main()

    .catch(error => {

        console.error("")
        console.error(
            "CUSTOMER FLOW CHECK ERROR:"
        )
        console.error(error)

        process.exitCode = 1

    })

    .finally(async () => {

        await prisma.$disconnect()

    })