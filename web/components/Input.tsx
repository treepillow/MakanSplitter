'use client';

import React, { useState } from 'react';
import { Colors } from '../constants/colors';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  value: string;
  onChangeText?: (text: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
  error,
  className = '',
  icon,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const InputElement = multiline ? 'textarea' : 'input';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onChangeText) {
      onChangeText(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          className="block text-sm font-semibold mb-2"
          style={{ color: isFocused ? Colors.primary : Colors.textSecondary }}
        >
          {label}
        </label>
      )}
      <div
        className="flex items-center rounded-lg border-2 transition-all"
        style={{
          backgroundColor: Colors.white,
          borderColor: error ? Colors.error : (isFocused ? Colors.primary : Colors.border),
        }}
      >
        {icon && (
          <span className="text-xl ml-4">
            {icon}
          </span>
        )}
        <InputElement
          className={`flex-1 px-4 py-3 text-base bg-transparent border-0 outline-none placeholder:opacity-50 ${
            multiline ? 'min-h-[120px] align-top pt-3 resize-none' : ''
          } ${icon ? 'pl-2' : ''}`}
          style={{
            color: Colors.text,
          }}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          type={!multiline ? type : undefined}
          {...(rest as any)}
        />
      </div>
      {error && (
        <p
          className="text-sm font-medium mt-2 ml-1"
          style={{ color: Colors.error }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
