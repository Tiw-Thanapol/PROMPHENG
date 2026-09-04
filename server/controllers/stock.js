const prisma = require('../config/prisma')


// ======================================================
// TIMEZONE
// ======================================================
//
// ระบบใช้เวลาไทย
// Asia/Bangkok
// UTC+7
//
// IMPORTANT:
// Prisma / PostgreSQL เก็บ DateTime เป็น instant
// ส่วน API จะ serialize เวลาออกมาเป็น +07:00
// ======================================================

const THAILAND_TIMEZONE = 'Asia/Bangkok'


// ======================================================
// HELPERS
// ======================================================

function toNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return 0
    }

    const number = Number(value)

    return Number.isFinite(number)
        ? number
        : 0

}


function isValidNumber(value) {

    return (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        Number.isFinite(Number(value))
    )

}


function normalizeName(value) {

    return String(value || '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()

}


function normalizeNullableString(value) {

    if (typeof value !== 'string') {
        return null
    }

    const result =
        value.trim()

    return result || null

}


// ======================================================
// ACCOUNT HELPER
// ======================================================
//
// ทุก controller ต้องเช็คว่า user ที่ login อยู่
// มี accountId ผูกอยู่ก่อนเสมอ ไม่งั้นห้ามให้ query/เขียนข้อมูลใดๆ
// เพราะไม่รู้ว่าจะ scope ข้อมูลเข้า account ไหน
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
// THAILAND DATE HELPERS
// ======================================================

function nowThailand() {

    return new Date()

}


// ======================================================
// DATE VALIDATION
// ======================================================

function isValidDateOnly(value) {

    if (
        typeof value !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
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


    const date =
        new Date(
            Date.UTC(
                year,
                month - 1,
                day
            )
        )


    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    )

}


// ======================================================
// PARSE THAILAND DATE
// ======================================================

function parseThailandDate(value) {

    if (
        value === undefined ||
        value === null ||
        value === ''
    ) {

        return null

    }


    // ==================================================
    // DATE ONLY
    // YYYY-MM-DD
    //
    // ถือว่าเป็นเวลา 00:00:00 ของประเทศไทย
    // ==================================================

    if (
        typeof value === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {

        if (
            !isValidDateOnly(value)
        ) {

            return null

        }


        const [
            year,
            month,
            day
        ] =
            value
                .split('-')
                .map(Number)


        const utcTimestamp =
            Date.UTC(
                year,
                month - 1,
                day,
                0,
                0,
                0,
                0
            ) -
            (
                7 *
                60 *
                60 *
                1000
            )


        const date =
            new Date(
                utcTimestamp
            )


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return null

        }


        return date

    }


    // ==================================================
    // DATETIME
    //
    // ถ้ามี timezone อยู่แล้ว เช่น
    // 2026-08-26T18:30:00+07:00
    //
    // ให้รักษา instant เดิม
    // ==================================================

    const date =
        new Date(value)


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null

    }


    return date

}


// ======================================================
// FORMAT DATE AS THAILAND ISO
// ======================================================

function formatThailandDate(value) {

    if (!value) {
        return null
    }


    const date =
        value instanceof Date
            ? value
            : new Date(value)


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null

    }


    const parts =
        new Intl.DateTimeFormat(
            'en-CA',
            {
                timeZone:
                    THAILAND_TIMEZONE,

                year:
                    'numeric',

                month:
                    '2-digit',

                day:
                    '2-digit',

                hour:
                    '2-digit',

                minute:
                    '2-digit',

                second:
                    '2-digit',

                hourCycle:
                    'h23'
            }
        ).formatToParts(date)


    const map = {}

    for (const part of parts) {

        if (
            part.type !== 'literal'
        ) {

            map[part.type] =
                part.value

        }

    }


    return (
        `${map.year}-${map.month}-${map.day}` +
        `T${map.hour}:${map.minute}:${map.second}` +
        `+07:00`
    )

}


// ======================================================
// SERIALIZE STOCK
// ======================================================

function serializeStock(stock) {

    const costPrice =
        toNumber(
            stock.costPrice
        )


    const actualSalePrice =
        stock.actualSalePrice !== null &&
        stock.actualSalePrice !== undefined

            ? toNumber(
                stock.actualSalePrice
            )

            : null


    const quantity =
        Math.max(
            0,
            Number(
                stock.quantity || 0
            )
        )


    const profitPerUnit =
        actualSalePrice !== null

            ? actualSalePrice -
              costPrice

            : null


    const totalCostValue =
        costPrice *
        quantity


    const totalSaleValue =
        actualSalePrice !== null

            ? actualSalePrice *
              quantity

            : null


    const totalPotentialProfit =
        actualSalePrice !== null

            ? (
                actualSalePrice -
                costPrice
            ) *
            quantity

            : null


    return {

        id:
            stock.id,

        ownerId:
            stock.ownerId,

        name:
            stock.name,

        description:
            stock.description,

        quantity,

        owner:
            stock.owner,

        costPrice,

        actualSalePrice,

        profitPerUnit,

        totalCostValue,

        totalSaleValue,

        totalPotentialProfit,

        status:
            stock.status,

        purchaseDate:
            formatThailandDate(
                stock.purchaseDate
            ),

        soldAt:
            formatThailandDate(
                stock.soldAt
            ),

        note:
            stock.note,

        createdAt:
            formatThailandDate(
                stock.createdAt
            ),

        updatedAt:
            formatThailandDate(
                stock.updatedAt
            )

    }

}


