import type { Metadata } from "next";
import { Azeret_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { BillProvider } from "@/context/BillContext";
import { Navbar } from "@/components/Navbar";

const azeret = Azeret_Mono({
  subsets: ["latin"],
  variable: "--font-azeret",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  title: "MakanSplitter — Makan first, split later",
  description:
    "Scan the receipt, share one Telegram poll, and everyone pays for exactly what they ate. No sign-up, no app, free.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${azeret.variable} ${instrument.variable} font-sans antialiased`}>
        <BillProvider>
          <Navbar />
          {children}
        </BillProvider>
      </body>
    </html>
  );
}
