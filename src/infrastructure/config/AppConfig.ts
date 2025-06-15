export interface AppConfig {
  persistence: {
    type: 'supabase' | 'rest';
    supabase?: {
      url: string;
      anonKey: string;
    };
    rest?: {
      baseUrl: string;
      apiKey?: string;
    };
  };
  assessment: {
    maxScore: number;
    gradeThresholds: {
      belowExpectation: number;
      atCurrentLevel: number;
      aboveExpectation: number;
    };
  };
}

export const defaultConfig: AppConfig = {
  persistence: {
    type: 'rest',
    rest: {
      baseUrl: '/api/v1'
    }
  },
  assessment: {
    maxScore: 50,
    gradeThresholds: {
      belowExpectation: 60,
      atCurrentLevel: 70,
      aboveExpectation: 100
    }
  }
};