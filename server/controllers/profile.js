const prisma = require("../config/prisma")
const cloudinary = require("../config/cloudinary")


// ======================================================
// HELPERS
// ======================================================

function getUserId(req) {

    const userId =
        Number(req.user?.id)

    if (
        !Number.isInteger(userId) ||
        userId <= 0
    ) {
        return null
    }

    return userId
}


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


function cleanString(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return null
    }

    const result =
        String(value).trim()

    return result || null
}


function getProfileSelect() {

    return {

        id: true,

        email: true,

        name: true,

        phoneNumber: true,

        picture: true,

        role: true,

        enabled: true,

        createdAt: true,

        updatedAt: true

    }

}


// ======================================================
// GET CURRENT USER PROFILE
// GET /api/profile
// ======================================================

exports.getProfile = async (req, res) => {

    try {

        const userId =
            getUserId(req)

        const accountId =
            getAccountId(req)


        if (
            !userId ||
            !accountId
        ) {

            return res.status(403).json({
                message:
                    "Access denied"
            })

        }


        // ==================================================
        // ACCOUNT-SCOPED USER LOOKUP
        // ==================================================

        const user =
            await prisma.user.findFirst({

                where: {

                    id:
                        userId,

                    accountId:
                        accountId

                },

                select:
                    getProfileSelect()

            })


        if (!user) {

            return res.status(404).json({
                message:
                    "User not found"
            })

        }


        return res.json({

            user

        })

    }
    catch (err) {

        console.error(
            "Get Profile Error:",
            err
        )

        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}


// ======================================================
// UPDATE PROFILE
// PUT /api/profile
// ======================================================

exports.updateProfile = async (req, res) => {

    try {

        const userId =
            getUserId(req)

        const accountId =
            getAccountId(req)


        if (
            !userId ||
            !accountId
        ) {

            return res.status(403).json({
                message:
                    "Access denied"
            })

        }


        const {
            name,
            phoneNumber
        } = req.body


        // ==================================================
        // VALIDATE NAME
        // ==================================================

        if (
            name !== undefined &&
            (
                typeof name !== "string" ||
                !name.trim()
            )
        ) {

            return res.status(400).json({

                message:
                    "Name cannot be empty"

            })

        }


        // ==================================================
        // GET OLD USER
        // ==================================================

        const oldUser =
            await prisma.user.findFirst({

                where: {

                    id:
                        userId,

                    accountId:
                        accountId

                }

            })


        if (!oldUser) {

            return res.status(404).json({

                message:
                    "User not found"

            })

        }


        // ==================================================
        // PREPARE UPDATE
        // ==================================================

        const data = {}


        if (
            name !== undefined
        ) {

            data.name =
                name.trim()

        }


        if (
            phoneNumber !== undefined
        ) {

            data.phoneNumber =
                cleanString(phoneNumber)

        }


        // ==================================================
        // UPDATE
        // ==================================================

        const updateResult =
            await prisma.user.updateMany({

                where: {

                    id:
                        userId,

                    accountId:
                        accountId

                },

                data

            })


        if (
            updateResult.count !== 1
        ) {

            return res.status(404).json({

                message:
                    "User not found"

            })

        }


        // ==================================================
        // GET UPDATED USER
        // ==================================================

        const user =
            await prisma.user.findFirst({

                where: {

                    id:
                        userId,

                    accountId:
                        accountId

                },

                select:
                    getProfileSelect()

            })


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            })

        }


        // ==================================================
        // AUDIT LOG
        // ==================================================

        await prisma.auditLog.create({

            data: {

                userId,

                action:
                    "UPDATE",

                entity:
                    "User",

                entityId:
                    userId,

                details:
                    JSON.stringify({

                        type:
                            "PROFILE_UPDATE",

                        before: {

                            name:
                                oldUser.name,

                            phoneNumber:
                                oldUser.phoneNumber

                        },

                        after: {

                            name:
                                user.name,

                            phoneNumber:
                                user.phoneNumber

                        }

                    })

            }

        })


        return res.json({

            message:
                "Profile updated successfully",

            user

        })

    }
    catch (err) {

        console.error(
            "Update Profile Error:",
            err
        )

        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}


// ======================================================
// UPDATE AVATAR
// PUT /api/profile/avatar
// multipart/form-data
// field name : picture
// ======================================================

exports.updateAvatar = async (req, res) => {

    try {

        const userId =
            getUserId(req)

        const accountId =
            getAccountId(req)


        if (
            !userId ||
            !accountId
        ) {

            return res.status(403).json({
                message:
                    "Access denied"
            })

        }


        // ==================================================
        // FILE VALIDATION
        // ==================================================

        if (!req.file) {

            return res.status(400).json({

                message:
                    "Picture is required"

            })

        }


        // ==================================================
        // GET CURRENT USER
        // ==================================================

        const oldUser =
            await prisma.user.findFirst({

                where: {

                    id:
                        userId,

                    accountId:
                        accountId

                },

                select: {

                    id: true,

                    email: true,

                    name: true,

                    phoneNumber: true,

                    picture: true,

                    role: true,

                    enabled: true

                }

            })


        if (!oldUser) {

            return res.status(404).json({

                message:
                    "User not found"

            })

        }


        // ==================================================
        // UPLOAD TO CLOUDINARY
        // ==================================================

        const uploadResult =

            await new Promise(
                (resolve, reject) => {

                    cloudinary.uploader.upload_stream(

                        {

                            folder:
                                "sale-record/profile",

                            resource_type:
                                "image"

                        },

                        (error, result) => {

                            if (error) {

                                reject(error)

                            }
                            else {

                                resolve(result)

                            }

                        }

                    )
                    .end(
                        req.file.buffer
                    )

                }
            )


        if (
            !uploadResult?.secure_url
        ) {

            return res.status(500).json({

                message:
                    "Avatar upload failed"

            })

        }


        // ==================================================
        // UPDATE USER
        // ==================================================

        const updateResult =
            await prisma.user.updateMany({

                where: {

                    id:
                        userId,

                    accountId:
                        accountId

                },

                data: {

                    picture:
                        uploadResult.secure_url

                }

            })


        if (
            updateResult.count !== 1
        ) {

            return res.status(404).json({

                message:
                    "User not found"

            })

        }


        // ==================================================
        // GET UPDATED USER
        // ==================================================

        const user =
            await prisma.user.findFirst({

                where: {

                    id:
                        userId,

                    accountId:
                        accountId

                },

                select: {

                    id: true,

                    email: true,

                    name: true,

                    phoneNumber: true,

                    picture: true,

                    role: true,

                    enabled: true

                }

            })


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            })

        }


        // ==================================================
        // AUDIT LOG
        // ==================================================

        await prisma.auditLog.create({

            data: {

                userId,

                action:
                    "UPDATE",

                entity:
                    "User",

                entityId:
                    userId,

                details:
                    JSON.stringify({

                        type:
                            "AVATAR_UPDATE",

                        before: {

                            picture:
                                oldUser.picture

                        },

                        after: {

                            picture:
                                user.picture

                        }

                    })

            }

        })


        return res.json({

            message:
                "Avatar updated successfully",

            user

        })

    }
    catch (err) {

        console.error(
            "Update Avatar Error:",
            err
        )

        return res.status(500).json({

            message:
                "Server Error"

        })

    }

}