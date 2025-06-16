import { AssessmentService, CreateAssessmentCommand } from '../../domain/services/AssessmentService';
import { MatchInfo } from '../../domain/entities/MatchReport';
import { MatchId } from '../../domain/entities/Assessment';

export interface CreateAssessmentRequest {
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
    umpireManagerId: string; // Added this required field
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
}

export interface CreateAssessmentResponse {
  reportId: string;
  assessmentId: string;
  umpireAGrade: {
    totalScore: number;
    maxScore: number;
    percentage: number;
    level: string;
  };
  umpireBGrade: {
    totalScore: number;
    maxScore: number;
    percentage: number;
    level: string;
  };
  submittedAt: string;
}

export class CreateAssessmentUseCase {
  constructor(private readonly assessmentService: AssessmentService) {}

  async execute(request: CreateAssessmentRequest): Promise<CreateAssessmentResponse> {
    // Calculate topic scores
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

    const command: CreateAssessmentCommand = {
      matchId: request.matchId,
      assessorId: request.assessorId,
      matchInfo, // Use the properly structured MatchInfo
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
    };

    const matchReport = await this.assessmentService.createAssessment(command);

    return {
      reportId: matchReport.id.value,
      assessmentId: matchReport.assessment.id.value,
      umpireAGrade: {
        totalScore: matchReport.assessment.umpireA.totalScore.value,
        maxScore: matchReport.assessment.umpireA.totalScore.maxValue,
        percentage: matchReport.assessment.umpireA.grade.percentage,
        level: matchReport.assessment.umpireA.grade.level
      },
      umpireBGrade: {
        totalScore: matchReport.assessment.umpireB.totalScore.value,
        maxScore: matchReport.assessment.umpireB.totalScore.maxValue,
        percentage: matchReport.assessment.umpireB.grade.percentage,
        level: matchReport.assessment.umpireB.grade.level
      },
      submittedAt: matchReport.submittedAt.toISOString()
    };
  }

  private calculateMaxScoreForTopic(topicName: string): number {
    // This should be configurable or come from the assessment config
    const maxScores: Record<string, number> = {
      'GAME_BEFORE_AND_AFTER': 2,
      'POSITIONING': 4,
      'TECHNICAL': 22,
      'GAME_MANAGEMENT': 22
    };
    return maxScores[topicName] || 0;
  }
}