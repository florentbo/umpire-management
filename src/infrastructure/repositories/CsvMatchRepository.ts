import { MatchRepository } from '@/domain/repositories/MatchRepository';
import { MatchInfo } from '@/domain/entities/MatchReport';
import { MatchId } from '@/domain/entities/Assessment';
import { parseMatchesFromCSV } from '@/lib/csv-parser';
import { Match } from '@/shared/types';

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

export class CsvMatchRepository implements MatchRepository {
  async findByManagerId(managerId: string): Promise<MatchInfo[]> {
    const matches = await loadCsvMatches();
    return matches
      .filter(match => match.umpireManagerId === managerId)
      .map(match => this.mapToMatchInfo(match));
  }

  async findById(matchId: MatchId): Promise<MatchInfo | null> {
    const matches = await loadCsvMatches();
    const match = matches.find(m => m.id === matchId.value);
    return match ? this.mapToMatchInfo(match) : null;
  }

  private mapToMatchInfo(csvMatch: Match): MatchInfo {
    return {
      id: { value: csvMatch.id },
      homeTeam: csvMatch.homeTeam,
      awayTeam: csvMatch.awayTeam,
      division: csvMatch.division,
      date: csvMatch.date,
      time: csvMatch.time,
      umpireAName: csvMatch.umpireA,
      umpireBName: csvMatch.umpireB,
      umpireManagerId: csvMatch.umpireManagerId
    };
  }
}