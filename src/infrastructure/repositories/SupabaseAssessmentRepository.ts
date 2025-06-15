import { AssessmentRepository, MatchReportRepository } from '../../domain/repositories/AssessmentRepository';
import { Assessment, AssessmentId, MatchId } from '../../domain/entities/Assessment';
import { MatchReport, MatchReportId } from '../../domain/entities/MatchReport';

// Supabase client would be injected here
interface SupabaseClient {
  from: (table: string) => any;
  auth: {
    getUser: () => Promise<{ data: { user: { id: string; email?: string } | null } }>;
  };
}

export class SupabaseAssessmentRepository implements AssessmentRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async save(assessment: Assessment): Promise<Assessment> {
    // Get the current authenticated user to ensure we use the correct ID
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const data = {
      id: assessment.id.value,
      match_id: assessment.matchId.value,
      assessor_id: assessment.assessorId.value, // Use the assessor ID from the domain entity
      umpire_a_data: assessment.umpireA,
      umpire_b_data: assessment.umpireB,
      created_at: assessment.createdAt.toISOString(),
      updated_at: assessment.updatedAt?.toISOString()
    };

    const { data: result, error } = await this.supabase
      .from('assessments')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Failed to save assessment: ${error.message}`);
    
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

  async findByMatchId(matchId: MatchId): Promise<Assessment[]> {
    const { data, error } = await this.supabase
      .from('assessments')
      .select('*')
      .eq('match_id', matchId.value);

    if (error) throw new Error(`Failed to find assessments: ${error.message}`);
    
    return data.map((item: any) => this.mapToAssessment(item));
  }

  async update(assessment: Assessment): Promise<Assessment> {
    const data = {
      umpire_a_data: assessment.umpireA,
      umpire_b_data: assessment.umpireB,
      updated_at: new Date().toISOString()
    };

    const { data: result, error } = await this.supabase
      .from('assessments')
      .update(data)
      .eq('id', assessment.id.value)
      .select()
      .single();

    if (error) throw new Error(`Failed to update assessment: ${error.message}`);
    
    return this.mapToAssessment(result);
  }

  async delete(id: AssessmentId): Promise<void> {
    const { error } = await this.supabase
      .from('assessments')
      .delete()
      .eq('id', id.value);

    if (error) throw new Error(`Failed to delete assessment: ${error.message}`);
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

export class SupabaseMatchReportRepository implements MatchReportRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async save(report: MatchReport): Promise<MatchReport> {
    const data = {
      id: report.id.value,
      match_id: report.matchInfo.id.value,
      match_info: report.matchInfo,
      assessment_id: report.assessment.id.value,
      submitted_at: report.submittedAt.toISOString()
    };

    const { data: result, error } = await this.supabase
      .from('match_reports')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Failed to save match report: ${error.message}`);
    
    return this.mapToMatchReport(result, report.assessment);
  }

  async findById(id: MatchReportId): Promise<MatchReport | null> {
    const { data, error } = await this.supabase
      .from('match_reports')
      .select(`
        *,
        assessments (*)
      `)
      .eq('id', id.value)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find match report: ${error.message}`);
    }

    const assessment = this.mapToAssessmentFromJoin(data.assessments);
    return this.mapToMatchReport(data, assessment);
  }

  async findByMatchId(matchId: MatchId): Promise<MatchReport[]> {
    const { data, error } = await this.supabase
      .from('match_reports')
      .select(`
        *,
        assessments (*)
      `)
      .eq('match_id', matchId.value);

    if (error) throw new Error(`Failed to find match reports: ${error.message}`);
    
    return data.map((item: any) => {
      const assessment = this.mapToAssessmentFromJoin(item.assessments);
      return this.mapToMatchReport(item, assessment);
    });
  }

  async findByAssessor(assessorId: string): Promise<MatchReport[]> {
    const { data, error } = await this.supabase
      .from('match_reports')
      .select(`
        *,
        assessments!inner (*)
      `)
      .eq('assessments.assessor_id', assessorId);

    if (error) throw new Error(`Failed to find match reports by assessor: ${error.message}`);
    
    return data.map((item: any) => {
      const assessment = this.mapToAssessmentFromJoin(item.assessments);
      return this.mapToMatchReport(item, assessment);
    });
  }

  private mapToMatchReport(data: any, assessment: Assessment): MatchReport {
    return new MatchReport(
      { value: data.id },
      data.match_info,
      assessment,
      new Date(data.submitted_at)
    );
  }

  private mapToAssessmentFromJoin(data: any): Assessment {
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