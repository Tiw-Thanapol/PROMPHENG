const prisma = require("../config/prisma")


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
// HELPERS
// ======================================================

function num(value) {

    const n = Number(value)

    return Number.isFinite(n) ? n : 0

}


function money(value) {

    return Number(num(value).toFixed(2))

}


function positiveNumber(value) {

    const n = Number(value)

    return Number.isFinite(n) && n > 0 ? n : 0

}


function positiveInteger(value) {

    const n = Number(value)

    return Number.isInteger(n) && n > 0 ? n : 0

}


function isValidNumber(value) {

    return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        Number.isFinite(Number(value))
    )

}


function parseSoldAt(value) {

    if (value === undefined || value === null || value === "") {

        return new Date()

    }

    const date = new Date(value)

    return Number.isNaN(date.getTime()) ? null : date

}


// ======================================================
// ACCOUNT COUNTER HELPER
//
// ดึงเลขลำดับถัดไปแบบ atomic ต่อ account/ต่อ type
// โดยใช้ upsert + increment ภายใน transaction เดียวกับ
// ที่สร้าง record จริง เพื่อกัน race condition เวลามีการ
// สร้างพร้อมกันในบัญชีเดียวกัน (ใช้กับ customerNumber)
//
// ต้องเรียกภายใน prisma.$transaction เท่านั้น (รับ tx เข้ามา)
// ======================================================

async function getNextAccountSequence(tx, accountId, type) {

    const counter = await tx.accountCounter.upsert({

        where: {
            accountId_type: { accountId, type }
        },

        create: {
            accountId,
            type,
            value: 1
        },

        update: {
            value: { increment: 1 }
        }

    })


    return counter.value

}


// ======================================================
// BANGKOK YEAR-MONTH HELPER
// ======================================================

function getBangkokYearMonth(date = new Date()) {

    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone: "Asia/Bangkok",
                year: "numeric",
                month: "2-digit"
            }
        ).formatToParts(date)


    const year = parts.find(p => p.type === "year").value

    const month = parts.find(p => p.type === "month").value


    return {
        yy: year.slice(-2),
        mm: month
    }

}


// ======================================================
// ORDER NUMBER GENERATOR
//
// รูปแบบ: YYMMnnn (เช่น 2609001 = ปี 2026 เดือน 09 ลำดับที่ 1)
//
// - YY = 2 หลักท้ายของปี ค.ศ. (timezone Asia/Bangkok)
// - MM = เดือน 2 หลัก
// - nnn = ลำดับการขายในเดือนนั้น เริ่มที่ 001 ทุกเดือน
//   (รีเซ็ตอัตโนมัติ เพราะ AccountCounter ใช้ type แยกตาม
//   เดือน เช่น "SALE_2609", "SALE_2610" — เดือนใหม่ =
//   type ใหม่ = counter เริ่มจาก 1 เองโดยไม่ต้องเขียน logic
//   reset แยกต่างหาก)
// - ถ้าเดือนไหนขายเกิน 999 ออเดอร์ เลขจะขยายเป็น 4+ หลัก
//   อัตโนมัติ (เช่น 26091000) ไม่ error ไม่ตัดทิ้ง
//
// ใช้เวลา ณ ตอนสร้าง order จริง (ไม่ใช่ soldAt ที่ผู้ใช้
// กรอกย้อนหลังได้) เพื่อกันเลขสลับเดือน/ย้อนซ้ำ
//
// ต้องเรียกภายใน prisma.$transaction เท่านั้น (รับ tx เข้ามา)
// ======================================================

async function getNextOrderNo(tx, accountId, now = new Date()) {

    const { yy, mm } = getBangkokYearMonth(now)

    const type = `SALE_${yy}${mm}`


    const counter = await tx.accountCounter.upsert({

        where: {
            accountId_type: { accountId, type }
        },

        create: {
            accountId,
            type,
            value: 1
        },

        update: {
            value: { increment: 1 }
        }

    })


    const sequence = String(counter.value).padStart(3, "0")


    return Number(`${yy}${mm}${sequence}`)

}


// ======================================================
// EXPENSE CATEGORY
// ======================================================

