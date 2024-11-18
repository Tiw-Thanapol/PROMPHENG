import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify';
import { useForm } from "react-hook-form"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import zxcvbn from 'zxcvbn'
import { Link, useNavigate } from 'react-router-dom'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'

const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid Email!' }),
  password: z.string()
    .min(4, { message: "Password must be at least 4 characters" })
    .max(16, { message: "Password must be at most 16 characters" }),
  confirmPassword: z.string(),
})
  .refine((data) => data.password === data.confirmPassword,
    {
      message: 'Passwords do not match!',
      path: ["confirmPassword"],
    })

const Register = () => {
  const [passwordScore, setPasswordScore] = useState(0)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // State to show popup

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema)
  })

  const validatePassword = () => {
    let password = watch().password
    return zxcvbn(password ? password : '').score
  }
  useEffect(() => {
    setPasswordScore(validatePassword())
  }, [watch().password])

  //console.log(passwordScore)

//ตอนแรกเขียนแบบนี้ แต่เนื่องจากต้องการความรัดกุมในเรื่องPasswordจึงเปลี่ยนไปใช้Lib zxcvbn, zod
  // const [form, setForm] = useState({
  //   email: "",
  //   password: "",
  //   confirmPassword: ""
  // })

  // const handleOnChange = (e) => {
  //   setForm({
  //     ...form,
  //     [e.target.name]: e.target.value
  //   })
  // }

  // const hdlSummit = async (e) => {
  //   e.preventDefault()
  //   if (form.password !== form.confirmPassword) {
  //     return alert('Confirm Password is not match!')
  //   }
  //   console.log(form)
  //   // Send to backend
  //   try {
  //     const res = await axios.post('http://localhost:5000/api/register', form)
  //     toast.success(res.data)
  //     console.log(res)
  //   } catch (err) {
  //     const errMsg = err.response?.data?.message
  //     toast.error(errMsg)
  //     console.log(err)
  //   }
  // }

  const onSubmit = async (data) => {
    // console.log(data)
    // // ใช้ zxcvbn ตรวจสอบความยากของรหัสผ่าน
    // const passwordStrength = zxcvbn(data.password).score
    // console.log("Password strength score:", passwordStrength)

    // // แสดงข้อความหรือการแจ้งเตือนให้ผู้ใช้ทราบหากรหัสผ่านอ่อน
    // if (passwordStrength < 2) {
    //   toast.warn('Your password is weak, consider using a stronger password!');
    // }

    // // ส่งข้อมูลไปที่เซิร์ฟเวอร์
    try {
      const res = await axios.post('http://localhost:5000/api/register', data)
      toast.success(res.data.message || "Registration successful!")
      setShowPopup(true)
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Something went wrong!';
      toast.error(errMsg)
    }
  }
  return (
    <div className="min-h-screen flex justify-center items-center shadow-md bg-gradient-to-br from-blue-400 to-lime-200 ">
       <div className="flex bg-white/40 backdrop-blur-md rounded-2xl shadow-lg w-4/5 max-w-4xl">
        {/* Left Form Section */}
        <div className="w-1/2 p-8 ">
          <h2 className="text-2xl font-bold text-center text-blue-600 mb-4"
          >
            CREATE ACCOUNT
            </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Email Field */}
            <div className="relative">
              <input
                {...register('email')}
                type="email"
                className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E-mail"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiFillEyeInvisible size={24} /> : <AiFillEye size={24} />}
              </button>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              {watch().password?.length > 0 && (
                <div className="flex mt-3 space-x-1">
                  {Array.from(Array(5).keys()).map((item, index) => (
                    <div
                      key={index}
                      className={`w-1/5 h-2 rounded-full ${passwordScore <= 2
                        ? 'bg-red-400'
                        : passwordScore < 4
                          ? 'bg-yellow-400'
                          : 'bg-green-400'
                        }`}
                    ></div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword
                  ? <AiFillEyeInvisible size={24} />
                  : <AiFillEye size={24} />
                }
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1"
                >
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="terms" className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I’ve read and agree to <span className="text-blue-500 cursor-pointer">Terms & Conditions</span>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 
                rounded-full hover:bg-sky-800 transition duration-300
                bg-gradient-to-r from-sky-400 to-sky-700 hover:scale-105
                "
              >
                Create Account
              </button>
              <p className="text-center text-sm mt-4 ">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-blue-500 hover:underline "
                >
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Right Info Section */}
        <div className="w-1/2 bg-gradient-to-bl from-sky-400 to-cyan-300 hover:scale-105 rounded-r-2xl p-12 text-white flex flex-col justify-center items-center">
          <h2 className="text-3xl font-bold mb-4">Glad to see You!</h2>
          <p className="text-sm text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
            sit amet blandit leo lobortis eget.
          </p>
        </div>
      </div>
      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">Please login to continue.</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-700 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
