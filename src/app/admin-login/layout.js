'use client'
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function AdminLoginLayout({ children }) {
  return (
    <div className={`${inter.variable} min-h-screen flex items-center justify-center bg-[#F9FAFB]`}>
      {children}
    </div>
  );
}
