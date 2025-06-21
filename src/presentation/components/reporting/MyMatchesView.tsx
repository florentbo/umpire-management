import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ClipboardList, Filter } from 'lucide-react';
import { ManagerMatchCard } from './ManagerMatchCard';
import { ReportStatusFilter } from './ReportStatusFilter';
import { ReportStatus } from '@/domain/entities/MatchReportStatus';

interface MyMatchesViewProps {
  loadingMyMatches: boolean;
  myMatchesData: any;
  statusFilter: ReportStatus | 'ALL';
  setStatusFilter: (status: ReportStatus | 'ALL') => void;
  sortedAndFilteredMatches: any[];
  groupedMatches: {
    priorityMatches: any[];
    publishedMatches: any[];
  };
  getStatusCount: (status: ReportStatus | 'ALL') => number;
}

export const MyMatchesView: React.FC<MyMatchesViewProps> = ({
  loadingMyMatches,
  myMatchesData,
  statusFilter,
  setStatusFilter,
  sortedAndFilteredMatches,
  groupedMatches,
  getStatusCount
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Mes matches</span>
        </CardTitle>
        <CardDescription>
          Vos matches assignés avec le statut des rapports d'évaluation
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        {/* Status Filter */}
        <div className="mb-6">
          <ReportStatusFilter
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            getStatusCount={getStatusCount}
          />
        </div>
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
            return sortedAndFilteredMatches.length === 0 ? (
              <div className="text-center py-12 w-full">
                <Filter className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Aucun match avec le statut "{getStatusCount(statusFilter)}"</p>
                <p className="text-sm text-gray-400 mt-2">Essayez de changer le filtre pour voir d'autres matches</p>
              </div>
            ) : (
              <div className="space-y-4 w-full">
                {sortedAndFilteredMatches.map(matchWithStatus => (
                  <ManagerMatchCard key={matchWithStatus.match.id.value} matchWithStatus={matchWithStatus} />
                ))}
              </div>
            );
          }
          // Show grouped view when "ALL" is selected
          return (
            <div className="space-y-8 w-full">
              {/* Priority Matches (NONE and DRAFT) */}
              {groupedMatches.priorityMatches.length > 0 && (
                <div className="space-y-4 w-full">
                  <div className="flex items-center space-x-2">
                    <div className="h-px bg-orange-200 flex-1"></div>
                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                      Rapports à rédiger ({groupedMatches.priorityMatches.length})
                    </Badge>
                    <div className="h-px bg-orange-200 flex-1"></div>
                  </div>
                  {groupedMatches.priorityMatches.map(matchWithStatus => (
                    <ManagerMatchCard key={matchWithStatus.match.id.value} matchWithStatus={matchWithStatus} />
                  ))}
                </div>
              )}
              {/* Empty state if no matches at all */}
              {groupedMatches.priorityMatches.length === 0 && groupedMatches.publishedMatches.length === 0 && (
                <div className="text-center py-12 w-full">
                  <ClipboardList className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Aucun match assigné</p>
                  <p className="text-sm text-gray-400 mt-2">Les matches qui vous sont assignés apparaîtront ici</p>
                </div>
              )}
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
};
