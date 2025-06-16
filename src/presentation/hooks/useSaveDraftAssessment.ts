import { useMutation } from '@tanstack/react-query';
import { DIContainer } from '../../infrastructure/di/Container';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { SaveDraftAssessmentUseCase } from '../../application/usecases/SaveDraftAssessmentUseCase';

// Create a Supabase-based container for production
const createSupabaseContainer = (): DIContainer => {
  return new DIContainer({
    useSupabase: true,
    supabaseClient: supabase
  });
};

const container = createSupabaseContainer();

export function useSaveDraftAssessment() {
  const { t } = useTranslation('common');
  const assessmentService = container.getAssessmentService();
  const saveDraftUseCase = new SaveDraftAssessmentUseCase(assessmentService);

  return useMutation<any, Error, any>({
    mutationFn: (request: any) => saveDraftUseCase.execute(request),
    onSuccess: (response) => {
      toast.success(response.message);
      console.log('Draft saved:', {
        assessmentId: response.assessmentId,
        status: response.status,
        lastSavedAt: response.lastSavedAt
      });
    },
    onError: (error) => {
      toast.error('Erreur lors de la sauvegarde du brouillon');
      console.error('Failed to save draft:', error);
    }
  });
}