import { AssessmentRepository, MatchReportRepository } from '../../domain/repositories/AssessmentRepository';
import { Assessment, AssessmentId, MatchId } from '../../domain/entities/Assessment';
import { MatchReport, MatchReportId } from '../../domain/entities/MatchReport';

// In-memory storage for mock data
const assessments = new Map<string, Assessment>();
const matchReports = new Map<string, MatchReport>();

export class MockAssessmentRepository implements AssessmentRepository {
  async save(assessment: Assessment): Promise<Assessment> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Store in memory
    assessments.set(assessment.id.value, assessment);
    
    return assessment;
  }

  async findById(id: AssessmentId): Promise<Assessment | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return assessments.get(id.value) || null;
  }

  async findByMatchId(matchId: MatchId): Promise<Assessment[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(assessments.values()).filter(
      assessment => assessment.matchId.value === matchId.value
    );
  }

  async update(assessment: Assessment): Promise<Assessment> {
    await new Promise(resolve => setTimeout(resolve, 300));
    assessments.set(assessment.id.value, assessment);
    return assessment;
  }

  async delete(id: AssessmentId): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    assessments.delete(id.value);
  }
}

export class MockMatchReportRepository implements MatchReportRepository {
  async save(report: MatchReport): Promise<MatchReport> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Store in memory
    matchReports.set(report.id.value, report);
    
    return report;
  }

  async findById(id: MatchReportId): Promise<MatchReport | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return matchReports.get(id.value) || null;
  }

  async findByMatchId(matchId: MatchId): Promise<MatchReport[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(matchReports.values()).filter(
      report => report.matchId.value === matchId.value
    );
  }

  async findByAssessor(assessorId: string): Promise<MatchReport[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(matchReports.values()).filter(
      report => report.assessorId === assessorId
    );
  }
}