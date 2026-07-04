'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

const TYPE_STYLES: Record<string, { accent: string; mark: string }> = {
  success: { accent: 'var(--paid)', mark: 'OK' },
  error: { accent: 'var(--chop)', mark: '!!' },
  warning: { accent: 'var(--warn)', mark: '!' },
  info: { accent: 'var(--ink)', mark: 'i' },
};

export function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const { accent, mark } = TYPE_STYLES[type] ?? TYPE_STYLES.info;

  return (
    <AnimatePresence>
      <motion.div
        role="status"
        className="slip fixed top-5 right-5 left-5 sm:left-auto z-50 flex items-center gap-3 px-4 py-3 sm:max-w-sm"
        style={{ borderLeft: `4px solid ${accent}` }}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <span
          className="font-mono font-bold text-xs px-1.5 py-0.5 rounded-sm shrink-0"
          style={{ color: accent, border: `2px solid ${accent}` }}
        >
          {mark}
        </span>
        <p className="text-sm font-medium text-ink flex-1">{message}</p>
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="font-mono text-ink-soft hover:text-ink text-sm shrink-0"
        >
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
