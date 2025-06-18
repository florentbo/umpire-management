import { AssessmentSection } from './AssessmentSection';
import { useQuery } from '@tanstack/react-query';
import { useAssessmentConfig } from '@/lib/api-client';
import { AssessmentConfig } from '../../../dist/api';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Loader2, Eye } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UmpireAssessmentProps {
  umpireName: string;
  scores: Record<string, number>;
  onScoreChange: (field: string, value: number) => void;
  selectedValues: Record<string, string>;
  onValueChange: (field: string, value: string) => void;
  conclusion: string;
  onConclusionChange: (conclusion: string) => void;
  readOnly?: boolean;
  // Add remarks props
  remarks?: Record<string, string>;
  onRemarksChange?: (topicName: string, remarks: string) => void;
}

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
  onConclusionChange,
  readOnly = false,
  remarks = {},
  onRemarksChange
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
    const criteria = topic.questions.map(question => ({
      id: question.id,
      label: question.text,
      options: question.answerPoints.map(ap => ({
        value: ap.value,
        label: t(`common:optionValues.${ap.value}`),
        score: ap.points,
      })),
      value: selectedValues[question.id] || '',
      onValueChange: readOnly ? () => {} : (value: string) => {
        onValueChange(question.id, value);
        const points = getScoreFromValue(question.id, value);
        onScoreChange(question.id, points);
      },
    }));

    // Calculate current score for this section
    const currentScore = criteria.reduce((total, criterion) => {
      return total + (scores[criterion.id] || 0);
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
      topicName: topic.name,
    };
  });

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const maxTotalScore = sections.reduce((sum, section) => sum + section.maxScore, 0);

  return (
    <Card className={`w-full ${readOnly ? 'border-green-200 bg-green-50' : ''}`}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center space-x-2">
            {readOnly && <Eye className="h-5 w-5 text-green-600" />}
            <span>{umpireName}</span>
            {readOnly && <span className="text-sm font-normal text-green-600">(Lecture seule)</span>}
          </span>
          <span className="text-sm font-normal">
            {t('common:labels.totalScore')}: <span className="font-bold text-blue-600">{totalScore}/{maxTotalScore}</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section) => (
          <AssessmentSection
            key={section.title}
            title={section.title}
            criteria={section.criteria}
            maxScore={section.maxScore}
            currentScore={section.currentScore}
            hasRemarks={section.hasRemarks}
            remarks={remarks[section.topicName] || ''}
            onRemarksChange={readOnly ? undefined : (newRemarks) => onRemarksChange?.(section.topicName, newRemarks)}
            readOnly={readOnly}
          />
        ))}
        
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h4 className="font-medium text-sm text-gray-700">{t('common:labels.conclusion')}</h4>
          <Textarea
            placeholder={readOnly ? '' : t('common:labels.conclusionPlaceholder')}
            value={conclusion}
            onChange={readOnly ? undefined : (e) => onConclusionChange(e.target.value)}
            className={`min-h-[100px] resize-none ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            readOnly={readOnly}
          />
        </div>
      </CardContent>
    </Card>
  );
}