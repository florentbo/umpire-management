import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ManagerLayout } from '@/presentation/components/layout/ManagerLayout';
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
import { assessmentConfigLevelEnum } from '../../../gen/types/AssessmentConfig';

// Import the specialized components
import { CreateAssessmentView } from '@/presentation/components/assessment/CreateAssessmentView';
import { EditAssessmentView } from '@/presentation/components/assessment/EditAssessmentView';
import { ReadAssessmentView } from '@/presentation/components/assessment/ReadAssessmentView';

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

  // Load match data without authorization check for viewing published reports
  const { data: match, isLoading: matchLoading } = useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      // First try to get the match normally
      const normalMatch = await apiService.getMatch(matchId);
      if (normalMatch) return normalMatch;
      
      // If not found (due to authorization), try to get it from CSV directly for viewing published reports
      const response = await fetch('/matches/games.csv');
      const csvText = await response.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const [
          id, date, time, umpireA, umpireAId, umpireB, umpireBId,
          umpireManagerEmail, umpireManagerId, homeTeam, awayTeam, division
        ] = line.split(';');
        
        if (id === matchId) {
          return {
            id,
            date,
            time: time.split('.')[0],
            umpireA,
            umpireB,
            umpireAId,
            umpireBId,
            umpireManagerEmail,
            umpireManagerId,
            homeTeam,
            awayTeam,
            division
          };
        }
      }
      
      return null;
    },
  });

  const { data: assessmentConfig, isLoading: configLoading } = useQuery(
    useAssessmentConfig(assessmentConfigLevelEnum.junior)
  );

  // Check if this match has a published report or draft
  const { data: matchStatusData, isLoading: statusLoading } = useGetManagerMatchesWithStatus(user?.id || '');

  const isLoading = matchLoading || configLoading || statusLoading;

  if (isLoading) {
    return (
      <ManagerLayout 
        title={t('common:status.loading')}
        showBackButton={true}
      >
        <div className="animate-pulse space-y-6 w-full">
          <div className="h-32 bg-gray-200 rounded-lg w-full"></div>
          <div className="h-96 bg-gray-200 rounded-lg w-full"></div>
        </div>
      </ManagerLayout>
    );
  }

  if (!match || !assessmentConfig) {
    return (
      <ManagerLayout 
        title={t('dashboard:match.info.notFound')}
        showBackButton={true}
      >
        <div className="w-full text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">{t('dashboard:match.info.notFoundDescription')}</p>
          <Button onClick={() => router.navigate({ to: '/manager/reporting' })} className="mt-4">
            Retour au Reporting
          </Button>
        </div>
      </ManagerLayout>
    );
  }

  // Determine the current status of this match
  const currentMatch = matchStatusData?.matches?.find(
    m => m.match.id.value === matchId
  );

  const reportStatus = currentMatch?.reportStatus || ReportStatus.PUBLISHED; // Default to published for viewing other reports
  const canEdit = currentMatch?.canEdit || false;

  // Render the appropriate view based on status
  const renderAssessmentView = () => {
    // If user can't edit and no current match found, assume it's a published report from another assessor
    if (!canEdit && !currentMatch) {
      return (
        <ReadAssessmentView
          match={match}
          assessmentConfig={assessmentConfig}
          matchId={matchId}
          assessorId={user?.id || ''}
        />
      );
    }

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
    <ManagerLayout 
      title={getPageTitle(reportStatus)}
      showBackButton={true}
    >
      {/* Match Info Header */}
      <Card className={`w-full ${reportStatus === ReportStatus.PUBLISHED ? 'border-blue-200 bg-blue-50' : ''}`}>
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            <span>{match.homeTeam} vs {match.awayTeam}</span>
            {getStatusBadge(reportStatus)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Date:</span>
              <span className="ml-2 text-gray-600">
                {format(new Date(match.date), 'dd/MM/yyyy')}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Heure:</span>
              <span className="ml-2 text-gray-600">{match.time}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Division:</span>
              <span className="ml-2 text-gray-600">{match.division}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Arbitre A:</span>
              <span className="ml-2 text-gray-600">{match.umpireA}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Arbitre B:</span>
              <span className="ml-2 text-gray-600">{match.umpireB}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Content */}
      {renderAssessmentView()}
    </ManagerLayout>
  );

  function getPageTitle(status: ReportStatus): string {
    switch (status) {
      case ReportStatus.PUBLISHED:
        return t('assessment:read.title');
      case ReportStatus.DRAFT:
        return t('assessment:edit.title');
      case ReportStatus.NONE:
      default:
        return t('assessment:create.title');
    }
  }

  function getStatusBadge(status: ReportStatus) {
    switch (status) {
      case ReportStatus.PUBLISHED:
        return (
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
              {t('assessment:status.published')}
            </span>
          </div>
        );
      case ReportStatus.DRAFT:
        return (
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
              {t('assessment:status.draft')}
            </span>
          </div>
        );
      case ReportStatus.NONE:
      default:
        return (
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {t('assessment:status.none')}
            </span>
          </div>
        );
    }
  }
}