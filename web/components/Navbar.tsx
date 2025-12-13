'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Colors } from '@/constants/colors';

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav
      className="border-b"
      style={{
        backgroundColor: Colors.card,
        borderColor: Colors.border,
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo.svg"
              alt="MakanSplit"
              width={180}
              height={50}
              className="transition-all group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className={`text-sm font-medium transition-all px-4 py-2 rounded-lg ${
                isActive('/') ? '' : 'hover:opacity-80'
              }`}
              style={{
                color: isActive('/') ? Colors.primary : Colors.textSecondary,
                backgroundColor: isActive('/') ? Colors.backgroundTertiary : 'transparent',
              }}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-all px-4 py-2 rounded-lg ${
                isActive('/about') ? '' : 'hover:opacity-80'
              }`}
              style={{
                color: isActive('/about') ? Colors.primary : Colors.textSecondary,
                backgroundColor: isActive('/about') ? Colors.backgroundTertiary : 'transparent',
              }}
            >
              About
            </Link>
            <Link
              href="/donate"
              className={`text-sm font-medium transition-all px-4 py-2 rounded-lg ${
                isActive('/donate') ? '' : 'hover:opacity-80'
              }`}
              style={{
                color: isActive('/donate') ? Colors.primary : Colors.textSecondary,
                backgroundColor: isActive('/donate') ? Colors.backgroundTertiary : 'transparent',
              }}
            >
              Donate
            </Link>
            <div className="w-px h-6 mx-2" style={{ backgroundColor: Colors.border }}></div>
            <Link
              href="/create-bill"
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-105 shadow-md"
              style={{ backgroundColor: Colors.primary }}
            >
              + New Bill
            </Link>
          </div>

          {/* Mobile CTA */}
          <Link
            href="/create-bill"
            className="md:hidden px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-105 shadow-md"
            style={{ backgroundColor: Colors.primary }}
          >
            + New
          </Link>
        </div>
      </div>
    </nav>
  );
}
