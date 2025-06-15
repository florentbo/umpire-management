import { useMutation } from '@tanstack/react-query';
import { CreateAssessmentUseCase, CreateAssessmentRequest, CreateAssessmentResponse } from '../../application/usecases/CreateAssessmentUseCase';
import { DIContainer } from '../../infrastructure/di/Container';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// Create a Supabase-based container for production
const createSupabaseContainer = (): DIContainer => {
  return new DIContainer({
    useSupabase: true,
    supabaseClient: supabase
  });
};

const container = createSupabaseContainer();

export function useCreateAssessment() {
  const { t } = useTranslation('common');
  const createAssessmentUseCase = container.getCreateAssessmentUseCase();

  return useMutation<CreateAssessmentResponse, Error, CreateAssessmentRequest>({
    mutationFn: (request: CreateAssessmentRequest) => createAssessmentUseCase.execute(request),
    onSuccess: (response) => {
      toast.success(t('messages.success.saved'));
      console.log('Assessment created:', {
        reportId: response.reportId,
        umpireAGrade: response.umpireAGrade,
        umpireBGrade: response.umpireBGrade
      });
    },
    onError: (error) => {
      toast.error(t('messages.error.save'));
      console.error('Failed to create assessment:', error);
    }
  });
}