const EXPENSE_CATEGORY = {

    SHIPPING_ACTUAL: "SHIPPING_ACTUAL",

    OTHER_SALE_COST: "OTHER_SALE_COST"

}


// ======================================================
// DATE HELPERS
// ======================================================

function startOfDay(date) {

    const d = new Date(date)

    d.setHours(0, 0, 0, 0)

    return d

}


function endOfDay(date) {

    const d = new Date(date)

    d.setHours(23, 59, 59, 999)

    return d

}


function startOfWeek(date) {

    const d = startOfDay(date)

    const day = d.getDay()

    const diff = day === 0 ? -6 : 1 - day

    d.setDate(d.getDate() + diff)

    return d

}


function startOfMonth(date) {

    const d = startOfDay(date)

    d.setDate(1)

    return d

}


function startOfYear(date) {

    const d = startOfDay(date)

    d.setMonth(0)

    d.setDate(1)

    return d

}


// ======================================================
// ACCOUNTING PERIOD
// ======================================================

function getPeriodRange(period, dateInput) {

    const baseDate = dateInput ? new Date(dateInput) : new Date()


    if (Number.isNaN(baseDate.getTime())) {

        throw new Error("INVALID_DATE")

    }


    let start
    let end


    switch (period) {

        case "day":

            start = startOfDay(baseDate)

            end = endOfDay(baseDate)

            break


        case "week":

            start = startOfWeek(baseDate)

            end = new Date(start)

            end.setDate(end.getDate() + 6)

            end = endOfDay(end)

            break


        case "month":

            start = startOfMonth(baseDate)

            end = new Date(start)

            end.setMonth(end.getMonth() + 1)

            end.setMilliseconds(-1)

            break


        case "year":

            start = startOfYear(baseDate)

            end = new Date(start)

            end.setFullYear(end.getFullYear() + 1)

            end.setMilliseconds(-1)

            break


        default:

            start = startOfDay(baseDate)

            end = endOfDay(baseDate)

    }


    return { start, end }

}


// ======================================================
// BUILD ORDER ITEM
// ======================================================

function normalizeOrderItem(item) {

    const consignmentItemId = positiveInteger(
        item?.consignmentItemId || item?.productId
    )

    const quantity = positiveInteger(item?.quantity || 1)

    const salePrice = money(item?.salePrice)


    return {

        consignmentItemId,

        quantity,

        salePrice

    }

}


// ======================================================
// GET ALL ORDERS
// GET /api/orders
// ======================================================

exports.getOrders = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: "ไม่พบ account ของผู้ใช้งาน"
            })
        }


        const orders = await prisma.sale.findMany({

            where: {

                accountId

            },

            include: {

                customer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true
                    }
                },

                items: {

                    include: {
                        consignmentItem: true
                    },

                    orderBy: {
                        id: "asc"
                    }

                },

                createdBy: {

                    select: {
                        id: true,
                        name: true,
                        email: true
                    }

                },

                expenses: true,

                returns: true

            },

            orderBy: {
                createdAt: "desc"
            }

        })


        return res.json({

            count: orders.length,

            orders

        })


    } catch (err) {

        console.log("GET ORDERS ERROR", err)

        return res.status(500).json({

            message: "Cannot get orders"

        })

    }

}


// ======================================================
// GET ONE ORDER
// GET /api/orders/:id
// ======================================================

exports.getOrderById = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: "ไม่พบ account ของผู้ใช้งาน"
            })
        }


        const id = Number(req.params.id)


        if (!Number.isInteger(id) || id <= 0) {

            return res.status(400).json({

                message: "Invalid order id"

            })

        }


        // ==================================================
        // ใช้ findFirst + accountId แทน findUnique({ id })
        // เพื่อกันดึงข้อมูลข้าม account
        // ==================================================

        const order = await prisma.sale.findFirst({

            where: {
                id,
                accountId
            },

            include: {

                customer: {

                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true
                    }

                },

                items: {

                    include: {
                        consignmentItem: true
                    },

                    orderBy: {
                        id: "asc"
                    }

                },

                createdBy: {

                    select: {
                        id: true,
                        name: true,
                        email: true
                    }

                },

                expenses: true,

                returns: true

            }

        })


        if (!order) {

            return res.status(404).json({

                message: "Order not found"

            })

        }


        return res.json({

            order

        })


    } catch (err) {

        console.log("GET ORDER ERROR", err)

        return res.status(500).json({

            message: "Cannot get order"

        })

    }

}


