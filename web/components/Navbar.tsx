'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/donate', label: 'Donate' },
];

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-dashed border-rule-dash bg-paper/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Wordmark */}
          <Link
            href="/"
            className="font-mono font-bold text-lg tracking-tight text-ink hover:opacity-70 transition-opacity"
          >
            MAKAN<span className="text-chop">/</span>SPLIT
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-mono text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                  isActive(item.href)
                    ? 'text-ink underline decoration-chop decoration-2 underline-offset-8'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/create-bill" className="btn btn-ink btn-sm">
              + New bill
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-4">
            <Link
              href="/about"
              className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft"
            >
              About
            </Link>
            <Link href="/create-bill" className="btn btn-ink btn-sm">
              + New
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
