import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/lib/api';
import { authService } from '@/lib/auth';
import { useGetManagerMatchesWithStatus } from '@/presentation/hooks/useGetManagerMatchesWithStatus';
import { ReportStatus } from '@/domain/entities/MatchReportStatus';
import { format } from 'date-fns';
import { AlertCircle, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAssessmentConfig } from '@/lib/api-client';
import { AssessmentConfig } from '../../../dist/api';

// Import the specialized components
import { CreateAssessmentView } from '@/components/assessment/CreateAssessmentView';
import { EditAssessmentView } from '@/components/assessment/EditAssessmentView';
import { ReadAssessmentView } from '@/components/assessment/ReadAssessmentView';

export const Route = createFileRoute('/manager/assessment/$matchId')({
  beforeLoad: () => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'umpire_manager') {
      throw new Error('Unauthorized');
    }
  },
  component: AssessmentPage,
});

function AssessmentPage() {
  const { matchId } = Route.useParams();
  const router = useRouter();
  const user = authService.getCurrentUser();
  const { t } = useTranslation(['assessment', 'dashboard', 'common']);

  const { data: match, isLoading: matchLoading } = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => apiService.getMatch(matchId),
  });

  const { data: assessmentConfig, isLoading: configLoading } = useQuery(
    useAssessmentConfig(AssessmentConfig.level.JUNIOR)
  );

  // Check if this match has a published report or draft
  const { data: matchStatusData, isLoading: statusLoading } = useGetManagerMatchesWithStatus(user?.id || '');

  const isLoading = matchLoading || configLoading || statusLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gray-50">
        <Header title={t('common:status.loading')} />
        <div className="w-full px-4 py-6 lg:px-8 xl:px-12">
          <div className="animate-pulse space-y-6 w-full">
            <div className="h-32 bg-gray-200 rounded-lg w-full"></div>
            <div className="h-96 bg-gray-200 rounded-lg w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!match || !assessmentConfig) {
    return (
      <div className="min-h-screen w-full bg-gray-50">
        <Header title={t('dashboard:match.info.notFound')} />
        <div className="w-full px-4 py-6 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">{t('dashboard:match.info.notFoundDescription')}</p>
          <Button onClick={() => router.navigate({ to: '/manager/dashboard' })} className="mt-4">
            {t('dashboard:match.info.backToDashboard')}
          </Button>
        </div>
      </div>
    );
  }

  // Determine the current status of this match
  const currentMatch = matchStatusData?.matches?.find(
    m => m.match.id.value === matchId
  );

  const reportStatus = currentMatch?.reportStatus || ReportStatus.NONE;
  const canEdit = currentMatch?.canEdit || false;

  // Render the appropriate view based on status
  const renderAssessmentView = () => {
    switch (reportStatus) {
      case ReportStatus.PUBLISHED:
        return (
          <ReadAssessmentView
            match={match}
            assessmentConfig={assessmentConfig}
            matchId={matchId}
            assessorId={user?.id || ''}
          />
        );
      
      case ReportStatus.DRAFT:
        return (
          <EditAssessmentView
            match={match}
            assessmentConfig={assessmentConfig}
            matchId={matchId}
            assessorId={user?.id || ''}
            canEdit={canEdit}
          />
        );
      
      case ReportStatus.NONE:
      default:
        return (
          <CreateAssessmentView
            match={match}
            assessmentConfig={assessmentConfig}
            matchId={matchId}
            assessorId={user?.id || ''}
            canEdit={canEdit}
          />
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header title={getPageTitle(reportStatus)} />
      
      <div className="w-full px-4 py-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full max-w-none space-y-8">
          {/* Match Info Header */}
          <Card className={`w-full ${reportStatus === ReportStatus.PUBLISHED ? 'border-green-200 bg-green-50' : ''}`}>
            <CardHeader>
              <CardTitle className="text-xl flex items-center justify-between">
                <span>{match.homeTeam} vs {match.awayTeam}</span>
                {getStatusBadge(reportStatus)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t('dashboard:match.details.division')}:</span>
                  <div className="text-gray-600">{match.division}</div>
                </div>
                <div>
                  <span className="font-medium">{t('dashboard:match.details.date')}:</span>
                  <div className="text-gray-600">{format(new Date(match.date), 'MMM d, yyyy')}</div>
                </div>
                <div>
                  <span className="font-medium">{t('dashboard:match.details.time')}:</span>
                  <div className="text-gray-600">{match.time}</div>
                </div>
                <div>
                  <span className="font-medium">{t('dashboard:match.details.umpires')}:</span>
                  <div className="text-gray-600">{match.umpireA}, {match.umpireB}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Render the appropriate assessment view */}
          {renderAssessmentView()}
        </div>
      </div>
    </div>
  );

  function getPageTitle(status: ReportStatus): string {
    switch (status) {
      case ReportStatus.PUBLISHED:
        return `${t('titles.matchAssessment')} (Lecture seule)`;
      case ReportStatus.DRAFT:
        return `${t('titles.matchAssessment')} (Brouillon)`;
      case ReportStatus.NONE:
      default:
        return t('titles.matchAssessment');
    }
  }

  function getStatusBadge(status: ReportStatus) {
    switch (status) {
      case ReportStatus.PUBLISHED:
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <FileText className="h-5 w-5" />
            <span className="text-sm font-normal">Publié</span>
          </div>
        );
      case ReportStatus.DRAFT:
        return (
          <div className="flex items-center space-x-2 text-orange-600">
            <FileText className="h-5 w-5" />
            <span className="text-sm font-normal">Brouillon</span>
          </div>
        );
      case ReportStatus.NONE:
      default:
        return (
          <div className="flex items-center space-x-2 text-blue-600">
            <FileText className="h-5 w-5" />
            <span className="text-sm font-normal">Nouveau</span>
          </div>
        );
    }
  }
}