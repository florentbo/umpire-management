import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DIContainer } from '../../infrastructure/di/Container';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { SaveDraftAssessmentUseCase, SaveDraftAssessmentRequest, SaveDraftAssessmentResponse } from '../../application/usecases/SaveDraftAssessmentUseCase';

// Create a Supabase-based container for production
const createSupabaseContainer = (): DIContainer => {
  return new DIContainer({
    useSupabase: true,
    supabaseClient: supabase
  });
};

const container = createSupabaseContainer();

export function useSaveDraftAssessment() {
  const queryClient = useQueryClient();
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