// ======================================================
// AUDIT DATA
// ======================================================

function auditStockData(stock) {

    return {

        id:
            stock.id,

        ownerId:
            stock.ownerId,

        name:
            stock.name,

        description:
            stock.description,

        quantity:
            Number(
                stock.quantity || 0
            ),

        costPrice:
            stock.costPrice !== null &&
            stock.costPrice !== undefined

                ? toNumber(
                    stock.costPrice
                )

                : null,

        actualSalePrice:
            stock.actualSalePrice !== null &&
            stock.actualSalePrice !== undefined

                ? toNumber(
                    stock.actualSalePrice
                )

                : null,

        status:
            stock.status,

        purchaseDate:
            formatThailandDate(
                stock.purchaseDate
            ),

        soldAt:
            formatThailandDate(
                stock.soldAt
            ),

        note:
            stock.note

    }

}


// ======================================================
// OWNER COMPATIBILITY
// ======================================================
//
// FIXED:
// เดิมฟังก์ชันนี้หยิบ Owner ตัวแรกสุดของทั้งระบบ (ข้าม account)
// ทำให้ทุก account ที่สร้างสินค้าใหม่ถูกผูกเข้ากับ Owner
// ของ account แรกสุดที่เคยสมัครหมดทุกคน
//
// ตอนนี้เปลี่ยนเป็น: หา Owner ตัวแรกของ "account ที่ login อยู่" เท่านั้น
// ถ้า account นั้นยังไม่เคยมี Owner เลย ให้สร้าง Owner
// default record ให้อัตโนมัติ เพื่อไม่ให้ระบบ block การใช้งาน
// ======================================================

async function getCompatibilityOwner(accountId, tx = prisma) {

    const existingOwner =
        await tx.owner.findFirst({

            where: {

                accountId

            },

            orderBy: {

                id: 'asc'

            }

        })


    if (existingOwner) {

        return existingOwner

    }


    // ==================================================
    // ยังไม่มี Owner ของ account นี้เลย
    // สร้าง default owner ให้อัตโนมัติ
    // ==================================================

    return await tx.owner.create({

        data: {

            accountId,

            name:
                'เจ้าของสินค้า (Default)'

        }

    })

}


// ======================================================
// CREATE STOCK
// POST /api/stock
//
// SAME NAME + SAME COST
// -> MERGE QUANTITY
//
// SAME NAME + DIFFERENT COST
// -> CREATE NEW LOT
//
// DIFFERENT NAME
// -> CREATE NEW STOCK
// ======================================================

