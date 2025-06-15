import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiService } from '@/lib/api';
import { authService } from '@/lib/auth';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Match, Report } from '@/types';
import { supabase } from '@/lib/supabase';
import { FileText, Calendar, User } from 'lucide-react';

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
  const [isFindGameModalOpen, setIsFindGameModalOpen] = useState(false);
  const [searchDate, setSearchDate] = useState('');
  const [umpire, setUmpire] = useState('');
  const [searchResults, setSearchResults] = useState<Match[]>([]);
  const [showAllGames, setShowAllGames] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
  const [allReports, setAllReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const { data: matches = [] as Match[] } = useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: () => apiService.getMatches(),
  });

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

  const fetchAllReports = async () => {
    setLoadingReports(true);
    try {
      const { data: reports, error } = await supabase
        .from('match_reports')
        .select(`
          *,
          assessments (*)
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        return;
      }

      setAllReports(reports || []);
      setShowAllReports(true);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  const calculateTotalScore = (umpireData: any) => {
    if (!umpireData?.topics) return 0;
    return umpireData.topics.reduce((total: number, topic: any) => {
      return total + (topic.questionResponses?.reduce((topicTotal: number, response: any) => {
        return topicTotal + (response.points || 0);
      }, 0) || 0);
    }, 0);
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
              onClick={fetchAllReports} 
              disabled={loadingReports}
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              {loadingReports ? 'Chargement...' : showAllReports ? 'Masquer les rapports' : 'Voir tous les rapports'}
            </Button>
          </div>

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
                ) : allReports.length === 0 ? (
                  <div className="text-center py-12 w-full">
                    <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Aucun rapport trouvé</p>
                    <p className="text-sm text-gray-400 mt-2">Les rapports d'évaluation apparaîtront ici une fois soumis</p>
                  </div>
                ) : (
                  <div className="space-y-4 w-full">
                    {allReports.map((report) => {
                      const assessment = report.assessments;
                      const matchInfo = report.match_info;
                      const umpireAScore = calculateTotalScore(assessment?.umpire_a_data);
                      const umpireBScore = calculateTotalScore(assessment?.umpire_b_data);
                      const umpireAGrade = assessment?.umpire_a_data?.grade;
                      const umpireBGrade = assessment?.umpire_b_data?.grade;

                      return (
                        <Card key={report.id} className="border-l-4 border-l-blue-500 w-full">
                          <CardContent className="p-6 w-full">
                            <div className="flex justify-between items-start mb-4 w-full">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-lg truncate">
                                  {matchInfo?.homeTeam} vs {matchInfo?.awayTeam}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {matchInfo?.division}
                                </div>
                                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{format(new Date(report.submitted_at), 'MMM d, yyyy')}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <User className="h-3 w-3" />
                                    <span>Évalué par: {assessment?.assessor_id}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                              {/* Umpire A */}
                              <div className="space-y-3 w-full">
                                <div className="font-semibold text-gray-700">
                                  Arbitre A: {matchInfo?.umpireAName}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Score Total:</span>
                                  <span className="font-bold text-blue-600">{umpireAScore}</span>
                                </div>
                                {umpireAGrade && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Niveau:</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(umpireAGrade.level)}`}>
                                      {getGradeLabel(umpireAGrade.level)}
                                    </span>
                                  </div>
                                )}
                                {assessment?.umpire_a_data?.conclusion && (
                                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                    <strong>Conclusion:</strong> {assessment.umpire_a_data.conclusion}
                                  </div>
                                )}
                              </div>
                              
                              {/* Umpire B */}
                              <div className="space-y-3 w-full">
                                <div className="font-semibold text-gray-700">
                                  Arbitre B: {matchInfo?.umpireBName}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Score Total:</span>
                                  <span className="font-bold text-blue-600">{umpireBScore}</span>
                                </div>
                                {umpireBGrade && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Niveau:</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(umpireBGrade.level)}`}>
                                      {getGradeLabel(umpireBGrade.level)}
                                    </span>
                                  </div>
                                )}
                                {assessment?.umpire_b_data?.conclusion && (
                                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                    <strong>Conclusion:</strong> {assessment.umpire_b_data.conclusion}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
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