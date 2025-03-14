'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HiOutlineUserGroup } from 'react-icons/hi'
import { TbArrowGuide } from 'react-icons/tb'
import { BiBarChartAlt2 } from 'react-icons/bi'
import { BsSpeedometer2 } from 'react-icons/bs'
import { MdOutlineInsights } from 'react-icons/md'

const sidebarItems = [
  { title: 'Home', link: '/super-master-admin/home', icon: HiOutlineUserGroup },
  { title: 'Leads', link: '/super-master-admin/users-list', icon: HiOutlineUserGroup },
  { title: 'New Lead', link: '/super-master-admin/new-lead', icon: HiOutlineUserGroup },
  { title: 'User', link: '/super-master-admin/users', icon: HiOutlineUserGroup },
  // { title: 'Flows', link: '/master-admin/flows', icon: TbArrowGuide },
  // { title: 'Campaigns', link: '/master-admin/campaigns', icon: BiBarChartAlt2 },
  // { title: 'GTM Hub', link: '/master-admin/gtm-hub', icon: BsSpeedometer2 },
  // { title: 'Insights', link: '/master-admin/insights', icon: MdOutlineInsights }
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-[240px] h-screen bg-white fixed left-0 top-0 border-r border-[#E2E8F0] flex flex-col">
      <div className="px-6 py-10 border-b border-[#E2E8F0] flex justify-center items-center">
        <Image
          src="/optik-logo.png"
          alt="Optik Logo"
          width={140}
          height={40}
          priority
          className=""
        />
      </div>

      <ul className="mt-6 space-y-1">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon
          return (
            <li key={index}>
              <Link 
                href={item.link}
                className={`flex items-center px-6 py-3 text-[14px] hover:bg-[#F8FAFF] transition-colors duration-200 relative
                  ${pathname === item.link ? 'text-[#007BFF] bg-[#F8FAFF] font-medium' : 'text-[#64748B] hover:text-[#007BFF]'}`}
              >
                {pathname === item.link && (
                  <span className="absolute left-0 w-[2px] h-full bg-[#007BFF]"></span>
                )}
                <Icon className="w-[18px] h-[18px] mr-3.5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
