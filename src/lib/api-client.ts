import { QueryClient } from '@tanstack/react-query';
import { DefaultService, AssessmentConfig } from '../../dist/api';
import { mockService } from './mock-service';

// Use mock service in development
const apiClient = import.meta.env.DEV ? mockService : DefaultService;

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
export const useAssessmentConfig = (level: AssessmentConfig.level) => {
  return {
    queryKey: ['assessmentConfig', level],
    queryFn: () => apiClient.getAssessmentConfig(level),
  };
}; 