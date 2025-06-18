import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/lib/api';
import { authService } from '@/lib/auth';
import { format } from 'date-fns';
import { FileText, TrendingUp, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/umpire/dashboard')({
  beforeLoad: () => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'umpire') {
      throw new Error('Unauthorized');
    }
  },
  component: UmpireDashboard,
});

function UmpireDashboard() {
  const user = authService.getCurrentUser();
  const { t } = useTranslation('dashboard');
  
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', user?.id],
    queryFn: () => apiService.getReports(user?.id || '', user?.role || ''),
  });

  const averageScore = reports?.length 
    ? reports.reduce((acc, report) => {
        const total = report.assessment.umpireAScores.arrivalTime + 
                     report.assessment.umpireAScores.generalAppearance + 
                     report.assessment.umpireAScores.positioningPitch + 
                     report.assessment.umpireAScores.positioningD;
        return acc + total;
      }, 0) / reports.length
    : 0;

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header title={t('umpire.title')} showNavigation={false} />
      
      <div className="w-full px-4 py-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full max-w-none space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <Card className="w-full">
              <CardContent className="p-6 text-center w-full">
                <FileText className="h-10 w-10 mx-auto text-blue-600 mb-3" />
                <div className="text-3xl font-bold">{reports?.length || 0}</div>
                <div className="text-sm text-gray-600 mt-1">{t('umpire.stats.totalReports')}</div>
              </CardContent>
            </Card>
            
            <Card className="w-full">
              <CardContent className="p-6 text-center w-full">
                <TrendingUp className="h-10 w-10 mx-auto text-green-600 mb-3" />
                <div className="text-3xl font-bold">{averageScore.toFixed(1)}</div>
                <div className="text-sm text-gray-600 mt-1">{t('umpire.stats.averageScore')}</div>
              </CardContent>
            </Card>
            
            <Card className="w-full">
              <CardContent className="p-6 text-center w-full">
                <Calendar className="h-10 w-10 mx-auto text-purple-600 mb-3" />
                <div className="text-3xl font-bold">{reports?.length ? format(new Date(reports[0].createdAt), 'MMM d') : 'N/A'}</div>
                <div className="text-sm text-gray-600 mt-1">{t('umpire.stats.lastAssessment')}</div>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t('umpire.reports.title')}</CardTitle>
              <CardDescription>{t('umpire.reports.description')}</CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              {isLoading ? (
                <div className="space-y-4 w-full">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse w-full" />
                  ))}
                </div>
              ) : reports?.length ? (
                <div className="space-y-6 w-full">
                  {reports.map((report) => {
                    const scores = report.assessment.umpireAScores;
                    const totalScore = scores.arrivalTime + scores.generalAppearance + scores.positioningPitch + scores.positioningD;
                    const section1Score = scores.arrivalTime + scores.generalAppearance;
                    const section2Score = scores.positioningPitch + scores.positioningD;
                    
                    return (
                      <Card key={report.id} className="border-l-4 border-l-blue-500 w-full">
                        <CardContent className="p-6 w-full">
                          <div className="flex justify-between items-start mb-4 w-full">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-lg truncate">{report.match.homeTeam} vs {report.match.awayTeam}</div>
                              <div className="text-sm text-gray-600 mt-1">{report.match.division}</div>
                              <div className="text-xs text-gray-500 mt-2">
                                {t('manager.recentReports.assessedBy', { name: report.assessorName })} • {format(new Date(report.createdAt), 'MMM d, yyyy')}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-blue-600">{totalScore}/6</div>
                              <div className="text-xs text-gray-500">{t('common:labels.totalScore')}</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm w-full">
                            <div className="space-y-2 w-full">
                              <div className="font-semibold text-gray-700 text-base">{t('umpire.reports.sections.beforeAfter')}</div>
                              <div className="text-sm text-gray-600">
                                {t('umpire.reports.criteria.arrival')}: {scores.arrivalTime > 0 ? 'OK' : 'Not OK'} ({scores.arrivalTime > 0 ? '+' : ''}{scores.arrivalTime})
                              </div>
                              <div className="text-sm text-gray-600">
                                {t('umpire.reports.criteria.appearance')}: {scores.generalAppearance > 0 ? 'OK' : 'Not OK'} (+{scores.generalAppearance})
                              </div>
                              <div className="font-semibold text-blue-600 mt-2">Score: {section1Score}/2</div>
                            </div>
                            
                            <div className="space-y-2 w-full">
                              <div className="font-semibold text-gray-700 text-base">{t('umpire.reports.sections.positioning')}</div>
                              <div className="text-sm text-gray-600">
                                {t('umpire.reports.criteria.pitch')}: {scores.positioningPitch === 2 ? 'OK' : scores.positioningPitch === 1 ? 'Partial' : 'Not OK'} (+{scores.positioningPitch})
                              </div>
                              <div className="text-sm text-gray-600">
                                {t('umpire.reports.criteria.dArea')}: {scores.positioningD === 2 ? 'OK' : scores.positioningD === 1 ? 'Partial' : 'Not OK'} (+{scores.positioningD})
                              </div>
                              <div className="font-semibold text-blue-600 mt-2">Score: {section2Score}/4</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 w-full">
                  <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">{t('umpire.reports.noReports')}</p>
                  <p className="text-sm text-gray-400 mt-2">{t('umpire.reports.noReportsDescription')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}