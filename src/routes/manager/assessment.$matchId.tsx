import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { UmpireAssessment } from '@/components/assessment/UmpireAssessment';
import { GradeDisplay } from '@/presentation/components/GradeDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/lib/api';
import { authService } from '@/lib/auth';
import { useCreateAssessment } from '@/presentation/hooks/useCreateAssessment';
import { useSaveDraftAssessment } from '@/presentation/hooks/useSaveDraftAssessment';
import { useLoadDraftAssessment } from '@/presentation/hooks/useLoadDraftAssessment';
import { CreateAssessmentRequest } from '@/application/usecases/CreateAssessmentUseCase';
import { SaveDraftAssessmentRequest } from '@/application/usecases/SaveDraftAssessmentUseCase';
import { format } from 'date-fns';
import { RotateCcw, Save, ToggleLeft, ToggleRight, AlertCircle, CheckCircle, Send, FileText, Clock } from 'lucide-react';
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

enum AssessmentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  NONE = 'NONE'
}

function AssessmentPage() {
  const { matchId } = Route.useParams();
  const router = useRouter();
  const user = authService.getCurrentUser();
  const { t } = useTranslation(['assessment', 'dashboard', 'common']);
  const createAssessmentMutation = useCreateAssessment();
  const saveDraftMutation = useSaveDraftAssessment();
  
  const [isVerticalView, setIsVerticalView] = useState(false);
  const [assessmentStatus, setAssessmentStatus] = useState<AssessmentStatus>(AssessmentStatus.NONE);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  // Dynamic state based on assessment config
  const [umpireAScores, setUmpireAScores] = useState<Record<string, number>>({});
  const [umpireAValues, setUmpireAValues] = useState<Record<string, string>>({});
  const [umpireAConclusion, setUmpireAConclusion] = useState('');

  const [umpireBScores, setUmpireBScores] = useState<Record<string, number>>({});
  const [umpireBValues, setUmpireBValues] = useState<Record<string, string>>({});
  const [umpireBConclusion, setUmpireBConclusion] = useState('');

  // Draft state
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Validation refs for scrolling to invalid fields
  const umpireARef = useRef<HTMLDivElement>(null);
  const umpireBRef = useRef<HTMLDivElement>(null);

  const { data: match, isLoading: matchLoading } = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => apiService.getMatch(matchId),
  });

  const { data: assessmentConfig, isLoading: configLoading } = useQuery(
    useAssessmentConfig(AssessmentConfig.level.JUNIOR)
  );

  // Load existing draft
  const { data: existingDraft, isLoading: draftLoading } = useLoadDraftAssessment(
    matchId, 
    user?.id || ''
  );

  const isLoading = matchLoading || configLoading || draftLoading;

  // Load existing draft data when available
  useEffect(() => {
    if (existingDraft && assessmentConfig) {
      console.log('Loading existing draft:', existingDraft);
      
      setCurrentDraftId(existingDraft.assessmentId);
      setAssessmentStatus(AssessmentStatus.DRAFT);
      setLastSaveTime(new Date(existingDraft.lastSavedAt));

      // Load Umpire A data
      const umpireAScoresMap: Record<string, number> = {};
      const umpireAValuesMap: Record<string, string> = {};
      
      existingDraft.umpireAData.topics.forEach(topic => {
        topic.questionResponses.forEach(response => {
          umpireAValuesMap[response.questionId] = response.selectedValue;
          umpireAScoresMap[response.questionId] = response.points;
        });
      });
      
      setUmpireAScores(umpireAScoresMap);
      setUmpireAValues(umpireAValuesMap);
      setUmpireAConclusion(existingDraft.umpireAData.conclusion);

      // Load Umpire B data
      const umpireBScoresMap: Record<string, number> = {};
      const umpireBValuesMap: Record<string, string> = {};
      
      existingDraft.umpireBData.topics.forEach(topic => {
        topic.questionResponses.forEach(response => {
          umpireBValuesMap[response.questionId] = response.selectedValue;
          umpireBScoresMap[response.questionId] = response.points;
        });
      });
      
      setUmpireBScores(umpireBScoresMap);
      setUmpireBValues(umpireBValuesMap);
      setUmpireBConclusion(existingDraft.umpireBData.conclusion);

      setHasUnsavedChanges(false);
      toast.success('Brouillon chargé depuis la base de données');
    }
  }, [existingDraft, assessmentConfig]);

  // Track changes for auto-save indication
  useEffect(() => {
    if (assessmentConfig && assessmentStatus !== AssessmentStatus.PUBLISHED) {
      setHasUnsavedChanges(true);
    }
  }, [umpireAScores, umpireAValues, umpireAConclusion, umpireBScores, umpireBValues, umpireBConclusion, assessmentConfig, assessmentStatus]);

  // Auto-save draft every 30 seconds if there are changes
  useEffect(() => {
    if (hasUnsavedChanges && assessmentStatus !== AssessmentStatus.PUBLISHED) {
      const autoSaveTimer = setTimeout(() => {
        handleSaveDraft();
      }, 30000); // 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, assessmentStatus]);

  // Validation function for publish
  const validateForPublish = () => {
    if (!assessmentConfig) return { isValid: false, firstInvalidField: null };

    const validateUmpire = (values: Record<string, string>, conclusion: string, umpireRef: React.RefObject<HTMLDivElement>) => {
      // Check if all questions are answered
      for (const topic of assessmentConfig.topics) {
        for (const question of topic.questions) {
          if (!values[question.id] || values[question.id] === '') {
            return { isValid: false, ref: umpireRef, field: question.text };
          }
        }
      }
      
      // Check conclusion
      if (!conclusion.trim()) {
        return { isValid: false, ref: umpireRef, field: 'Conclusion' };
      }
      
      return { isValid: true, ref: null, field: null };
    };

    // Validate Umpire A
    const umpireAValidation = validateUmpire(umpireAValues, umpireAConclusion, umpireARef);
    if (!umpireAValidation.isValid) {
      return { 
        isValid: false, 
        firstInvalidField: umpireAValidation.ref,
        fieldName: `Arbitre A - ${umpireAValidation.field}`
      };
    }

    // Validate Umpire B
    const umpireBValidation = validateUmpire(umpireBValues, umpireBConclusion, umpireBRef);
    if (!umpireBValidation.isValid) {
      return { 
        isValid: false, 
        firstInvalidField: umpireBValidation.ref,
        fieldName: `Arbitre B - ${umpireBValidation.field}`
      };
    }

    return { isValid: true, firstInvalidField: null, fieldName: null };
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

  const buildTopics = (values: Record<string, string>, scores: Record<string, number>) => {
    if (!assessmentConfig) return [];
    
    return assessmentConfig.topics.map(topic => ({
      topicName: topic.name,
      questionResponses: topic.questions.map(question => ({
        questionId: question.id,
        selectedValue: values[question.id] || '',
        points: scores[question.id] || 0
      }))
    }));
  };

  const handleSaveDraft = async () => {
    if (!match || !assessmentConfig || !user) return;
    
    const request: SaveDraftAssessmentRequest = {
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
      },
      existingAssessmentId: currentDraftId || undefined
    };

    try {
      const result = await saveDraftMutation.mutateAsync(request);
      setCurrentDraftId(result.assessmentId);
      setLastSaveTime(new Date(result.lastSavedAt));
      setHasUnsavedChanges(false);
      setAssessmentStatus(AssessmentStatus.DRAFT);
      console.log('Draft saved to database:', result);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const handlePublish = async () => {
    if (!match || !assessmentConfig || !user) return;
    
    // Validate before publishing
    const validation = validateForPublish();
    if (!validation.isValid) {
      // Scroll to first invalid field
      if (validation.firstInvalidField?.current) {
        validation.firstInvalidField.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
      toast.error(`Champ requis: ${validation.fieldName}`);
      return;
    }

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
      setAssessmentStatus(AssessmentStatus.PUBLISHED);
      setHasUnsavedChanges(false);
      setLastSaveTime(new Date());
      toast.success('Évaluation publiée avec succès!');
      console.log('Assessment published successfully:', result);
    } catch (error) {
      console.error('Failed to publish assessment:', error);
      toast.error('Erreur lors de la publication de l\'évaluation');
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
    setAssessmentStatus(AssessmentStatus.NONE);
    setAssessmentResult(null);
    setHasUnsavedChanges(false);
    setLastSaveTime(null);
    setCurrentDraftId(null);
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

  const validation = validateForPublish();

  const getStatusBadge = () => {
    switch (assessmentStatus) {
      case AssessmentStatus.DRAFT:
        return (
          <div className="flex items-center space-x-2 text-orange-600">
            <FileText className="h-5 w-5" />
            <span className="text-sm font-normal">Brouillon (Base de données)</span>
          </div>
        );
      case AssessmentStatus.PUBLISHED:
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-normal">Publié</span>
          </div>
        );
      default:
        return null;
    }
  };

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
                {getStatusBadge()}
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
                  <Clock className="h-3 w-3" />
                  <span>Dernière sauvegarde (BDD): {format(lastSaveTime, 'dd/MM/yyyy à HH:mm:ss')}</span>
                  {currentDraftId && (
                    <span className="text-blue-600 ml-2">ID: {currentDraftId.slice(0, 8)}...</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Indicators */}
          {assessmentStatus !== AssessmentStatus.PUBLISHED && (
            <>
              {/* Draft Status */}
              {assessmentStatus === AssessmentStatus.DRAFT && (
                <Card className="border-orange-200 bg-orange-50 w-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-orange-700">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Brouillon sauvegardé en base de données - Vous pouvez continuer à modifier</span>
                      </div>
                      {validation.isValid ? (
                        <Button 
                          size="sm" 
                          onClick={handlePublish}
                          disabled={createAssessmentMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {createAssessmentMutation.isPending ? 'Publication...' : 'Publier'}
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handlePublish}
                          disabled={createAssessmentMutation.isPending}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Publier (validation requise)
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Unsaved Changes */}
              {hasUnsavedChanges && (
                <Card className="border-blue-200 bg-blue-50 w-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-blue-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Modifications non sauvegardées en base de données</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={saveDraftMutation.isPending}
                      >
                        {saveDraftMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder en BDD'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Grade Display - Only show when published */}
          {assessmentStatus === AssessmentStatus.PUBLISHED && assessmentResult && (
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
              disabled={assessmentStatus === AssessmentStatus.PUBLISHED}
            >
              {isVerticalView ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              <span>{isVerticalView ? t('layout.verticalView') : t('layout.sideBySide')}</span>
            </Button>
            
            <div className="flex space-x-3">
              {assessmentStatus === AssessmentStatus.PUBLISHED ? (
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
                    variant="outline"
                    size="sm" 
                    onClick={handleSaveDraft}
                    disabled={saveDraftMutation.isPending || !hasUnsavedChanges}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveDraftMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder en BDD'}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handlePublish} 
                    disabled={createAssessmentMutation.isPending}
                    className={!validation.isValid ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {createAssessmentMutation.isPending ? 'Publication...' : 'Publier l\'évaluation'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Assessment Grid - Only show if not published */}
          {assessmentStatus !== AssessmentStatus.PUBLISHED && (
            <div className={`w-full ${isVerticalView ? 'space-y-8' : 'grid gap-8 grid-cols-1 xl:grid-cols-2'}`}>
              <div className="w-full" ref={umpireARef}>
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
              
              <div className="w-full" ref={umpireBRef}>
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

          {/* Assessment Summary - Show when published */}
          {assessmentStatus === AssessmentStatus.PUBLISHED && assessmentResult && (
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
                  Rapport ID: {assessmentResult.reportId} | Publié le: {format(new Date(assessmentResult.submittedAt), 'dd/MM/yyyy à HH:mm')}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}