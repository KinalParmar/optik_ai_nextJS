
'use client';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';
import { FiBell, FiUser } from 'react-icons/fi';
import Image from 'next/image';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function MasterAdminLayout({ children }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [useIconFallback, setUseIconFallback] = useState(false); // State to toggle between image and icon

  const handleSignOut = () => {
    // Add sign-out logic here (e.g., clear session, redirect)
    console.log('Sign out clicked');
  };

  // Function to handle image load error and switch to icon
  const handleImageError = () => {
    setUseIconFallback(true);
  };

  return (
    <div className={`${inter.variable} flex min-h-screen bg-[#F8F9FE]`}>
      <Sidebar />
      <main className="flex-1 ml-[260px] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E2E8F0] shadow-sm">
          <div className="flex items-center">
            <div className="relative mr-3">
              {useIconFallback || !process.env.NEXT_PUBLIC_PROFILE_IMAGE ? (
                <FiUser className="w-10 h-10 text-[#64748B] rounded-full p-1 bg-gray-200" />
              ) : (
                <Image
                  src={process.env.NEXT_PUBLIC_PROFILE_IMAGE || '/profile-placeholder.jpg'} // Use environment variable or fallback
                  alt="Profile"
                  width={40}
                  height={40}
                  onError={handleImageError}
                  className="rounded-full object-cover"
                />
              )}
            </div>
            <span className="text-[20px] font-bold text-[#64748B]">
              Welcome back, Admin 👋
            </span>
          </div>
          <div className="flex items-center">
            <div className="relative mr-6">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-[#64748B] hover:text-[#1A1A1A] transition-colors duration-200"
              >
                <FiBell className="w-6 h-6" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E2E8F0] rounded-lg shadow-lg py-2 z-10">
                  <div className="px-4 py-2 text-sm text-gray-700">Notification 1</div>
                  <div className="px-4 py-2 text-sm text-gray-700">Notification 2</div>
                  <div className="px-4 py-2 text-sm text-gray-700">Notification 3</div>
                </div>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="text-[16px] font-bold text-[#64748B] hover:text-[#1A1A1A] transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
