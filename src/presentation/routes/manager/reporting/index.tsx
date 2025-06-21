import { createFileRoute } from '@tanstack/react-router';
import { ManagerLayout } from '@/presentation/components/layout/ManagerLayout';
import { authService } from '@/lib/auth';
import { useState } from 'react';
import { useManagerMatchesViewModel } from '@/presentation/hooks/useManagerMatchesViewModel';
import { ViewToggle } from '@/presentation/components/reporting/ViewToggle';
import { MyMatchesView } from '@/presentation/components/reporting/MyMatchesView';
import { AllReportsView } from '@/presentation/components/reporting/AllReportsView';
import { ReportStatus } from '@/domain/entities/MatchReportStatus';

export const Route = createFileRoute('/manager/reporting/')({
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
    <ManagerLayout>
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
          currentUserId={user?.id || ''}
        />
      ) : (
        <AllReportsView
          loadingAllReports={loadingAllReports}
          allReportsData={allReportsData}
          sortedReports={sortedReports}
          currentAssessorId={user?.id || ''}
          currentUserId={user?.id || ''}
        />
      )}
    </ManagerLayout>
  );
}