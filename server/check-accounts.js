const prisma = require("../config/prisma")

async function main() {

    const users = await prisma.user.findMany({

        select: {
            id: true,
            email: true,
            accountId: true,
            role: true
        },

        orderBy: { id: "asc" }

    })

    console.log("\n=== USERS ===\n")

    users.forEach((u) => {

        console.log(
            `id=${u.id}  email=${u.email}  accountId=${u.accountId}  role=${u.role}`
        )

    })

    console.log("\n=== END ===\n")

}

main()
    .catch((err) => console.error(err))
    .finally(async () => await prisma.$disconnect())