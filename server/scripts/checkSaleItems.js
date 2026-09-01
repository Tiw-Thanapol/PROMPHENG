// ============================================================
// DEBUG SCRIPT — เช็ค SaleItem จริงในฐานข้อมูล
//
// วิธีใช้:
// 1. copy ไฟล์นี้ไปวางที่ server\scripts\checkSaleItems.js
// 2. รันคำสั่ง (จากโฟลเดอร์ server):
//
//      node scripts/checkSaleItems.js "เสื้อฟ้า"
//
//    หรือถ้ารู้ consignmentItemId (เช่น 52) ให้รันแบบนี้แทน:
//
//      node scripts/checkSaleItems.js --id 52
//
// สคริปต์นี้จะโชว์ทุก SaleItem record ที่เกี่ยวกับสินค้านั้น
// พร้อมวันเวลา ราคา และ saleId เพื่อดูว่ามีกี่ record จริง ๆ
// ============================================================

const prisma = require("../config/prisma")


async function main() {

    const args = process.argv.slice(2)

    let consignmentItemId = null
    let searchName = null

    const idFlagIndex = args.indexOf("--id")

    if (idFlagIndex !== -1) {

        consignmentItemId = Number(args[idFlagIndex + 1])

    } else if (args[0]) {

        searchName = args[0]

    }

    if (!consignmentItemId && !searchName) {

        console.log("กรุณาระบุชื่อสินค้า หรือ --id <consignmentItemId>")
        process.exit(1)

    }

    // ========================================================
    // หา consignmentItemId จากชื่อ ถ้ายังไม่มี id
    // ========================================================

    let targetIds = []

    if (consignmentItemId) {

        targetIds = [consignmentItemId]

    } else {

        const matches = await prisma.consignmentItem.findMany({

            where: {
                name: {
                    contains: searchName
                }
            },

            select: {
                id: true,
                name: true,
                quantity: true,
                status: true
            }

        })

        if (matches.length === 0) {

            console.log(`ไม่พบสินค้าที่ชื่อมีคำว่า "${searchName}"`)
            process.exit(0)

        }

        console.log("พบสินค้าที่ตรงกับคำค้นหา:")
        console.table(matches)

        targetIds = matches.map(m => m.id)

    }

    // ========================================================
    // ดึง SaleItem ทั้งหมดของ id เหล่านี้
    // ========================================================

    const saleItems = await prisma.saleItem.findMany({

        where: {
            consignmentItemId: {
                in: targetIds
            }
        },

        include: {
            sale: {
                select: {
                    id: true,
                    createdAt: true,
                    createdById: true,
                    status: true
                }
            },
            consignmentItem: {
                select: {
                    id: true,
                    name: true
                }
            }
        },

        orderBy: {
            sale: {
                createdAt: "asc"
            }
        }

    })


    console.log(`\nพบ SaleItem ทั้งหมด ${saleItems.length} record(s):\n`)

    console.table(

        saleItems.map(item => ({
            saleItemId: item.id,
            saleId: item.saleId,
            consignmentItemId: item.consignmentItemId,
            productName: item.consignmentItem?.name,
            quantity: item.quantity,
            salePrice: item.salePrice,
            saleCreatedAt: item.sale?.createdAt,
            saleStatus: item.sale?.status
        }))

    )

    process.exit(0)

}


main().catch(err => {

    console.error("ERROR:", err)
    process.exit(1)

})