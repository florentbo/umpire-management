import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroupCustom } from '@/components/ui/radio-group-custom';

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
}

export function AssessmentSection({ title, criteria, maxScore, currentScore }: AssessmentSectionProps) {
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
      </CardContent>
    </Card>
  );
}