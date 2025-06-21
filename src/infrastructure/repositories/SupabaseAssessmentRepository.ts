import { AssessmentRepository } from '@/domain/repositories/AssessmentRepository';
import { Assessment, AssessmentId, MatchId } from '@/domain/entities/Assessment';

// Supabase client would be injected here
interface SupabaseClient {
  from: (table: string) => any;
}

export class SupabaseAssessmentRepository implements AssessmentRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async saveAsDraft(assessment: Assessment): Promise<Assessment> {
    const data = {
      id: assessment.id.value,
      match_id: assessment.matchId.value,
      assessor_id: assessment.assessorId.value,
      umpire_a_data: assessment.umpireA,
      umpire_b_data: assessment.umpireB,
      status: 'DRAFT',
      created_at: assessment.createdAt.toISOString(),
      updated_at: assessment.updatedAt?.toISOString(),
      last_saved_at: new Date().toISOString()
    };

    const { data: result, error } = await this.supabase
      .from('assessments')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Failed to save draft assessment: ${error.message}`);

    return this.mapToAssessment(result);
  }

  async saveAsPublished(assessment: Assessment): Promise<Assessment> {
    const data = {
      id: assessment.id.value,
      match_id: assessment.matchId.value,
      assessor_id: assessment.assessorId.value,
      umpire_a_data: assessment.umpireA,
      umpire_b_data: assessment.umpireB,
      status: 'PUBLISHED',
      created_at: assessment.createdAt.toISOString(),
      updated_at: assessment.updatedAt?.toISOString(),
      last_saved_at: new Date().toISOString()
    };

    const { data: result, error } = await this.supabase
      .from('assessments')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Failed to save published assessment: ${error.message}`);

    return this.mapToAssessment(result);
  }

  async findById(id: AssessmentId): Promise<Assessment | null> {
    const { data, error } = await this.supabase
      .from('assessments')
      .select('*')
      .eq('id', id.value)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to find assessment: ${error.message}`);
    }

    return this.mapToAssessment(data);
  }

  async findByMatchIds(matchIds: MatchId[]): Promise<Assessment[]> {
    if (matchIds.length === 0) return [];

    const matchIdValues = matchIds.map(id => id.value);
    const { data, error } = await this.supabase
      .from('assessments')
      .select('*')
      .in('match_id', matchIdValues);

    if (error) throw new Error(`Failed to find assessments by match IDs: ${error.message}`);

    return data.map((item: any) => this.mapToAssessment(item));
  }

  async findDraftByMatchAndAssessor(matchId: string, assessorId: string): Promise<Assessment | null> {
    const { data, error } = await this.supabase
      .from('assessments')
      .select('*')
      .eq('match_id', matchId)
      .eq('assessor_id', assessorId)
      .eq('status', 'DRAFT')
      .order('last_saved_at', { ascending: false })
      .limit(1);

    if (error) throw new Error(`Failed to find draft assessment: ${error.message}`);

    // If no data found, return null
    if (!data || data.length === 0) return null;

    return this.mapToAssessment(data[0]);
  }

  async updateDraft(assessment: Assessment): Promise<Assessment> {
    const data = {
      umpire_a_data: assessment.umpireA,
      umpire_b_data: assessment.umpireB,
      updated_at: new Date().toISOString(),
      last_saved_at: new Date().toISOString(),
      status: 'DRAFT'
    };

    const { data: result, error } = await this.supabase
      .from('assessments')
      .update(data)
      .eq('id', assessment.id.value)
      .select()
      .single();

    if (error) throw new Error(`Failed to update draft assessment: ${error.message}`);

    return this.mapToAssessment(result);
  }

  async publishDraft(assessment: Assessment): Promise<Assessment> {
    const data = {
      umpire_a_data: assessment.umpireA,
      umpire_b_data: assessment.umpireB,
      status: 'PUBLISHED',
      updated_at: new Date().toISOString(),
      last_saved_at: new Date().toISOString()
    };

    const { data: result, error } = await this.supabase
      .from('assessments')
      .update(data)
      .eq('id', assessment.id.value)
      .select()
      .single();

    if (error) throw new Error(`Failed to publish draft assessment: ${error.message}`);

    return this.mapToAssessment(result);
  }

  async findPublishedByAssessor(assessorId: string): Promise<Assessment[]> {
    const { data, error } = await this.supabase
      .from('assessments')
      .select('*')
      .eq('assessor_id', assessorId)
      .eq('status', 'PUBLISHED');

    if (error) throw new Error(`Failed to find published assessments: ${error.message}`);
    if (!data) return [];
    return data.map((item: any) => this.mapToAssessment(item));
  }

  private mapToAssessment(data: any): Assessment {
    return new Assessment(
      { value: data.id },
      { value: data.match_id },
      { value: data.assessor_id },
      data.umpire_a_data,
      data.umpire_b_data,
      new Date(data.created_at),
      data.updated_at ? new Date(data.updated_at) : undefined
    );
  }
}