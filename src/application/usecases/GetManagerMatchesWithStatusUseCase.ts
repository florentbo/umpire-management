import { MatchRepository } from '@/domain/repositories/MatchRepository';
import { AssessmentRepository, MatchReportRepository } from '@/domain/repositories/AssessmentRepository';
import { MatchWithReportStatus, MatchReportStatusAggregate } from '@/domain/entities/MatchReportStatus';

export interface GetManagerMatchesWithStatusRequest {
  managerId: string;
}

export interface GetManagerMatchesWithStatusResponse {
  matches: MatchWithReportStatus[];
}

export class GetManagerMatchesWithStatusUseCase {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly assessmentRepository: AssessmentRepository,
    private readonly matchReportRepository: MatchReportRepository
  ) {}

  async execute(request: GetManagerMatchesWithStatusRequest): Promise<GetManagerMatchesWithStatusResponse> {
    // 1. Get matches for this manager
    const matches = await this.matchRepository.findByManagerId(request.managerId);
    
    if (matches.length === 0) {
      return { matches: [] };
    }

    const matchIds = matches.map(m => m.id);

    // 2. Get assessments for these matches
    const assessments = await this.assessmentRepository.findByMatchIds(matchIds);
    const assessmentsByMatchId = new Map(
      assessments.map(a => [a.matchId.value, a])
    );

    // 3. Get reports for these matches  
    const reports = await this.matchReportRepository.findByMatchIds(matchIds);
    const reportsByMatchId = new Map(
      reports.map(r => [r.matchInfo.id.value, r])
    );

    // 4. Create aggregates
    const matchesWithStatus = matches.map(match => {
      const assessment = assessmentsByMatchId.get(match.id.value);
      const report = reportsByMatchId.get(match.id.value);
      
      return MatchReportStatusAggregate.create(
        match,
        assessment,
        report,
        request.managerId
      ).toPlainObject();
    });

    return { matches: matchesWithStatus };
  }
}