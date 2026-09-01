require('dotenv').config()

const { PrismaClient } = require('@prisma/client')

console.log('DATABASE_URL loaded:', !!process.env.DATABASE_URL)

const prisma = new PrismaClient()

async function main() {

    console.log('Testing Prisma connection...')

    const user = await prisma.user.findFirst({
        select: {
            id: true,
            email: true,
            name: true
        }
    })

    console.log('PRISMA OK')
    console.log(user)

}

main()
    .catch(err => {

        console.error('PRISMA ERROR')
        console.error(err)

    })
    .finally(async () => {

        await prisma.$disconnect()

    })