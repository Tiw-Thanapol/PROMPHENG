const prisma = require("../config/prisma");


// ======================================================
// HELPERS
// ======================================================

function toNumber(value) {
    return Number(Number(value || 0).toFixed(2));
}


function clean(value) {
    if (value === undefined || value === null) {
        return null;
    }

    return String(value).trim() || null;
}


function isValidPrice(value) {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return false;
    }

    const number = Number(value);

    return Number.isFinite(number) && number >= 0;
}


function parseId(value) {
    const id = Number(value);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        return null;
    }

    return id;
}


function getAccountId(req) {
    const accountId =
        Number(req.user?.accountId);

    if (
        !Number.isInteger(accountId) ||
        accountId <= 0
    ) {
        return null;
    }

    return accountId;
}


function serializeProduct(product) {
    return {
        ...product,

        costPrice:
            toNumber(product.costPrice),

        actualSalePrice:
            product.actualSalePrice !== null
                ? toNumber(
                    product.actualSalePrice
                )
                : null,

        profit:
            product.actualSalePrice !== null
                ? toNumber(
                    Number(product.actualSalePrice) -
                    Number(product.costPrice)
                )
                : null
    };
}


// ======================================================
// CREATE PRODUCT
// POST /api/product
//
// Product = สินค้าของร้านเอง
//
// ownerId ไม่รับจาก Client
// ใช้ Owner compatibility record ของ account นี้
// ======================================================

exports.create = async (req, res) => {

    try {

        const accountId =
            getAccountId(req);


        if (!accountId) {

            return res.status(403).json({
                message:
                    "ไม่พบ account ของผู้ใช้งาน"
            });

        }


        const {
            name,
            description,
            costPrice,
            actualSalePrice,
            note,
            purchaseDate
        } = req.body;


        // ==================================================
        // NAME
        // ==================================================

        if (
            typeof name !== "string" ||
            !name.trim()
        ) {

            return res.status(400).json({
                message:
                    "กรุณาระบุชื่อสินค้า"
            });

        }


        // ==================================================
        // COST PRICE
        // ==================================================

        if (!isValidPrice(costPrice)) {

            return res.status(400).json({
                message:
                    "กรุณาระบุต้นทุนสินค้าให้ถูกต้อง"
            });

        }


        const cost =
            Number(costPrice);


        // ==================================================
        // SALE PRICE
        // ==================================================

        let salePriceValue = null;


        if (
            actualSalePrice !== undefined &&
            actualSalePrice !== null &&
            actualSalePrice !== ""
        ) {

            if (
                !isValidPrice(
                    actualSalePrice
                )
            ) {

                return res.status(400).json({
                    message:
                        "ราคาขายไม่ถูกต้อง"
                });

            }


            salePriceValue =
                Number(actualSalePrice);

        }


        // ==================================================
        // PURCHASE DATE
        // ==================================================

        let purchaseDateValue =
            new Date();


        if (
            purchaseDate !== undefined
        ) {

            const date =
                new Date(purchaseDate);


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return res.status(400).json({
                    message:
                        "วันที่ซื้อไม่ถูกต้อง"
                });

            }


            purchaseDateValue =
                date;

        }


        // ==================================================
        // OWNER COMPATIBILITY
        //
        // สำคัญ:
        // ต้องหา Owner ภายใน account เดียวกันเท่านั้น
        //
        // ห้ามใช้ findFirst() แบบไม่มี accountId
        // ==================================================

        const owner =
            await prisma.owner.findFirst({

                where: {

                    accountId

                },

                orderBy: {

                    id:
                        "asc"

                }

            });


        if (!owner) {

            return res.status(500).json({
                message:
                    "ยังไม่มี Owner compatibility record ในระบบ"
            });

        }


        // ==================================================
        // CREATE PRODUCT
        // ==================================================

        const product =
            await prisma.consignmentItem.create({

                data: {

                    accountId,

                    ownerId:
                        owner.id,

                    name:
                        name.trim(),

                    description:
                        clean(description),

                    costPrice:
                        cost,

                    actualSalePrice:
                        salePriceValue,

                    status:
                        "AVAILABLE",

                    purchaseDate:
                        purchaseDateValue,

                    soldAt:
                        null,

                    note:
                        clean(note)

                }

            });


        // ==================================================
        // AUDIT LOG
        // ==================================================

        if (req.user?.id) {

            await prisma.auditLog.create({

                data: {

                    userId:
                        req.user.id,

                    action:
                        "CREATE",

                    entity:
                        "Product",

                    entityId:
                        product.id,

                    details:
                        JSON.stringify({

                            id:
                                product.id,

                            name:
                                product.name,

                            description:
                                product.description,

                            costPrice:
                                toNumber(
                                    product.costPrice
                                ),

                            actualSalePrice:
                                product.actualSalePrice !== null
                                    ? toNumber(
                                        product.actualSalePrice
                                    )
                                    : null,

                            status:
                                product.status,

                            purchaseDate:
                                product.purchaseDate,

                            note:
                                product.note

                        })

                }

            });

        }


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(201).json({

            message:
                "เพิ่มสินค้าสำเร็จ",

            product:
                serializeProduct(product)

        });

    } catch (err) {

        console.error(
            "Create Product Error:",
            err
        );

        return res.status(500).json({
            message:
                "ไม่สามารถเพิ่มสินค้าได้"
        });

    }

};


