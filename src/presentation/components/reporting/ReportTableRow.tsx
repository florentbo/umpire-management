import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { ReportSummaryAggregate } from '@/domain/entities/ReportSummary';
import { UmpireScoreDisplay } from './UmpireScoreDisplay';

interface ReportTableRowProps {
  report: ReportSummaryAggregate;
  isOwnReport: boolean;
}

export function ReportTableRow({ report, isOwnReport }: ReportTableRowProps) {
  return (
    <tr 
      className={`border-b border-gray-100 hover:bg-gray-50 ${
        isOwnReport ? 'bg-blue-50' : ''
      }`}
      title={`Match ID: ${report.matchId}`}
    >
      {/* Match Info */}
      <td className="px-4 py-3">
        <div className="font-semibold text-gray-900">
          {report.matchInfo.homeTeam} vs {report.matchInfo.awayTeam}
        </div>
        <div className="text-sm text-gray-600">
          {report.matchInfo.division}
        </div>
      </td>

      {/* Date & Time */}
      <td className="px-4 py-3 text-sm text-gray-600">
        <div>{report.formattedDate}</div>
        <div className="text-xs text-gray-500">{report.matchInfo.time}</div>
      </td>

      {/* Umpire A */}
      <td className="px-4 py-3">
        <UmpireScoreDisplay
          name={report.matchInfo.umpireAName}
          totalScore={report.umpireAData.totalScore}
          maxScore={report.umpireAData.maxScore}
          level={report.umpireAData.level}
        />
      </td>

      {/* Umpire B */}
      <td className="px-4 py-3">
        <UmpireScoreDisplay
          name={report.matchInfo.umpireBName}
          totalScore={report.umpireBData.totalScore}
          maxScore={report.umpireBData.maxScore}
          level={report.umpireBData.level}
        />
      </td>

      {/* Assessor - Fixed to show name instead of ID */}
      <td className="px-4 py-3">
        <div className="font-medium text-sm text-blue-600">
          {report.assessorName}
        </div>
        <div className="text-xs text-gray-500">
          {report.formattedSubmissionDate}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <Link
          to="/manager/assessment/$matchId"
          params={{ matchId: report.matchId }}
        >
          <Button size="sm" variant="outline" className="text-xs">
            <Eye className="h-3 w-3 mr-1" />
            Voir
          </Button>
        </Link>
      </td>
    </tr>
  );
}