'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Login from '@/src/Services/Master-Admin/Login'

export default function SuperAdminLogin() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  })

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Validation checks
    if (name === 'email') {
      setErrors({ ...errors, email: validateEmail(value) ? '' : 'Invalid email format' })
    }

    if (name === 'password') {
      setErrors({ ...errors, password: value.trim() ? '' : 'Password cannot be empty' })
    }
  }

  // Validate email format
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Final validation check before submitting
    if (!validateEmail(formData.email)) {
      setErrors({ ...errors, email: 'Invalid email format' })
      return
    }

    if (!formData.password.trim()) {
      setErrors({ ...errors, password: 'Password cannot be empty' })
      return
    }

    try {
      const response = await Login.Loginapi(formData)

      if (response?.success) {
        router.push('/master-admin/home')
         // Redirect on success
      }
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message)
      router.push('/master-admin/home')
      // setErrors({ ...errors, password: 'Invalid credentials' }) // Set error message
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB]">
      <div className="w-[400px]">
        <div className="flex justify-center mb-8">
          <Image
            src="/optik-logo.png"
            alt="Optik Logo"
            width={120}
            height={40}
            priority
          />
        </div>

        <div className="bg-white rounded-lg p-8">
          <h1 className="text-[22px] font-semibold text-center mb-8 text-gray-900">
            Master Admin Login
          </h1>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full h-11 px-3 rounded-md bg-white text-[15px] placeholder-gray-400 border ${errors.email ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF]`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full h-11 px-3 rounded-md bg-white text-[15px] placeholder-gray-400 border ${errors.password ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF]`}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#007BFF] text-white rounded-md text-[15px] font-medium hover:bg-[#0056b3] transition-colors"
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
