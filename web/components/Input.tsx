'use client';

import React from 'react';

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
  const InputElement = multiline ? 'textarea' : 'input';
  const isNumeric = type === 'number';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onChangeText) onChangeText(e.target.value);
    if (onChange) onChange(e);
  };

  return (
    <div className={className}>
      {label && <label className="mlabel block mb-2">{label}</label>}
      <InputElement
        className={`field ${isNumeric ? 'field-mono' : ''} ${error ? 'field-error' : ''} ${
          multiline ? 'min-h-[120px] resize-none' : ''
        }`}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        type={!multiline ? type : undefined}
        {...(rest as React.InputHTMLAttributes<HTMLInputElement> &
          React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
      {error && (
        <p className="font-mono text-xs mt-2 text-chop">{error}</p>
      )}
    </div>
  );
}
