import React, { useState, useEffect } from 'react'
import { listUserCart, saveAddress } from '../../api/user';
import useEcomStore from '../../store/ecom-store';
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom';
import { numberFormat } from '../../utils/Number';

const SummaryCard = () => {
    const token = useEcomStore((state) => state.token);
    const [products, setProducts] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);

    const [address, setAddress] = useState('')
    const [addressSaved, setAddressSaved] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        hdlGetUserCart(token)
    }, [])

    const hdlGetUserCart = (token) => {
        listUserCart(token)
            .then((res) => {
                //console.log(res)
                setProducts(res.data.products)
                setCartTotal(res.data.cartTotal)
            })
            .catch((err => {
                console.log(err)
            }))
    }

    const hdlSaveAddress = () => {
        console.log(address)
        if (!address) {
            return toast.warning('Please fill address!!')
        }
        saveAddress(token, address)
            .then((res) => {
                console.log(res)
                toast.success(res.data.message)
                setAddressSaved(true)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const hdlGotoPayment =() => {
        if(!addressSaved){
            return toast.warning('Please fill address!!')
        }
        navigate('/user/payment')
    }
    console.log(products)
    return (
        <div className='mx-auto p-4 max-w-screen-lg'>
            <div className='flex gap-4'>

                {/* Left */}
                <div className='w-2/4'>
                    <div className='bg-gray-100 p-4 rounded-md 
                    shadow-md border space-y-4'>

                        <h1
                            className='font-bold text-2xl'>Address</h1>

                        <textarea
                            required
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder='Fill your address...'
                            className='w-full px-2' />

                        <button
                            onClick={hdlSaveAddress}
                            className='bg-blue-500 text-white rounded-md shadow-md
                        hover:bg-blue-700 hover:scale-105 
                        px-2 py-1 hover:translate-y-1 hover:duration-200'
                        >Save Address
                        </button>
                    </div>
                </div>

                {/* Right */}
                <div className='w-2/4'>
                    <div className='bg-white-100 p-4 shadow rounded-md text-xl border space-y-4 '>
                        <h1 className='font-bold text-lg'>Summary</h1>
                        {/* ItemList */}
                        {
                            products?.map((item, index) =>
                                <div key={index}>
                                    <div
                                        className='flex justify-between items-end'>
                                        <div >
                                            <p className='font-bold'>{item.product.title}</p>
                                            <p className='text-sm'>Quantity: {item.count} x {numberFormat(item.product.price)}</p>
                                        </div>
                                        <div>
                                            <p
                                                className='text-red-500 font-bold'
                                            >
                                                {numberFormat(item.count * item.product.price)}
                                            </p>
                                        </div>
                                    </div>
                                    <br />
                                    {/* Right */}
                                </div>
                            )
                        }

                        <div>
                            <div className='flex justify-between'>
                                <p>Delivery cost</p>
                                <p>0.00</p>
                            </div>

                            <div className='flex justify-between'>
                                <p>Discount</p>
                                <p>0.00</p>
                            </div>
                        </div>
                        <br />
                        <hr />
                        <div>
                            <div className='flex justify-between'>
                                <p className='font-bold'>Total</p>
                                <p className='text-red-500 font-bold text-lg'>{numberFormat(cartTotal)}</p>
                            </div>
                        </div>

                        <div>
                            <button
                                onClick={hdlGotoPayment}
                                // disabled={!addressSaved}
                                className='bg-green-400 text-white w-full 
                                rounded-md shadow-md hover:bg-green-700 
                                hover:duration-200 '
                            >
                                Checkout
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default SummaryCard;