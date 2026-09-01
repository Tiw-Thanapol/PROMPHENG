import {
    useEffect,
    useState
} from "react"


import {
    useNavigate
}
from "react-router-dom"


import {
    getCurrentUser,
    updateProfile,
    updateProfilePicture,
    updatePassword
}
from "../services/auth"


import "../styles/ProfileSetting.css"



function ProfileSetting(){


    const navigate =
        useNavigate()



    const [user,setUser] =
        useState(null)



    const [name,setName] =
        useState("")



    const [phoneNumber,setPhoneNumber] =
        useState("")



    const [password,setPassword] =
        useState("")



    const [confirmPassword,setConfirmPassword] =
        useState("")



    const [image,setImage] =
        useState(null)



    const [preview,setPreview] =
        useState("/profile/user.png")



    const [showEditPopup,setShowEditPopup] =
        useState(false)



    const [saving,setSaving] =
        useState(false)



    const [message,setMessage] =
        useState("")







    useEffect(()=>{

        loadUser()

    },[])






    async function loadUser(){


        try{


            const data =
                await getCurrentUser()



            setUser(data)



            setName(
                data?.name || ""
            )



            setPhoneNumber(
                data?.phoneNumber || ""
            )



            setPreview(

                data?.picture ||
                "/profile/user.png"

            )


        }
        catch(err){

            console.log(err)

        }


    }







    function handleImageChange(e){


        const file =
            e.target.files[0]



        if(!file)
            return



        setImage(file)



        setPreview(

            URL.createObjectURL(file)

        )


    }








    async function handleSave(){


        try{


            setSaving(true)



            let updatedUser = user





            // update name phone

            updatedUser =

                await updateProfile({

                    name,

                    phoneNumber

                })








            // update image

            if(image){


                const formData =
                    new FormData()



                formData.append(

                    "picture",

                    image

                )



                updatedUser =

                    await updateProfilePicture(

                        formData

                    )



                setImage(null)





                window.dispatchEvent(

                    new Event(
                        "profileUpdated"
                    )

                )


            }









            // update password

            if(password){



                if(password !== confirmPassword){


                    throw new Error(
                        "password"
                    )


                }



                await updatePassword({

                    password

                })



            }








            setUser(updatedUser)



            setPreview(

                updatedUser.picture ||

                "/profile/user.png"

            )



            setPassword("")

            setConfirmPassword("")



            setShowEditPopup(false)



            showMessage(
                "✨ บันทึกข้อมูลสำเร็จ"
            )



        }
        catch(err){


            console.log(err)



            if(err.message==="password"){


                showMessage(
                    "❌ รหัสผ่านไม่ตรงกัน"
                )


            }
            else{


                showMessage(
                    "❌ บันทึกข้อมูลไม่สำเร็จ"
                )


            }


        }
        finally{


            setSaving(false)


        }


    }







    function showMessage(text){


        setMessage(text)



        setTimeout(()=>{


            setMessage("")


        },2500)


    }







    function cancelEdit(){


        setName(
            user?.name || ""
        )


        setPhoneNumber(
            user?.phoneNumber || ""
        )


        setPassword("")

        setConfirmPassword("")



        setShowEditPopup(false)


    }








return (

<div className="profile-page">





{
saving &&

<div className="saving-overlay">


<div className="saving-box">


<div className="saving-icon">

✨

</div>


<h3>
กำลังบันทึกข้อมูล
</h3>


<p>
กรุณารอสักครู่...
</p>


</div>


</div>

}







{
message &&

<div className="success-popup">

{message}

</div>

}








{
showEditPopup &&


<div className="edit-overlay">


<div className="edit-popup">



<h2>
✨ แก้ไขข้อมูลส่วนตัว
</h2>





<div className="popup-item">

<label>
ชื่อ
</label>


<input

value={name}

onChange={
e=>
setName(
e.target.value
)
}

/>


</div>







<div className="popup-item">

<label>
Email
</label>


<input

value={
user?.email || ""
}

disabled

/>


</div>








<div className="popup-item">

<label>
เบอร์โทร
</label>


<input

value={phoneNumber}

onChange={
e=>
setPhoneNumber(
e.target.value
)
}

/>


</div>








<div className="popup-item">

<label>
รหัสผ่านใหม่
</label>


<input

type="password"

value={password}

onChange={
e=>
setPassword(
e.target.value
)
}

/>


</div>








<div className="popup-item">

<label>
Confirm Password
</label>


<input

type="password"

value={confirmPassword}

onChange={
e=>
setConfirmPassword(
e.target.value
)
}

/>


</div>









<button

className="confirm-edit"

onClick={handleSave}

>

ยืนยันเปลี่ยนข้อมูล

</button>







<button

className="cancel-edit"

onClick={cancelEdit}

>

ยกเลิก

</button>






</div>


</div>


}









<main className="profile-card">





<div className="profile-header">


<div className="profile-heart">

♥

</div>


<h1>
Profile Setting
</h1>


<p>
จัดการข้อมูลส่วนตัวของคุณ
</p>


</div>










<div className="profile-avatar-section">


<img

src={preview}

className="profile-avatar"

alt="profile"

/>





<input

id="avatar-upload"

type="file"

accept="image/*"

hidden

onChange={handleImageChange}

/>





<label

htmlFor="avatar-upload"

className="change-picture"

>

เปลี่ยนรูป

</label>



</div>









<div className="profile-form">



<div className="profile-item">

<span>
Name
</span>


<strong>
{user?.name || "-"}
</strong>


</div>







<div className="profile-item">

<span>
Email
</span>


<strong>
{user?.email || "-"}
</strong>


</div>







<div className="profile-item">

<span>
Phone
</span>


<strong>
{user?.phoneNumber || "-"}
</strong>


</div>








<div className="profile-item">

<span>
Password
</span>


<strong>
********
</strong>


</div>





</div>








<button

className="profile-change"

onClick={()=>setShowEditPopup(true)}

>

เปลี่ยนแปลงข้อมูล

</button>







<button

className="profile-password"

onClick={()=>navigate(-1)}

>

ย้อนกลับ

</button>







</main>





</div>


)


}



export default ProfileSetting