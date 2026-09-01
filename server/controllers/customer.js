const prisma = require("../config/prisma")


// ======================================================
// HELPERS
// ======================================================

function clean(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return null
    }

    const result =
        String(value).trim()

    return result || null
}


function num(value) {

    const n = Number(value)

    return Number.isFinite(n)
        ? n
        : 0
}


function money(value) {

    return Number(
        num(value).toFixed(2)
    )
}


function parseId(value) {

    const id =
        Number(value)

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        return null
    }

    return id
}


// ======================================================
// CUSTOMER CODE FORMAT
//
// C + เลข 5 หลัก เช่น C00001, C00002 ...
//
// เลขลำดับมาจาก AccountCounter แยกตาม account
// ไม่ใช้ Customer.id เพราะ id เป็น global primary key
// ======================================================

function generateCustomerCode(customerNumber) {

    return `C${String(customerNumber).padStart(5, "0")}`

}


// ======================================================
// DERIVE CUSTOMER NUMBER
//
// Prisma Customer model ปัจจุบันไม่มี customerNumber
// จึง derive จาก customerCode แทน
//
// C00001 -> 1
// C00125 -> 125
// ======================================================

function getCustomerNumber(customerCode) {

    if (!customerCode) {
        return null
    }

    const match =
        String(customerCode).match(/^C(\d+)$/i)

    if (!match) {
        return null
    }

    const number =
        Number(match[1])

    return Number.isFinite(number)
        ? number
        : null
}


// ------------------------------------------------------
// Require Account
// ------------------------------------------------------
//
// ทุก endpoint ในไฟล์นี้ต้องมี req.user.accountId
// เพื่อป้องกันข้อมูลข้าม account
//
// ------------------------------------------------------

function requireAccountId(req, res) {

    const accountId =
        req.user?.accountId


    if (
        !Number.isInteger(accountId) ||
        accountId <= 0
    ) {

        res.status(403).json({

            message:
                "This user is not linked to any account"

        })

        return null

    }


    return accountId

}


// ======================================================
// ACCOUNT COUNTER HELPER
// ======================================================
//
// ดึงเลขลำดับถัดไปแบบ atomic ต่อ account/ต่อ type
//
// เช่น
// account 1 + CUSTOMER -> 1, 2, 3...
// account 2 + CUSTOMER -> 1, 2, 3...
//
// ต้องเรียกภายใน prisma.$transaction เท่านั้น
// ======================================================

async function getNextAccountSequence(
    tx,
    accountId,
    type
) {

    const counter =
        await tx.accountCounter.upsert({

            where: {

                accountId_type: {
                    accountId,
                    type
                }

            },

            create: {

                accountId,
                type,
                value: 1

            },

            update: {

                value: {
                    increment: 1
                }

            }

        })


    return counter.value

}


// ======================================================
// CUSTOMER SELECT
// ======================================================
//
// IMPORTANT:
// Customer model ใน Prisma ปัจจุบันไม่มี customerNumber
// ดังนั้นห้าม select customerNumber
//
// customerNumber จะ derive จาก customerCode ตอน response
// หาก frontend ต้องการ field นี้
// ======================================================

const customerSelect = {

    id: true,

    customerCode: true,

    name: true,

    phone: true,

    address: true,

    note: true,

    createdAt: true,

    updatedAt: true

}


// ======================================================
// ADD CUSTOMER NUMBER TO RESPONSE
// ======================================================
//
// รักษา API contract เดิมโดยเติม customerNumber
// จาก customerCode เช่น C00015 -> 15
// ======================================================

function formatCustomer(customer) {

    if (!customer) {
        return customer
    }


    return {

        ...customer,

        customerNumber:
            getCustomerNumber(
                customer.customerCode
            )

    }

}


// ======================================================
// CREATE CUSTOMER
// POST /api/customers
// ======================================================

