import { GradeBadge } from './GradeBadge';

interface UmpireScoreDisplayProps {
  name: string;  
  level: string;
}

export function UmpireScoreDisplay({ name, level }: UmpireScoreDisplayProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-700 truncate">
          {name}
        </div>        
      </div>
      <GradeBadge level={level} />
    </div>
  );
}