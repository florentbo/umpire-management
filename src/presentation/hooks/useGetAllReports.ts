import { useQuery } from '@tanstack/react-query';
import { useContainer } from '@/infrastructure/di/ContainerContext';

export function useGetAllReports() {
  const container = useContainer();
  const useCase = container.getGetAllReportsUseCase();

  return useQuery({
    queryKey: ['allReports'],
    queryFn: () => useCase.execute({}),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}