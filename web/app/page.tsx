'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Colors } from '@/constants/colors';
import BillCounter from '@/components/BillCounter';

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as const
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: Colors.background }}>
      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: Colors.primary }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: Colors.secondary }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="max-w-4xl mx-auto px-6 py-20 text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Title */}
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
          variants={itemVariants}
        >
          <span style={{ color: Colors.text }}>Split Bills </span>
          <br className="md:hidden" />
          <span style={{ color: Colors.primary }}>
            Effortlessly
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto font-medium"
          style={{ color: Colors.textSecondary }}
          variants={itemVariants}
        >
          Are you the <span style={{ color: Colors.primary }}>suey one</span> paying today? I gotchu.
        </motion.p>

        {/* Bill Counter */}
        <motion.div variants={itemVariants} className="mb-12">
          <BillCounter />
        </motion.div>

        {/* Quick Start Box */}
        <motion.div
          className="max-w-xl mx-auto rounded-2xl p-8 mb-12 text-left border-2 relative overflow-hidden"
          style={{
            backgroundColor: Colors.glassBackground,
            borderColor: Colors.borderGlow,
            backdropFilter: 'blur(20px)',
          }}
          variants={itemVariants}
          whileHover={{
            borderColor: Colors.primary,
          }}
        >
          {/* Cyber grid overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none cyber-grid" />

          <p className="text-lg font-bold mb-6" style={{ color: Colors.primary }}>
            Quick Start
          </p>
          <ol className="text-base space-y-4" style={{ color: Colors.textSecondary }}>
            {[
              '1. Create a bill or scan your receipt',
              '2. Add people and dishes with prices',
              '3. Share the bill in any Telegram chat',
              '4. Everyone selects what they ate',
              '5. Lock the bill to see who owes what!'
            ].map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="font-bold" style={{ color: Colors.primary }}>→</span>
                <span>{step}</span>
              </motion.li>
            ))}
          </ol>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          variants={itemVariants}
        >
          <Link href="/scan-receipt">
            <motion.div
              className="px-12 py-6 rounded-2xl text-xl font-bold border-2"
              style={{
                backgroundColor: Colors.glassBackground,
                borderColor: Colors.primary,
                color: Colors.primary,
                backdropFilter: 'blur(20px)',
              }}
              whileHover={{
                scale: 1.05,
                opacity: 0.9,
              }}
              whileTap={{ scale: 0.95 }}
            >
              Scan Receipt
            </motion.div>
          </Link>

          <Link href="/create-bill">
            <motion.div
              className="px-12 py-6 rounded-2xl text-xl font-bold border-2"
              style={{
                backgroundColor: Colors.primary,
                borderColor: Colors.primary,
                color: Colors.black,
              }}
              whileHover={{
                scale: 1.05,
                opacity: 0.9,
              }}
              whileTap={{ scale: 0.95 }}
            >
              Create Manually →
            </motion.div>
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-20 pt-12 border-t"
          style={{ borderColor: Colors.borderLight }}
          variants={itemVariants}
        >
          <p className="text-sm font-medium" style={{ color: Colors.textMuted }}>
            Quick. Simple. <span style={{ color: Colors.primary }}>No sign-up required.</span> Generate your bill split message instantly.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
