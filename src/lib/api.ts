import { Match, Assessment, Report } from '@/types';

// Mock data for development
const mockMatches: Match[] = [
  {
    id: '1',
    homeTeam: 'Lions FC',
    awayTeam: 'Tigers United',
    division: 'Premier League',
    date: '2024-01-15',
    time: '15:00',
    umpireA: 'John Smith',
    umpireB: 'Sarah Johnson',
  },
  {
    id: '2',
    homeTeam: 'Eagles FC',
    awayTeam: 'Hawks United',
    division: 'Championship',
    date: '2024-01-16',
    time: '18:30',
    umpireA: 'Mike Wilson',
    umpireB: 'Emma Davis',
  },
];

const mockReports: Report[] = [
  {
    id: '1',
    matchId: '1',
    match: mockMatches[0],
    assessment: {
      id: '1',
      matchId: '1',
      assessorId: '1',
      umpireAScores: {
        arrivalTime: 1,
        generalAppearance: 1,
        positioningPitch: 2,
        positioningD: 1,
      },
      umpireBScores: {
        arrivalTime: 1,
        generalAppearance: 0,
        positioningPitch: 1,
        positioningD: 2,
      },
    },
    assessorName: 'Manager A',
    createdAt: '2024-01-15T16:30:00Z',
  },
];

export const apiService = {
  getMatches: async (): Promise<Match[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMatches;
  },

  getMatch: async (id: string): Promise<Match | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMatches.find(match => match.id === id) || null;
  },

  saveAssessment: async (assessment: Assessment): Promise<Assessment> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { ...assessment, id: Math.random().toString(36).substr(2, 9) };
  },

  getReports: async (userId: string, userRole: string): Promise<Report[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // For demo purposes, return all reports for managers, filtered for umpires
    if (userRole === 'umpire_manager') {
      return mockReports;
    }
    return mockReports.filter(report => report.assessment.assessorId === userId);
  },
};