const prisma = require("./config/prisma");

async function test() {
    try {
        console.log("Testing database connection...");

        const result = await prisma.user.findFirst({
            select: {
                id: true,
                email: true,
                name: true
            }
        });

        console.log("DATABASE OK");
        console.log(result);

    } catch (error) {

        console.error("DATABASE ERROR");
        console.error(error);

    } finally {

        await prisma.$disconnect();

    }
}

test();