exports.create = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({

                message:
                    'ไม่พบ account ของผู้ใช้งาน'

            })

        }


        const {
            name,
            description,
            quantity,
            costPrice,
            purchaseDate,
            note
        } = req.body


        // ==================================================
        // NAME
        // ==================================================

        if (
            typeof name !== 'string' ||
            !name.trim()
        ) {

            return res.status(400).json({

                message:
                    'Product name is required'

            })

        }


        // ==================================================
        // QUANTITY
        // ==================================================

        const quantityNumber =
            Number(
                quantity ?? 1
            )


        if (
            !Number.isInteger(
                quantityNumber
            ) ||
            quantityNumber <= 0
        ) {

            return res.status(400).json({

                message:
                    'Quantity must be a positive integer'

            })

        }


        // ==================================================
        // COST
        // ==================================================

        if (
            !isValidNumber(
                costPrice
            ) ||
            Number(costPrice) < 0
        ) {

            return res.status(400).json({

                message:
                    'Valid cost price is required'

            })

        }


        const costPriceNumber =
            Number(
                costPrice
            )


        // ==================================================
        // OWNER
        // scoped เฉพาะ account ที่ login อยู่
        // ==================================================

        const owner =
            await getCompatibilityOwner(
                accountId
            )


        if (!owner) {

            return res.status(500).json({

                message:
                    'ยังไม่มี Owner compatibility record ในระบบ'

            })

        }


        const ownerId =
            owner.id


        const normalizedName =
            normalizeName(
                name
            )


        // ==================================================
        // FIND AVAILABLE LOTS
        // scoped ด้วย accountId
        // ==================================================

        const existingStocks =
            await prisma.consignmentItem.findMany({

                where: {

                    accountId,

                    ownerId,

                    status:
                        'AVAILABLE',

                    quantity: {

                        gt:
                            0

                    }

                },

                orderBy: {

                    id:
                        'asc'

                }

            })


        // ==================================================
        // SAME NAME + SAME COST
        // ==================================================

        const matchingStock =
            existingStocks.find(
                item => {

                    return (

                        normalizeName(
                            item.name
                        ) ===
                        normalizedName

                        &&

                        toNumber(
                            item.costPrice
                        ) ===
                        costPriceNumber

                    )

                }
            )


        if (matchingStock) {

            const oldQuantity =
                Number(
                    matchingStock.quantity || 0
                )


            const newQuantity =
                oldQuantity +
                quantityNumber


            const updatedStock =
                await prisma.$transaction(
                    async tx => {

                        const updated =
                            await tx.consignmentItem.update({

                                where: {

                                    id:
                                        matchingStock.id

                                },

                                data: {

                                    quantity:
                                        newQuantity,

                                    status:
                                        'AVAILABLE',

                                    soldAt:
                                        null

                                },

                                include: {

                                    owner:
                                        true

                                }

                            })


                        if (req.user?.id) {

                            await tx.auditLog.create({

                                data: {

                                    userId:
                                        Number(
                                            req.user.id
                                        ),

                                    action:
                                        'INCREASE_QUANTITY',

                                    entity:
                                        'ConsignmentItem',

                                    entityId:
                                        updated.id,

                                    details:
                                        JSON.stringify({

                                            before: {

                                                quantity:
                                                    oldQuantity,

                                                costPrice:
                                                    toNumber(
                                                        matchingStock.costPrice
                                                    ),

                                                name:
                                                    matchingStock.name

                                            },

                                            added: {

                                                quantity:
                                                    quantityNumber,

                                                costPrice:
                                                    costPriceNumber

                                            },

                                            after: {

                                                quantity:
                                                    newQuantity,

                                                costPrice:
                                                    toNumber(
                                                        updated.costPrice
                                                    ),

                                                name:
                                                    updated.name

                                            }

                                        })

                                }

                            })

                        }


                        return updated

                    }
                )


            return res.status(200).json({

                message:
                    'เพิ่มจำนวนสินค้าในรายการเดิมสำเร็จ',

                action:
                    'UPDATED',

                stock:
                    serializeStock(
                        updatedStock
                    ),

                quantityAdded:
                    quantityNumber,

                previousQuantity:
                    oldQuantity,

                newQuantity

            })

        }


        // ==================================================
        // SAME NAME DIFFERENT COST
        // ==================================================

        const sameNameDifferentCost =
            existingStocks.some(
                item => {

                    return (
                        normalizeName(
                            item.name
                        ) ===
                        normalizedName
                    )

                }
            )


        // ==================================================
        // PURCHASE DATE
        // ==================================================

        let purchaseDateValue =
            nowThailand()


        if (
            purchaseDate !== undefined
        ) {

            if (
                purchaseDate === null ||
                purchaseDate === ''
            ) {

                return res.status(400).json({

                    message:
                        'Invalid purchase date'

                })

            }


            const parsedDate =
                parseThailandDate(
                    purchaseDate
                )


            if (!parsedDate) {

                return res.status(400).json({

                    message:
                        'Invalid purchase date'

                })

            }


            purchaseDateValue =
                parsedDate

        }


        // ==================================================
        // CREATE
        // ==================================================

        const stock =
            await prisma.$transaction(
                async tx => {

                    const created =
                        await tx.consignmentItem.create({

                            data: {

                                accountId,

                                ownerId,

                                name:
                                    name.trim(),

                                description:
                                    normalizeNullableString(
                                        description
                                    ),

                                quantity:
                                    quantityNumber,

                                costPrice:
                                    costPriceNumber,

                                actualSalePrice:
                                    null,

                                status:
                                    'AVAILABLE',

                                purchaseDate:
                                    purchaseDateValue,

                                soldAt:
                                    null,

                                note:
                                    normalizeNullableString(
                                        note
                                    )

                            },

                            include: {

                                owner:
                                    true

                            }

                        })


                    if (req.user?.id) {

                        await tx.auditLog.create({

                            data: {

                                userId:
                                    Number(
                                        req.user.id
                                    ),

                                action:
                                    'CREATE',

                                entity:
                                    'ConsignmentItem',

                                entityId:
                                    created.id,

                                details:
                                    JSON.stringify({

                                        ...auditStockData(
                                            created
                                        ),

                                        createReason:
                                            sameNameDifferentCost
                                                ? 'SAME_NAME_DIFFERENT_COST'
                                                : 'NEW_PRODUCT'

                                    })

                            }

                        })

                    }


                    return created

                }
            )


        return res.status(201).json({

            message:
                sameNameDifferentCost

                    ? 'สร้าง Stock Lot ใหม่สำเร็จ'

                    : 'Stock created successfully',

            action:
                'CREATED',

            stock:
                serializeStock(
                    stock
                )

        })


    } catch (err) {

        console.error(
            'Create Stock Error:',
            err
        )

        return res.status(500).json({

            message:
                'Server Error'

        })

    }

}


