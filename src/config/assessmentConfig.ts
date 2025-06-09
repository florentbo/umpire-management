import { AssessmentSection, OptionValue } from '@/types';

export const assessmentConfig: AssessmentSection[] = [
  {
    id: 'before-after-game',
    title: {
      en: 'Before & After the Game',
      fr: 'Avant et Après le Match'
    },
    hasRemarks: true,
    criteria: [
      {
        id: 'arrival-time',
        questionId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        label: {
          en: 'Arrival Time (Minimum 1 hour before game)',
          fr: 'Heure d\'arrivée (Minimum 1 heure avant le match)'
        },
        options: [
          { 
            value: OptionValue.NOT_OK, 
            label: { en: 'Not OK', fr: 'Pas OK' }, 
            points: -1 
          },
          { 
            value: OptionValue.OK, 
            label: { en: 'OK', fr: 'OK' }, 
            points: 1 
          },
        ],
      },
      {
        id: 'general-appearance',
        questionId: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
        label: {
          en: 'General Appearance (Polo, whistle, cards, etc.)',
          fr: 'Apparence générale (Polo, sifflet, cartons, etc.)'
        },
        options: [
          { 
            value: OptionValue.NOT_OK, 
            label: { en: 'Not OK', fr: 'Pas OK' }, 
            points: 0 
          },
          { 
            value: OptionValue.OK, 
            label: { en: 'OK', fr: 'OK' }, 
            points: 1 
          },
        ],
      },
    ],
  },
  {
    id: 'positioning',
    title: {
      en: 'Positioning',
      fr: 'Positionnement'
    },
    hasRemarks: true,
    criteria: [
      {
        id: 'positioning-pitch',
        questionId: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
        label: {
          en: 'Positioning on the Pitch',
          fr: 'Positionnement sur le terrain'
        },
        options: [
          { 
            value: OptionValue.NOT_OK, 
            label: { en: 'Not OK', fr: 'Pas OK' }, 
            points: 0 
          },
          { 
            value: OptionValue.PARTIALLY_OK, 
            label: { en: 'Partially OK', fr: 'Partiellement OK' }, 
            points: 1 
          },
          { 
            value: OptionValue.OK, 
            label: { en: 'OK', fr: 'OK' }, 
            points: 2 
          },
        ],
      },
      {
        id: 'positioning-d',
        questionId: 'd4e5f6g7-h8i9-0123-defg-456789012345',
        label: {
          en: 'Positioning in the D',
          fr: 'Positionnement dans le D'
        },
        options: [
          { 
            value: OptionValue.NOT_OK, 
            label: { en: 'Not OK', fr: 'Pas OK' }, 
            points: 0 
          },
          { 
            value: OptionValue.PARTIALLY_OK, 
            label: { en: 'Partially OK', fr: 'Partiellement OK' }, 
            points: 1 
          },
          { 
            value: OptionValue.OK, 
            label: { en: 'OK', fr: 'OK' }, 
            points: 2 
          },
        ],
      },
    ],
  },
  {
    id: 'technical-skills',
    title: {
      en: 'Technical Skills',
      fr: 'Compétences techniques'
    },
    hasRemarks: false,
    criteria: [
      {
        id: 'decision-making',
        questionId: 'e5f6g7h8-i9j0-1234-efgh-567890123456',
        label: {
          en: 'Decision Making',
          fr: 'Prise de décision'
        },
        options: [
          { 
            value: OptionValue.NOT_OK, 
            label: { en: 'Not OK', fr: 'Pas OK' }, 
            points: 0 
          },
          { 
            value: OptionValue.PARTIALLY_OK, 
            label: { en: 'Partially OK', fr: 'Partiellement OK' }, 
            points: 1 
          },
          { 
            value: OptionValue.OK, 
            label: { en: 'OK', fr: 'OK' }, 
            points: 2 
          },
          { 
            value: OptionValue.TO_BE_DONE, 
            label: { en: 'To be done', fr: 'À faire' }, 
            points: 3 
          },
        ],
      },
      {
        id: 'communication',
        questionId: 'f6g7h8i9-j0k1-2345-fghi-678901234567',
        label: {
          en: 'Communication with Players',
          fr: 'Communication avec les joueurs'
        },
        options: [
          { 
            value: OptionValue.NOT_OK, 
            label: { en: 'Not OK', fr: 'Pas OK' }, 
            points: 0 
          },
          { 
            value: OptionValue.PARTIALLY_OK, 
            label: { en: 'Partially OK', fr: 'Partiellement OK' }, 
            points: 1 
          },
          { 
            value: OptionValue.OK, 
            label: { en: 'OK', fr: 'OK' }, 
            points: 2 
          },
          { 
            value: OptionValue.TO_BE_DONE, 
            label: { en: 'To be done', fr: 'À faire' }, 
            points: 3 
          },
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