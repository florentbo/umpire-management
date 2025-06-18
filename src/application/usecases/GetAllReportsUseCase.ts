import { MatchReportRepository } from '@/domain/repositories/AssessmentRepository';
import { ReportSummary, ReportSummaryAggregate } from '@/domain/entities/ReportSummary';
import { getUserNameFromEmail } from '@/lib/user-mapping';

export interface GetAllReportsResponse {
  reports: ReportSummaryAggregate[];
}

export class GetAllReportsUseCase {
  constructor(private readonly matchReportRepository: MatchReportRepository) {}

  async execute(): Promise<GetAllReportsResponse> {
    // Get all published reports
    const reports = await this.matchReportRepository.findAll();

    // Map reports and get assessor names
    const reportSummaries = await Promise.all(
      reports.map(async (report): Promise<ReportSummaryAggregate> => {
        const assessorName = await getUserNameFromEmail(report.assessment.assessorId.value) || report.assessment.assessorId.value;
        
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
          assessorName,
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

    return { reports: reportSummaries };
  }
}