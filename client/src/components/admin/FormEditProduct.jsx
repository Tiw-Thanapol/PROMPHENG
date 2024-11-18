import React, { useEffect, useState } from 'react'
import useEcomStore from '../../store/ecom-store'
import { createProduct, readProduct, listByProduct, updateProduct } from '../../api/product'
import { toast } from 'react-toastify'
//import { Link } from 'react-router-dom'
//import { ChevronLeft, ChevronRight, Pencil, Trash, Search } from "lucide-react";
import Uploadfile from './Uploadfiles'
import { useParams, useNavigate } from 'react-router-dom'

// import {numberFormat} from "../../utils/number"
const itemPages = 10

const initialState = {
    title: "",
    description: "",
    price: 0,
    quantity: 0,
    categoryId: '',
    images: []
}

const FormEditProduct = () => {
    // const {
    //     token,
    //     getCategory,
    //     categories,
    //     getProduct,
    //     products,
    // } = useEcomStore()
    const { id } = useParams()
    const navigate = useNavigate()
    const token = useEcomStore((state) => state.token)
    const getCategory = useEcomStore((state) => state.getCategory)
    const categories = useEcomStore((state) => state.categories)
    const [form, setForm] = useState(initialState);

    useEffect(() => {
        getCategory()
        fetchProduct(token, id, form)
    }, [token, id])

    // useEffect(() => {
    //     setCurrentPage(1);
    // }, [searchParams]);

    const fetchProduct = async (token, id, form) => {
        try {
            const res = await readProduct(token, id)
            console.log('res from backend', res)
            setForm(res.data)
        } catch (err) {
            console.log(err)
        }
    }
    console.log(form)

    const handleOnChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        }
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await updateProduct(token, id, form)
            console.log(res)
            toast.success(`Add Product ${res.data.title} complete!!`)
            navigate('/admin/product')

        } catch (err) {
            toast.error('Add product failed!')
            console.log(err)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure to Delete?')) {
            try {
                //code
                toast.success('Product has delete!')
                getProduct(token, 120)
            } catch (err) {
                toast.error('Delete failed!')
                console.log(err)
            }
        }
    }


    return (
        <div className='container mx-auto p-4 bg-white shadow-md'>
            <div className='bg-white shadow-md rounded-lg p-6 mb-6'>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <h1 className='text-2xl font-bold mb-4'>Edit Product</h1>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <input
                            className='border'
                            value={form.title}
                            onChange={handleOnChange}
                            placeholder='Title'
                            name='title'
                        />
                        <input
                            className='border'
                            value={form.description}
                            onChange={handleOnChange}
                            placeholder='Description'
                            name='description'
                        />
                        <input
                            type='number'
                            className='border'
                            value={form.price}
                            onChange={handleOnChange}
                            placeholder='Price'
                            name='price'
                        />
                        <input
                            type='number'
                            className='border'
                            value={form.quantity}
                            onChange={handleOnChange}
                            placeholder='Quantity'
                            name='quantity'
                        />
                        <select
                            className='border'
                            name='categoryId'
                            onChange={handleOnChange}
                            required
                            value={form.categoryId}
                        >
                            <option value="" disabled>Please Select</option>

                            {categories.map((item, index) =>
                                <option
                                    key={index} value={item.id}>{item.name}
                                </option>)}

                        </select>
                    </div>
                    <hr />
                    {/* Up load file */}
                    <Uploadfile form={form} setForm={setForm} />

                    <button className='bg-blue-500 rounded-md text-white p-1 m-1 mt-2'>
                        Save
                    </button>
                </form>

            </div>


        </div>


    );
};


export default FormEditProduct;