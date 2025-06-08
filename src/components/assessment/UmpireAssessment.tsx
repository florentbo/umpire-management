import React from 'react';
import { AssessmentCriteria } from '@/types';
import { AssessmentSection } from './AssessmentSection';

interface UmpireAssessmentProps {
  umpireName: string;
  scores: AssessmentCriteria;
  onScoreChange: (field: keyof AssessmentCriteria, value: number) => void;
}

const arrivalTimeOptions = [
  { value: 'not_ok', label: 'Not OK (Less than 1 hour)', score: -1 },
  { value: 'ok', label: 'OK (1+ hour early)', score: 1 },
];

const generalAppearanceOptions = [
  { value: 'not_ok', label: 'Not OK (Missing items)', score: 0 },
  { value: 'ok', label: 'OK (Complete uniform)', score: 1 },
];

const positioningOptions = [
  { value: 'not_ok', label: 'Not OK', score: 0 },
  { value: 'partially_ok', label: 'Partially OK', score: 1 },
  { value: 'ok', label: 'OK', score: 2 },
];

export function UmpireAssessment({ umpireName, scores, onScoreChange }: UmpireAssessmentProps) {
  const getValueFromScore = (options: any[], score: number) => {
    const option = options.find(opt => opt.score === score);
    return option?.value || '';
  };

  const getScoreFromValue = (options: any[], value: string) => {
    const option = options.find(opt => opt.value === value);
    return option?.score || 0;
  };

  const section1Criteria = [
    {
      id: 'arrivalTime',
      label: 'Arrival Time (Minimum 1 hour before game)',
      options: arrivalTimeOptions,
      value: getValueFromScore(arrivalTimeOptions, scores.arrivalTime),
      onValueChange: (value: string) => onScoreChange('arrivalTime', getScoreFromValue(arrivalTimeOptions, value)),
    },
    {
      id: 'generalAppearance',
      label: 'General Appearance (Polo, whistle, cards, etc.)',
      options: generalAppearanceOptions,
      value: getValueFromScore(generalAppearanceOptions, scores.generalAppearance),
      onValueChange: (value: string) => onScoreChange('generalAppearance', getScoreFromValue(generalAppearanceOptions, value)),
    },
  ];

  const section2Criteria = [
    {
      id: 'positioningPitch',
      label: 'Positioning on the Pitch',
      options: positioningOptions,
      value: getValueFromScore(positioningOptions, scores.positioningPitch),
      onValueChange: (value: string) => onScoreChange('positioningPitch', getScoreFromValue(positioningOptions, value)),
    },
    {
      id: 'positioningD',
      label: 'Positioning in the D',
      options: positioningOptions,
      value: getValueFromScore(positioningOptions, scores.positioningD),
      onValueChange: (value: string) => onScoreChange('positioningD', getScoreFromValue(positioningOptions, value)),
    },
  ];

  const section1Score = scores.arrivalTime + scores.generalAppearance;
  const section2Score = scores.positioningPitch + scores.positioningD;
  const totalScore = section1Score + section2Score;

  return (
    <div className="space-y-6">
      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
        <h3 className="font-bold text-lg text-gray-800">{umpireName}</h3>
        <p className="text-sm text-gray-600 mt-1">Total Score: <span className="font-bold text-blue-600">{totalScore}/6</span></p>
      </div>
      
      <AssessmentSection
        title="Section 1: Before & After the Game"
        criteria={section1Criteria}
        maxScore={2}
        currentScore={section1Score}
      />
      
      <AssessmentSection
        title="Section 2: Positioning"
        criteria={section2Criteria}
        maxScore={4}
        currentScore={section2Score}
      />
    </div>
  );
}