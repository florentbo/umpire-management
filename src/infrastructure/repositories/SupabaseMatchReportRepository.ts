import { MatchReportRepository } from '@/domain/repositories/AssessmentRepository';
import { MatchReport, MatchReportId } from '@/domain/entities/MatchReport';
import { MatchId } from '@/domain/entities/Assessment';
import { Assessment } from '@/domain/entities/Assessment';

// Supabase client interface
interface SupabaseClient {
  from: (table: string) => any;
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

  async findByMatchIds(matchIds: MatchId[]): Promise<MatchReport[]> {
    if (matchIds.length === 0) return [];

    const matchIdValues = matchIds.map(id => id.value);
    const { data, error } = await this.supabase
      .from('match_reports')
      .select(`
        *,
        assessments (*)
      `)
      .in('match_id', matchIdValues);

    if (error) throw new Error(`Failed to find match reports by match IDs: ${error.message}`);

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
      .eq('assessments.assessor_id', assessorId)
      .eq('assessments.status', 'PUBLISHED'); // Only published reports

    if (error) throw new Error(`Failed to find match reports by assessor: ${error.message}`);

    return data.map((item: any) => {
      const assessment = this.mapToAssessmentFromJoin(item.assessments);
      return this.mapToMatchReport(item, assessment);
    });
  }

  async findAll(): Promise<MatchReport[]> {
    console.log('Finding all published match reports...');
    
    const { data, error } = await this.supabase
      .from('match_reports')
      .select(`
        *,
        assessments!inner (*)
      `)
      .eq('assessments.status', 'PUBLISHED') // Only published reports
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error finding all match reports:', error);
      throw new Error(`Failed to find all match reports: ${error.message}`);
    }

    console.log(`Found ${data?.length || 0} published reports`);

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item: any) => {
      const assessment = this.mapToAssessmentFromJoin(item.assessments);
      return this.mapToMatchReport(item, assessment);
    });
  }

  async findAllWithFilters(filters: { assessorId?: string; grade?: string }): Promise<MatchReport[]> {
    let query = this.supabase
      .from('match_reports')
      .select(`*, assessments!inner (*)`)
      .eq('assessments.status', 'PUBLISHED');

    if (filters.assessorId) {
      query = query.eq('assessments.assessor_id', filters.assessorId);
    }
    if (filters.grade) {
      query = query.eq('assessments.umpire_a_data->>grade->>level', filters.grade);
    }

    const { data, error } = await query.order('submitted_at', { ascending: false });

    if (error) throw new Error(`Failed to find all match reports with filters: ${error.message}`);
    if (!data || data.length === 0) return [];

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
    // Use the same mapping logic as the AssessmentRepository
    const umpireAData = data.umpire_a_data;
    const umpireBData = data.umpire_b_data;

    const mappedUmpireA = {
      umpireId: umpireAData.umpireId || { value: 'unknown' },
      topics: umpireAData.topics || [],
      conclusion: umpireAData.conclusion || '',
      totalScore: umpireAData.totalScore || { value: 0, maxValue: 0 },
      grade: umpireAData.grade || { percentage: 0, level: 'AT_CURRENT_LEVEL' }
    };

    const mappedUmpireB = {
      umpireId: umpireBData.umpireId || { value: 'unknown' },
      topics: umpireBData.topics || [],
      conclusion: umpireBData.conclusion || '',
      totalScore: umpireBData.totalScore || { value: 0, maxValue: 0 },
      grade: umpireBData.grade || { percentage: 0, level: 'AT_CURRENT_LEVEL' }
    };

    return new Assessment(
      { value: data.id },
      { value: data.match_id },
      { value: data.assessor_id },
      mappedUmpireA,
      mappedUmpireB,
      new Date(data.created_at),
      data.updated_at ? new Date(data.updated_at) : undefined
    );
  }
}