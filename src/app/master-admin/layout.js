'use client'
import { Inter } from "next/font/google";
import Sidebar from "../../../Components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function MasterAdminLayout({ children }) {
  return (
    <div className={`${inter.variable} flex min-h-screen bg-[#F8F9FE]`}>
      <Sidebar />
      <main className="flex-1 ml-[240px]">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E2E8F0]">
          <div></div>
          <div className="flex items-center gap-2 justify-between w-full">
            <span className="text-[20px] font-bold text-[#64748B]">Welcome Back, 👋</span>
            <button className="text-[20px] font-bold text-[#64748B] hover:text-[#1A1A1A]">Sign Out</button>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
