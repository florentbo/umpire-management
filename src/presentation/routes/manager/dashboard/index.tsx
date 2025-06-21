import { createFileRoute } from '@tanstack/react-router';
import { ManagerLayout } from '@/presentation/components/layout/ManagerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/lib/auth';
import { ClipboardList, Calendar, TrendingUp } from 'lucide-react';

export const Route = createFileRoute('/manager/dashboard/')({
  beforeLoad: () => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'umpire_manager') {
      throw new Error('Unauthorized');
    }
  },
  component: ManagerDashboard,
});

function ManagerDashboard() {
  return (
    <ManagerLayout>
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Bienvenue sur votre tableau de bord
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Gérez vos évaluations d'arbitres et suivez les performances de votre équipe
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <Card className="w-full">
          <CardContent className="p-6 text-center w-full">
            <ClipboardList className="h-12 w-12 mx-auto text-blue-600 mb-4" />
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-600 mt-1">Rapports ce mois</div>
          </CardContent>
        </Card>
        
        <Card className="w-full">
          <CardContent className="p-6 text-center w-full">
            <Calendar className="h-12 w-12 mx-auto text-green-600 mb-4" />
            <div className="text-2xl font-bold text-gray-900">8</div>
            <div className="text-sm text-gray-600 mt-1">Matches à venir</div>
          </CardContent>
        </Card>
        
        <Card className="w-full">
          <CardContent className="p-6 text-center w-full">
            <TrendingUp className="h-12 w-12 mx-auto text-purple-600 mb-4" />
            <div className="text-2xl font-bold text-gray-900">85%</div>
            <div className="text-sm text-gray-600 mt-1">Score moyen</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Accédez rapidement aux fonctionnalités principales
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <ClipboardList className="h-8 w-8 mx-auto text-blue-600 mb-3" />
                <h3 className="font-semibold mb-2">Créer un rapport</h3>
                <p className="text-sm text-gray-600">
                  Commencez une nouvelle évaluation d'arbitre
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-dashed border-gray-200 hover:border-green-300 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto text-green-600 mb-3" />
                <h3 className="font-semibold mb-2">Gérer les disponibilités</h3>
                <p className="text-sm text-gray-600">
                  Planifiez et organisez les assignations
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </ManagerLayout>
  );
}