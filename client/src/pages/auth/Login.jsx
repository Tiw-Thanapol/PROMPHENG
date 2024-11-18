import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import useEcomStore from '../../store/ecom-store'
import { useNavigate } from 'react-router-dom'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'

const Login = () => {
  const navigate = useNavigate()
  const actionLogin = useEcomStore((state) => state.actionLogin)
  const user = useEcomStore((state) => state.user)
  const [showPassword, setShowPassword] = useState(false)
  
  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const handleOnChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    
    try {
      const res = await actionLogin(form)
      if (res?.data?.payload) {
        const role = res.data.payload.role
        console.log('role', role)
        roleRedirect(role)
        toast.success('Welcome Back')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      console.log(err)
      const errMsg = err.response?.data?.message || 'Login failed'
      toast.error(errMsg)
    }
  }

  const roleRedirect = (role) => {
    if (role === 'admin') {
      navigate('/admin')
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center shadow-md 
    bg-gradient-to-br from-blue-400 to-lime-200">
      <div className="flex bg-white/40 backdrop-blur-md rounded-2xl 
      shadow-lg w-4/5 max-w-4xl">
        <div className="w-1/2 p-8">
          <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">
            Sign in
          </h2>
          
          <form onSubmit={handleSubmit}>
            <input 
              type="email"
              name="email" 
              value={form.email} 
              className="w-full border border-gray-300 rounded-full px-4 py-2 
              focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="E-mail"
              onChange={handleOnChange}
            />
            
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                name="password" // Added name attribute
                value={form.password} 
                className="w-full border border-gray-300 rounded-full px-4 py-2
                focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                placeholder="Enter your password"
                onChange={handleOnChange}
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiFillEyeInvisible size={24} /> : <AiFillEye size={24} />}
              </button>
            </div>
            
            <button
              type="submit" 
              className="w-full bg-blue-500 text-white py-2 
              rounded-full hover:bg-sky-800 transition duration-300
              bg-gradient-to-r from-sky-400 to-sky-700 hover:scale-105"
            >
              Sign in
            </button>
          </form>
        </div>

        {/* Right Info Section */}
        <div className="w-1/2 bg-gradient-to-bl from-sky-400 to-cyan-300 rounded-r-2xl p-12 text-white flex flex-col justify-center items-center">
          <h2 className="text-3xl font-bold mb-4">Glad to see You!</h2>
          <p className="text-sm text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
            sit amet blandit leo lobortis eget.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login