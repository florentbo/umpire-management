import { AssessmentRepository } from '@/domain/repositories/AssessmentRepository';
import { MatchRepository } from '@/domain/repositories/MatchRepository';
import { MatchId } from '@/domain/entities/Assessment';
import { Assessment } from '@/domain/entities/Assessment';

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

  /**
   * Finds all unique umpires (id and name) who have been assessed by anyone,
   * where the umpire's name contains the given search term (case-insensitive, partial match).
   * @param searchTerm The partial name to search for.
   * @returns A Promise of a list of unique umpires (id and name).
   */
  findAssessedUmpiresByName(
    searchTerm: string
  ): Promise<AssessedUmpire[]>;

  /**
   * Finds all assessments by a given manager that contain a specific umpire.
   * @param assessorId The ID of the manager/assessor.
   * @param umpireId The ID of the umpire to search for.
   * @returns A Promise of a list of assessments containing the umpire.
   */
  findAssessmentsByManagerAndUmpire(
    assessorId: string,
    umpireId: string
  ): Promise<Assessment[]>;

  /**
   * Finds all published assessments that contain a specific umpire (regardless of who assessed them).
   * @param umpireId The ID of the umpire to search for.
   * @returns A Promise of a list of assessments containing the umpire.
   */
  findAssessmentsByUmpire(
    umpireId: string
  ): Promise<Assessment[]>;
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
    
    // Normalize search term
    const search = searchTerm.trim().toLowerCase();
    const umpireMap = new Map<string, string>();
    
    console.log('Search term:', searchTerm);
    console.log('Normalized search:', search);
    console.log('Assessments found:', assessments.length);
    console.log('Matches found:', matches.length);

    for (const assessment of assessments) {
      const match = matchMap.get(assessment.matchId.value);
      if (!match) {
        console.log('No match found for assessment:', assessment.matchId.value);
        continue;
      }
      
      // Umpire A
      if (assessment.umpireA?.umpireId?.value && match.umpireAName) {
        const umpireAName = match.umpireAName.toLowerCase();
        console.log(`Checking umpire A: "${match.umpireAName}" against search: "${search}"`);
        if (umpireAName.includes(search)) {
          umpireMap.set(assessment.umpireA.umpireId.value, match.umpireAName);
          console.log(`✓ Added umpire A: ${match.umpireAName}`);
        }
      }
      
      // Umpire B
      if (assessment.umpireB?.umpireId?.value && match.umpireBName) {
        const umpireBName = match.umpireBName.toLowerCase();
        console.log(`Checking umpire B: "${match.umpireBName}" against search: "${search}"`);
        if (umpireBName.includes(search)) {
          umpireMap.set(assessment.umpireB.umpireId.value, match.umpireBName);
          console.log(`✓ Added umpire B: ${match.umpireBName}`);
        }
      }
    }

    const result = Array.from(umpireMap.entries()).map(([id, name]) => ({ id, name }));
    console.log('Final result:', result);
    return result;
  }

  async findAssessedUmpiresByName(
    searchTerm: string
  ): Promise<AssessedUmpire[]> {
    // Get all published assessments (not just by a specific assessor)
    const assessments = await this.assessmentRepo.findPublished();
    const matchIds: MatchId[] = assessments.map(a => a.matchId);
    const matches = await this.matchRepo.findByIds(matchIds);
    const matchMap = new Map(matches.map(m => [m.id.value, m]));
    
    // Normalize search term
    const search = searchTerm.trim().toLowerCase();
    const umpireMap = new Map<string, string>();
    
    console.log('Search term (all umpires):', searchTerm);
    console.log('Normalized search:', search);
    console.log('All assessments found:', assessments.length);
    console.log('All matches found:', matches.length);

    for (const assessment of assessments) {
      const match = matchMap.get(assessment.matchId.value);
      if (!match) {
        console.log('No match found for assessment:', assessment.matchId.value);
        continue;
      }
      
      // Umpire A
      if (assessment.umpireA?.umpireId?.value && match.umpireAName) {
        const umpireAName = match.umpireAName.toLowerCase();
        console.log(`Checking umpire A: "${match.umpireAName}" against search: "${search}"`);
        if (umpireAName.includes(search)) {
          umpireMap.set(assessment.umpireA.umpireId.value, match.umpireAName);
          console.log(`✓ Added umpire A: ${match.umpireAName}`);
        }
      }
      
      // Umpire B
      if (assessment.umpireB?.umpireId?.value && match.umpireBName) {
        const umpireBName = match.umpireBName.toLowerCase();
        console.log(`Checking umpire B: "${match.umpireBName}" against search: "${search}"`);
        if (umpireBName.includes(search)) {
          umpireMap.set(assessment.umpireB.umpireId.value, match.umpireBName);
          console.log(`✓ Added umpire B: ${match.umpireBName}`);
        }
      }
    }

    const result = Array.from(umpireMap.entries()).map(([id, name]) => ({ id, name }));
    console.log('Final result (all umpires):', result);
    return result;
  }

  async findAssessmentsByManagerAndUmpire(
    assessorId: string,
    umpireId: string
  ): Promise<Assessment[]> {
    const assessments = await this.assessmentRepo.findPublishedByAssessor(assessorId);
    
    // Filter assessments that contain the specified umpire
    const filteredAssessments = assessments.filter(assessment => 
      assessment.umpireA?.umpireId?.value === umpireId || 
      assessment.umpireB?.umpireId?.value === umpireId
    );

    console.log(`Found ${filteredAssessments.length} assessments for umpire ${umpireId}`);
    return filteredAssessments;
  }

  async findAssessmentsByUmpire(
    umpireId: string
  ): Promise<Assessment[]> {
    // Get all published assessments (not just by a specific assessor)
    const assessments = await this.assessmentRepo.findPublished();
    
    // Filter assessments that contain the specified umpire
    const filteredAssessments = assessments.filter(assessment => 
      assessment.umpireA?.umpireId?.value === umpireId || 
      assessment.umpireB?.umpireId?.value === umpireId
    );

    console.log(`Found ${filteredAssessments.length} total assessments for umpire ${umpireId}`);
    return filteredAssessments;
  }
} 