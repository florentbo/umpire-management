import { AssessmentService } from '@/domain/services/AssessmentService.ts';
import { CreateAssessmentUseCase } from '@/application/usecases/CreateAssessmentUseCase.ts';
import { GetAllReportsUseCase } from '@/application/usecases/GetAllReportsUseCase.ts';
import { SupabaseAssessmentRepository, SupabaseMatchReportRepository } from '../repositories/SupabaseAssessmentRepository';

export interface Container {
  getAssessmentService(): AssessmentService;
  getCreateAssessmentUseCase(): CreateAssessmentUseCase;
  getGetAllReportsUseCase(): GetAllReportsUseCase;
}

export class DIContainer implements Container {
  private assessmentService?: AssessmentService;
  private createAssessmentUseCase?: CreateAssessmentUseCase;
  private getAllReportsUseCase?: GetAllReportsUseCase;

  constructor(private readonly config: { useSupabase: boolean; supabaseClient?: any; restClient?: any }) {}

  getAssessmentService(): AssessmentService {
    if (!this.assessmentService) {
      if (this.config.useSupabase && this.config.supabaseClient) {
        const assessmentRepo = new SupabaseAssessmentRepository(this.config.supabaseClient);
        const matchReportRepo = new SupabaseMatchReportRepository(this.config.supabaseClient);
        this.assessmentService = new AssessmentService(assessmentRepo, matchReportRepo);
      } else if (this.config.restClient) {
        throw new Error('RestMatchReportRepository is not implemented. Use Supabase or implement the repository.');
      } else {
        throw new Error('No valid configuration provided for AssessmentService');
      }
    }
    return this.assessmentService;
  }

  getCreateAssessmentUseCase(): CreateAssessmentUseCase {
    if (!this.createAssessmentUseCase) {
      this.createAssessmentUseCase = new CreateAssessmentUseCase(this.getAssessmentService());
    }
    return this.createAssessmentUseCase;
  }

  getGetAllReportsUseCase(): GetAllReportsUseCase {
    if (!this.getAllReportsUseCase) {
      const matchReportRepo = new SupabaseMatchReportRepository(this.config.supabaseClient);
      this.getAllReportsUseCase = new GetAllReportsUseCase(matchReportRepo);
    }
    return this.getAllReportsUseCase;
  }
}