// ======================================================
// LIST STOCK
// GET /api/stock
// ======================================================

exports.list = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({

                message:
                    'ไม่พบ account ของผู้ใช้งาน'

            })

        }


        const {
            status,
            search
        } = req.query


        const where = {

            accountId

        }


        // ==================================================
        // STATUS
        // ==================================================

        if (status) {

            const allowedStatus = [

                'AVAILABLE',

                'SOLD',

                'CANCELLED'

            ]


            if (
                !allowedStatus.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    message:
                        'Invalid stock status'

                })

            }


            where.status =
                status

        }


        // ==================================================
        // SEARCH
        // ==================================================

        if (
            typeof search === 'string' &&
            search.trim()
        ) {

            where.name = {

                contains:
                    search.trim(),

                mode:
                    'insensitive'

            }

        }


        // ==================================================
        // GET
        // ==================================================

        const stocks =
            await prisma.consignmentItem.findMany({

                where,

                include: {

                    owner: {

                        select: {

                            id:
                                true,

                            name:
                                true,

                            phone:
                                true,

                            note:
                                true

                        }

                    }

                },

                orderBy: {

                    createdAt:
                        'desc'

                }

            })


        const stock =
            stocks.map(
                serializeStock
            )


        return res.json({

            count:
                stock.length,

            totalQuantity:
                stock.reduce(
                    (
                        sum,
                        item
                    ) =>
                        sum +
                        item.quantity,

                    0
                ),

            stock

        })


    } catch (err) {

        console.error(
            'List Stock Error:',
            err
        )

        return res.status(500).json({

            message:
                'Server Error'

        })

    }

}


// ======================================================
// STOCK SUMMARY
// GET /api/stock/summary
//
// IMPORTANT
//
// CURRENT STOCK:
// ConsignmentItem เป็น source of truth
// สำหรับ AVAILABLE / SOLD / CANCELLED
//
// HISTORICAL SALES:
// SaleItem เป็น source of truth
// สำหรับ soldQuantity / salesValue / productCost
//
// costPriceAtSale เป็น source of truth
// ของต้นทุนสินค้า ณ เวลาขาย
//
// ห้ามเอา quantity ของ SOLD ConsignmentItem
// มาบวกกับ quantity จาก SaleItem ซ้ำอีก
// ======================================================

