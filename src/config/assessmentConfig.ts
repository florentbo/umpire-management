import { AssessmentSection, AssessmentCriteria } from '@/types';

export const assessmentConfig: AssessmentSection[] = [
  {
    id: 'before-after-game',
    title: 'Before & After the Game',
    hasRemarks: true,
    criteria: [
      {
        id: 'arrival-time',
        questionId: 'q1-arrival-time',
        label: 'Arrival Time (Minimum 1 hour before game)',
        options: [
          { value: 'not_ok', label: 'Not OK (Less than 1 hour)', points: -1 },
          { value: 'ok', label: 'OK (1+ hour early)', points: 1 },
        ],
      },
      {
        id: 'general-appearance',
        questionId: 'q2-general-appearance',
        label: 'General Appearance (Polo, whistle, cards, etc.)',
        options: [
          { value: 'not_ok', label: 'Not OK (Missing items)', points: 0 },
          { value: 'ok', label: 'OK (Complete uniform)', points: 1 },
        ],
      },
    ],
  },
  {
    id: 'positioning',
    title: 'Positioning',
    hasRemarks: true,
    criteria: [
      {
        id: 'positioning-pitch',
        questionId: 'q3-positioning-pitch',
        label: 'Positioning on the Pitch',
        options: [
          { value: 'not_ok', label: 'Not OK', points: 0 },
          { value: 'partially_ok', label: 'Partially OK', points: 1 },
          { value: 'ok', label: 'OK', points: 2 },
        ],
      },
      {
        id: 'positioning-d',
        questionId: 'q4-positioning-d',
        label: 'Positioning in the D',
        options: [
          { value: 'not_ok', label: 'Not OK', points: 0 },
          { value: 'partially_ok', label: 'Partially OK', points: 1 },
          { value: 'ok', label: 'OK', points: 2 },
        ],
      },
    ],
  },
  {
    id: 'technical-skills',
    title: 'Technical Skills',
    hasRemarks: false,
    criteria: [
      {
        id: 'decision-making',
        questionId: 'q5-decision-making',
        label: 'Decision Making',
        options: [
          { value: 'poor', label: 'Poor', points: 0 },
          { value: 'fair', label: 'Fair', points: 1 },
          { value: 'good', label: 'Good', points: 2 },
          { value: 'excellent', label: 'Excellent', points: 3 },
        ],
      },
      {
        id: 'communication',
        questionId: 'q6-communication',
        label: 'Communication with Players',
        options: [
          { value: 'poor', label: 'Poor', points: 0 },
          { value: 'fair', label: 'Fair', points: 1 },
          { value: 'good', label: 'Good', points: 2 },
          { value: 'excellent', label: 'Excellent', points: 3 },
        ],
      },
    ],
  },
];

// Helper function to get max score for a section
export const getSectionMaxScore = (sectionId: string): number => {
  const section = assessmentConfig.find(s => s.id === sectionId);
  if (!section) return 0;
  
  return section.criteria.reduce((total, criterion) => {
    const maxPoints = Math.max(...criterion.options.map(opt => opt.points));
    return total + maxPoints;
  }, 0);
};

// Helper function to get total max score
export const getTotalMaxScore = (): number => {
  return assessmentConfig.reduce((total, section) => {
    return total + getSectionMaxScore(section.id);
  }, 0);
};