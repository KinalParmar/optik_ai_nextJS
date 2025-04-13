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

const adminSidebarItems = [
  { title: 'Leads', link: '/admin/users-list', icon: HiOutlineUserGroup, permissionKey: 'leads' },
  { title: 'New Lead', link: '/admin/new-lead', icon: FiUserPlus, permissionKey: 'newleads' },
  { title: 'User', link: '/admin/users', icon: HiOutlineUserGroup, permissionKey: 'users' },
];

const userSidebarItems = [
  { title: 'Leads', link: '/users/users-list', icon: HiOutlineUserGroup, permissionKey: 'leads' },
  { title: 'New Lead', link: '/users/new-lead', icon: FiUserPlus, permissionKey: 'newleads' },
];

const getSidebarItems = (role) => {
  return role === 'admin' ? adminSidebarItems : userSidebarItems;
};

export default function Sidebar() {
  const pathname = usePathname();
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const storedRole = localStorage.getItem('role');
      setUserData(storedUser ? JSON.parse(storedUser) : {});
      setUserRole(storedRole ? JSON.parse(storedRole) : null);
    }
  }, []);

  if (!userData) return null; // Prevent rendering until data is loaded

  const permissions = userData?.permissions || {};
  const isAdmin = userData?.isAdmin || false;

  // Helper function to check if 'read' is in the permission array
  const hasReadPermission = (permissionArray) => {
    return Array.isArray(permissionArray) && permissionArray.includes('read');
  };

  // Get sidebar items based on role and filter based on permissions
  const sidebarItems = getSidebarItems(userRole);
  const filteredSidebarItems = sidebarItems.filter((item) => {
    const permissionArray = permissions?.[item?.permissionKey] || [];

    if (item?.permissionKey === 'users') {
      // Show 'User' if user is admin or has 'read' in users permissions
      return isAdmin || hasReadPermission(permissionArray);
    }

    if (item?.permissionKey === 'newleads') {
      // Show 'New Lead' if 'newleads' has 'read' or 'leads' has 'create'
      return hasReadPermission(permissionArray) || 
             (Array.isArray(permissions?.['leads']) && permissions?.['leads']?.includes('create'));
    }

    if (item?.permissionKey === 'leads') {
      // Show 'Leads' only if 'leads' has 'read'
      return hasReadPermission(permissionArray);
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