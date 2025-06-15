export interface User {
  id: string;
  name: string;
  email: string;
  role: 'umpire_manager' | 'umpire';
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  division: string;
  date: string;
  time: string;
  umpireA: string;
  umpireB: string;
  umpireAId: string;
  umpireBId: string;
  umpireManagerEmail: string;
  umpireManagerId: string;
}

export interface AssessmentCriteria {
  arrivalTime: number; // -1 or 1
  generalAppearance: number; // 0 or 1
  positioningPitch: number; // 0, 1, or 2
  positioningD: number; // 0, 1, or 2
}

export interface Assessment {
  id?: string;
  matchId: string;
  assessorId: string;
  umpireAScores: AssessmentCriteria;
  umpireBScores: AssessmentCriteria;
  createdAt?: string;
  updatedAt?: string;
}

export interface Report {
  id: string;
  matchId: string;
  match: Match;
  assessment: Assessment;
  assessorName: string;
  createdAt: string;
}

// Supported languages
export type Language = 'en' | 'fr';

// Standard option values enum - 4 possible values
export enum OptionValue {
  NOT_OK = 'NOT_OK',
  OK = 'OK',
  PARTIALLY_OK = 'PARTIALLY_OK',
  TO_BE_DONE = 'TO_BE_DONE'
}

// New types for flexible assessment system
export interface AssessmentOption {
  value: OptionValue;
  label: Record<Language, string>;
  points: number;
}

export interface AssessmentCriterion {
  id: string;
  questionId: string; // UUID for OpenAPI compatibility
  label: Record<Language, string>;
  options: AssessmentOption[];
}

export interface AssessmentSection {
  id: string;
  title: Record<Language, string>;
  hasRemarks: boolean;
  criteria: AssessmentCriterion[];
}

export interface AssessmentResponse {
  questionId: string;
  bundle: string; // section id
  responseType: string; // selected option value
  points: number;
  remarks?: string;
}

export interface FlexibleAssessmentData {
  responses: AssessmentResponse[];
  totalScore: number;
  maxScore: number;
}