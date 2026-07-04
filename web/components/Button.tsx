'use client';

import React from 'react';

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

const VARIANT_CLASS: Record<string, string> = {
  primary: 'btn-ink',
  secondary: 'btn-ghost',
  danger: 'btn-chop',
  success: 'btn-paid',
  text: 'btn-text',
};

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

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`btn ${VARIANT_CLASS[variant] ?? 'btn-ink'} ${className}`}
      {...rest}
    >
      {loading ? (
        <span
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-label="Loading"
        />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children || title}
        </>
      )}
    </button>
  );
}
