import { QueryClient } from '@tanstack/react-query';
import { DefaultService } from '../../dist/api';

// Create a client
const apiClient = DefaultService;

// Create a QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Export the API client
export { apiClient };

// Export query hooks
export const useAssessmentConfig = (level: 'junior' | 'senior' | 'national' | 'international') => {
  return {
    queryKey: ['assessmentConfig', level],
    queryFn: () => apiClient.getAssessmentConfig(level),
  };
}; 