const prisma = require("../config/prisma")


// ======================================================
// HELPERS
// ======================================================

function isValidNumber(value) {

    return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        Number.isFinite(Number(value))
    )
}


function toPositiveInteger(value) {

    const number = Number(value)

    return (
        Number.isInteger(number) &&
        number > 0
    )
}


function toNumber(value) {

    return Number(value || 0)
}


function getBangkokDateParts(date = new Date()) {

    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone: "Asia/Bangkok",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }
        ).formatToParts(date)


    return {
        year: Number(parts.find(p => p.type === "year").value),
        month: Number(parts.find(p => p.type === "month").value),
        day: Number(parts.find(p => p.type === "day").value)
    }
}


function formatDateOnly(year, month, day) {

    return (
        `${year}-` +
        `${String(month).padStart(2, "0")}-` +
        `${String(day).padStart(2, "0")}`
    )
}


// ======================================================
// SALE TIME
// ======================================================

function parseSoldAt(value) {

    if (value === undefined || value === null || value === "") {

        return new Date()

    }

    if (value instanceof Date) {

        if (Number.isNaN(value.getTime())) {

            return null

        }

        return value

    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {

        return null

    }

    return date

}


// ======================================================
// ACCOUNT COUNTER HELPER
//
// ดึงเลขลำดับถัดไปแบบ atomic ต่อ account/ต่อ type
// (ใช้กับ counter ทั่วไปที่ไม่ต้องมี format พิเศษ)
//
// ต้องเรียกภายใน prisma.$transaction เท่านั้น (รับ tx เข้ามา)
//
// หมายเหตุ: ฟังก์ชันนี้ "ไม่ใช่" ตัวที่ใช้สร้าง orderNo อีกต่อไป
// (ดู getNextOrderNo ด้านล่างแทน) เก็บไว้เผื่อมีจุดอื่นในระบบ
// เรียกใช้ counter ทั่วไปที่ไม่เกี่ยวกับ orderNo
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
// ORDER NUMBER GENERATOR (YYMMnnn)
//
// รูปแบบ: YYMMnnn (เช่น 2609001 = ปี 2026 เดือน 09 ลำดับที่ 1)
//
// - YY = 2 หลักท้ายของปี ค.ศ. (timezone Asia/Bangkok)
// - MM = เดือน 2 หลัก
// - nnn = ลำดับการขายในเดือนนั้น เริ่มที่ 001 ทุกเดือน
//   (รีเซ็ตอัตโนมัติ เพราะ AccountCounter ใช้ type แยกตามเดือน
//   เช่น "SALE_2609", "SALE_2610" — เดือนใหม่ = type ใหม่ =
//   counter เริ่มจาก 1 เองโดยไม่ต้องเขียน logic reset แยกต่างหาก)
// - ถ้าเดือนไหนขายเกิน 999 ออเดอร์ เลขจะขยายเป็น 4+ หลักอัตโนมัติ
//   (เช่น 26091000) ไม่ error ไม่ตัดทิ้ง
//
// ต้องเรียกภายใน prisma.$transaction เท่านั้น (รับ tx เข้ามา)
//
// *** นี่คือฟังก์ชันที่ต้องใช้แทน getNextAccountSequence(tx, accountId, "SALE") ***
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
// EXPENSE CATEGORY HELPERS
//
// enum ExpenseCategory ที่มีจริงใน schema.prisma:
// SHIPPING_ACTUAL, PACKAGING, COMMISSION, OTHER_SALE_COST,
// RENT, SALARY, MARKETING, UTILITY, OTHER_GENERAL
// ======================================================

const EXPENSE_CATEGORY = {

    SHIPPING_ACTUAL: "SHIPPING_ACTUAL",

    OTHER_SALE_COST: "OTHER_SALE_COST"

}


function summarizeExpenses(expenses = []) {

    const result = {

        shippingExpense: 0,

        otherExpense: 0,

        otherGeneralExpense: 0,

        totalExpense: 0

    }


    for (const expense of expenses) {

        const amount = toNumber(expense.amount)

        result.totalExpense += amount


        if (expense.category === EXPENSE_CATEGORY.SHIPPING_ACTUAL) {

            result.shippingExpense += amount

        }
        else if (expense.category === EXPENSE_CATEGORY.OTHER_SALE_COST) {

            result.otherExpense += amount

        }
        else {

            result.otherGeneralExpense += amount

        }

    }


    return result

}


// ======================================================
// CREATE SALE
// POST /api/sale
//
// ==================================================
// BUSINESS LOGIC (อัปเดตล่าสุด)
// ==================================================
//
// - ราคาขายของแต่ละ item = ยอดที่ลูกค้าต้องจ่ายจริง
//   (ถือว่ารวมค่าส่งที่เรียกเก็บจากลูกค้าไว้แล้ว)
// - totalAmount = productTotal - discount
//   (ไม่บวกค่าส่งแยกต่างหากอีกต่อไป)
// - shippingActual (ค่าส่งจริง) และ otherExpense (ค่าใช้จ่ายอื่นๆ)
//   ไม่ใช่ส่วนหนึ่งของยอดที่ลูกค้าจ่าย แต่เป็น "ต้นทุน" ที่ถูกบันทึก
//   เป็น Expense record แยก ผูกกับ saleId เพื่อเอาไปหักตอนคำนวณกำไร
//   ในหน้าบัญชี/แดชบอร์ด
// - orderNo = เลขที่ออร์เดอร์ต่อ account รูปแบบ YYMMnnn
//   สร้างผ่าน getNextOrderNo() (แยกจาก id ซึ่งเป็น sequence กลาง
//   ของทั้ง table ข้าม account)
//
// รองรับ body:
// {
//   customerId,
//   items,
//   shippingActual,   // ค่าส่งจริง (ใหม่)
//   otherExpense,      // ค่าใช้จ่ายอื่นๆ (ใหม่)
//   shippingCost,      // ชื่อเดิมจาก frontend เก่า -> ตีความเป็น shippingActual
//                       // ถ้าไม่ได้ส่ง shippingActual มาโดยตรง
//   discount,
//   note,
//   soldAt
// }
//
// ==================================================

exports.create = async (req, res) => {

    try {

        const {
            customerId,
            items,

            // ==================================================
            // SHIPPING / OTHER EXPENSE (ต้นทุน ไม่ใช่ยอดขาย)
            // ==================================================

            shippingActual,

            otherExpense,

            // ชื่อเดิมจาก frontend รุ่นก่อน ("ค่าจัดส่ง")
            // ตีความว่าคือค่าส่งจริงถ้าไม่ได้ส่ง shippingActual มาตรงๆ
            shippingCost,

            discount = 0,
            note,

            soldAt: requestedSoldAt

        } = req.body


        // ==================================================
        // AUTH
        // ==================================================

        if (!req.user?.id) {

            return res.status(401).json({
                message: "Authentication required"
            })

        }


        const createdById = Number(req.user.id)


        if (!Number.isInteger(createdById) || createdById <= 0) {

            return res.status(401).json({
                message: "Invalid user"
            })

        }


        // ==================================================
        // ACCOUNT (multi-tenant scoping)
        // ==================================================

        const accountId = Number(req.user.accountId)


        if (!Number.isInteger(accountId) || accountId <= 0) {

            return res.status(401).json({
                message: "Invalid account"
            })

        }


        // ==================================================
        // ITEMS
        // ==================================================

        if (!Array.isArray(items) || items.length === 0) {

            return res.status(400).json({
                message: "Sale items are required"
            })

        }


        // ==================================================
        // NORMALIZE ITEMS
        // ==================================================

        const normalizedItems = items.map(item => ({

            consignmentItemId: Number(item.consignmentItemId),

            quantity: Number(item.quantity),

            salePrice: Number(item.salePrice)

        }))


        // ==================================================
        // VALIDATE ITEM ID
        // ==================================================

        for (const item of normalizedItems) {

            if (!Number.isInteger(item.consignmentItemId) || item.consignmentItemId <= 0) {

                return res.status(400).json({
                    message: "Invalid item id"
                })

            }

        }


        // ==================================================
        // DUPLICATE ITEM
        // ==================================================

        const itemIds = normalizedItems.map(item => item.consignmentItemId)


        if (new Set(itemIds).size !== itemIds.length) {

            return res.status(400).json({
                message: "Duplicate item"
            })

        }


        // ==================================================
        // VALIDATE QUANTITY
        // ==================================================

        for (const item of normalizedItems) {

            if (!toPositiveInteger(item.quantity)) {

                return res.status(400).json({
                    message: `Invalid quantity for item ${item.consignmentItemId}`
                })

            }

        }


        // ==================================================
        // VALIDATE SALE PRICE
        // ==================================================

        for (const item of normalizedItems) {

            if (!isValidNumber(item.salePrice) || Number(item.salePrice) < 0) {

                return res.status(400).json({
                    message: `Invalid sale price for item ${item.consignmentItemId}`
                })

            }

        }


        // ==================================================
        // PARSE REAL SALE TIME
        // ==================================================

        const soldAt = parseSoldAt(requestedSoldAt)


        if (!soldAt) {

            return res.status(400).json({
                message: "Invalid soldAt"
            })

        }


        // ==================================================
        // NORMALIZE SHIPPING ACTUAL / OTHER EXPENSE
        //
        // Priority ของ shippingActual:
        // 1. shippingActual (ชื่อใหม่)
        // 2. shippingCost (ชื่อเดิมจาก frontend เก่า)
        // 3. 0
        // ==================================================

        const shippingActualValue =
            isValidNumber(shippingActual)
                ? Number(shippingActual)
                : isValidNumber(shippingCost)
                    ? Number(shippingCost)
                    : 0


        const otherExpenseValue =
            isValidNumber(otherExpense)
                ? Number(otherExpense)
                : 0


        // ==================================================
        // VALIDATE SHIPPING ACTUAL
        // ==================================================

        if (!isValidNumber(shippingActualValue) || shippingActualValue < 0) {

            return res.status(400).json({
                message: "Invalid shipping actual"
            })

        }


        // ==================================================
        // VALIDATE OTHER EXPENSE
        // ==================================================

        if (!isValidNumber(otherExpenseValue) || otherExpenseValue < 0) {

            return res.status(400).json({
                message: "Invalid other expense"
            })

        }


        // ==================================================
        // VALIDATE DISCOUNT
        // ==================================================

        if (!isValidNumber(discount) || Number(discount) < 0) {

            return res.status(400).json({
                message: "Invalid discount"
            })

        }


        const discountAmount = Number(discount)


        // ==================================================
        // PRODUCT TOTAL
        //
        // ราคาขายของแต่ละ item ถือว่ารวมค่าส่งที่เรียกเก็บ
        // จากลูกค้าไว้แล้ว จึงไม่มีการบวก shipping แยกอีก
        // ==================================================

        const productTotal = normalizedItems.reduce(
            (total, item) => total + (item.quantity * item.salePrice),
            0
        )


        // ==================================================
        // DISCOUNT CANNOT EXCEED PRODUCT TOTAL
        // ==================================================

        if (discountAmount > productTotal) {

            return res.status(400).json({
                message: "Discount cannot exceed sale amount"
            })

        }


        // ==================================================
        // FINAL TOTAL (ยอดที่ลูกค้าต้องจ่ายจริง)
        // ==================================================

        const totalAmount = productTotal - discountAmount


        // ==================================================
        // CUSTOMER
        // ==================================================

        let customerIdValue = null


        if (customerId !== undefined && customerId !== null && customerId !== "") {

            customerIdValue = Number(customerId)


            if (!Number.isInteger(customerIdValue) || customerIdValue <= 0) {

                return res.status(400).json({
                    message: "Invalid customer id"
                })

            }

        }


        // ==================================================
        // TRANSACTION
        // ==================================================

        const sale = await prisma.$transaction(async tx => {

            // ======================================
            // CUSTOMER EXISTS
            //
            // ต้องเป็นลูกค้าของ account เดียวกันเท่านั้น
            // ======================================

            if (customerIdValue !== null) {

                const customer = await tx.customer.findFirst({

                    where: { id: customerIdValue, accountId },

                    select: { id: true }

                })


                if (!customer) {

                    throw new Error(`CUSTOMER_NOT_FOUND:${customerIdValue}`)

                }

            }


            // ======================================
            // GET STOCK
            //
            // ต้องเป็นสินค้าของ account เดียวกันเท่านั้น
            // ======================================

            const stocks = await tx.consignmentItem.findMany({

                where: { id: { in: itemIds }, accountId },

                select: {
                    id: true,
                    name: true,
                    quantity: true,
                    costPrice: true,
                    status: true,
                    soldAt: true
                }

            })


            // ======================================
            // CHECK MISSING PRODUCT
            // ======================================

            const existingIds = new Set(stocks.map(stock => stock.id))

            const missingId = itemIds.find(id => !existingIds.has(id))


            if (missingId) {

                throw new Error(`PRODUCT_NOT_FOUND:${missingId}`)

            }


            // ======================================
            // CHECK STOCK
            // ======================================

            for (const requestedItem of normalizedItems) {

                const stock = stocks.find(item => item.id === requestedItem.consignmentItemId)


                if (stock.status !== "AVAILABLE") {

                    throw new Error(`STOCK_NOT_AVAILABLE:${stock.id}`)

                }


                if (Number(stock.quantity) < requestedItem.quantity) {

                    throw new Error(
                        `INSUFFICIENT_STOCK:${stock.id}:${requestedItem.quantity}:${stock.quantity}`
                    )

                }

            }


            // ======================================
            // UPDATE STOCK
            // ======================================

            for (const requestedItem of normalizedItems) {

                const stock = stocks.find(item => item.id === requestedItem.consignmentItemId)

                const newQuantity = Number(stock.quantity) - requestedItem.quantity

                const becomesSold = newQuantity === 0

                const currentSoldAt = stock.soldAt

                const shouldUpdateSoldAt = !currentSoldAt || soldAt > currentSoldAt


                const updateData = {

                    quantity: newQuantity,

                    status: becomesSold ? "SOLD" : "AVAILABLE",

                    actualSalePrice: requestedItem.salePrice

                }


                if (shouldUpdateSoldAt) {

                    updateData.soldAt = soldAt

                }


                const result = await tx.consignmentItem.updateMany({

                    where: {
                        id: requestedItem.consignmentItemId,
                        accountId,
                        status: "AVAILABLE",
                        quantity: { gte: requestedItem.quantity }
                    },

                    data: updateData

                })


                if (result.count !== 1) {

                    throw new Error(`STOCK_NOT_AVAILABLE:${requestedItem.consignmentItemId}`)

                }

            }


            // ======================================
            // GET NEXT ORDER NUMBER (per account, atomic)
            //
            // ทำภายใน transaction เดียวกับการสร้าง sale เพื่อให้
            // orderNo เรียงลำดับตรงกับลำดับการสร้างจริงเสมอ และ
            // ปลอดภัยจากการขายพร้อมกันหลาย request ในบัญชีเดียวกัน
            //
            // *** แก้ไข: เปลี่ยนจาก getNextAccountSequence(tx, accountId, "SALE")
            // ซึ่ง return ค่าตัวเลขดิบ (1, 2, 3, ...) มาเป็น getNextOrderNo()
            // ที่ format เป็น YYMMnnn (เช่น 2609001) ตามที่ตั้งใจไว้ ***
            // ======================================

            const nextOrderNo = await getNextOrderNo(tx, accountId)


            // ======================================
            // CREATE SALE
            //
            // shippingCharged: เก็บไว้เท่ากับ 0 เสมอสำหรับ Sale ใหม่
            // (เลิกใช้แนวคิด "ค่าส่งที่เรียกเก็บแยก" แล้ว)
            //
            // shippingActual: ยังคง sync ไว้ที่ field นี้เพื่อดูง่าย
            // แต่ตัวที่ใช้คำนวณกำไรจริงคือ Expense record ด้านล่าง
            //
            // orderNo: เลขที่ออร์เดอร์ต่อ account รูปแบบ YYMMnnn
            // ======================================

            const newSale = await tx.sale.create({

                data: {

                    accountId,

                    orderNo: nextOrderNo,

                    customerId: customerIdValue,

                    createdById,

                    totalAmount,

                    shippingCharged: 0,

                    shippingActual: shippingActualValue,

                    discount: discountAmount,

                    status: "COMPLETED",

                    note: typeof note === "string" ? (note.trim() || null) : null,

                    soldAt: soldAt

                }

            })


            // ======================================
            // CREATE SALE ITEMS
            // ======================================

            await tx.saleItem.createMany({

                data: normalizedItems.map(item => {

                    const stock = stocks.find(stock => stock.id === item.consignmentItemId)

                    return {

                        saleId: newSale.id,

                        consignmentItemId: item.consignmentItemId,

                        salePrice: item.salePrice,

                        costPriceAtSale: Number(stock.costPrice),

                        quantity: item.quantity

                    }

                })

            })


            // ======================================
            // CREATE EXPENSE RECORDS
            //
            // shippingActual และ otherExpense ผูกกับ saleId
            // เพื่อให้หน้าบัญชี/แดชบอร์ดดึงไปรวมยอดแยกหมวดได้
            // (ระบบ accounting/dashboard อ่านจาก Expense.category
            // อยู่แล้ว ไม่ต้องแก้ schema เพิ่ม)
            //
            // ใช้ orderNo (ไม่ใช่ id) ในชื่อ expense เพื่อให้ตรงกับ
            // เลขที่ออร์เดอร์ที่ผู้ใช้เห็นจริง
            // ======================================

            const expenseRecords = []


            if (shippingActualValue > 0) {

                expenseRecords.push({

                    accountId,

                    name: `ค่าส่งจริง - Order #${newSale.orderNo}`,

                    category: EXPENSE_CATEGORY.SHIPPING_ACTUAL,

                    amount: shippingActualValue,

                    saleId: newSale.id,

                    createdById

                })

            }


            if (otherExpenseValue > 0) {

                expenseRecords.push({

                    accountId,

                    name: `ค่าใช้จ่ายอื่นๆ - Order #${newSale.orderNo}`,

                    category: EXPENSE_CATEGORY.OTHER_SALE_COST,

                    amount: otherExpenseValue,

                    saleId: newSale.id,

                    createdById

                })

            }


            if (expenseRecords.length > 0) {

                await tx.expense.createMany({ data: expenseRecords })

            }


            // ======================================
            // PRODUCT COST (สำหรับ AuditLog)
            // ======================================

            const productCost = normalizedItems.reduce((total, item) => {

                const stock = stocks.find(stock => stock.id === item.consignmentItemId)

                return total + (item.quantity * Number(stock.costPrice))

            }, 0)


            const profit = totalAmount - shippingActualValue - otherExpenseValue - productCost


            // ======================================
            // AUDIT LOG
            // ======================================

            await tx.auditLog.create({

                data: {

                    userId: createdById,

                    action: "CREATE",

                    entity: "Sale",

                    entityId: newSale.id,

                    details: JSON.stringify({

                        orderNo: newSale.orderNo,

                        customerId: customerIdValue,

                        productTotal,

                        shippingActual: shippingActualValue,

                        otherExpense: otherExpenseValue,

                        discount: discountAmount,

                        totalAmount,

                        productCost,

                        profit,

                        soldAt: soldAt.toISOString(),

                        items: normalizedItems.map(item => {

                            const stock = stocks.find(stock => stock.id === item.consignmentItemId)

                            const costPriceAtSale = Number(stock.costPrice)

                            return {

                                consignmentItemId: item.consignmentItemId,

                                quantity: item.quantity,

                                salePrice: item.salePrice,

                                costPriceAtSale,

                                lineTotal: item.quantity * item.salePrice,

                                productCost: item.quantity * costPriceAtSale,

                                productProfit: (item.quantity * item.salePrice) - (item.quantity * costPriceAtSale)

                            }

                        })

                    })

                }

            })


            // ======================================
            // RETURN COMPLETE SALE
            // ======================================

            return await tx.sale.findUnique({

                where: { id: newSale.id },

                include: {

                    customer: true,

                    items: {

                        include: {

                            consignmentItem: {

                                include: { owner: true }

                            }

                        }

                    },

                    expenses: true,

                    createdBy: {

                        select: { id: true, name: true, email: true }

                    }

                }

            })

        })


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(201).json({

            message: "Sale created successfully",

            sale

        })


    } catch (err) {

        console.error("CREATE SALE ERROR:", err)


        if (err.message?.startsWith("CUSTOMER_NOT_FOUND:")) {

            return res.status(404).json({
                message: "Customer not found",
                customerId: Number(err.message.split(":")[1])
            })

        }


        if (err.message?.startsWith("PRODUCT_NOT_FOUND:")) {

            return res.status(404).json({
                message: "Product not found",
                consignmentItemId: Number(err.message.split(":")[1])
            })

        }


        if (err.message?.startsWith("INSUFFICIENT_STOCK:")) {

            const parts = err.message.split(":")

            return res.status(409).json({
                message: "Insufficient stock",
                consignmentItemId: Number(parts[1]),
                requestedQuantity: Number(parts[2]),
                availableQuantity: Number(parts[3])
            })

        }


        if (err.message?.startsWith("STOCK_NOT_AVAILABLE:")) {

            return res.status(409).json({
                message: "Product is not available",
                consignmentItemId: Number(err.message.split(":")[1])
            })

        }


        return res.status(500).json({
            message: "Server Error"
        })

    }

}


// ======================================================
// LIST SALES
// GET /api/sales
// ======================================================

exports.list = async (req, res) => {

    try {

        if (!req.user?.accountId) {

            return res.status(401).json({
                message: "Invalid account"
            })

        }


        const { range, startDate, endDate } = req.query

        const where = {
            accountId: Number(req.user.accountId)
        }


        if (startDate || endDate) {

            where.soldAt = {}

            if (startDate) {

                const start = new Date(`${startDate}T00:00:00+07:00`)

                if (Number.isNaN(start.getTime())) {

                    return res.status(400).json({ message: "Invalid start date" })

                }

                where.soldAt.gte = start

            }

            if (endDate) {

                const end = new Date(`${endDate}T23:59:59.999+07:00`)

                if (Number.isNaN(end.getTime())) {

                    return res.status(400).json({ message: "Invalid end date" })

                }

                where.soldAt.lte = end

            }

        }
        else if (range) {

            const now = new Date()

            const { year, month, day } = getBangkokDateParts(now)

            let startDateValue = null


            if (range === "today") {

                startDateValue = formatDateOnly(year, month, day)

            }
            else if (range === "week") {

                const bangkokToday = new Date(`${formatDateOnly(year, month, day)}T00:00:00+07:00`)

                const weekday = bangkokToday.getUTCDay()

                const diff = weekday === 0 ? 6 : weekday - 1

                bangkokToday.setUTCDate(bangkokToday.getUTCDate() - diff)

                startDateValue = bangkokToday.toISOString().slice(0, 10)

            }
            else if (range === "month") {

                startDateValue = `${year}-${String(month).padStart(2, "0")}-01`

            }
            else if (range === "year") {

                startDateValue = `${year}-01-01`

            }
            else if (range === "all") {

                startDateValue = null

            }
            else {

                return res.status(400).json({ message: "Invalid range" })

            }


            if (startDateValue) {

                where.soldAt = {
                    gte: new Date(`${startDateValue}T00:00:00+07:00`)
                }

            }

        }


        // ==================================================
        // GET SALES
        //
        // เพิ่ม expenses: true เพื่อให้หน้า list ก็เห็นยอด
        // ค่าส่งจริง/ค่าใช้จ่ายอื่นๆ แยกหมวดได้เหมือนหน้า accounting
        //
        // orderNo จะติดมากับ ...sale อัตโนมัติ (field ปกติของ Sale)
        // ==================================================

        const sales = await prisma.sale.findMany({

            where,

            include: {

                customer: true,

                items: {

                    include: {

                        consignmentItem: {

                            include: { owner: true }

                        }

                    }

                },

                expenses: true,

                returns: true,

                createdBy: {

                    select: { id: true, name: true, email: true }

                }

            },

            orderBy: [
                { soldAt: "desc" },
                { createdAt: "desc" }
            ]

        })


        // ==================================================
        // FORMAT
        // ==================================================

        const formattedSales = sales.map(sale => {

            const formattedItems = sale.items.map(item => {

                const quantity = toNumber(item.quantity)

                const salePrice = toNumber(item.salePrice)

                const costPriceAtSale = toNumber(item.costPriceAtSale)

                return {

                    ...item,

                    quantity,

                    salePrice,

                    costPriceAtSale,

                    lineTotal: quantity * salePrice,

                    productCost: quantity * costPriceAtSale,

                    productProfit: (quantity * salePrice) - (quantity * costPriceAtSale)

                }

            })


            const productTotal = formattedItems.reduce((total, item) => total + item.lineTotal, 0)

            const productCost = formattedItems.reduce((total, item) => total + item.productCost, 0)

            const expenseBreakdown = summarizeExpenses(sale.expenses)

            const refundTotal = (sale.returns || []).reduce(
                (total, r) => total + toNumber(r.refundAmount) + toNumber(r.refundShipping),
                0
            )

            const profit =
                toNumber(sale.totalAmount) -
                expenseBreakdown.totalExpense -
                productCost -
                refundTotal


            return {

                ...sale,

                orderNo: sale.orderNo,

                soldAt: sale.soldAt,

                createdAt: sale.createdAt,

                totalAmount: toNumber(sale.totalAmount),

                // เก็บไว้เพื่อ backward-compat กับ record เก่า
                shippingCharged: toNumber(sale.shippingCharged),

                shippingActual: toNumber(sale.shippingActual),

                discount: toNumber(sale.discount),

                productTotal,

                productCost,

                shippingExpense: expenseBreakdown.shippingExpense,

                otherExpense: expenseBreakdown.otherExpense,

                otherGeneralExpense: expenseBreakdown.otherGeneralExpense,

                totalExpense: expenseBreakdown.totalExpense,

                refundTotal,

                profit,

                items: formattedItems

            }

        })


        return res.json({

            count: formattedSales.length,

            sales: formattedSales

        })


    } catch (err) {

        console.error("LIST SALES ERROR:", err)

        return res.status(500).json({
            message: "Server Error"
        })

    }

}


// ======================================================
// READ SALE
// GET /api/sale/:id
// ======================================================

exports.read = async (req, res) => {

    try {

        if (!req.user?.accountId) {

            return res.status(401).json({
                message: "Invalid account"
            })

        }


        const id = Number(req.params.id)


        if (!Number.isInteger(id) || id <= 0) {

            return res.status(400).json({ message: "Invalid sale id" })

        }


        // ==================================================
        // ต้องเป็น sale ของ account ตัวเองเท่านั้น
        // ใช้ findFirst แทน findUnique เพราะกรองมากกว่า 1 field
        // ==================================================

        const sale = await prisma.sale.findFirst({

            where: {
                id,
                accountId: Number(req.user.accountId)
            },

            include: {

                customer: true,

                items: {

                    include: {

                        consignmentItem: { include: { owner: true } },

                        returns: true

                    }

                },

                expenses: true,

                returns: true,

                createdBy: {

                    select: { id: true, name: true, email: true }

                }

            }

        })


        if (!sale) {

            return res.status(404).json({ message: "Sale not found" })

        }


        const formattedItems = sale.items.map(item => {

            const quantity = toNumber(item.quantity)

            const salePrice = toNumber(item.salePrice)

            const costPriceAtSale = toNumber(item.costPriceAtSale)

            return {

                ...item,

                quantity,

                salePrice,

                costPriceAtSale,

                lineTotal: quantity * salePrice,

                productCost: quantity * costPriceAtSale,

                productProfit: (quantity * salePrice) - (quantity * costPriceAtSale)

            }

        })


        const productTotal = formattedItems.reduce((total, item) => total + item.lineTotal, 0)

        const productCost = formattedItems.reduce((total, item) => total + item.productCost, 0)

        const expenseBreakdown = summarizeExpenses(sale.expenses)

        const refundTotal = (sale.returns || []).reduce(
            (total, r) => total + toNumber(r.refundAmount) + toNumber(r.refundShipping),
            0
        )

        const profit =
            toNumber(sale.totalAmount) -
            expenseBreakdown.totalExpense -
            productCost -
            refundTotal


        return res.json({

            sale: {

                ...sale,

                orderNo: sale.orderNo,

                soldAt: sale.soldAt,

                createdAt: sale.createdAt,

                totalAmount: toNumber(sale.totalAmount),

                shippingCharged: toNumber(sale.shippingCharged),

                shippingActual: toNumber(sale.shippingActual),

                discount: toNumber(sale.discount),

                productTotal,

                productCost,

                shippingExpense: expenseBreakdown.shippingExpense,

                otherExpense: expenseBreakdown.otherExpense,

                otherGeneralExpense: expenseBreakdown.otherGeneralExpense,

                totalExpense: expenseBreakdown.totalExpense,

                refundTotal,

                profit,

                items: formattedItems

            }

        })

    } catch (err) {

        console.error("READ SALE ERROR:", err)

        return res.status(500).json({
            message: "Server Error"
        })

    }

}