const prisma = require("../config/prisma")
const cloudinary = require("../config/cloudinary")


// ======================================================
// GET CURRENT USER PROFILE
// GET /api/profile
// ======================================================

exports.getProfile = async (req, res) => {

    try {


        const userId =
            req.user.id



        const user =
            await prisma.user.findUnique({

                where:{
                    id:userId
                },


                select:{

                    id:true,

                    email:true,

                    name:true,

                    phoneNumber:true,

                    picture:true,

                    role:true,

                    enabled:true,

                    createdAt:true,

                    updatedAt:true

                }

            })



        if(!user){

            return res.status(404).json({

                message:"User not found"

            })

        }



        res.json({

            user

        })



    }
    catch(err){

        console.log(err)


        res.status(500).json({

            message:"Server Error"

        })

    }

}





// ======================================================
// UPDATE PROFILE
// PUT /api/profile
// ======================================================

exports.updateProfile = async (req,res)=>{


    try{


        const userId =
            req.user.id



        const {

            name,

            phoneNumber

        } = req.body




        if(
            name !== undefined &&
            !name.trim()
        ){

            return res.status(400).json({

                message:"Name cannot be empty"

            })

        }




        const oldUser =
            await prisma.user.findUnique({

                where:{
                    id:userId
                }

            })



        if(!oldUser){

            return res.status(404).json({

                message:"User not found"

            })

        }





        const user =
            await prisma.user.update({


                where:{

                    id:userId

                },


                data:{


                    ...(name !== undefined && {

                        name:name.trim()

                    }),



                    ...(phoneNumber !== undefined && {

                        phoneNumber:
                        phoneNumber || null

                    })


                },



                select:{

                    id:true,

                    email:true,

                    name:true,

                    phoneNumber:true,

                    picture:true,

                    role:true,

                    enabled:true,

                    createdAt:true,

                    updatedAt:true

                }


            })






        await prisma.auditLog.create({

            data:{


                userId,


                action:"UPDATE",


                entity:"User",


                entityId:userId,


                details:JSON.stringify({


                    type:"PROFILE_UPDATE",



                    before:{


                        name:
                        oldUser.name,


                        phoneNumber:
                        oldUser.phoneNumber


                    },



                    after:{


                        name:
                        user.name,


                        phoneNumber:
                        user.phoneNumber


                    }


                })


            }


        })





        res.json({

            message:"Profile updated successfully",

            user

        })



    }
    catch(err){


        console.log(err)


        res.status(500).json({

            message:"Server Error"

        })

    }

}







// ======================================================
// UPDATE AVATAR
// PUT /api/profile/avatar
// multipart/form-data
// field name : picture
// ======================================================

exports.updateAvatar = async(req,res)=>{


    try{


        const userId =
            req.user.id




        if(!req.file){


            return res.status(400).json({

                message:"Picture is required"

            })


        }




        const uploadResult =

            await new Promise((resolve,reject)=>{


                cloudinary.uploader.upload_stream(


                    {

                        folder:
                        "sale-record/profile",


                        resource_type:
                        "image"


                    },


                    (error,result)=>{


                        if(error){

                            reject(error)

                        }
                        else{

                            resolve(result)

                        }

                    }


                )
                .end(req.file.buffer)


            })







        const user =

            await prisma.user.update({


                where:{

                    id:userId

                },


                data:{


                    picture:
                    uploadResult.secure_url


                },


                select:{


                    id:true,

                    email:true,

                    name:true,

                    phoneNumber:true,

                    picture:true,

                    role:true,

                    enabled:true


                }


            })






        await prisma.auditLog.create({


            data:{


                userId,


                action:"UPDATE",


                entity:"User",


                entityId:userId,


                details:JSON.stringify({


                    type:"AVATAR_UPDATE",


                    picture:
                    uploadResult.secure_url


                })


            }


        })






        res.json({

            message:"Avatar updated successfully",

            user

        })





    }
    catch(err){


        console.log(err)


        res.status(500).json({

            message:"Server Error"

        })


    }


}