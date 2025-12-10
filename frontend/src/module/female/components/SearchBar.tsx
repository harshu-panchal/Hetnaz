import { useState } from 'react';
import { MaterialSymbol } from '../types/material-symbol';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export const SearchBar = ({ placeholder = 'Search chats...', onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="px-6 pb-2 shrink-0">
      <label className="flex items-center w-full h-12 bg-white dark:bg-[#2f151e] rounded-xl shadow-sm border border-gray-100 dark:border-transparent focus-within:ring-2 focus-within:ring-primary/50 transition-all overflow-hidden">
        <div className="pl-4 text-gray-400 dark:text-[#cc8ea3]">
          <MaterialSymbol name="search" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          className="w-full h-full bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#cc8ea3]/70 focus:ring-0 px-3 text-base"
          placeholder={placeholder}
        />
      </label>
    </div>
  );
};


