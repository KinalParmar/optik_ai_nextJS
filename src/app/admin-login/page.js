'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Add your authentication logic here
    router.push('/admin/users-list')
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
            Admin Login
          </h1>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full h-11 px-3 rounded-md bg-white text-[15px] placeholder-gray-400 border border-gray-300 focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF]"
              />
            </div>
            
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full h-11 px-3 rounded-md bg-white text-[15px] placeholder-gray-400 border border-gray-300 focus:outline-none focus:border-[#007BFF] focus:ring-1 focus:ring-[#007BFF]"
              />
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
