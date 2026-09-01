// ======================================================
// MIGRATE ACCOUNTS
// ======================================================
//
// จุดประสงค์:
// ผูก accountId ย้อนหลังให้ User ที่ accountId เป็น null
// (สร้างจากตอนที่ระบบยังไม่มี multi-tenancy)
//
// สมมติฐาน: 1 user = 1 account
// (ถ้าระบบจริงมีหลาย user ใช้ account เดียวกัน
//  ต้องแก้ script นี้ก่อนรัน — อย่ารันทับเฉยๆ)
//
// วิธีรัน:
//   node scripts/migrate-accounts.js
//
// รันครั้งเดียวพอ (idempotent — รันซ้ำได้ไม่พัง
// เพราะข้าม user ที่มี accountId แล้ว)
//
// ======================================================

const prisma = require("../config/prisma")


async function main() {

    console.log("== START ACCOUNT MIGRATION ==")


    // ==================================================
    // 1) หา user ทั้งหมดที่ยังไม่มี accountId
    // ==================================================

    const usersWithoutAccount =
        await prisma.user.findMany({

            where: {

                accountId: null

            }

        })


    console.log(
        `Found ${usersWithoutAccount.length} user(s) without accountId`
    )


    if (usersWithoutAccount.length === 0) {

        console.log("Nothing to migrate. Exiting.")

        return

    }


    // ==================================================
    // 2) วนสร้าง Account ให้แต่ละ user ทีละคน
    //    แล้วผูกข้อมูลอื่นที่ user คนนั้นเป็นคนสร้าง
    //    เข้ากับ account ใหม่นี้ด้วย
    // ==================================================

    for (const user of usersWithoutAccount) {

        console.log(
            `\n--- Migrating user #${user.id} (${user.email}) ---`
        )


        await prisma.$transaction(async (tx) => {

            // ----------------------------------------------
            // สร้าง Account ใหม่
            // ----------------------------------------------

            const account =
                await tx.account.create({

                    data: {

                        name:
                            user.name ||
                            user.email

                    }

                })


            console.log(
                `  Created Account #${account.id}`
            )


            // ----------------------------------------------
            // ผูก user เข้ากับ account ใหม่
            // ----------------------------------------------

            await tx.user.update({

                where: { id: user.id },

                data: { accountId: account.id }

            })


            // ----------------------------------------------
            // ผูกข้อมูลที่ user คนนี้เป็นคนสร้าง/เกี่ยวข้อง
            // เข้ากับ account เดียวกัน
            //
            // อิงจาก createdById เป็นหลัก เพราะเป็น field
            // เดียวที่เชื่อม record กลับไปหา user ได้ตรงๆ
            //
            // NOTE: ถ้าระบบเดิมมีหลาย user สร้างข้อมูล
            // ปนกันในร้านเดียว (เช่น owner + staff)
            // ต้อง map เพิ่มเองว่า staff คนไหนอยู่ account
            // เดียวกับเจ้าของร้านคนไหน — script นี้จะ
            // สร้างทุก user เป็นคนละ account ให้หมดก่อน
            // ----------------------------------------------

            const saleUpdate =
                await tx.sale.updateMany({

                    where: {
                        createdById: user.id,
                        accountId: null
                    },

                    data: { accountId: account.id }

                })

            console.log(
                `  Linked ${saleUpdate.count} Sale record(s)`
            )


            const expenseUpdate =
                await tx.expense.updateMany({

                    where: {
                        createdById: user.id,
                        accountId: null
                    },

                    data: { accountId: account.id }

                })

            console.log(
                `  Linked ${expenseUpdate.count} Expense record(s)`
            )


            // ----------------------------------------------
            // Customer, Owner, ConsignmentItem ไม่มี createdById
            // ตรงๆ ในตัวเอง — ผูกผ่าน Sale ที่เพิ่ง link ไปแล้ว
            // ----------------------------------------------

            const customerIdsFromSales =
                await tx.sale.findMany({

                    where: { accountId: account.id },

                    select: { customerId: true },

                    distinct: ["customerId"]

                })


            const customerIds =
                customerIdsFromSales
                    .map((s) => s.customerId)
                    .filter((id) => id !== null)


            if (customerIds.length > 0) {

                const customerUpdate =
                    await tx.customer.updateMany({

                        where: {
                            id: { in: customerIds },
                            accountId: null
                        },

                        data: { accountId: account.id }

                    })

                console.log(
                    `  Linked ${customerUpdate.count} Customer record(s)`
                )

            }


            const consignmentIdsFromSaleItems =
                await tx.saleItem.findMany({

                    where: {
                        sale: { accountId: account.id }
                    },

                    select: { consignmentItemId: true },

                    distinct: ["consignmentItemId"]

                })


            const consignmentIds =
                consignmentIdsFromSaleItems
                    .map((i) => i.consignmentItemId)


            if (consignmentIds.length > 0) {

                const consignmentUpdate =
                    await tx.consignmentItem.updateMany({

                        where: {
                            id: { in: consignmentIds },
                            accountId: null
                        },

                        data: { accountId: account.id }

                    })

                console.log(
                    `  Linked ${consignmentUpdate.count} ConsignmentItem record(s)`
                )


                const ownerIdsFromItems =
                    await tx.consignmentItem.findMany({

                        where: { id: { in: consignmentIds } },

                        select: { ownerId: true },

                        distinct: ["ownerId"]

                    })


                const ownerIds =
                    ownerIdsFromItems.map((i) => i.ownerId)


                if (ownerIds.length > 0) {

                    const ownerUpdate =
                        await tx.owner.updateMany({

                            where: {
                                id: { in: ownerIds },
                                accountId: null
                            },

                            data: { accountId: account.id }

                        })

                    console.log(
                        `  Linked ${ownerUpdate.count} Owner record(s)`
                    )

                }

            }

        })

    }


    // ==================================================
    // 3) รายงานสรุปข้อมูลที่ยังตกหล่น (accountId ยัง null)
    //    เผื่อมีเคสที่ script นี้ map ไม่ครบ
    //    (เช่น customer ที่ยังไม่เคยมี sale เลย)
    // ==================================================

    const orphanCustomers =
        await prisma.customer.count({
            where: { accountId: null }
        })

    const orphanConsignmentItems =
        await prisma.consignmentItem.count({
            where: { accountId: null }
        })

    const orphanOwners =
        await prisma.owner.count({
            where: { accountId: null }
        })

    const orphanSales =
        await prisma.sale.count({
            where: { accountId: null }
        })

    const orphanExpenses =
        await prisma.expense.count({
            where: { accountId: null }
        })


    console.log("\n== SUMMARY: records still without accountId ==")

    console.log(`  Customer:         ${orphanCustomers}`)
    console.log(`  ConsignmentItem:  ${orphanConsignmentItems}`)
    console.log(`  Owner:            ${orphanOwners}`)
    console.log(`  Sale:             ${orphanSales}`)
    console.log(`  Expense:          ${orphanExpenses}`)

    console.log(
        "\nถ้ามีตัวเลขข้างบนไม่เป็น 0 ให้ตรวจสอบว่า record " +
        "เหล่านั้นเป็นของ user คนไหน แล้วผูกมือด้วย SQL/Prisma " +
        "Studio ก่อน deploy จริง"
    )


    console.log("\n== DONE ==")

}


main()
    .catch((err) => {

        console.error("MIGRATION ERROR:", err)

        process.exitCode = 1

    })
    .finally(async () => {

        await prisma.$disconnect()

    })