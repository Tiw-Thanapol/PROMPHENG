import React, { useState, useEffect } from 'react'
import { getListAllUsers,changeUserRole } from '../../api/admin'
import useEcomStore from '../../store/ecom-store'
import { dateTime } from '../../utils/DateTime'
import { changeUserStatus } from '../../api/admin'
import { toast } from 'react-toastify'

const TableUsers = () => {
    const token = useEcomStore((state) => state.token)
    const [users, setUsers] = useState([])

    useEffect(() => {
        handleGetUsers(token)

    }, [])

    const handleGetUsers = (token) => {
        getListAllUsers(token)
            .then((res) => {
                setUsers(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
    }
    const handleChangeOrderStatus = (userId, userStatus) => {
        console.log(userId, userStatus)
        const value = {
            id: userId,
            enabled: !userStatus
        }
        changeUserStatus(token, value)
            .then((res) => {
                console.log(res)
                handleGetUsers(token)
                toast.success('Update Status Success!')
            })
            .catch((err) => {
                console.log(err)
            })
    }
    const handleChangeUserRole = (userId, userRole) => {
        const value = {
            id: userId,
            role: userRole
        }
        changeUserRole(token, value)
            .then((res) => {
                console.log(res)
                handleGetUsers(token)
                toast.success('Update Role Success!')
            })
            .catch((err) => {
                console.log(err)
            })
    }
    const userStatusColor = (enabled) => {
        return enabled ? 'bg-gray-300' : 'bg-green-400'
    }

    console.log(users)
    return (
        <div className='container mx-auto p-4 bg-white shadow-md'>
            <div>
                TabUsers
            </div>

            <table className='w-full'>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Email</th>
                        <th>Update on</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Active</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        users?.map((el, i) =>
                        (
                            <tr key={el.id}>
                                <td>{i + 1}</td>
                                <td className='px-2 '>{el.email}</td>
                                <td className='text-center'>{dateTime(el.updatedAt)}</td>


                                <td className='text-center'>
                                    <select 
                                    onChange={(e)=>handleChangeUserRole(el.id,e.target.value)}
                                    value={el.role}>
                                        <option>user</option>
                                        <option>admin</option>
                                    </select>
                                </td>


                                <td className='text-center'>{el.enabled ? 'Active' : 'Inactive'}</td>
                                <td className='text-center'>
                                    <button
                                        className={`${userStatusColor(el.enabled)}
                                            inline-flex items-center justify-center rounded-full 
                                                     px-5 py-2 font-medium text-gray-700
                                                    shadow-md transition duration-300 transform hover:scale-105`}
                                        onClick={() => handleChangeOrderStatus(
                                            el.id, el.enabled
                                        )}

                                    >
                                        {el.enabled ? 'Disable' : 'Enable'}

                                    </button>

                                </td>
                            </tr>
                        )
                        )}



                </tbody>

            </table>
        </div>

    )
}

export default TableUsers
