import React, { useEffect, useState, useRef } from 'react';

interface Umpire {
  name: string;
  id: string;
}

interface UmpireAutocompleteProps {
  fetchUmpires: (searchTerm: string) => Promise<Umpire[]>;
  onSelect: (umpire: Umpire) => void;
  placeholder?: string;
}

export const UmpireAutocomplete: React.FC<UmpireAutocompleteProps> = ({ fetchUmpires, onSelect, placeholder }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Umpire[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    if (input.length >= 4) {
      setLoading(true);
      fetchUmpires(input).then(results => {
        if (active) {
          setSuggestions(results);
          setShowDropdown(true);
          setLoading(false);
        }
      });
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      setLoading(false);
    }
    setHighlightedIndex(-1);
    return () => { active = false; };
  }, [input, fetchUmpires]);

  const handleSelect = (umpire: Umpire) => {
    setInput(umpire.name);
    setShowDropdown(false);
    onSelect(umpire);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full max-w-xs">
      <input
        ref={inputRef}
        type="text"
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
        placeholder={placeholder || 'Rechercher un arbitre...'}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => input.length >= 4 && setShowDropdown(true)}
        autoComplete="off"
      />
      {loading && (
        <div className="absolute right-2 top-2 text-xs text-gray-400">Chargement...</div>
      )}
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-60 overflow-auto">
          {suggestions.map((umpire, idx) => (
            <li
              key={umpire.id}
              className={`px-3 py-2 cursor-pointer ${idx === highlightedIndex ? 'bg-blue-100' : ''}`}
              onMouseDown={() => handleSelect(umpire)}
              onMouseEnter={() => setHighlightedIndex(idx)}
            >
              {umpire.name}
            </li>
          ))}
        </ul>
      )}
      {showDropdown && !loading && suggestions.length === 0 && input.length >= 4 && (
        <div className="absolute z-10 w-full bg-white border rounded shadow mt-1 px-3 py-2 text-gray-500 text-sm">Aucun résultat</div>
      )}
    </div>
  );
}; 