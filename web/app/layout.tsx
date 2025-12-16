import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BillProvider } from "@/context/BillContext";
import { Navbar } from "@/components/Navbar";
import { Colors } from "@/constants/colors";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MakanSplitter - Split bills effortlessly",
  description: "Quick and simple bill splitting. No sign-up required. Generate your bill split message instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full">
      <body className={`${inter.variable} font-sans antialiased w-full`} style={{ backgroundColor: Colors.background }}>
        <BillProvider>
          <Navbar />
          {children}
        </BillProvider>
      </body>
    </html>
  );
}
