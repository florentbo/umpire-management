import { Badge } from '@/components/ui/badge';

interface GradeBadgeProps {
  level: string;
  size?: 'sm' | 'md';
}

export function GradeBadge({ level, size = 'sm' }: GradeBadgeProps) {
  const getGradeColor = (level: string) => {
    switch (level) {
      case 'BELOW_EXPECTATION':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'AT_CURRENT_LEVEL':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'ABOVE_EXPECTATION':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getGradeLabel = (level: string) => {
    switch (level) {
      case 'BELOW_EXPECTATION':
        return 'En dessous';
      case 'AT_CURRENT_LEVEL':
        return 'Au niveau';
      case 'ABOVE_EXPECTATION':
        return 'Au-dessus';
      default:
        return level;
    }
  };

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1';

  return (
    <Badge 
      variant="outline" 
      className={`${sizeClass} ${getGradeColor(level)}`}
    >
      {getGradeLabel(level)}
    </Badge>
  );
}