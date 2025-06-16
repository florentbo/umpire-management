import { MatchInfo } from './MatchReport';
import { Assessment, AssessmentId } from './Assessment';
import { MatchReport, MatchReportId } from './MatchReport';

export enum ReportStatus {
  NONE = 'NONE',
  DRAFT = 'DRAFT', 
  PUBLISHED = 'PUBLISHED'
}

export interface MatchWithReportStatus {
  readonly match: MatchInfo;
  readonly reportStatus: ReportStatus;
  readonly canEdit: boolean;
  readonly assessmentId?: AssessmentId;
  readonly reportId?: MatchReportId;
}

export class MatchReportStatusAggregate {
  constructor(
    private readonly matchInfo: MatchInfo,
    private readonly reportStatus: ReportStatus,
    private readonly canEdit: boolean,
    private readonly assessmentId?: AssessmentId,
    private readonly reportId?: MatchReportId
  ) {}

  static create(
    matchInfo: MatchInfo,
    assessment?: Assessment,
    report?: MatchReport,
    currentManagerId: string
  ): MatchReportStatusAggregate {
    const canEdit = matchInfo.umpireManagerId === currentManagerId;
    
    let status: ReportStatus;
    if (report) {
      status = ReportStatus.PUBLISHED;
    } else if (assessment) {
      status = ReportStatus.DRAFT;
    } else {
      status = ReportStatus.NONE;
    }

    return new MatchReportStatusAggregate(
      matchInfo,
      status,
      canEdit,
      assessment?.id,
      report?.id
    );
  }

  toPlainObject(): MatchWithReportStatus {
    return {
      match: this.matchInfo,
      reportStatus: this.reportStatus,
      canEdit: this.canEdit,
      assessmentId: this.assessmentId,
      reportId: this.reportId
    };
  }
}