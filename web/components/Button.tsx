'use client';

import { motion } from 'framer-motion';
import { Colors } from '../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'text';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  icon,
}: ButtonProps) {
  const getStyles = () => {
    if (disabled) {
      return {
        backgroundColor: Colors.cardDark,
        color: Colors.textMuted,
        border: `1px solid ${Colors.border}`,
        boxShadow: 'none',
      };
    }

    switch (variant) {
      case 'success':
        return {
          backgroundColor: Colors.success,
          color: Colors.black,
          border: `1px solid ${Colors.success}`,
          boxShadow: 'none',
        };
      case 'danger':
        return {
          backgroundColor: Colors.error,
          color: Colors.white,
          border: `1px solid ${Colors.error}`,
          boxShadow: 'none',
        };
      case 'secondary':
        return {
          backgroundColor: Colors.glassBackground,
          color: Colors.text,
          border: `1px solid ${Colors.glassBorder}`,
          boxShadow: 'none',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          color: Colors.primary,
          border: 'none',
          boxShadow: 'none',
        };
      default:
        return {
          backgroundColor: Colors.primary,
          color: Colors.black,
          border: `1px solid ${Colors.primary}`,
          boxShadow: 'none',
        };
    }
  };

  const getHoverStyles = () => {
    if (disabled || variant === 'text') return {};

    switch (variant) {
      case 'success':
        return {
          opacity: 0.9,
        };
      case 'danger':
        return {
          opacity: 0.9,
        };
      case 'secondary':
        return {
          backgroundColor: Colors.cardHover,
          borderColor: Colors.borderLight,
        };
      default:
        return {
          opacity: 0.9,
        };
    }
  };

  return (
    <motion.button
      onClick={onPress}
      disabled={disabled || loading}
      className={`rounded-xl px-8 py-4 font-semibold text-base transition-all disabled:cursor-not-allowed relative overflow-hidden ${className}`}
      style={getStyles()}
      whileHover={disabled ? {} : { scale: 1.02, ...getHoverStyles() }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Cyber scan line effect (only for primary buttons) */}
      {!disabled && variant === 'primary' && !loading && (
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
      )}

      {loading ? (
        <div className="flex items-center justify-center">
          <motion.div
            className="w-6 h-6 border-3 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      ) : (
        <motion.div
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {icon && (
            <motion.span
              className="text-xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              {icon}
            </motion.span>
          )}
          <span>{title}</span>
        </motion.div>
      )}
    </motion.button>
  );
}
