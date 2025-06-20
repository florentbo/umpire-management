import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReportStatus } from '@/domain/entities/MatchReportStatus';
import React from 'react';

export interface ReportStatusFilterProps {
  statusFilter: ReportStatus | 'ALL';
  setStatusFilter: (status: ReportStatus | 'ALL') => void;
  getStatusCount: (status: ReportStatus | 'ALL') => number;
}

function getStatusFilterLabel(status: ReportStatus | 'ALL') {
  switch (status) {    
    case ReportStatus.NONE:
      return 'A rédiger';
    case ReportStatus.DRAFT:
      return 'Brouillons';
    case ReportStatus.PUBLISHED:
      return 'Publiés';
    default:
      return 'Inconnu';
  }
}

export const ReportStatusFilter: React.FC<ReportStatusFilterProps> = ({ statusFilter, setStatusFilter, getStatusCount }) => (
  <div className="flex flex-wrap gap-2">
    {([ReportStatus.NONE, ReportStatus.DRAFT, ReportStatus.PUBLISHED] as const).map((status) => (
      <Button
        key={status}
        variant={statusFilter === status ? 'default' : 'outline'}
        size="sm"
        onClick={() => setStatusFilter(status)}
        className="flex items-center space-x-2"
      >
        <span>{getStatusFilterLabel(status)}</span>
        <Badge
          variant="secondary"
          className={`ml-1 ${statusFilter === status ? 'bg-white text-blue-600' : 'bg-gray-100'}`}
        >
          {getStatusCount(status)}
        </Badge>
      </Button>
    ))}
  </div>
); 