import React, { useState, useEffect } from 'react'
import { getOrdersAdmin, changeOrderStatus } from '../../api/admin'
import useEcomStore from '../../store/ecom-store'
import { toast } from 'react-toastify'
import { numberFormat } from '../../utils/Number'
import { dateTime } from '../../utils/DateTime'


const TableOrders = () => {
    const token = useEcomStore((state) => state.token)
    const [orders, setOrders] = useState([])

    useEffect(() => {
        //console.log(token)
        hdlGetOrdersAdmin(token)
    }, [])

    const hdlGetOrdersAdmin = (token) => {
        getOrdersAdmin(token)
            .then((res) => {
                setOrders(res.data)
                console.log(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
    }
    const handleChangeOrderStatus = (token, orderId, orderStatus) => {
        console.log(orderId, orderStatus)
        changeOrderStatus(token, orderId, orderStatus)
            .then((res) => {
                console.log(res)
                toast.success('Update Status Success!!')
                hdlGetOrdersAdmin(token)
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
        <div className='container mx-auto p-4 bg-white shadow-md'>

            <div className='font-bold text-xl'>Order Management</div><br />
            <div>
                <table className='w-full'>
                    <thead>
                        <tr className='bg-green-200 rounded '>
                            <th className='border'>No.</th>
                            <th className='border'>User</th>
                            <th className='border'>Address</th>
                            <th className='border'>Date</th>
                            <th className='border'>Product</th>
                            <th className='border'>Total</th>
                            <th className='border'>Status</th>
                            <th className='border'>Manage</th>
                            <th className='border'>Updated</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                        orders?.map((item, index) => {
                            console.log(item)
                            return (
                                <tr
                                    key={index}
                                    className=' hover:bg-yellow-100'>
                                    <td>{index + 1}</td>
                                    <td>
                                        <p>{item.orderedBy.email}</p>
                                    </td>
                                    <td>
                                        <p>{item.orderedBy.address}</p>
                                    </td>
                                    <td>
                                        <p>{dateTime(item.createdAt)}</p>
                                    </td>
                                    <td className='px-2 py-4 '>
                                        {item.products?.map((product, index) => (
                                            <li key={index}>
                                                {product.product.title} {" "}
                                                <span>{product.count} x {numberFormat(product.product.price)}</span>
                                            </li>
                                        ))}
                                    </td>

                                    <td className='text-right'>
                                        {numberFormat(item.cartTotal)}
                                    </td>

                                    <td
                                        className="text-center align-middle"
                                    >
                                        <div
                                            className={`
                                    ${getStatusColor(item.orderStatus)}
                                                     inline-flex items-center justify-center rounded-full 
                                                     px-5 py-2 font-medium text-gray-700
                                                    shadow-md transition duration-300 transform hover:scale-105
                                                    `}
                                        >
                                            <span>{item.orderStatus}</span>
                                        </div>
                                    </td>

                                    <td
                                        className='text-center'
                                    >
                                        <select
                                            value={item.orderStatus}
                                            className='border'
                                            onChange={(e) => handleChangeOrderStatus(
                                                token, item.id, e.target.value
                                            )}
                                        >
                                            <option >Not Process</option>
                                            <option>Pending</option>
                                            <option>Complete</option>
                                            <option>Cancel</option>
                                        </select>
                                    </td>
                                    <td>
                                        {dateTime(item.updatedAt)}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <hr className='border' />
            </div>

        </div>

    )
}

export default TableOrders
