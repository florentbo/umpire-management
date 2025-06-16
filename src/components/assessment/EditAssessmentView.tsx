import { useState, useEffect, useRef } from 'react';
import { useRouter } from '@tanstack/react-router';
import { UmpireAssessment } from './UmpireAssessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCreateAssessment } from '@/presentation/hooks/useCreateAssessment';
import { useSaveDraftAssessment } from '@/presentation/hooks/useSaveDraftAssessment';
import { useLoadDraftAssessment } from '@/presentation/hooks/useLoadDraftAssessment';
import { CreateAssessmentRequest } from '@/application/usecases/CreateAssessmentUseCase';
import { SaveDraftAssessmentRequest } from '@/application/usecases/SaveDraftAssessmentUseCase';
import { ToggleLeft, ToggleRight, Send, FileText, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

interface EditAssessmentViewProps {
  match: any;
  assessmentConfig: any;
  matchId: string;
  assessorId: string;
  canEdit: boolean;
}

export function EditAssessmentView({ 
  match, 
  assessmentConfig, 
  matchId, 
  assessorId, 
  canEdit 
}: EditAssessmentViewProps) {
  const router = useRouter();
  const { t } = useTranslation(['assessment', 'common']);
  const createAssessmentMutation = useCreateAssessment();
  const saveDraftMutation = useSaveDraftAssessment();

  const [isVerticalView, setIsVerticalView] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Assessment state
  const [umpireAScores, setUmpireAScores] = useState<Record<string, number>>({});
  const [umpireAValues, setUmpireAValues] = useState<Record<string, string>>({});
  const [umpireAConclusion, setUmpireAConclusion] = useState('');

  const [umpireBScores, setUmpireBScores] = useState<Record<string, number>>({});
  const [umpireBValues, setUmpireBValues] = useState<Record<string, string>>({});
  const [umpireBConclusion, setUmpireBConclusion] = useState('');

  // Validation refs
  const umpireARef = useRef<HTMLDivElement>(null);
  const umpireBRef = useRef<HTMLDivElement>(null);

  // Load existing draft
  const { data: existingDraft, isLoading: draftLoading } = useLoadDraftAssessment(
    matchId,
    assessorId
  );

  // Load existing draft data when available
  useEffect(() => {
    if (existingDraft && assessmentConfig) {
      console.log('Loading existing draft:', existingDraft);

      setCurrentDraftId(existingDraft.assessmentId);
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
    if (assessmentConfig && currentDraftId) {
      setHasUnsavedChanges(true);
    }
  }, [umpireAScores, umpireAValues, umpireAConclusion, umpireBScores, umpireBValues, umpireBConclusion, assessmentConfig, currentDraftId]);

  // Auto-save draft every 30 seconds if there are changes
  useEffect(() => {
    if (hasUnsavedChanges && canEdit) {
      const autoSaveTimer = setTimeout(() => {
        handleSaveDraft();
      }, 30000); // 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, canEdit]);

  if (draftLoading) {
    return (
      <div className="space-y-6 w-full">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-24 bg-gray-200 rounded-lg w-full"></div>
          <div className="h-96 bg-gray-200 rounded-lg w-full"></div>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <Card className="border-red-200 bg-red-50 w-full">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Accès non autorisé</h3>
          <p className="text-red-700 mb-4">
            Vous n'êtes pas autorisé à modifier cette évaluation.
          </p>
          <Button onClick={() => router.navigate({ to: '/manager/dashboard' })}>
            Retour au tableau de bord
          </Button>
        </CardContent>
      </Card>
    );
  }

  const validateForPublish = () => {
    const validateUmpire = (values: Record<string, string>, conclusion: string, umpireRef: React.RefObject<HTMLDivElement>) => {
      for (const topic of assessmentConfig.topics) {
        for (const question of topic.questions) {
          if (!values[question.id] || values[question.id] === '') {
            return { isValid: false, ref: umpireRef, field: question.text };
          }
        }
      }

      if (!conclusion.trim()) {
        return { isValid: false, ref: umpireRef, field: 'Conclusion' };
      }

      return { isValid: true, ref: null, field: null };
    };

    const umpireAValidation = validateUmpire(umpireAValues, umpireAConclusion, umpireARef);
    if (!umpireAValidation.isValid) {
      return {
        isValid: false,
        firstInvalidField: umpireAValidation.ref,
        fieldName: `Arbitre A - ${umpireAValidation.field}`
      };
    }

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

  const buildTopics = (values: Record<string, string>, scores: Record<string, number>) => {
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
    const request: SaveDraftAssessmentRequest = {
      matchId: match.id,
      assessorId,
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
      console.log('Draft saved to database:', result);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const handlePublish = async () => {
    const validation = validateForPublish();
    if (!validation.isValid) {
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
      assessorId,
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
      await createAssessmentMutation.mutateAsync(request);
      toast.success('Évaluation publiée avec succès!');
      // Redirect to read view after publishing
      router.navigate({ to: '/manager/assessment/$matchId', params: { matchId } });
    } catch (error) {
      console.error('Failed to publish assessment:', error);
      toast.error('Erreur lors de la publication de l\'évaluation');
    }
  };

  const validation = validateForPublish();

  return (
    <div className="space-y-6 w-full">
      {/* Draft Status */}
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

      {/* Last Save Time */}
      {lastSaveTime && (
        <div className="text-xs text-gray-500 flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Dernière sauvegarde (BDD): {format(lastSaveTime, 'dd/MM/yyyy à HH:mm:ss')}</span>
          {currentDraftId && (
            <span className="text-blue-600 ml-2">ID: {currentDraftId.slice(0, 8)}...</span>
          )}
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
          <span>{isVerticalView ? 'Vue Verticale' : 'Côte à Côte'}</span>
        </Button>

        <div className="flex space-x-3">
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={createAssessmentMutation.isPending}
            className={!validation.isValid ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}
          >
            <Send className="h-4 w-4 mr-2" />
            {createAssessmentMutation.isPending ? 'Publication...' : 'Publier l\'évaluation'}
          </Button>
        </div>
      </div>

      {/* Assessment Grid */}
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
            readOnly={false}
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
            readOnly={false}
          />
        </div>
      </div>
    </div>
  );
}