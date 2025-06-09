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

export function RadioGroupCustom({ 
  options, 
  value, 
  onValueChange, 
  className 
}: RadioGroupCustomProps) {
  const getOptionColor = (optionValue: string, score: number) => {
    if (optionValue === 'NOT_OK') {
      return 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100';
    }
    if (optionValue === 'OK') {
      return 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100';
    }
    if (optionValue === 'PARTIALLY_OK') {
      return 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100';
    }
    if (optionValue === 'TO_BE_DONE') {
      return 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100';
    }
    return 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100';
  };

  const getSelectedColor = (optionValue: string, score: number) => {
    if (optionValue === 'NOT_OK') {
      return 'border-red-500 bg-red-100 text-red-800 ring-2 ring-red-200';
    }
    if (optionValue === 'OK') {
      return 'border-green-500 bg-green-100 text-green-800 ring-2 ring-green-200';
    }
    if (optionValue === 'PARTIALLY_OK') {
      return 'border-yellow-500 bg-yellow-100 text-yellow-800 ring-2 ring-yellow-200';
    }
    if (optionValue === 'TO_BE_DONE') {
      return 'border-blue-500 bg-blue-100 text-blue-800 ring-2 ring-blue-200';
    }
    return 'border-gray-500 bg-gray-100 text-gray-800 ring-2 ring-gray-200';
  };

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {options.map((option) => {
        const isSelected = value === option.value;
        const baseColors = getOptionColor(option.value, option.score);
        const selectedColors = getSelectedColor(option.value, option.score);
        
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onValueChange(option.value)}
            className={cn(
              "relative flex items-center justify-center p-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
              isSelected ? selectedColors : baseColors
            )}
          >
            <span className="text-center">
              {option.label}
              <span className="block text-xs opacity-75 mt-1">
                ({option.score > 0 ? '+' : ''}{option.score} pt{Math.abs(option.score) !== 1 ? 's' : ''})
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}