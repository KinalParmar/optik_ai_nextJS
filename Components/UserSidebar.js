'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { FiUserPlus } from 'react-icons/fi';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins',
});

const sidebarItems = [
  { title: 'Leads', link: '/admin/users-list', icon: HiOutlineUserGroup, permissionKey: 'leads' },
  { title: 'New Lead', link: '/admin/new-lead', icon: FiUserPlus, permissionKey: 'newleads' },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      setUserData(storedUser ? JSON.parse(storedUser) : {});
    }
  }, []);

  if (!userData) return null; // Prevent rendering until data is loaded

  const permissions = userData?.permissions || {};
  const isAdmin = userData?.isAdmin || false;

  // Helper function to check if permissions are valid (not empty and not just update/delete)
  const hasValidPermissions = (permissionArray) => {
    if (!Array.isArray(permissionArray) || permissionArray.length === 0) return false;
    const filteredPerms = permissionArray.filter(
      perm => perm !== 'update' && perm !== 'delete'
    );
    return filteredPerms.length > 0;
  };

  // Filter sidebar items based on permissions
  const filteredSidebarItems = sidebarItems.filter((item) => {
    const permissionArray = permissions?.[item?.permissionKey] || [];
    
    if (item?.permissionKey === 'users') {
      return isAdmin || (permissions?.hasOwnProperty('users') && hasValidPermissions(permissionArray));
    }
    
    if (item?.permissionKey === 'newleads') {
      return hasValidPermissions(permissionArray) || 
             (permissions?.['leads']?.includes('create'));
    }
    
    if (item?.permissionKey === 'leads') {
      return hasValidPermissions(permissionArray);
    }
    
    return false; // Default case, though all items are covered above
  });

  return (
    <div className={`${poppins.variable} w-[260px] h-screen bg-white fixed left-0 top-0 border-r border-gray-200 flex flex-col shadow-md`}>
      {/* Sidebar Header */}
      <div className="px-6 py-5 flex justify-center items-center">
        <Image src="/optik-logo.png" alt="Logo" width={150} height={50} priority className="object-contain" />
      </div>

      {/* Sidebar Menu */}
      <nav className="mt-4 px-4">
        <ul className="space-y-3">
          {filteredSidebarItems?.map((item, index) => {
            const Icon = item?.icon;
            const isActive = pathname === item?.link; // Exact match
            return (
              <li key={index}>
                <Link
                  href={item?.link}
                  className={`flex items-center px-5 py-3 text-sm font-medium transition-all duration-200 rounded-full ${
                    isActive
                      ? 'bg-[#635BFF] text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-4" />
                  <span>{item?.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}