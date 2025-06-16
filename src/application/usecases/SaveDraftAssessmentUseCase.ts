import { AssessmentService } from '../../domain/services/AssessmentService';
import { MatchInfo } from '../../domain/entities/MatchReport';
import { MatchId } from '../../domain/entities/Assessment';

export interface SaveDraftAssessmentRequest {
  matchId: string;
  assessorId: string;
  matchInfo: {
    homeTeam: string;
    awayTeam: string;
    division: string;
    date: string;
    time: string;
    umpireAName: string;
    umpireBName: string;
    umpireManagerId: string;
  };
  umpireAAssessment: {
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
  umpireBAssessment: {
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
  existingAssessmentId?: string; // For updating existing drafts
}

export interface SaveDraftAssessmentResponse {
  assessmentId: string;
  status: 'DRAFT';
  lastSavedAt: string;
  message: string;
}

export class SaveDraftAssessmentUseCase {
  constructor(private readonly assessmentService: AssessmentService) {}

  async execute(request: SaveDraftAssessmentRequest): Promise<SaveDraftAssessmentResponse> {
    // Calculate topic scores (even for incomplete data)
    const umpireATopics = request.umpireAAssessment.topics.map(topic => ({
      topicName: topic.topicName,
      questionResponses: topic.questionResponses,
      remarks: topic.remarks,
      totalScore: topic.questionResponses.reduce((sum, q) => sum + q.points, 0),
      maxScore: this.calculateMaxScoreForTopic(topic.topicName)
    }));

    const umpireBTopics = request.umpireBAssessment.topics.map(topic => ({
      topicName: topic.topicName,
      questionResponses: topic.questionResponses,
      remarks: topic.remarks,
      totalScore: topic.questionResponses.reduce((sum, q) => sum + q.points, 0),
      maxScore: this.calculateMaxScoreForTopic(topic.topicName)
    }));

    // Create proper domain MatchInfo entity
    const matchInfo: MatchInfo = {
      id: { value: request.matchId } as MatchId,
      homeTeam: request.matchInfo.homeTeam,
      awayTeam: request.matchInfo.awayTeam,
      division: request.matchInfo.division,
      date: request.matchInfo.date,
      time: request.matchInfo.time,
      umpireAName: request.matchInfo.umpireAName,
      umpireBName: request.matchInfo.umpireBName,
      umpireManagerId: request.matchInfo.umpireManagerId
    };

    let assessment;
    
    if (request.existingAssessmentId) {
      // Update existing draft
      assessment = await this.assessmentService.updateDraftAssessment({
        assessmentId: request.existingAssessmentId,
        umpireAData: {
          umpireId: { value: request.umpireAAssessment.umpireId },
          topics: umpireATopics,
          conclusion: request.umpireAAssessment.conclusion
        },
        umpireBData: {
          umpireId: { value: request.umpireBAssessment.umpireId },
          topics: umpireBTopics,
          conclusion: request.umpireBAssessment.conclusion
        }
      });
    } else {
      // Create new draft
      assessment = await this.assessmentService.createDraftAssessment({
        matchId: request.matchId,
        assessorId: request.assessorId,
        matchInfo,
        umpireAData: {
          umpireId: { value: request.umpireAAssessment.umpireId },
          topics: umpireATopics,
          conclusion: request.umpireAAssessment.conclusion
        },
        umpireBData: {
          umpireId: { value: request.umpireBAssessment.umpireId },
          topics: umpireBTopics,
          conclusion: request.umpireBAssessment.conclusion
        }
      });
    }

    return {
      assessmentId: assessment.id.value,
      status: 'DRAFT',
      lastSavedAt: new Date().toISOString(),
      message: request.existingAssessmentId ? 'Brouillon mis à jour' : 'Brouillon sauvegardé'
    };
  }

  private calculateMaxScoreForTopic(topicName: string): number {
    const maxScores: Record<string, number> = {
      'GAME_BEFORE_AND_AFTER': 2,
      'POSITIONING': 4,
      'TECHNICAL': 22,
      'GAME_MANAGEMENT': 22
    };
    return maxScores[topicName] || 0;
  }
}