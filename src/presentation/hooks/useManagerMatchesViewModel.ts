import { useGetManagerMatchesWithStatus } from '@/presentation/hooks/useGetManagerMatchesWithStatus';
import { useGetAllPublishedReports } from '@/presentation/hooks/useGetAllPublishedReports';
import { useMemo, useState } from 'react';
import { MatchSortingService } from '@/domain/services/MatchSortingService';
import { ReportSortingService } from '@/domain/services/ReportSortingService';
import { ReportStatus } from '@/domain/entities/MatchReportStatus';

export interface PublishedReportsFilter {
  assessorId?: string;
  grade?: string;
}

export interface ManagerMatchesViewModel {
  loadingMyMatches: boolean;
  loadingAllReports: boolean;
  sortedAndFilteredMatches: any[];
  groupedMatches: {
    priorityMatches: any[];
    publishedMatches: any[];
  };
  sortedReports: any[];
  myMatchesData: any;
  allReportsData: any;
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

  const matchSortingService = useMemo(() => new MatchSortingService(), []);
  const reportSortingService = useMemo(() => new ReportSortingService(), []);

  const { sortedAndFilteredMatches, groupedMatches } = useMemo(() => {
    if (!myMatchesData?.matches) {
      return { sortedAndFilteredMatches: [], groupedMatches: { priorityMatches: [], publishedMatches: [] } };
    }
    const sortedAndFiltered = matchSortingService.getSortedAndFilteredMatches(
      myMatchesData.matches,
      statusFilter
    );
    const grouped = matchSortingService.groupMatchesByPriority(myMatchesData.matches);
    return { sortedAndFilteredMatches: sortedAndFiltered, groupedMatches: grouped };
  }, [myMatchesData?.matches, statusFilter, matchSortingService]);

  const sortedReports = useMemo(() => {
    if (!allReportsData?.reports) return [];
    return reportSortingService.sortReports(allReportsData.reports);
  }, [allReportsData?.reports, reportSortingService]);

  const getStatusCount = (status: ReportStatus | 'ALL') => {
    if (!myMatchesData?.matches) return 0;
    if (status === 'ALL') return myMatchesData.matches.length;
    return myMatchesData.matches.filter(match => match.reportStatus === status).length;
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