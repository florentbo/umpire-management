import { AssessmentConfig, Topic, AnswerOption } from '../../dist/api';

const mockTopics: Topic[] = [
  {
    name: Topic.name.GAME_BEFORE_AND_AFTER,
    questions: [
      {
        id: 'arrival-time',
        text: 'Arrival Time (Minimum 1 hour before game)',
        answerPoints: [
          { value: AnswerOption.NOT_OK, points: -1 },
          { value: AnswerOption.OK, points: 1 }
        ]
      },
      {
        id: 'general-appearance',
        text: 'General Appearance (Polo, whistle, cards, etc.)',
        answerPoints: [
          { value: AnswerOption.NOT_OK, points: 0 },
          { value: AnswerOption.OK, points: 1 }
        ]
      }
    ],
    remark: false
  },
  {
    name: Topic.name.POSITIONING,
    questions: [
      {
        id: 'positioning-pitch',
        text: 'Positioning on the Pitch',
        answerPoints: [
          { value: AnswerOption.NOT_OK, points: 0 },
          { value: AnswerOption.PARTIAL, points: 1 },
          { value: AnswerOption.OK, points: 2 }
        ]
      },
      {
        id: 'positioning-d',
        text: 'Positioning in the D',
        answerPoints: [
          { value: AnswerOption.NOT_OK, points: 0 },
          { value: AnswerOption.PARTIAL, points: 1 },
          { value: AnswerOption.OK, points: 2 }
        ]
      }
    ],
    remark: true
  }
];

export const mockAssessmentConfig: AssessmentConfig = {
  level: AssessmentConfig.level.JUNIOR,
  topics: mockTopics
};

// Mock service that simulates API delay
export const mockService = {
  getAssessmentConfig: async (level: AssessmentConfig.level): Promise<AssessmentConfig> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      ...mockAssessmentConfig,
      level
    };
  }
}; 