exports.summary = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({

                message:
                    'ไม่พบ account ของผู้ใช้งาน'

            })

        }


        const [
            items,
            saleItems
        ] =
            await Promise.all([

                prisma.consignmentItem.findMany({

                    where: {

                        accountId

                    },

                    select: {

                        id:
                            true,

                        status:
                            true,

                        quantity:
                            true,

                        costPrice:
                            true

                    }

                }),

                // SaleItem ไม่มี accountId ตรงๆ
                // ต้อง scope ผ่าน relation sale.accountId

                prisma.saleItem.findMany({

                    where: {

                        sale: {

                            accountId,

                            status:
                                'COMPLETED'

                        }

                    },

                    select: {

                        consignmentItemId:
                            true,

                        quantity:
                            true,

                        salePrice:
                            true,

                        costPriceAtSale:
                            true

                    }

                })

            ])


        let availableItems = 0

        let soldItems = 0

        let cancelledItems = 0


        let availableQuantity = 0

        let soldQuantity = 0

        let cancelledQuantity = 0


        let availableCostValue = 0

        let soldCostValue = 0


        let salesValue = 0

        let productCost = 0

        let profit = 0


        // ==================================================
        // CURRENT STOCK
        // ==================================================

        for (const item of items) {

            const quantity =
                Math.max(
                    0,
                    Number(
                        item.quantity || 0
                    )
                )


            const cost =
                toNumber(
                    item.costPrice
                )


            if (
                item.status ===
                'AVAILABLE'
            ) {

                availableItems++

                availableQuantity +=
                    quantity

                availableCostValue +=
                    cost *
                    quantity

            }


            else if (
                item.status ===
                'SOLD'
            ) {

                // ------------------------------------------
                // นับจำนวน "รายการ stock lot" ที่เป็น SOLD
                //
                // ไม่เอา quantity มาบวก soldQuantity
                // เพราะยอดขายจริงอ่านจาก SaleItem ด้านล่าง
                // ------------------------------------------

                soldItems++

            }


            else if (
                item.status ===
                'CANCELLED'
            ) {

                cancelledItems++

                cancelledQuantity +=
                    quantity

            }

        }


        // ==================================================
        // HISTORICAL SALES
        //
        // SaleItem เป็น source of truth
        // ==================================================

        const soldProductIds =
            new Set()


        for (
            const item
            of saleItems
        ) {

            const quantity =
                Math.max(
                    0,
                    Number(
                        item.quantity || 0
                    )
                )


            if (
                quantity <= 0
            ) {

                continue

            }


            const salePrice =
                toNumber(
                    item.salePrice
                )


            const cost =
                toNumber(
                    item.costPriceAtSale
                )


            const lineSalesValue =
                salePrice *
                quantity


            const lineProductCost =
                cost *
                quantity


            const lineProfit =
                (
                    salePrice -
                    cost
                ) *
                quantity


            salesValue +=
                lineSalesValue


            productCost +=
                lineProductCost


            profit +=
                lineProfit


            // ------------------------------------------
            // ยอดขายจริง
            //
            // นับจาก SaleItem เพียงครั้งเดียว
            // ------------------------------------------

            soldQuantity +=
                quantity


            soldCostValue +=
                lineProductCost


            if (
                item.consignmentItemId !== null &&
                item.consignmentItemId !== undefined
            ) {

                soldProductIds.add(
                    item.consignmentItemId
                )

            }

        }


        // ==================================================
        // SOLD ITEMS
        //
        // ถ้ามี SaleItem ให้ถือจำนวน stock item ที่ถูกขาย
        // จาก SaleItem เป็นหลัก
        //
        // แต่ยังรองรับ SOLD stock ที่ไม่มี SaleItem
        // ซึ่งอาจเป็น legacy/manual record
        // ==================================================

        if (
            soldProductIds.size > 0
        ) {

            soldItems =
                soldProductIds.size

        }


        // ==================================================
        // TOTAL CURRENT STOCK QUANTITY
        // ==================================================

        const totalQuantity =
            items.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    Math.max(
                        0,
                        Number(
                            item.quantity || 0
                        )
                    ),

                0
            )


        // ==================================================
        // ROUND MONEY
        // ==================================================

        const roundMoney =
            value =>
                Number(
                    toNumber(
                        value
                    ).toFixed(2)
                )


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.json({

            totalItems:
                items.length,

            totalQuantity,

            availableItems,

            availableQuantity:
                Math.max(
                    0,
                    availableQuantity
                ),

            soldItems,

            soldQuantity:
                Math.max(
                    0,
                    soldQuantity
                ),

            cancelledItems,

            cancelledQuantity:
                Math.max(
                    0,
                    cancelledQuantity
                ),

            availableCostValue:
                roundMoney(
                    availableCostValue
                ),

            soldCostValue:
                roundMoney(
                    soldCostValue
                ),

            salesValue:
                roundMoney(
                    salesValue
                ),

            productCost:
                roundMoney(
                    productCost
                ),

            profit:
                roundMoney(
                    profit
                )

        })


    } catch (err) {

        console.error(
            'Stock Summary Error:',
            err
        )

        return res.status(500).json({

            message:
                'Server Error'

        })

    }

}


// ======================================================
// READ STOCK
// GET /api/stock/:id
//
// saleHistory
// 1 row = 1 SaleItem
//
// IMPORTANT:
// - costPriceAtSale ใช้เป็นต้นทุน ณ เวลาขาย
// - shippingCharged = เงินค่าส่งที่ลูกค้าจ่าย
// - shippingActual = ค่าส่งจริงที่เราจ่าย
// - shippingProfit = shippingCharged - shippingActual
// - shippingActual ถือเป็นรายจ่าย
// ======================================================

