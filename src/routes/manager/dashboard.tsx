import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiService } from '@/lib/api';
import { authService } from '@/lib/auth';
import { format } from 'date-fns';
import { Plus, FileText, Calendar, Clock } from 'lucide-react';
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
  const user = authService.getCurrentUser();
  const { t } = useTranslation('dashboard');
  
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: apiService.getMatches,
  });

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports', user?.id],
    queryFn: () => apiService.getReports(user?.id || '', user?.role || ''),
  });

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header title={t('manager.title')} />
      
      <div className="w-full px-4 py-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full max-w-none space-y-8">
          {/* Quick Actions */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>{t('manager.quickActions.title')}</span>
              </CardTitle>
              <CardDescription>{t('manager.quickActions.description')}</CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                {matches?.slice(0, 2).map((match) => (
                  <Link
                    key={match.id}
                    to="/manager/assessment/$matchId"
                    params={{ matchId: match.id }}
                    className="w-full block"
                  >
                    <Button variant="outline" className="w-full h-auto p-6 justify-start hover:bg-gray-50 transition-colors">
                      <div className="text-left w-full">
                        <div className="font-semibold text-base">{match.homeTeam} vs {match.awayTeam}</div>
                        <div className="text-sm text-gray-600 mt-1">{match.division}</div>
                        <div className="text-xs text-gray-500 flex items-center mt-2">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(match.date), 'MMM d')}
                          <Clock className="h-3 w-3 ml-3 mr-1" />
                          {match.time}
                        </div>
                      </div>
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>{t('manager.recentReports.title')}</span>
              </CardTitle>
              <CardDescription>{t('manager.recentReports.description')}</CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              {reportsLoading ? (
                <div className="space-y-4 w-full">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse w-full" />
                  ))}
                </div>
              ) : reports?.length ? (
                <div className="space-y-4 w-full">
                  {reports.slice(0, 5).map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg w-full hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start w-full">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {report.match.homeTeam} vs {report.match.awayTeam}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {t('manager.recentReports.assessedBy', { name: report.assessorName })} • {format(new Date(report.createdAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-blue-600 ml-4">
                          {report.assessment.umpireAScores.arrivalTime + 
                           report.assessment.umpireAScores.generalAppearance + 
                           report.assessment.umpireAScores.positioningPitch + 
                           report.assessment.umpireAScores.positioningD}/6
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8 w-full">{t('manager.recentReports.noReports')}</p>
              )}
            </CardContent>
          </Card>

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
                    <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 w-full">
                  {matches?.map((match) => (
                    <Link
                      key={match.id}
                      to="/manager/assessment/$matchId"
                      params={{ matchId: match.id }}
                      className="w-full block"
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer w-full border-l-4 border-l-blue-500">
                        <CardContent className="p-4 w-full">
                          <div className="flex justify-between items-center w-full">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-base truncate">{match.homeTeam} vs {match.awayTeam}</div>
                              <div className="text-sm text-gray-600 mt-1">{match.division}</div>
                              <div className="text-sm text-gray-500 mt-2">
                                {t('dashboard:match.details.umpires')}: {match.umpireA}, {match.umpireB}
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500 ml-4">
                              <div className="font-medium">{format(new Date(match.date), 'MMM d, yyyy')}</div>
                              <div className="text-xs mt-1">{match.time}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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