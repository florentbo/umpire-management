import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
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
  value = '', // Default to empty string
  onValueChange, 
  className 
}: RadioGroupCustomProps) {
  // Color mapping for different scores/values
  const getOptionColor = (option: RadioOption) => {
    if (option.score < 0) {
      return 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 data-[state=checked]:bg-red-500 data-[state=checked]:text-white data-[state=checked]:border-red-500';
    } else if (option.score === 0) {
      return 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white data-[state=checked]:border-orange-500';
    } else if (option.score === 1) {
      return 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-white data-[state=checked]:border-yellow-500';
    } else if (option.score === 2) {
      return 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 data-[state=checked]:bg-green-500 data-[state=checked]:text-white data-[state=checked]:border-green-500';
    } else {
      return 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white data-[state=checked]:border-blue-500';
    }
  };

  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      value={value}
      onValueChange={onValueChange}
    >
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <RadioGroupPrimitive.Item
            value={option.value}
            id={option.value}
            className={cn(
              'aspect-square h-4 w-4 rounded-full border-2 text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              getOptionColor(option)
            )}
          >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-current" />
            </RadioGroupPrimitive.Indicator>
          </RadioGroupPrimitive.Item>
          <label
            htmlFor={option.value}
            className={cn(
              'flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer px-3 py-2 rounded-md border-2 transition-all duration-200',
              getOptionColor(option)
            )}
          >
            <span className="flex justify-between items-center">
              <span>{option.label}</span>
              <span className="text-xs font-bold">
                {option.score > 0 ? '+' : ''}{option.score}
              </span>
            </span>
          </label>
        </div>
      ))}
    </RadioGroupPrimitive.Root>
  );
}