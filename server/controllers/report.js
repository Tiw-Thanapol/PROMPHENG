const prisma = require('../config/prisma')


// ======================================================
// HELPERS
// ======================================================

function num(value) {

    const n = Number(value)

    return Number.isFinite(n)
        ? n
        : 0

}


function round(value) {

    return Number(
        num(value).toFixed(2)
    )

}


// ======================================================
// ACCOUNT ISOLATION
//
// CRITICAL:
//
// เดิมทั้งไฟล์นี้ (summary + salesTrend) ไม่ scope
// accountId เลยสักจุดเดียว ทำให้ query ดึง Sale/Expense
// ของทุก account มารวมกันหมด — รายงาน/กราฟ trend ที่
// แต่ละร้านเห็น จะเป็นยอดรวมข้ามร้านทั้งระบบ ไม่ใช่แค่
// ของร้านตัวเอง ต้องดึง accountId จาก req.user แล้ว
// แปะเข้าไปในทุก where ด้านล่าง
// ======================================================

function getAccountId(req) {

    const accountId =
        Number(req.user?.accountId)


    if (
        !Number.isInteger(accountId) ||
        accountId <= 0
    ) {

        return null

    }


    return accountId

}


// ======================================================
// EXPENSE CATEGORY
// ======================================================

const EXPENSE_CATEGORY = {

    SHIPPING_ACTUAL: 'SHIPPING_ACTUAL',

    OTHER_SALE_COST: 'OTHER_SALE_COST'

}


// ======================================================
// DATE HELPERS
// ======================================================

// ------------------------------------------------------
// สร้างช่วงเวลาโดยยึด Asia/Bangkok (UTC+7)
// ------------------------------------------------------

function startOfBangkokDay(dateString) {

    const date =
        new Date(
            `${dateString}T00:00:00+07:00`
        )

    return date

}


function endOfBangkokDay(dateString) {

    const date =
        new Date(
            `${dateString}T23:59:59.999+07:00`
        )

    return date

}


// ------------------------------------------------------
// ตรวจสอบ YYYY-MM-DD
// ------------------------------------------------------

function isValidDateString(value) {

    if (
        typeof value !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {

        return false

    }


    const date =
        new Date(
            `${value}T00:00:00+07:00`
        )


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return false

    }


    const [
        year,
        month,
        day
    ] =
        value
            .split('-')
            .map(Number)


    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() + 1 === month &&
        date.getUTCDate() === day
    )

}


// ======================================================
// DATE FILTER
// ======================================================

function buildDateFilter(from, to) {

    const createdAt = {}


    if (from) {

        if (
            !isValidDateString(from)
        ) {

            return {
                error:
                    'Invalid from date'
            }

        }


        const startDate =
            startOfBangkokDay(
                from
            )


        createdAt.gte =
            startDate

    }


    if (to) {

        if (
            !isValidDateString(to)
        ) {

            return {
                error:
                    'Invalid to date'
            }

        }


        const endDate =
            endOfBangkokDay(
                to
            )


        createdAt.lte =
            endDate

    }


    if (
        from &&
        to
    ) {

        const start =
            startOfBangkokDay(
                from
            )

        const end =
            endOfBangkokDay(
                to
            )


        if (
            start > end
        ) {

            return {
                error:
                    'from date must be before or equal to to date'
            }

        }

    }


    return Object.keys(createdAt).length
        ? { createdAt }
        : {}

}


// ======================================================
// BANGKOK DATE
// ======================================================

function getBangkokDate(date) {

    return new Intl.DateTimeFormat(
        'en-CA',
        {
            timeZone:
                'Asia/Bangkok',

            year:
                'numeric',

            month:
                '2-digit',

            day:
                '2-digit'
        }
    ).format(
        new Date(date)
    )

}


// ======================================================
// SUMMARY
// GET /api/reports/summary
//
// ==================================================
// BUSINESS LOGIC (อัปเดตล่าสุด - ตรงกับ orders.js / dashBoard.js)
// ==================================================
//
// - salePrice ต่อชิ้น = ราคาขายจริงที่รวมค่าส่งที่เรียกเก็บจาก
//   ลูกค้าไว้แล้ว (ไม่มี field "shipping income" แยกอีกต่อไป)
// - ค่าส่งจริง (SHIPPING_ACTUAL) และค่าใช้จ่ายอื่นๆ (OTHER_SALE_COST)
//   คือ Expense ที่ผูกกับ Sale แล้วนำมา "หัก" ตอนคำนวณกำไร
//   ไม่ใช่นำมา "บวก" เป็นรายได้เหมือนโค้ดเดิม
// - sale.shippingCost ไม่มีอยู่จริงใน schema (bug เดิม) ถูกลบทิ้ง
// - เพิ่ม ACCOUNT ISOLATION: ทุก query ต้อง scope ด้วย accountId
//   ของผู้ใช้ที่ล็อกอินอยู่ (เดิมไม่มีเลย ทำให้รายงานรวมข้าม
//   account ทั้งระบบ)
// ==================================================
// ======================================================

