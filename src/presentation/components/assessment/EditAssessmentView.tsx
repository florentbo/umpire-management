import { useRouter } from '@tanstack/react-router';
import { UmpireAssessment } from './UmpireAssessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCreateAssessment } from '@/presentation/hooks/useCreateAssessment';
import { useSaveDraftAssessment } from '@/presentation/hooks/useSaveDraftAssessment';
import { useLoadDraftAssessment } from '@/presentation/hooks/useLoadDraftAssessment';
import { useAssessmentForm } from '@/presentation/hooks/useAssessmentForm';
import { CreateAssessmentRequest } from '@/application/usecases/CreateAssessmentUseCase';
import { SaveDraftAssessmentRequest } from '@/application/usecases/SaveDraftAssessmentUseCase';
import { ToggleLeft, ToggleRight, Send, FileText, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
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
  const createAssessmentMutation = useCreateAssessment();
  const saveDraftMutation = useSaveDraftAssessment();

  // Load existing draft
  const { data: existingDraft, isLoading: draftLoading } = useLoadDraftAssessment(
    matchId,
    assessorId
  );

  // Use shared hook for form state and logic
  const {
    formState,
    isVerticalView,
    setIsVerticalView,
    lastSaveTime,
    hasUnsavedChanges,
    umpireARef,
    umpireBRef,
    validateForPublish,
    buildTopics,
    updateUmpireA,
    updateUmpireB,
    setHasUnsavedChanges
  } = useAssessmentForm(assessmentConfig, existingDraft, canEdit);

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
        </CardContent>
      </Card>
    );
  }

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
        topics: buildTopics(formState.umpireAValues, formState.umpireAScores, formState.umpireARemarks),
        conclusion: formState.umpireAConclusion
      },
      umpireBAssessment: {
        umpireId: match.umpireBId,
        topics: buildTopics(formState.umpireBValues, formState.umpireBScores, formState.umpireBRemarks),
        conclusion: formState.umpireBConclusion
      }
    };

    try {
      await saveDraftMutation.mutateAsync(request);
      setHasUnsavedChanges(false);
      toast.success('Brouillon sauvegardé avec succès!');
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Erreur lors de la sauvegarde du brouillon');
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
        topics: buildTopics(formState.umpireAValues, formState.umpireAScores, formState.umpireARemarks),
        conclusion: formState.umpireAConclusion
      },
      umpireBAssessment: {
        umpireId: match.umpireBId,
        topics: buildTopics(formState.umpireBValues, formState.umpireBScores, formState.umpireBRemarks),
        conclusion: formState.umpireBConclusion
      }
    };

    try {
      await createAssessmentMutation.mutateAsync(request);
      toast.success('Évaluation publiée avec succès!');
      // Redirect to reporting after publishing
      router.navigate({ to: '/manager/reporting' });
    } catch (error) {
      console.error('Failed to publish assessment:', error);
      toast.error('Erreur lors de la publication de l\'évaluation');
    }
  };

  const validation = validateForPublish();

  return (
    <div className="space-y-6 w-full">
      {/* Edit mode notification */}
      <Card className="border-orange-200 bg-orange-50 w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-orange-700">
              <FileText className="h-4 w-4" />
              <span className="text-sm">
                Modification d'un brouillon existant. Les modifications sont sauvegardées automatiquement.
              </span>
            </div>
            {lastSaveTime && (
              <div className="flex items-center space-x-1 text-xs text-orange-600">
                <Clock className="h-3 w-3" />
                <span>Dernière sauvegarde: {format(lastSaveTime, 'HH:mm')}</span>
              </div>
            )}
          </div>
          {hasUnsavedChanges && (
            <div className="mt-2 text-xs text-orange-600">
              ⚠️ Modifications non sauvegardées
            </div>
          )}
        </CardContent>
      </Card>

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

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={saveDraftMutation.isPending}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>{saveDraftMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </Button>

          <Button
            onClick={handlePublish}
            disabled={createAssessmentMutation.isPending || !validation.isValid}
            className="flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>{createAssessmentMutation.isPending ? 'Publication...' : 'Publier'}</span>
          </Button>
        </div>
      </div>

      {/* Assessment Grid */}
      <div className={`w-full ${isVerticalView ? 'space-y-8' : 'grid gap-8 grid-cols-1 xl:grid-cols-2'}`}>
        <div ref={umpireARef} className="w-full">
          <UmpireAssessment
            umpireName={`Arbitre A: ${match.umpireA}`}
            scores={formState.umpireAScores}
            onScoreChange={(field, value) => updateUmpireA('umpireAScores', { ...formState.umpireAScores, [field]: value })}
            selectedValues={formState.umpireAValues}
            onValueChange={(field, value) => updateUmpireA('umpireAValues', { ...formState.umpireAValues, [field]: value })}
            conclusion={formState.umpireAConclusion}
            onConclusionChange={(conclusion) => updateUmpireA('umpireAConclusion', conclusion)}
            remarks={formState.umpireARemarks}
            onRemarksChange={(topicName, remarks) => updateUmpireA('umpireARemarks', { ...formState.umpireARemarks, [topicName]: remarks })}
            readOnly={false}
          />
        </div>

        <div ref={umpireBRef} className="w-full">
          <UmpireAssessment
            umpireName={`Arbitre B: ${match.umpireB}`}
            scores={formState.umpireBScores}
            onScoreChange={(field, value) => updateUmpireB('umpireBScores', { ...formState.umpireBScores, [field]: value })}
            selectedValues={formState.umpireBValues}
            onValueChange={(field, value) => updateUmpireB('umpireBValues', { ...formState.umpireBValues, [field]: value })}
            conclusion={formState.umpireBConclusion}
            onConclusionChange={(conclusion) => updateUmpireB('umpireBConclusion', conclusion)}
            remarks={formState.umpireBRemarks}
            onRemarksChange={(topicName, remarks) => updateUmpireB('umpireBRemarks', { ...formState.umpireBRemarks, [topicName]: remarks })}
            readOnly={false}
          />
        </div>
      </div>
    </div>
  );
}