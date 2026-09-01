const prisma = require('../config/prisma')


// ======================================================
// ACCOUNT ISOLATION
//
// CRITICAL:
//
// เดิมทั้งไฟล์นี้เช็ค owner ด้วย owner.findUnique({ id })
// เฉยๆ ไม่ scope accountId เลย และ getOwnerPayment ไม่มีการ
// เช็ค account ใดๆ เลยแม้แต่จุดเดียว ทำให้ user account ไหน
// ก็ตาม เดา/ลอง ownerId หรือ paymentId ของ account อื่น แล้ว
// ดูยอดที่ต้องจ่าย, ประวัติการจ่ายเงิน, หรือแม้แต่ "สร้าง
// รายการจ่ายเงินให้ owner ของ account อื่น" ได้ทันที
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
// CREATE OWNER PAYMENT
// POST /api/owners/:id/payments
// ======================================================

exports.createOwnerPayment = async (req, res) => {

    try {

        // ==================================================
        // ACCOUNT ISOLATION
        // ==================================================

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(401).json({
                message: 'Unauthorized'
            })
        }


        const ownerId =
            Number(req.params.id)

        const amount =
            Number(req.body.amount)

        const note =
            req.body.note || null


        // ==================================================
        // VALIDATE OWNER ID
        // ==================================================

        if (
            !Number.isInteger(ownerId) ||
            ownerId <= 0
        ) {

            return res.status(400).json({
                message: 'Invalid owner id'
            })
        }


        // ==================================================
        // VALIDATE AMOUNT
        // ==================================================

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            return res.status(400).json({
                message: 'Invalid payment amount'
            })
        }


        // ==================================================
        // GET USER FROM AUTH
        // ==================================================

        const userId =
            Number(req.user.id)


        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(401).json({
                message: 'Invalid user'
            })
        }


        // ==================================================
        // CHECK OWNER
        //
        // เปลี่ยนจาก findUnique({ id }) เป็น findFirst พร้อม
        // scope accountId — กัน owner ของ account อื่นเด็ดขาด
        // ==================================================

        const owner =
            await prisma.owner.findFirst({

                where: {
                    id: ownerId,
                    accountId
                }
            })


        if (!owner) {

            return res.status(404).json({
                message: 'Owner not found'
            })
        }


        // ==================================================
        // CALCULATE OWNER PAYABLE
        //
        // ใช้หลักเดียวกับ ownerProfit
        //
        // SOLD
        //   ownerAmount = costPrice
        //
        // FULL RETURN
        //   ownerAmount = 0
        //
        // PARTIAL RETURN
        //   ownerAmount = costPrice
        //
        // หมายเหตุ: owner ผ่านการเช็ค accountId มาแล้วด้านบน
        // แต่เพิ่ม accountId ซ้ำใน where ของ consignmentItem/sale
        // ด้านล่างอีกชั้น เป็น defense-in-depth เผื่อ ownerId
        // หลุดหรือมีบั๊กจุดอื่นในอนาคต
        // ==================================================

        const saleItems =
            await prisma.saleItem.findMany({

                where: {

                    consignmentItem: {

                        ownerId: ownerId,

                        accountId
                    },

                    sale: {

                        status: 'COMPLETED',

                        accountId
                    }
                },

                include: {

                    sale: {

                        select: {

                            id: true,
                            status: true
                        }
                    },

                    consignmentItem: {

                        select: {

                            costPrice: true
                        }
                    },

                    returns: {

                        select: {

                            refundAmount: true
                        }
                    }
                }
            })


        // ==================================================
        // CALCULATE TOTAL EARNED
        // ==================================================

        let totalEarned = 0


        for (const item of saleItems) {

            const salePrice =
                Number(item.salePrice)

            const costPrice =
                Number(
                    item.consignmentItem.costPrice
                )


            const refundAmount =
                item.returns.reduce(

                    (sum, returnItem) => {

                        return sum +
                            Number(
                                returnItem.refundAmount || 0
                            )
                    },

                    0
                )


            // FULL RETURN
            const isReturned =
                refundAmount >= salePrice


            if (!isReturned) {

                totalEarned += costPrice
            }
        }


        // ==================================================
        // GET TOTAL PAID
        //
        // ปลอดภัยแล้วเพราะ ownerId ผ่านการเช็ค accountId
        // มาแล้วด้านบน (owner.findFirst)
        // ==================================================

        const paymentAggregate =
            await prisma.ownerPayment.aggregate({

                where: {

                    ownerId: ownerId
                },

                _sum: {

                    amount: true
                }
            })


        const totalPaid =
            Number(
                paymentAggregate._sum.amount || 0
            )


        // ==================================================
        // PAYABLE
        // ==================================================

        const payable =
            Math.max(
                0,
                totalEarned -
                totalPaid
            )


        // ==================================================
        // PREVENT OVERPAYMENT
        // ==================================================

        if (amount > payable) {

            return res.status(400).json({

                message:
                    'Payment amount exceeds payable amount',

                totalEarned,

                totalPaid,

                payable,

                requestedAmount:
                    amount
            })
        }


        // ==================================================
        // CREATE PAYMENT + AUDIT LOG
        // ATOMIC TRANSACTION
        // ==================================================

        const result =
            await prisma.$transaction(
                async (tx) => {

                    const payment =
                        await tx.ownerPayment.create({

                            data: {

                                ownerId,

                                amount,

                                note,

                                createdById:
                                    userId
                            },

                            include: {

                                owner: true,

                                createdBy: {

                                    select: {

                                        id: true,
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        })


                    await tx.auditLog.create({

                        data: {

                            userId,

                            action:
                                'CREATE_OWNER_PAYMENT',

                            entity:
                                'OwnerPayment',

                            entityId:
                                payment.id,

                            details:
                                JSON.stringify({

                                    ownerId,

                                    amount,

                                    payableBefore:
                                        payable,

                                    payableAfter:
                                        payable -
                                        amount
                                })
                        }
                    })


                    return payment
                }
            )


        // ==================================================
        // RESPONSE
        // ==================================================

        const newTotalPaid =
            totalPaid +
            amount


        const newPayable =
            Math.max(
                0,
                totalEarned -
                newTotalPaid
            )


        res.status(201).json({

            message:
                'Owner payment created',

            payment: {

                id:
                    result.id,

                ownerId:
                    result.ownerId,

                owner:
                    result.owner,

                amount:
                    Number(result.amount),

                note:
                    result.note,

                createdBy:
                    result.createdBy,

                createdAt:
                    result.createdAt
            },

            summary: {

                totalEarned,

                totalPaid:
                    newTotalPaid,

                payable:
                    newPayable
            }
        })


    } catch (err) {

        console.log(err)

        res.status(500).json({

            message:
                'Server Error'
        })
    }
}


// ======================================================
// GET OWNER PAYMENT HISTORY
// GET /api/owners/:id/payments
// ======================================================

exports.ownerPaymentHistory = async (req, res) => {

    try {

        // ==================================================
        // ACCOUNT ISOLATION
        // ==================================================

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(401).json({
                message: 'Unauthorized'
            })
        }


        const ownerId =
            Number(req.params.id)


        // ==================================================
        // VALIDATE ID
        // ==================================================

        if (
            !Number.isInteger(ownerId) ||
            ownerId <= 0
        ) {

            return res.status(400).json({
                message: 'Invalid owner id'
            })
        }


        // ==================================================
        // CHECK OWNER
        //
        // เปลี่ยนจาก findUnique({ id }) เป็น findFirst พร้อม
        // scope accountId — กัน owner ของ account อื่นเด็ดขาด
        // ==================================================

        const owner =
            await prisma.owner.findFirst({

                where: {
                    id: ownerId,
                    accountId
                }
            })


        if (!owner) {

            return res.status(404).json({
                message: 'Owner not found'
            })
        }


        // ==================================================
        // GET PAYMENTS
        //
        // ปลอดภัยแล้วเพราะ ownerId ผ่านการเช็ค accountId
        // มาแล้วด้านบน (owner.findFirst)
        // ==================================================

        const payments =
            await prisma.ownerPayment.findMany({

                where: {

                    ownerId
                },

                include: {

                    createdBy: {

                        select: {

                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },

                orderBy: {

                    createdAt:
                        'desc'
                }
            })


        // ==================================================
        // TOTAL PAID
        // ==================================================

        const totalPaid =
            payments.reduce(

                (sum, payment) => {

                    return sum +
                        Number(payment.amount)
                },

                0
            )


        // ==================================================
        // RESPONSE
        // ==================================================

        res.json({

            owner: {

                id:
                    owner.id,

                name:
                    owner.name,

                phone:
                    owner.phone,

                note:
                    owner.note
            },

            summary: {

                paymentCount:
                    payments.length,

                totalPaid
            },

            payments:
                payments.map(payment => ({

                    id:
                        payment.id,

                    amount:
                        Number(payment.amount),

                    note:
                        payment.note,

                    createdBy:
                        payment.createdBy,

                    createdAt:
                        payment.createdAt
                }))
        })


    } catch (err) {

        console.log(err)

        res.status(500).json({

            message:
                'Server Error'
        })
    }
}


// ======================================================
// GET SINGLE OWNER PAYMENT
// GET /api/owners/:ownerId/payments/:paymentId
//
// เดิมฟังก์ชันนี้ไม่มีการเช็ค account เลยแม้แต่จุดเดียว —
// เป็นจุดที่อันตรายที่สุดในไฟล์นี้ เพราะแค่รู้/เดา
// paymentId + ownerId ของ account อื่น ก็ดึงรายละเอียด
// การจ่ายเงินออกมาได้ทันที
// ======================================================

exports.getOwnerPayment = async (req, res) => {

    try {

        // ==================================================
        // ACCOUNT ISOLATION
        // ==================================================

        const accountId =
            getAccountId(req)


        if (!accountId) {

            return res.status(401).json({
                message: 'Unauthorized'
            })
        }


        const ownerId =
            Number(req.params.ownerId)

        const paymentId =
            Number(req.params.paymentId)


        // ==================================================
        // VALIDATE
        // ==================================================

        if (
            !Number.isInteger(ownerId) ||
            ownerId <= 0 ||
            !Number.isInteger(paymentId) ||
            paymentId <= 0
        ) {

            return res.status(400).json({

                message:
                    'Invalid id'
            })
        }


        // ==================================================
        // GET PAYMENT
        //
        // เพิ่มเงื่อนไข owner.accountId ผ่าน nested relation
        // filter — ต้องเป็น payment ของ owner ที่อยู่ใน
        // account เดียวกับผู้ใช้ที่ล็อกอินอยู่เท่านั้น
        // ==================================================

        const payment =
            await prisma.ownerPayment.findFirst({

                where: {

                    id:
                        paymentId,

                    ownerId,

                    owner: {

                        accountId
                    }
                },

                include: {

                    owner: true,

                    createdBy: {

                        select: {

                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            })


        if (!payment) {

            return res.status(404).json({

                message:
                    'Owner payment not found'
            })
        }


        // ==================================================
        // RESPONSE
        // ==================================================

        res.json({

            id:
                payment.id,

            owner: {

                id:
                    payment.owner.id,

                name:
                    payment.owner.name,

                phone:
                    payment.owner.phone,

                note:
                    payment.owner.note
            },

            amount:
                Number(payment.amount),

            note:
                payment.note,

            createdBy:
                payment.createdBy,

            createdAt:
                payment.createdAt
        })


    } catch (err) {

        console.log(err)

        res.status(500).json({

            message:
                'Server Error'
        })
    }
}