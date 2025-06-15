import { Match } from '@/types';

export function parseMatchesFromCSV(csvContent: string): Match[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  return lines.map(line => {
    const [
      id,
      date,
      time,
      umpireA,
      umpireAId,
      umpireB,
      umpireBId,
      umpireManagerEmail,
      umpireManagerId,
      homeTeam,
      awayTeam,
      division
    ] = line.split(';');

    return {
      id,
      date,
      time: time.split('.')[0], // Remove milliseconds
      umpireA,
      umpireB,
      umpireAId,
      umpireBId,
      umpireManagerEmail,
      umpireManagerId,
      homeTeam,
      awayTeam,
      division
    };
  });
} 