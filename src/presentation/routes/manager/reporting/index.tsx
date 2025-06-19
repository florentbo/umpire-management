import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@/presentation/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { useState } from 'react';
import { FileText, ClipboardList, Filter } from 'lucide-react';
import { ReportsTable } from '@/presentation/components/reporting/ReportsTable';
import { ReportStatus } from '@/domain/entities/MatchReportStatus';
import { ManagerMatchCard } from '@/presentation/components/reporting/ManagerMatchCard';
import { ReportStatusFilter } from '@/presentation/components/reporting/ReportStatusFilter';
import { useManagerMatchesViewModel } from '@/presentation/hooks/useManagerMatchesViewModel';

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

  const {
    loadingMyMatches,
    loadingAllReports,
    sortedAndFilteredMatches,
    groupedMatches,
    sortedReports,
    myMatchesData,
    allReportsData,
    getStatusCount,
  } = useManagerMatchesViewModel(user?.id || '', statusFilter);

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
                              Rapports à traiter ({groupedMatches.priorityMatches.length})
                            </Badge>
                            <div className="h-px bg-orange-200 flex-1"></div>
                          </div>
                          {groupedMatches.priorityMatches.map(matchWithStatus => (
                            <ManagerMatchCard key={matchWithStatus.match.id.value} matchWithStatus={matchWithStatus} />
                          ))}
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
                          {groupedMatches.publishedMatches.map(matchWithStatus => (
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