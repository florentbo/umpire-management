import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroupCustom } from '@/components/ui/radio-group-custom';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';

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
  readOnly?: boolean;
  topicName?: string; // Add topicName prop
}

export function AssessmentSection({ 
  title, 
  criteria, 
  maxScore, 
  currentScore, 
  hasRemarks = false,
  remarks = '',
  onRemarksChange,
  readOnly = false,
  topicName
}: AssessmentSectionProps) {
  const { t } = useTranslation('common');

  return (
    <Card className={`w-full ${readOnly ? 'border-green-100 bg-green-25' : ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex justify-between items-center text-lg">
          <span className="flex items-center space-x-2">
            {readOnly && <Eye className="h-4 w-4 text-green-600" />}
            <span>{title}</span>
          </span>
          <span className="text-sm font-normal">
            {t('labels.score')}: <span className="font-bold text-blue-600">{currentScore}/{maxScore}</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {criteria.map((criterion) => (
          <div key={criterion.id} className="space-y-3 w-full">
            <h4 className="font-medium text-sm text-gray-700">{criterion.label}</h4>
            <RadioGroupCustom
              options={criterion.options}
              value={criterion.value}
              onValueChange={readOnly ? () => {} : criterion.onValueChange}
              className="w-full"
              disabled={readOnly}
            />
          </div>
        ))}
        
        {hasRemarks && (
          <div className="space-y-3 pt-4 border-t border-gray-100 w-full">
            <Label htmlFor={`remarks-${title.toLowerCase().replace(/\s+/g, '-')}`} className="font-medium text-sm text-gray-700">
              {t('labels.remarks')}
            </Label>
            <Textarea
              id={`remarks-${title.toLowerCase().replace(/\s+/g, '-')}`}
              placeholder={readOnly ? '' : t('labels.remarksPlaceholder')}
              value={remarks}
              onChange={readOnly ? undefined : (e) => onRemarksChange?.(e.target.value)}
              className={`min-h-[80px] resize-none w-full ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              readOnly={readOnly}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}