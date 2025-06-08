import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiService } from '@/lib/api';
import { authService } from '@/lib/auth';
import { format } from 'date-fns';
import { Plus, FileText, Calendar, Clock } from 'lucide-react';

export const Route = createFileRoute('/manager/dashboard')({
  beforeLoad: () => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'umpire_manager') {
      throw new Error('Unauthorized');
    }
  },
  component: ManagerDashboard,
});

function ManagerDashboard() {
  const user = authService.getCurrentUser();
  
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: apiService.getMatches,
  });

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports', user?.id],
    queryFn: () => apiService.getReports(user?.id || '', user?.role || ''),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Manager Dashboard" />
      
      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matches?.slice(0, 2).map((match) => (
                <Link
                  key={match.id}
                  to="/manager/assessment/$matchId"
                  params={{ matchId: match.id }}
                >
                  <Button variant="outline" className="w-full h-auto p-4 justify-start">
                    <div className="text-left">
                      <div className="font-medium">{match.homeTeam} vs {match.awayTeam}</div>
                      <div className="text-sm text-gray-500">{match.division}</div>
                      <div className="text-xs text-gray-400 flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(match.date), 'MMM d')}
                        <Clock className="h-3 w-3 ml-2 mr-1" />
                        {match.time}
                      </div>
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Recent Reports</span>
            </CardTitle>
            <CardDescription>Your recent assessments and reports from other managers</CardDescription>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : reports?.length ? (
              <div className="space-y-3">
                {reports.slice(0, 5).map((report) => (
                  <div key={report.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">
                          {report.match.homeTeam} vs {report.match.awayTeam}
                        </div>
                        <div className="text-xs text-gray-500">
                          Assessed by {report.assessorName} • {format(new Date(report.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <div className="text-xs font-medium text-blue-600">
                        {report.assessment.umpireAScores.arrivalTime + 
                         report.assessment.umpireAScores.generalAppearance + 
                         report.assessment.umpireAScores.positioningPitch + 
                         report.assessment.umpireAScores.positioningD}/6
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No reports yet</p>
            )}
          </CardContent>
        </Card>

        {/* All Matches */}
        <Card>
          <CardHeader>
            <CardTitle>All Matches</CardTitle>
            <CardDescription>Select a match to start an assessment</CardDescription>
          </CardHeader>
          <CardContent>
            {matchesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {matches?.map((match) => (
                  <Link
                    key={match.id}
                    to="/manager/assessment/$matchId"
                    params={{ matchId: match.id }}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{match.homeTeam} vs {match.awayTeam}</div>
                            <div className="text-sm text-gray-600">{match.division}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              Umpires: {match.umpireA}, {match.umpireB}
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div>{format(new Date(match.date), 'MMM d, yyyy')}</div>
                            <div>{match.time}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}