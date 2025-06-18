import { ReportSummaryAggregate } from '@/domain/entities/ReportSummary';
import { ReportTableRow } from './ReportTableRow';

interface ReportsTableProps {
  reports: ReportSummaryAggregate[];
  currentAssessorId: string;
}

export function ReportsTable({ reports, currentAssessorId }: ReportsTableProps) {
  // Enhanced sorting for reports with better date/time handling
  const sortedReports = [...reports].sort((a, b) => {
    // Parse date and time more robustly
    const parseDateTime = (dateStr: string, timeStr: string) => {
      try {
        // Handle different date formats
        let normalizedDate = dateStr;
        
        // If date is in YYYY-MM-DD format, convert to a standard format
        if (dateStr.includes('-')) {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            normalizedDate = `${parts[1]}/${parts[2]}/${parts[0]}`; // Convert to MM/DD/YYYY
          }
        }
        
        // Clean up time string - remove milliseconds if present
        const cleanTime = timeStr.split('.')[0];
        
        // Create date object
        const dateTime = new Date(`${normalizedDate} ${cleanTime}`);
        
        // Validate the date
        if (isNaN(dateTime.getTime())) {
          console.warn(`Invalid date/time in reports table: ${dateStr} ${timeStr}`);
          return new Date(0); // Return epoch as fallback
        }
        
        return dateTime;
      } catch (error) {
        console.warn(`Error parsing date/time in reports table: ${dateStr} ${timeStr}`, error);
        return new Date(0); // Return epoch as fallback
      }
    };

    // Sort by match date and time (earliest first for better chronological order)
    const dateA = parseDateTime(a.matchInfo.date, a.matchInfo.time);
    const dateB = parseDateTime(b.matchInfo.date, b.matchInfo.time);
    
    // Primary sort: by match date/time (ascending - earliest first)
    const timeDiff = dateA.getTime() - dateB.getTime();
    if (timeDiff !== 0) {
      return timeDiff;
    }
    
    // Secondary sort: by submission date (latest first if match dates are the same)
    const submissionA = new Date(a.submittedAt);
    const submissionB = new Date(b.submittedAt);
    return submissionB.getTime() - submissionA.getTime();
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