import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as useGetManagerMatchesWithStatusModule from './useGetManagerMatchesWithStatus';
import * as useGetAllPublishedReportsModule from './useGetAllPublishedReports';
import { useManagerMatchesViewModel } from './useManagerMatchesViewModel';
import { ReportStatus } from '@/domain/entities/MatchReportStatus';
import { ReportSummaryAggregate } from '@/domain/entities/ReportSummary';

vi.mock('@/domain/services/MatchSortingService', () => {
  return {
    MatchSortingService: vi.fn().mockImplementation(() => ({
      getSortedAndFilteredMatches: vi.fn(() => [{
        match: {
          id: { value: '1' },
          homeTeam: 'A',
          awayTeam: 'B',
          division: 'Div1',
          date: '2024-01-01',
          time: '12:00',
          umpireAName: 'UmpA',
          umpireBName: 'UmpB',
          umpireManagerId: 'manager1',
        },
        reportStatus: ReportStatus.NONE,
        canEdit: true,
      }]),
      groupMatchesByPriority: vi.fn(() => ({ priorityMatches: [], publishedMatches: [] })),
    })),
  };
});

vi.mock('@/domain/services/ReportSortingService', () => {
  return {
    ReportSortingService: vi.fn().mockImplementation(() => ({
      sortReports: vi.fn(() => [
        ReportSummaryAggregate.create({
          id: 'summary1',
          matchId: '1',
          matchInfo: {
            homeTeam: 'A',
            awayTeam: 'B',
            division: 'Div1',
            date: '2024-01-01',
            time: '12:00',
            umpireAName: 'UmpA',
            umpireBName: 'UmpB',
          },
          assessorId: 'assessor1',
          assessorName: 'Assessor',
          umpireAData: {
            totalScore: 10,
            maxScore: 10,
            percentage: 100,
            level: 'A',
            conclusion: 'Good',
          },
          umpireBData: {
            totalScore: 10,
            maxScore: 10,
            percentage: 100,
            level: 'A',
            conclusion: 'Good',
          },
          submittedAt: '2024-01-01T00:00:00.000Z',
        }),
      ]),
    })),
  };
});

describe('useManagerMatchesViewModel', () => {
  it('returns expected structure and calls domain services', () => {
    vi.spyOn(useGetManagerMatchesWithStatusModule, 'useGetManagerMatchesWithStatus').mockReturnValue({
      data: { matches: [{
        match: {
          id: { value: '1' },
          homeTeam: 'A',
          awayTeam: 'B',
          division: 'Div1',
          date: '2024-01-01',
          time: '12:00',
          umpireAName: 'UmpA',
          umpireBName: 'UmpB',
          umpireManagerId: 'manager1',
        },
        reportStatus: ReportStatus.NONE,
        canEdit: true,
      }] },
      isLoading: false,
    } as any);
    vi.spyOn(useGetAllPublishedReportsModule, 'useGetAllPublishedReports').mockReturnValue({
      data: { reports: [
        ReportSummaryAggregate.create({
          id: 'summary1',
          matchId: '1',
          matchInfo: {
            homeTeam: 'A',
            awayTeam: 'B',
            division: 'Div1',
            date: '2024-01-01',
            time: '12:00',
            umpireAName: 'UmpA',
            umpireBName: 'UmpB',
          },
          assessorId: 'assessor1',
          assessorName: 'Assessor',
          umpireAData: {
            totalScore: 10,
            maxScore: 10,
            percentage: 100,
            level: 'A',
            conclusion: 'Good',
          },
          umpireBData: {
            totalScore: 10,
            maxScore: 10,
            percentage: 100,
            level: 'A',
            conclusion: 'Good',
          },
          submittedAt: '2024-01-01T00:00:00.000Z',
        }),
      ] },
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useManagerMatchesViewModel('user1', 'ALL'));

    expect(result.current.loadingMyMatches).toBe(false);
    expect(result.current.loadingAllReports).toBe(false);
    expect(Array.isArray(result.current.sortedAndFilteredMatches)).toBe(true);
    expect(result.current.sortedAndFilteredMatches.length).toBeGreaterThan(0);
    expect(result.current.groupedMatches).toHaveProperty('priorityMatches');
    expect(result.current.groupedMatches).toHaveProperty('publishedMatches');
    expect(Array.isArray(result.current.sortedReports)).toBe(true);
    expect(typeof result.current.getStatusCount).toBe('function');
  });
});
