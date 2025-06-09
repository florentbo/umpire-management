import React from 'react';
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
}

export function RadioGroupCustom({ options, value, onValueChange, className }: RadioGroupCustomProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
            value === option.value
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          )}
        >
          <input
            type="radio"
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onValueChange(e.target.value)}
            className="sr-only"
          />
          <div
            className={cn(
              "w-4 h-4 rounded-full border-2 flex items-center justify-center",
              value === option.value
                ? "border-blue-500 bg-blue-500"
                : "border-gray-300"
            )}
          >
            {value === option.value && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>
          <span className="flex-1 text-sm font-medium">{option.label}</span>
          <span className={cn(
            "text-sm font-bold px-2 py-1 rounded",
            option.score >= 0 ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
          )}>
            {option.score > 0 ? '+' : ''}{option.score}
          </span>
        </label>
      ))}
    </div>
  );
}