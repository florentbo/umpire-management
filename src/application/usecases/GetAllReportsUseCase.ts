import { MatchReportRepository } from '@/domain/repositories/AssessmentRepository';
import { ReportSummary, ReportSummaryAggregate } from '@/domain/entities/ReportSummary';
import { getUserNameFromId } from '@/lib/user-mapping';

export interface GetAllReportsRequest {
  assessorId?: string;
  grade?: string;
}

export interface GetAllReportsResponse {
  reports: ReportSummaryAggregate[];
}

export class GetAllReportsUseCase {
  constructor(private readonly matchReportRepository: MatchReportRepository) {}

  async execute(filters: GetAllReportsRequest = {}): Promise<GetAllReportsResponse> {
    // Get all published reports with filters
    const reports = await this.matchReportRepository.findAllWithFilters(filters);

    console.log('Raw reports from repository:', reports.length);

    // Map reports and get assessor names
    const reportSummaries = await Promise.all(
      reports.map(async (report): Promise<ReportSummaryAggregate> => {
        // Get assessor name from ID mapping (not email!)
        const assessorName = await getUserNameFromId(report.assessment.assessorId.value);
        
        console.log(`Mapping assessor ID: ${report.assessment.assessorId.value} -> ${assessorName}`);
        
        const reportData: ReportSummary = {
          id: report.id.value,
          matchId: report.matchInfo.id.value,
          matchInfo: {
            homeTeam: report.matchInfo.homeTeam,
            awayTeam: report.matchInfo.awayTeam,
            division: report.matchInfo.division,
            date: report.matchInfo.date,
            time: report.matchInfo.time,
            umpireAName: report.matchInfo.umpireAName,
            umpireBName: report.matchInfo.umpireBName,
          },
          assessorId: report.assessment.assessorId.value,
          assessorName: assessorName || `User ${report.assessment.assessorId.value}`, // Fallback to "User ID" if name not found
          umpireAData: {
            totalScore: report.assessment.umpireA.totalScore.value,
            maxScore: report.assessment.umpireA.totalScore.maxValue,
            percentage: report.assessment.umpireA.grade.percentage,
            level: report.assessment.umpireA.grade.level,
            conclusion: report.assessment.umpireA.conclusion,
          },
          umpireBData: {
            totalScore: report.assessment.umpireB.totalScore.value,
            maxScore: report.assessment.umpireB.totalScore.maxValue,
            percentage: report.assessment.umpireB.grade.percentage,
            level: report.assessment.umpireB.grade.level,
            conclusion: report.assessment.umpireB.conclusion,
          },
          submittedAt: report.submittedAt.toISOString(),
        };

        return ReportSummaryAggregate.create(reportData);
      })
    );

    console.log('Mapped report summaries:', reportSummaries.length);
    return { reports: reportSummaries };
  }
}