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
        className="w-full bg-white dark:bg-[#0E0E12] border border-black/[0.1] dark:border-white/10 hover:border-[#B88728]/40 dark:hover:border-[#F1CB8D]/40 focus:border-[#B88728] dark:focus:border-[#F1CB8D] text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm rounded-xl pl-9 pr-8 py-2 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none transition-all focus:ring-2 focus:ring-[#B88728]/20 dark:focus:ring-[#F1CB8D]/20 shadow-xs"
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
