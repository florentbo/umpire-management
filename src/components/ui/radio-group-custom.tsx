import * as React from 'react';
import { cn } from '@/lib/utils';

interface RadioOption {
  value: string;
  label: string;
  score: number;
}

interface RadioGroupCustomProps {
  options: RadioOption[];
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean; // New prop for disabled state
}

export function RadioGroupCustom({ 
  options, 
  value, 
  onValueChange, 
  className,
  disabled = false
}: RadioGroupCustomProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-all',
            'hover:border-blue-300 hover:bg-blue-50',
            value === option.value 
              ? 'border-blue-500 bg-blue-100 text-blue-700' 
              : 'border-gray-200 bg-white',
            disabled && 'cursor-not-allowed opacity-60 hover:border-gray-200 hover:bg-white'
          )}
        >
          <input
            type="radio"
            value={option.value}
            checked={value === option.value}
            onChange={(e) => !disabled && onValueChange(e.target.value)}
            className="sr-only"
            disabled={disabled}
          />
          <span className="text-sm font-medium text-center">{option.label}</span>
          <span className={cn(
            'text-xs mt-1 px-2 py-1 rounded-full',
            option.score > 0 
              ? 'bg-green-100 text-green-700' 
              : option.score < 0 
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
          )}>
            {option.score > 0 ? '+' : ''}{option.score}
          </span>
        </label>
      ))}
    </div>
  );
}