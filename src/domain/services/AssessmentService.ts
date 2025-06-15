import { Assessment, AssessmentId, MatchId, AssessorId, UmpireAssessment } from '../entities/Assessment';
import { MatchReport, MatchInfo } from '../entities/MatchReport';
import { AssessmentRepository, MatchReportRepository } from '../repositories/AssessmentRepository';

export interface CreateAssessmentCommand {
  matchId: string;
  assessorId: string;
  matchInfo: Omit<MatchInfo, 'id'>;
  umpireAData: Omit<UmpireAssessment, 'totalScore' | 'grade'>;
  umpireBData: Omit<UmpireAssessment, 'totalScore' | 'grade'>;
}

export interface UpdateAssessmentCommand {
  assessmentId: string;
  umpireAData?: Partial<UmpireAssessment>;
  umpireBData?: Partial<UmpireAssessment>;
}

export class AssessmentService {
  constructor(
    private readonly assessmentRepository: AssessmentRepository,
    private readonly matchReportRepository: MatchReportRepository
  ) {}

  async createAssessment(command: CreateAssessmentCommand): Promise<MatchReport> {
    const matchId: MatchId = { value: command.matchId };
    const assessorId: AssessorId = { value: command.assessorId };

    // Create the assessment with calculated scores and grades
    const assessment = Assessment.create(
      matchId,
      assessorId,
      command.umpireAData,
      command.umpireBData
    );

    // Save the assessment
    const savedAssessment = await this.assessmentRepository.save(assessment);

    // Create and save the match report
    const matchInfo: MatchInfo = {
      id: matchId,
      ...command.matchInfo
    };

    const matchReport = MatchReport.create(matchInfo, savedAssessment);
    return await this.matchReportRepository.save(matchReport);
  }

  async updateAssessment(command: UpdateAssessmentCommand): Promise<Assessment> {
    const assessmentId: AssessmentId = { value: command.assessmentId };
    
    const existingAssessment = await this.assessmentRepository.findById(assessmentId);
    if (!existingAssessment) {
      throw new Error('Assessment not found');
    }

    const updatedAssessment = existingAssessment.update(
      command.umpireAData || {},
      command.umpireBData || {}
    );

    return await this.assessmentRepository.update(updatedAssessment);
  }

  async getAssessmentById(id: string): Promise<Assessment | null> {
    const assessmentId: AssessmentId = { value: id };
    return await this.assessmentRepository.findById(assessmentId);
  }

  async getMatchReportsByAssessor(assessorId: string): Promise<MatchReport[]> {
    return await this.matchReportRepository.findByAssessor(assessorId);
  }

  async getMatchReportsByMatch(matchId: string): Promise<MatchReport[]> {
    const matchIdObj: MatchId = { value: matchId };
    return await this.matchReportRepository.findByMatchId(matchIdObj);
  }
}