import React from 'react';
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
  const InputElement = multiline ? 'textarea' : 'input';

  return (
    <div className={`mb-5 ${className}`}>
      <label
        className="block text-[15px] font-semibold tracking-wide mb-2.5"
        style={{ color: Colors.textSecondary }}
      >
        {label}
      </label>
      <div
        className={`flex items-center rounded-2xl border-2 transition-all ${
          error ? '' : ''
        }`}
        style={{
          backgroundColor: Colors.card,
          borderColor: error ? Colors.error : Colors.border,
          boxShadow: `0 4px 8px ${Colors.primary}1A`,
        }}
      >
        {icon && (
          <span className="text-xl ml-4.5">{icon}</span>
        )}
        <InputElement
          className={`flex-1 px-4.5 py-4 text-base font-medium bg-transparent border-0 outline-none ${
            multiline ? 'min-h-[100px] align-top pt-4' : ''
          } ${icon ? 'pl-2' : ''}`}
          style={{
            color: Colors.text,
          }}
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={placeholder}
          type={!multiline ? type : undefined}
        />
      </div>
      {error && (
        <p
          className="text-[13px] font-semibold mt-1.5 ml-1"
          style={{ color: Colors.error }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
