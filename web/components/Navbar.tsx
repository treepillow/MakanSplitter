'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
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
      className="border-b sticky top-0 z-40 backdrop-blur-md"
      style={{
        backgroundColor: 'rgba(250, 250, 249, 0.9)',
        borderColor: Colors.borderLight,
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center transition-opacity hover:opacity-70">
            <Image
              src="/logo.svg"
              alt="MakanSplit"
              width={160}
              height={40}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '/', label: 'Home' },
              { href: '/about', label: 'About' },
              { href: '/donate', label: 'Donate' },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className="text-sm font-medium transition-all px-4 py-2 rounded-lg"
                  style={{
                    color: isActive(item.href) ? Colors.primary : Colors.textSecondary,
                    backgroundColor: isActive(item.href) ? Colors.primaryLight : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(item.href)) {
                      e.currentTarget.style.backgroundColor = Colors.backgroundSecondary;
                      e.currentTarget.style.color = Colors.text;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.href)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = Colors.textSecondary;
                    }
                  }}
                >
                  {item.label}
                </div>
              </Link>
            ))}

            <div className="w-px h-6 mx-2" style={{ backgroundColor: Colors.border }}></div>

            <Link href="/create-bill">
              <button
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                style={{
                  backgroundColor: Colors.primary,
                  color: Colors.white,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = Colors.primaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = Colors.primary;
                }}
              >
                <Plus size={16} />
                New Bill
              </button>
            </Link>
          </div>

          {/* Mobile CTA */}
          <Link href="/create-bill" className="md:hidden">
            <button
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1"
              style={{
                backgroundColor: Colors.primary,
                color: Colors.white,
              }}
            >
              <Plus size={16} />
              New
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
