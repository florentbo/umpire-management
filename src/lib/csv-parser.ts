import { Match } from '@/shared/types';

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

export function parseUmpiresFromCSV(csvContent: string): { name: string; id: string }[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  // Remove header if present
  const dataLines = lines[0].toLowerCase().startsWith('name') ? lines.slice(1) : lines;
  return dataLines.map(line => {
    const [name, id] = line.split(',');
    return { name: name.trim(), id: id.trim() };
  });
} 