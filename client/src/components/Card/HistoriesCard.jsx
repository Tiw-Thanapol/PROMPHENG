import React, { useState, useEffect } from 'react'
import { getOrders } from '../../api/user'
import useEcomStore from '../../store/ecom-store'
import { numberFormat } from '../../utils/Number'
import { dateTime } from '../../utils/DateTime'


const HistoriesCard = () => {
    const token = useEcomStore((state) => state.token)
    const [orders, setOrders] = useState([])

    useEffect(() => {
        //code
        hdlGetOrders(token)
    }, [])

    const hdlGetOrders = (token) => {
        getOrders(token)
            .then((res) => {
                //console.log(res)
                setOrders(res.data.orders)
            })
            .catch((err) => {
                console.log(err)
            })
    }
    const getStatusColor = (status) => {
        switch (status) {
            case "Complete":
                return "bg-green-400"; // Light green background for completed orders
            case "Pending":
                return "bg-yellow-300"; // Light yellow background for pending orders
            case "Cancel":
                return "bg-red-400"; // Light red background for canceled orders
            case "Not Process":
                return "bg-gray-400"; // Default background color
        }
    }
    return (
        <div>
            <h1 className='text-2xl font-bold'>Review Order History</h1>

            {/* All */}
            <div className='space-y-4 shadow-md'>
                {/* Card Loop Order */}
                {
                    orders?.map((item, index) => {
                        //console.log(item)
                        return (
                            <div
                                key={index}
                                className='bg-gray-200 p-4 rounded-md shadow-md'>
                                {/* Header */}
                                <div className='flex justify-between'>
                                    <div>
                                        <p className='text-sm'>Order Date</p>
                                        <p className='font-bold'>{dateTime(item.updatedAt)}</p>
                                    </div>
                                    <div>
                                        <span className={`${getStatusColor(item.orderStatus)}
                                        px-2 py-1 rounded-full`}>
                                            {item.orderStatus}
                                        </span>
                                    </div>
                                </div>


                                {/* Table Loop Product */}
                                <div>
                                    <table className='border w-full' >
                                        <thead>
                                            <tr className='bg-gray-300 rounded-md'>
                                                <th className='border'>Product</th>
                                                <th className='border'>Price</th>
                                                <th className='border'>Quantity</th>
                                                <th className='border'>Total</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {item.products?.map((product, index) => {
                                                console.log(product)
                                                return (
                                                    <tr key={index}>
                                                        <td className='border text-left'>{product.product.title}</td>
                                                        <td className='border text-right'>{numberFormat(product.product.price)}</td>
                                                        <td className='border text-right'>{product.count}</td>
                                                        <td className='border text-right'>{numberFormat(product.count * product.price)}</td>
                                                    </tr>
                                                )
                                            })
                                            }

                                        </tbody>

                                    </table>
                                    <br />
                                </div>
                                {/* Total */}
                                <div>
                                    <div className='text-right'>
                                        <p className=' bg-gray-300 font-bold'>Total Net</p>
                                        <p>{numberFormat(item.cartTotal)}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }

            </div>
        </div>
    )
}

export default HistoriesCard
