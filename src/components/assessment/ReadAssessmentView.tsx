import { useState, useEffect } from 'react';
import { UmpireAssessment } from './UmpireAssessment';
import { GradeDisplay } from '@/presentation/components/GradeDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLoadDraftAssessment } from '@/presentation/hooks/useLoadDraftAssessment';
import { ToggleLeft, ToggleRight, Eye, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ReadAssessmentViewProps {
  match: any;
  assessmentConfig: any;
  matchId: string;
  assessorId: string;
}

export function ReadAssessmentView({ 
  match, 
  assessmentConfig, 
  matchId, 
  assessorId 
}: ReadAssessmentViewProps) {
  const [isVerticalView, setIsVerticalView] = useState(false);
  
  // Assessment state for display
  const [umpireAScores, setUmpireAScores] = useState<Record<string, number>>({});
  const [umpireAValues, setUmpireAValues] = useState<Record<string, string>>({});
  const [umpireAConclusion, setUmpireAConclusion] = useState('');

  const [umpireBScores, setUmpireBScores] = useState<Record<string, number>>({});
  const [umpireBValues, setUmpireBValues] = useState<Record<string, string>>({});
  const [umpireBConclusion, setUmpireBConclusion] = useState('');

  // Load published assessment data
  const { data: publishedAssessment, isLoading: assessmentLoading } = useLoadDraftAssessment(
    matchId,
    assessorId
  );

  // Load assessment data when available
  useEffect(() => {
    if (publishedAssessment && assessmentConfig) {
      console.log('Loading published assessment:', publishedAssessment);

      // Load Umpire A data
      const umpireAScoresMap: Record<string, number> = {};
      const umpireAValuesMap: Record<string, string> = {};

      publishedAssessment.umpireAData.topics.forEach(topic => {
        topic.questionResponses.forEach(response => {
          umpireAValuesMap[response.questionId] = response.selectedValue;
          umpireAScoresMap[response.questionId] = response.points;
        });
      });

      setUmpireAScores(umpireAScoresMap);
      setUmpireAValues(umpireAValuesMap);
      setUmpireAConclusion(publishedAssessment.umpireAData.conclusion);

      // Load Umpire B data
      const umpireBScoresMap: Record<string, number> = {};
      const umpireBValuesMap: Record<string, string> = {};

      publishedAssessment.umpireBData.topics.forEach(topic => {
        topic.questionResponses.forEach(response => {
          umpireBValuesMap[response.questionId] = response.selectedValue;
          umpireBScoresMap[response.questionId] = response.points;
        });
      });

      setUmpireBScores(umpireBScoresMap);
      setUmpireBValues(umpireBValuesMap);
      setUmpireBConclusion(publishedAssessment.umpireBData.conclusion);
    }
  }, [publishedAssessment, assessmentConfig]);

  const calculateGrade = (scores: Record<string, number>) => {
    if (!assessmentConfig) return { totalScore: 0, maxScore: 0, percentage: 0, level: 'AT_CURRENT_LEVEL' };

    const totalScore = Object.values(scores).reduce((sum: number, score: number) => sum + score, 0);
    const maxScore = assessmentConfig.topics.reduce((sum: number, topic: any) => 
      sum + topic.questions.reduce((topicSum: number, question: any) => 
        topicSum + Math.max(...question.answerPoints.map((ap: any) => ap.points)), 0), 0);
    
    const percentage = (totalScore / maxScore) * 100;
    
    let level: string;
    if (percentage < 60) {
      level = 'BELOW_EXPECTATION';
    } else if (percentage >= 60 && percentage < 70) {
      level = 'AT_CURRENT_LEVEL';
    } else {
      level = 'ABOVE_EXPECTATION';
    }

    return { totalScore, maxScore, percentage, level };
  };

  if (assessmentLoading) {
    return (
      <div className="space-y-6 w-full">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-24 bg-gray-200 rounded-lg w-full"></div>
          <div className="h-96 bg-gray-200 rounded-lg w-full"></div>
        </div>
      </div>
    );
  }

  const umpireAGrade = calculateGrade(umpireAScores);
  const umpireBGrade = calculateGrade(umpireBScores);

  return (
    <div className="space-y-6 w-full">
      {/* Read-only mode notification */}
      <Card className="border-green-200 bg-green-50 w-full">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-green-700">
            <Eye className="h-4 w-4" />
            <span className="text-sm">
              Ce rapport a été publié et est maintenant en mode lecture seule. 
              Aucune modification n'est possible.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Grade Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <GradeDisplay
          totalScore={umpireAGrade.totalScore}
          maxScore={umpireAGrade.maxScore}
          percentage={umpireAGrade.percentage}
          level={umpireAGrade.level}
          umpireName={`Arbitre A: ${match.umpireA}`}
        />
        <GradeDisplay
          totalScore={umpireBGrade.totalScore}
          maxScore={umpireBGrade.maxScore}
          percentage={umpireBGrade.percentage}
          level={umpireBGrade.level}
          umpireName={`Arbitre B: ${match.umpireB}`}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 justify-between items-center w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVerticalView(!isVerticalView)}
          className="flex items-center space-x-2"
        >
          {isVerticalView ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          <span>{isVerticalView ? 'Vue Verticale' : 'Côte à Côte'}</span>
        </Button>
      </div>

      {/* Assessment Grid - Read-only */}
      <div className={`w-full ${isVerticalView ? 'space-y-8' : 'grid gap-8 grid-cols-1 xl:grid-cols-2'}`}>
        <div className="w-full">
          <UmpireAssessment
            umpireName={`Arbitre A: ${match.umpireA}`}
            scores={umpireAScores}
            onScoreChange={() => {}} // No-op for read-only
            selectedValues={umpireAValues}
            onValueChange={() => {}} // No-op for read-only
            conclusion={umpireAConclusion}
            onConclusionChange={() => {}} // No-op for read-only
            readOnly={true}
          />
        </div>

        <div className="w-full">
          <UmpireAssessment
            umpireName={`Arbitre B: ${match.umpireB}`}
            scores={umpireBScores}
            onScoreChange={() => {}} // No-op for read-only
            selectedValues={umpireBValues}
            onValueChange={() => {}} // No-op for read-only
            conclusion={umpireBConclusion}
            onConclusionChange={() => {}} // No-op for read-only
            readOnly={true}
          />
        </div>
      </div>

      {/* Assessment Summary */}
      {publishedAssessment && (
        <Card className="w-full border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Informations de publication</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <div className="mb-2">
                <strong>Assessment ID:</strong> {publishedAssessment.assessmentId}
              </div>
              <div>
                <strong>Dernière mise à jour:</strong> {format(new Date(publishedAssessment.lastSavedAt), 'dd/MM/yyyy à HH:mm')}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}