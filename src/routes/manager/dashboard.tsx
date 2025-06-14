import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/lib/api';
import { authService } from '@/lib/auth';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

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
  
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: apiService.getMatches,
  });

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header title={t('manager.title')} />
      
      <div className="w-full px-4 py-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full max-w-none space-y-8">
          {/* All Matches */}
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
        </div>
      </div>
    </div>
  );
}