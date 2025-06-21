import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContainer } from '@/infrastructure/di/ContainerContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { CreateAssessmentRequest, CreateAssessmentResponse } from '@/application/usecases/CreateAssessmentUseCase';

export function useCreateAssessment() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const container = useContainer();
  const createAssessmentUseCase = container.getCreateAssessmentUseCase();

  return useMutation<CreateAssessmentResponse, Error, CreateAssessmentRequest>({
    mutationFn: (request: CreateAssessmentRequest) => createAssessmentUseCase.execute(request),
    onSuccess: (response, variables) => {
      toast.success(t('messages.success.saved'));
      console.log('Assessment created:', {
        reportId: response.reportId,
        umpireAGrade: response.umpireAGrade,
        umpireBGrade: response.umpireBGrade
      });

      // Invalidate all relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['managerMatchesWithStatus'] });
      queryClient.invalidateQueries({ queryKey: ['allPublishedReports'] });
      queryClient.invalidateQueries({ queryKey: ['draftAssessment', variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
    },
    onError: (error) => {
      toast.error(t('messages.error.save'));
      console.error('Failed to create assessment:', error);
    }
  });
}