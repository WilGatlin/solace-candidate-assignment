"use client";

import { useState, useEffect, useMemo, useTransition, useCallback, useRef } from "react";
import { X } from "lucide-react";

import { debounce } from "@/utils/debounce";
import { Advocate } from "@/types/advocate";

import AdvocateCard from "./AdvocateCard";

type AdvocateGridProps = {
  initialAdvocates: Advocate[];
};

const PAGE_SIZE = 6;

const AdvocateGrid: React.FC<AdvocateGridProps> = ({ initialAdvocates }) => {
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>(initialAdvocates);
  const [visibleAdvocates, setVisibleAdvocates] = useState<Advocate[]>(initialAdvocates.slice(0, PAGE_SIZE));
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Debounced search to improve performance and reduce re-renders
  const debouncedFilter = useMemo(
    () =>
      debounce((searchValue: string) => {
        const lowerSearch = searchValue.trim().toLowerCase();
        setIsSearching(!!lowerSearch); // Disable lazy loading during search

        const filtered = initialAdvocates.filter((advocate) => {
          const fields = [
            advocate.firstName,
            advocate.lastName,
            advocate.city,
            advocate.degree,
            ...(advocate.specialties || []),
            advocate.yearsOfExperience.toString(),
          ].map((field) => field.toLowerCase());

          return fields.some((field) => field.includes(lowerSearch));
        });

        setFilteredAdvocates(filtered);
        setVisibleAdvocates(lowerSearch ? filtered : filtered.slice(0, PAGE_SIZE));
      }, 300),
    [initialAdvocates]
  );

  // Loads more advocates when scrolling, unless a search is active
  const loadMore = useCallback(() => {
    if (isSearching) return;
    setVisibleAdvocates((prev) => [
      ...prev,
      ...filteredAdvocates.slice(prev.length, prev.length + PAGE_SIZE),
    ]);
  }, [filteredAdvocates, isSearching]);

  // Uses IntersectionObserver to detect when user reaches the bottom of the list
  useEffect(() => {
    if (!loadMoreRef.current || isSearching) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "100px" } // Trigger loading slightly before reaching the bottom
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => observerRef.current?.disconnect();
  }, [loadMore, isSearching]);

  // Resets search input and restores initial advocate list
  const handleResetClick = useCallback(() => {
    setSearchTerm("");
    setIsSearching(false);
    setFilteredAdvocates(initialAdvocates);
    setVisibleAdvocates(initialAdvocates.slice(0, PAGE_SIZE));
  }, [initialAdvocates]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Clears search when Escape key is pressed
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        handleResetClick();
      }
    },
    [handleResetClick]
  );

  useEffect(() => {
    startTransition(() => {
      debouncedFilter(searchTerm);
    });
  }, [searchTerm, debouncedFilter]);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Find Your Advocate</h1>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          placeholder="Search advocates..."
          className={styles.searchInput}
        />

        {/* Reset Button */}
        {searchTerm && (
          <button onClick={handleResetClick} aria-label="Clear search input" className={styles.resetButton}>
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Advocate Grid */}
      <div className={styles.grid}>
        {visibleAdvocates.length > 0 ? (
          visibleAdvocates.map((advocate) => (
            <AdvocateCard key={advocate.id} advocate={advocate} searchTerm={searchTerm} />
          ))
        ) : (
          <p className={styles.noResults}>No advocates found.</p>
        )}
      </div>

      {/* Load More Trigger (only visible when not searching) */}
      {!isSearching && <div ref={loadMoreRef} className="h-1" />}
    </main>
  );
};

// ✅ Styles stored before export
const styles = {
  main: "container mx-auto px-4 py-8",
  title: "text-3xl font-semibold text-center text-gray-800 mb-6",
  searchContainer: "relative w-full max-w-lg mx-auto mb-6",
  searchInput: "w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none",
  resetButton: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-blue-300 rounded-full",
  grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:grid-cols-2",
  noResults: "text-center text-gray-500 col-span-full",
};

export default AdvocateGrid;
