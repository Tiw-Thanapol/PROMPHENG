import React from 'react'
import { Trash2, CircleMinus, CirclePlus } from 'lucide-react';
import useEcomStore from '../../store/ecom-store';
import { Link } from 'react-router-dom'
import { numberFormat } from '../../utils/Number';

const Cart = () => {
    const carts = useEcomStore((state) => state.carts)
    const actionUpdateQuantity = useEcomStore((state) => state.actionUpdateQuantity)
    const actionRemoveProduct = useEcomStore((state) => state.actionRemoveProduct)
    const getTotalPrice = useEcomStore((state) => state.getTotalPrice)
    console.log(carts)


    return (
        <div>
            <h1 className='text-2xl font-bold'>Shopping Cart</h1>
            {/* Border */}
            <div className='border p-2 '>
                {/* Card */}
                {
                    carts.map((item, index) =>

                        <div key={index}
                            className='bg-white p-2 rounded-md shadow-md mb-2'>
                            {/* Row 1 */}
                            <div className='flex justify-between mb-2'>
                                {/* Left */}
                                <div className='flex gap-2 items-center'>


                                    {
                                        item.images && item.images.length > 0
                                            ? <img src={item.images[0].url}
                                                className='w-16 h16 rounded-md shadow' />
                                            : <div
                                                className='w-16 h-16 bg-gray-200 
                                                rounded-md flex text-center items-center'
                                            >
                                                <img /> No Image
                                            </div>
                                    }

                                    <div>
                                        <p className='font-bold'>{item.title}</p>
                                        <p className='text-sm'>{item.description}</p>

                                    </div>
                                </div>

                                {/* Right */}
                                <div
                                    onClick={() => actionRemoveProduct(item.id)}
                                    className='py-2 mt-2 hover:scale-110 
                                hover:duration-200 text-red-600 cursor-pointer'>
                                    <Trash2 />
                                </div>
                            </div>

                            {/* row 2 */}
                            <div className='flex justify-between'>

                                {/* left */}
                                <div className='border rounded-sm px-2 py-1'>
                                    <button
                                        onClick={() => actionUpdateQuantity(item.id, item.count - 1)}
                                        className='px-2 py-1  hover:bg-gray-200'>
                                        <CircleMinus />
                                    </button>
                                    <span className='px-4 '>{item.count}</span>
                                    <button
                                        onClick={() => actionUpdateQuantity(item.id, item.count + 1)}
                                        className='px-2 py-1  hover:bg-gray-200'>
                                        <CirclePlus />
                                    </button>
                                </div>
                                {/* Right */}
                                <div className='font-bold text-blue-500'>
                                    {numberFormat (item.price*item.count)}
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
            {/* Total */}
            <div className='flex justify-between px-2'>
                <span>Total</span>
                <span>{numberFormat(getTotalPrice())}</span>

            </div>
            <Link to='/cart'>
                <button className='mt-4 w-full bg bg-green-500 
        text-white rounded-md shadow-md hover:bg-green-700 py-2'
                >
                    Check out
                </button>
            </Link>
        </div>
    )
}

export default Cart
