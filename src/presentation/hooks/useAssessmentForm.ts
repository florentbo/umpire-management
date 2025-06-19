import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export interface AssessmentFormState {
  umpireAScores: Record<string, number>;
  umpireAValues: Record<string, string>;
  umpireAConclusion: string;
  umpireARemarks: Record<string, string>;
  umpireBScores: Record<string, number>;
  umpireBValues: Record<string, string>;
  umpireBConclusion: string;
  umpireBRemarks: Record<string, string>;
}

export interface ValidationResult {
  isValid: boolean;
  firstInvalidField: React.RefObject<HTMLDivElement> | null;
  fieldName: string | null;
}

export function useAssessmentForm(
  assessmentConfig: any,
  existingData?: any,
  canEdit: boolean = true
) {
  // Form state
  const [formState, setFormState] = useState<AssessmentFormState>({
    umpireAScores: {},
    umpireAValues: {},
    umpireAConclusion: '',
    umpireARemarks: {},
    umpireBScores: {},
    umpireBValues: {},
    umpireBConclusion: '',
    umpireBRemarks: {}
  });

  // UI state
  const [isVerticalView, setIsVerticalView] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Refs for validation
  const umpireARef = useRef<HTMLDivElement>(null);
  const umpireBRef = useRef<HTMLDivElement>(null);

  // Load existing data if provided
  useEffect(() => {
    if (existingData && assessmentConfig) {
      console.log('Loading existing data:', existingData);

      setCurrentDraftId(existingData.assessmentId);
      if (existingData.lastSavedAt) {
        setLastSaveTime(new Date(existingData.lastSavedAt));
      }

      // Load Umpire A data
      const umpireAScoresMap: Record<string, number> = {};
      const umpireAValuesMap: Record<string, string> = {};
      const umpireARemarksMap: Record<string, string> = {};

      existingData.umpireAData.topics.forEach((topic: any) => {
        topic.questionResponses.forEach((response: any) => {
          umpireAValuesMap[response.questionId] = response.selectedValue;
          umpireAScoresMap[response.questionId] = response.points;
        });
        if (topic.remarks) {
          umpireARemarksMap[topic.topicName] = topic.remarks;
        }
      });

      // Load Umpire B data
      const umpireBScoresMap: Record<string, number> = {};
      const umpireBValuesMap: Record<string, string> = {};
      const umpireBRemarksMap: Record<string, string> = {};

      existingData.umpireBData.topics.forEach((topic: any) => {
        topic.questionResponses.forEach((response: any) => {
          umpireBValuesMap[response.questionId] = response.selectedValue;
          umpireBScoresMap[response.questionId] = response.points;
        });
        if (topic.remarks) {
          umpireBRemarksMap[topic.topicName] = topic.remarks;
        }
      });

      setFormState({
        umpireAScores: umpireAScoresMap,
        umpireAValues: umpireAValuesMap,
        umpireAConclusion: existingData.umpireAData.conclusion,
        umpireARemarks: umpireARemarksMap,
        umpireBScores: umpireBScoresMap,
        umpireBValues: umpireBValuesMap,
        umpireBConclusion: existingData.umpireBData.conclusion,
        umpireBRemarks: umpireBRemarksMap
      });

      setHasUnsavedChanges(false);
      if (existingData.assessmentId) {
        toast.success('Brouillon chargé depuis la base de données');
      }
    }
  }, [existingData, assessmentConfig]);

  // Track changes for auto-save indication
  useEffect(() => {
    if (assessmentConfig && currentDraftId) {
      setHasUnsavedChanges(true);
    }
  }, [formState, assessmentConfig, currentDraftId]);

  // Validation logic
  const validateForPublish = (): ValidationResult => {
    const validateUmpire = (values: Record<string, string>, conclusion: string, umpireRef: React.RefObject<HTMLDivElement>) => {
      for (const topic of assessmentConfig.topics) {
        for (const question of topic.questions) {
          if (!values[question.id] || values[question.id] === '') {
            return { isValid: false, ref: umpireRef, field: question.text };
          }
        }
      }

      if (!conclusion.trim()) {
        return { isValid: false, ref: umpireRef, field: 'Conclusion' };
      }

      return { isValid: true, ref: null, field: null };
    };

    const umpireAValidation = validateUmpire(formState.umpireAValues, formState.umpireAConclusion, umpireARef);
    if (!umpireAValidation.isValid) {
      return {
        isValid: false,
        firstInvalidField: umpireAValidation.ref,
        fieldName: `Arbitre A - ${umpireAValidation.field}`
      };
    }

    const umpireBValidation = validateUmpire(formState.umpireBValues, formState.umpireBConclusion, umpireBRef);
    if (!umpireBValidation.isValid) {
      return {
        isValid: false,
        firstInvalidField: umpireBValidation.ref,
        fieldName: `Arbitre B - ${umpireBValidation.field}`
      };
    }

    return { isValid: true, firstInvalidField: null, fieldName: null };
  };

  // Data building logic
  const buildTopics = (values: Record<string, string>, scores: Record<string, number>, remarks: Record<string, string>) => {
    return assessmentConfig.topics.map((topic: any) => ({
      topicName: topic.name,
      questionResponses: topic.questions.map((question: any) => ({
        questionId: question.id,
        selectedValue: values[question.id] || '',
        points: scores[question.id] || 0
      })),
      remarks: remarks[topic.name] || ''
    }));
  };

  // Update handlers
  const updateUmpireA = (field: keyof Pick<AssessmentFormState, 'umpireAScores' | 'umpireAValues' | 'umpireAConclusion' | 'umpireARemarks'>, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateUmpireB = (field: keyof Pick<AssessmentFormState, 'umpireBScores' | 'umpireBValues' | 'umpireBConclusion' | 'umpireBRemarks'>, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Auto-save logic
  useEffect(() => {
    if (hasUnsavedChanges && canEdit && currentDraftId) {
      const autoSaveTimer = setTimeout(() => {
        // This would be handled by the parent component
        setHasUnsavedChanges(false);
      }, 30000); // 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, canEdit, currentDraftId]);

  return {
    // State
    formState,
    isVerticalView,
    setIsVerticalView,
    currentDraftId,
    lastSaveTime,
    hasUnsavedChanges,
    
    // Refs
    umpireARef,
    umpireBRef,
    
    // Methods
    validateForPublish,
    buildTopics,
    updateUmpireA,
    updateUmpireB,
    setFormState,
    setHasUnsavedChanges
  };
} 