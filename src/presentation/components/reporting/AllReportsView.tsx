import * as React from 'react';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import { ReportsTable } from './ReportsTable';
import { UmpireFilter } from './UmpireFilter';
import { ReportSummaryAggregate } from '@/domain/entities/ReportSummary';
import { Assessment } from '@/domain/entities/Assessment';
import { useContainer } from '@/infrastructure/di/ContainerContext';
import { AssessmentQueryRepositoryImpl } from '@/application/repositories/AssessmentQueryRepository';

interface AllReportsViewProps {
  loadingAllReports: boolean;
  allReportsData: { reports: ReportSummaryAggregate[] } | undefined;
  sortedReports: ReportSummaryAggregate[];
  currentAssessorId: string;
  currentUserId: string;
}

export const AllReportsView: React.FC<AllReportsViewProps> = ({
  loadingAllReports,
  allReportsData,
  sortedReports,
  currentAssessorId,
  currentUserId
}) => {
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[] | null>(null);

  // Use DI container from context
  const container = useContainer();
  const assessmentRepo = container.getAssessmentRepository();
  const matchRepo = container.getMatchRepository();
  const queryRepo = new AssessmentQueryRepositoryImpl(assessmentRepo, matchRepo);

  // Custom function to get all published assessments by umpire (not just current manager's)
  const getAllPublishedAssessmentsByUmpire = async (umpireId: string) => {
    // This should get ALL published assessments for this umpire, regardless of who assessed them
    return queryRepo.findAssessmentsByUmpire(umpireId);
  };

  // Custom function to get all umpires who have published reports
  const getAllUmpiresWithPublishedReports = async (searchTerm: string) => {
    // This should get ALL umpires who have published reports, not just those assessed by current manager
    return queryRepo.findAssessedUmpiresByName(searchTerm);
  };

  // Filter reports by selected assessments
  const filteredReports = useMemo(() => {
    if (!filteredAssessments) {
      return sortedReports;
    }

    // Get match IDs from filtered assessments
    const assessmentMatchIds = new Set(filteredAssessments.map(a => a.matchId.value));
    
    return sortedReports.filter(report => 
      assessmentMatchIds.has(report.matchId)
    );
  }, [filteredAssessments, sortedReports]);

  const handleUmpireFilterChange = (assessments: Assessment[] | null) => {
    setFilteredAssessments(assessments);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ClipboardList className="h-5 w-5" />
          <span>Tous les rapports</span>
        </CardTitle>
        <CardDescription>
          Consultez tous les rapports d'évaluation publiés
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UmpireFilter 
          currentUserId={currentUserId}
          onUmpireFilterChange={handleUmpireFilterChange}
          customQueryFunction={getAllPublishedAssessmentsByUmpire}
          customFetchUmpires={getAllUmpiresWithPublishedReports}
        />

        {loadingAllReports ? (
          <div className="space-y-4 w-full">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse w-full" />
            ))}
          </div>
        ) : !allReportsData?.reports || allReportsData.reports.length === 0 ? (
          <div className="text-center py-12 w-full">
            <ClipboardList className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Aucun rapport trouvé</p>
            <p className="text-sm text-gray-400 mt-2">Les rapports publiés apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Tous les Rapports</h2>
              <div className="text-sm text-gray-500">
                {filteredReports.length} rapport{filteredReports.length !== 1 ? 's' : ''}
                {filteredAssessments && ` (filtré)`}
              </div>
            </div>

            {filteredReports.length === 0 ? (
              <div className="text-center py-12 w-full">
                <ClipboardList className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Aucun rapport trouvé</p>
                <p className="text-sm text-gray-400 mt-2">
                  {filteredAssessments ? 'Aucun rapport trouvé pour cet arbitre' : 'Les rapports publiés apparaîtront ici'}
                </p>
              </div>
            ) : (
              <ReportsTable 
                reports={filteredReports} 
                currentAssessorId={currentAssessorId}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 