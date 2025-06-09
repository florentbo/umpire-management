import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { UmpireAssessment } from '@/components/assessment/UmpireAssessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/lib/api';
import { authService } from '@/lib/auth';
import { AssessmentCriteria } from '@/types';
import { format } from 'date-fns';
import { RotateCcw, Save, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

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
  
  const [isVerticalView, setIsVerticalView] = useState(false);
  const [umpireAScores, setUmpireAScores] = useState<AssessmentCriteria>({
    arrivalTime: 0,
    generalAppearance: 0,
    positioningPitch: 0,
    positioningD: 0,
  });
  const [umpireBScores, setUmpireBScores] = useState<AssessmentCriteria>({
    arrivalTime: 0,
    generalAppearance: 0,
    positioningPitch: 0,
    positioningD: 0,
  });

  // Track selected values for validation
  const [umpireAValues, setUmpireAValues] = useState<Record<keyof AssessmentCriteria, string>>({
    arrivalTime: '',
    generalAppearance: '',
    positioningPitch: '',
    positioningD: '',
  });
  const [umpireBValues, setUmpireBValues] = useState<Record<keyof AssessmentCriteria, string>>({
    arrivalTime: '',
    generalAppearance: '',
    positioningPitch: '',
    positioningD: '',
  });

  const { data: match, isLoading } = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => apiService.getMatch(matchId),
  });

  const saveAssessmentMutation = useMutation({
    mutationFn: apiService.saveAssessment,
    onSuccess: () => {
      toast.success(t('common:messages.success.saved'));
      router.navigate({ to: '/manager/dashboard' });
    },
    onError: () => {
      toast.error(t('common:messages.error.save'));
    },
  });

  // Validation function
  const isFormValid = () => {
    const umpireAComplete = Object.values(umpireAValues).every(value => value !== '');
    const umpireBComplete = Object.values(umpireBValues).every(value => value !== '');
    return umpireAComplete && umpireBComplete;
  };

  const handleSave = () => {
    if (!match || !user) return;
    
    if (!isFormValid()) {
      toast.error('Veuillez remplir tous les critères pour les deux arbitres avant de sauvegarder.');
      return;
    }
    
    saveAssessmentMutation.mutate({
      matchId: match.id,
      assessorId: user.id,
      umpireAScores,
      umpireBScores,
    });
  };

  const handleReset = () => {
    setUmpireAScores({
      arrivalTime: 0,
      generalAppearance: 0,
      positioningPitch: 0,
      positioningD: 0,
    });
    setUmpireBScores({
      arrivalTime: 0,
      generalAppearance: 0,
      positioningPitch: 0,
      positioningD: 0,
    });
    setUmpireAValues({
      arrivalTime: '',
      generalAppearance: '',
      positioningPitch: '',
      positioningD: '',
    });
    setUmpireBValues({
      arrivalTime: '',
      generalAppearance: '',
      positioningPitch: '',
      positioningD: '',
    });
    toast.success(t('common:messages.success.reset'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title={t('common:status.loading')} />
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title={t('dashboard:match.info.notFound')} />
        <div className="p-4 text-center">
          <p className="text-gray-500">{t('dashboard:match.info.notFoundDescription')}</p>
          <Button onClick={() => router.navigate({ to: '/manager/dashboard' })} className="mt-4">
            {t('dashboard:match.info.backToDashboard')}
          </Button>
        </div>
      </div>
    );
  }

  const formValid = isFormValid();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={t('titles.matchAssessment')} />
      
      <div className="p-4 space-y-6">
        {/* Match Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{match.homeTeam} vs {match.awayTeam}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">{t('dashboard:match.details.division')}:</span> {match.division}
              </div>
              <div>
                <span className="font-medium">{t('dashboard:match.details.date')}:</span> {format(new Date(match.date), 'MMM d, yyyy')}
              </div>
              <div>
                <span className="font-medium">{t('dashboard:match.details.time')}:</span> {match.time}
              </div>
              <div>
                <span className="font-medium">{t('dashboard:match.details.umpires')}:</span> {match.umpireA}, {match.umpireB}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation Warning */}
        {!formValid && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-orange-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Veuillez remplir tous les critères pour pouvoir sauvegarder l'évaluation.</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVerticalView(!isVerticalView)}
            className="flex items-center space-x-2"
          >
            {isVerticalView ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            <span>{isVerticalView ? t('layout.verticalView') : t('layout.sideBySide')}</span>
          </Button>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('common:buttons.reset')}
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={saveAssessmentMutation.isPending || !formValid}
              className={!formValid ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveAssessmentMutation.isPending ? t('common:buttons.saving') : t('common:buttons.save')}
            </Button>
          </div>
        </div>

        {/* Assessment Grid - No Max Width */}
        <div className={`grid gap-6 ${isVerticalView ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'}`}>
          <UmpireAssessment
            umpireName={`Arbitre A: ${match.umpireA}`}
            scores={umpireAScores}
            onScoreChange={(field, value) => 
              setUmpireAScores(prev => ({ ...prev, [field]: value }))
            }
            selectedValues={umpireAValues}
            onValueChange={(field, value) => 
              setUmpireAValues(prev => ({ ...prev, [field]: value }))
            }
          />
          
          <UmpireAssessment
            umpireName={`Arbitre B: ${match.umpireB}`}
            scores={umpireBScores}
            onScoreChange={(field, value) => 
              setUmpireBScores(prev => ({ ...prev, [field]: value }))
            }
            selectedValues={umpireBValues}
            onValueChange={(field, value) => 
              setUmpireBValues(prev => ({ ...prev, [field]: value }))
            }
          />
        </div>
      </div>
    </div>
  );
}