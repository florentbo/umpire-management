import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/manager/assessment/$matchId')({
  component: AssessmentPage,
});

function AssessmentPage() {
  const { matchId } = Route.useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('assessment');

  const { data: match, isLoading: matchLoading } = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => apiService.getMatch(matchId),
  });

  const handleCreateAssessment = async () => {
    if (!match) return;
    const newAssessment = {
      matchId: match.id,
      assessorId: '1', // Replace with actual assessor ID if available
      umpireAScores: {
        arrivalTime: 0,
        generalAppearance: 0,
        positioningPitch: 0,
        positioningD: 0,
      },
      umpireBScores: {
        arrivalTime: 0,
        generalAppearance: 0,
        positioningPitch: 0,
        positioningD: 0,
      },
    };
    await apiService.saveAssessment(newAssessment);
    navigate({ to: '/manager/dashboard' });
  };

  if (matchLoading) {
    return <div>Loading...</div>;
  }

  if (!match) {
    return <div>Match not found</div>;
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header title={t('assessment.title')} />
      <div className="w-full px-4 py-6 lg:px-8 xl:px-12 2xl:px-16">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t('assessment.matchDetails')}</CardTitle>
            <CardDescription>
              {match.homeTeam} vs {match.awayTeam} - {match.date} {match.time}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{t('assessment.umpires')}</h3>
                <p>{match.umpireA} & {match.umpireB}</p>
              </div>
              <Button onClick={handleCreateAssessment}>
                {t('assessment.createAssessment')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 