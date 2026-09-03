const prisma = require("../config/prisma")


// ======================================================
// HELPERS
// ======================================================

function toNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0
    }

    const number = Number(value)

    return Number.isFinite(number)
        ? number
        : 0
}


function round(value) {

    return Number(
        toNumber(value).toFixed(2)
    )

}


function normalizeExpenseCategory(value) {

    return String(value || "OTHER")
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_")

}


// ======================================================
// BANGKOK DATE
// ======================================================

const BANGKOK_TIMEZONE = "Asia/Bangkok"


function getBangkokDate(value) {

    const date = new Date(value)

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null
    }

    return new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone: BANGKOK_TIMEZONE,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    ).format(date)

}


function getBangkokTodayString() {

    return getBangkokDate(
        new Date()
    )

}


function parseDateStringUTC(dateString) {

    const parts =
        String(dateString)
            .split("-")
            .map(Number)

    if (
        parts.length !== 3 ||
        parts.some(
            value => !Number.isInteger(value)
        )
    ) {
        return null
    }

    const [
        year,
        month,
        day
    ] = parts

    return new Date(
        Date.UTC(
            year,
            month - 1,
            day
        )
    )

}


function formatDateStringUTC(date) {

    return date
        .toISOString()
        .slice(0, 10)

}


function shiftDateString(
    dateString,
    days
) {

    const date =
        parseDateStringUTC(
            dateString
        )

    if (!date) {
        return null
    }

    date.setUTCDate(
        date.getUTCDate() + days
    )

    return formatDateStringUTC(
        date
    )

}


// Monday - Sunday
function getWeekStartDateString(
    dateString
) {

    const date =
        parseDateStringUTC(
            dateString
        )

    if (!date) {
        return null
    }

    const day =
        date.getUTCDay()

    const diff =
        day === 0
            ? 6
            : day - 1

    return shiftDateString(
        dateString,
        -diff
    )

}


function bangkokStartOfDay(
    dateString
) {

    return new Date(
        `${dateString}T00:00:00.000+07:00`
    )

}


function bangkokEndOfDay(
    dateString
) {

    return new Date(
        `${dateString}T23:59:59.999+07:00`
    )

}


// ======================================================
// PERIOD
// ======================================================

function getPeriodFilter(
    period,
    req
) {

    if (
        period === "all"
    ) {

        return {}

    }


    if (
        period === "custom"
    ) {

        const createdAt = {}


        if (
            req.query.from
        ) {

            createdAt.gte =
                bangkokStartOfDay(
                    req.query.from
                )

        }


        if (
            req.query.to
        ) {

            createdAt.lte =
                bangkokEndOfDay(
                    req.query.to
                )

        }


        if (
            Object.keys(
                createdAt
            ).length === 0
        ) {

            return {}

        }


        return {
            createdAt
        }

    }


    const today =
        getBangkokTodayString()


    let from =
        today

    let to =
        today


    switch (
        period
    ) {

        case "today":

            from = today
            to = today

            break


        case "week":

            from =
                getWeekStartDateString(
                    today
                )

            to = today

            break


        case "month": {

            const [
                year,
                month
            ] =
                today.split("-")

            from =
                `${year}-${month}-01`

            to = today

            break
        }


        case "year": {

            const [
                year
            ] =
                today.split("-")

            from =
                `${year}-01-01`

            to = today

            break
        }


        default:

            from = today
            to = today

            break

    }


    return {

        createdAt: {

            gte:
                bangkokStartOfDay(
                    from
                ),

            lte:
                bangkokEndOfDay(
                    to
                )

        }

    }

}


// ======================================================
// EXPENSE
// ======================================================

function getExpenseBreakdown(
    expenses = []
) {

    const result = {

        shippingExpense: 0,

        packagingExpense: 0,

        platformFee: 0,

        otherExpense: 0,

        total: 0

    }


    for (
        const expense
        of expenses
    ) {

        const amount =
            toNumber(
                expense.amount
            )


        result.total +=
            amount


        const category =
            normalizeExpenseCategory(
                expense.category
            )


        switch (
            category
        ) {

            case "SHIPPING_ACTUAL":

                result.shippingExpense +=
                    amount

                break


            case "PACKAGING":

                result.packagingExpense +=
                    amount

                break


            case "PLATFORM_FEE":

                result.platformFee +=
                    amount

                break


            default:

                result.otherExpense +=
                    amount

                break

        }

    }


    return result

}


