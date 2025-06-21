import { MatchInfo } from '../entities/MatchReport';
import { MatchId } from '../entities/Assessment';

export interface MatchRepository {
  findByManagerId(managerId: string): Promise<MatchInfo[]>;
  findById(matchId: MatchId): Promise<MatchInfo | null>;

  /**
   * Fetches all MatchInfo objects for the given match IDs.
   */
  findByIds(matchIds: MatchId[]): Promise<MatchInfo[]>;
}