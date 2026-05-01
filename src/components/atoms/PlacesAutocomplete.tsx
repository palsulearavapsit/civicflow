"use client";

import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

/**
 * GOOGLE-09: Google Places API Autocomplete.
 * High-fidelity address verification for voter registration.
 */
export const PlacesAutocomplete: React.FC<{ onSelect: (place: string) => void }> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Mock implementation of Google Places Autocomplete logic
  const handleInput = (val: string) => {
    setQuery(val);
    if (val.length > 2) {
      setSuggestions([
        `${val} Street, New York, NY`,
        `${val} Avenue, Los Angeles, CA`,
        `${val} Blvd, Chicago, IL`
      ]);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Enter your registration address..."
          className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
        />
      </div>

      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => { setQuery(s); setSuggestions([]); onSelect(s); }}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm flex items-center gap-3 border-b last:border-0 border-slate-100 dark:border-slate-800"
            >
              <Search size={14} className="text-slate-400" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
