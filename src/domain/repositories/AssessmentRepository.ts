import { Assessment, AssessmentId, MatchId } from '../entities/Assessment';
import { MatchReport, MatchReportId } from '../entities/MatchReport';

export interface AssessmentRepository {
  save(assessment: Assessment): Promise<Assessment>;
  saveAsDraft(assessment: Assessment): Promise<Assessment>;
  saveAsPublished(assessment: Assessment): Promise<Assessment>;
  findById(id: AssessmentId): Promise<Assessment | null>;
  findByMatchId(matchId: MatchId): Promise<Assessment[]>;
  findByMatchIds(matchIds: MatchId[]): Promise<Assessment[]>;
  findDraftByMatchAndAssessor(matchId: string, assessorId: string): Promise<Assessment | null>;
  update(assessment: Assessment): Promise<Assessment>;
  updateDraft(assessment: Assessment): Promise<Assessment>;
  publishDraft(assessment: Assessment): Promise<Assessment>;
  delete(id: AssessmentId): Promise<void>;
}

export interface MatchReportRepository {
  save(report: MatchReport): Promise<MatchReport>;
  findById(id: MatchReportId): Promise<MatchReport | null>;
  findByMatchId(matchId: MatchId): Promise<MatchReport[]>;
  findByMatchIds(matchIds: MatchId[]): Promise<MatchReport[]>;
  findByAssessor(assessorId: string): Promise<MatchReport[]>;
  findAll(): Promise<MatchReport[]>;
}