import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import useEcomStore from '../store/ecom-store';
import { House, ShoppingBag, ShoppingCart, ChevronDown } from 'lucide-react';
import { AiOutlineUser, AiFillSetting } from 'react-icons/ai'


const MainNav = () => {
    const carts = useEcomStore((state) => state.carts)
    const [isOpen, setIsOpen] = useState(false)
    const user = useEcomStore(state => state.user)
    const logout = useEcomStore(state => state.logout)
    // console.log(Boolean(user))
    //console.log(user)

    const toggleDropDown = () => {
        setIsOpen(!isOpen)
    }
    console.log(carts.length)
    return (
        <nav className='bg-green-200'>
            <div className='mx-auto px-4'>
                <div className='flex justify-between h-16'>
                    <div className='flex items-center gap-6'>
                        <Link to={'/'} className='text-2xl font-bold'>LOGO    </Link>
                        <NavLink
                            to={'/'}
                            className={({ isActive }) => isActive
                                ? 'font-medium text-sm rounded-md px-3 py-2 hover:scale-105'
                                : 'font-medium text-sm rounded-md px-3 py-2 hover:scale-105'
                            }
                        >
                            <House /> HOME
                        </NavLink>
                        <NavLink
                            to={'/shop'}
                            className={({ isActive }) => isActive
                                ? 'font-medium text-sm rounded-md px-3 py-2 hover:scale-105'
                                : 'font-medium text-sm rounded-md px-3 py-2 hover:scale-105'
                            }
                        >
                            <ShoppingBag />Shop
                        </NavLink>

                        {/* Badge */}
                        <NavLink
                            to={'/cart'}
                            className={({ isActive }) => isActive
                                ? 'font-medium text-sm rounded-md px-3 py-2 hover:scale-105'
                                : 'font-medium text-sm rounded-md px-3 py-2 hover:scale-105'
                            }
                        >
                            <ShoppingCart /> Cart
                            {carts.length > 0
                                && (<span
                                    className='absolute top-0 right bg-red-600 
                        rounded-full px-2 text-white hover:scale-105'
                                >
                                    {carts.length}</span>)
                            }
                        </NavLink>
                    </div>

                    {
                        user
                            ? <div className="flex gap-4 md:gap-8 items-center">
                                <div className="md:flex gap-3 items-center">
                                    <div className="rounded-full border-2 border-gray-300 text-gray-500 text-[32px]
                             w-[50px] h-[50px] flex items-center justify-center">
                                        <AiOutlineUser />
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Hello, Sign in</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                    {/* <button onClick={toggleDropDown}
                                        className='flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200'>
                                        <ChevronDown className="text-lg" />
                                    </button> */}
                                    <button onClick={toggleDropDown}
                                        className='flex items-center gap-2 px-4 py-2 rounded-lg 
                                        hover:bg-gray-300 transition-all duration-200'
                                    >
                                        <div className="md:flex gap-3 items-center">
                                            <div className="  border-gray-300 text-gray-500 text-[32px]
                             w-[50px] h-[50px] flex items-center justify-center">
                                                <AiFillSetting />

                                            </div>

                                        </div>
                                    </button>

                                    {/* Dropdown */}
                                    {isOpen &&
                                        <div className='bg-white absolute top-14 right-0 w-48 shadow-lg 
                                        rounded-lg border border-gray-200 mt-2 z-50'>
                                            <Link to='/user/userprofile'
                                                className='block px-4 py-3 text-gray-700 hover:bg-gray-100 
                                                rounded-lg transition-all duration-200 border'
                                            >
                                                Profile
                                            </Link >

                                            <Link to='/user/history'
                                                className='block px-4 py-3 text-gray-700 hover:bg-gray-100 
                                            rounded-lg transition-all duration-200 border'
                                            >
                                                History
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    logout();  // เรียกใช้งาน logout จาก store
                                                    setIsOpen(false);  // ปิด dropdown หลังจาก logout
                                                }}
                                                className=' w-full block px-4 py-3 text-gray-700 
                                                hover:bg-gray-100 text-left rounded-lg 
                                                transition-all duration-200 border'
                                            >
                                                Logout
                                            </button>

                                        </div>
                                    }

                                </div>

                            </div>

                            : <div className='flex items-center gap-4'>
                                <NavLink
                                    to={'Register'}
                                    className={({ isActive }) => isActive
                                        ? 'font-medium text-sm rounded-md  hover:scale-105'
                                        : 'font-medium text-sm rounded-md hover:scale-105'
                                    }
                                >
                                    Sign up
                                </NavLink>
                                <NavLink
                                    to={'login'}
                                    className={({ isActive }) => isActive
                                        ? 'font-medium text-sm rounded-md  hover:scale-105'
                                        : 'font-medium text-sm rounded-md  hover:scale-105'
                                    }
                                >
                                    Sign in
                                </NavLink>
                            </div>
                    }




                </div>

            </div>
        </nav>
    );
}

export default MainNav;
