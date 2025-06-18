import { ReportSummaryAggregate } from '@/domain/entities/ReportSummary';
import { ReportTableRow } from './ReportTableRow';

interface ReportsTableProps {
  reports: ReportSummaryAggregate[];
  currentAssessorId: string;
}

export function ReportsTable({ reports, currentAssessorId }: ReportsTableProps) {
  // Sort reports by match date and time (earliest first)
  const sortedReports = [...reports].sort((a, b) => {
    const dateA = new Date(`${a.matchInfo.date} ${a.matchInfo.time}`);
    const dateB = new Date(`${b.matchInfo.date} ${b.matchInfo.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Match
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Date & Heure
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Arbitre A
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Arbitre B
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Évaluateur
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedReports.map((report) => (
            <ReportTableRow
              key={report.id}
              report={report}
              isOwnReport={report.isCreatedByAssessor(currentAssessorId)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}