import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/presentation/components/layout/Header';
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
      <div className="min-h-screen w-full bg-gray-50">
        <Header 
          title={t('common:status.loading')} 
          showNavigation={false}
          showBackButton={true}
        />
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
        <Header 
          title={t('dashboard:match.info.notFound')} 
          showNavigation={false}
          showBackButton={true}
        />
        <div className="w-full px-4 py-6 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">{t('dashboard:match.info.notFoundDescription')}</p>
          <Button onClick={() => router.navigate({ to: '/manager/reporting' })} className="mt-4">
            Retour au Reporting
          </Button>
        </div>
      </div>
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
    <div className="min-h-screen w-full bg-gray-50">
      <Header 
        title={getPageTitle(reportStatus)} 
        showNavigation={false}
        showBackButton={true}
      />
      
      <div className="w-full px-4 py-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full max-w-none space-y-8">
          {/* Match Info Header */}
          <Card className={`w-full ${reportStatus === ReportStatus.PUBLISHED ? 'border-blue-200 bg-blue-50' : ''}`}>
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
    if (!canEdit && !currentMatch) {
      return `${t('titles.matchAssessment')} (Consultation)`;
    }

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
    if (!canEdit && !currentMatch) {
      return (
        <div className="flex items-center space-x-2 text-blue-600">
          <FileText className="h-5 w-5" />
          <span className="text-sm font-normal">Consultation</span>
        </div>
      );
    }

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