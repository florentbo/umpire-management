import * as React from 'react';
import { useState, useMemo } from 'react';
import { ManagerMatchCard } from './ManagerMatchCard';
import { ReportStatusFilter } from './ReportStatusFilter';
import { UmpireFilter } from './UmpireFilter';
import { MatchWithReportStatus, ReportStatus } from '@/domain/entities/MatchReportStatus';
import { Assessment } from '@/domain/entities/Assessment';
import { Card } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

interface MyMatchesViewProps {
  loadingMyMatches: boolean;
  myMatchesData: { matches: MatchWithReportStatus[] } | undefined;
  statusFilter: ReportStatus | 'ALL';
  setStatusFilter: (filter: ReportStatus | 'ALL') => void;
  sortedAndFilteredMatches: MatchWithReportStatus[];
  groupedMatches: {
    priorityMatches: MatchWithReportStatus[];
    publishedMatches: MatchWithReportStatus[];
  };
  getStatusCount: (status: ReportStatus | 'ALL') => number;
  currentUserId: string;
}

export const MyMatchesView: React.FC<MyMatchesViewProps> = ({
  loadingMyMatches,
  myMatchesData,
  statusFilter,
  setStatusFilter,
  sortedAndFilteredMatches,
  groupedMatches,
  getStatusCount,
  currentUserId
}) => {
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[] | null>(null);

  // Filter matches by selected assessments
  const filteredMatches = useMemo(() => {
    if (!filteredAssessments || !myMatchesData?.matches) {
      return {
        sortedAndFiltered: sortedAndFilteredMatches,
        priority: groupedMatches.priorityMatches,
        published: groupedMatches.publishedMatches
      };
    }

    // Get match IDs from filtered assessments
    const assessmentMatchIds = new Set(filteredAssessments.map(a => a.matchId.value));
    
    const filterByAssessments = (matches: MatchWithReportStatus[]) => 
      matches.filter(match => assessmentMatchIds.has(match.match.id.value));

    return {
      sortedAndFiltered: filterByAssessments(sortedAndFilteredMatches),
      priority: filterByAssessments(groupedMatches.priorityMatches),
      published: filterByAssessments(groupedMatches.publishedMatches)
    };
  }, [filteredAssessments, sortedAndFilteredMatches, groupedMatches, myMatchesData?.matches]);

  const handleUmpireFilterChange = (assessments: Assessment[] | null) => {
    setFilteredAssessments(assessments);
  };

  return (
    <Card className="w-full">
      <div className="p-6">
        <div className="mb-6">
          <ReportStatusFilter
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            getStatusCount={getStatusCount}
          />
        </div>

        <UmpireFilter 
          currentUserId={currentUserId}
          onUmpireFilterChange={handleUmpireFilterChange}
        />

        {loadingMyMatches ? (
          <div className="space-y-4 w-full">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse w-full" />
            ))}
          </div>
        ) : !myMatchesData?.matches || myMatchesData.matches.length === 0 ? (
          <div className="text-center py-12 w-full">
            <ClipboardList className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Aucun match assigné</p>
            <p className="text-sm text-gray-400 mt-2">Les matches qui vous sont assignés apparaîtront ici</p>
          </div>
        ) : (() => {
          if (statusFilter !== 'ALL') {
            // If filtering by specific status, show normal filtered list
            return (
              <div className="space-y-4 w-full">
                {filteredMatches.sortedAndFiltered.map((match: MatchWithReportStatus) => (
                  <ManagerMatchCard key={match.match.id.value} matchWithStatus={match} />
                ))}
              </div>
            );
          } else {
            // If showing all, group by priority
            return (
              <div className="space-y-8 w-full">
                {/* Priority Matches (NONE/DRAFT) */}
                {filteredMatches.priority.length > 0 && (
                  <div className="space-y-4 w-full">
                    {filteredMatches.priority.map((match: MatchWithReportStatus) => (
                      <ManagerMatchCard key={match.match.id.value} matchWithStatus={match} />
                    ))}
                  </div>
                )}
                {/* Empty state if no matches at all */}
                {filteredMatches.priority.length === 0 && filteredMatches.published.length === 0 && (
                  <div className="text-center py-12 w-full">
                    <ClipboardList className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Aucun match trouvé</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {filteredAssessments ? 'Aucun match trouvé pour cet arbitre' : 'Les matches qui vous sont assignés apparaîtront ici'}
                    </p>
                  </div>
                )}
              </div>
            );
          }
        })()}
      </div>
    </Card>
  );
};
