import { useState, useRef } from 'react';
import { useRouter } from '@tanstack/react-router';
import { UmpireAssessment } from './UmpireAssessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCreateAssessment } from '@/presentation/hooks/useCreateAssessment';
import { useSaveDraftAssessment } from '@/presentation/hooks/useSaveDraftAssessment';
import { CreateAssessmentRequest } from '@/application/usecases/CreateAssessmentUseCase';
import { SaveDraftAssessmentRequest } from '@/application/usecases/SaveDraftAssessmentUseCase';
import { ToggleLeft, ToggleRight, Send, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CreateAssessmentViewProps {
  match: any;
  assessmentConfig: any;
  matchId: string;
  assessorId: string;
  canEdit: boolean;
}

export function CreateAssessmentView({ 
  match, 
  assessmentConfig, 
  matchId, 
  assessorId, 
  canEdit 
}: CreateAssessmentViewProps) {
  const router = useRouter();
  const createAssessmentMutation = useCreateAssessment();
  const saveDraftMutation = useSaveDraftAssessment();

  const [isVerticalView, setIsVerticalView] = useState(false);
  
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

  if (!canEdit) {
    return (
      <Card className="border-red-200 bg-red-50 w-full">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Accès non autorisé</h3>
          <p className="text-red-700 mb-4">
            Vous n'êtes pas autorisé à créer une évaluation pour ce match.
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
    return assessmentConfig.topics.map((topic: any) => ({
      topicName: topic.name,
      questionResponses: topic.questions.map((question: any) => ({
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
      }
    };

    try {
      await saveDraftMutation.mutateAsync(request);
      // Redirect to edit view after saving draft
      router.navigate({ to: '/manager/assessment/$matchId', params: { matchId } });
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
      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 w-full">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-blue-700">
            <FileText className="h-4 w-4" />
            <span className="text-sm">
              Nouvelle évaluation - Remplissez tous les critères pour publier
            </span>
          </div>
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

        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={saveDraftMutation.isPending}
          >
            <FileText className="h-4 w-4 mr-2" />
            {saveDraftMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder brouillon'}
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