// ======================================================
// CREATE ORDER
// POST /api/orders
//
// ======================================================
//
// BUSINESS LOGIC
//
// - totalAmount = productTotal - discount
// - shippingActual = ค่าใช้จ่ายจริงของร้าน
// - otherExpense = ค่าใช้จ่ายอื่นของรายการขาย
// - SaleItem.costPriceAtSale = snapshot ต้นทุน ณ เวลาขาย
// - orderNo = เลขที่ออร์เดอร์ต่อ account เริ่มที่ 1 เสมอ
//   (ดึงจาก AccountCounter ผ่าน getNextAccountSequence,
//   แยกจาก sale.id ซึ่งเป็น sequence กลางข้าม account)
//
// ======================================================

exports.createOrder = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: "ไม่พบ account ของผู้ใช้งาน"
            })
        }


        const {

            items,

            shippingCost,

            shippingActual,

            otherExpense = 0,

            discount = 0,

            note,

            customerId = null,

            soldAt: requestedSoldAt

        } = req.body


        // ==================================================
        // AUTH
        // ==================================================

        if (!req.user?.id) {

            return res.status(401).json({

                message: "Unauthorized"

            })

        }


        // ==================================================
        // ITEMS
        // ==================================================

        if (!Array.isArray(items) || items.length === 0) {

            return res.status(400).json({

                message: "Items required"

            })

        }


        const orderItems = items.map(normalizeOrderItem)


        for (const item of orderItems) {

            if (!item.consignmentItemId) {

                return res.status(400).json({

                    message: "Invalid product id"

                })

            }


            if (!item.quantity) {

                return res.status(400).json({

                    message: "Invalid quantity"

                })

            }


            if (item.salePrice < 0) {

                return res.status(400).json({

                    message: "Invalid sale price"

                })

            }

        }


        // ==================================================
        // DUPLICATE STOCK CHECK
        // ==================================================

        const ids = orderItems.map(
            item => item.consignmentItemId
        )

        const uniqueIds = new Set(ids)


        if (uniqueIds.size !== ids.length) {

            return res.status(400).json({

                message: "Duplicate product in order"

            })

        }


        // ==================================================
        // SOLD AT
        // ==================================================

        const soldAt = parseSoldAt(requestedSoldAt)


        if (!soldAt) {

            return res.status(400).json({

                message: "Invalid soldAt"

            })

        }


        // ==================================================
        // MONEY
        // ==================================================

        const shippingActualValue = Math.max(

            0,

            money(

                isValidNumber(shippingActual)

                    ? shippingActual

                    : isValidNumber(shippingCost)

                        ? shippingCost

                        : 0

            )

        )


        const otherExpenseValue = Math.max(

            0,

            money(otherExpense)

        )


        const normalizedDiscount = Math.max(

            0,

            money(discount)

        )


        // ==================================================
        // TRANSACTION
        // ==================================================

        const order = await prisma.$transaction(

            async tx => {

                // ==================================================
                // LOAD STOCK
                // scoped ด้วย accountId กันขายสินค้าของ account อื่น
                // ==================================================

                const stocks = await tx.consignmentItem.findMany({

                    where: {

                        id: {
                            in: orderItems.map(
                                item => item.consignmentItemId
                            )
                        },

                        accountId,

                        status: "AVAILABLE"

                    }

                })


                if (stocks.length !== orderItems.length) {

                    throw new Error("STOCK_NOT_AVAILABLE")

                }


                // ==================================================
                // VALIDATE STOCK
                // ==================================================

                for (const orderItem of orderItems) {

                    const stock = stocks.find(

                        item =>
                            item.id ===
                            orderItem.consignmentItemId

                    )


                    if (!stock) {

                        throw new Error("STOCK_NOT_AVAILABLE")

                    }


                    const stockQuantity =
                        positiveInteger(stock.quantity)


                    if (
                        stockQuantity > 0 &&
                        orderItem.quantity > stockQuantity
                    ) {

                        throw new Error("INSUFFICIENT_STOCK")

                    }


                    if (
                        stockQuantity === 0 &&
                        orderItem.quantity > 1
                    ) {

                        throw new Error("INSUFFICIENT_STOCK")

                    }

                }


                // ==================================================
                // PRODUCT TOTAL
                // ==================================================

                const productTotal = orderItems.reduce(

                    (sum, item) =>

                        sum +
                        (
                            item.salePrice *
                            item.quantity
                        ),

                    0

                )


                if (normalizedDiscount > productTotal) {

                    throw new Error(
                        "DISCOUNT_EXCEEDS_TOTAL"
                    )

                }


                const totalAmount = money(

                    productTotal -
                    normalizedDiscount

                )


                // ==================================================
                // BUILD SALE ITEMS
                //
                // สำคัญมาก:
                //
                // costPriceAtSale เป็น required ใน schema
                // ต้อง snapshot ต้นทุนจาก stock ตอนขาย
                // ==================================================

                const saleItemsData = orderItems.map(

                    item => {

                        const stock = stocks.find(

                            stockItem =>
                                stockItem.id ===
                                item.consignmentItemId

                        )


                        if (!stock) {

                            throw new Error(
                                "STOCK_NOT_AVAILABLE"
                            )

                        }


                        const costPriceAtSale = money(
                            stock.costPrice
                        )


                        return {

                            consignmentItemId:
                                item.consignmentItemId,

                            quantity:
                                item.quantity,

                            salePrice:
                                item.salePrice,

                            costPriceAtSale

                        }

                    }

                )


                // ==================================================
                // GET NEXT ORDER NUMBER (per account, atomic)
                //
                // ทำภายใน transaction เดียวกับการสร้าง sale เพื่อให้
                // orderNo เรียงลำดับตรงกับลำดับการสร้างจริงเสมอ และ
                // ปลอดภัยจากการขายพร้อมกันหลาย request ในบัญชีเดียวกัน
                // ==================================================

                const nextOrderNo = await getNextOrderNo(
                    tx,
                    accountId
                )


                // ==================================================
                // CREATE SALE
                // ==================================================

                const saleData = {

                    accountId,

                    orderNo: nextOrderNo,

                    createdById: req.user.id,

                    totalAmount,

                    shippingCharged: 0,

                    shippingActual:
                        shippingActualValue,

                    discount:
                        normalizedDiscount,

                    status: "COMPLETED",

                    note:
                        note || null,

                    soldAt,

                    items: {

                        create: saleItemsData

                    }

                }


                // ==================================================
                // CUSTOMER
                // ต้องเช็คว่าลูกค้าเป็นของ account เดียวกัน
                // ไม่งั้นผูก order เข้ากับลูกค้าของร้านอื่นได้
                // ==================================================

                if (
                    customerId !== null &&
                    customerId !== undefined &&
                    customerId !== ""
                ) {

                    const parsedCustomerId =
                        Number(customerId)


                    if (
                        !Number.isInteger(
                            parsedCustomerId
                        ) ||
                        parsedCustomerId <= 0
                    ) {

                        throw new Error(
                            "INVALID_CUSTOMER"
                        )

                    }


                    const customer =
                        await tx.customer.findFirst({

                            where: {

                                id:
                                    parsedCustomerId,

                                accountId

                            }

                        })


                    if (!customer) {

                        throw new Error(
                            "INVALID_CUSTOMER"
                        )

                    }


                    saleData.customer = {

                        connect: {
                            id: customer.id
                        }

                    }

                }


                // ==================================================
                // CREATE SALE + SALE ITEMS
                // ==================================================

                const sale =
                    await tx.sale.create({

                        data: saleData

                    })


                // ==================================================
                // CREATE EXPENSE RECORDS
                //
                // ใช้ sale.orderNo (ไม่ใช่ sale.id) ในชื่อ expense
                // เพื่อให้ตรงกับเลขที่ออร์เดอร์ที่ผู้ใช้เห็นจริง
                // ==================================================

                const expenseRecords = []


                if (shippingActualValue > 0) {

                    expenseRecords.push({

                        accountId,

                        name:
                            `ค่าส่งจริง - Order #${sale.orderNo}`,

                        category:
                            EXPENSE_CATEGORY.SHIPPING_ACTUAL,

                        amount:
                            shippingActualValue,

                        saleId:
                            sale.id,

                        createdById:
                            req.user.id

                    })

                }


                if (otherExpenseValue > 0) {

                    expenseRecords.push({

                        accountId,

                        name:
                            `ค่าใช้จ่ายอื่นๆ - Order #${sale.orderNo}`,

                        category:
                            EXPENSE_CATEGORY.OTHER_SALE_COST,

                        amount:
                            otherExpenseValue,

                        saleId:
                            sale.id,

                        createdById:
                            req.user.id

                    })

                }


                if (expenseRecords.length > 0) {

                    await tx.expense.createMany({

                        data: expenseRecords

                    })

                }


                // ==================================================
                // UPDATE STOCK
                // ==================================================

                for (const orderItem of orderItems) {

                    const stock = stocks.find(

                        item =>
                            item.id ===
                            orderItem.consignmentItemId

                    )


                    if (!stock) {

                        throw new Error(
                            "STOCK_NOT_AVAILABLE"
                        )

                    }


                    const stockQuantity =
                        positiveInteger(stock.quantity)


                    // ==================================================
                    // SOLD OUT
                    // ==================================================

                    if (
                        stockQuantity === 0 ||
                        orderItem.quantity >= stockQuantity
                    ) {

                        const result =
                            await tx.consignmentItem.updateMany({

                                where: {

                                    id:
                                        orderItem.consignmentItemId,

                                    accountId,

                                    status:
                                        "AVAILABLE"

                                },

                                data: {

                                    status:
                                        "SOLD",

                                    quantity:
                                        0,

                                    actualSalePrice:
                                        orderItem.salePrice,

                                    soldAt

                                }

                            })


                        if (result.count !== 1) {

                            throw new Error(
                                "STOCK_NOT_AVAILABLE"
                            )

                        }

                    }

                    // ==================================================
                    // PARTIAL SALE
                    // ==================================================

                    else {

                        const remainingQuantity =
                            stockQuantity -
                            orderItem.quantity


                        const result =
                            await tx.consignmentItem.updateMany({

                                where: {

                                    id:
                                        orderItem.consignmentItemId,

                                    accountId,

                                    status:
                                        "AVAILABLE"

                                },

                                data: {

                                    quantity:
                                        remainingQuantity,

                                    actualSalePrice:
                                        orderItem.salePrice,

                                    soldAt

                                }

                            })


                        if (result.count !== 1) {

                            throw new Error(
                                "STOCK_NOT_AVAILABLE"
                            )

                        }

                    }

                }


                return sale

            },

            {
                timeout: 30000
            }

        )


        // ==================================================
        // GET CREATED ORDER
        // ==================================================

        const result =
            await prisma.sale.findFirst({

                where: {
                    id: order.id,
                    accountId
                },

                include: {

                    customer: {

                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            address: true
                        }

                    },

                    items: {

                        include: {
                            consignmentItem: true
                        },

                        orderBy: {
                            id: "asc"
                        }

                    },

                    createdBy: {

                        select: {
                            id: true,
                            name: true,
                            email: true
                        }

                    },

                    expenses: true

                }

            })


        return res.status(201).json({

            message:
                "Order created successfully",

            order: result

        })


    } catch (err) {

        console.log(
            "CREATE ORDER ERROR",
            err
        )


        if (
            err.message ===
            "STOCK_NOT_AVAILABLE"
        ) {

            return res.status(409).json({

                message:
                    "Product not available"

            })

        }


        if (
            err.message ===
            "INSUFFICIENT_STOCK"
        ) {

            return res.status(409).json({

                message:
                    "Insufficient stock quantity"

            })

        }


        if (
            err.message ===
            "INVALID_CUSTOMER"
        ) {

            return res.status(400).json({

                message:
                    "Invalid customer id"

            })

        }


        if (
            err.message ===
            "DISCOUNT_EXCEEDS_TOTAL"
        ) {

            return res.status(400).json({

                message:
                    "Discount cannot exceed sale amount"

            })

        }


        console.log(
            "CREATE ORDER DETAILS",
            err.message
        )


        return res.status(500).json({

            message:
                "Cannot create order"

        })

    }

}


