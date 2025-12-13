'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Colors } from '@/constants/colors';

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <motion.nav
      className="border-b-2 sticky top-0 z-40 backdrop-blur-xl"
      style={{
        backgroundColor: Colors.glassBackground,
        borderColor: Colors.borderGlow,
        boxShadow: `0 4px 30px rgba(0, 0, 0, 0.4), 0 0 20px ${Colors.primaryGlow}`,
      }}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Image
                src="/logo.svg"
                alt="MakanSplit"
                width={180}
                height={50}
                className="transition-all"
              />
              {/* Glow effect on hover */}
              <motion.div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `radial-gradient(circle, ${Colors.primaryGlow} 0%, transparent 70%)`,
                  filter: 'blur(10px)',
                  zIndex: -1,
                }}
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {[
              { href: '/', label: 'Home' },
              { href: '/about', label: 'About' },
              { href: '/donate', label: 'Donate' },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`text-sm font-semibold transition-all px-4 py-2 rounded-lg relative overflow-hidden`}
                  style={{
                    color: isActive(item.href) ? Colors.primary : Colors.textSecondary,
                    backgroundColor: isActive(item.href) ? Colors.cardHover : 'transparent',
                    borderWidth: isActive(item.href) ? '1px' : '0px',
                    borderColor: isActive(item.href) ? Colors.borderGlow : 'transparent',
                    boxShadow: isActive(item.href) ? `0 0 15px ${Colors.primaryGlow}` : 'none',
                  }}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: Colors.cardHover,
                    color: Colors.primary,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Cyber scan line on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 hover:opacity-10 pointer-events-none"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '200%' }}
                    transition={{ duration: 0.6 }}
                  />
                  {item.label}
                </motion.div>
              </Link>
            ))}

            <div className="w-px h-6 mx-2" style={{ backgroundColor: Colors.borderLight }}></div>

            <Link href="/create-bill">
              <motion.div
                className="px-6 py-2.5 rounded-lg text-sm font-bold relative overflow-hidden"
                style={{
                  backgroundColor: Colors.primary,
                  color: Colors.black,
                  boxShadow: `0 0 20px ${Colors.primaryGlow}, 0 0 40px ${Colors.primaryGlow}`,
                  border: `1px solid ${Colors.primary}`,
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: `0 0 30px ${Colors.primaryGlow}, 0 0 60px ${Colors.primaryGlow}, inset 0 0 15px ${Colors.primaryGlow}`,
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Cyber scan line effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: 'linear'
                  }}
                />
                <span className="relative z-10">+ New Bill</span>
              </motion.div>
            </Link>
          </div>

          {/* Mobile CTA */}
          <Link href="/create-bill" className="md:hidden">
            <motion.div
              className="px-5 py-2.5 rounded-lg text-sm font-bold relative overflow-hidden"
              style={{
                backgroundColor: Colors.primary,
                color: Colors.black,
                boxShadow: `0 0 20px ${Colors.primaryGlow}`,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">+ New</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
