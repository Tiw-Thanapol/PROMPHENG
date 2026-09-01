const prisma = require('../config/prisma')
const { Prisma } = require('@prisma/client')


// ======================================================
// ACCOUNT HELPER
// ======================================================
//
// เช็คว่า user ที่ login อยู่มี accountId ผูกอยู่ก่อนเสมอ
// ไม่งั้นห้าม query/เขียนข้อมูลใดๆ เพราะไม่รู้จะ scope
// เข้า account ไหน
// ======================================================

function getAccountId(req) {

    const accountId =
        Number(
            req.user?.accountId
        )

    if (
        !Number.isInteger(accountId) ||
        accountId <= 0
    ) {

        return null

    }

    return accountId

}


// ======================================================
// CREATE EXPENSE
// POST /api/expenses
// ======================================================

exports.create = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: 'ไม่พบ account ของผู้ใช้งาน'
            })
        }


        const {
            name,
            category,
            amount,
            note,
            saleId
        } = req.body


        // ==================================================
        // VALIDATE
        // ==================================================

        if (!name || !name.trim()) {

            return res.status(400).json({
                message: 'Expense name is required'
            })
        }


        if (!category || !category.trim()) {

            return res.status(400).json({
                message: 'Expense category is required'
            })
        }


        const expenseAmount = Number(amount)


        if (
            amount === undefined ||
            amount === null ||
            Number.isNaN(expenseAmount) ||
            expenseAmount < 0
        ) {

            return res.status(400).json({
                message: 'Valid expense amount is required'
            })
        }


        // ==================================================
        // CHECK SALE
        // scoped ด้วย accountId กันผูก expense เข้ากับ
        // Sale ของ account อื่น
        // ==================================================

        let sale = null

        if (
            saleId !== undefined &&
            saleId !== null &&
            saleId !== ''
        ) {

            sale = await prisma.sale.findFirst({

                where: {
                    id: Number(saleId),
                    accountId
                }
            })


            if (!sale) {

                return res.status(404).json({
                    message: 'Sale not found'
                })
            }
        }


        // ==================================================
        // CREATE
        // ==================================================

        const expense = await prisma.expense.create({

            data: {

                accountId,

                name: name.trim(),

                category: category.trim(),

                amount: new Prisma.Decimal(
                    expenseAmount.toFixed(2)
                ),

                note: note || null,

                saleId:
                    sale
                        ? sale.id
                        : null,

                createdById: req.user.id
            }
        })


        // ==================================================
        // AUDIT LOG
        // ==================================================

        await prisma.auditLog.create({

            data: {

                userId: req.user.id,

                action: 'CREATE',

                entity: 'Expense',

                entityId: expense.id,

                details: JSON.stringify({
                    name: expense.name,
                    category: expense.category,
                    amount: expense.amount.toString(),
                    saleId: expense.saleId
                })
            }
        })


        // ==================================================
        // RESPONSE
        // ==================================================

        res.status(201).json({

            message: 'Expense created successfully',

            expense: {

                ...expense,

                amount:
                    Number(expense.amount)
            }
        })


    } catch (err) {

        console.log(err)

        res.status(500).json({
            message: 'Server Error'
        })
    }
}



// ======================================================
// GET ALL EXPENSES
// GET /api/expenses
// ======================================================

exports.list = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: 'ไม่พบ account ของผู้ใช้งาน'
            })
        }


        const expenses =
            await prisma.expense.findMany({

                where: {

                    accountId
                },

                include: {

                    createdBy: {

                        select: {

                            id: true,
                            name: true,
                            email: true
                        }
                    },

                    sale: {

                        select: {

                            id: true,
                            totalAmount: true,
                            createdAt: true
                        }
                    }
                },

                orderBy: {

                    createdAt: 'desc'
                }
            })


        res.json({

            count: expenses.length,

            expenses: expenses.map(expense => ({

                id: expense.id,

                name: expense.name,

                category: expense.category,

                amount:
                    Number(expense.amount),

                note: expense.note,

                saleId: expense.saleId,

                createdBy:
                    expense.createdBy,

                sale:
                    expense.sale,

                createdAt:
                    expense.createdAt,

                updatedAt:
                    expense.updatedAt
            }))
        })


    } catch (err) {

        console.log(err)

        res.status(500).json({
            message: 'Server Error'
        })
    }
}



// ======================================================
// GET EXPENSE BY ID
// GET /api/expenses/:id
// ======================================================

exports.read = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: 'ไม่พบ account ของผู้ใช้งาน'
            })
        }


        const id = Number(req.params.id)


        if (Number.isNaN(id)) {

            return res.status(400).json({
                message: 'Invalid expense id'
            })
        }


        // ==================================================
        // ใช้ findFirst + accountId แทน findUnique({ id })
        // เพื่อกันดึงข้อมูลข้าม account
        // ==================================================

        const expense =
            await prisma.expense.findFirst({

                where: {
                    id,
                    accountId
                },

                include: {

                    createdBy: {

                        select: {

                            id: true,
                            name: true,
                            email: true
                        }
                    },

                    sale: {

                        select: {

                            id: true,
                            totalAmount: true,
                            createdAt: true
                        }
                    }
                }
            })


        if (!expense) {

            return res.status(404).json({
                message: 'Expense not found'
            })
        }


        res.json({

            expense: {

                ...expense,

                amount:
                    Number(expense.amount),

                sale: expense.sale
                    ? {
                        ...expense.sale,
                        totalAmount:
                            Number(expense.sale.totalAmount)
                    }
                    : null
            }
        })


    } catch (err) {

        console.log(err)

        res.status(500).json({
            message: 'Server Error'
        })
    }
}



