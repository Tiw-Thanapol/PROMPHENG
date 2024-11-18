import React from 'react'
import { ListCheck } from 'lucide-react';
import useEcomStore from '../../store/ecom-store';
import { Link, useNavigate } from 'react-router-dom';
import { createUserCart } from '../../api/user';
import { toast } from 'react-toastify';
import { numberFormat } from '../../utils/Number';


const ListCard = () => {
    const cart = useEcomStore((state) => state.carts)
    const user = useEcomStore((state) => state.user)
    const token = useEcomStore((state) => state.token)
    const getTotalPrice = useEcomStore((state) => state.getTotalPrice)
    const navigate = useNavigate()

    const handleSaveCart = async () => {
        await createUserCart(token, { cart })
            .then((res) => {
                console.log(res)
                toast.success('Add to cart Success!', { position: "top-center" })
                navigate('/checkout')
            })
            .catch((err) => {
                console.log(err)
                toast.warning(err.response.data.message)
            })
    }
    

    // return (

    //     <div className='bg-gray-100 rounded-md shadow p-4 flex justify-between'>
    //         {/* Header */}
    //         <div >
    //             <div className='flex gap-4 mb-4'>
    //                 <ListCheck size='36' />
    //                 <p className='text-2xl font-bold'>Product List {cart.length}</p>
    //             </div>
    //             {/* List */}
    //             <div className='grid grid-cols-3 md:grid-cols-3 w-full'>
    //                 {/* Left */}
    //                 <div className='col-span-2 gap-4'>
    //                     {/* Card */}
    //                     {cart.map((item, index) => (
    //                         <div
    //                             key={index}
    //                             className='bg-white p-2 rounded-md shadow-md mb-2'
    //                         >
    //                             {/* Row 1 */}
    //                             <div className='flex justify-between mb-2'>
    //                                 {/* Left */}
    //                                 <div className='flex gap-2 items-center'>
    //                                     {item.images && item.images.length > 0 ? (
    //                                         <img
    //                                             src={item.images[0].url}
    //                                             className='w-16 h16 rounded-md shadow'
    //                                         />
    //                                     ) : (
    //                                         <div className='w-16 h-16 bg-gray-200 rounded-md flex text-center items-center'>
    //                                             <img /> No Image
    //                                         </div>
    //                                     )}

    //                                     <div>
    //                                         <p className='font-bold'>{item.title}</p>
    //                                         <p className='text-sm'>
    //                                             {numberFormat(item.price)} x {item.count}
    //                                         </p>
    //                                     </div>
    //                                 </div>

    //                                 {/* Right */}
    //                                 <div className='font-bold text-blue-500'> {numberFormat(item.price * item.count)}</div>
    //                             </div>
    //                         </div>
    //                     ))}
    //                 </div>
    //             </div>
    //         </div>

    //         {/* Right - Total Section */}

    //         <div className='w-1/3 bg-white p-4 rounded-md shadow-md space-y-4 '>
    //             <p className='text-2xl font-bold'>Total</p>
    //             <div className='flex justify-between'>
    //                 <span>Total net :</span>
    //                 <span className='text-2xl font-bold'>{numberFormat(getTotalPrice())}</span>
    //             </div>

    //             <div className='flex flex-col gap-2'>
    //                 {
    //                     user
    //                         ?
    //                         <button
    //                             disabled={cart.length < 1}
    //                             onClick={handleSaveCart}
    //                             className='bg-green-500 w-full rounded-md 
    //                                 text-white py-2 shadow-md hover:bg-green-700'>
    //                             Checkout
    //                         </button>

    //                         : (<Link to='/login'>
    //                             <button className='bg-blue-500 w-full rounded-md 
    //                             text-white py-2 shadow-md hover:bg-blue-700'>
    //                                 Login
    //                             </button>
    //                         </Link>)
    //                 }

    //                 <Link to='/shop'>
    //                     <button className='bg-gray-500 w-full rounded-md text-white py-2 shadow-md hover:bg-gray-700'>
    //                         Edit list product
    //                     </button>
    //                 </Link>

    //             </div>
    //         </div>
    //     </div>


    // )
    return (
        <div className='bg-gray-100 rounded-md shadow p-4 flex justify-between'>
            {/* Header */}
            <div>
                <div className='flex gap-4 mb-4'>
                    <ListCheck size='36' />
                    <p className='text-2xl font-bold'>Product List{cart.length > 0 ? ` (${cart.length})` : ''}</p>
                </div>
                {/* List */}
                <div className='grid grid-cols-3 md:grid-cols-3 w-full'>
                    {/* Left */}
                    <div className='col-span-2 gap-4'>
                        {cart.length > 0 ? (
                            cart.map((item, index) => (
                                <div
                                    key={index}
                                    className='bg-white p-2 rounded-md shadow-md mb-2'
                                >
                                    {/* Existing card component */}
                                    <div className='flex justify-between mb-2'>
                                        {/* Left */}
                                        <div className='flex gap-2 items-center'>
                                            {item.images && item.images.length > 0 ? (
                                                <img
                                                    src={item.images[0].url}
                                                    className='w-16 h16 rounded-md shadow'
                                                />
                                            ) : (
                                                <div className='w-16 h-16 bg-gray-200 rounded-md flex text-center items-center'>
                                                    <img /> No Image
                                                </div>
                                            )}
                                            <div>
                                                <p className='font-bold'>{item.title}</p>
                                                <p className='text-sm'>
                                                    {numberFormat(item.price)} x {item.count}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Right */}
                                        <div className='font-bold text-blue-500'> {numberFormat(item.price * item.count)}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='bg-white p-4 rounded-md shadow-md text-center'>
                                <p className='text-gray-500'>ไม่มีสินค้าในตะกร้า</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
    
            {/* Right - Total Section */}
            <div className='w-1/3 bg-white p-4 rounded-md shadow-md space-y-4 '>
                <p className='text-2xl font-bold'>Total</p>
                <div className='flex justify-between'>
                    <span>Total net :</span>
                    <span className='text-2xl font-bold'>{numberFormat(getTotalPrice())}</span>
                </div>
                <div className='flex flex-col gap-2'>
                    {user ? (
                        <button
                            disabled={cart.length < 1}
                            onClick={handleSaveCart}
                            className='bg-green-500 w-full rounded-md text-white py-2 shadow-md hover:bg-green-700'
                        >
                            Checkout
                        </button>
                    ) : (
                        <Link to='/login'>
                            <button className='bg-blue-500 w-full rounded-md text-white py-2 shadow-md hover:bg-blue-700'>
                                Login
                            </button>
                        </Link>
                    )}
                    <Link to='/shop'>
                        <button className='bg-gray-500 w-full rounded-md text-white py-2 shadow-md hover:bg-gray-700'>
                            Edit list product
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ListCard
