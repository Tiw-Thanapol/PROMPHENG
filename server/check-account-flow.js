const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

// ======================================================
// CHECK ACCOUNT FLOW
// User → Account → Customer → Owner → Product
//       → Sale → SaleItem → Expense
//
// READ ONLY
// ไม่มี UPDATE / DELETE / INSERT
// ======================================================

async function main() {

    console.log("")
    console.log("======================================================")
    console.log(" ACCOUNT ISOLATION / DATA INTEGRITY CHECK")
    console.log("======================================================")
    console.log("")

    // ==================================================
    // 1. ACCOUNT
    // ==================================================

    console.log("------------------------------------------------------")
    console.log("1. ACCOUNTS")
    console.log("------------------------------------------------------")

    const accounts = await prisma.account.findMany({
        select: {
            id: true,
            name: true,
            createdAt: true
        },
        orderBy: {
            id: "asc"
        }
    })

    console.table(accounts.map(a => ({
        id: a.id,
        name: a.name,
        createdAt: a.createdAt
    })))

    console.log(`Total accounts: ${accounts.length}`)
    console.log("")


    // ==================================================
    // 2. USER → ACCOUNT
    // ==================================================

    console.log("------------------------------------------------------")
    console.log("2. USER → ACCOUNT")
    console.log("------------------------------------------------------")

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
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

    console.table(users.map(u => ({
        userId: u.id,
        email: u.email,
        role: u.role,
        accountId: u.accountId,
        accountExists: !!u.account,
        accountName: u.account?.name ?? null
    })))

    const usersWithoutAccount = users.filter(
        u => u.accountId === null || !u.account
    )

    if (usersWithoutAccount.length > 0) {

        console.log(
            `WARNING: ${usersWithoutAccount.length} user(s) have no valid account`
        )

        console.table(usersWithoutAccount.map(u => ({
            userId: u.id,
            email: u.email,
            role: u.role,
            accountId: u.accountId
        })))

    } else {

        console.log("OK: Every user has a valid account")

    }

    console.log("")


    // ==================================================
    // 3. CUSTOMER → ACCOUNT
    // ==================================================

    console.log("------------------------------------------------------")
    console.log("3. CUSTOMER → ACCOUNT")
    console.log("------------------------------------------------------")

    const customers = await prisma.customer.findMany({
        select: {
            id: true,
            name: true,
            phone: true,
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

    const customersWithoutAccount = customers.filter(
        c => c.accountId === null || !c.account
    )

    console.log(`Total customers: ${customers.length}`)
    console.log(
        `Customers without valid account: ${customersWithoutAccount.length}`
    )

    if (customersWithoutAccount.length > 0) {

        console.table(customersWithoutAccount.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            accountId: c.accountId
        })))

    }

    console.log("")


    // ==================================================
    // 4. OWNER → ACCOUNT
    // ==================================================

    console.log("------------------------------------------------------")
    console.log("4. OWNER → ACCOUNT")
    console.log("------------------------------------------------------")

    const owners = await prisma.owner.findMany({
        select: {
            id: true,
            name: true,
            phone: true,
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

    const ownersWithoutAccount = owners.filter(
        o => o.accountId === null || !o.account
    )

    console.log(`Total owners: ${owners.length}`)
    console.log(
        `Owners without valid account: ${ownersWithoutAccount.length}`
    )

    if (ownersWithoutAccount.length > 0) {

        console.table(ownersWithoutAccount.map(o => ({
            id: o.id,
            name: o.name,
            phone: o.phone,
            accountId: o.accountId
        })))

    }

    console.log("")


    // ==================================================
    // 5. CONSIGNMENT ITEM → ACCOUNT + OWNER
    // ==================================================

    console.log("------------------------------------------------------")
    console.log("5. CONSIGNMENT ITEM → ACCOUNT + OWNER")
    console.log("------------------------------------------------------")

    const items = await prisma.consignmentItem.findMany({
        select: {
            id: true,
            name: true,
            ownerId: true,
            accountId: true,
            quantity: true,
            status: true,

            account: {
                select: {
                    id: true,
                    name: true
                }
            },

            owner: {
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

    const itemsWithoutAccount = items.filter(
        item => item.accountId === null || !item.account
    )

    const itemsOwnerMismatch = items.filter(
        item =>
            item.accountId !== null &&
            item.owner?.accountId !== null &&
            item.accountId !== item.owner.accountId
    )

    console.log(`Total products: ${items.length}`)
    console.log(
        `Products without valid account: ${itemsWithoutAccount.length}`
    )
    console.log(
        `Products with OWNER ACCOUNT mismatch: ${itemsOwnerMismatch.length}`
    )

    if (itemsWithoutAccount.length > 0) {

        console.log("")
        console.log("PRODUCTS WITHOUT VALID ACCOUNT:")

        console.table(itemsWithoutAccount.map(item => ({
            itemId: item.id,
            name: item.name,
            ownerId: item.ownerId,
            accountId: item.accountId,
            ownerAccountId: item.owner?.accountId ?? null
        })))

    }

    if (itemsOwnerMismatch.length > 0) {

        console.log("")
        console.log("!!! PRODUCT / OWNER ACCOUNT MISMATCH !!!")

        console.table(itemsOwnerMismatch.map(item => ({
            itemId: item.id,
            name: item.name,
            itemAccountId: item.accountId,
            ownerId: item.ownerId,
            ownerAccountId: item.owner?.accountId ?? null
        })))

    }

    console.log("")


    // ==================================================
    // 6. SALE → ACCOUNT + USER + CUSTOMER
    // ==================================================

    console.log("------------------------------------------------------")
    console.log("6. SALE → ACCOUNT + USER + CUSTOMER")
    console.log("------------------------------------------------------")

    const sales = await prisma.sale.findMany({
        select: {
            id: true,
            accountId: true,
            customerId: true,
            createdById: true,
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

    const salesWithoutAccount = sales.filter(
        sale => sale.accountId === null || !sale.account
    )

    const saleCreatorMismatch = sales.filter(
        sale =>
            sale.accountId !== null &&
            sale.createdBy?.accountId !== null &&
            sale.accountId !== sale.createdBy.accountId
    )

    const saleCustomerMismatch = sales.filter(
        sale =>
            sale.customer &&
            sale.accountId !== null &&
            sale.customer.accountId !== null &&
            sale.accountId !== sale.customer.accountId
    )

    console.log(`Total sales: ${sales.length}`)
    console.log(
        `Sales without valid account: ${salesWithoutAccount.length}`
    )
    console.log(
        `Sale / creator account mismatch: ${saleCreatorMismatch.length}`
    )
    console.log(
        `Sale / customer account mismatch: ${saleCustomerMismatch.length}`
    )

    if (salesWithoutAccount.length > 0) {

        console.log("")
        console.log("SALES WITHOUT VALID ACCOUNT:")

        console.table(salesWithoutAccount.map(sale => ({
            saleId: sale.id,
            accountId: sale.accountId,
            createdById: sale.createdById,
            customerId: sale.customerId,
            totalAmount: Number(sale.totalAmount),
            status: sale.status
        })))

    }

    if (saleCreatorMismatch.length > 0) {

        console.log("")
        console.log("!!! SALE / CREATOR ACCOUNT MISMATCH !!!")

        console.table(saleCreatorMismatch.map(sale => ({
            saleId: sale.id,
            saleAccountId: sale.accountId,
            createdById: sale.createdById,
            creatorAccountId: sale.createdBy?.accountId ?? null,
            creatorEmail: sale.createdBy?.email ?? null
        })))

    }

    if (saleCustomerMismatch.length > 0) {

        console.log("")
        console.log("!!! SALE / CUSTOMER ACCOUNT MISMATCH !!!")

        console.table(saleCustomerMismatch.map(sale => ({
            saleId: sale.id,
            saleAccountId: sale.accountId,
            customerId: sale.customerId,
            customerAccountId: sale.customer?.accountId ?? null,
            customerName: sale.customer?.name ?? null
        })))

    }

    console.log("")


    // ==================================================
    // 7. SALE ITEM → SALE + PRODUCT
    // ==================================================

    console.log("------------------------------------------------------")
    console.log("7. SALE ITEM → SALE + PRODUCT")
    console.log("------------------------------------------------------")

    const saleItems = await prisma.saleItem.findMany({
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
                    ownerId: true
                }
            }
        },
        orderBy: {
            id: "asc"
        }
    })

    const saleItemsBrokenRelation = saleItems.filter(
        item =>
            !item.sale ||
            !item.consignmentItem
    )

    const saleItemAccountMismatch = saleItems.filter(
        item =>
            item.sale &&
            item.consignmentItem &&
            item.sale.accountId !== item.consignmentItem.accountId
    )

    console.log(`Total sale items: ${saleItems.length}`)
    console.log(
        `SaleItems with broken relation: ${saleItemsBrokenRelation.length}`
    )
    console.log(
        `SaleItem SALE / PRODUCT account mismatch: ${saleItemAccountMismatch.length}`
    )

    if (saleItemsBrokenRelation.length > 0) {

        console.log("")
        console.log("!!! BROKEN SALE ITEM RELATION !!!")

        console.table(saleItemsBrokenRelation.map(item => ({
            saleItemId: item.id,
            saleId: item.saleId,
            productId: item.consignmentItemId,
            saleExists: !!item.sale,
            productExists: !!item.consignmentItem
        })))

    }

    if (saleItemAccountMismatch.length > 0) {

        console.log("")
        console.log("!!! SALE ITEM ACCOUNT MISMATCH !!!")

        console.table(saleItemAccountMismatch.map(item => ({
            saleItemId: item.id,
            saleId: item.saleId,
            saleAccountId: item.sale?.accountId ?? null,
            productId: item.consignmentItemId,
            productName: item.consignmentItem?.name ?? null,
            productAccountId: item.consignmentItem?.accountId ?? null
        })))

    }

    console.log("")


    // ==================================================
    // 8. EXPENSE → ACCOUNT + SALE
    // ==================================================

    console.log("------------------------------------------------------")
    console.log("8. EXPENSE → ACCOUNT + SALE")
    console.log("------------------------------------------------------")

    const expenses = await prisma.expense.findMany({
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

    const expensesWithoutAccount = expenses.filter(
        expense =>
            expense.accountId === null ||
            !expense.account
    )

    const expenseSaleMismatch = expenses.filter(
        expense =>
            expense.sale &&
            expense.accountId !== expense.sale.accountId
    )

    const expenseCreatorMismatch = expenses.filter(
        expense =>
            expense.createdBy &&
            expense.accountId !== expense.createdBy.accountId
    )

    const expensesWithBrokenSale = expenses.filter(
        expense =>
            expense.saleId !== null &&
            !expense.sale
    )

    console.log(`Total expenses: ${expenses.length}`)
    console.log(
        `Expenses without valid account: ${expensesWithoutAccount.length}`
    )
    console.log(
        `Expense / sale account mismatch: ${expenseSaleMismatch.length}`
    )
    console.log(
        `Expense / creator account mismatch: ${expenseCreatorMismatch.length}`
    )
    console.log(
        `Expenses with broken sale relation: ${expensesWithBrokenSale.length}`
    )

    if (expensesWithoutAccount.length > 0) {

        console.log("")
        console.log("EXPENSES WITHOUT VALID ACCOUNT:")

        console.table(expensesWithoutAccount.map(expense => ({
            id: expense.id,
            name: expense.name,
            accountId: expense.accountId,
            saleId: expense.saleId,
            createdById: expense.createdById,
            amount: Number(expense.amount),
            category: expense.category
        })))

    }

    if (expenseSaleMismatch.length > 0) {

        console.log("")
        console.log("!!! EXPENSE / SALE ACCOUNT MISMATCH !!!")

        console.table(expenseSaleMismatch.map(expense => ({
            expenseId: expense.id,
            expenseAccountId: expense.accountId,
            saleId: expense.saleId,
            saleAccountId: expense.sale?.accountId ?? null,
            amount: Number(expense.amount),
            category: expense.category
        })))

    }

    if (expenseCreatorMismatch.length > 0) {

        console.log("")
        console.log("!!! EXPENSE / CREATOR ACCOUNT MISMATCH !!!")

        console.table(expenseCreatorMismatch.map(expense => ({
            expenseId: expense.id,
            expenseAccountId: expense.accountId,
            createdById: expense.createdById,
            creatorAccountId: expense.createdBy?.accountId ?? null,
            creatorEmail: expense.createdBy?.email ?? null
        })))

    }

    if (expensesWithBrokenSale.length > 0) {

        console.log("")
        console.log("!!! EXPENSE HAS BROKEN SALE RELATION !!!")

        console.table(expensesWithBrokenSale.map(expense => ({
            expenseId: expense.id,
            saleId: expense.saleId,
            accountId: expense.accountId,
            name: expense.name
        })))

    }

    console.log("")


    // ==================================================
    // 9. ACCOUNT SUMMARY
    // ==================================================

    console.log("------------------------------------------------------")
    console.log("9. ACCOUNT DATA SUMMARY")
    console.log("------------------------------------------------------")

    const summary = []

    for (const account of accounts) {

        const accountUsers = users.filter(
            u => u.accountId === account.id
        )

        const accountCustomers = customers.filter(
            c => c.accountId === account.id
        )

        const accountOwners = owners.filter(
            o => o.accountId === account.id
        )

        const accountItems = items.filter(
            item => item.accountId === account.id
        )

        const accountSales = sales.filter(
            sale => sale.accountId === account.id
        )

        const accountExpenses = expenses.filter(
            expense => expense.accountId === account.id
        )

        summary.push({

            accountId: account.id,

            accountName: account.name,

            users: accountUsers.length,

            customers: accountCustomers.length,

            owners: accountOwners.length,

            products: accountItems.length,

            sales: accountSales.length,

            expenses: accountExpenses.length,

            salesAmount: accountSales.reduce(
                (sum, sale) =>
                    sum + Number(sale.totalAmount || 0),
                0
            ),

            expensesAmount: accountExpenses.reduce(
                (sum, expense) =>
                    sum + Number(expense.amount || 0),
                0
            )

        })

    }

    console.table(summary)

    console.log("")


    // ==================================================
    // 10. GLOBAL PROBLEM SUMMARY
    // ==================================================

    console.log("======================================================")
    console.log(" FINAL CHECK")
    console.log("======================================================")

    const problems = {

        usersWithoutAccount:
            usersWithoutAccount.length,

        customersWithoutAccount:
            customersWithoutAccount.length,

        ownersWithoutAccount:
            ownersWithoutAccount.length,

        itemsWithoutAccount:
            itemsWithoutAccount.length,

        itemOwnerMismatch:
            itemsOwnerMismatch.length,

        salesWithoutAccount:
            salesWithoutAccount.length,

        saleCreatorMismatch:
            saleCreatorMismatch.length,

        saleCustomerMismatch:
            saleCustomerMismatch.length,

        saleItemBrokenRelation:
            saleItemsBrokenRelation.length,

        saleItemAccountMismatch:
            saleItemAccountMismatch.length,

        expensesWithoutAccount:
            expensesWithoutAccount.length,

        expenseSaleMismatch:
            expenseSaleMismatch.length,

        expenseCreatorMismatch:
            expenseCreatorMismatch.length,

        expensesWithBrokenSale:
            expensesWithBrokenSale.length

    }

    console.table(problems)

    const totalProblems = Object.values(problems)
        .reduce((sum, value) => sum + value, 0)

    console.log("")

    if (totalProblems === 0) {

        console.log("==============================================")
        console.log(" ALL ACCOUNT INTEGRITY CHECKS PASSED")
        console.log(" No detected account mismatch.")
        console.log("==============================================")

    } else {

        console.log("==============================================")
        console.log(` FOUND ${totalProblems} POTENTIAL DATA PROBLEM(S)`)
        console.log(" DO NOT UPDATE OR DELETE DATA YET.")
        console.log("==============================================")

    }

    console.log("")

}


// ======================================================
// RUN
// ======================================================

main()
    .catch(error => {

        console.error("")
        console.error("CHECK FAILED")
        console.error(error)
        console.error("")

        process.exitCode = 1

    })
    .finally(async () => {

        await prisma.$disconnect()

    })