// ======================================================
// LIST PRODUCTS
// GET /api/products
// ======================================================

exports.list = async (req, res) => {

    try {

        const accountId =
            getAccountId(req);


        if (!accountId) {

            return res.status(403).json({
                message:
                    "ไม่พบ account ของผู้ใช้งาน"
            });

        }


        const {
            search,
            status
        } = req.query;


        // ==================================================
        // IMPORTANT
        //
        // accountId ต้องอยู่ใน root where เสมอ
        // ==================================================

        const where = {

            accountId

        };


        // ==================================================
        // SEARCH
        // ==================================================

        if (
            search &&
            search.trim()
        ) {

            where.name = {

                contains:
                    search.trim(),

                mode:
                    "insensitive"

            };

        }


        // ==================================================
        // STATUS
        // ==================================================

        if (status) {

            const allowedStatus = [
                "AVAILABLE",
                "SOLD",
                "CANCELLED"
            ];


            if (
                !allowedStatus.includes(
                    status
                )
            ) {

                return res.status(400).json({
                    message:
                        "สถานะสินค้าไม่ถูกต้อง"
                });

            }


            where.status =
                status;

        }


        // ==================================================
        // GET PRODUCTS
        // ==================================================

        const products =
            await prisma.consignmentItem.findMany({

                where,

                orderBy: {

                    createdAt:
                        "desc"

                }

            });


        return res.json({

            count:
                products.length,

            products:
                products.map(
                    serializeProduct
                )

        });

    } catch (err) {

        console.error(
            "List Products Error:",
            err
        );

        return res.status(500).json({
            message:
                "ไม่สามารถโหลดสินค้าได้"
        });

    }

};


// ======================================================
// READ PRODUCT
// GET /api/product/:id
// ======================================================

exports.read = async (req, res) => {

    try {

        const accountId =
            getAccountId(req);


        if (!accountId) {

            return res.status(403).json({
                message:
                    "ไม่พบ account ของผู้ใช้งาน"
            });

        }


        const id =
            parseId(
                req.params.id
            );


        if (!id) {

            return res.status(400).json({
                message:
                    "รหัสสินค้าไม่ถูกต้อง"
            });

        }


        // ==================================================
        // ACCOUNT SCOPED
        // ==================================================

        const product =
            await prisma.consignmentItem.findFirst({

                where: {

                    id,

                    accountId

                },

                include: {

                    saleItems: {

                        where: {

                            sale: {

                                accountId

                            }

                        },

                        include: {

                            sale: {

                                include: {

                                    customer:
                                        true

                                }

                            }

                        },

                        orderBy: {

                            createdAt:
                                "desc"

                        }

                    }

                }

            });


        if (!product) {

            return res.status(404).json({
                message:
                    "ไม่พบสินค้า"
            });

        }


        // ==================================================
        // SALE HISTORY
        // ==================================================

        const saleHistory =
            product.saleItems.map(
                saleItem => ({

                    saleItemId:
                        saleItem.id,

                    saleId:
                        saleItem.sale?.id ??
                        null,

                    salePrice:
                        toNumber(
                            saleItem.salePrice
                        ),

                    saleStatus:
                        saleItem.sale?.status ??
                        null,

                    customer:
                        saleItem.sale?.customer
                            ? {

                                id:
                                    saleItem.sale.customer.id,

                                name:
                                    saleItem.sale.customer.name,

                                phone:
                                    saleItem.sale.customer.phone

                            }
                            : null,

                    soldAt:
                        saleItem.sale?.createdAt ??
                        null

                })
            );


        return res.json({

            product: {

                ...serializeProduct(
                    product
                ),

                saleHistory

            }

        });

    } catch (err) {

        console.error(
            "Read Product Error:",
            err
        );

        return res.status(500).json({
            message:
                "ไม่สามารถโหลดข้อมูลสินค้าได้"
        });

    }

};


