'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiOutlineHome } from 'react-icons/hi';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { FiUserPlus } from 'react-icons/fi';

// Import Poppins font from Google Fonts
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'], // Regular, medium, and semi-bold weights
  variable: '--font-poppins',
});

const sidebarItems = [
  { title: 'Home', link: '/master-admin/home', icon: HiOutlineHome },
  { title: 'Leads', link: '/master-admin/users-list', icon: HiOutlineUserGroup },
  { title: 'New Lead', link: '/master-admin/new-lead', icon: FiUserPlus },
  { title: 'User', link: '/master-admin/users', icon: HiOutlineUserGroup },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className={`${poppins.variable} w-[260px] h-screen bg-gradient-to-b from-[#F9F9FF] to-white fixed left-0 top-0 border-r border-[#E2E8F0] flex flex-col shadow-lg`}>
      <div className="px-6 py-8 border-b border-[#E2E8F0] flex justify-center items-center">
        <Image
          src="/optik-logo.png"
          alt="Optik Logo"
          width={150}
          height={50}
          priority
          className="object-contain"
        />
      </div>

      <nav className="mt-8 px-4 space-y-2">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={index}
              href={item.link}
              className={`flex items-center px-5 py-3 rounded-lg text-[14px] hover:bg-[#E6E8F5] transition-all duration-200 relative
                ${pathname === item.link ? 'text-[#007BFF] bg-[#E6E8F5] font-semibold' : 'text-[#64748B] hover:text-[#007BFF]'}`}
            >
              {pathname === item.link && (
                <span className="absolute left-0 w-1 h-full bg-[#007BFF] rounded-r-lg"></span>
              )}
              <Icon className="w-5 h-5 mr-4" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}