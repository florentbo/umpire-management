import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroupCustom } from '@/components/ui/radio-group-custom';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AssessmentSectionProps {
  title: string;
  criteria: Array<{
    id: string;
    label: string;
    options: Array<{
      value: string;
      label: string;
      score: number;
    }>;
    value?: string;
    onValueChange: (value: string) => void;
  }>;
  maxScore: number;
  currentScore: number;
  hasRemarks?: boolean;
  remarks?: string;
  onRemarksChange?: (remarks: string) => void;
}

export function AssessmentSection({ 
  title, 
  criteria, 
  maxScore, 
  currentScore, 
  hasRemarks = false,
  remarks = '',
  onRemarksChange 
}: AssessmentSectionProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex justify-between items-center text-lg">
          <span>{title}</span>
          <span className="text-sm font-normal">
            Score: <span className="font-bold text-blue-600">{currentScore}/{maxScore}</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {criteria.map((criterion) => (
          <div key={criterion.id} className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">{criterion.label}</h4>
            <RadioGroupCustom
              options={criterion.options}
              value={criterion.value}
              onValueChange={criterion.onValueChange}
            />
          </div>
        ))}
        
        {hasRemarks && (
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <Label htmlFor={`remarks-${title.toLowerCase().replace(/\s+/g, '-')}`} className="font-medium text-sm text-gray-700">
              Additional Remarks
            </Label>
            <Textarea
              id={`remarks-${title.toLowerCase().replace(/\s+/g, '-')}`}
              placeholder="Add any additional comments or observations..."
              value={remarks}
              onChange={(e) => onRemarksChange?.(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}