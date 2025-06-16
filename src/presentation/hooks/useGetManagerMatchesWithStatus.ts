import { useQuery } from '@tanstack/react-query';
import { DIContainer } from '@/infrastructure/di/Container';
import { supabase } from '@/lib/supabase';

// Create a Supabase-based container for production
const createSupabaseContainer = (): DIContainer => {
  return new DIContainer({
    useSupabase: true,
    supabaseClient: supabase
  });
};

const container = createSupabaseContainer();

export function useGetManagerMatchesWithStatus(managerId: string) {
  const useCase = container.getGetManagerMatchesWithStatusUseCase();

  return useQuery({
    queryKey: ['managerMatchesWithStatus', managerId],
    queryFn: () => useCase.execute({ managerId }),
    enabled: !!managerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}