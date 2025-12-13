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
    <div className={`mb-4 ${className}`}>
      <label
        className="block text-sm font-medium mb-2"
        style={{ color: Colors.textSecondary }}
      >
        {label}
      </label>
      <div
        className="flex items-center rounded-lg border transition-all"
        style={{
          backgroundColor: Colors.backgroundTertiary,
          borderColor: error ? Colors.error : Colors.border,
        }}
      >
        {icon && (
          <span className="text-lg ml-4">{icon}</span>
        )}
        <InputElement
          className={`flex-1 px-4 py-3 text-base bg-transparent border-0 outline-none ${
            multiline ? 'min-h-[100px] align-top pt-3' : ''
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
          className="text-xs font-medium mt-1.5 ml-1"
          style={{ color: Colors.error }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
