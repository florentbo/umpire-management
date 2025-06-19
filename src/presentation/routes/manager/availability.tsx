import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@/presentation/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/lib/auth';
import { Calendar, Users, Clock, Settings } from 'lucide-react';

export const Route = createFileRoute('/manager/availability')({
  beforeLoad: () => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'umpire_manager') {
      throw new Error('Unauthorized');
    }
  },
  component: AvailabilityPage,
});

function AvailabilityPage() {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header title="Availability Management" />
      <div className="w-full px-4 py-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full max-w-none space-y-8">
          
          {/* Page Header */}
          <div className="text-center py-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Gestion des Disponibilités
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Planifiez et gérez les disponibilités des arbitres pour les matches à venir
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <Card className="w-full">
              <CardContent className="p-6 text-center w-full">
                <Calendar className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                <div className="text-lg font-semibold text-gray-900 mb-2">Calendrier</div>
                <div className="text-sm text-gray-600">Vue calendrier des matches</div>
              </CardContent>
            </Card>
            
            <Card className="w-full">
              <CardContent className="p-6 text-center w-full">
                <Users className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <div className="text-lg font-semibold text-gray-900 mb-2">Arbitres</div>
                <div className="text-sm text-gray-600">Gestion des arbitres</div>
              </CardContent>
            </Card>
            
            <Card className="w-full">
              <CardContent className="p-6 text-center w-full">
                <Clock className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                <div className="text-lg font-semibold text-gray-900 mb-2">Horaires</div>
                <div className="text-sm text-gray-600">Planification des créneaux</div>
              </CardContent>
            </Card>
            
            <Card className="w-full">
              <CardContent className="p-6 text-center w-full">
                <Settings className="h-12 w-12 mx-auto text-orange-600 mb-4" />
                <div className="text-lg font-semibold text-gray-900 mb-2">Configuration</div>
                <div className="text-sm text-gray-600">Paramètres du système</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Module de Disponibilité</CardTitle>
              <CardDescription>
                Ce module sera développé pour gérer les disponibilités des arbitres
              </CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              <div className="text-center py-12 w-full">
                <Calendar className="h-24 w-24 mx-auto text-gray-300 mb-6" />
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  Module en développement
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Le module de gestion des disponibilités sera implémenté ici. 
                  Il permettra de planifier les assignations d'arbitres et de gérer leurs disponibilités.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}