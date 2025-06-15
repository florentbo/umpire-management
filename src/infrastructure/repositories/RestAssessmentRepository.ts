import { AssessmentRepository } from '../../domain/repositories/AssessmentRepository';
import { Assessment, AssessmentId, MatchId } from '../../domain/entities/Assessment';

interface RestClient {
  post: (url: string, data: any) => Promise<any>;
  get: (url: string) => Promise<any>;
  put: (url: string, data: any) => Promise<any>;
  delete: (url: string) => Promise<any>;
}

export class RestAssessmentRepository implements AssessmentRepository {
  constructor(
    private readonly restClient: RestClient,
    private readonly baseUrl: string = '/api/v1'
  ) {}

  async save(assessment: Assessment): Promise<Assessment> {
    const payload = {
      matchId: assessment.matchId.value,
      umpireA: {
        topics: assessment.umpireA.topics.map(topic => ({
          name: topic.topicName,
          questions: topic.questionResponses.map(q => ({
            questionId: q.questionId,
            value: q.selectedValue
          })),
          remarks: topic.remarks
        })),
        conclusion: assessment.umpireA.conclusion
      },
      umpireB: {
        topics: assessment.umpireB.topics.map(topic => ({
          name: topic.topicName,
          questions: topic.questionResponses.map(q => ({
            questionId: q.questionId,
            value: q.selectedValue
          })),
          remarks: topic.remarks
        })),
        conclusion: assessment.umpireB.conclusion
      }
    };

    const response = await this.restClient.post(`${this.baseUrl}/assessments`, payload);
    return this.mapToAssessment(response);
  }

  async findById(id: AssessmentId): Promise<Assessment | null> {
    try {
      const response = await this.restClient.get(`${this.baseUrl}/assessments/${id.value}`);
      return this.mapToAssessment(response);
    } catch (error: any) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async findByMatchId(matchId: MatchId): Promise<Assessment[]> {
    const response = await this.restClient.get(`${this.baseUrl}/assessments?matchId=${matchId.value}`);
    return response.items.map((item: any) => this.mapToAssessment(item));
  }

  async update(assessment: Assessment): Promise<Assessment> {
    const payload = {
      umpireA: {
        topics: assessment.umpireA.topics.map(topic => ({
          name: topic.topicName,
          questions: topic.questionResponses.map(q => ({
            questionId: q.questionId,
            value: q.selectedValue
          })),
          remarks: topic.remarks
        })),
        conclusion: assessment.umpireA.conclusion
      },
      umpireB: {
        topics: assessment.umpireB.topics.map(topic => ({
          name: topic.topicName,
          questions: topic.questionResponses.map(q => ({
            questionId: q.questionId,
            value: q.selectedValue
          })),
          remarks: topic.remarks
        })),
        conclusion: assessment.umpireB.conclusion
      }
    };

    const response = await this.restClient.put(`${this.baseUrl}/assessments/${assessment.id.value}`, payload);
    return this.mapToAssessment(response);
  }

  async delete(id: AssessmentId): Promise<void> {
    await this.restClient.delete(`${this.baseUrl}/assessments/${id.value}`);
  }

  private mapToAssessment(data: any): Assessment {
    // Map from API response to domain entity
    // This would need to be implemented based on your API response structure
    return new Assessment(
      { value: data.id },
      { value: data.matchId },
      { value: data.assessorId },
      this.mapToUmpireAssessment(data.umpireA),
      this.mapToUmpireAssessment(data.umpireB),
      new Date(data.createdAt),
      data.updatedAt ? new Date(data.updatedAt) : undefined
    );
  }

  private mapToUmpireAssessment(data: any): any {
    // Implementation depends on API structure
    return {
      umpireId: { value: data.umpireId },
      topics: data.topics || [],
      conclusion: data.conclusion || '',
      totalScore: { value: 0, maxValue: 50 },
      grade: { percentage: 0, level: 'AT_CURRENT_LEVEL' }
    };
  }
}