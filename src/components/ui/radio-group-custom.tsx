import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RadioOption {
  value: string;
  label: string;
  score: number;
}

interface RadioGroupCustomProps {
  options: RadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const RadioGroupCustom = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupCustomProps
>(({ className, options, value, onValueChange, disabled = false, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      value={value}
      onValueChange={disabled ? undefined : onValueChange}
      ref={ref}
      {...props}
    >
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <RadioGroupPrimitive.Item
            value={option.value}
            id={option.value}
            className={cn(
              'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            disabled={disabled}
          >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
              <Circle className="h-2.5 w-2.5 fill-current text-current" />
            </RadioGroupPrimitive.Indicator>
          </RadioGroupPrimitive.Item>
          <label
            htmlFor={option.value}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center space-x-2',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span>{option.label}</span>
            <span className="text-xs text-gray-500">({option.score > 0 ? '+' : ''}{option.score})</span>
          </label>
        </div>
      ))}
    </RadioGroupPrimitive.Root>
  );
});

RadioGroupCustom.displayName = 'RadioGroupCustom';

export { RadioGroupCustom };