exports.read = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({

                message:
                    'ไม่พบ account ของผู้ใช้งาน'

            })

        }


        const id =
            Number(
                req.params.id
            )


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                message:
                    'Invalid stock id'

            })

        }


        // ==================================================
        // ใช้ findFirst + accountId แทน findUnique({ id })
        // เพื่อกันดึงข้อมูลข้าม account
        // ==================================================

        const stock =
            await prisma.consignmentItem.findFirst({

                where: {

                    id,

                    accountId

                },

                include: {

                    owner:
                        true,

                    saleItems: {

                        include: {

                            sale: {

                                select: {

                                    id:
                                        true,

                                    status:
                                        true,

                                    totalAmount:
                                        true,

                                    shippingCharged:
                                        true,

                                    shippingActual:
                                        true,

                                    discount:
                                        true,

                                    createdAt:
                                        true,

                                    updatedAt:
                                        true

                                }

                            },

                            returns: {

                                select: {

                                    id:
                                        true,

                                    refundAmount:
                                        true,

                                    refundShipping:
                                        true,

                                    reason:
                                        true,

                                    createdAt:
                                        true

                                }

                            }

                        },

                        orderBy: {

                            createdAt:
                                'desc'

                        }

                    }

                }

            })


        if (!stock) {

            return res.status(404).json({

                message:
                    'Stock not found'

            })

        }


        const saleHistory =
            stock.saleItems.map(
                saleItem => {

                    const quantity =
                        Math.max(
                            0,
                            Number(
                                saleItem.quantity || 0
                            )
                        )


                    const salePrice =
                        toNumber(
                            saleItem.salePrice
                        )


                    const costPriceAtSale =
                        toNumber(
                            saleItem.costPriceAtSale
                        )


                    const totalSaleItemValue =
                        salePrice *
                        quantity


                    const productCost =
                        costPriceAtSale *
                        quantity


                    const productProfit =
                        totalSaleItemValue -
                        productCost


                    const shippingCharged =
                        saleItem.sale
                            ? toNumber(
                                saleItem.sale.shippingCharged
                            )
                            : null


                    const shippingActual =
                        saleItem.sale
                            ? toNumber(
                                saleItem.sale.shippingActual
                            )
                            : null


                    const shippingProfit =
                        shippingCharged !== null &&
                        shippingActual !== null

                            ? shippingCharged -
                              shippingActual

                            : null


                    return {

                        saleItemId:
                            saleItem.id,

                        saleId:
                            saleItem.sale?.id ??
                            null,

                        quantity,

                        salePrice,

                        costPriceAtSale,

                        totalSaleItemValue,

                        productCost,

                        productProfit,

                        saleStatus:
                            saleItem.sale?.status ??
                            null,

                        totalAmount:
                            saleItem.sale
                                ? toNumber(
                                    saleItem.sale.totalAmount
                                )
                                : null,

                        shippingCharged,

                        shippingActual,

                        shippingProfit,

                        discount:
                            saleItem.sale
                                ? toNumber(
                                    saleItem.sale.discount
                                )
                                : null,

                        returns:
                            saleItem.returns.map(
                                item => ({

                                    id:
                                        item.id,

                                    refundAmount:
                                        toNumber(
                                            item.refundAmount
                                        ),

                                    refundShipping:
                                        toNumber(
                                            item.refundShipping
                                        ),

                                    reason:
                                        item.reason,

                                    createdAt:
                                        formatThailandDate(
                                            item.createdAt
                                        )

                                })
                            ),

                        // เวลาขายจริง
                        //
                        // Sale.createdAt คือ timestamp
                        // ของการสร้าง Sale ซึ่งเป็นเวลาขาย
                        soldAt:
                            formatThailandDate(
                                saleItem.sale?.createdAt
                            ),

                        saleCreatedAt:
                            formatThailandDate(
                                saleItem.sale?.createdAt
                            ),

                        saleUpdatedAt:
                            formatThailandDate(
                                saleItem.sale?.updatedAt
                            )

                    }

                }
            )


        return res.json({

            stock: {

                ...serializeStock(
                    stock
                ),

                saleHistory

            }

        })


    } catch (err) {

        console.error(
            'Read Stock Error:',
            err
        )

        return res.status(500).json({

            message:
                'Server Error'

        })

    }

}


// ======================================================
// UPDATE STOCK
// PUT /api/stock/:id
// ======================================================

