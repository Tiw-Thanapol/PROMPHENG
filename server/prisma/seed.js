const prisma = require("../src/config/prisma")


async function main() {

    const codes = [
        "SR-TEST-001",
        "SR-TEST-002",
        "SR-TEST-003",
        "SR-TEST-004",
        "SR-TEST-005"
    ]


    for (const code of codes) {

        await prisma.registrationCode.upsert({

            where: {
                code: code
            },

            update: {},

            create: {
                code: code,
                enabled: true,
                used: false
            }

        })

    }


    console.log("Registration codes created")

}


main()
    .then(async () => {

        await prisma.$disconnect()

    })
    .catch(async (err) => {

        console.log(err)

        await prisma.$disconnect()

        process.exit(1)

    })