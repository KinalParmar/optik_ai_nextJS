'use client';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/SuperSidebar';
import { useState, useEffect } from 'react';
import { FiBell, FiUser } from 'react-icons/fi';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { showSuccessToast, showErrorToast } from '@/Components/Toaster';
import { getAllNotificationsDetails } from '@/src/Services/Master-Admin/Home';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function MasterAdminLayout({ children }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [useIconFallback, setUseIconFallback] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await getAllNotificationsDetails();
        if (response) {
          setNotifications(response || []);
        } else {
          showErrorToast('Failed to fetch notifications');
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        showErrorToast('An error occurred while fetching notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleSignOut = () => {
    localStorage.clear();
    showSuccessToast('Signed out successfully');
    router.push('/master-admin-login');
  };

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
                  src={process.env.NEXT_PUBLIC_PROFILE_IMAGE || '/profile-placeholder.jpg'}
                  alt="Profile"
                  width={40}
                  height={40}
                  onError={handleImageError}
                  className="rounded-full object-cover"
                />
              )}
            </div>
            <span className="text-[20px] font-bold text-[#64748B]">
              Welcome back, Master Admin 👋
            </span>
          </div>
          <div className="flex items-center">
            <div className="relative mr-6">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-[#64748B] hover:text-[#1A1A1A] transition-colors duration-200"
              >
                <FiBell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                    {notifications.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-lg shadow-lg py-2 z-10 
                  max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
                >
                  {loading ? (
                    <div className="px-4 py-2 text-sm text-gray-700">Loading...</div>
                  ) : notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 
                        border-b border-gray-100 last:border-b-0 flex flex-col"
                      >
                        <p className="font-semibold">{notification.notification}</p>
                        <p className="text-xs text-gray-500 mt-1">Company: {notification.name}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-700">
                      No notifications available.
                    </div>
                  )}
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
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}
