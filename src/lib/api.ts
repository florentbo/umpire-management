import { Match, Assessment, Report } from '@/types';
import { parseMatchesFromCSV } from './csv-parser';

// Mock data for development
const mockReports: Report[] = [
  {
    id: '1',
    matchId: '1',
    match: {
      id: '1',
      homeTeam: 'Lions FC',
      awayTeam: 'Tigers United',
      division: 'Premier League',
      date: '2024-01-15',
      time: '15:00',
      umpireA: 'John Smith',
      umpireB: 'Sarah Johnson',
    },
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

// Lazy-load and cache CSV matches
let csvMatchesCache: Match[] | null = null;
let csvMatchesPromise: Promise<Match[]> | null = null;

async function loadCsvMatches(): Promise<Match[]> {
  if (csvMatchesCache) return csvMatchesCache;
  if (csvMatchesPromise) return csvMatchesPromise;
  csvMatchesPromise = fetch('/matches/games.csv')
    .then(res => res.text())
    .then(text => {
      const matches = parseMatchesFromCSV(text);
      csvMatchesCache = matches;
      return matches;
    })
    .catch(error => {
      console.error('Failed to load CSV matches:', error);
      csvMatchesCache = [];
      return [];
    });
  return csvMatchesPromise;
}

export const apiService = {
  getMatches: async (): Promise<Match[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return loadCsvMatches();
  },

  getMatch: async (id: string): Promise<Match | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const matches = await loadCsvMatches();
    return matches.find(match => match.id === id) || null;
  },

  saveAssessment: async (assessment: Assessment): Promise<Assessment> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { ...assessment, id: Math.random().toString(36).substr(2, 9) };
  },

  getReports: async (userId: string, userRole: string): Promise<Report[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (userRole === 'umpire_manager') {
      return mockReports;
    }
    return mockReports.filter(report => report.assessment.assessorId === userId);
  },
};