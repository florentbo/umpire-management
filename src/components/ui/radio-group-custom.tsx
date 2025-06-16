import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const RadioGroupCustom = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
    options: Array<{
      value: string;
      label: string;
      score: number;
    }>;
    disabled?: boolean;
  }
>(({ className, options, disabled = false, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    >
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupPrimitive.Item
              value={option.value}
              id={option.value}
              disabled={disabled}
              className={cn(
                'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                disabled && 'bg-gray-100'
              )}
            >
              <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                <Circle className="h-2.5 w-2.5 fill-current text-current" />
              </RadioGroupPrimitive.Indicator>
            </RadioGroupPrimitive.Item>
            <label
              htmlFor={option.value}
              className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                disabled && 'cursor-not-allowed opacity-70'
              )}
            >
              {option.label} ({option.score > 0 ? '+' : ''}{option.score})
            </label>
          </div>
        ))}
      </div>
    </RadioGroupPrimitive.Root>
  );
});

RadioGroupCustom.displayName = 'RadioGroupCustom';

export { RadioGroupCustom };