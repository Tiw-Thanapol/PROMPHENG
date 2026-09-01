// ======================================================
// ONE-TIME BACKFILL SCRIPT
//
// ใช้รันครั้งเดียวหลังจาก migrate schema (เพิ่ม AccountCounter,
// Sale.orderNo, Customer.customerNumber) เพื่อกำหนดเลขลำดับ
// ย้อนหลังให้ sale/customer ที่มีอยู่แล้วในระบบ โดยไล่ตาม
// accountId แล้วเรียงตาม id (= ลำดับการสร้างจริง)
//
// วิธีรัน:
//
//   1) DRY RUN ก่อนเสมอ (ไม่เขียนอะไรลง DB แค่ print ตัวอย่าง):
//        node backfill-account-counters.js --dry-run
//
//   2) เมื่อตรวจตัวเลขใน dry-run แล้วโอเค ค่อยรันจริง:
//        node backfill-account-counters.js
//
// ต้อง backup database ก่อนรันจริงเสมอ และรันตอนที่ไม่มี
// traffic สร้าง sale/customer ใหม่พร้อมกัน (maintenance window)
// เพราะสคริปต์นี้ไม่ได้ lock table ระหว่างอ่าน id ทั้งหมด
// ======================================================

const prisma = require("./config/prisma")


const DRY_RUN = process.argv.includes("--dry-run")


function generateCustomerCode(customerNumber) {

    return `C${String(customerNumber).padStart(5, "0")}`

}


function getBangkokYearMonth(date) {

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
// BACKFILL SALE.orderNo
//
// รูปแบบใหม่: YYMMnnn (รีเซ็ตทุกเดือน) ให้ตรงกับ
// getNextOrderNo() ใน controllers/orders.js
//
// จัดกลุ่ม sale ตามเดือนของ createdAt (Bangkok timezone)
// แล้วเรียงลำดับภายในกลุ่มตาม createdAt/id เดิม เพื่อให้
// เลขย้อนหลังตรงกับลำดับการสร้างจริง
//
// ทำต่อ account เดียวในหนึ่ง transaction เพื่อกันข้อมูล
// ครึ่งๆ กลางๆ ถ้าเกิด error กลางคัน
// ======================================================

async function backfillSalesForAccount(accountId) {

    const sales = await prisma.sale.findMany({

        where: { accountId },

        orderBy: { createdAt: "asc" },

        select: { id: true, createdAt: true }

    })


    if (sales.length === 0) {

        return { accountId, count: 0 }

    }


    // ==================================================
    // GROUP BY YEAR-MONTH
    // ==================================================

    const groups = new Map()


    for (const sale of sales) {

        const { yy, mm } = getBangkokYearMonth(sale.createdAt)

        const key = `${yy}${mm}`


        if (!groups.has(key)) {

            groups.set(key, [])

        }


        groups.get(key).push(sale.id)

    }


    if (DRY_RUN) {

        for (const [key, ids] of groups) {

            console.log(

                `[DRY-RUN][SALE] account ${accountId} month ${key}: ` +
                `${ids.length} orders -> ${key}001..${key}${String(ids.length).padStart(3, "0")}`

            )

        }

        return { accountId, count: sales.length }

    }


    await prisma.$transaction(async tx => {

        for (const [key, ids] of groups) {

            for (let i = 0; i < ids.length; i++) {

                const sequence = String(i + 1).padStart(3, "0")

                const orderNo = Number(`${key}${sequence}`)


                await tx.sale.update({

                    where: { id: ids[i] },

                    data: { orderNo }

                })

            }


            await tx.accountCounter.upsert({

                where: {
                    accountId_type: { accountId, type: `SALE_${key}` }
                },

                create: {
                    accountId,
                    type: `SALE_${key}`,
                    value: ids.length
                },

                update: {
                    value: ids.length
                }

            })

        }

    })


    return { accountId, count: sales.length }

}


// ======================================================
// BACKFILL Customer.customerNumber + Customer.customerCode
//
// ⚠️ ต้อง regenerate customerCode ใหม่ทุกครั้งพร้อมกับ
// customerNumber ไม่งั้น code เก่าที่อิงจาก id เดิมจะค้าง
// อยู่ ไม่ตรงกับ customerNumber ที่ backfill ไป
// ======================================================

async function backfillCustomersForAccount(accountId) {

    const customers = await prisma.customer.findMany({

        where: { accountId },

        orderBy: { id: "asc" },

        select: { id: true, customerNumber: true, customerCode: true }

    })


    if (customers.length === 0) {

        return { accountId, count: 0 }

    }


    if (DRY_RUN) {

        const sampleFirst = customers[0]

        const sampleLast = customers[customers.length - 1]

        console.log(

            `[DRY-RUN][CUSTOMER] account ${accountId}: ` +
            `${customers.length} records -> customerNumber 1..${customers.length}\n` +
            `    id ${sampleFirst.id}: "${sampleFirst.customerCode}" -> ` +
            `"${generateCustomerCode(1)}" (customerNumber 1)\n` +
            `    id ${sampleLast.id}: "${sampleLast.customerCode}" -> ` +
            `"${generateCustomerCode(customers.length)}" (customerNumber ${customers.length})`

        )

        return { accountId, count: customers.length }

    }


    await prisma.$transaction(async tx => {

        for (let i = 0; i < customers.length; i++) {

            const customerNumber = i + 1

            await tx.customer.update({

                where: { id: customers[i].id },

                data: {

                    customerNumber,

                    customerCode: generateCustomerCode(customerNumber)

                }

            })

        }


        await tx.accountCounter.upsert({

            where: {
                accountId_type: { accountId, type: "CUSTOMER" }
            },

            create: {
                accountId,
                type: "CUSTOMER",
                value: customers.length
            },

            update: {
                value: customers.length
            }

        })

    })


    return { accountId, count: customers.length }

}


// ======================================================
// MAIN
// ======================================================

async function main() {

    console.log(

        DRY_RUN
            ? "Starting backfill in DRY-RUN mode (no writes)...\n"
            : "Starting backfill (writing to database)...\n"

    )


    const accounts = await prisma.account.findMany({ select: { id: true } })


    let totalSales = 0

    let totalCustomers = 0


    for (const { id: accountId } of accounts) {

        const saleResult = await backfillSalesForAccount(accountId)

        const customerResult = await backfillCustomersForAccount(accountId)


        totalSales += saleResult.count

        totalCustomers += customerResult.count


        if (!DRY_RUN) {

            console.log(

                `[DONE] account ${accountId}: ` +
                `${saleResult.count} sales, ${customerResult.count} customers`

            )

        }

    }


    console.log(

        `\n${DRY_RUN ? "[DRY-RUN] Would backfill" : "Backfilled"}: ` +
        `${accounts.length} accounts, ${totalSales} sales, ${totalCustomers} customers`

    )


    if (DRY_RUN) {

        console.log(

            "\nNo data was written. Review the numbers above, then run again " +
            "WITHOUT --dry-run to apply."

        )

    }

}


main()
    .catch(err => {

        console.error("BACKFILL ERROR:", err)

        process.exit(1)

    })
    .finally(async () => {

        await prisma.$disconnect()

    })