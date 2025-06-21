import * as React from 'react';
import { useEffect, useState, useRef } from 'react';

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
  const [selectedUmpire, setSelectedUmpire] = useState<Umpire | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    if (input.length >= 4 && !selectedUmpire) {
      setLoading(true);
      fetchUmpires(input).then((results: Umpire[]) => {
        if (active) {
          setSuggestions(results);
          setShowDropdown(true);
          setLoading(false);
        }
      });
    } else if (input.length < 4) {
      setSuggestions([]);
      setShowDropdown(false);
      setLoading(false);
      setSelectedUmpire(null);
    }
    setHighlightedIndex(-1);
    return () => { active = false; };
  }, [input, fetchUmpires, selectedUmpire]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (umpire: Umpire) => {
    setSelectedUmpire(umpire);
    setInput(umpire.name);
    setShowDropdown(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
    onSelect(umpire);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Clear selection if user starts typing again
    if (selectedUmpire && value !== selectedUmpire.name) {
      setSelectedUmpire(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  const handleFocus = () => {
    if (input.length >= 4 && suggestions.length > 0 && !selectedUmpire) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative w-full max-w-xs" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
        placeholder={placeholder || 'Rechercher un arbitre...'}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
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
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${idx === highlightedIndex ? 'bg-blue-100' : ''}`}
              onMouseDown={() => handleSelect(umpire)}
              onMouseEnter={() => setHighlightedIndex(idx)}
            >
              {umpire.name}
            </li>
          ))}
        </ul>
      )}
      {showDropdown && !loading && suggestions.length === 0 && input.length >= 4 && (
        <div className="absolute z-10 w-full bg-white border rounded shadow mt-1 px-3 py-2 text-gray-500 text-sm">
          Aucun résultat
        </div>
      )}
    </div>
  );
}; 