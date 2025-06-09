import { AssessmentCriteria } from '@/types';
import { AssessmentSection } from './AssessmentSection';
import { assessmentConfig, getSectionMaxScore } from '@/config/assessmentConfig';
import { useTranslation } from 'react-i18next';

interface UmpireAssessmentProps {
  umpireName: string;
  scores: AssessmentCriteria;
  onScoreChange: (field: keyof AssessmentCriteria, value: number) => void;
  selectedValues: Record<keyof AssessmentCriteria, string>;
  onValueChange: (field: keyof AssessmentCriteria, value: string) => void;
}

export function UmpireAssessment({ 
  umpireName, 
  scores, 
  onScoreChange, 
  selectedValues, 
  onValueChange 
}: UmpireAssessmentProps) {
  const { t } = useTranslation(['common', 'assessment']);

  // Map legacy field names to config criterion IDs
  const fieldMapping = {
    arrivalTime: 'arrival-time',
    generalAppearance: 'general-appearance',
    positioningPitch: 'positioning-pitch',
    positioningD: 'positioning-d',
  };

  const getScoreFromValue = (criterionId: string, value: string): number => {
    // Find the criterion in config
    for (const section of assessmentConfig) {
      const criterion = section.criteria.find(c => c.id === criterionId);
      if (criterion) {
        const option = criterion.options.find(opt => opt.value === value);
        return option?.points || 0;
      }
    }
    return 0;
  };

  // Build sections dynamically from config
  const sections = assessmentConfig.map(sectionConfig => {
    const criteria = sectionConfig.criteria.map(criterion => {
      // Find the corresponding legacy field
      const legacyField = Object.entries(fieldMapping).find(([_, id]) => id === criterion.id)?.[0] as keyof AssessmentCriteria;
      
      if (!legacyField) return null;

      return {
        id: criterion.id,
        label: t(`assessment:sections.${sectionConfig.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}.criteria.${criterion.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}.label`),
        options: criterion.options.map(opt => ({
          value: opt.value,
          label: t(`common:optionValues.${opt.value}`),
          score: opt.points, // AssessmentSection expects 'score' property
        })),
        value: selectedValues[legacyField] || '', // Use empty string if no value selected
        onValueChange: (value: string) => {
          onValueChange(legacyField, value);
          const points = getScoreFromValue(criterion.id, value);
          onScoreChange(legacyField, points);
        },
      };
    }).filter(Boolean);

    // Calculate current score for this section
    const currentScore = criteria.reduce((total, criterion) => {
      if (!criterion) return total;
      const legacyField = Object.entries(fieldMapping).find(([_, id]) => id === criterion.id)?.[0] as keyof AssessmentCriteria;
      return total + (legacyField ? scores[legacyField] : 0);
    }, 0);

    const maxScore = getSectionMaxScore(sectionConfig.id);

    return {
      title: t(`assessment:sections.${sectionConfig.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}.title`),
      criteria: criteria.filter(Boolean),
      maxScore,
      currentScore,
      hasRemarks: sectionConfig.hasRemarks,
    };
  });

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  return (
    <div className="space-y-6">
      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
        <h3 className="font-bold text-lg text-gray-800">{umpireName}</h3>
        <p className="text-sm text-gray-600 mt-1">
          {t('common:labels.totalScore')}: 
          <span className="font-bold text-blue-600"> {totalScore}/6</span>
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
    </div>
  );
}