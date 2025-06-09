import React from 'react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  score: number;
}

interface RadioGroupCustomProps {
  options: Option[];
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function RadioGroupCustom({ options, value, onValueChange, className }: RadioGroupCustomProps) {
  const getOptionStyles = (option: Option, isSelected: boolean) => {
    // Consistent color scheme based on option value
    const baseStyles = "flex-1 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer text-center font-medium";
    
    if (option.value === 'NOT_OK') {
      // Always red for "Not OK"
      return cn(
        baseStyles,
        isSelected 
          ? "bg-red-500 border-red-500 text-white shadow-lg" 
          : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
      );
    } else if (option.value === 'OK') {
      // Always green for "OK"
      return cn(
        baseStyles,
        isSelected 
          ? "bg-green-500 border-green-500 text-white shadow-lg" 
          : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
      );
    } else if (option.value === 'PARTIALLY_OK') {
      // Yellow for "Partially OK" (middle option)
      return cn(
        baseStyles,
        isSelected 
          ? "bg-yellow-500 border-yellow-500 text-white shadow-lg" 
          : "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 hover:border-yellow-300"
      );
    } else {
      // Blue for "To be done" (highest score)
      return cn(
        baseStyles,
        isSelected 
          ? "bg-blue-500 border-blue-500 text-white shadow-lg" 
          : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
      );
    }
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {options.map((option) => {
        const isSelected = value === option.value;
        
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onValueChange(option.value)}
            className={getOptionStyles(option, isSelected)}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-sm">{option.label}</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                isSelected ? "bg-white/20" : "bg-black/10"
              )}>
                {option.score > 0 ? `+${option.score}` : option.score}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}