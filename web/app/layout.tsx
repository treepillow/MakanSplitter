import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BillProvider } from "@/context/BillContext";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MakanSplit - Split bills with friends",
  description: "Easily split bills with friends. Modern bill splitting made simple.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full">
      <body className={`${inter.variable} font-sans antialiased w-full`} style={{ backgroundColor: '#0F172A' }}>
        <BillProvider>
          <Navbar />
          {children}
        </BillProvider>
      </body>
    </html>
  );
}
