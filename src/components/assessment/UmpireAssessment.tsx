import { AssessmentCriteria } from '@/types';
import { AssessmentSection } from './AssessmentSection';
import { useQuery } from '@tanstack/react-query';
import { useAssessmentConfig } from '@/lib/api-client';
import { AssessmentConfig } from '../../../dist/api';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UmpireAssessmentProps {
  umpireName: string;
  scores: AssessmentCriteria;
  onScoreChange: (field: keyof AssessmentCriteria, value: number) => void;
  selectedValues: Record<keyof AssessmentCriteria, string>;
  onValueChange: (field: keyof AssessmentCriteria, value: string) => void;
  conclusion: string;
  onConclusionChange: (conclusion: string) => void;
}

// Map legacy field names to config criterion IDs
const FIELD_MAPPING = {
  arrivalTime: 'arrival-time',
  generalAppearance: 'general-appearance',
  positioningPitch: 'positioning-pitch',
  positioningD: 'positioning-d',
} as const;

// Map API topic names to translation keys
const TOPIC_NAME_TO_TRANSLATION_KEY: Record<string, string> = {
  GAME_BEFORE_AND_AFTER: 'beforeAfterGame',
  POSITIONING: 'positioning',
  TECHNICAL: 'technicalSkills',
  GAME_MANAGEMENT: 'gameManagement',
};

export function UmpireAssessment({ 
  umpireName, 
  scores, 
  onScoreChange, 
  selectedValues, 
  onValueChange,
  conclusion,
  onConclusionChange
}: UmpireAssessmentProps) {
  const { t } = useTranslation(['common', 'assessment']);
  const { data: assessmentConfig, isLoading, error } = useQuery(
    useAssessmentConfig(AssessmentConfig.level.JUNIOR)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">{t('common:loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        <AlertCircle className="h-8 w-8" />
        <span className="ml-2">{t('common:errorLoading')}</span>
      </div>
    );
  }

  if (!assessmentConfig) return null;

  const getScoreFromValue = (criterionId: string, value: string): number => {
    for (const topic of assessmentConfig.topics) {
      const question = topic.questions.find(q => q.id === criterionId);
      if (question) {
        const answerPoint = question.answerPoints.find(ap => ap.value === value);
        return answerPoint?.points || 0;
      }
    }
    return 0;
  };

  // Build sections from API data
  const sections = assessmentConfig.topics.map(topic => {
    const criteria = topic.questions.map(question => {
      const legacyField = Object.entries(FIELD_MAPPING).find(([_, id]) => id === question.id)?.[0] as keyof AssessmentCriteria;
      
      if (!legacyField) return null;

      return {
        id: question.id,
        label: question.text,
        options: question.answerPoints.map(ap => ({
          value: ap.value,
          label: t(`common:optionValues.${ap.value}`),
          score: ap.points,
        })),
        value: selectedValues[legacyField] || '',
        onValueChange: (value: string) => {
          onValueChange(legacyField, value);
          const points = getScoreFromValue(question.id, value);
          onScoreChange(legacyField, points);
        },
      };
    }).filter((criterion): criterion is NonNullable<typeof criterion> => criterion !== null);

    // Calculate current score for this section
    const currentScore = criteria.reduce((total, criterion) => {
      const legacyField = Object.entries(FIELD_MAPPING).find(([_, id]) => id === criterion.id)?.[0] as keyof AssessmentCriteria;
      return total + (legacyField ? scores[legacyField] : 0);
    }, 0);

    const maxScore = criteria.reduce((total, criterion) => {
      return total + Math.max(...criterion.options.map(opt => opt.score));
    }, 0);

    return {
      title: t(`assessment:sections.${TOPIC_NAME_TO_TRANSLATION_KEY[topic.name] || topic.name.toLowerCase()}.title`),
      criteria,
      maxScore,
      currentScore,
      hasRemarks: !!topic.remark,
    };
  });

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const maxTotalScore = sections.reduce((sum, section) => sum + section.maxScore, 0);

  return (
    <div className="space-y-6 w-full">
      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border w-full">
        <h3 className="font-bold text-lg text-gray-800">{umpireName}</h3>
        <p className="text-sm text-gray-600 mt-1">
          {t('common:labels.totalScore')}: 
          <span className="font-bold text-blue-600"> {totalScore}/{maxTotalScore}</span>
        </p>
      </div>
      
      {sections.map((section, index) => (
        <AssessmentSection
          key={index}
          title={section.title}
          criteria={section.criteria}
          maxScore={section.maxScore}
          currentScore={section.currentScore}
          hasRemarks={section.hasRemarks}
        />
      ))}

      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            {t('assessment:conclusion.title')} <span className="text-red-500">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="assessment-conclusion"
            placeholder={t('assessment:conclusion.placeholder')}
            value={conclusion}
            onChange={(e) => onConclusionChange(e.target.value)}
            className="min-h-[80px] resize-none w-full"
            required
          />
        </CardContent>
      </Card>
    </div>
  );
}