// ======================================================
// UPDATE EXPENSE
// PUT /api/expenses/:id
// ======================================================

exports.update = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: 'ไม่พบ account ของผู้ใช้งาน'
            })
        }


        const id = Number(req.params.id)


        if (Number.isNaN(id)) {

            return res.status(400).json({
                message: 'Invalid expense id'
            })
        }


        // ==================================================
        // scoped ด้วย accountId กันแก้ข้าม account
        // ==================================================

        const oldExpense =
            await prisma.expense.findFirst({

                where: {
                    id,
                    accountId
                }
            })


        if (!oldExpense) {

            return res.status(404).json({
                message: 'Expense not found'
            })
        }


        const {
            name,
            category,
            amount,
            note,
            saleId
        } = req.body


        // ==================================================
        // VALIDATE NAME
        // ==================================================

        if (
            name !== undefined &&
            !String(name).trim()
        ) {

            return res.status(400).json({
                message: 'Expense name cannot be empty'
            })
        }


        // ==================================================
        // VALIDATE CATEGORY
        // ==================================================

        if (
            category !== undefined &&
            !String(category).trim()
        ) {

            return res.status(400).json({
                message: 'Expense category cannot be empty'
            })
        }


        // ==================================================
        // VALIDATE AMOUNT
        // ==================================================

        let newAmount = oldExpense.amount


        if (amount !== undefined) {

            const parsedAmount =
                Number(amount)


            if (
                Number.isNaN(parsedAmount) ||
                parsedAmount < 0
            ) {

                return res.status(400).json({
                    message: 'Invalid expense amount'
                })
            }


            newAmount =
                new Prisma.Decimal(
                    parsedAmount.toFixed(2)
                )
        }


        // ==================================================
        // VALIDATE SALE
        // scoped ด้วย accountId กันผูก expense เข้ากับ
        // Sale ของ account อื่น
        // ==================================================

        let newSaleId =
            oldExpense.saleId


        if (saleId !== undefined) {

            if (
                saleId === null ||
                saleId === ''
            ) {

                newSaleId = null

            } else {

                const sale =
                    await prisma.sale.findFirst({

                        where: {
                            id: Number(saleId),
                            accountId
                        }
                    })


                if (!sale) {

                    return res.status(404).json({
                        message: 'Sale not found'
                    })
                }


                newSaleId = sale.id
            }
        }


        // ==================================================
        // UPDATE
        // where ใช้ id ของ record ที่ผ่านการเช็ค accountId แล้ว
        // ==================================================

        const expense =
            await prisma.expense.update({

                where: {
                    id: oldExpense.id
                },

                data: {

                    ...(name !== undefined && {

                        name:
                            String(name).trim()
                    }),

                    ...(category !== undefined && {

                        category:
                            String(category).trim()
                    }),

                    amount:
                        newAmount,

                    ...(note !== undefined && {

                        note:
                            note || null
                    }),

                    saleId:
                        newSaleId
                }
            })


        // ==================================================
        // AUDIT
        // ==================================================

        await prisma.auditLog.create({

            data: {

                userId: req.user.id,

                action: 'UPDATE',

                entity: 'Expense',

                entityId: expense.id,

                details: JSON.stringify({

                    before: {

                        name:
                            oldExpense.name,

                        category:
                            oldExpense.category,

                        amount:
                            oldExpense.amount.toString(),

                        note:
                            oldExpense.note,

                        saleId:
                            oldExpense.saleId
                    },

                    after: {

                        name:
                            expense.name,

                        category:
                            expense.category,

                        amount:
                            expense.amount.toString(),

                        note:
                            expense.note,

                        saleId:
                            expense.saleId
                    }
                })
            }
        })


        res.json({

            message:
                'Expense updated successfully',

            expense: {

                ...expense,

                amount:
                    Number(expense.amount)
            }
        })


    } catch (err) {

        console.log(err)

        res.status(500).json({
            message: 'Server Error'
        })
    }
}



// ======================================================
// DELETE EXPENSE
// DELETE /api/expenses/:id
// ======================================================

exports.remove = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: 'ไม่พบ account ของผู้ใช้งาน'
            })
        }


        const id =
            Number(req.params.id)


        if (Number.isNaN(id)) {

            return res.status(400).json({
                message: 'Invalid expense id'
            })
        }


        // ==================================================
        // scoped ด้วย accountId กันลบข้าม account
        // ==================================================

        const expense =
            await prisma.expense.findFirst({

                where: {
                    id,
                    accountId
                }
            })


        if (!expense) {

            return res.status(404).json({
                message: 'Expense not found'
            })
        }


        // ==================================================
        // DELETE
        // ==================================================

        await prisma.expense.delete({

            where: {
                id: expense.id
            }
        })


        // ==================================================
        // AUDIT
        // ==================================================

        await prisma.auditLog.create({

            data: {

                userId: req.user.id,

                action: 'DELETE',

                entity: 'Expense',

                entityId: id,

                details: JSON.stringify({

                    name:
                        expense.name,

                    category:
                        expense.category,

                    amount:
                        expense.amount.toString(),

                    saleId:
                        expense.saleId
                })
            }
        })


        res.json({

            message:
                'Expense deleted successfully'
        })


    } catch (err) {

        console.log(err)

        res.status(500).json({
            message: 'Server Error'
        })
    }
}