// ======================================================
// UPDATE PRODUCT
// PUT /api/product/:id
// ======================================================

exports.update = async (req, res) => {

    try {

        const accountId =
            getAccountId(req);


        if (!accountId) {

            return res.status(403).json({
                message:
                    "ไม่พบ account ของผู้ใช้งาน"
            });

        }


        const id =
            parseId(
                req.params.id
            );


        if (!id) {

            return res.status(400).json({
                message:
                    "รหัสสินค้าไม่ถูกต้อง"
            });

        }


        // ==================================================
        // GET EXISTING PRODUCT
        // ==================================================

        const existing =
            await prisma.consignmentItem.findFirst({

                where: {

                    id,

                    accountId

                }

            });


        if (!existing) {

            return res.status(404).json({
                message:
                    "ไม่พบสินค้า"
            });

        }


        const {
            name,
            description,
            costPrice,
            actualSalePrice,
            purchaseDate,
            note
        } = req.body;


        const data = {};


        // ==================================================
        // NAME
        // ==================================================

        if (name !== undefined) {

            if (
                typeof name !== "string" ||
                !name.trim()
            ) {

                return res.status(400).json({
                    message:
                        "ชื่อสินค้าไม่สามารถว่างได้"
                });

            }


            data.name =
                name.trim();

        }


        // ==================================================
        // DESCRIPTION
        // ==================================================

        if (
            description !== undefined
        ) {

            data.description =
                clean(description);

        }


        // ==================================================
        // COST
        // ==================================================

        if (
            costPrice !== undefined
        ) {

            if (
                !isValidPrice(
                    costPrice
                )
            ) {

                return res.status(400).json({
                    message:
                        "ต้นทุนสินค้าไม่ถูกต้อง"
                });

            }


            data.costPrice =
                Number(costPrice);

        }


        // ==================================================
        // SALE PRICE
        // ==================================================

        if (
            actualSalePrice !== undefined
        ) {

            if (
                actualSalePrice === null ||
                actualSalePrice === ""
            ) {

                data.actualSalePrice =
                    null;

            } else {

                if (
                    !isValidPrice(
                        actualSalePrice
                    )
                ) {

                    return res.status(400).json({
                        message:
                            "ราคาขายไม่ถูกต้อง"
                    });

                }


                data.actualSalePrice =
                    Number(actualSalePrice);

            }

        }


        // ==================================================
        // PURCHASE DATE
        // ==================================================

        if (
            purchaseDate !== undefined
        ) {

            const date =
                new Date(
                    purchaseDate
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return res.status(400).json({
                    message:
                        "วันที่ซื้อไม่ถูกต้อง"
                });

            }


            data.purchaseDate =
                date;

        }


        // ==================================================
        // NOTE
        // ==================================================

        if (
            note !== undefined
        ) {

            data.note =
                clean(note);

        }


        // ==================================================
        // UPDATE
        //
        // ใช้ updateMany เพื่อให้ mutation
        // มี account isolation ด้วย
        // ==================================================

        const updateResult =
            await prisma.consignmentItem.updateMany({

                where: {

                    id,

                    accountId

                },

                data

            });


        if (
            updateResult.count !== 1
        ) {

            return res.status(404).json({
                message:
                    "ไม่พบสินค้า"
            });

        }


        // ==================================================
        // GET UPDATED PRODUCT
        // ==================================================

        const product =
            await prisma.consignmentItem.findFirst({

                where: {

                    id,

                    accountId

                }

            });


        if (!product) {

            return res.status(404).json({
                message:
                    "ไม่พบสินค้า"
            });

        }


        // ==================================================
        // AUDIT
        // ==================================================

        if (req.user?.id) {

            await prisma.auditLog.create({

                data: {

                    userId:
                        req.user.id,

                    action:
                        "UPDATE",

                    entity:
                        "Product",

                    entityId:
                        product.id,

                    details:
                        JSON.stringify({

                            before:
                                serializeProduct(
                                    existing
                                ),

                            after:
                                serializeProduct(
                                    product
                                )

                        })

                }

            });

        }


        return res.json({

            message:
                "แก้ไขสินค้าสำเร็จ",

            product:
                serializeProduct(
                    product
                )

        });

    } catch (err) {

        console.error(
            "Update Product Error:",
            err
        );

        return res.status(500).json({
            message:
                "ไม่สามารถแก้ไขสินค้าได้"
        });

    }

};


// ======================================================
// DELETE PRODUCT
// DELETE /api/product/:id
// ======================================================

