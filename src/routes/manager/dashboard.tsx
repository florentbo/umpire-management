import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/lib/api';
import { authService } from '@/lib/auth';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { FileText, Calendar, User, ClipboardList } from 'lucide-react';
import { useGetAllReports } from '@/presentation/hooks/useGetAllReports';
import { useGetManagerMatchesWithStatus } from '@/presentation/hooks/useGetManagerMatchesWithStatus';
import { ReportStatus } from '@/domain/entities/MatchReportStatus';

export const Route = createFileRoute('/manager/dashboard')({
  beforeLoad: () => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'umpire_manager') {
      throw new Error('Unauthorized');
    }
  },
  component: ManagerDashboard,
});

function ManagerDashboard() {
  const { t } = useTranslation('dashboard');
  const user = authService.getCurrentUser();
  const [showMyMatches, setShowMyMatches] = useState(false);

  const { data: myMatchesData, isLoading: loadingMyMatches, refetch: refetchMyMatches } = useGetManagerMatchesWithStatus(user?.id || '');

  const handleShowMyMatches = () => {
    if (!showMyMatches) {
      refetchMyMatches();
    }
    setShowMyMatches(!showMyMatches);
  };

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

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header title={t('manager.title')} />
      <div className="w-full px-4 py-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full max-w-none space-y-8">
          <div className="flex justify-center items-center space-x-4">
            <Button 
              onClick={handleShowMyMatches} 
              disabled={loadingMyMatches}
              variant="outline"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              {loadingMyMatches ? 'Chargement...' : showMyMatches ? 'Masquer mes matches' : 'Mes matches avec statut'}
            </Button>
          </div>

          {/* My Matches with Status Section */}
          {showMyMatches && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ClipboardList className="h-5 w-5" />
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
                              {matchWithStatus.canEdit && (
                                <Link
                                  to="/manager/assessment/$matchId"
                                  params={{ matchId: matchWithStatus.match.id.value }}
                                >
                                  <Button size="sm" variant="outline">
                                    {matchWithStatus.reportStatus === ReportStatus.NONE ? 'Créer' : 'Modifier'}
                                  </Button>
                                </Link>
                              )}
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