exports.summary = async (
    req,
    res
) => {

    try {

        // ==================================================
        // ACCOUNT ISOLATION
        // ==================================================

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(
                401
            ).json({

                message:
                    'Unauthorized'

            })

        }


        const {
            from,
            to
        } = req.query


        // ==================================================
        // DATE FILTER
        // ==================================================

        const dateFilter =
            buildDateFilter(
                from,
                to
            )


        if (
            dateFilter.error
        ) {

            return res.status(
                400
            ).json({

                message:
                    dateFilter.error

            })

        }


        // ==================================================
        // COMPLETED SALES
        // ==================================================

        const sales =
            await prisma.sale.findMany({

                where:
                    dateFilter.createdAt
                        ? {

                            accountId,

                            status:
                                'COMPLETED',

                            createdAt:
                                dateFilter.createdAt

                        }
                        : {

                            accountId,

                            status:
                                'COMPLETED'

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

                                    costPrice:
                                        true,

                                    actualSalePrice:
                                        true,

                                    soldAt:
                                        true

                                }

                            }

                        }

                    }

                },

                orderBy: {

                    createdAt:
                        'desc'

                }

            })


        // ==================================================
        // ALL SALES
        // ==================================================

        const allSales =
            await prisma.sale.findMany({

                where:
                    dateFilter.createdAt
                        ? {

                            accountId,

                            createdAt:
                                dateFilter.createdAt

                        }
                        : {

                            accountId

                        },

                select: {

                    id:
                        true,

                    status:
                        true

                }

            })


        // ==================================================
        // EXPENSES (ดึง category มาด้วย เพื่อแยกหมวดค่าส่ง/อื่นๆ)
        // ==================================================

        const expenses =
            await prisma.expense.findMany({

                where:
                    dateFilter.createdAt
                        ? {

                            accountId,

                            createdAt:
                                dateFilter.createdAt

                        }
                        : {

                            accountId

                        },

                select: {

                    amount:
                        true,

                    category:
                        true

                }

            })


        // ==================================================
        // COUNTERS
        // ==================================================

        const totalSaleCount =
            allSales.length


        const completedSales =
            allSales.filter(
                sale =>
                    sale.status ===
                    'COMPLETED'
            ).length


        const cancelledSales =
            allSales.filter(
                sale =>
                    sale.status ===
                    'CANCELLED'
            ).length


        // ==================================================
        // MONEY
        // ==================================================

        let soldCount = 0

        let grossProductSales = 0

        let totalDiscount = 0

        let totalCost = 0


        // ==================================================
        // PROCESS SALES
        //
        // หมายเหตุ: ลบ totalShipping += sale.shippingCost ออก
        // เพราะ field นี้ไม่มีจริง และค่าส่งไม่ใช่รายได้อีกต่อไป
        // ==================================================

        for (
            const sale
            of sales
        ) {

            totalDiscount +=
                num(
                    sale.discount
                )


            for (
                const item
                of sale.items
            ) {

                const salePrice =
                    num(
                        item.salePrice
                    )


                const costPrice =
                    num(
                        item
                            .consignmentItem
                            ?.costPrice
                    )


                soldCount++


                grossProductSales +=
                    salePrice


                totalCost +=
                    costPrice

            }

        }


        // ==================================================
        // EXPENSES BREAKDOWN
        //
        // แยกหมวดค่าส่งจริง / ค่าใช้จ่ายอื่นๆ ออกมาให้ชัดเจน
        // (ใช้โชว์หน้ารายงาน) totalExpenses รวมทุกหมวด
        // ==================================================

        let totalShippingExpense = 0

        let totalOtherExpense = 0

        let totalExpenses = 0


        for (
            const expense
            of expenses
        ) {

            const amount =
                num(
                    expense.amount
                )


            totalExpenses +=
                amount


            if (
                expense.category ===
                EXPENSE_CATEGORY.SHIPPING_ACTUAL
            ) {

                totalShippingExpense +=
                    amount

            }
            else if (
                expense.category ===
                EXPENSE_CATEGORY.OTHER_SALE_COST
            ) {

                totalOtherExpense +=
                    amount

            }

        }


        // ==================================================
        // SALES CALCULATION
        //
        // grossSales = grossProductSales เท่านั้น
        // (ราคาต่อชิ้นรวมค่าส่งที่เรียกเก็บไว้แล้ว ไม่มีค่าส่ง
        // แยกมาบวกซ้ำอีก)
        // ==================================================

        const grossSales =
            grossProductSales


        const netProductSales =
            Math.max(

                0,

                grossProductSales -
                totalDiscount

            )


        const netRevenue =
            netProductSales


        // ==================================================
        // PROFIT
        //
        // grossProfit = รายได้ - ต้นทุนสินค้า
        // netProfit   = grossProfit - ค่าใช้จ่ายทั้งหมด
        //               (รวมค่าส่งจริง + ค่าใช้จ่ายอื่นๆ + อื่นๆ)
        // ==================================================

        const grossProfit =
            netRevenue -
            totalCost


        const netProfit =
            grossProfit -
            totalExpenses


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.json({

            summary: {

                totalSaleCount,

                completedSales,

                cancelledSales,

                soldCount,

                grossSales:
                    round(
                        grossSales
                    ),

                grossProductSales:
                    round(
                        grossProductSales
                    ),

                totalDiscount:
                    round(
                        totalDiscount
                    ),

                netProductSales:
                    round(
                        netProductSales
                    ),

                netRevenue:
                    round(
                        netRevenue
                    ),

                totalCost:
                    round(
                        totalCost
                    ),

                grossProfit:
                    round(
                        grossProfit
                    ),

                // ==================================================
                // ค่าใช้จ่าย แยกหมวด (ค่าส่งจริง / อื่นๆ) + รวมทุกหมวด
                // ==================================================

                shippingExpense:
                    round(
                        totalShippingExpense
                    ),

                otherExpense:
                    round(
                        totalOtherExpense
                    ),

                totalExpenses:
                    round(
                        totalExpenses
                    ),

                netProfit:
                    round(
                        netProfit
                    )

            }

        })

    } catch (err) {

        console.error(
            'REPORTS SUMMARY ERROR:',
            err
        )


        return res.status(
            500
        ).json({

            message:
                'Server Error',

            error:
                err.message

        })

    }

}


