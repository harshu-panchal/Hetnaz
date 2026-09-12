import { useState, useRef } from "react";
import { MaterialSymbol } from "../../../shared/components/MaterialSymbol";

interface SearchBarProps {
  placeholder?: string;
  title?: string;
  showLogo?: boolean;
  onSearch?: (query: string) => void;
  onFilterToggle?: () => void;
  variant?: "default" | "full";
  titleColor?: "gradient" | "black";
  rightElement?: React.ReactNode;
}

export const SearchBar = ({
  placeholder = "Search...",
  title,
  showLogo = true,
  onSearch,
  onFilterToggle,
  variant = "default",
  titleColor = "gradient",
  rightElement,
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(variant === "full");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  const toggleExpand = () => {
    if (variant === "full") return;

    if (isExpanded) {
      setQuery("");
      onSearch?.("");
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  };

  return (
    <div
      className={`relative px-4 flex items-center justify-between gap-2 w-full max-w-full overflow-hidden ${variant === "full" ? "px-0 py-1.5 min-h-[48px]" : "py-1.5 min-h-[52px]"}`}>
      {/* 1. Mobile-only Expanded Search Overlay */}
      {variant !== "full" && (
        <div
          className={`flex items-center p-1 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 transition-all duration-300 ease-out absolute inset-y-1.5 z-30 ${
            isExpanded
              ? "left-4 right-[56px] opacity-100 pr-10"
              : "left-[calc(100%-100px)] right-[56px] opacity-0 pointer-events-none overflow-hidden"
          }`}>
          <div className="pl-3 text-pink-600 shrink-0">
            <MaterialSymbol name="search" size={18} filled />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            className="flex-1 bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 px-2 text-sm font-semibold"
            placeholder={placeholder}
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                onSearch?.("");
                inputRef.current?.focus();
              }}
              className="px-2 text-gray-400 hover:text-pink-600 transition-colors shrink-0">
              <MaterialSymbol name="cancel" size={16} filled />
            </button>
          )}
        </div>
      )}

      {/* 2. Brand Section (Logo & Title) */}
      {variant !== "full" && (
        <div className="shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            {showLogo && (
              <img
                src="/logo.jpeg"
                alt="Logo"
                className={`h-9 w-9 object-cover rounded-xl shrink-0 shadow-xs transition-all duration-300 ${
                  isExpanded
                    ? "-translate-y-8 opacity-0"
                    : "translate-y-0 opacity-100"
                }`}
              />
            )}
            <span
              className={`font-black tracking-tight uppercase whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-sm transition-all duration-300 ${
                !showLogo ? "text-2xl pl-0.5" : "text-lg"
              } ${
                isExpanded
                  ? "-translate-y-8 opacity-0"
                  : "translate-y-0 opacity-100"
              } ${
                titleColor === "black"
                  ? "text-slate-900 dark:text-white"
                  : "bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 dark:from-pink-400 dark:to-rose-400 bg-clip-text text-transparent"
              }`}>
              {title || "Dil Mate"}
            </span>
          </div>
        </div>
      )}

      {/* 3. Action Section (Full-width search OR Toggle Button) */}
      <div
        className={`relative h-10 flex items-center gap-2 transition-all duration-300 ${
          variant === "full" ? "w-full ml-0" : "flex-1 justify-end"
        }`}>
        {/* Full-width variant for search-focused pages */}
        {variant === "full" && (
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full static opacity-100 visible">
            <div className="pl-3 text-pink-600 shrink-0">
              <MaterialSymbol name="search" size={18} filled />
            </div>
            <input
              type="text"
              value={query}
              onChange={handleChange}
              className="flex-1 bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 px-2 text-sm font-semibold"
              placeholder={placeholder}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  onSearch?.("");
                }}
                className="px-2 text-gray-400 hover:text-pink-600 transition-colors shrink-0">
                <MaterialSymbol name="cancel" size={16} filled />
              </button>
            )}
          </div>
        )}

        {/* Search Toggle Button */}
        {variant !== "full" && (
          <button
            onClick={toggleExpand}
            className="h-10 w-10 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center transition-all active:scale-90 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 z-40 shadow-xs"
            aria-label={isExpanded ? "Close search" : "Search"}>
            <MaterialSymbol
              name={isExpanded ? "close" : "search"}
              size={20}
              className={
                isExpanded
                  ? "text-pink-600"
                  : "text-slate-600 dark:text-slate-400"
              }
            />
          </button>
        )}

        {/* Filter Button */}
        {onFilterToggle && (
          <button
            onClick={onFilterToggle}
            className="h-10 w-10 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center transition-all active:scale-90 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 shrink-0 group z-40 shadow-xs"
            aria-label="Toggle filters">
            <MaterialSymbol
              name="tune"
              size={20}
              className="text-slate-600 dark:text-slate-400 group-hover:text-pink-600 transition-colors"
            />
          </button>
        )}

        {/* Custom Right Element (e.g. Refresh button) */}
        {rightElement}
      </div>
    </div>
  );
};
