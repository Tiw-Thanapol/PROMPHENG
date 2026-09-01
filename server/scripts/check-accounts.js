const prisma = require("../config/prisma")
async function main() {
const users = await prisma.user.findMany({ select: { id: true, email: true, accountId: true, role: true }, orderBy: { id: "asc" } })
console.log("=== USERS ===")
users.forEach((u) => console.log(`id=${u.id} email=${u.email} accountId=${u.accountId} role=${u.role}`))
console.log("=== END ===")
}
main().catch((e)=>console.error(e)).finally(async ()=>await prisma.$disconnect())
