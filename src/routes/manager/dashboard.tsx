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
import { Match } from '@/types';

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

  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: apiService.getMatches,
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

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header title={t('manager.title')} />
      <div className="w-full px-4 py-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full max-w-none space-y-8">
          <div className="flex justify-center items-center space-x-4">
            <Button onClick={() => setShowAllGames(!showAllGames)}>
              {showAllGames ? t('manager.hideAllGames') : t('manager.showAllGames')}
            </Button>
            <Button onClick={() => setIsFindGameModalOpen(true)}>
              {t('manager.findGame')}
            </Button>
          </div>

          {/* All Matches */}
          {showAllGames && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>{t('manager.allMatches.title')}</CardTitle>
                <CardDescription>{t('manager.allMatches.description')}</CardDescription>
              </CardHeader>
              <CardContent className="w-full">
                {matchesLoading ? (
                  <div className="space-y-4 w-full">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 w-full">
                    {matches?.map((match) => (
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