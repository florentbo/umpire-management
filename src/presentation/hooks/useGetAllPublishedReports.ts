import { useQuery } from '@tanstack/react-query';
import { useContainer } from '@/infrastructure/di/ContainerContext';

export function useGetAllPublishedReports(filters: { assessorId?: string; grade?: string } = {}) {
  const container = useContainer();
  const useCase = container.getGetAllReportsUseCase();

  return useQuery({
    queryKey: ['allPublishedReports', filters],
    queryFn: () => useCase.execute(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}