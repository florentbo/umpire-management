import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import { ReportsTable } from './ReportsTable';

interface AllReportsViewProps {
  loadingAllReports: boolean;
  allReportsData: any;
  sortedReports: any[];
  currentAssessorId: string;
}

export const AllReportsView: React.FC<AllReportsViewProps> = ({
  loadingAllReports,
  allReportsData,
  sortedReports,
  currentAssessorId
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ClipboardList className="h-5 w-5" />
          <span>Tous les Rapports Publiés</span>
        </CardTitle>
        <CardDescription>
          Vue synthétique de tous les rapports d'évaluation publiés
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full p-0">
        {loadingAllReports ? (
          <div className="p-6">
            <div className="space-y-4 w-full">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse w-full" />
              ))}
            </div>
          </div>
        ) : !allReportsData?.reports || allReportsData.reports.length === 0 ? (
          <div className="text-center py-12 w-full">
            <ClipboardList className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Aucun rapport publié</p>
            <p className="text-sm text-gray-400 mt-2">Les rapports publiés apparaîtront ici</p>
          </div>
        ) : (
          <ReportsTable
            reports={sortedReports}
            currentAssessorId={currentAssessorId}
          />
        )}
      </CardContent>
    </Card>
  );
}; 