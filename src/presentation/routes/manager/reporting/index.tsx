import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@/presentation/components/layout/Header';
import { authService } from '@/lib/auth';
import { useState } from 'react';
import { useManagerMatchesViewModel } from '@/presentation/hooks/useManagerMatchesViewModel';
import { UmpireSearchSection } from '@/presentation/components/reporting/UmpireSearchSection';
import { ViewToggle } from '@/presentation/components/reporting/ViewToggle';
import { MyMatchesView } from '@/presentation/components/reporting/MyMatchesView';
import { AllReportsView } from '@/presentation/components/reporting/AllReportsView';
import { ReportStatus } from '@/domain/entities/MatchReportStatus';

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

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header title="Reporting" />
      <div className="w-full px-4 py-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full max-w-none space-y-8">
          <UmpireSearchSection currentUserId={user?.id || ''} />

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