import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { UmpireAssessment } from '@/components/assessment/UmpireAssessment';
import { GradeDisplay } from '@/presentation/components/GradeDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/lib/api';
import { authService } from '@/lib/auth';
import { useCreateAssessment } from '@/presentation/hooks/useCreateAssessment';
import { CreateAssessmentRequest } from '@/application/usecases/CreateAssessmentUseCase';
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
  const createAssessmentMutation = useCreateAssessment();
  
  const [isVerticalView, setIsVerticalView] = useState(false);
  const [showGrades, setShowGrades] = useState(false);
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

  // Conclusions
  const [umpireAConclusion, setUmpireAConclusion] = useState('');
  const [umpireBConclusion, setUmpireBConclusion] = useState('');

  const { data: match, isLoading } = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => apiService.getMatch(matchId),
  });

  // Validation function
  const isFormValid = () => {
    const umpireAComplete = Object.values(umpireAValues).every(value => value !== '');
    const umpireBComplete = Object.values(umpireBValues).every(value => value !== '');
    const conclusionsComplete = umpireAConclusion.trim() !== '' && umpireBConclusion.trim() !== '';
    return umpireAComplete && umpireBComplete && conclusionsComplete;
  };

  const calculateGrade = (scores: AssessmentCriteria) => {
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const maxScore = 50; // Configurable
    const percentage = (totalScore / maxScore) * 100;
    
    let level: string;
    if (percentage < 60) {
      level = 'BELOW_EXPECTATION';
    } else if (percentage >= 60 && percentage < 70) {
      level = 'AT_CURRENT_LEVEL';
    } else {
      level = 'ABOVE_EXPECTATION';
    }

    return { totalScore, maxScore, percentage, level };
  };

  const handleSave = async () => {
    if (!match || !user) return;
    
    if (!isFormValid()) {
      toast.error('Veuillez remplir tous les critères et conclusions pour les deux arbitres avant de sauvegarder.');
      return;
    }

    // Convert legacy scores to new format
    const umpireATopics = [
      {
        topicName: 'GAME_BEFORE_AND_AFTER',
        questionResponses: [
          { questionId: 'arrival-time', selectedValue: umpireAValues.arrivalTime, points: umpireAScores.arrivalTime },
          { questionId: 'general-appearance', selectedValue: umpireAValues.generalAppearance, points: umpireAScores.generalAppearance }
        ]
      },
      {
        topicName: 'POSITIONING',
        questionResponses: [
          { questionId: 'positioning-pitch', selectedValue: umpireAValues.positioningPitch, points: umpireAScores.positioningPitch },
          { questionId: 'positioning-d', selectedValue: umpireAValues.positioningD, points: umpireAScores.positioningD }
        ]
      }
    ];

    const umpireBTopics = [
      {
        topicName: 'GAME_BEFORE_AND_AFTER',
        questionResponses: [
          { questionId: 'arrival-time', selectedValue: umpireBValues.arrivalTime, points: umpireBScores.arrivalTime },
          { questionId: 'general-appearance', selectedValue: umpireBValues.generalAppearance, points: umpireBScores.generalAppearance }
        ]
      },
      {
        topicName: 'POSITIONING',
        questionResponses: [
          { questionId: 'positioning-pitch', selectedValue: umpireBValues.positioningPitch, points: umpireBScores.positioningPitch },
          { questionId: 'positioning-d', selectedValue: umpireBValues.positioningD, points: umpireBScores.positioningD }
        ]
      }
    ];

    const request: CreateAssessmentRequest = {
      matchId: match.id,
      assessorId: user.id,
      matchInfo: {
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        division: match.division,
        date: match.date,
        time: match.time,
        umpireAName: match.umpireA,
        umpireBName: match.umpireB
      },
      umpireAAssessment: {
        umpireId: match.umpireAId,
        topics: umpireATopics,
        conclusion: umpireAConclusion
      },
      umpireBAssessment: {
        umpireId: match.umpireBId,
        topics: umpireBTopics,
        conclusion: umpireBConclusion
      }
    };

    try {
      const result = await createAssessmentMutation.mutateAsync(request);
      setShowGrades(true);
      console.log('Assessment created successfully:', result);
    } catch (error) {
      console.error('Failed to create assessment:', error);
    }
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
    setUmpireAConclusion('');
    setUmpireBConclusion('');
    setShowGrades(false);
    toast.success(t('common:messages.success.reset'));
  };

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

  if (!match) {
    return (
      <div className="min-h-screen w-full bg-gray-50">
        <Header title={t('dashboard:match.info.notFound')} />
        <div className="w-full px-4 py-6 text-center">
          <p className="text-gray-500">{t('dashboard:match.info.notFoundDescription')}</p>
          <Button onClick={() => router.navigate({ to: '/manager/dashboard' })} className="mt-4">
            {t('dashboard:match.info.backToDashboard')}
          </Button>
        </div>
      </div>
    );
  }

  const formValid = isFormValid();
  const umpireAGrade = calculateGrade(umpireAScores);
  const umpireBGrade = calculateGrade(umpireBScores);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header title={t('titles.matchAssessment')} />
      
      <div className="w-full px-4 py-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full max-w-none space-y-8">
          {/* Match Info */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl">{match.homeTeam} vs {match.awayTeam}</CardTitle>
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

          {/* Validation Warning */}
          {!formValid && !showGrades && (
            <Card className="border-orange-200 bg-orange-50 w-full">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-orange-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Veuillez remplir tous les critères et conclusions pour pouvoir sauvegarder l'évaluation.</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grade Display */}
          {showGrades && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              <GradeDisplay
                totalScore={umpireAGrade.totalScore}
                maxScore={umpireAGrade.maxScore}
                percentage={umpireAGrade.percentage}
                level={umpireAGrade.level}
                umpireName={`Arbitre A: ${match.umpireA}`}
              />
              <GradeDisplay
                totalScore={umpireBGrade.totalScore}
                maxScore={umpireBGrade.maxScore}
                percentage={umpireBGrade.percentage}
                level={umpireBGrade.level}
                umpireName={`Arbitre B: ${match.umpireB}`}
              />
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap gap-4 justify-between items-center w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVerticalView(!isVerticalView)}
              className="flex items-center space-x-2"
            >
              {isVerticalView ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              <span>{isVerticalView ? t('layout.verticalView') : t('layout.sideBySide')}</span>
            </Button>
            
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('common:buttons.reset')}
              </Button>
              {!showGrades && (
                <Button 
                  size="sm" 
                  onClick={handleSave} 
                  disabled={createAssessmentMutation.isPending || !formValid}
                  className={!formValid ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createAssessmentMutation.isPending ? t('common:buttons.saving') : t('common:buttons.save')}
                </Button>
              )}
              {showGrades && (
                <Button onClick={() => router.navigate({ to: '/manager/dashboard' })}>
                  Retour au tableau de bord
                </Button>
              )}
            </div>
          </div>

          {/* Assessment Grid - Only show if grades not displayed */}
          {!showGrades && (
            <div className={`w-full ${isVerticalView ? 'space-y-8' : 'grid gap-8 grid-cols-1 xl:grid-cols-2'}`}>
              <div className="w-full">
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
                  conclusion={umpireAConclusion}
                  onConclusionChange={setUmpireAConclusion}
                />
              </div>
              
              <div className="w-full">
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
                  conclusion={umpireBConclusion}
                  onConclusionChange={setUmpireBConclusion}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}