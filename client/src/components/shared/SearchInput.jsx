import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({
  placeholder = 'Search by tag, serial, model...',
  value: initialValue = '',
  onChange,
  delay = 300,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== initialValue) {
        onChange(searchTerm);
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [searchTerm, delay, onChange, initialValue]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        size={15}
        className="absolute left-3 text-slate-400 pointer-events-none"
      />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white dark:bg-[#070A12]/90 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 focus:border-indigo-600 dark:focus:border-indigo-500 text-slate-900 dark:text-slate-100 text-xs sm:text-sm rounded-lg pl-9 pr-8 py-2 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all focus:ring-1 focus:ring-indigo-500/20"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={() => {
            setSearchTerm('');
            onChange('');
          }}
          className="absolute right-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 rounded cursor-pointer transition-colors"
          title="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
