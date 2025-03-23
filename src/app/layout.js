import { Inter } from "next/font/google";
import "./globals.css";
import AlertManager, { AlertProvider } from "@/Components/Toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Optik AI Dashboard",
  description: "Modern admin dashboard for Optik AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AlertProvider>
          {children}
        </AlertProvider>
      </body>
    </html>
  );
}
