import { useQuery } from '@tanstack/react-query';
import { DIContainer } from '@/infrastructure/di/Container';
import { supabase } from '@/lib/supabase';
import { GetAllReportsRequest } from '@/application/usecases/GetAllReportsUseCase';

// Create a Supabase-based container for production
const createSupabaseContainer = (): DIContainer => {
  return new DIContainer({
    useSupabase: true,
    supabaseClient: supabase
  });
};

const container = createSupabaseContainer();

export function useGetAllPublishedReports(filters?: GetAllReportsRequest) {
  const getAllReportsUseCase = container.getGetAllReportsUseCase();

  return useQuery({
    queryKey: ['allPublishedReports', filters],
    queryFn: () => getAllReportsUseCase.execute(filters || {}),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}