exports.update = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({

                message:
                    'ไม่พบ account ของผู้ใช้งาน'

            })

        }


        const id =
            Number(
                req.params.id
            )


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                message:
                    'Invalid stock id'

            })

        }


        const {
            name,
            description,
            quantity,
            costPrice,
            actualSalePrice,
            status,
            purchaseDate,
            soldAt,
            note
        } = req.body


        // ==================================================
        // OLD STOCK
        // scoped ด้วย accountId กันแก้ข้าม account
        // ==================================================

        const oldStock =
            await prisma.consignmentItem.findFirst({

                where: {

                    id,

                    accountId

                },

                include: {

                    saleItems:
                        true

                }

            })


        if (!oldStock) {

            return res.status(404).json({

                message:
                    'Stock not found'

            })

        }


        // ==================================================
        // STATUS
        // ==================================================

        const allowedStatus = [

            'AVAILABLE',

            'SOLD',

            'CANCELLED'

        ]


        if (
            status !== undefined &&
            !allowedStatus.includes(
                status
            )
        ) {

            return res.status(400).json({

                message:
                    'Invalid stock status'

            })

        }


        // ==================================================
        // NAME
        // ==================================================

        if (
            name !== undefined &&
            (
                typeof name !== 'string' ||
                !name.trim()
            )
        ) {

            return res.status(400).json({

                message:
                    'Product name cannot be empty'

            })

        }


        // ==================================================
        // QUANTITY
        // ==================================================

        let finalQuantity =
            Number(
                oldStock.quantity || 0
            )


        if (
            quantity !== undefined
        ) {

            if (
                !Number.isInteger(
                    Number(quantity)
                ) ||
                Number(quantity) < 0
            ) {

                return res.status(400).json({

                    message:
                        'Quantity must be a non-negative integer'

                })

            }


            finalQuantity =
                Number(quantity)

        }


        // ==================================================
        // COST
        // ==================================================

        if (
            costPrice !== undefined &&
            (
                !isValidNumber(
                    costPrice
                ) ||
                Number(costPrice) < 0
            )
        ) {

            return res.status(400).json({

                message:
                    'Invalid cost price'

            })

        }


        // ==================================================
        // SALE PRICE
        //
        // IMPORTANT:
        // actualSalePrice เป็น compatibility field
        // ของ Stock และไม่ใช่ historical sale price
        //
        // Historical sale price ต้องอ่านจาก SaleItem.salePrice
        // ==================================================

        if (
            actualSalePrice !== undefined &&
            actualSalePrice !== null &&
            (
                !isValidNumber(
                    actualSalePrice
                ) ||
                Number(actualSalePrice) < 0
            )
        ) {

            return res.status(400).json({

                message:
                    'Invalid actual sale price'

            })

        }


        // ==================================================
        // PURCHASE DATE
        // ==================================================

        let purchaseDateValue


        if (
            purchaseDate !== undefined
        ) {

            if (
                purchaseDate === null
            ) {

                return res.status(400).json({

                    message:
                        'Purchase date cannot be null'

                })

            }


            const date =
                parseThailandDate(
                    purchaseDate
                )


            if (!date) {

                return res.status(400).json({

                    message:
                        'Invalid purchase date'

                })

            }


            purchaseDateValue =
                date

        }


        // ==================================================
        // SOLD DATE
        // ==================================================

        let soldAtValue


        if (
            soldAt !== undefined
        ) {

            if (
                soldAt === null
            ) {

                soldAtValue =
                    null

            }

            else {

                const date =
                    parseThailandDate(
                        soldAt
                    )


                if (!date) {

                    return res.status(400).json({

                        message:
                            'Invalid sold date'

                    })

                }


                soldAtValue =
                    date

            }

        }


        // ==================================================
        // FINAL VALUES
        // ==================================================

        let finalStatus =
            status !== undefined
                ? status
                : oldStock.status


        let finalSalePrice =
            actualSalePrice !== undefined
                ? (
                    actualSalePrice === null
                        ? null
                        : Number(
                            actualSalePrice
                        )
                )
                : oldStock.actualSalePrice


        let finalSoldAt =
            soldAt !== undefined
                ? soldAtValue
                : oldStock.soldAt


        // ==================================================
        // QUANTITY 0
        // ==================================================

        if (
            finalQuantity === 0 &&
            status === undefined
        ) {

            finalStatus =
                'SOLD'

        }


        // ==================================================
        // SOLD
        // ==================================================

        if (
            finalStatus ===
            'SOLD'
        ) {

            if (
                finalQuantity !== 0
            ) {

                return res.status(400).json({

                    message:
                        'Stock status SOLD requires quantity to be 0'

                })

            }


            if (
                finalSalePrice === null ||
                finalSalePrice === undefined ||
                !isValidNumber(
                    finalSalePrice
                ) ||
                Number(finalSalePrice) < 0
            ) {

                return res.status(400).json({

                    message:
                        'Actual sale price is required when status is SOLD'

                })

            }


            if (!finalSoldAt) {

                finalSoldAt =
                    nowThailand()

            }

        }


        // ==================================================
        // AVAILABLE
        // ==================================================

        if (
            finalStatus ===
            'AVAILABLE'
        ) {

            if (
                finalQuantity <= 0
            ) {

                return res.status(400).json({

                    message:
                        'AVAILABLE stock must have quantity greater than 0'

                })

            }


            finalSoldAt =
                null

        }


        // ==================================================
        // CANCELLED
        // ==================================================

        if (
            finalStatus ===
            'CANCELLED'
        ) {

            finalSoldAt =
                null

        }


        // ==================================================
        // PROTECT SALE HISTORY
        //
        // ถ้ามีประวัติขายแล้ว
        // ห้ามเปลี่ยน costPrice ย้อนหลัง
        // เพราะ historical cost อยู่ที่
        // SaleItem.costPriceAtSale
        //
        // และห้ามเปลี่ยน Stock ที่ SOLD
        // กลับเป็น AVAILABLE/CANCELLED
        // ถ้ามี sale history
        // ==================================================

        if (
            oldStock.saleItems.length > 0
        ) {

            if (
                costPrice !== undefined &&
                Number(costPrice) !==
                toNumber(
                    oldStock.costPrice
                )
            ) {

                return res.status(400).json({

                    message:
                        'Cannot change cost price of stock with sale history'

                })

            }


            if (
                status !== undefined &&
                status !== oldStock.status &&
                oldStock.status === 'SOLD'
            ) {

                return res.status(400).json({

                    message:
                        'Cannot change status of sold stock with sale history'

                })

            }

        }


        // ==================================================
        // UPDATE
        // where ใช้ id + accountId ป้องกันแก้ข้าม account
        // ==================================================

        const stock =
            await prisma.$transaction(
                async tx => {

                    const updated =
                        await tx.consignmentItem.update({

                            where: {

                                id:
                                    oldStock.id

                            },

                            data: {

                                ...(name !== undefined && {

                                    name:
                                        name.trim()

                                }),

                                ...(description !== undefined && {

                                    description:
                                        normalizeNullableString(
                                            description
                                        )

                                }),

                                ...(quantity !== undefined && {

                                    quantity:
                                        finalQuantity

                                }),

                                ...(costPrice !== undefined && {

                                    costPrice:
                                        Number(
                                            costPrice
                                        )

                                }),

                                ...(actualSalePrice !== undefined && {

                                    actualSalePrice:
                                        finalSalePrice === null
                                            ? null
                                            : Number(
                                                finalSalePrice
                                            )

                                }),

                                ...(status !== undefined ||
                                    quantity !== undefined
                                    ? {

                                        status:
                                            finalStatus

                                    }
                                    : {}),

                                ...(purchaseDate !== undefined && {

                                    purchaseDate:
                                        purchaseDateValue

                                }),

                                ...(soldAt !== undefined ||
                                    status !== undefined ||
                                    quantity !== undefined
                                    ? {

                                        soldAt:
                                            finalSoldAt

                                    }
                                    : {}),

                                ...(note !== undefined && {

                                    note:
                                        normalizeNullableString(
                                            note
                                        )

                                })

                            },

                            include: {

                                owner:
                                    true

                            }

                        })


                    if (req.user?.id) {

                        await tx.auditLog.create({

                            data: {

                                userId:
                                    Number(
                                        req.user.id
                                    ),

                                action:
                                    'UPDATE',

                                entity:
                                    'ConsignmentItem',

                                entityId:
                                    updated.id,

                                details:
                                    JSON.stringify({

                                        before:
                                            auditStockData(
                                                oldStock
                                            ),

                                        after:
                                            auditStockData(
                                                updated
                                            )

                                    })

                            }

                        })

                    }


                    return updated

                }
            )


        return res.json({

            message:
                'Stock updated successfully',

            stock:
                serializeStock(
                    stock
                )

        })


    } catch (err) {

        console.error(
            'Update Stock Error:',
            err
        )

        return res.status(500).json({

            message:
                'Server Error'

        })

    }

}


