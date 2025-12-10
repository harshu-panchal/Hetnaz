import { useState, useRef, useEffect } from 'react';
import { MaterialSymbol } from '../types/material-symbol';

interface TopAppBarProps {
  title: string;
  icon?: string;
  onSearchClick?: () => void;
  onFilterClick?: () => void;
  onSearch?: (query: string) => void;
}

export const TopAppBar = ({ 
  title, 
  icon = 'favorite', 
  onSearchClick, 
  onFilterClick,
  onSearch
}: TopAppBarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      onSearchClick?.();
    } else {
      setSearchQuery('');
      onSearch?.('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    onSearch?.('');
  };

  return (
    <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-black/5 dark:border-white/5 transition-colors duration-300">
      <div className="flex items-center justify-between px-4 py-3 relative">
        {!isSearchOpen ? (
          <>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 text-white shadow-lg shadow-primary/30">
                <MaterialSymbol name={icon} size={24} />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight dark:text-white text-slate-900">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                ref={searchButtonRef}
                onClick={handleSearchToggle}
                className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-[#342d18] text-slate-600 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
                aria-label="Search"
              >
                <MaterialSymbol name="search" size={24} />
              </button>
              <button
                onClick={onFilterClick}
                className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-[#342d18] text-slate-600 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
                aria-label="Filter"
              >
                <MaterialSymbol name="tune" size={24} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center w-full gap-2 search-slide-in">
            <button
              onClick={handleCloseSearch}
              className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-[#342d18] text-slate-600 dark:text-white hover:bg-gray-100 dark:hover:bg-[#4b202e] transition-colors active:scale-95 shrink-0"
              aria-label="Close search"
            >
              <MaterialSymbol name="arrow_back" size={24} />
            </button>
            <div className="flex items-center flex-1 h-10 bg-white dark:bg-[#2f151e] rounded-xl shadow-sm border border-gray-100 dark:border-transparent focus-within:ring-2 focus-within:ring-primary/50 transition-all overflow-hidden">
              <div className="pl-4 text-gray-400 dark:text-[#cc8ea3] shrink-0">
                <MaterialSymbol name="search" size={20} />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-full bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#cc8ea3]/70 focus:ring-0 px-3 text-base"
                placeholder="Search by name, occupation, or bio..."
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    onSearch?.('');
                  }}
                  className="pr-3 text-gray-400 dark:text-[#cc8ea3] hover:text-gray-600 dark:hover:text-white transition-colors shrink-0"
                  aria-label="Clear search"
                >
                  <MaterialSymbol name="close" size={20} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

