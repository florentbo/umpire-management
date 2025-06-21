import { useQuery } from '@tanstack/react-query';
import { useContainer } from '@/infrastructure/di/ContainerContext';
import { LoadDraftAssessmentUseCase } from '@/application/usecases/LoadDraftAssessmentUseCase';

export function useLoadDraftAssessment(matchId: string, assessorId: string) {
  const container = useContainer();
  const assessmentService = container.getAssessmentService();
  const loadDraftUseCase = new LoadDraftAssessmentUseCase(assessmentService);

  return useQuery({
    queryKey: ['draftAssessment', matchId, assessorId],
    queryFn: () => loadDraftUseCase.execute({ matchId, assessorId }),
    enabled: !!matchId && !!assessorId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}