'use client';
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

// const sidebarItems = [
//   { title: 'Leads', link: '/admin/users-list', icon: HiOutlineUserGroup, permissionKey: 'leads' },
//   { title: 'New Lead', link: '/admin/new-lead', icon: FiUserPlus, permissionKey: 'newleads' },
//   { title: 'User', link: '/admin/users', icon: HiOutlineUserGroup, permissionKey: "users" }, // No permission check for "User"
// ];

const sidebarItems = [
  { title: 'Leads', link: '/admin/users-list', icon: HiOutlineUserGroup },
  { title: 'New Lead', link: '/admin/new-lead', icon: FiUserPlus },
  { title: 'User', link: '/admin/users', icon: HiOutlineUserGroup }, // No permission check for "User"
];

export default function Sidebar() {
  const permissions = JSON?.parse(localStorage?.getItem('user'))?.permissions || {};
  const pathname = usePathname();
  console.log(permissions)

  // Filter sidebar items based on permissions
  const filteredSidebarItems = sidebarItems.filter((item) => {
    // If there's no permissionKey, the item is always visible (e.g., "User")
    if (!item.permissionKey) return true;
    // Check if the permission array for the item exists and has length > 0
    const permissionArray = permissions[item.permissionKey] || [];
    return permissionArray.length > 0;
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
          {filteredSidebarItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.link;
            return (
              <li key={index}>
                <Link
                  href={item.link}
                  className={`flex items-center px-5 py-3 text-sm font-medium transition-all duration-200 rounded-full ${
                    isActive
                      ? 'bg-[#635BFF] text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-4" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}