exports.remove = async (req, res) => {

    try {

        const accountId =
            getAccountId(req);


        if (!accountId) {

            return res.status(403).json({
                message:
                    "ไม่พบ account ของผู้ใช้งาน"
            });

        }


        const id =
            parseId(
                req.params.id
            );


        if (!id) {

            return res.status(400).json({
                message:
                    "รหัสสินค้าไม่ถูกต้อง"
            });

        }


        // ==================================================
        // GET PRODUCT
        // ==================================================

        const product =
            await prisma.consignmentItem.findFirst({

                where: {

                    id,

                    accountId

                },

                include: {

                    saleItems: {

                        where: {

                            sale: {

                                accountId

                            }

                        }

                    }

                }

            });


        if (!product) {

            return res.status(404).json({
                message:
                    "ไม่พบสินค้า"
            });

        }


        // ==================================================
        // SOLD CHECK
        // ==================================================

        if (
            product.status === "SOLD"
        ) {

            return res.status(400).json({
                message:
                    "ไม่สามารถลบสินค้าที่ขายแล้วได้"
            });

        }


        // ==================================================
        // SALE HISTORY CHECK
        // ==================================================

        if (
            product.saleItems.length > 0
        ) {

            return res.status(400).json({
                message:
                    "ไม่สามารถลบสินค้าที่มีประวัติการขายได้"
            });

        }


        // ==================================================
        // DELETE
        // ==================================================

        await prisma.$transaction(
            async tx => {

                const deleteResult =
                    await tx.consignmentItem.deleteMany({

                        where: {

                            id,

                            accountId

                        }

                    });


                if (
                    deleteResult.count !== 1
                ) {

                    throw new Error(
                        "PRODUCT_NOT_FOUND"
                    );

                }


                // ==================================================
                // AUDIT
                // ==================================================

                if (req.user?.id) {

                    await tx.auditLog.create({

                        data: {

                            userId:
                                req.user.id,

                            action:
                                "DELETE",

                            entity:
                                "Product",

                            entityId:
                                id,

                            details:
                                JSON.stringify({

                                    id:
                                        product.id,

                                    name:
                                        product.name,

                                    costPrice:
                                        toNumber(
                                            product.costPrice
                                        ),

                                    actualSalePrice:
                                        product.actualSalePrice !== null
                                            ? toNumber(
                                                product.actualSalePrice
                                            )
                                            : null,

                                    status:
                                        product.status

                                })

                        }

                    });

                }

            }
        );


        return res.json({

            message:
                "ลบสินค้าสำเร็จ"

        });

    } catch (err) {

        console.error(
            "Delete Product Error:",
            err
        );


        if (
            err?.message ===
            "PRODUCT_NOT_FOUND"
        ) {

            return res.status(404).json({
                message:
                    "ไม่พบสินค้า"
            });

        }


        return res.status(500).json({
            message:
                "ไม่สามารถลบสินค้าได้"
        });

    }

};


// ======================================================
// SEARCH / FILTER
// POST /api/products/search
// ======================================================

exports.searchFilters = async (
    req,
    res
) => {

    try {

        const accountId =
            getAccountId(req);


        if (!accountId) {

            return res.status(403).json({
                message:
                    "ไม่พบ account ของผู้ใช้งาน"
            });

        }


        const {
            query,
            status
        } = req.body;


        // ==================================================
        // IMPORTANT
        // ==================================================

        const where = {

            accountId

        };


        // ==================================================
        // SEARCH
        // ==================================================

        if (
            query &&
            query.trim()
        ) {

            where.name = {

                contains:
                    query.trim(),

                mode:
                    "insensitive"

            };

        }


        // ==================================================
        // STATUS
        // ==================================================

        if (status) {

            const allowedStatus = [
                "AVAILABLE",
                "SOLD",
                "CANCELLED"
            ];


            if (
                !allowedStatus.includes(
                    status
                )
            ) {

                return res.status(400).json({
                    message:
                        "สถานะสินค้าไม่ถูกต้อง"
                });

            }


            where.status =
                status;

        }


        // ==================================================
        // SEARCH PRODUCTS
        // ==================================================

        const products =
            await prisma.consignmentItem.findMany({

                where,

                orderBy: {

                    createdAt:
                        "desc"

                }

            });


        return res.json({

            count:
                products.length,

            products:
                products.map(
                    serializeProduct
                )

        });

    } catch (err) {

        console.error(
            "Search Products Error:",
            err
        );

        return res.status(500).json({
            message:
                "ไม่สามารถค้นหาสินค้าได้"
        });

    }

};