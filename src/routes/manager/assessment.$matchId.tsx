import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { UmpireAssessment } from '@/components/assessment/UmpireAssessment';
import { GradeDisplay } from '@/presentation/components/GradeDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/lib/api';
import { authService } from '@/lib/auth';
import { useCreateAssessment } from '@/presentation/hooks/useCreateAssessment';
import { CreateAssessmentRequest } from '@/application/usecases/CreateAssessmentUseCase';
import { format } from 'date-fns';
import { RotateCcw, Save, ToggleLeft, ToggleRight, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAssessmentConfig } from '@/lib/api-client';
import { AssessmentConfig } from '../../../dist/api';

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
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);

  // Dynamic state based on assessment config
  const [umpireAScores, setUmpireAScores] = useState<Record<string, number>>({});
  const [umpireAValues, setUmpireAValues] = useState<Record<string, string>>({});
  const [umpireAConclusion, setUmpireAConclusion] = useState('');

  const [umpireBScores, setUmpireBScores] = useState<Record<string, number>>({});
  const [umpireBValues, setUmpireBValues] = useState<Record<string, string>>({});
  const [umpireBConclusion, setUmpireBConclusion] = useState('');

  // Auto-save state
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: match, isLoading: matchLoading } = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => apiService.getMatch(matchId),
  });

  const { data: assessmentConfig, isLoading: configLoading } = useQuery(
    useAssessmentConfig(AssessmentConfig.level.JUNIOR)
  );

  const isLoading = matchLoading || configLoading;

  // Track changes for auto-save
  useEffect(() => {
    if (assessmentConfig && !assessmentCompleted) {
      setHasUnsavedChanges(true);
    }
  }, [umpireAScores, umpireAValues, umpireAConclusion, umpireBScores, umpireBValues, umpireBConclusion, assessmentConfig, assessmentCompleted]);

  // Validation function
  const isFormValid = () => {
    if (!assessmentConfig) return false;

    const allQuestionsAnswered = (values: Record<string, string>) => {
      return assessmentConfig.topics.every(topic =>
        topic.questions.every(question => values[question.id] !== undefined && values[question.id] !== '')
      );
    };

    const conclusionsComplete = umpireAConclusion.trim() !== '' && umpireBConclusion.trim() !== '';
    return allQuestionsAnswered(umpireAValues) && allQuestionsAnswered(umpireBValues) && conclusionsComplete;
  };

  const calculateGrade = (scores: Record<string, number>) => {
    if (!assessmentConfig) return { totalScore: 0, maxScore: 0, percentage: 0, level: 'AT_CURRENT_LEVEL' };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const maxScore = assessmentConfig.topics.reduce((sum, topic) => 
      sum + topic.questions.reduce((topicSum, question) => 
        topicSum + Math.max(...question.answerPoints.map(ap => ap.points)), 0), 0);
    
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

  const handleSubmitAssessment = async () => {
    if (!match || !assessmentConfig || !user) return;
    
    if (!isFormValid()) {
      toast.error(t('common:messages.error.incompleteForm'));
      return;
    }

    const buildTopics = (values: Record<string, string>, scores: Record<string, number>) => 
      assessmentConfig.topics.map(topic => ({
        topicName: topic.name,
        questionResponses: topic.questions.map(question => ({
          questionId: question.id,
          selectedValue: values[question.id] || '',
          points: scores[question.id] || 0
        }))
      }));

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
        umpireBName: match.umpireB,
        umpireManagerId: match.umpireManagerId
      },
      umpireAAssessment: {
        umpireId: match.umpireAId,
        topics: buildTopics(umpireAValues, umpireAScores),
        conclusion: umpireAConclusion
      },
      umpireBAssessment: {
        umpireId: match.umpireBId,
        topics: buildTopics(umpireBValues, umpireBScores),
        conclusion: umpireBConclusion
      }
    };

    try {
      const result = await createAssessmentMutation.mutateAsync(request);
      setAssessmentResult(result);
      setAssessmentCompleted(true);
      setHasUnsavedChanges(false);
      setLastSaveTime(new Date());
      toast.success('Évaluation soumise avec succès!');
      console.log('Assessment created successfully:', result);
    } catch (error) {
      console.error('Failed to create assessment:', error);
      toast.error('Erreur lors de la soumission de l\'évaluation');
    }
  };

  const handleReset = () => {
    if (!assessmentConfig) return;

    const resetValues = () => {
      const values: Record<string, string> = {};
      const scores: Record<string, number> = {};
      assessmentConfig.topics.forEach(topic => {
        topic.questions.forEach(question => {
          values[question.id] = '';
          scores[question.id] = 0;
        });
      });
      return { values, scores };
    };

    const { values: emptyValues, scores: emptyScores } = resetValues();
    
    setUmpireAScores(emptyScores);
    setUmpireBScores(emptyScores);
    setUmpireAValues(emptyValues);
    setUmpireBValues(emptyValues);
    setUmpireAConclusion('');
    setUmpireBConclusion('');
    setAssessmentCompleted(false);
    setAssessmentResult(null);
    setHasUnsavedChanges(false);
    toast.success(t('common:messages.success.reset'));
  };

  const handleNewAssessment = () => {
    handleReset();
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

  if (!match || !assessmentConfig) {
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
              <CardTitle className="text-xl flex items-center justify-between">
                <span>{match.homeTeam} vs {match.awayTeam}</span>
                {assessmentCompleted && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-normal">Évaluation terminée</span>
                  </div>
                )}
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
              {lastSaveTime && (
                <div className="mt-4 text-xs text-gray-500 flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Dernière sauvegarde: {format(lastSaveTime, 'HH:mm:ss')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Indicators */}
          {!assessmentCompleted && (
            <>
              {/* Validation Warning */}
              {!formValid && (
                <Card className="border-orange-200 bg-orange-50 w-full">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-orange-700">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{t('common:messages.error.incompleteForm')}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Unsaved Changes Warning */}
              {hasUnsavedChanges && formValid && (
                <Card className="border-blue-200 bg-blue-50 w-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-blue-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Évaluation prête à être soumise</span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={handleSubmitAssessment}
                        disabled={createAssessmentMutation.isPending}
                      >
                        {createAssessmentMutation.isPending ? 'Soumission...' : 'Soumettre maintenant'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Grade Display - Only show when assessment is completed */}
          {assessmentCompleted && assessmentResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              <GradeDisplay
                totalScore={assessmentResult.umpireAGrade.totalScore}
                maxScore={assessmentResult.umpireAGrade.maxScore}
                percentage={assessmentResult.umpireAGrade.percentage}
                level={assessmentResult.umpireAGrade.level}
                umpireName={`Arbitre A: ${match.umpireA}`}
              />
              <GradeDisplay
                totalScore={assessmentResult.umpireBGrade.totalScore}
                maxScore={assessmentResult.umpireBGrade.maxScore}
                percentage={assessmentResult.umpireBGrade.percentage}
                level={assessmentResult.umpireBGrade.level}
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
              disabled={assessmentCompleted}
            >
              {isVerticalView ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              <span>{isVerticalView ? t('layout.verticalView') : t('layout.sideBySide')}</span>
            </Button>
            
            <div className="flex space-x-3">
              {assessmentCompleted ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleNewAssessment}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Nouvelle évaluation
                  </Button>
                  <Button onClick={() => router.navigate({ to: '/manager/dashboard' })}>
                    {t('dashboard:match.info.backToDashboard')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {t('common:buttons.reset')}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSubmitAssessment} 
                    disabled={createAssessmentMutation.isPending || !formValid}
                    className={!formValid ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createAssessmentMutation.isPending ? 'Soumission...' : 'Soumettre l\'évaluation'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Assessment Grid - Only show if assessment not completed */}
          {!assessmentCompleted && (
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

          {/* Assessment Summary - Show when completed */}
          {assessmentCompleted && assessmentResult && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Résumé de l'évaluation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Arbitre A: {match.umpireA}</h4>
                    <p className="text-sm text-gray-600 mb-2">Conclusion: {umpireAConclusion}</p>
                    <div className="text-sm">
                      Score: {assessmentResult.umpireAGrade.totalScore}/{assessmentResult.umpireAGrade.maxScore} 
                      ({assessmentResult.umpireAGrade.percentage.toFixed(1)}%)
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Arbitre B: {match.umpireB}</h4>
                    <p className="text-sm text-gray-600 mb-2">Conclusion: {umpireBConclusion}</p>
                    <div className="text-sm">
                      Score: {assessmentResult.umpireBGrade.totalScore}/{assessmentResult.umpireBGrade.maxScore} 
                      ({assessmentResult.umpireBGrade.percentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  Rapport ID: {assessmentResult.reportId} | Soumis le: {format(new Date(assessmentResult.submittedAt), 'dd/MM/yyyy à HH:mm')}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}