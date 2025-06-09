import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

interface RadioGroupCustomProps {
  options: Array<{
    value: string;
    label: string;
    score: number;
  }>;
  value?: string;
  onValueChange: (value: string) => void;
}

export function RadioGroupCustom({ options, value, onValueChange }: RadioGroupCustomProps) {
  const getOptionColor = (optionValue: string) => {
    switch (optionValue) {
      case 'NOT_OK':
        return 'text-red-600 border-red-300 hover:border-red-400';
      case 'OK':
        return 'text-green-600 border-green-300 hover:border-green-400';
      case 'PARTIALLY_OK':
        return 'text-yellow-600 border-yellow-300 hover:border-yellow-400';
      case 'TO_BE_DONE':
        return 'text-blue-600 border-blue-300 hover:border-blue-400';
      default:
        return 'text-gray-600 border-gray-300 hover:border-gray-400';
    }
  };

  return (
    <RadioGroup value={value} onValueChange={onValueChange} className="flex flex-wrap gap-3">
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <RadioGroupItem
            value={option.value}
            id={option.value}
            className={cn(
              'transition-colors duration-200',
              getOptionColor(option.value)
            )}
          />
          <label
            htmlFor={option.value}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer transition-colors duration-200',
              getOptionColor(option.value)
            )}
          >
            {option.label} ({option.score > 0 ? '+' : ''}{option.score})
          </label>
        </div>
      ))}
    </RadioGroup>
  );
}