// ======================================================
// TREND
// ======================================================

function createTrend(
    date
) {

    return {

        date,

        orders: 0,

        items: 0,

        grossSales: 0,

        shippingRevenue: 0,

        discount: 0,

        refund: 0,

        productCost: 0,

        shippingExpense: 0,

        packagingExpense: 0,

        platformFee: 0,

        otherExpense: 0,

        expense: 0

    }

}


// ======================================================
// DASHBOARD
// GET /api/dashboard
// ======================================================

exports.dashboard =
    async (
        req,
        res
    ) => {

        try {

            // ==================================================
            // ACCOUNT ISOLATION
            // ==================================================

            const accountId =
                Number(
                    req.user?.accountId
                )


            if (
                !Number.isInteger(
                    accountId
                ) ||
                accountId <= 0
            ) {

                return res.status(
                    401
                ).json({

                    success:
                        false,

                    hasData:
                        false,

                    message:
                        "Invalid account"

                })

            }


            // ==================================================
            // PERIOD
            // ==================================================

            const requestedPeriod =
                String(
                    req.query.period ||
                    "today"
                )
                    .trim()
                    .toLowerCase()


            const allowedPeriods = [

                "today",

                "week",

                "month",

                "year",

                "all",

                "custom"

            ]


            const period =
                allowedPeriods.includes(
                    requestedPeriod
                )
                    ? requestedPeriod
                    : "today"


            // ==================================================
            // TREND MODE
            // ==================================================

            const requestedTrend =
                String(
                    req.query.trend ||
                    "daily"
                )
                    .trim()
                    .toLowerCase()


            const trendMode =
                [
                    "daily",
                    "weekly"
                ].includes(
                    requestedTrend
                )
                    ? requestedTrend
                    : "daily"


            // ==================================================
            // DATE FILTER
            // ==================================================

            const dateFilter =
                getPeriodFilter(
                    period,
                    req
                )


            // ==================================================
            // PARALLEL QUERIES
            //
            // IMPORTANT:
            // สามตัวนี้เป็นอิสระต่อกัน (ไม่ใช้ผลลัพธ์ของกันและกัน)
            // เดิมรันแบบ sequential (await ทีละตัว) ทำให้เวลารวม
            // เป็นผลบวกของทั้ง 3 query -> เปลี่ยนเป็น Promise.all
            // ให้รันพร้อมกัน เวลารวมจะเหลือแค่ query ที่ช้าที่สุด
            //
            // stockItems:
            // Inventory = สถานะปัจจุบันของร้าน ไม่กรองตาม period
            //
            // soldSaleItems:
            // แทนที่การโหลด allCompletedSales ทั้งก้อนแล้ว include
            // items ซ้อนอีกชั้น (เดิมโหลด Sale -> items ทำให้หนัก)
            // เปลี่ยนมา query ตรงที่ SaleItem เลย ผ่าน relation filter
            // sale: { accountId, status: "COMPLETED" }
            // ซึ่งใช้ index ที่เพิ่มใหม่ (Sale accountId+status+createdAt
            // และ SaleItem saleId) ช่วยให้ join เร็วขึ้น
            // ไม่ใช้ dateFilter เพราะ SOLD นับสะสมทั้งหมด ไม่ใช่ตาม period
            //
            // sales:
            // ยอดขายตาม period ที่เลือก ใช้ทำ summary/trend/ranking
            // เปลี่ยน customer: true -> select เฉพาะ field ที่ใช้จริง
            // เพื่อลด payload จาก DB
            // ==================================================

            const [
                stockItems,
                soldSaleItems,
                sales
            ] = await Promise.all([

                prisma.consignmentItem.findMany({

                    where: {

                        accountId

                    },

                    select: {

                        id: true,

                        name: true,

                        quantity: true,

                        costPrice: true,

                        actualSalePrice: true,

                        status: true

                    }

                }),


                prisma.saleItem.findMany({

                    where: {

                        sale: {

                            accountId,

                            status:
                                "COMPLETED"

                        }

                    },

                    select: {

                        quantity: true,

                        costPriceAtSale: true

                    }

                }),


                prisma.sale.findMany({

                    where: {

                        accountId,

                        status:
                            "COMPLETED",

                        ...dateFilter

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

                                }

                            }

                        },

                        expenses: true,

                        returns: true

                    },

                    orderBy: {

                        createdAt:
                            "asc"

                    }

                })

            ])


            // ==================================================
            // INVENTORY
            // ==================================================

            const investment = {

                items: 0,

                value: 0

            }


            const inventory = {

                available: {

                    items: 0,

                    value: 0

                },

                sold: {

                    items: 0,

                    value: 0

                },

                cancelled: {

                    items: 0,

                    value: 0

                }

            }


            for (
                const item
                of stockItems
            ) {

                const quantity =
                    Math.max(
                        0,
                        Math.floor(
                            toNumber(
                                item.quantity
                            )
                        )
                    )


                const cost =
                    Math.max(
                        0,
                        toNumber(
                            item.costPrice
                        )
                    )


                const totalCost =
                    cost *
                    quantity


                investment.items +=
                    quantity


                investment.value +=
                    totalCost


                switch (
                    String(
                        item.status || ""
                    ).toUpperCase()
                ) {

                    case "AVAILABLE":

                        inventory
                            .available
                            .items +=
                            quantity


                        inventory
                            .available
                            .value +=
                            totalCost

                        break


                    // ==================================================
                    // SOLD
                    //
                    // ห้ามใช้ ConsignmentItem.quantity
                    //
                    // เพราะ orders.js จะตั้ง:
                    //
                    // status: "SOLD"
                    // quantity: 0
                    //
                    // quantity ของ ConsignmentItem
                    // = จำนวนคงเหลือ
                    //
                    // ไม่ใช่จำนวนที่ขายไปแล้ว
                    //
                    // จำนวน SOLD คำนวณจาก soldSaleItems ด้านล่าง
                    // ==================================================

                    case "SOLD":

                        break


                    case "CANCELLED":

                        inventory
                            .cancelled
                            .items +=
                            quantity


                        inventory
                            .cancelled
                            .value +=
                            totalCost

                        break

                }

            }


            // ==================================================
            // SOLD INVENTORY
            //
            // IMPORTANT:
            // Inventory = สถานะปัจจุบันของร้าน
            //
            // ดังนั้น SOLD ต้องนับจากยอดขาย COMPLETED ทั้งหมด
            // ไม่ใช้ dateFilter เพราะ dateFilter เป็นของ Summary / Graph
            //
            // soldSaleItems ดึงมาจาก prisma.saleItem ตรงๆ แล้ว
            // (ดูช่วง PARALLEL QUERIES ด้านบน) ไม่ต้อง loop ผ่าน
            // sale.items ซ้อนอีกชั้นเหมือนเดิม
            // ==================================================

            for (
                const saleItem
                of soldSaleItems
            ) {

                const quantity =
                    Math.max(
                        0,
                        Math.floor(
                            toNumber(
                                saleItem.quantity
                            )
                        )
                    )


                if (
                    quantity <= 0
                ) {

                    continue

                }


                const costPrice =
                    Math.max(
                        0,
                        toNumber(
                            saleItem.costPriceAtSale
                        )
                    )


                inventory
                    .sold
                    .items +=
                    quantity


                inventory
                    .sold
                    .value +=
                    costPrice *
                    quantity

            }


            // ==================================================
            // SUMMARY
            // ==================================================

            let orders = 0

            let items = 0

            let soldItems = 0

            let grossSales = 0

            let shippingRevenue = 0

            let discount = 0

            let refund = 0

            let productCost = 0

            let shippingExpense = 0

            let packagingExpense = 0

            let platformFee = 0

            let otherExpense = 0

            let expense = 0


            const productMap = {}

            const customerMap = {}

            const trendMap = {}


            // ==================================================
            // SALES LOOP
            // ==================================================

            for (
                const sale
                of sales
            ) {

                orders++


                const saleDate =
                    getBangkokDate(
                        sale.createdAt
                    )


                if (
                    !saleDate
                ) {

                    continue

                }


                // ==================================================
                // WEEKLY KEY
                // ==================================================

                const trendDate =
                    trendMode ===
                    "weekly"

                        ? getWeekStartDateString(
                            saleDate
                        )

                        : saleDate


                if (
                    !trendDate
                ) {

                    continue

                }


                if (
                    !trendMap[
                        trendDate
                    ]
                ) {

                    trendMap[
                        trendDate
                    ] =
                        createTrend(
                            trendDate
                        )

                }


                const trend =
                    trendMap[
                        trendDate
                    ]


                trend.orders++


                // ==================================================
                // SHIPPING REVENUE
                //
                // Schema ใช้ shippingCharged
                // ==================================================

                const saleShipping =
                    toNumber(
                        sale.shippingCharged
                    )


                shippingRevenue +=
                    saleShipping


                trend.shippingRevenue +=
                    saleShipping


                // ==================================================
                // DISCOUNT
                // ==================================================

                const saleDiscount =
                    toNumber(
                        sale.discount
                    )


                discount +=
                    saleDiscount


                trend.discount +=
                    saleDiscount


                // ==================================================
                // REFUND
                //
                // ใช้ Return records จริง
                // ==================================================

                const saleRefund =
                    (
                        sale.returns || []
                    )
                        .reduce(
                            (
                                total,
                                item
                            ) =>
                                total +
                                toNumber(
                                    item.refundAmount
                                ) +
                                toNumber(
                                    item.refundShipping
                                ),
                            0
                        )


                refund +=
                    saleRefund


                trend.refund +=
                    saleRefund


                // ==================================================
                // EXPENSE
                // ==================================================

                const breakdown =
                    getExpenseBreakdown(
                        sale.expenses
                    )


                shippingExpense +=
                    breakdown.shippingExpense


                packagingExpense +=
                    breakdown.packagingExpense


                platformFee +=
                    breakdown.platformFee


                otherExpense +=
                    breakdown.otherExpense


                expense +=
                    breakdown.total


                trend.shippingExpense +=
                    breakdown.shippingExpense


                trend.packagingExpense +=
                    breakdown.packagingExpense


                trend.platformFee +=
                    breakdown.platformFee


                trend.otherExpense +=
                    breakdown.otherExpense


                trend.expense +=
                    breakdown.total


                // ==================================================
                // CUSTOMER
                // ==================================================

                if (
                    sale.customer
                ) {

                    const customerId =
                        sale.customer.id


                    if (
                        !customerMap[
                            customerId
                        ]
                    ) {

                        customerMap[
                            customerId
                        ] = {

                            id:
                                customerId,

                            name:
                                sale.customer.name ||
                                "Unknown Customer",

                            phone:
                                sale.customer.phone ||
                                "",

                            orders: 0,

                            items: 0,

                            total: 0

                        }

                    }


                    const customer =
                        customerMap[
                            customerId
                        ]


                    customer.orders++


                    customer.total +=
                        toNumber(
                            sale.totalAmount
                        )

                }


                // ==================================================
                // SALE ITEMS
                //
                // SaleItem.quantity คือจำนวนที่ขายจริง
                // ==================================================

                for (
                    const saleItem
                    of sale.items || []
                ) {

                    const quantity =
                        Math.max(
                            0,
                            Math.floor(
                                toNumber(
                                    saleItem.quantity
                                )
                            )
                        )


                    if (
                        quantity <= 0
                    ) {

                        continue

                    }


                    items +=
                        quantity


                    soldItems +=
                        quantity


                    trend.items +=
                        quantity


                    const product =
                        saleItem.consignmentItem


                    if (
                        !product
                    ) {

                        continue

                    }


                    const salePrice =
                        Math.max(
                            0,
                            toNumber(
                                saleItem.salePrice
                            )
                        )


                    // สำคัญ:
                    // ใช้ costPriceAtSale
                    // เพราะต้นทุน ณ ตอนขายต้องไม่เปลี่ยน

                    const costPrice =
                        Math.max(
                            0,
                            toNumber(
                                saleItem.costPriceAtSale
                            )
                        )


                    const lineTotal =
                        salePrice *
                        quantity


                    const lineCost =
                        costPrice *
                        quantity


                    grossSales +=
                        lineTotal


                    productCost +=
                        lineCost


                    trend.grossSales +=
                        lineTotal


                    trend.productCost +=
                        lineCost


                    // ==================================================
                    // PRODUCT RANKING
                    // ==================================================

                    const productId =
                        product.id


                    if (
                        !productMap[
                            productId
                        ]
                    ) {

                        productMap[
                            productId
                        ] = {

                            id:
                                productId,

                            name:
                                product.name ||
                                "Unknown Product",

                            soldItems: 0,

                            grossSales: 0,

                            cost: 0,

                            profit: 0

                        }

                    }


                    const productRow =
                        productMap[
                            productId
                        ]


                    productRow.soldItems +=
                        quantity


                    productRow.grossSales +=
                        lineTotal


                    productRow.cost +=
                        lineCost


                    productRow.profit +=
                        lineTotal -
                        lineCost


                    // ==================================================
                    // CUSTOMER ITEMS
                    // ==================================================

                    if (
                        sale.customer
                    ) {

                        const customer =
                            customerMap[
                                sale.customer.id
                            ]


                        if (
                            customer
                        ) {

                            customer.items +=
                                quantity

                        }

                    }

                }

            }


            // ==================================================
            // NET SALES
            // ==================================================

            const netSales =
                grossSales +
                shippingRevenue -
                discount -
                refund


            // ==================================================
            // TOTAL COST
            // ==================================================

            const totalCost =
                productCost +
                expense


            // ==================================================
            // PROFIT
            // ==================================================

            const profit =
                netSales -
                totalCost


            // ==================================================
            // MARGIN
            // ==================================================

            const profitMargin =
                netSales > 0

                    ? round(
                        (
                            profit /
                            netSales
                        ) *
                        100
                    )

                    : 0


            // ==================================================
            // TOP PRODUCTS
            // ==================================================

            const topProducts =
                Object.values(
                    productMap
                )
                    .map(
                        item => {

                            const margin =
                                item.grossSales > 0

                                    ? (
                                        item.profit /
                                        item.grossSales
                                    ) *
                                    100

                                    : 0


                            return {

                                product: {

                                    id:
                                        item.id,

                                    name:
                                        item.name

                                },

                                soldItems:
                                    item.soldItems,

                                grossSales:
                                    round(
                                        item.grossSales
                                    ),

                                cost:
                                    round(
                                        item.cost
                                    ),

                                profit:
                                    round(
                                        item.profit
                                    ),

                                margin:
                                    round(
                                        margin
                                    )

                            }

                        }
                    )
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            b.grossSales -
                            a.grossSales
                    )
                    .slice(
                        0,
                        20
                    )


            // ==================================================
            // TOP CUSTOMERS
            // ==================================================

            const topCustomers =
                Object.values(
                    customerMap
                )
                    .map(
                        item => ({

                            id:
                                item.id,

                            name:
                                item.name,

                            phone:
                                item.phone,

                            orders:
                                item.orders,

                            items:
                                item.items,

                            total:
                                round(
                                    item.total
                                )

                        })
                    )
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            b.total -
                            a.total
                    )
                    .slice(
                        0,
                        20
                    )


            // ==================================================
            // SALES TREND
            //
            // Backend รวม weekly ให้เสร็จ
            // FE ไม่ต้องรวมซ้ำ
            // ==================================================

            const salesTrend =
                Object.values(
                    trendMap
                )
                    .map(
                        item => {

                            const trendNetSales =
                                item.grossSales +
                                item.shippingRevenue -
                                item.discount -
                                item.refund


                            const trendTotalCost =
                                item.productCost +
                                item.expense


                            const trendProfit =
                                trendNetSales -
                                trendTotalCost


                            return {

                                date:
                                    item.date,

                                orders:
                                    item.orders,

                                items:
                                    item.items,

                                grossSales:
                                    round(
                                        item.grossSales
                                    ),

                                shippingRevenue:
                                    round(
                                        item.shippingRevenue
                                    ),

                                shippingCost:
                                    round(
                                        item.shippingExpense
                                    ),

                                discount:
                                    round(
                                        item.discount
                                    ),

                                refund:
                                    round(
                                        item.refund
                                    ),

                                netSales:
                                    round(
                                        trendNetSales
                                    ),

                                productCost:
                                    round(
                                        item.productCost
                                    ),

                                shippingExpense:
                                    round(
                                        item.shippingExpense
                                    ),

                                actualShippingCost:
                                    round(
                                        item.shippingExpense
                                    ),

                                packagingExpense:
                                    round(
                                        item.packagingExpense
                                    ),

                                platformFee:
                                    round(
                                        item.platformFee
                                    ),

                                otherExpense:
                                    round(
                                        item.otherExpense
                                    ),

                                expense:
                                    round(
                                        item.expense
                                    ),

                                totalCost:
                                    round(
                                        trendTotalCost
                                    ),

                                profit:
                                    round(
                                        trendProfit
                                    )

                            }

                        }
                    )
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            a.date.localeCompare(
                                b.date
                            )
                    )


            // ==================================================
            // AI DATA
            // ==================================================

            const aiData = {

                sales: {

                    orders,

                    items,

                    soldItems,

                    grossSales:
                        round(
                            grossSales
                        ),

                    shippingRevenue:
                        round(
                            shippingRevenue
                        ),

                    discount:
                        round(
                            discount
                        ),

                    refund:
                        round(
                            refund
                        ),

                    netSales:
                        round(
                            netSales
                        )

                },


                profit: {

                    productCost:
                        round(
                            productCost
                        ),

                    shippingExpense:
                        round(
                            shippingExpense
                        ),

                    packagingExpense:
                        round(
                            packagingExpense
                        ),

                    platformFee:
                        round(
                            platformFee
                        ),

                    otherExpense:
                        round(
                            otherExpense
                        ),

                    expense:
                        round(
                            expense
                        ),

                    totalCost:
                        round(
                            totalCost
                        ),

                    profit:
                        round(
                            profit
                        ),

                    margin:
                        profitMargin

                },


                inventory: {

                    investment: {

                        items:
                            investment.items,

                        value:
                            round(
                                investment.value
                            )

                    },


                    available: {

                        items:
                            inventory.available.items,

                        value:
                            round(
                                inventory.available.value
                            )

                    },


                    sold: {

                        items:
                            inventory.sold.items,

                        value:
                            round(
                                inventory.sold.value
                            )

                    },


                    cancelled: {

                        items:
                            inventory.cancelled.items,

                        value:
                            round(
                                inventory.cancelled.value
                            )

                    }

                },


                product: {

                    topProducts

                },


                trends: {

                    mode:
                        trendMode,

                    salesTrend

                }

            }


            // ==================================================
            // RESPONSE
            // ==================================================

            return res.status(
                200
            ).json({

                success:
                    true,

                accountId,

                period,

                trendMode,

                filter: {

                    from:
                        req.query.from ||
                        null,

                    to:
                        req.query.to ||
                        null

                },

                hasData:
                    sales.length > 0,


                summary: {

                    orders,

                    items,

                    soldItems,

                    grossSales:
                        round(
                            grossSales
                        ),

                    shippingRevenue:
                        round(
                            shippingRevenue
                        ),

                    shippingCost:
                        round(
                            shippingExpense
                        ),

                    discount:
                        round(
                            discount
                        ),

                    refund:
                        round(
                            refund
                        ),

                    netSales:
                        round(
                            netSales
                        ),

                    productCost:
                        round(
                            productCost
                        ),

                    shippingExpense:
                        round(
                            shippingExpense
                        ),

                    actualShippingCost:
                        round(
                            shippingExpense
                        ),

                    packagingExpense:
                        round(
                            packagingExpense
                        ),

                    platformFee:
                        round(
                            platformFee
                        ),

                    otherExpense:
                        round(
                            otherExpense
                        ),

                    expense:
                        round(
                            expense
                        ),

                    totalCost:
                        round(
                            totalCost
                        ),

                    profit:
                        round(
                            profit
                        ),

                    profitMargin

                },


                investment: {

                    items:
                        investment.items,

                    value:
                        round(
                            investment.value
                        )

                },


                inventory: {

                    available: {

                        items:
                            inventory.available.items,

                        value:
                            round(
                                inventory.available.value
                            )

                    },

                    sold: {

                        items:
                            inventory.sold.items,

                        value:
                            round(
                                inventory.sold.value
                            )

                    },

                    cancelled: {

                        items:
                            inventory.cancelled.items,

                        value:
                            round(
                                inventory.cancelled.value
                            )

                    }

                },


                topProducts,

                topCustomers,

                salesTrend,

                aiData

            })

        }
        catch (
            error
        ) {

            console.error(
                "========================================"
            )

            console.error(
                "DASHBOARD ERROR"
            )

            console.error(
                error
            )

            console.error(
                "========================================"
            )


            return res.status(
                500
            ).json({

                success:
                    false,

                hasData:
                    false,

                message:
                    "Dashboard Error",

                error:
                    process.env.NODE_ENV ===
                    "development"
                        ? error.message
                        : undefined

            })

        }

    }