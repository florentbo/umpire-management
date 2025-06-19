import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { Calendar, User, Eye, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ReportStatus } from '@/domain/entities/MatchReportStatus';
import React from 'react';

export interface ManagerMatchCardProps {
  matchWithStatus: any;
}

function getStatusBadge(status: ReportStatus) {
  switch (status) {
    case ReportStatus.NONE:
      return <Badge variant="outline" className="text-gray-600">Aucun rapport</Badge>;
    case ReportStatus.DRAFT:
      return <Badge variant="outline" className="text-orange-600 border-orange-200">Brouillon</Badge>;
    case ReportStatus.PUBLISHED:
      return <Badge variant="outline" className="text-green-600 border-green-200">Publié</Badge>;
    default:
      return <Badge variant="outline">Inconnu</Badge>;
  }
}

function getActionButton(matchWithStatus: any) {
  if (!matchWithStatus.canEdit) return null;
  const isPublished = matchWithStatus.reportStatus === ReportStatus.PUBLISHED;
  return (
    <Link
      to="/manager/assessment/$matchId"
      params={{ matchId: matchWithStatus.match.id.value }}
    >
      <Button size="sm" variant={isPublished ? "secondary" : "outline"}>
        {isPublished ? (
          <>
            <Eye className="h-4 w-4 mr-2" />
            Voir
          </>
        ) : (
          <>
            <Edit className="h-4 w-4 mr-2" />
            {matchWithStatus.reportStatus === ReportStatus.NONE ? 'Créer' : 'Modifier'}
          </>
        )}
      </Button>
    </Link>
  );
}

function formatMatchDate(dateStr: string, timeStr: string) {
  try {
    const cleanTime = timeStr.split('.')[0];
    let displayDate = dateStr;
    if (dateStr.includes('-')) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        displayDate = format(date, 'MMM d, yyyy');
      }
    }
    return `${displayDate} à ${cleanTime}`;
  } catch (error) {
    return `${dateStr} à ${timeStr}`;
  }
}

export const ManagerMatchCard: React.FC<ManagerMatchCardProps> = ({ matchWithStatus }) => (
  <Card key={matchWithStatus.match.id.value} className="border-l-4 border-l-blue-500 w-full">
    <CardContent className="p-4 w-full">
      <div className="flex justify-between items-start w-full">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-lg">
            {matchWithStatus.match.homeTeam} vs {matchWithStatus.match.awayTeam}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {matchWithStatus.match.division}
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatMatchDate(matchWithStatus.match.date, matchWithStatus.match.time)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>{matchWithStatus.match.umpireAName} & {matchWithStatus.match.umpireBName}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2 ml-4">
          {getStatusBadge(matchWithStatus.reportStatus)}
          {getActionButton(matchWithStatus)}
        </div>
      </div>
    </CardContent>
  </Card>
); 