import React, { useState } from 'react'
import { toast } from 'react-toastify'
import Resizer from "react-image-file-resizer";
import { uploadFiles, removeFiles } from '../../api/product';
import useEcomStore from '../../store/ecom-store';
import { Loader } from 'lucide-react';


const Uploadfile = ({ form, setForm }) => {
    const token = useEcomStore((state) => state.token)
    const [isLoading, setIsLoading] = useState(false)

    const handleOnChange = (e) => {
        setIsLoading(true)
        const files = e.target.files
        if (files) {
            setIsLoading(true)
            let allFiles = form.images //[] empty array
            for (let i = 0; i < files.length; i++) {

                console.log(files[i])

                //validate
                const file = files[i]
                if (!file.type.startsWith('image/')) {
                    toast.error(`File ${file.name} is not image`)
                    continue
                }
                // Image Resize
                Resizer.imageFileResizer(
                    files[i], // Is the file of the image which will resized.
                    720, // Is the maxWidth of the resized new image.
                    720, // Is the maxHeight of the resized new image.
                    "jpeg", // Is the compressFormat of the resized new image.
                    100, // Is the quality of the resized new image.
                    0, // Is the degree of clockwise rotation to apply to uploaded image.

                    (data) => {
                        // endpoint Backend
                        //console.log('data',data)
                        uploadFiles(token, data)
                            .then((res) => {
                                console.log(res)

                                allFiles.push(res.data)
                                setForm({
                                    ...form,
                                    images: allFiles
                                })
                                setIsLoading(false)
                                toast.success('Upload image Success!')
                            })
                            .catch((err) => {
                                console.log(err)
                                res.status(500).json({ message: "Upload Failed!" })
                                setIsLoading(false)
                            })
                    }, 

                    "base64", // Is the output type of the resized new image.
                );

            }
        }
    }
    console.log(form)

    const handleDelete = (public_id) => {
        const images = form.images
        //console.log(public_id)
        removeFiles(token,public_id)
        .then((res)=>{
            const filterImages = images.filter((item,index)=>{
                console.log(item)
                return item.public_id !== public_id
            })
            console.log('filterImages',filterImages)
            setForm({
                ...form, 
                images: filterImages
            })
            toast.error(res.data)
        })
        .catch((err)=>{
            console.log(err)
        })
    }
    return (
        <div className='my-4'>
            <div className='flex mx-4 gap-4 my-4'>
                {
                    isLoading && <Loader className='w-16 h-16 animate-spin' />
                }
                
                {/* Image */}
                {
                    form.images.map((item, index) =>
                        <div className='relative' key={index}>
                            <img
                                className='w-24 h-24 hover:scale-105'
                                src={item.url} />
                            <span
                                onClick={() => handleDelete(item.public_id)}
                                className='absolute top-0 right-0 p-1 cursor-pointer '
                            >
                                X
                            </span>
                        </div>)
                }

            </div>

            <div>
                <input
                    onChange={handleOnChange}
                    type='file'
                    name='images'
                    multiple
                />
            </div>



        </div>
    )
}

export default Uploadfile
