import { useQuery } from '@tanstack/react-query';
import { useContainer } from '@/infrastructure/di/ContainerContext';

export function useGetManagerMatchesWithStatus(managerId: string) {
  const container = useContainer();
  const useCase = container.getGetManagerMatchesWithStatusUseCase();

  return useQuery({
    queryKey: ['managerMatchesWithStatus', managerId],
    queryFn: () => useCase.execute({ managerId }),
    enabled: !!managerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}