import { AssessmentRepository } from '@/domain/repositories/AssessmentRepository';
import { MatchRepository } from '@/domain/repositories/MatchRepository';
import { MatchId } from '@/domain/entities/Assessment';

export interface AssessedUmpire {
  id: string;
  name: string;
}

export interface AssessmentQueryRepository {
  /**
   * Finds all unique umpires (id and name) assessed by a given manager (assessor),
   * where the umpire's name contains the given search term (case-insensitive, partial match).
   * @param assessorId The ID of the manager/assessor.
   * @param searchTerm The partial name to search for.
   * @returns A Promise of a list of unique umpires (id and name).
   */
  findAssessedUmpiresByManagerAndName(
    assessorId: string,
    searchTerm: string
  ): Promise<AssessedUmpire[]>;
}

export class AssessmentQueryRepositoryImpl implements AssessmentQueryRepository {
  constructor(
    private readonly assessmentRepo: AssessmentRepository,
    private readonly matchRepo: MatchRepository
  ) {}

  async findAssessedUmpiresByManagerAndName(
    assessorId: string,
    searchTerm: string
  ): Promise<AssessedUmpire[]> {
    const assessments = await this.assessmentRepo.findPublishedByAssessor(assessorId);
    const matchIds: MatchId[] = assessments.map(a => a.matchId);
    const matches = await this.matchRepo.findByIds(matchIds);
    const matchMap = new Map(matches.map(m => [m.id.value, m]));
    const search = searchTerm.trim().toLowerCase();
    const umpireMap = new Map<string, string>();

    for (const assessment of assessments) {
      const match = matchMap.get(assessment.matchId.value);
      if (!match) continue;
      // Umpire A
      if (
        assessment.umpireA?.umpireId?.value &&
        match.umpireAName &&
        match.umpireAName.toLowerCase().includes(search)
      ) {
        umpireMap.set(assessment.umpireA.umpireId.value, match.umpireAName);
      }
      // Umpire B
      if (
        assessment.umpireB?.umpireId?.value &&
        match.umpireBName &&
        match.umpireBName.toLowerCase().includes(search)
      ) {
        umpireMap.set(assessment.umpireB.umpireId.value, match.umpireBName);
      }
    }

    return Array.from(umpireMap.entries()).map(([id, name]) => ({ id, name }));
  }
} 