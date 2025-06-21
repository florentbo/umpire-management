import { AssessmentService } from '@/domain/services/AssessmentService';
import { CreateAssessmentUseCase } from '@/application/usecases/CreateAssessmentUseCase';
import { GetAllReportsUseCase } from '@/application/usecases/GetAllReportsUseCase';
import { GetManagerMatchesWithStatusUseCase } from '@/application/usecases/GetManagerMatchesWithStatusUseCase';
import { SaveDraftAssessmentUseCase } from '@/application/usecases/SaveDraftAssessmentUseCase';
import { LoadDraftAssessmentUseCase } from '@/application/usecases/LoadDraftAssessmentUseCase';
import { MatchRepository } from '@/domain/repositories/MatchRepository';
import { SupabaseAssessmentRepository } from '../repositories/SupabaseAssessmentRepository';
import { SupabaseMatchReportRepository } from '../repositories/SupabaseMatchReportRepository';
import { CsvMatchRepository } from '../repositories/CsvMatchRepository';
import { AssessmentRepository } from '@/domain/repositories/AssessmentRepository';
import { supabase } from '@/lib/supabase';

export interface Container {
  getAssessmentService(): AssessmentService;
  getCreateAssessmentUseCase(): CreateAssessmentUseCase;
  getSaveDraftAssessmentUseCase(): SaveDraftAssessmentUseCase;
  getLoadDraftAssessmentUseCase(): LoadDraftAssessmentUseCase;
  getGetAllReportsUseCase(): GetAllReportsUseCase;
  getMatchRepository(): MatchRepository;
  getGetManagerMatchesWithStatusUseCase(): GetManagerMatchesWithStatusUseCase;
  getAssessmentRepository(): AssessmentRepository;
}

export class DIContainer implements Container {
  private assessmentService?: AssessmentService;
  private createAssessmentUseCase?: CreateAssessmentUseCase;
  private saveDraftAssessmentUseCase?: SaveDraftAssessmentUseCase;
  private loadDraftAssessmentUseCase?: LoadDraftAssessmentUseCase;
  private getAllReportsUseCase?: GetAllReportsUseCase;
  private matchRepository?: MatchRepository;
  private getManagerMatchesWithStatusUseCase?: GetManagerMatchesWithStatusUseCase;
  private assessmentRepository?: AssessmentRepository;

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

  getSaveDraftAssessmentUseCase(): SaveDraftAssessmentUseCase {
    if (!this.saveDraftAssessmentUseCase) {
      this.saveDraftAssessmentUseCase = new SaveDraftAssessmentUseCase(this.getAssessmentService());
    }
    return this.saveDraftAssessmentUseCase;
  }

  getLoadDraftAssessmentUseCase(): LoadDraftAssessmentUseCase {
    if (!this.loadDraftAssessmentUseCase) {
      this.loadDraftAssessmentUseCase = new LoadDraftAssessmentUseCase(this.getAssessmentService());
    }
    return this.loadDraftAssessmentUseCase;
  }

  getGetAllReportsUseCase(): GetAllReportsUseCase {
    if (!this.getAllReportsUseCase) {
      const matchReportRepo = new SupabaseMatchReportRepository(this.config.supabaseClient);
      this.getAllReportsUseCase = new GetAllReportsUseCase(matchReportRepo);
    }
    return this.getAllReportsUseCase;
  }

  getMatchRepository(): MatchRepository {
    if (!this.matchRepository) {
      this.matchRepository = new CsvMatchRepository();
    }
    return this.matchRepository;
  }

  getGetManagerMatchesWithStatusUseCase(): GetManagerMatchesWithStatusUseCase {
    if (!this.getManagerMatchesWithStatusUseCase) {
      this.getManagerMatchesWithStatusUseCase = new GetManagerMatchesWithStatusUseCase(
        this.getMatchRepository(),
        new SupabaseAssessmentRepository(this.config.supabaseClient),
        new SupabaseMatchReportRepository(this.config.supabaseClient)
      );
    }
    return this.getManagerMatchesWithStatusUseCase;
  }

  getAssessmentRepository(): AssessmentRepository {
    if (!this.assessmentRepository) {
      this.assessmentRepository = new SupabaseAssessmentRepository(supabase);
    }
    return this.assessmentRepository;
  }
}