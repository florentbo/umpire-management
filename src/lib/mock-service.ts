import type { AssessmentConfig } from '../gen';
import { assessmentConfigLevelEnum, type AssessmentConfigLevelEnum } from '../gen/types/AssessmentConfig';
import { topicNameEnum } from '../gen/types/Topic';
import { answerOptionEnum } from '../gen/types/AnswerOption';

const mockTopics = [
  {
    name: topicNameEnum.GAME_BEFORE_AND_AFTER,
    questions: [
      {
        id: 'arrival-time',
        text: 'Arrival Time (Minimum 1 hour before game)',
        answerPoints: [
          { value: answerOptionEnum.NOT_OK, points: -1 },
          { value: answerOptionEnum.OK, points: 1 }
        ]
      },
      {
        id: 'general-appearance',
        text: 'General Appearance (Polo, whistle, cards, etc.)',
        answerPoints: [
          { value: answerOptionEnum.NOT_OK, points: 0 },
          { value: answerOptionEnum.OK, points: 1 }
        ]
      }
    ],
    remark: false
  },
  {
    name: topicNameEnum.POSITIONING,
    questions: [
      {
        id: 'positioning-pitch',
        text: 'Positioning on the Pitch',
        answerPoints: [
          { value: answerOptionEnum.NOT_OK, points: 0 },
          { value: answerOptionEnum.PARTIAL, points: 1 },
          { value: answerOptionEnum.OK, points: 2 }
        ]
      },
      {
        id: 'positioning-d',
        text: 'Positioning in the D',
        answerPoints: [
          { value: answerOptionEnum.NOT_OK, points: 0 },
          { value: answerOptionEnum.PARTIAL, points: 1 },
          { value: answerOptionEnum.OK, points: 2 }
        ]
      }
    ],
    remark: true
  }
];

export const mockAssessmentConfig: AssessmentConfig = {
  level: assessmentConfigLevelEnum.junior,
  topics: mockTopics
};

// Mock service that simulates API delay
export const mockService = {
  getAssessmentConfig: async (level: AssessmentConfigLevelEnum): Promise<AssessmentConfig> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      ...mockAssessmentConfig,
      level
    };
  }
}; 