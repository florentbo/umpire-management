import { createFileRoute, Link } from '@tanstack/react-router';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Calendar, User, Eye, Edit, FileText, ClipboardList } from 'lucide-react';
import { useGetManagerMatchesWithStatus } from '@/presentation/hooks/useGetManagerMatchesWithStatus';
import { useGetAllPublishedReports } from '@/presentation/hooks/useGetAllPublishedReports';
import { ReportStatus } from '@/domain/entities/MatchReportStatus';

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
  const { t } = useTranslation('dashboard');
  const user = authService.getCurrentUser();
  const [activeView, setActiveView] = useState<'my-matches' | 'all-reports'>('my-matches');

  // Get matches with status for the current manager
  const { data: myMatchesData, isLoading: loadingMyMatches } = useGetManagerMatchesWithStatus(user?.id || '');

  // Get all published reports
  const { data: allReportsData, isLoading: loadingAllReports } = useGetAllPublishedReports();

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

  const getGradeColor = (percentage: number) => {
    if (percentage < 60) return 'text-red-600';
    if (percentage < 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getGradeLabel = (percentage: number) => {
    if (percentage < 60) return 'En dessous des attentes';
    if (percentage < 70) return 'Au niveau actuel';
    return 'Au-dessus des attentes';
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
                Mes matches avec statut
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
                  <span>Mes Matches avec Statut des Rapports</span>
                </CardTitle>
                <CardDescription>
                  Vos matches assignés avec le statut des rapports d'évaluation
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full">
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
                ) : (
                  <div className="space-y-4 w-full">
                    {myMatchesData.matches.map((matchWithStatus) => (
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
                                  <span>{format(new Date(matchWithStatus.match.date), 'MMM d, yyyy')}</span>
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* All Published Reports View */}
          {activeView === 'all-reports' && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ClipboardList className="h-5 w-5" />
                  <span>Tous les Rapports Publiés</span>
                </CardTitle>
                <CardDescription>
                  Vue complète de tous les rapports d'évaluation publiés dans le système
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full">
                {loadingAllReports ? (
                  <div className="space-y-4 w-full">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse w-full" />
                    ))}
                  </div>
                ) : !allReportsData?.reports || allReportsData.reports.length === 0 ? (
                  <div className="text-center py-12 w-full">
                    <ClipboardList className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Aucun rapport publié</p>
                    <p className="text-sm text-gray-400 mt-2">Les rapports publiés apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="space-y-4 w-full">
                    {allReportsData.reports.map((report) => (
                      <Card key={report.id} className={`w-full ${report.assessorId === user?.id ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-blue-300'}`}>
                        <CardContent className="p-6 w-full">
                          <div className="flex justify-between items-start w-full">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-xl mb-2">
                                {report.matchInfo.homeTeam} vs {report.matchInfo.awayTeam}
                              </div>
                              <div className="text-sm text-gray-600 mb-3">
                                {report.matchInfo.division}
                              </div>
                              
                              {/* Match Details */}
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{format(new Date(report.matchInfo.date), 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span>{report.matchInfo.umpireAName} & {report.matchInfo.umpireBName}</span>
                                </div>
                                <div className="text-blue-600">
                                  Évalué par: {report.assessorId}
                                </div>
                              </div>

                              {/* Umpire Grades */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="font-medium text-sm text-gray-700 mb-1">
                                    Arbitre A: {report.matchInfo.umpireAName}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="text-lg font-bold text-blue-600">
                                      {report.umpireAData.totalScore}/{report.umpireAData.maxScore}
                                    </div>
                                    <div className={`text-sm font-medium ${getGradeColor(report.umpireAData.percentage)}`}>
                                      {report.umpireAData.percentage.toFixed(1)}% - {getGradeLabel(report.umpireAData.percentage)}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="font-medium text-sm text-gray-700 mb-1">
                                    Arbitre B: {report.matchInfo.umpireBName}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="text-lg font-bold text-blue-600">
                                      {report.umpireBData.totalScore}/{report.umpireBData.maxScore}
                                    </div>
                                    <div className={`text-sm font-medium ${getGradeColor(report.umpireBData.percentage)}`}>
                                      {report.umpireBData.percentage.toFixed(1)}% - {getGradeLabel(report.umpireBData.percentage)}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Submission Date */}
                              <div className="text-xs text-gray-500 mt-3">
                                Publié le {format(new Date(report.submittedAt), 'dd/MM/yyyy à HH:mm')}
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end space-y-2 ml-4">
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                Publié
                              </Badge>
                              {report.assessorId === user?.id && (
                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                  Votre rapport
                                </Badge>
                              )}
                              <Link
                                to="/manager/assessment/$matchId"
                                params={{ matchId: report.matchId }}
                              >
                                <Button size="sm" variant="secondary">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir détails
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}