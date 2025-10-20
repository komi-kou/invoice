'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  prefix?: string;
  suffix?: string;
}

export default function NumberInput({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  className = '',
  placeholder,
  required = false,
  disabled = false,
  prefix,
  suffix,
}: NumberInputProps) {
  const handleIncrement = () => {
    const newValue = value + step;
    if (max === undefined || newValue <= max) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = value - step;
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // 空の入力を許可
    if (inputValue === '') {
      onChange(0);
      return;
    }
    
    const numValue = Number(inputValue);
    if (!isNaN(numValue)) {
      if (min !== undefined && numValue < min) {
        onChange(min);
      } else if (max !== undefined && numValue > max) {
        onChange(max);
      } else {
        onChange(numValue);
      }
    }
  };

  const formatDisplay = (val: number) => {
    if (val === 0) return '';
    return val.toLocaleString('ja-JP');
  };

  return (
    <div className={`flex items-center ${className}`}>
      {prefix && (
        <span className="mr-2 text-gray-700">
          {prefix}
        </span>
      )}
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={`absolute left-0 h-full px-2 rounded-l-lg transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 ${disabled || value <= min ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Minus size={14} />
        </button>
        
        <input
          type="text"
          value={formatDisplay(value)}
          onChange={handleInputChange}
          onFocus={(e) => e.target.select()}
          placeholder={placeholder || '0'}
          required={required}
          disabled={disabled}
          className="w-full px-10 py-2 text-center rounded-lg border transition-all bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
          style={{ minWidth: '120px' }}
        />
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && value >= max)}
          className={`absolute right-0 h-full px-2 rounded-r-lg transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 ${disabled || (max !== undefined && value >= max) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Plus size={14} />
        </button>
      </div>
      {suffix && (
        <span className="ml-2 text-gray-700">
          {suffix}
        </span>
      )}
    </div>
  );
}