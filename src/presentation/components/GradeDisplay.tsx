import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GradeDisplayProps {
  totalScore: number;
  maxScore: number;
  percentage: number;
  level: string;
  umpireName: string;
}

export function GradeDisplay({ totalScore, maxScore, percentage, level, umpireName }: GradeDisplayProps) {
  const getGradeColor = (level: string) => {
    switch (level) {
      case 'BELOW_EXPECTATION':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'AT_CURRENT_LEVEL':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ABOVE_EXPECTATION':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGradeLabel = (level: string) => {
    switch (level) {
      case 'BELOW_EXPECTATION':
        return 'En dessous des attentes';
      case 'AT_CURRENT_LEVEL':
        return 'Au niveau actuel';
      case 'ABOVE_EXPECTATION':
        return 'Au-dessus des attentes';
      default:
        return level;
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">{umpireName}</h3>
            <p className="text-sm text-gray-600">Évaluation finale</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {totalScore}/{maxScore}
            </div>
            <div className="text-sm text-gray-500">
              {percentage.toFixed(1)}%
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Badge className={`px-4 py-2 text-sm font-medium ${getGradeColor(level)}`}>
            {getGradeLabel(level)}
          </Badge>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(totalScore / maxScore) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>{maxScore}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}