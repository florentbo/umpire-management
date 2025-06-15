import { MatchReportRepository } from '@/domain/repositories/AssessmentRepository.ts';

export interface GetAllReportsResponse {
  reports: Array<{
    id: string;
    matchId: string;
    matchInfo: {
      homeTeam: string;
      awayTeam: string;
      division: string;
      date: string;
      time: string;
      umpireAName: string;
      umpireBName: string;
    };
    assessorId: string;
    umpireAData: {
      totalScore: number;
      maxScore: number;
      percentage: number;
      level: string;
      conclusion: string;
    };
    umpireBData: {
      totalScore: number;
      maxScore: number;
      percentage: number;
      level: string;
      conclusion: string;
    };
    submittedAt: string;
  }>;
}

export class GetAllReportsUseCase {
  constructor(private readonly matchReportRepository: MatchReportRepository) {}

  async execute(): Promise<GetAllReportsResponse> {
    // For now, we'll get all reports. In the future, we could add filtering/pagination
    const reports = await this.matchReportRepository.findAll();

    const mappedReports = reports.map(report => ({
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
    }));

    return { reports: mappedReports };
  }
}
