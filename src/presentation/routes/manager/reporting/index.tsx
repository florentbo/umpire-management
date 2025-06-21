import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@/presentation/components/layout/Header';
import { authService } from '@/lib/auth';
import { useState } from 'react';
import { useManagerMatchesViewModel } from '@/presentation/hooks/useManagerMatchesViewModel';
import { UmpireSearchSection } from '@/presentation/components/reporting/UmpireSearchSection';
import { ViewToggle } from '@/presentation/components/reporting/ViewToggle';
import { MyMatchesView } from '@/presentation/components/reporting/MyMatchesView';
import { AllReportsView } from '@/presentation/components/reporting/AllReportsView';
import { AssessmentQueryRepositoryImpl } from '@/application/repositories/AssessmentQueryRepository';
import { useContainer } from '@/infrastructure/di/ContainerContext';
import { ReportStatus } from '@/domain/entities/MatchReportStatus';
import { Assessment } from '@/domain/entities/Assessment';

export const Route = createFileRoute('/manager/reporting')({
  beforeLoad: () => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'umpire_manager') {
      throw new Error('Unauthorized');
    }
  },
  component: ReportingPage,
});

function ReportingPage() {
  const user = authService.getCurrentUser();
  const [activeView, setActiveView] = useState<'my-matches' | 'all-reports'>('my-matches');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');

  // Add state for selected umpire and filtered assessments
  const [selectedUmpire, setSelectedUmpire] = useState<{ name: string; id: string } | null>(null);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[] | null>(null);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  // Use DI container from context
  const container = useContainer();
  const assessmentRepo = container.getAssessmentRepository();
  const matchRepo = container.getMatchRepository();
  const queryRepo = new AssessmentQueryRepositoryImpl(assessmentRepo, matchRepo);

  const {
    loadingMyMatches,
    loadingAllReports,
    sortedAndFilteredMatches,
    groupedMatches,
    sortedReports,
    myMatchesData,
    allReportsData,
    getStatusCount,
  } = useManagerMatchesViewModel(user?.id || '', statusFilter);

  const fetchUmpires = async (searchTerm: string) => {
    if (!user) return [];
    return queryRepo.findAssessedUmpiresByManagerAndName(user.id, searchTerm);
  };

  const handleUmpireSelect = async (umpire: { name: string; id: string }) => {
    if (!user) return;
    setSelectedUmpire(umpire);
    setLoadingAssessments(true);
    // Fetch all published assessments for this manager
    const allAssessments = await assessmentRepo.findPublishedByAssessor(user.id);
    // Filter by umpire id (either as umpireA or umpireB)
    const filtered = allAssessments.filter((a: Assessment) =>
      a.umpireA?.umpireId?.value === umpire.id || a.umpireB?.umpireId?.value === umpire.id
    );
    setFilteredAssessments(filtered);
    setLoadingAssessments(false);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header title="Reporting" />
      <div className="w-full px-4 py-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full max-w-none space-y-8">
          <UmpireSearchSection
            fetchUmpires={fetchUmpires}
            onUmpireSelect={handleUmpireSelect}
            selectedUmpire={selectedUmpire}
            filteredAssessments={filteredAssessments}
            loadingAssessments={loadingAssessments}
          />

          <ViewToggle activeView={activeView} onViewChange={setActiveView} />

          {activeView === 'my-matches' ? (
            <MyMatchesView
              loadingMyMatches={loadingMyMatches}
              myMatchesData={myMatchesData}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sortedAndFilteredMatches={sortedAndFilteredMatches}
              groupedMatches={groupedMatches}
              getStatusCount={getStatusCount}
            />
          ) : (
            <AllReportsView
              loadingAllReports={loadingAllReports}
              allReportsData={allReportsData}
              sortedReports={sortedReports}
              currentAssessorId={user?.id || ''}
            />
          )}
        </div>
      </div>
    </div>
  );
}