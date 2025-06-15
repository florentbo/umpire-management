import { AssessmentService } from '../../domain/services/AssessmentService';
import { CreateAssessmentUseCase } from '../../application/usecases/CreateAssessmentUseCase';
import { SupabaseAssessmentRepository, SupabaseMatchReportRepository } from '../repositories/SupabaseAssessmentRepository';
import { RestAssessmentRepository, RestMatchReportRepository } from '../repositories/RestAssessmentRepository';

export interface Container {
  getAssessmentService(): AssessmentService;
  getCreateAssessmentUseCase(): CreateAssessmentUseCase;
}

export class DIContainer implements Container {
  private assessmentService?: AssessmentService;
  private createAssessmentUseCase?: CreateAssessmentUseCase;

  constructor(private readonly config: { useSupabase: boolean; supabaseClient?: any; restClient?: any }) {}

  getAssessmentService(): AssessmentService {
    if (!this.assessmentService) {
      if (this.config.useSupabase && this.config.supabaseClient) {
        const assessmentRepo = new SupabaseAssessmentRepository(this.config.supabaseClient);
        const matchReportRepo = new SupabaseMatchReportRepository(this.config.supabaseClient);
        this.assessmentService = new AssessmentService(assessmentRepo, matchReportRepo);
      } else if (this.config.restClient) {
        const assessmentRepo = new RestAssessmentRepository(this.config.restClient);
        const matchReportRepo = new RestMatchReportRepository(this.config.restClient);
        this.assessmentService = new AssessmentService(assessmentRepo, matchReportRepo);
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
}