// ======================================================
// SALES TREND
// GET /api/reports/sales-trend
//
// ==================================================
// อัปเดตตาม business logic ใหม่ เหมือนกับ summary() ด้านบน:
// - ไม่มี "shipping" เป็นรายได้ต่อวันอีกต่อไป
// - เพิ่ม shippingExpense / otherExpense / totalExpense ต่อวัน
//   โดยดึงจาก Expense table (แยกตามวันแบบ Bangkok date)
// - netProfit ต่อวัน = grossProfit - totalExpense
// - เพิ่ม ACCOUNT ISOLATION: ทุก query ต้อง scope ด้วย accountId
//   (เดิมไม่มีเลย เหมือนกับ summary() ด้านบน)
//
// ⚠️ BREAKING CHANGE สำหรับ frontend ที่เคยอ่าน field
// "row.shipping" และ "row.netSales" (ที่เคยรวมค่าส่ง) —
// ต้องแก้ไปใช้ shippingExpense/otherExpense/totalExpense แทน
// ==================================================
// ======================================================

exports.salesTrend = async (
    req,
    res
) => {

    try {

        // ==================================================
        // ACCOUNT ISOLATION
        // ==================================================

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(
                401
            ).json({

                message:
                    'Unauthorized'

            })

        }


        const {
            from,
            to
        } = req.query


        // ==================================================
        // DATE FILTER
        // ==================================================

        const dateFilter =
            buildDateFilter(
                from,
                to
            )


        if (
            dateFilter.error
        ) {

            return res.status(
                400
            ).json({

                message:
                    dateFilter.error

            })

        }


        // ==================================================
        // LOAD SALES
        // ==================================================

        const sales =
            await prisma.sale.findMany({

                where:
                    dateFilter.createdAt
                        ? {

                            accountId,

                            status:
                                'COMPLETED',

                            createdAt:
                                dateFilter.createdAt

                        }
                        : {

                            accountId,

                            status:
                                'COMPLETED'

                        },

                include: {

                    items: {

                        select: {

                            id:
                                true,

                            salePrice:
                                true,

                            quantity:
                                true,

                            consignmentItem: {

                                select: {

                                    id:
                                        true,

                                    costPrice:
                                        true,

                                    soldAt:
                                        true

                                }

                            }

                        }

                    }

                },

                orderBy: {

                    createdAt:
                        'asc'

                }

            })


        // ==================================================
        // LOAD EXPENSES (ในช่วงเวลาเดียวกัน สำหรับ breakdown ต่อวัน)
        // ==================================================

        const expenses =
            await prisma.expense.findMany({

                where:
                    dateFilter.createdAt
                        ? {

                            accountId,

                            createdAt:
                                dateFilter.createdAt

                        }
                        : {

                            accountId

                        },

                select: {

                    amount:
                        true,

                    category:
                        true,

                    createdAt:
                        true

                },

                orderBy: {

                    createdAt:
                        'asc'

                }

            })


        // ==================================================
        // BUILD DAILY DATA
        // ==================================================

        const daily = {}


        function ensureRow(date) {

            if (
                !daily[date]
            ) {

                daily[date] = {

                    date,

                    orders:
                        0,

                    items:
                        0,

                    grossProductSales:
                        0,

                    discount:
                        0,

                    netProductSales:
                        0,

                    netSales:
                        0,

                    productCost:
                        0,

                    shippingExpense:
                        0,

                    otherExpense:
                        0,

                    totalExpense:
                        0,

                    grossProfit:
                        0,

                    netProfit:
                        0

                }

            }


            return daily[date]

        }


        for (
            const sale
            of sales
        ) {

            const date =
                getBangkokDate(
                    sale.createdAt
                )


            const row =
                ensureRow(
                    date
                )


            // ==================================================
            // ORDER
            // ==================================================

            row.orders++


            // ==================================================
            // DISCOUNT
            // ==================================================

            row.discount +=
                num(
                    sale.discount
                )


            // ==================================================
            // ITEMS
            // ==================================================

            for (
                const item
                of sale.items
            ) {

                const quantity =
                    Math.max(
                        1,
                        Math.floor(
                            num(
                                item.quantity
                            )
                        )
                    )


                const salePrice =
                    num(
                        item.salePrice
                    )


                const costPrice =
                    num(
                        item
                            .consignmentItem
                            ?.costPrice
                    )


                row.items +=
                    quantity


                row.grossProductSales +=
                    salePrice *
                    quantity


                row.productCost +=
                    costPrice *
                    quantity

            }


            // ==================================================
            // NET PRODUCT SALES
            // ==================================================

            row.netProductSales =
                Math.max(

                    0,

                    row.grossProductSales -
                    row.discount

                )


            // ==================================================
            // NET SALES
            //
            // ไม่บวกค่าส่งแล้ว เพราะราคาต่อชิ้นรวมค่าส่งที่เรียก
            // เก็บจากลูกค้าไว้แล้ว
            // ==================================================

            row.netSales =
                row.netProductSales


            // ==================================================
            // GROSS PROFIT (ก่อนหักค่าใช้จ่าย)
            // ==================================================

            row.grossProfit =
                row.netSales -
                row.productCost

        }


        // ==================================================
        // MERGE EXPENSES INTO DAILY ROWS
        // ==================================================

        for (
            const expense
            of expenses
        ) {

            const date =
                getBangkokDate(
                    expense.createdAt
                )


            const row =
                ensureRow(
                    date
                )


            const amount =
                num(
                    expense.amount
                )


            row.totalExpense +=
                amount


            if (
                expense.category ===
                EXPENSE_CATEGORY.SHIPPING_ACTUAL
            ) {

                row.shippingExpense +=
                    amount

            }
            else if (
                expense.category ===
                EXPENSE_CATEGORY.OTHER_SALE_COST
            ) {

                row.otherExpense +=
                    amount

            }

        }


        // ==================================================
        // NET PROFIT ต่อวัน (หลังรวม expense ทุกวันแล้ว)
        // ==================================================

        for (
            const row
            of Object.values(daily)
        ) {

            row.netProfit =
                row.grossProfit -
                row.totalExpense

        }


        // ==================================================
        // FORMAT TREND
        // ==================================================

        const trend =
            Object.values(
                daily
            )
                .sort(
                    (a, b) =>
                        a.date.localeCompare(
                            b.date
                        )
                )
                .map(
                    row => ({

                        date:
                            row.date,

                        orders:
                            row.orders,

                        items:
                            row.items,

                        grossProductSales:
                            round(
                                row.grossProductSales
                            ),

                        discount:
                            round(
                                row.discount
                            ),

                        netProductSales:
                            round(
                                row.netProductSales
                            ),

                        netSales:
                            round(
                                row.netSales
                            ),

                        productCost:
                            round(
                                row.productCost
                            ),

                        shippingExpense:
                            round(
                                row.shippingExpense
                            ),

                        otherExpense:
                            round(
                                row.otherExpense
                            ),

                        totalExpense:
                            round(
                                row.totalExpense
                            ),

                        grossProfit:
                            round(
                                row.grossProfit
                            ),

                        netProfit:
                            round(
                                row.netProfit
                            )

                    })
                )


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.json({

            from:
                from || null,

            to:
                to || null,

            count:
                trend.length,

            trend

        })

    } catch (err) {

        console.error(
            'SALES TREND ERROR:',
            err
        )


        return res.status(
            500
        ).json({

            message:
                'Server Error',

            error:
                err.message

        })

    }

}