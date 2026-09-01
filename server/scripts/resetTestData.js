const prisma = require("../config/prisma");

async function resetTestData() {

    console.log("====================================");
    console.log("RESET TEST DATA");
    console.log("====================================");

    try {

        // ==========================================
        // 1. Return
        // ==========================================

        const deletedReturns =
            await prisma.return.deleteMany({});

        console.log(
            `Returns deleted: ${deletedReturns.count}`
        );


        // ==========================================
        // 2. SaleItem
        // ==========================================

        const deletedSaleItems =
            await prisma.saleItem.deleteMany({});

        console.log(
            `SaleItems deleted: ${deletedSaleItems.count}`
        );


        // ==========================================
        // 3. Expense
        // ==========================================

        const deletedExpenses =
            await prisma.expense.deleteMany({});

        console.log(
            `Expenses deleted: ${deletedExpenses.count}`
        );


        // ==========================================
        // 4. Sale
        // ==========================================

        const deletedSales =
            await prisma.sale.deleteMany({});

        console.log(
            `Sales deleted: ${deletedSales.count}`
        );


        // ==========================================
        // 5. OwnerPayment
        // ==========================================

        const deletedOwnerPayments =
            await prisma.ownerPayment.deleteMany({});

        console.log(
            `OwnerPayments deleted: ${deletedOwnerPayments.count}`
        );


        // ==========================================
        // 6. ConsignmentItem
        // ==========================================

        const deletedItems =
            await prisma.consignmentItem.deleteMany({});

        console.log(
            `ConsignmentItems deleted: ${deletedItems.count}`
        );


        // ==========================================
        // 7. Customer
        // ==========================================

        const deletedCustomers =
            await prisma.customer.deleteMany({});

        console.log(
            `Customers deleted: ${deletedCustomers.count}`
        );


        // ==========================================
        // DONE
        // ==========================================

        console.log("");
        console.log("====================================");
        console.log("TEST DATA RESET COMPLETE");
        console.log("====================================");

    } catch (error) {

        console.error("");
        console.error("RESET TEST DATA FAILED");
        console.error(error);

        process.exitCode = 1;

    } finally {

        await prisma.$disconnect();

    }

}


resetTestData();