export interface ReportSummary {
  readonly id: string;
  readonly matchId: string;
  readonly matchInfo: {
    readonly homeTeam: string;
    readonly awayTeam: string;
    readonly division: string;
    readonly date: string;
    readonly time: string;
    readonly umpireAName: string;
    readonly umpireBName: string;
  };
  readonly assessorId: string;
  readonly assessorName: string;
  readonly umpireAData: {
    readonly totalScore: number;
    readonly maxScore: number;
    readonly percentage: number;
    readonly level: string;
    readonly conclusion: string;
  };
  readonly umpireBData: {
    readonly totalScore: number;
    readonly maxScore: number;
    readonly percentage: number;
    readonly level: string;
    readonly conclusion: string;
  };
  readonly submittedAt: string;
}

export class ReportSummaryAggregate {
  constructor(private readonly reportSummary: ReportSummary) {}

  static create(reportData: ReportSummary): ReportSummaryAggregate {
    return new ReportSummaryAggregate(reportData);
  }

  get id(): string {
    return this.reportSummary.id;
  }

  get matchId(): string {
    return this.reportSummary.matchId;
  }

  get matchInfo() {
    return this.reportSummary.matchInfo;
  }

  get assessorName(): string {
    return this.reportSummary.assessorName;
  }

  get umpireAData() {
    return this.reportSummary.umpireAData;
  }

  get umpireBData() {
    return this.reportSummary.umpireBData;
  }

  get submittedAt(): string {
    return this.reportSummary.submittedAt;
  }

  get formattedDate(): string {
    return new Date(this.reportSummary.matchInfo.date).toLocaleDateString('fr-FR');
  }

  get formattedSubmissionDate(): string {
    return new Date(this.reportSummary.submittedAt).toLocaleDateString('fr-FR');
  }

  isCreatedByAssessor(assessorId: string): boolean {
    return this.reportSummary.assessorId === assessorId;
  }
}