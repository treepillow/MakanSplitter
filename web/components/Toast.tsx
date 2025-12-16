'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Colors } from '../constants/colors';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: Colors.success,
          borderColor: Colors.successLight,
          boxShadow: `0 0 30px ${Colors.successLight}60, 0 0 60px ${Colors.successDark}40, inset 0 0 15px ${Colors.successLight}20`,
        };
      case 'error':
        return {
          backgroundColor: Colors.error,
          borderColor: Colors.errorLight,
          boxShadow: `0 0 30px ${Colors.errorLight}60, 0 0 60px ${Colors.errorDark}40, inset 0 0 15px ${Colors.errorLight}20`,
        };
      case 'warning':
        return {
          backgroundColor: Colors.warning,
          borderColor: Colors.warningLight,
          boxShadow: `0 0 30px ${Colors.warningLight}60, 0 0 60px ${Colors.warningDark}40, inset 0 0 15px ${Colors.warningLight}20`,
        };
      default:
        return {
          backgroundColor: Colors.primary,
          borderColor: Colors.primary,
          boxShadow: `0 0 30px ${Colors.primaryGlow}, 0 0 60px ${Colors.primaryGlow}, inset 0 0 15px ${Colors.primaryGlow}`,
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '!';
      default:
        return 'i';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-6 right-6 z-50 px-8 py-5 rounded-2xl flex items-center gap-4 max-w-md border-2 overflow-hidden"
        style={getStyles()}
        initial={{ opacity: 0, x: 100, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.8 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20
        }}
      >
        {/* Cyber scan line effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 pointer-events-none"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 1,
            ease: 'linear'
          }}
        />

        <motion.span
          className="text-2xl font-bold z-10"
          style={{ color: type === 'success' || type === 'warning' ? Colors.black : Colors.white }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            delay: 0.1
          }}
        >
          {getIcon()}
        </motion.span>

        <motion.p
          className="text-lg font-semibold flex-1 z-10"
          style={{ color: type === 'success' || type === 'warning' ? Colors.black : Colors.white }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          {message}
        </motion.p>

        <motion.button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all z-10"
          style={{
            backgroundColor: type === 'success' || type === 'warning'
              ? 'rgba(0, 0, 0, 0.15)'
              : 'rgba(255, 255, 255, 0.15)'
          }}
          whileHover={{ scale: 1.1, backgroundColor: type === 'success' || type === 'warning' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.25)' }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-lg font-bold" style={{ color: type === 'success' || type === 'warning' ? Colors.black : Colors.white }}>
            ✕
          </span>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