// ======================================================
// DELETE STOCK
// DELETE /api/stock/:id
// ======================================================

exports.remove = async (req, res) => {

    try {

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(403).json({

                message:
                    'ไม่พบ account ของผู้ใช้งาน'

            })

        }


        const id =
            Number(
                req.params.id
            )


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                message:
                    'Invalid stock id'

            })

        }


        // ==================================================
        // scoped ด้วย accountId กันลบข้าม account
        // ==================================================

        const stock =
            await prisma.consignmentItem.findFirst({

                where: {

                    id,

                    accountId

                },

                include: {

                    saleItems:
                        true

                }

            })


        if (!stock) {

            return res.status(404).json({

                message:
                    'Stock not found'

            })

        }


        // ==================================================
        // SOLD STOCK
        // ==================================================

        if (
            stock.status ===
            'SOLD'
        ) {

            return res.status(400).json({

                message:
                    'Sold stock cannot be deleted'

            })

        }


        // ==================================================
        // SALE HISTORY
        // ==================================================

        if (
            stock.saleItems.length > 0
        ) {

            return res.status(400).json({

                message:
                    'Stock has sale history and cannot be deleted'

            })

        }


        // ==================================================
        // DELETE
        // ==================================================

        await prisma.$transaction(
            async tx => {

                await tx.consignmentItem.delete({

                    where: {

                        id:
                            stock.id

                    }

                })


                if (req.user?.id) {

                    await tx.auditLog.create({

                        data: {

                            userId:
                                Number(
                                    req.user.id
                                ),

                            action:
                                'DELETE',

                            entity:
                                'ConsignmentItem',

                            entityId:
                                id,

                            details:
                                JSON.stringify(
                                    auditStockData(
                                        stock
                                    )
                                )

                        }

                    })

                }

            }
        )


        return res.json({

            message:
                'Stock deleted successfully',

            deletedId:
                id

        })


    } catch (err) {

        console.error(
            'Delete Stock Error:',
            err
        )

        return res.status(500).json({

            message:
                'Server Error'

        })

    }

}