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
  const getOptionColor = (option: RadioOption, isSelected: boolean) => {
    if (!isSelected) {
      return "border-gray-200 hover:border-gray-300";
    }
    
    // Color based on option value
    if (option.value === 'PARTIALLY_OK') {
      return "border-yellow-500 bg-yellow-50";
    } else if (option.score >= 0) {
      return "border-green-500 bg-green-50";
    } else {
      return "border-red-500 bg-red-50";
    }
  };

  const getScoreColor = (score: number, value: string) => {
    if (value === 'PARTIALLY_OK') {
      return "text-yellow-700 bg-yellow-100";
    } else if (score >= 0) {
      return "text-green-600 bg-green-100";
    } else {
      return "text-red-600 bg-red-100";
    }
  };

  const getRadioColor = (option: RadioOption, isSelected: boolean) => {
    if (!isSelected) {
      return "border-gray-300";
    }
    
    if (option.value === 'PARTIALLY_OK') {
      return "border-yellow-500 bg-yellow-500";
    } else if (option.score >= 0) {
      return "border-green-500 bg-green-500";
    } else {
      return "border-red-500 bg-red-500";
    }
  };

  return (
    <div className={cn("space-y-2 w-full", className)}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <label
            key={option.value}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all w-full",
              getOptionColor(option, isSelected)
            )}
          >
            <input
              type="radio"
              value={option.value}
              checked={isSelected}
              onChange={(e) => onValueChange(e.target.value)}
              className="sr-only"
            />
            <div
              className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                getRadioColor(option, isSelected)
              )}
            >
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
            <span className="flex-1 text-sm font-medium">{option.label}</span>
            <span className={cn(
              "text-sm font-bold px-2 py-1 rounded flex-shrink-0",
              getScoreColor(option.score, option.value)
            )}>
              {option.score > 0 ? '+' : ''}{option.score}
            </span>
          </label>
        );
      })}
    </div>
  );
}