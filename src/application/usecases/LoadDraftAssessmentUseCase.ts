import { AssessmentService } from '../../domain/services/AssessmentService';

export interface LoadDraftAssessmentRequest {
  matchId: string;
  assessorId: string;
}

export interface LoadDraftAssessmentResponse {
  assessmentId: string;
  status: 'DRAFT' | 'PUBLISHED';
  umpireAData: {
    umpireId: string;
    topics: Array<{
      topicName: string;
      questionResponses: Array<{
        questionId: string;
        selectedValue: string;
        points: number;
      }>;
      remarks?: string;
    }>;
    conclusion: string;
  };
  umpireBData: {
    umpireId: string;
    topics: Array<{
      topicName: string;
      questionResponses: Array<{
        questionId: string;
        selectedValue: string;
        points: number;
      }>;
      remarks?: string;
    }>;
    conclusion: string;
  };
  lastSavedAt: string;
}

export class LoadDraftAssessmentUseCase {
  constructor(private readonly assessmentService: AssessmentService) {}

  async execute(request: LoadDraftAssessmentRequest): Promise<LoadDraftAssessmentResponse | null> {
    const assessment = await this.assessmentService.findDraftByMatchAndAssessor(
      request.matchId,
      request.assessorId
    );

    if (!assessment) {
      return null;
    }

    return {
      assessmentId: assessment.id.value,
      status: 'DRAFT', // We only load drafts with this use case
      umpireAData: {
        umpireId: assessment.umpireA.umpireId.value,
        topics: assessment.umpireA.topics.map(topic => ({
          topicName: topic.topicName,
          questionResponses: topic.questionResponses,
          remarks: topic.remarks
        })),
        conclusion: assessment.umpireA.conclusion
      },
      umpireBData: {
        umpireId: assessment.umpireB.umpireId.value,
        topics: assessment.umpireB.topics.map(topic => ({
          topicName: topic.topicName,
          questionResponses: topic.questionResponses,
          remarks: topic.remarks
        })),
        conclusion: assessment.umpireB.conclusion
      },
      lastSavedAt: assessment.updatedAt?.toISOString() || assessment.createdAt.toISOString()
    };
  }
}