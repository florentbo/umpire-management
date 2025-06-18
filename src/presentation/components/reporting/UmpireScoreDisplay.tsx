import { GradeBadge } from './GradeBadge';

interface UmpireScoreDisplayProps {
  name: string;
  totalScore: number;
  maxScore: number;
  level: string;
}

export function UmpireScoreDisplay({ name, totalScore, maxScore, level }: UmpireScoreDisplayProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-700 truncate">
          {name}
        </div>
        <div className="text-lg font-bold text-blue-600">
          {totalScore}/{maxScore}
        </div>
      </div>
      <GradeBadge level={level} />
    </div>
  );
}