import { createFileRoute, Link } from '@tanstack/react-router';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Calendar, User, Eye, Edit, FileText, ClipboardList, Clock } from 'lucide-react';
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

  const getGradeColor = (level: string) => {
    switch (level) {
      case 'BELOW_EXPECTATION':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'AT_CURRENT_LEVEL':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'ABOVE_EXPECTATION':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getGradeLabel = (level: string) => {
    switch (level) {
      case 'BELOW_EXPECTATION':
        return 'En dessous';
      case 'AT_CURRENT_LEVEL':
        return 'Au niveau';
      case 'ABOVE_EXPECTATION':
        return 'Au-dessus';
      default:
        return level;
    }
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

          {/* All Published Reports Grid View */}
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
              <CardContent className="w-full">
                {loadingAllReports ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse w-full" />
                    ))}
                  </div>
                ) : !allReportsData?.reports || allReportsData.reports.length === 0 ? (
                  <div className="text-center py-12 w-full">
                    <ClipboardList className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Aucun rapport publié</p>
                    <p className="text-sm text-gray-400 mt-2">Les rapports publiés apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                    {allReportsData.reports.map((report) => (
                      <Card 
                        key={report.id} 
                        className={`w-full hover:shadow-lg transition-shadow cursor-pointer ${
                          report.assessorId === user?.id ? 'ring-2 ring-blue-200 bg-blue-50' : ''
                        }`}
                        title={`Match ID: ${report.matchId}`}
                      >
                        <CardContent className="p-4 w-full">
                          {/* Match Header */}
                          <div className="mb-4">
                            <div className="font-bold text-lg text-gray-900 mb-1">
                              {report.matchInfo.homeTeam} vs {report.matchInfo.awayTeam}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {report.matchInfo.division}
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(report.matchInfo.date), 'dd/MM/yyyy')}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{report.matchInfo.time}</span>
                              </div>
                            </div>
                          </div>

                          {/* Umpires Assessment */}
                          <div className="space-y-3 mb-4">
                            {/* Umpire A */}
                            <div className="bg-white rounded-lg p-3 border">
                              <div className="flex justify-between items-center mb-2">
                                <div className="font-medium text-sm text-gray-700">
                                  {report.matchInfo.umpireAName}
                                </div>
                                <div className="text-lg font-bold text-blue-600">
                                  {report.umpireAData.totalScore}/{report.umpireAData.maxScore}
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                  {report.umpireAData.percentage.toFixed(1)}%
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs px-2 py-1 ${getGradeColor(report.umpireAData.level)}`}
                                >
                                  {getGradeLabel(report.umpireAData.level)}
                                </Badge>
                              </div>
                            </div>

                            {/* Umpire B */}
                            <div className="bg-white rounded-lg p-3 border">
                              <div className="flex justify-between items-center mb-2">
                                <div className="font-medium text-sm text-gray-700">
                                  {report.matchInfo.umpireBName}
                                </div>
                                <div className="text-lg font-bold text-blue-600">
                                  {report.umpireBData.totalScore}/{report.umpireBData.maxScore}
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                  {report.umpireBData.percentage.toFixed(1)}%
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs px-2 py-1 ${getGradeColor(report.umpireBData.level)}`}
                                >
                                  {getGradeLabel(report.umpireBData.level)}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                              <div className="font-medium text-blue-600">{report.assessorName}</div>
                              <div>{format(new Date(report.submittedAt), 'dd/MM/yyyy')}</div>
                            </div>
                            <Link
                              to="/manager/assessment/$matchId"
                              params={{ matchId: report.matchId }}
                            >
                              <Button size="sm" variant="outline" className="text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                Voir
                              </Button>
                            </Link>
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