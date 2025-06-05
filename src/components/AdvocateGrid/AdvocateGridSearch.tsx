import React from "react";
import { X } from "lucide-react";

import { useState, useMemo, useCallback } from "react";
import { debounce } from "@/utils/debounce"; // Assuming debounce utility is here

interface AdvocateGridSearchProps {
  initialSearchTerm?: string; // Optional: if parent needs to set initial debounced term
  onDebouncedSearch: (searchTerm: string) => void;
  onResetAppSearch: () => void; // Renamed to avoid confusion with internal reset
  className?: string;
  placeholder?: string;
}

const AdvocateGridSearch: React.FC<AdvocateGridSearchProps> = ({
  initialSearchTerm = "",
  onDebouncedSearch,
  onResetAppSearch,
  className = "",
  placeholder = "Search...",
}) => {
  const [inputValue, setInputValue] = useState<string>(initialSearchTerm);

  const debouncedSearchHandler = useMemo(
    () =>
      debounce((searchValue: string) => {
        onDebouncedSearch(searchValue.trim());
      }, 500), // 500ms debounce delay
    [onDebouncedSearch]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    debouncedSearchHandler(value);
  };

  const handleResetClick = useCallback(() => {
    setInputValue("");
    onDebouncedSearch(""); // Immediately notify parent of cleared search
    if (onResetAppSearch) onResetAppSearch(); // Call additional reset logic if provided
  }, [onDebouncedSearch, onResetAppSearch]);

  return (
    <div className={className}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      {inputValue && (
        <button onClick={handleResetClick} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-blue-300 rounded-full">
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default AdvocateGridSearch;