exports.create = async (req, res) => {

    try {

        const accountId =
            requireAccountId(req, res)

        if (!accountId) {
            return
        }


        const {
            name,
            phone,
            address,
            note
        } = req.body


        const cleanName =
            clean(name)

        const cleanPhone =
            clean(phone)

        const cleanAddress =
            clean(address)

        const cleanNote =
            clean(note)


        if (!cleanName) {

            return res.status(400).json({

                message:
                    "Customer name is required"

            })

        }


        // ==================================================
        // DUPLICATE CHECK
        // ==================================================

        const existing =
            await prisma.customer.findFirst({

                where: {

                    accountId,

                    name:
                        cleanName,

                    phone:
                        cleanPhone,

                    address:
                        cleanAddress

                }

            })


        if (existing) {

            return res.status(409).json({

                message:
                    "Customer already exists",

                customer:
                    formatCustomer(existing)

            })

        }


        // ==================================================
        // CREATE + NUMBER + CODE + AUDIT
        // ==================================================

        const customer =
            await prisma.$transaction(
                async tx => {

                    const nextCustomerNumber =
                        await getNextAccountSequence(
                            tx,
                            accountId,
                            "CUSTOMER"
                        )


                    const customerCode =
                        generateCustomerCode(
                            nextCustomerNumber
                        )


                    const created =
                        await tx.customer.create({

                            data: {

                                accountId,

                                name:
                                    cleanName,

                                phone:
                                    cleanPhone,

                                address:
                                    cleanAddress,

                                note:
                                    cleanNote,

                                customerCode

                            },

                            select:
                                customerSelect

                        })


                    // ======================================
                    // AUDIT
                    // ======================================

                    try {

                        await tx.auditLog.create({

                            data: {

                                userId:
                                    req.user?.id || null,

                                action:
                                    "CREATE",

                                entity:
                                    "Customer",

                                entityId:
                                    created.id,

                                details:
                                    JSON.stringify({

                                        customerNumber:
                                            nextCustomerNumber,

                                        customerCode:
                                            created.customerCode,

                                        name:
                                            created.name,

                                        phone:
                                            created.phone,

                                        address:
                                            created.address,

                                        note:
                                            created.note

                                    })

                            }

                        })

                    } catch (auditError) {

                        console.error(
                            "CUSTOMER CREATE AUDIT ERROR:",
                            auditError
                        )

                    }


                    return created

                }
            )


        return res.status(201).json({

            message:
                "Customer created successfully",

            customer:
                formatCustomer(customer)

        })

    } catch (error) {

        console.error(
            "CREATE CUSTOMER ERROR:",
            error
        )

        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}


// ======================================================
// LIST CUSTOMERS
// GET /api/customers
// ======================================================

exports.list = async (req, res) => {

    try {

        const accountId =
            requireAccountId(req, res)

        if (!accountId) {
            return
        }


        const search =
            clean(req.query.search)


        const where = {

            accountId,

            ...(search
                ? {
                    OR: [

                        {
                            name: {
                                contains:
                                    search,

                                mode:
                                    "insensitive"
                            }
                        },

                        {
                            phone: {
                                contains:
                                    search,

                                mode:
                                    "insensitive"
                            }
                        },

                        {
                            customerCode: {
                                contains:
                                    search,

                                mode:
                                    "insensitive"
                            }
                        }

                    ]
                }
                : {})

        }


        const customers =
            await prisma.customer.findMany({

                where,

                select:
                    customerSelect,

                orderBy: {

                    id:
                        "desc"

                }

            })


        return res.json({

            count:
                customers.length,

            customers:
                customers.map(
                    formatCustomer
                )

        })

    } catch (error) {

        console.error(
            "LIST CUSTOMER ERROR:",
            error
        )

        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}


// ======================================================
// READ CUSTOMER
// GET /api/customers/:id
// ======================================================

exports.read = async (req, res) => {

    try {

        const accountId =
            requireAccountId(req, res)

        if (!accountId) {
            return
        }


        const id =
            parseId(
                req.params.id
            )


        if (!id) {

            return res.status(400).json({

                message:
                    "Invalid customer id"

            })

        }


        const customer =
            await prisma.customer.findFirst({

                where: {

                    id,
                    accountId

                },

                select:
                    customerSelect

            })


        if (!customer) {

            return res.status(404).json({

                message:
                    "Customer not found"

            })

        }


        return res.json({

            customer:
                formatCustomer(customer),

            sales: []

        })

    } catch (error) {

        console.error(
            "READ CUSTOMER ERROR:",
            error
        )

        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}


// ======================================================
// UPDATE CUSTOMER
// PUT /api/customers/:id
// ======================================================

exports.update = async (req, res) => {

    try {

        const accountId =
            requireAccountId(req, res)

        if (!accountId) {
            return
        }


        const id =
            parseId(
                req.params.id
            )


        if (!id) {

            return res.status(400).json({

                message:
                    "Invalid customer id"

            })

        }


        const oldCustomer =
            await prisma.customer.findFirst({

                where: {

                    id,
                    accountId

                }

            })


        if (!oldCustomer) {

            return res.status(404).json({

                message:
                    "Customer not found"

            })

        }


        const {
            name,
            phone,
            address,
            note
        } = req.body


        const newName =
            name !== undefined
                ? clean(name)
                : oldCustomer.name


        const newPhone =
            phone !== undefined
                ? clean(phone)
                : oldCustomer.phone


        const newAddress =
            address !== undefined
                ? clean(address)
                : oldCustomer.address


        const newNote =
            note !== undefined
                ? clean(note)
                : oldCustomer.note


        if (!newName) {

            return res.status(400).json({

                message:
                    "Customer name cannot be empty"

            })

        }


        // ==================================================
        // DUPLICATE CHECK
        // ==================================================

        const duplicate =
            await prisma.customer.findFirst({

                where: {

                    accountId,

                    name:
                        newName,

                    phone:
                        newPhone,

                    address:
                        newAddress,

                    NOT: {

                        id

                    }

                }

            })


        if (duplicate) {

            return res.status(409).json({

                message:
                    "Customer already exists",

                customer:
                    formatCustomer(duplicate)

            })

        }


        // ==================================================
        // UPDATE
        // ==================================================

        const updateResult =
            await prisma.customer.updateMany({

                where: {

                    id,
                    accountId

                },

                data: {

                    name:
                        newName,

                    phone:
                        newPhone,

                    address:
                        newAddress,

                    note:
                        newNote

                }

            })


        if (updateResult.count === 0) {

            return res.status(404).json({

                message:
                    "Customer not found"

            })

        }


        const customer =
            await prisma.customer.findFirst({

                where: {

                    id,
                    accountId

                },

                select:
                    customerSelect

            })


        // ==================================================
        // AUDIT
        // ==================================================

        if (req.user?.id) {

            try {

                await prisma.auditLog.create({

                    data: {

                        userId:
                            req.user.id,

                        action:
                            "UPDATE",

                        entity:
                            "Customer",

                        entityId:
                            customer.id,

                        details:
                            JSON.stringify({

                                before: {

                                    customerCode:
                                        oldCustomer.customerCode,

                                    name:
                                        oldCustomer.name,

                                    phone:
                                        oldCustomer.phone,

                                    address:
                                        oldCustomer.address,

                                    note:
                                        oldCustomer.note

                                },

                                after: {

                                    customerCode:
                                        customer.customerCode,

                                    name:
                                        customer.name,

                                    phone:
                                        customer.phone,

                                    address:
                                        customer.address,

                                    note:
                                        customer.note

                                }

                            })

                    }

                })

            } catch (auditError) {

                console.error(
                    "CUSTOMER UPDATE AUDIT ERROR:",
                    auditError
                )

            }

        }


        return res.json({

            message:
                "Customer updated successfully",

            customer:
                formatCustomer(customer)

        })

    } catch (error) {

        console.error(
            "UPDATE CUSTOMER ERROR:",
            error
        )

        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}


// ======================================================
// DELETE CUSTOMER
// DELETE /api/customers/:id
// ======================================================

exports.remove = async (req, res) => {

    try {

        const accountId =
            requireAccountId(req, res)

        if (!accountId) {
            return
        }


        const id =
            parseId(
                req.params.id
            )


        if (!id) {

            return res.status(400).json({

                message:
                    "Invalid customer id"

            })

        }


        const customer =
            await prisma.customer.findFirst({

                where: {

                    id,
                    accountId

                },

                include: {

                    _count: {

                        select: {

                            sales:
                                true

                        }

                    }

                }

            })


        if (!customer) {

            return res.status(404).json({

                message:
                    "Customer not found"

            })

        }


        if (
            customer._count.sales > 0
        ) {

            return res.status(409).json({

                message:
                    "Customer has sales history and cannot be deleted",

                salesCount:
                    customer._count.sales

            })

        }


        await prisma.$transaction(
            async tx => {

                await tx.customer.deleteMany({

                    where: {

                        id,
                        accountId

                    }

                })


                // ==========================================
                // AUDIT
                // ==========================================

                if (req.user?.id) {

                    try {

                        await tx.auditLog.create({

                            data: {

                                userId:
                                    req.user.id,

                                action:
                                    "DELETE",

                                entity:
                                    "Customer",

                                entityId:
                                    id,

                                details:
                                    JSON.stringify({

                                        customerCode:
                                            customer.customerCode,

                                        name:
                                            customer.name,

                                        phone:
                                            customer.phone,

                                        address:
                                            customer.address,

                                        note:
                                            customer.note

                                    })

                            }

                        })

                    } catch (auditError) {

                        console.error(
                            "CUSTOMER DELETE AUDIT ERROR:",
                            auditError
                        )

                    }

                }

            }
        )


        return res.json({

            message:
                "Customer deleted"

        })

    } catch (error) {

        console.error(
            "DELETE CUSTOMER ERROR:",
            error

        )

        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}


// ======================================================
// CUSTOMER PURCHASE HISTORY
// GET /api/customers/:id/history
// ======================================================

exports.getCustomerHistory =
async (req, res) => {

    try {

        const accountId =
            requireAccountId(req, res)

        if (!accountId) {
            return
        }


        const id =
            parseId(
                req.params.id
            )


        if (!id) {

            return res.status(400).json({

                message:
                    "Invalid customer id"

            })

        }


        // ==================================================
        // CUSTOMER
        // ==================================================

        const customer =
            await prisma.customer.findFirst({

                where: {

                    id,
                    accountId

                },

                select: {

                    id:
                        true,

                    customerCode:
                        true,

                    name:
                        true,

                    phone:
                        true,

                    address:
                        true,

                    note:
                        true

                }

            })


        if (!customer) {

            return res.status(404).json({

                message:
                    "Customer not found"

            })

        }


        const formattedCustomer =
            formatCustomer(customer)


        // ==================================================
        // SALES HISTORY
        // ==================================================

        const sales =
            await prisma.sale.findMany({

                where: {

                    customerId:
                        id,

                    accountId

                },

                include: {

                    items: {

                        include: {

                            consignmentItem: {

                                select: {

                                    id:
                                        true,

                                    name:
                                        true,

                                    description:
                                        true,

                                    costPrice:
                                        true,

                                    owner: {

                                        select: {

                                            id:
                                                true,

                                            name:
                                                true

                                        }

                                    }

                                }

                            },

                            returns:
                                true

                        },

                        orderBy: {

                            id:
                                "asc"

                        }

                    },

                    createdBy: {

                        select: {

                            id:
                                true,

                            name:
                                true,

                            email:
                                true

                        }

                    }

                },

                orderBy: {

                    createdAt:
                        "desc"

                }

            })


        // ==================================================
        // FORMAT HISTORY
        // ==================================================

        const history =
            sales.map(sale => {

                const items =
                    (sale.items || []).map(item => {

                        const quantity =
                            num(item.quantity)


                        const unitSalePrice =
                            money(item.salePrice)


                        const lineTotal =
                            money(
                                unitSalePrice *
                                quantity
                            )


                        const unitCostPrice =
                            money(
                                item.consignmentItem
                                    ?.costPrice
                            )


                        const totalCost =
                            money(
                                unitCostPrice *
                                quantity
                            )


                        const refundAmount =
                            money(
                                (item.returns || [])
                                    .reduce(
                                        (
                                            sum,
                                            returnItem
                                        ) =>
                                            sum +
                                            num(
                                                returnItem.refundAmount
                                            ),
                                        0
                                    )
                            )


                        const netLineTotal =
                            money(
                                Math.max(
                                    0,
                                    lineTotal -
                                    refundAmount
                                )
                            )


                        return {

                            saleItemId:
                                item.id,

                            productId:
                                item.consignmentItemId,

                            productName:
                                item.consignmentItem?.name ||
                                "Unknown product",

                            description:
                                item.consignmentItem?.description ||
                                null,

                            quantity,

                            unitSalePrice,

                            lineTotal,

                            unitCostPrice,

                            totalCost,

                            refundAmount,

                            netLineTotal,

                            owner:
                                item.consignmentItem?.owner ||
                                null,

                            returns:
                                item.returns || []

                        }

                    })


                const productTotal =
                    money(
                        items.reduce(
                            (
                                total,
                                item
                            ) =>
                                total +
                                item.lineTotal,
                            0
                        )
                    )


                const returnedAmount =
                    money(
                        items.reduce(
                            (
                                total,
                                item
                            ) =>
                                total +
                                item.refundAmount,
                            0
                        )
                    )


                const netProductTotal =
                    money(
                        items.reduce(
                            (
                                total,
                                item
                            ) =>
                                total +
                                item.netLineTotal,
                            0
                        )
                    )


                const shippingCost =
                    money(
                        sale.shippingCharged
                    )


                const discount =
                    money(
                        sale.discount
                    )


                const totalAmount =
                    money(
                        sale.totalAmount
                    )


                return {

                    saleId:
                        sale.id,

                    orderNo:
                        sale.orderNo,

                    purchasedAt:
                        sale.createdAt,

                    updatedAt:
                        sale.updatedAt,

                    status:
                        sale.status,

                    items,

                    productTotal,

                    returnedAmount,

                    netProductTotal,

                    shippingCost,

                    discount,

                    totalAmount,

                    note:
                        sale.note,

                    createdBy:
                        sale.createdBy

                }

            })


        // ==================================================
        // SUMMARY
        // ==================================================

        const totalOrders =
            history.length


        const totalItems =
            history.reduce(

                (
                    total,
                    sale
                ) =>
                    total +
                    sale.items.reduce(
                        (
                            itemTotal,
                            item
                        ) =>
                            itemTotal +
                            item.quantity,
                        0
                    ),

                0

            )


        const totalProductValue =
            money(
                history.reduce(

                    (
                        total,
                        sale
                    ) =>
                        total +
                        sale.productTotal,

                    0

                )
            )


        const totalShipping =
            money(
                history.reduce(

                    (
                        total,
                        sale
                    ) =>
                        total +
                        sale.shippingCost,

                    0

                )
            )


        const totalDiscount =
            money(
                history.reduce(

                    (
                        total,
                        sale
                    ) =>
                        total +
                        sale.discount,

                    0

                )
            )


        const totalReturned =
            money(
                history.reduce(

                    (
                        total,
                        sale
                    ) =>
                        total +
                        sale.returnedAmount,

                    0

                )
            )


        const totalSpent =
            money(
                history.reduce(

                    (
                        total,
                        sale
                    ) =>
                        total +
                        sale.totalAmount,

                    0

                )
            )


        const totalNetProductValue =
            money(
                history.reduce(

                    (
                        total,
                        sale
                    ) =>
                        total +
                        sale.netProductTotal,

                    0

                )
            )


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.json({

            customer:
                formattedCustomer,

            summary: {

                totalOrders,

                totalItems,

                totalProductValue,

                totalNetProductValue,

                totalShipping,

                totalDiscount,

                totalReturned,

                totalSpent

            },

            history

        })

    } catch (error) {

        console.error(
            "CUSTOMER HISTORY ERROR:",
            error
        )

        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}
