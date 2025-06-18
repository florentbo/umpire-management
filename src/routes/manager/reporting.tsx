import { createFileRoute, Link } from '@tanstack/react-router';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';
import { Calendar, User, Eye, Edit, FileText, ClipboardList, Filter } from 'lucide-react';
import { useGetManagerMatchesWithStatus } from '@/presentation/hooks/useGetManagerMatchesWithStatus';
import { useGetAllPublishedReports } from '@/presentation/hooks/useGetAllPublishedReports';
import { ReportsTable } from '@/presentation/components/reporting/ReportsTable';
import { ReportStatus } from '@/domain/entities/MatchReportStatus';
import { MatchSortingService } from '@/domain/services/MatchSortingService';
import { ReportSortingService } from '@/domain/services/ReportSortingService';

export const Route = createFileRoute('/manager/reporting')({
  beforeLoad: () => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'umpire_manager') {
      throw new Error('Unauthorized');
    }
  },
  component: ReportingPage,
});

function ReportingPage() {
  const user = authService.getCurrentUser();
  const [activeView, setActiveView] = useState<'my-matches' | 'all-reports'>('my-matches');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');

  // Domain services
  const matchSortingService = useMemo(() => new MatchSortingService(), []);
  const reportSortingService = useMemo(() => new ReportSortingService(), []);

  // Get matches with status for the current manager
  const { data: myMatchesData, isLoading: loadingMyMatches } = useGetManagerMatchesWithStatus(user?.id || '');

  // Get all published reports
  const { data: allReportsData, isLoading: loadingAllReports } = useGetAllPublishedReports();

  // Use domain service for sorting and filtering matches
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

  // Use domain service for sorting reports
  const sortedReports = useMemo(() => {
    if (!allReportsData?.reports) return [];
    return reportSortingService.sortReports(allReportsData.reports);
  }, [allReportsData?.reports, reportSortingService]);

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.NONE:
        return <Badge variant="outline" className="text-gray-600">Aucun rapport</Badge>;
      case ReportStatus.DRAFT:
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Brouillon</Badge>;
      case ReportStatus.PUBLISHED:
        return <Badge variant="outline" className="text-green-600 border-green-200">Publié</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getActionButton = (matchWithStatus: any) => {
    if (!matchWithStatus.canEdit) return null;

    const isPublished = matchWithStatus.reportStatus === ReportStatus.PUBLISHED;

    return (
      <Link
        to="/manager/assessment/$matchId"
        params={{ matchId: matchWithStatus.match.id.value }}
      >
        <Button size="sm" variant={isPublished ? "secondary" : "outline"}>
          {isPublished ? (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Voir
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              {matchWithStatus.reportStatus === ReportStatus.NONE ? 'Créer' : 'Modifier'}
            </>
          )}
        </Button>
      </Link>
    );
  };

  const getStatusFilterLabel = (status: ReportStatus | 'ALL') => {
    switch (status) {
      case 'ALL':
        return 'Tous';
      case ReportStatus.NONE:
        return 'Aucun rapport';
      case ReportStatus.DRAFT:
        return 'Brouillons';
      case ReportStatus.PUBLISHED:
        return 'Publiés';
      default:
        return 'Inconnu';
    }
  };

  const getStatusCount = (status: ReportStatus | 'ALL') => {
    if (!myMatchesData?.matches) return 0;
    if (status === 'ALL') return myMatchesData.matches.length;
    return myMatchesData.matches.filter(match => match.reportStatus === status).length;
  };

  const renderMatchCard = (matchWithStatus: any) => {
    // Enhanced date formatting with error handling
    const formatMatchDate = (dateStr: string, timeStr: string) => {
      try {
        const cleanTime = timeStr.split('.')[0];
        let displayDate = dateStr;
        
        // If date is in YYYY-MM-DD format, format it nicely
        if (dateStr.includes('-')) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            displayDate = format(date, 'MMM d, yyyy');
          }
        }
        
        return `${displayDate} à ${cleanTime}`;
      } catch (error) {
        return `${dateStr} à ${timeStr}`;
      }
    };

    return (
      <Card key={matchWithStatus.match.id.value} className="border-l-4 border-l-blue-500 w-full">
        <CardContent className="p-4 w-full">
          <div className="flex justify-between items-start w-full">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg">
                {matchWithStatus.match.homeTeam} vs {matchWithStatus.match.awayTeam}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {matchWithStatus.match.division}
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatMatchDate(matchWithStatus.match.date, matchWithStatus.match.time)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>{matchWithStatus.match.umpireAName} & {matchWithStatus.match.umpireBName}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2 ml-4">
              {getStatusBadge(matchWithStatus.reportStatus)}
              {getActionButton(matchWithStatus)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header title="Reporting" />
      <div className="w-full px-4 py-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full max-w-none space-y-8">

          {/* View Toggle */}
          <div className="flex justify-center">
            <div className="bg-white rounded-lg p-1 shadow-sm border">
              <Button
                variant={activeView === 'my-matches' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('my-matches')}
                className="mr-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Mes matches
              </Button>
              <Button
                variant={activeView === 'all-reports' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('all-reports')}
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Tous les rapports publiés
              </Button>
            </div>
          </div>

          {/* My Matches View */}
          {activeView === 'my-matches' && (
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
                  <div className="flex flex-wrap gap-2">
                    {(['ALL', ReportStatus.NONE, ReportStatus.DRAFT, ReportStatus.PUBLISHED] as const).map((status) => (
                      <Button
                        key={status}
                        variant={statusFilter === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter(status)}
                        className="flex items-center space-x-2"
                      >
                        <span>{getStatusFilterLabel(status)}</span>
                        <Badge
                          variant="secondary"
                          className={`ml-1 ${statusFilter === status ? 'bg-white text-blue-600' : 'bg-gray-100'}`}
                        >
                          {getStatusCount(status)}
                        </Badge>
                      </Button>
                    ))}
                  </div>
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
                        <p className="text-gray-500 text-lg">Aucun match avec le statut "{getStatusFilterLabel(statusFilter)}"</p>
                        <p className="text-sm text-gray-400 mt-2">Essayez de changer le filtre pour voir d'autres matches</p>
                      </div>
                    ) : (
                      <div className="space-y-4 w-full">
                        {sortedAndFilteredMatches.map(renderMatchCard)}
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
                              Rapports à traiter ({groupedMatches.priorityMatches.length})
                            </Badge>
                            <div className="h-px bg-orange-200 flex-1"></div>
                          </div>
                          {groupedMatches.priorityMatches.map(renderMatchCard)}
                        </div>
                      )}

                      {/* Separator and Published Section */}
                      {groupedMatches.publishedMatches.length > 0 && (
                        <div className="space-y-4 w-full">
                          <div className="flex items-center space-x-2">
                            <div className="h-px bg-green-200 flex-1"></div>
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                              Rapports publiés ({groupedMatches.publishedMatches.length})
                            </Badge>
                            <div className="h-px bg-green-200 flex-1"></div>
                          </div>
                          {groupedMatches.publishedMatches.map(renderMatchCard)}
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
          )}

          {/* All Published Reports Table View */}
          {activeView === 'all-reports' && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ClipboardList className="h-5 w-5" />
                  <span>Tous les Rapports Publiés</span>
                </CardTitle>
                <CardDescription>
                  Vue synthétique de tous les rapports d'évaluation publiés
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full p-0">
                {loadingAllReports ? (
                  <div className="p-6">
                    <div className="space-y-4 w-full">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse w-full" />
                      ))}
                    </div>
                  </div>
                ) : !allReportsData?.reports || allReportsData.reports.length === 0 ? (
                  <div className="text-center py-12 w-full">
                    <ClipboardList className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Aucun rapport publié</p>
                    <p className="text-sm text-gray-400 mt-2">Les rapports publiés apparaîtront ici</p>
                  </div>
                ) : (
                  <ReportsTable
                    reports={sortedReports}
                    currentAssessorId={user?.id || ''}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}