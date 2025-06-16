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
    const baseColors = {
      'NOT_OK': {
        border: 'border-red-200',
        hoverBorder: 'hover:border-red-300',
        selectedBorder: 'border-red-500 ring-1 ring-red-500',
        background: 'hover:bg-red-25',
        selectedBackground: 'bg-red-50',
        radio: 'border-red-300',
        selectedRadio: 'border-red-500 bg-red-500',
        text: 'text-red-700',
        selectedText: 'text-red-900'
      },
      'OK': {
        border: 'border-green-200',
        hoverBorder: 'hover:border-green-300',
        selectedBorder: 'border-green-500 ring-1 ring-green-500',
        background: 'hover:bg-green-25',
        selectedBackground: 'bg-green-50',
        radio: 'border-green-300',
        selectedRadio: 'border-green-500 bg-green-500',
        text: 'text-green-700',
        selectedText: 'text-green-900'
      },
      'PARTIAL': {
        border: 'border-amber-200',
        hoverBorder: 'hover:border-amber-300',
        selectedBorder: 'border-amber-500 ring-1 ring-amber-500',
        background: 'hover:bg-amber-25',
        selectedBackground: 'bg-amber-50',
        radio: 'border-amber-300',
        selectedRadio: 'border-amber-500 bg-amber-500',
        text: 'text-amber-700',
        selectedText: 'text-amber-900'
      },
      'PARTIALLY_OK': {
        border: 'border-amber-200',
        hoverBorder: 'hover:border-amber-300',
        selectedBorder: 'border-amber-500 ring-1 ring-amber-500',
        background: 'hover:bg-amber-25',
        selectedBackground: 'bg-amber-50',
        radio: 'border-amber-300',
        selectedRadio: 'border-amber-500 bg-amber-500',
        text: 'text-amber-700',
        selectedText: 'text-amber-900'
      },
      'TO_BE_DONE': {
        border: 'border-amber-200',
        hoverBorder: 'hover:border-amber-300',
        selectedBorder: 'border-amber-500 ring-1 ring-amber-500',
        background: 'hover:bg-amber-25',
        selectedBackground: 'bg-amber-50',
        radio: 'border-amber-300',
        selectedRadio: 'border-amber-500 bg-amber-500',
        text: 'text-amber-700',
        selectedText: 'text-amber-900'
      }
    };

    const colors = baseColors[optionValue as keyof typeof baseColors] || {
      border: 'border-gray-200',
      hoverBorder: 'hover:border-gray-300',
      selectedBorder: 'border-gray-500 ring-1 ring-gray-500',
      background: 'hover:bg-gray-25',
      selectedBackground: 'bg-gray-50',
      radio: 'border-gray-300',
      selectedRadio: 'border-gray-500 bg-gray-500',
      text: 'text-gray-700',
      selectedText: 'text-gray-900'
    };

    if (disabled) {
      return {
        border: isSelected ? colors.selectedBorder : colors.border,
        background: isSelected ? colors.selectedBackground : '',
        radio: isSelected ? colors.selectedRadio : colors.radio,
        text: isSelected ? colors.selectedText : colors.text,
        opacity: 'opacity-60',
        cursor: 'cursor-not-allowed'
      };
    }

    return {
      border: isSelected ? colors.selectedBorder : `${colors.border} ${colors.hoverBorder}`,
      background: isSelected ? colors.selectedBackground : colors.background,
      radio: isSelected ? colors.selectedRadio : colors.radio,
      text: isSelected ? colors.selectedText : colors.text,
      opacity: '',
      cursor: 'cursor-pointer'
    };
  };

  const handleOptionClick = (optionValue: string) => {
    if (!disabled) {
      onValueChange(optionValue);
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
              colors.opacity,
              colors.cursor
            )}
            onClick={() => handleOptionClick(option.value)}
          >
            <input
              type="radio"
              value={option.value}
              checked={isSelected}
              onChange={(e) => {
                if (!disabled) {
                  onValueChange(e.target.value);
                }
              }}
              disabled={disabled}
              className="sr-only"
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