import { Assessment, AssessmentId, MatchId, AssessorId, UmpireAssessment } from '../entities/Assessment';
import { MatchReport, MatchInfo } from '../entities/MatchReport';
import { AssessmentRepository, MatchReportRepository } from '../repositories/AssessmentRepository';

export interface CreateAssessmentCommand {
  matchId: string;
  assessorId: string;
  matchInfo: MatchInfo;
  umpireAData: Omit<UmpireAssessment, 'totalScore' | 'grade'>;
  umpireBData: Omit<UmpireAssessment, 'totalScore' | 'grade'>;
}

export interface CreateDraftAssessmentCommand {
  matchId: string;
  assessorId: string;
  matchInfo: MatchInfo;
  umpireAData: Omit<UmpireAssessment, 'totalScore' | 'grade'>;
  umpireBData: Omit<UmpireAssessment, 'totalScore' | 'grade'>;
}

export interface UpdateDraftAssessmentCommand {
  assessmentId: string;
  umpireAData?: Partial<UmpireAssessment>;
  umpireBData?: Partial<UmpireAssessment>;
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

    // Save the assessment as PUBLISHED
    const savedAssessment = await this.assessmentRepository.saveAsPublished(assessment);

    // Create and save the match report using the provided MatchInfo
    const matchReport = MatchReport.create(command.matchInfo, savedAssessment);
    return await this.matchReportRepository.save(matchReport);
  }

  async createDraftAssessment(command: CreateDraftAssessmentCommand): Promise<Assessment> {
    const matchId: MatchId = { value: command.matchId };
    const assessorId: AssessorId = { value: command.assessorId };

    // Create the assessment with calculated scores and grades
    const assessment = Assessment.create(
      matchId,
      assessorId,
      command.umpireAData,
      command.umpireBData
    );

    // Save the assessment as DRAFT
    return await this.assessmentRepository.saveAsDraft(assessment);
  }

  async updateDraftAssessment(command: UpdateDraftAssessmentCommand): Promise<Assessment> {
    const assessmentId: AssessmentId = { value: command.assessmentId };
    
    const existingAssessment = await this.assessmentRepository.findById(assessmentId);
    if (!existingAssessment) {
      throw new Error('Assessment not found');
    }

    const updatedAssessment = existingAssessment.update(
      command.umpireAData || {},
      command.umpireBData || {}
    );

    return await this.assessmentRepository.updateDraft(updatedAssessment);
  }

  async publishDraftAssessment(assessmentId: string, matchInfo: MatchInfo): Promise<MatchReport> {
    const id: AssessmentId = { value: assessmentId };
    
    const draftAssessment = await this.assessmentRepository.findById(id);
    if (!draftAssessment) {
      throw new Error('Draft assessment not found');
    }

    // Publish the assessment
    const publishedAssessment = await this.assessmentRepository.publishDraft(draftAssessment);

    // Create and save the match report
    const matchReport = MatchReport.create(matchInfo, publishedAssessment);
    return await this.matchReportRepository.save(matchReport);
  }

  async findDraftByMatchAndAssessor(matchId: string, assessorId: string): Promise<Assessment | null> {
    return await this.assessmentRepository.findDraftByMatchAndAssessor(matchId, assessorId);
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