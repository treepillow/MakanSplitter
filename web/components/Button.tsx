import React from 'react';
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
  const getBackgroundColor = () => {
    if (disabled) return Colors.cardHover;
    if (variant === 'text') return 'transparent';
    switch (variant) {
      case 'success':
        return Colors.success;
      case 'danger':
        return Colors.error;
      case 'secondary':
        return Colors.card;
      default:
        return Colors.primary;
    }
  };

  const getTextColor = () => {
    if (variant === 'text') return Colors.primary;
    if (variant === 'secondary') return Colors.text;
    return Colors.white;
  };

  const getBorderStyle = () => {
    if (variant === 'secondary') {
      return `2px solid ${Colors.border}`;
    }
    return 'none';
  };

  return (
    <button
      onClick={onPress}
      disabled={disabled || loading}
      className={`rounded-2xl px-7 py-4.5 min-h-[60px] font-bold text-[17px] tracking-wide transition-opacity hover:opacity-90 disabled:opacity-40 ${className}`}
      style={{
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        border: getBorderStyle(),
        boxShadow: variant !== 'secondary' && !disabled ? `0 8px 12px ${Colors.primary}4D` : 'none',
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <span>{title}</span>
        </div>
      )}
    </button>
  );
}
