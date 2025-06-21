import React from 'react';
import { UmpireAutocomplete } from '../UmpireAutocomplete';
import { Assessment } from '@/domain/entities/Assessment';

interface UmpireSearchSectionProps {
  fetchUmpires: (searchTerm: string) => Promise<{ name: string; id: string }[]>;
  onUmpireSelect: (umpire: { name: string; id: string }) => void;
  selectedUmpire: { name: string; id: string } | null;
  filteredAssessments: Assessment[] | null;
  loadingAssessments: boolean;
}

export const UmpireSearchSection: React.FC<UmpireSearchSectionProps> = ({
  fetchUmpires,
  onUmpireSelect,
  selectedUmpire,
  filteredAssessments,
  loadingAssessments
}) => {
  return (
    <>
      {/* Umpire Autocomplete */}
      <div className="mb-6">
        <UmpireAutocomplete fetchUmpires={fetchUmpires} onSelect={onUmpireSelect} />
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