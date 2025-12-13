'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Colors } from '../constants/colors';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  error?: string;
  className?: string;
  icon?: string;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  type = 'text',
  multiline = false,
  error,
  className = '',
  icon,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const InputElement = multiline ? 'textarea' : 'input';

  const containerStyle = {
    backgroundColor: Colors.glassBackground,
    borderColor: error ? Colors.error : (isFocused ? Colors.primary : Colors.glassBorder),
    boxShadow: isFocused && !error
      ? `0 0 20px ${Colors.primaryGlow}, inset 0 0 10px ${Colors.primaryGlow}`
      : error
      ? `0 0 20px ${Colors.error}40`
      : 'none',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  };

  return (
    <motion.div
      className={`mb-4 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <motion.label
        className="block text-sm font-semibold mb-3"
        style={{ color: isFocused ? Colors.primary : Colors.textSecondary }}
        animate={{ color: isFocused ? Colors.primary : Colors.textSecondary }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.label>
      <motion.div
        className="flex items-center rounded-xl border-2 transition-all relative overflow-hidden"
        style={containerStyle}
        animate={{
          borderColor: error ? Colors.error : (isFocused ? Colors.primary : Colors.glassBorder),
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Cyber scan line on focus */}
        {isFocused && !error && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-10 pointer-events-none"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'linear'
            }}
          />
        )}

        {icon && (
          <motion.span
            className="text-xl ml-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          >
            {icon}
          </motion.span>
        )}
        <InputElement
          className={`flex-1 px-4 py-3.5 text-base bg-transparent border-0 outline-none placeholder:text-opacity-40 ${
            multiline ? 'min-h-[120px] align-top pt-3 resize-none' : ''
          } ${icon ? 'pl-2' : ''}`}
          style={{
            color: Colors.text,
          }}
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          type={!multiline ? type : undefined}
        />
      </motion.div>
      {error && (
        <motion.p
          className="text-sm font-medium mt-2 ml-1 flex items-center gap-1"
          style={{ color: Colors.error }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <span>⚠</span>
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
