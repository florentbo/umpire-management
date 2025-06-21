import { useGetManagerMatchesWithStatus } from '@/presentation/hooks/useGetManagerMatchesWithStatus';
import { useGetAllPublishedReports } from '@/presentation/hooks/useGetAllPublishedReports';
import { useMemo, useState } from 'react';
import { ReportSortingService } from '@/domain/services/ReportSortingService';
import { ReportStatus, MatchWithReportStatus } from '@/domain/entities/MatchReportStatus';
import { ReportSummaryAggregate } from '@/domain/entities/ReportSummary';

export interface PublishedReportsFilter {
  assessorId?: string;
  grade?: string;
}

export interface ManagerMatchesViewModel {
  loadingMyMatches: boolean;
  loadingAllReports: boolean;
  sortedAndFilteredMatches: MatchWithReportStatus[];
  groupedMatches: {
    priorityMatches: MatchWithReportStatus[];
    publishedMatches: MatchWithReportStatus[];
  };
  sortedReports: ReportSummaryAggregate[];
  myMatchesData: { matches: MatchWithReportStatus[] } | undefined;
  allReportsData: { reports: ReportSummaryAggregate[] } | undefined;
  getStatusCount: (status: ReportStatus | 'ALL') => number;
  publishedReportsFilter: PublishedReportsFilter;
  setPublishedReportsFilter: (filter: PublishedReportsFilter) => void;
}

export function useManagerMatchesViewModel(
  userId: string,
  statusFilter: ReportStatus | 'ALL',
  initialPublishedReportsFilter: PublishedReportsFilter = {}
): ManagerMatchesViewModel {
  const [publishedReportsFilter, setPublishedReportsFilter] = useState<PublishedReportsFilter>(initialPublishedReportsFilter);

  const { data: myMatchesData, isLoading: loadingMyMatches } = useGetManagerMatchesWithStatus(userId);
  const { data: allReportsData, isLoading: loadingAllReports } = useGetAllPublishedReports(publishedReportsFilter);

  // Sorting and grouping logic for MatchWithReportStatus
  const { sortedAndFilteredMatches, groupedMatches } = useMemo(() => {
    if (!myMatchesData?.matches) {
      return { sortedAndFilteredMatches: [], groupedMatches: { priorityMatches: [], publishedMatches: [] } };
    }
    // Filter and sort
    const filtered = statusFilter === 'ALL'
      ? myMatchesData.matches
      : myMatchesData.matches.filter(match => match.reportStatus === statusFilter);
    // Sort by date (earliest first for NONE/DRAFT, latest first for PUBLISHED)
    const sortedAndFilteredMatches = [...filtered].sort((a, b) => {
      const dateA = new Date(a.match.date + ' ' + a.match.time);
      const dateB = new Date(b.match.date + ' ' + b.match.time);
      if (a.reportStatus === ReportStatus.PUBLISHED && b.reportStatus === ReportStatus.PUBLISHED) {
        return dateB.getTime() - dateA.getTime();
      }
      return dateA.getTime() - dateB.getTime();
    });
    // Group
    const priorityMatches = myMatchesData.matches.filter(m => m.reportStatus === ReportStatus.NONE || m.reportStatus === ReportStatus.DRAFT);
    const publishedMatches = myMatchesData.matches.filter(m => m.reportStatus === ReportStatus.PUBLISHED);
    return { sortedAndFilteredMatches, groupedMatches: { priorityMatches, publishedMatches } };
  }, [myMatchesData?.matches, statusFilter]);

  const reportSortingService = useMemo(() => new ReportSortingService(), []);
  const sortedReports = useMemo(() => {
    if (!allReportsData?.reports) return [];
    // Convert ReportSummaryAggregate to ReportForSorting for sorting, then convert back
    const reportsForSorting = allReportsData.reports.map((report: ReportSummaryAggregate) => ({
      matchInfo: {
        date: report.matchInfo.date,
        time: report.matchInfo.time,
      },
      submittedAt: report.submittedAt,
      originalReport: report
    }));
    const sortedForSorting = reportSortingService.sortReports(reportsForSorting);
    return sortedForSorting.map((item: any) => item.originalReport);
  }, [allReportsData?.reports, reportSortingService]);

  const getStatusCount = (status: ReportStatus | 'ALL') => {
    if (!myMatchesData?.matches) return 0;
    if (status === 'ALL') return myMatchesData.matches.length;
    return myMatchesData.matches.filter((match: MatchWithReportStatus) => match.reportStatus === status).length;
  };

  return {
    loadingMyMatches,
    loadingAllReports,
    sortedAndFilteredMatches,
    groupedMatches,
    sortedReports,
    myMatchesData,
    allReportsData,
    getStatusCount,
    publishedReportsFilter,
    setPublishedReportsFilter,
  };
} 