'use client';

import React from 'react';
import { Colors } from '../constants/colors';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  onPress?: () => void;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'text';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: string;
  children?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  icon,
  children,
  ...rest
}: ButtonProps) {
  const handleClick = () => {
    if (onPress) onPress();
    if (onClick) onClick();
  };

  const getStyles = () => {
    if (disabled) {
      return {
        backgroundColor: Colors.gray200,
        color: Colors.textMuted,
        border: `2px solid ${Colors.gray200}`,
        cursor: 'not-allowed',
      };
    }

    switch (variant) {
      case 'success':
        return {
          backgroundColor: Colors.success,
          color: Colors.white,
          border: `2px solid ${Colors.success}`,
        };
      case 'danger':
        return {
          backgroundColor: Colors.error,
          color: Colors.white,
          border: `2px solid ${Colors.error}`,
        };
      case 'secondary':
        return {
          backgroundColor: Colors.white,
          color: Colors.text,
          border: `2px solid ${Colors.border}`,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          color: Colors.primary,
          border: 'none',
        };
      default:
        return {
          backgroundColor: Colors.primary,
          color: Colors.white,
          border: `2px solid ${Colors.primary}`,
        };
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`rounded-lg px-8 py-3 font-semibold text-base transition-all disabled:cursor-not-allowed ${className}`}
      style={getStyles()}
      onMouseEnter={(e) => {
        if (!disabled && variant !== 'text') {
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = Colors.primaryHover;
          } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = Colors.backgroundSecondary;
            e.currentTarget.style.borderColor = Colors.primary;
          } else {
            e.currentTarget.style.opacity = '0.9';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          const styles = getStyles();
          e.currentTarget.style.backgroundColor = styles.backgroundColor;
          e.currentTarget.style.borderColor = styles.border?.split(' ')[2] || '';
          e.currentTarget.style.opacity = '1';
        }
      }}
      {...rest}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          {children || title}
        </div>
      )}
    </button>
  );
}
