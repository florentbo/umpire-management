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
  disabled?: boolean;
}

export function RadioGroupCustom({
  options,
  value,
  onValueChange,
  className,
  disabled = false
}: RadioGroupCustomProps) {

  const getOptionColors = (optionValue: string, isSelected: boolean) => {
    switch (optionValue) {
      case 'NOT_OK':
        return {
          border: isSelected ? 'border-red-500 ring-1 ring-red-500' : 'border-red-200 hover:border-red-300',
          background: isSelected ? 'bg-red-50' : 'hover:bg-red-25',
          radio: isSelected ? 'border-red-500 bg-red-500' : 'border-red-300',
          text: isSelected ? 'text-red-900' : 'text-red-700'
        };
      case 'OK':
        return {
          border: isSelected ? 'border-green-500 ring-1 ring-green-500' : 'border-green-200 hover:border-green-300',
          background: isSelected ? 'bg-green-50' : 'hover:bg-green-25',
          radio: isSelected ? 'border-green-500 bg-green-500' : 'border-green-300',
          text: isSelected ? 'text-green-900' : 'text-green-700'
        };
      case 'PARTIALLY_OK':
      case 'PARTIAL':
      case 'TO_BE_DONE':
        return {
          border: isSelected ? 'border-amber-500 ring-1 ring-amber-500' : 'border-amber-200 hover:border-amber-300',
          background: isSelected ? 'bg-amber-50' : 'hover:bg-amber-25',
          radio: isSelected ? 'border-amber-500 bg-amber-500' : 'border-amber-300',
          text: isSelected ? 'text-amber-900' : 'text-amber-700'
        };
      default:
        return {
          border: isSelected ? 'border-gray-500 ring-1 ring-gray-500' : 'border-gray-200 hover:border-gray-300',
          background: isSelected ? 'bg-gray-50' : 'hover:bg-gray-25',
          radio: isSelected ? 'border-gray-500 bg-gray-500' : 'border-gray-300',
          text: isSelected ? 'text-gray-900' : 'text-gray-700'
        };
    }
  };

  return (
    <div className={cn("grid grid-cols-1 gap-2", className)}>
      {options.map((option) => {
        const isSelected = value === option.value;
        const colors = getOptionColors(option.value, isSelected);

        return (
          <label
            key={option.value}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg border transition-all",
              colors.border,
              colors.background,
              disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            )}
          >
            <input
              type="radio"
              value={option.value}
              checked={isSelected}
              onChange={(e) => !disabled && onValueChange(e.target.value)}
              className="sr-only"
              disabled={disabled}
            />
            <div className={cn(
              "w-4 h-4 rounded-full border-2 flex items-center justify-center",
              colors.radio
            )}>
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
            <div className="flex-1 flex items-center justify-between">
              <span className={cn(
                "text-sm font-medium",
                colors.text
              )}>
                {option.label}
              </span>
              <span className={cn(
                "text-xs font-semibold px-2 py-1 rounded",
                option.value === 'NOT_OK' ? 'bg-red-100 text-red-700' :
                option.value === 'OK' ? 'bg-green-100 text-green-700' :
                'bg-amber-100 text-amber-700'
              )}>
                {option.score > 0 ? '+' : ''}{option.score}
              </span>
            </div>
          </label>
        );
      })}
    </div>
  );
}