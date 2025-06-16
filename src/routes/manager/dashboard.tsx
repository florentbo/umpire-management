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
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Match } from '@/types';
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
  const [isFindGameModalOpen, setIsFindGameModalOpen] = useState(false);
  const [searchDate, setSearchDate] = useState('');
  const [umpire, setUmpire] = useState('');
  const [searchResults, setSearchResults] = useState<Match[]>([]);
  const [showAllGames, setShowAllGames] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
  const [showMyMatches, setShowMyMatches] = useState(false);

  const { data: matches = [] as Match[] } = useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: () => apiService.getMatches(),
  });

  const { data: allReportsData, isLoading: loadingReports, refetch: refetchReports } = useGetAllReports();

  const { data: myMatchesData, isLoading: loadingMyMatches, refetch: refetchMyMatches } = useGetManagerMatchesWithStatus(user?.id || '');

  useEffect(() => {
    if (umpire.length >= 4) {
      const filteredMatches = matches?.filter(match =>
        match.umpireA.toLowerCase().includes(umpire.toLowerCase()) ||
        match.umpireB.toLowerCase().includes(umpire.toLowerCase())
      ) || [];
      setSearchResults(filteredMatches);
    } else {
      setSearchResults([]);
    }
  }, [umpire, matches]);

  const handleFindGame = () => {
    const filteredMatches = matches?.filter(match => {
      const matchDate = format(new Date(match.date), 'yyyy-MM-dd');
      return matchDate === searchDate &&
             (match.umpireA.toLowerCase().includes(umpire.toLowerCase()) ||
              match.umpireB.toLowerCase().includes(umpire.toLowerCase()));
    }) || [];
    setSearchResults(filteredMatches);
  };

  const handleShowAllReports = () => {
    if (!showAllReports) {
      refetchReports();
    }
    setShowAllReports(!showAllReports);
  };

  const handleShowMyMatches = () => {
    if (!showMyMatches) {
      refetchMyMatches();
    }
    setShowMyMatches(!showMyMatches);
  };

  const getGradeColor = (level: string) => {
    switch (level) {
      case 'BELOW_EXPECTATION':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'AT_CURRENT_LEVEL':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ABOVE_EXPECTATION':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGradeLabel = (level: string) => {
    switch (level) {
      case 'BELOW_EXPECTATION':
        return 'En dessous des attentes';
      case 'AT_CURRENT_LEVEL':
        return 'Au niveau actuel';
      case 'ABOVE_EXPECTATION':
        return 'Au-dessus des attentes';
      default:
        return level;
    }
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
            <Button onClick={() => setShowAllGames(!showAllGames)}>
              {showAllGames ? t('manager.hideAllGames') : t('manager.showAllGames')}
            </Button>
            <Button 
              onClick={handleShowAllReports} 
              disabled={loadingReports}
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              {loadingReports ? 'Chargement...' : showAllReports ? 'Masquer les rapports' : 'Voir tous les rapports'}
            </Button>
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

          {/* All Reports Section */}
          {showAllReports && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Tous les Rapports d'Évaluation</span>
                </CardTitle>
                <CardDescription>
                  Tous les rapports d'évaluation soumis dans le système
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full">
                {loadingReports ? (
                  <div className="space-y-4 w-full">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse w-full" />
                    ))}
                  </div>
                ) : !allReportsData?.reports || allReportsData.reports.length === 0 ? (
                  <div className="text-center py-12 w-full">
                    <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Aucun rapport trouvé</p>
                    <p className="text-sm text-gray-400 mt-2">Les rapports d'évaluation apparaîtront ici une fois soumis</p>
                  </div>
                ) : (
                  <div className="space-y-4 w-full">
                    {allReportsData.reports.map((report) => (
                      <Card key={report.id} className="border-l-4 border-l-blue-500 w-full">
                        <CardContent className="p-6 w-full">
                          <div className="flex justify-between items-start mb-4 w-full">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-lg truncate">
                                {report.matchInfo.homeTeam} vs {report.matchInfo.awayTeam}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {report.matchInfo.division}
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{format(new Date(report.submittedAt), 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span>Évalué par: {report.assessorId}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            {/* Umpire A */}
                            <div className="space-y-3 w-full">
                              <div className="font-semibold text-gray-700">
                                Arbitre A: {report.matchInfo.umpireAName}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Score Total:</span>
                                <span className="font-bold text-blue-600">
                                  {report.umpireAData.totalScore}/{report.umpireAData.maxScore}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Pourcentage:</span>
                                <span className="font-medium text-gray-700">
                                  {report.umpireAData.percentage.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Niveau:</span>
                                <Badge className={`text-xs ${getGradeColor(report.umpireAData.level)}`}>
                                  {getGradeLabel(report.umpireAData.level)}
                                </Badge>
                              </div>
                              {report.umpireAData.conclusion && (
                                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                  <strong>Conclusion:</strong> {report.umpireAData.conclusion}
                                </div>
                              )}
                            </div>
                            
                            {/* Umpire B */}
                            <div className="space-y-3 w-full">
                              <div className="font-semibold text-gray-700">
                                Arbitre B: {report.matchInfo.umpireBName}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Score Total:</span>
                                <span className="font-bold text-blue-600">
                                  {report.umpireBData.totalScore}/{report.umpireBData.maxScore}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Pourcentage:</span>
                                <span className="font-medium text-gray-700">
                                  {report.umpireBData.percentage.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Niveau:</span>
                                <Badge className={`text-xs ${getGradeColor(report.umpireBData.level)}`}>
                                  {getGradeLabel(report.umpireBData.level)}
                                </Badge>
                              </div>
                              {report.umpireBData.conclusion && (
                                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                  <strong>Conclusion:</strong> {report.umpireBData.conclusion}
                                </div>
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

          {/* All Matches */}
          {showAllGames && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>{t('manager.allMatches.title')}</CardTitle>
                <CardDescription>{t('manager.allMatches.description')}</CardDescription>
              </CardHeader>
              <CardContent className="w-full">
                {matches.length === 0 ? (
                  <div className="space-y-4 w-full">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 w-full">
                    {matches.map((match: Match) => (
                      <Link
                        key={match.id}
                        to="/manager/assessment/$matchId"
                        params={{ matchId: match.id }}
                        className="w-full block"
                      >
                        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b last:border-b-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{match.homeTeam}</span>
                              <span className="text-gray-400">vs</span>
                              <span className="font-medium">{match.awayTeam}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {match.umpireA} & {match.umpireB}
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500 ml-4 whitespace-nowrap">
                            <div>{format(new Date(match.date), 'MMM d')}</div>
                            <div className="text-xs mt-1">{match.time}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Find Game Modal */}
      <Dialog open={isFindGameModalOpen} onOpenChange={setIsFindGameModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('manager.findGameModal.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">{t('manager.findGameModal.date')}</Label>
              <Input
                id="date"
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="umpire">{t('manager.findGameModal.umpire')}</Label>
              <Input
                id="umpire"
                value={umpire}
                onChange={(e) => setUmpire(e.target.value)}
                placeholder={t('manager.findGameModal.umpirePlaceholder')}
              />
            </div>
            <Button onClick={handleFindGame}>
              {t('manager.findGameModal.search')}
            </Button>
            {searchResults.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium">{t('manager.findGameModal.results')}</h3>
                <div className="space-y-2">
                  {searchResults.map((match) => (
                    <Link
                      key={match.id}
                      to="/manager/assessment/$matchId"
                      params={{ matchId: match.id }}
                      className="block p-2 hover:bg-gray-50 rounded"
                    >
                      {match.homeTeam} vs {match.awayTeam} - {format(new Date(match.date), 'MMM d')} {match.time} - Umpires: {match.umpireA} & {match.umpireB}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}