// ======================================================
// ACCOUNTING
// GET /api/orders/accounting
// ======================================================

exports.getAccounting = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({
                message: "ไม่พบ account ของผู้ใช้งาน"
            })
        }


        // ==================================================
        // NORMALIZE PERIOD
        // ==================================================

        let period =
            String(
                req.query.period || "day"
            )
                .trim()
                .toLowerCase()


        const aliases = {

            today: "day",

            day: "day",

            week: "week",

            month: "month",

            year: "year",

            custom: "custom"

        }


        period =
            aliases[period] || period


        const allowedPeriods = [

            "day",

            "week",

            "month",

            "year",

            "custom"

        ]


        if (
            !allowedPeriods.includes(period)
        ) {

            return res.status(400).json({

                message:
                    "Invalid accounting period"

            })

        }


        // ==================================================
        // DATE RANGE
        // ==================================================

        let start

        let end


        if (period === "custom") {

            const startDate =
                req.query.startDate

            const endDate =
                req.query.endDate


            if (!startDate || !endDate) {

                return res.status(400).json({

                    message:
                        "startDate and endDate are required"

                })

            }


            start =
                new Date(startDate)

            end =
                new Date(endDate)


            if (
                Number.isNaN(
                    start.getTime()
                ) ||
                Number.isNaN(
                    end.getTime()
                )
            ) {

                return res.status(400).json({

                    message:
                        "Invalid custom date"

                })

            }


            start =
                startOfDay(start)

            end =
                endOfDay(end)


            if (start > end) {

                return res.status(400).json({

                    message:
                        "startDate must be before endDate"

                })

            }

        }

        else {

            ({
                start,
                end
            } =
                getPeriodRange(
                    period,
                    req.query.date
                ))

        }


        // ==================================================
        // LOAD SALES
        // scoped ด้วย accountId
        // ==================================================

        const sales =
            await prisma.sale.findMany({

                where: {

                    accountId,

                    createdAt: {

                        gte: start,

                        lte: end

                    },

                    status: {

                        not: "CANCELLED"

                    }

                },

                include: {

                    customer: {

                        select: {

                            id: true,

                            name: true,

                            phone: true

                        }

                    },

                    items: {

                        include: {

                            consignmentItem: {

                                select: {

                                    id: true,

                                    name: true,

                                    costPrice: true

                                }

                            },

                            returns: true

                        }

                    },

                    expenses: true,

                    returns: true,

                    createdBy: {

                        select: {

                            id: true,

                            name: true

                        }

                    }

                },

                orderBy: {

                    createdAt: "desc"

                }

            })


        // ==================================================
        // LOAD EXPENSES
        // scoped ด้วย accountId
        // ==================================================

        const expenses =
            await prisma.expense.findMany({

                where: {

                    accountId,

                    createdAt: {

                        gte: start,

                        lte: end

                    }

                },

                include: {

                    createdBy: {

                        select: {

                            id: true,

                            name: true

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

                    createdAt: "desc"

                }

            })


        // ==================================================
        // REVENUE
        // ==================================================

        const revenue =
            sales.reduce(

                (sum, sale) =>
                    sum +
                    num(sale.totalAmount),

                0

            )


        // ==================================================
        // SHIPPING CHARGED
        // ==================================================

        const shippingCharged =
            sales.reduce(

                (sum, sale) =>
                    sum +
                    num(
                        sale.shippingCharged
                    ),

                0

            )


        // ==================================================
        // DISCOUNT
        // ==================================================

        const discount =
            sales.reduce(

                (sum, sale) =>
                    sum +
                    num(sale.discount),

                0

            )


        // ==================================================
        // PRODUCT COST
        // IMPORTANT:
        //
        // ใช้ SaleItem.costPriceAtSale
        // ไม่ใช้ ConsignmentItem.costPrice
        // เพราะต้องใช้ต้นทุน ณ เวลาที่ขาย
        // ==================================================

        let productCost = 0

        let itemsSold = 0

        let returnedItems = 0


        for (const sale of sales) {

            for (const item of sale.items || []) {

                const quantity =
                    positiveInteger(
                        item.quantity || 1
                    )


                // ==================================================
                // SNAPSHOT COST
                // ==================================================

                const unitCost =
                    money(
                        item.costPriceAtSale ??
                        item.consignmentItem?.costPrice
                    )


                const refundAmount =
                    (item.returns || []).reduce(

                        (sum, returnItem) =>
                            sum +
                            num(
                                returnItem.refundAmount
                            ),

                        0

                    )


                const unitSalePrice =
                    num(item.salePrice)


                const grossItemSale =
                    unitSalePrice *
                    quantity


                const isFullyReturned =

                    refundAmount >=
                    grossItemSale &&
                    grossItemSale > 0


                if (isFullyReturned) {

                    returnedItems += quantity

                    continue

                }


                itemsSold += quantity


                productCost +=
                    unitCost *
                    quantity

            }

        }


        // ==================================================
        // EXPENSE CATEGORY
        // ==================================================

        const expensesByCategory = {

            SHIPPING_ACTUAL: 0,

            PACKAGING: 0,

            COMMISSION: 0,

            OTHER_SALE_COST: 0,

            RENT: 0,

            SALARY: 0,

            MARKETING: 0,

            UTILITY: 0,

            OTHER_GENERAL: 0

        }


        let expenseTotal = 0


        for (const expense of expenses) {

            const amount =
                num(expense.amount)


            expenseTotal += amount


            if (
                Object.prototype.hasOwnProperty.call(
                    expensesByCategory,
                    expense.category
                )
            ) {

                expensesByCategory[
                    expense.category
                ] += amount

            }

            else {

                expensesByCategory
                    .OTHER_GENERAL += amount

            }

        }


        // ==================================================
        // NET REVENUE
        // ==================================================

        const netRevenue =
            revenue


        // ==================================================
        // PROFIT
        // ==================================================

        const grossProfit =
            money(
                netRevenue -
                productCost
            )


        const netProfit =
            money(
                netRevenue -
                productCost -
                expenseTotal
            )


        // ==================================================
        // TRANSACTIONS
        // ==================================================

        const transactions = []


        // ==================================================
        // SALE TRANSACTIONS
        //
        // ใช้ sale.orderNo เป็นเลขที่แสดงผล (fallback เป็น
        // sale.id เฉพาะกรณี record เก่าก่อน migrate ที่ยังไม่มี
        // orderNo เพื่อไม่ให้พังหน้าจอ)
        // ==================================================

        for (const sale of sales) {

            const displayOrderNo =
                sale.orderNo ?? sale.id


            transactions.push({

                id:
                    `SALE-${sale.id}`,

                type:
                    "INCOME",

                source:
                    "SALE",

                sourceId:
                    sale.id,

                orderNo:
                    sale.orderNo,

                title:
                    `Order #${displayOrderNo}`,

                description:
                    sale.customer?.name ||
                    "Walk in customer",

                amount:
                    money(
                        sale.totalAmount
                    ),

                date:
                    sale.createdAt,

                status:
                    sale.status,

                customer:
                    sale.customer,

                items:
                    (sale.items || []).map(
                        item => {

                            const quantity =
                                positiveInteger(
                                    item.quantity || 1
                                )


                            const unitSalePrice =
                                money(
                                    item.salePrice
                                )


                            // IMPORTANT:
                            // ใช้ snapshot cost
                            const unitCostPrice =
                                money(
                                    item.costPriceAtSale ??
                                    item.consignmentItem?.costPrice
                                )


                            return {

                                id:
                                    item.id,

                                consignmentItemId:
                                    item.consignmentItemId,

                                name:
                                    item.consignmentItem?.name ||
                                    "-",

                                quantity,

                                unitSalePrice,

                                salePrice:
                                    money(
                                        unitSalePrice *
                                        quantity
                                    ),

                                unitCostPrice,

                                costPrice:
                                    money(
                                        unitCostPrice *
                                        quantity
                                    ),

                                soldAt:
                                    sale.createdAt

                            }

                        }
                    )

            })

        }


        // ==================================================
        // EXPENSE TRANSACTIONS
        // ==================================================

        for (const expense of expenses) {

            transactions.push({

                id:
                    `EXPENSE-${expense.id}`,

                type:
                    "EXPENSE",

                source:
                    "EXPENSE",

                sourceId:
                    expense.id,

                title:
                    expense.name,

                description:
                    expense.note ||
                    expense.category,

                category:
                    expense.category,

                amount:
                    money(
                        expense.amount
                    ),

                date:
                    expense.createdAt,

                saleId:
                    expense.saleId,

                createdBy:
                    expense.createdBy

            })

        }


        // ==================================================
        // SORT TRANSACTIONS
        // ==================================================

        transactions.sort(

            (a, b) =>
                new Date(b.date) -
                new Date(a.date)

        )


        // ==================================================
        // DAILY
        // ==================================================

        const dailyMap = {}


        for (const transaction of transactions) {

            const transactionDate =
                new Date(transaction.date)


            const key =
                transactionDate
                    .toISOString()
                    .slice(0, 10)


            if (!dailyMap[key]) {

                dailyMap[key] = {

                    date:
                        key,

                    income:
                        0,

                    expense:
                        0,

                    balance:
                        0

                }

            }


            if (
                transaction.type ===
                "INCOME"
            ) {

                dailyMap[key].income +=
                    num(transaction.amount)

            }

            else {

                dailyMap[key].expense +=
                    num(transaction.amount)

            }


            dailyMap[key].balance =
                money(

                    dailyMap[key].income -
                    dailyMap[key].expense

                )

        }


        const daily =
            Object.values(dailyMap)
                .sort(
                    (a, b) =>
                        a.date.localeCompare(
                            b.date
                        )
                )


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.json({

            period,

            range: {

                start,

                end

            },

            summary: {

                totalSales:
                    sales.length,

                totalExpenses:
                    expenses.length,

                itemsSold,

                returnedItems,

                revenue:
                    money(revenue),

                shippingCharged:
                    money(shippingCharged),

                discount:
                    money(discount),

                productSales:
                    money(
                        revenue -
                        shippingCharged +
                        discount
                    ),

                productCost:
                    money(productCost),

                expenses:
                    money(expenseTotal),

                expensesByCategory: {

                    shippingActual:
                        money(
                            expensesByCategory
                                .SHIPPING_ACTUAL
                        ),

                    packaging:
                        money(
                            expensesByCategory
                                .PACKAGING
                        ),

                    commission:
                        money(
                            expensesByCategory
                                .COMMISSION
                        ),

                    otherSaleCost:
                        money(
                            expensesByCategory
                                .OTHER_SALE_COST
                        ),

                    rent:
                        money(
                            expensesByCategory
                                .RENT
                        ),

                    salary:
                        money(
                            expensesByCategory
                                .SALARY
                        ),

                    marketing:
                        money(
                            expensesByCategory
                                .MARKETING
                        ),

                    utility:
                        money(
                            expensesByCategory
                                .UTILITY
                        ),

                    otherGeneral:
                        money(
                            expensesByCategory
                                .OTHER_GENERAL
                        )

                },

                grossProfit,

                netProfit,

                profitMargin:
                    netRevenue > 0
                        ? money(
                            (
                                netProfit /
                                netRevenue
                            ) * 100
                        )
                        : 0

            },

            transactions,

            daily

        })


    } catch (err) {

        console.log(
            "ACCOUNTING ERROR",
            err
        )


        if (
            err.message ===
            "INVALID_DATE"
        ) {

            return res.status(400).json({

                message:
                    "Invalid date"

            })

        }


        return res.status(500).json({

            message:
                "Cannot get accounting data"

        })

    }

}