import * as React from 'react';
import { useState } from 'react';
import { UmpireAutocomplete } from '../UmpireAutocomplete';
import { Assessment } from '@/domain/entities/Assessment';
import { useContainer } from '@/infrastructure/di/ContainerContext';
import { AssessmentQueryRepositoryImpl } from '@/application/repositories/AssessmentQueryRepository';

interface UmpireFilterProps {
  currentUserId: string;
  onUmpireFilterChange: (assessments: Assessment[] | null) => void;
}

export const UmpireFilter: React.FC<UmpireFilterProps> = ({
  currentUserId,
  onUmpireFilterChange
}) => {
  const [selectedUmpire, setSelectedUmpire] = useState<{ name: string; id: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Use DI container from context
  const container = useContainer();
  const assessmentRepo = container.getAssessmentRepository();
  const matchRepo = container.getMatchRepository();
  const queryRepo = new AssessmentQueryRepositoryImpl(assessmentRepo, matchRepo);

  const fetchUmpires = async (searchTerm: string) => {
    if (!currentUserId) return [];
    return queryRepo.findAssessedUmpiresByManagerAndName(currentUserId, searchTerm);
  };

  const handleUmpireSelect = async (umpire: { name: string; id: string }) => {
    setSelectedUmpire(umpire);
    setLoading(true);
    
    try {
      // Get assessments for this umpire
      const assessments = await queryRepo.findAssessmentsByManagerAndUmpire(currentUserId, umpire.id);
      onUmpireFilterChange(assessments);
    } catch (error) {
      console.error('Error fetching assessments for umpire:', error);
      onUmpireFilterChange([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilter = () => {
    setSelectedUmpire(null);
    onUmpireFilterChange(null);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <UmpireAutocomplete 
            fetchUmpires={fetchUmpires} 
            onSelect={handleUmpireSelect}
            placeholder="Filtrer par arbitre..."
          />
        </div>
        {selectedUmpire && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Filtre: {selectedUmpire.name}
              {loading && <span className="ml-2">(chargement...)</span>}
            </span>
            <button
              onClick={handleClearFilter}
              className="text-sm text-red-600 hover:text-red-800"
              disabled={loading}
            >
              Effacer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 