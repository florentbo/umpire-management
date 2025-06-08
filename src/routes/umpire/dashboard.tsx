import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/lib/api';
import { authService } from '@/lib/auth';
import { format } from 'date-fns';
import { FileText, TrendingUp, Calendar } from 'lucide-react';

export const Route = createFileRoute('/umpire/dashboard')({
  beforeLoad: () => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'umpire') {
      throw new Error('Unauthorized');
    }
  },
  component: UmpireDashboard,
});

function UmpireDashboard() {
  const user = authService.getCurrentUser();
  
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', user?.id],
    queryFn: () => apiService.getReports(user?.id || '', user?.role || ''),
  });

  const averageScore = reports?.length 
    ? reports.reduce((acc, report) => {
        const total = report.assessment.umpireAScores.arrivalTime + 
                     report.assessment.umpireAScores.generalAppearance + 
                     report.assessment.umpireAScores.positioningPitch + 
                     report.assessment.umpireAScores.positioningD;
        return acc + total;
      }, 0) / reports.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="My Reports" />
      
      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold">{reports?.length || 0}</div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold">{reports?.length ? format(new Date(reports[0].createdAt), 'MMM d') : 'N/A'}</div>
              <div className="text-sm text-gray-600">Last Assessment</div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Reports</CardTitle>
            <CardDescription>Your performance assessments from umpire managers</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : reports?.length ? (
              <div className="space-y-4">
                {reports.map((report) => {
                  const scores = report.assessment.umpireAScores;
                  const totalScore = scores.arrivalTime + scores.generalAppearance + scores.positioningPitch + scores.positioningD;
                  const section1Score = scores.arrivalTime + scores.generalAppearance;
                  const section2Score = scores.positioningPitch + scores.positioningD;
                  
                  return (
                    <Card key={report.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium">{report.match.homeTeam} vs {report.match.awayTeam}</div>
                            <div className="text-sm text-gray-600">{report.match.division}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Assessed by {report.assessorName} • {format(new Date(report.createdAt), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">{totalScore}/6</div>
                            <div className="text-xs text-gray-500">Total Score</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-700">Section 1: Before & After</div>
                            <div className="text-xs text-gray-600">
                              Arrival: {scores.arrivalTime > 0 ? 'OK' : 'Not OK'} ({scores.arrivalTime > 0 ? '+' : ''}{scores.arrivalTime})
                            </div>
                            <div className="text-xs text-gray-600">
                              Appearance: {scores.generalAppearance > 0 ? 'OK' : 'Not OK'} (+{scores.generalAppearance})
                            </div>
                            <div className="font-medium text-sm">Score: {section1Score}/2</div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="font-medium text-gray-700">Section 2: Positioning</div>
                            <div className="text-xs text-gray-600">
                              Pitch: {scores.positioningPitch === 2 ? 'OK' : scores.positioningPitch === 1 ? 'Partial' : 'Not OK'} (+{scores.positioningPitch})
                            </div>
                            <div className="text-xs text-gray-600">
                              D Area: {scores.positioningD === 2 ? 'OK' : scores.positioningD === 1 ? 'Partial' : 'Not OK'} (+{scores.positioningD})
                            </div>
                            <div className="font-medium text-sm">Score: {section2Score}/4</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No assessment reports yet</p>
                <p className="text-sm text-gray-400 mt-1">Reports will appear here after managers assess your performance</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}