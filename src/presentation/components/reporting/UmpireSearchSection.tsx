import * as React from 'react';
import { useState } from 'react';
import { UmpireAutocomplete } from '../UmpireAutocomplete';
import { Assessment } from '@/domain/entities/Assessment';
import { useContainer } from '@/infrastructure/di/ContainerContext';
import { AssessmentQueryRepositoryImpl } from '@/application/repositories/AssessmentQueryRepository';

interface UmpireSearchSectionProps {
  currentUserId: string;
}

export const UmpireSearchSection: React.FC<UmpireSearchSectionProps> = ({
  currentUserId
}) => {
  const [selectedUmpire, setSelectedUmpire] = useState<{ name: string; id: string } | null>(null);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[] | null>(null);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

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
    if (!currentUserId) return;
    setSelectedUmpire(umpire);
    setLoadingAssessments(true);
    try {
      // Fetch all published assessments for this manager
      const allAssessments = await assessmentRepo.findPublishedByAssessor(currentUserId);
      // Filter by umpire id (either as umpireA or umpireB)
      const filtered = allAssessments.filter((a: Assessment) =>
        a.umpireA?.umpireId?.value === umpire.id || a.umpireB?.umpireId?.value === umpire.id
      );
      setFilteredAssessments(filtered);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      setFilteredAssessments([]);
    } finally {
      setLoadingAssessments(false);
    }
  };

  return (
    <>
      {/* Umpire Autocomplete */}
      <div className="mb-6">
        <UmpireAutocomplete fetchUmpires={fetchUmpires} onSelect={handleUmpireSelect} />
      </div>

      {/* Show filtered assessments if an umpire is selected */}
      {selectedUmpire && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Évaluations pour {selectedUmpire.name}</h2>
          {loadingAssessments ? (
            <div>Chargement...</div>
          ) : filteredAssessments && filteredAssessments.length > 0 ? (
            <ul className="space-y-2">
              {filteredAssessments.map((a: Assessment) => (
                <li key={a.id.value} className="border rounded p-3 bg-white">
                  Match ID: {a.matchId.value} | Umpire A: {a.umpireA?.umpireId?.value} | Umpire B: {a.umpireB?.umpireId?.value}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">Aucun résultat</div>
          )}
        </div>
      )}
    </>
  );
}; 