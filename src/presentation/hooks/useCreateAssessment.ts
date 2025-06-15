import { useMutation } from '@tanstack/react-query';
import { CreateAssessmentUseCase, CreateAssessmentRequest, CreateAssessmentResponse } from '../../application/usecases/CreateAssessmentUseCase';
import { DIContainer } from '../../infrastructure/di/Container';
import { MockAssessmentRepository, MockMatchReportRepository } from '../../infrastructure/repositories/MockAssessmentRepository';
import { AssessmentService } from '../../domain/services/AssessmentService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// Create a mock-based container for development
const createMockContainer = (): DIContainer => {
  const mockAssessmentRepo = new MockAssessmentRepository();
  const mockMatchReportRepo = new MockMatchReportRepository();
  const assessmentService = new AssessmentService(mockAssessmentRepo, mockMatchReportRepo);
  
  return {
    getAssessmentService: () => assessmentService,
    getCreateAssessmentUseCase: () => new CreateAssessmentUseCase(assessmentService)
  };
};

const container = createMockContainer();

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