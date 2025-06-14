import { Match } from '@/types';

export function parseMatchesFromCSV(csvContent: string): Match[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  return lines.map(line => {
    const [
      id,
      date,
      time,
      umpireA,
      umpireB,
      _venue, // Using underscore to indicate intentionally unused variable
      homeTeam,
      division
    ] = line.split(';');

    // Parse the time to get only HH:mm format
    const timeMatch = time.match(/(\d{2}:\d{2})/);
    const formattedTime = timeMatch ? timeMatch[1] : time;

    return {
      id,
      homeTeam,
      awayTeam: division, // In the CSV, the division field contains the away team
      division: division.split(' ').slice(0, -1).join(' '), // Remove the last word which is the division
      date,
      time: formattedTime,
      umpireA: umpireA.trim(),
      umpireB: umpireB.trim(),
    };
  });
} 