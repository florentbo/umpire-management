import { Assessment, MatchId, AssessorId } from './Assessment';

export interface MatchReportId {
  value: string;
}

export interface MatchInfo {
  id: MatchId;
  homeTeam: string;
  awayTeam: string;
  division: string;
  date: string;
  time: string;
  umpireAName: string;
  umpireBName: string;
}

export class MatchReport {
  constructor(
    public readonly id: MatchReportId,
    public readonly matchInfo: MatchInfo,
    public readonly assessment: Assessment,
    public readonly submittedAt: Date
  ) {}

  static create(
    matchInfo: MatchInfo,
    assessment: Assessment
  ): MatchReport {
    const id: MatchReportId = { value: crypto.randomUUID() };
    const submittedAt = new Date();

    return new MatchReport(id, matchInfo, assessment, submittedAt);
  }
}