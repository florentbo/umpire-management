import * as React from 'react';
import { useState } from 'react';
import { UmpireAutocomplete } from '../UmpireAutocomplete';
import { Assessment } from '@/domain/entities/Assessment';
import { useContainer } from '@/infrastructure/di/ContainerContext';
import { AssessmentQueryRepositoryImpl } from '@/application/repositories/AssessmentQueryRepository';

interface UmpireFilterProps {
  currentUserId: string;
  onUmpireFilterChange: (assessments: Assessment[] | null) => void;
  // Custom query function to use instead of the default
  customQueryFunction?: (managerId: string, umpireId: string) => Promise<Assessment[]> | ((umpireId: string) => Promise<Assessment[]>);
  // Custom fetch umpires function
  customFetchUmpires?: (searchTerm: string) => Promise<{ name: string; id: string }[]>;
}

export const UmpireFilter: React.FC<UmpireFilterProps> = ({
  currentUserId,
  onUmpireFilterChange,
  customQueryFunction,
  customFetchUmpires
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
    
    // Use custom function if provided, otherwise use default
    if (customFetchUmpires) {
      return customFetchUmpires(searchTerm);
    }
    
    return queryRepo.findAssessedUmpiresByManagerAndName(currentUserId, searchTerm);
  };

  const handleUmpireSelect = async (umpire: { name: string; id: string }) => {
    setSelectedUmpire(umpire);
    setLoading(true);
    
    try {
      let assessments: Assessment[];
      
      // Use custom query function if provided, otherwise use default
      if (customQueryFunction) {
        // Check if the custom function expects one or two parameters
        if (customQueryFunction.length === 2) {
          // Function expects (managerId, umpireId)
          assessments = await (customQueryFunction as (managerId: string, umpireId: string) => Promise<Assessment[]>)(currentUserId, umpire.id);
        } else {
          // Function expects only (umpireId)
          assessments = await (customQueryFunction as (umpireId: string) => Promise<Assessment[]>)(umpire.id);
        }
      } else {
        // Use default function
        assessments = await queryRepo.findAssessmentsByManagerAndUmpire(currentUserId, umpire.id);
      }
      
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