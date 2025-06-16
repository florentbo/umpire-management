import { MatchInfo } from '../entities/MatchReport';
import { MatchId } from '../entities/Assessment';

export interface MatchRepository {
  findByManagerId(managerId: string): Promise<MatchInfo[]>;
  findById(matchId: MatchId): Promise<MatchInfo | null>;
}