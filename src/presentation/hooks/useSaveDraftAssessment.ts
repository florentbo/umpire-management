import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContainer } from '@/infrastructure/di/ContainerContext';
import { toast } from 'sonner';
import { SaveDraftAssessmentUseCase, SaveDraftAssessmentRequest, SaveDraftAssessmentResponse } from '@/application/usecases/SaveDraftAssessmentUseCase';

export function useSaveDraftAssessment() {
  const queryClient = useQueryClient();
  const container = useContainer();
  const assessmentService = container.getAssessmentService();
  const saveDraftUseCase = new SaveDraftAssessmentUseCase(assessmentService);

  return useMutation<SaveDraftAssessmentResponse, Error, SaveDraftAssessmentRequest>({
    mutationFn: (request: SaveDraftAssessmentRequest) => saveDraftUseCase.execute(request),
    onSuccess: (response, variables) => {
      toast.success(response.message);
      console.log('Draft saved:', {
        assessmentId: response.assessmentId,
        status: response.status,
        lastSavedAt: response.lastSavedAt
      });

      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['managerMatchesWithStatus'] });
      queryClient.invalidateQueries({ queryKey: ['draftAssessment', variables.matchId] });
    },
    onError: (error) => {
      toast.error('Erreur lors de la sauvegarde du brouillon');
      console.error('Failed to save draft:', error);
    }
  });
}