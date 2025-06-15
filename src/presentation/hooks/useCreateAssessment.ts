import { useMutation } from '@tanstack/react-query';
import { CreateAssessmentUseCase, CreateAssessmentRequest, CreateAssessmentResponse } from '../../application/usecases/CreateAssessmentUseCase';
import { DIContainer } from '../../infrastructure/di/Container';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// This would be injected via context or props in a real app
const container = new DIContainer({
  useSupabase: false,
  restClient: {
    post: async (url: string, data: any) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Network error');
      return response.json();
    },
    get: async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network error');
      return response.json();
    },
    put: async (url: string, data: any) => {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Network error');
      return response.json();
    },
    delete: async (url: string) => {
      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) throw new Error('Network error');
    }
  }
});

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