import { useQuery } from '@tanstack/react-query';
import { DIContainer } from '../../infrastructure/di/Container';
import { supabase } from '../../lib/supabase';
import { LoadDraftAssessmentUseCase } from '../../application/usecases/LoadDraftAssessmentUseCase';

// Create a Supabase-based container for production
const createSupabaseContainer = (): DIContainer => {
  return new DIContainer({
    useSupabase: true,
    supabaseClient: supabase
  });
};

const container = createSupabaseContainer();

export function useLoadDraftAssessment(matchId: string, assessorId: string) {
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