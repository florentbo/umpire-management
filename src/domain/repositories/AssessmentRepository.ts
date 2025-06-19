import { Assessment, AssessmentId, MatchId } from '../entities/Assessment';
import { MatchReport } from '../entities/MatchReport';

export interface AssessmentRepository {
  // Core CRUD operations
  saveAsDraft(assessment: Assessment): Promise<Assessment>;
  saveAsPublished(assessment: Assessment): Promise<Assessment>;
  findById(id: AssessmentId): Promise<Assessment | null>;
  updateDraft(assessment: Assessment): Promise<Assessment>;
  publishDraft(assessment: Assessment): Promise<Assessment>;
  
  // Query operations used by use cases
  findByMatchIds(matchIds: MatchId[]): Promise<Assessment[]>;
  findDraftByMatchAndAssessor(matchId: string, assessorId: string): Promise<Assessment | null>;
}

export interface MatchReportRepository {
  // Core operations
  save(report: MatchReport): Promise<MatchReport>;
  findByMatchIds(matchIds: MatchId[]): Promise<MatchReport[]>;
  findByAssessor(assessorId: string): Promise<MatchReport[]>;
  
  // Filtering for reporting
  findAllWithFilters(filters: { assessorId?: string; grade?: string }): Promise<MatchReport[]>;
}