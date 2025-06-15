export interface AssessmentId {
  value: string;
}

export interface MatchId {
  value: string;
}

export interface UmpireId {
  value: string;
}

export interface AssessorId {
  value: string;
}

export interface Score {
  value: number;
  maxValue: number;
}

export interface Grade {
  percentage: number;
  level: GradeLevel;
}

export enum GradeLevel {
  BELOW_EXPECTATION = 'BELOW_EXPECTATION',
  AT_CURRENT_LEVEL = 'AT_CURRENT_LEVEL',
  ABOVE_EXPECTATION = 'ABOVE_EXPECTATION'
}

export interface TopicScore {
  topicName: string;
  questionResponses: QuestionResponse[];
  remarks?: string;
  totalScore: number;
  maxScore: number;
}

export interface QuestionResponse {
  questionId: string;
  selectedValue: string;
  points: number;
}

export interface UmpireAssessment {
  umpireId: UmpireId;
  topics: TopicScore[];
  conclusion: string;
  totalScore: Score;
  grade: Grade;
}

export class Assessment {
  constructor(
    public readonly id: AssessmentId,
    public readonly matchId: MatchId,
    public readonly assessorId: AssessorId,
    public readonly umpireA: UmpireAssessment,
    public readonly umpireB: UmpireAssessment,
    public readonly createdAt: Date,
    public readonly updatedAt?: Date
  ) {}

  static create(
    matchId: MatchId,
    assessorId: AssessorId,
    umpireAData: Omit<UmpireAssessment, 'totalScore' | 'grade'>,
    umpireBData: Omit<UmpireAssessment, 'totalScore' | 'grade'>
  ): Assessment {
    const id: AssessmentId = { value: crypto.randomUUID() };
    const now = new Date();

    const umpireA: UmpireAssessment = {
      ...umpireAData,
      totalScore: Assessment.calculateTotalScore(umpireAData.topics),
      grade: Assessment.calculateGrade(umpireAData.topics)
    };

    const umpireB: UmpireAssessment = {
      ...umpireBData,
      totalScore: Assessment.calculateTotalScore(umpireBData.topics),
      grade: Assessment.calculateGrade(umpireBData.topics)
    };

    return new Assessment(id, matchId, assessorId, umpireA, umpireB, now);
  }

  private static calculateTotalScore(topics: TopicScore[]): Score {
    const totalScore = topics.reduce((sum, topic) => sum + topic.totalScore, 0);
    const maxScore = topics.reduce((sum, topic) => sum + topic.maxScore, 0);
    
    return {
      value: totalScore,
      maxValue: maxScore
    };
  }

  private static calculateGrade(topics: TopicScore[]): Grade {
    const totalScore = Assessment.calculateTotalScore(topics);
    const percentage = (totalScore.value / totalScore.maxValue) * 100;
    
    let level: GradeLevel;
    if (percentage < 60) {
      level = GradeLevel.BELOW_EXPECTATION;
    } else if (percentage >= 60 && percentage < 70) {
      level = GradeLevel.AT_CURRENT_LEVEL;
    } else {
      level = GradeLevel.ABOVE_EXPECTATION;
    }

    return { percentage, level };
  }

  update(umpireAData: Partial<UmpireAssessment>, umpireBData: Partial<UmpireAssessment>): Assessment {
    const updatedUmpireA = { ...this.umpireA, ...umpireAData };
    const updatedUmpireB = { ...this.umpireB, ...umpireBData };

    if (umpireAData.topics) {
      updatedUmpireA.totalScore = Assessment.calculateTotalScore(umpireAData.topics);
      updatedUmpireA.grade = Assessment.calculateGrade(umpireAData.topics);
    }

    if (umpireBData.topics) {
      updatedUmpireB.totalScore = Assessment.calculateTotalScore(umpireBData.topics);
      updatedUmpireB.grade = Assessment.calculateGrade(umpireBData.topics);
    }

    return new Assessment(
      this.id,
      this.matchId,
      this.assessorId,
      updatedUmpireA,
      updatedUmpireB,
      this.createdAt,
      new Date()
    );
  }
}