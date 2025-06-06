"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { debounce } from "@/utils/debounce";
import { Advocate } from "@/types/advocate";
import AdvocateCard from "./AdvocateCard";
import useSWRInfinite from "swr/infinite";

type AdvocateGridProps = {
  initialAdvocates: Advocate[];
  pageSize: number;  
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load advocates");
  return res.json();
};

const AdvocateGrid: React.FC<AdvocateGridProps> = ({ initialAdvocates, pageSize }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [finalSearchTerm, setFinalSearchTerm] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // SWR Infinite Hook for pagination
  const { data, size, setSize, isValidating } = useSWRInfinite(
    (index) =>
      `/api/advocates?page=${index + 1}&pageSize=${pageSize}&search=${encodeURIComponent(finalSearchTerm)}`,
    fetcher,
    { fallbackData: [{ data: initialAdvocates }] }
  );

  const advocates = data ? data.flatMap((page) => page.data) : [];

  // Debounced Filter function with useMemo
  const debouncedFilter = useMemo(
    () =>
      debounce((searchValue: string) => {
        const trimmedSearch = searchValue.trim();  
        if (trimmedSearch === finalSearchTerm) {
          return; 
        }
        setIsSearching(!!trimmedSearch);
        setFinalSearchTerm(trimmedSearch);
        setSize(1); 
      }, 500), 
    [finalSearchTerm, setSize]
  );

  // Lazy loading more items with intersection observer
  useEffect(() => {
    if (!loadMoreRef.current || isSearching) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isValidating) {
          setSize((prev) => prev + 1); 
        }
      },
      { rootMargin: "100px" }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => observerRef.current?.disconnect();
  }, [setSize, isValidating, isSearching]);

  // Handle search term input change
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value); 
    debouncedFilter(value); 
  }, [debouncedFilter]);

  // Reset search handler
  const handleResetClick = useCallback(() => {
    setSearchTerm(""); 
    setFinalSearchTerm(""); 
    setIsSearching(false);
    setSize(1); 
  }, [setSize]);

  return (
    <main className={styles.main}>
      <h2 className={styles.title}>Find Your Advocate</h2>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by name, city, specialty, or degree..."
          className={styles.searchInput}
        />
        {searchTerm && (
          <button onClick={handleResetClick} className={styles.resetButton}>
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Advocate Grid */}
      <div className={styles.grid}>
        {advocates.length > 0 ? (
          advocates.map((advocate) => (
            <AdvocateCard key={advocate.id} advocate={advocate} searchTerm={finalSearchTerm} />
          ))
        ) : (
          <p className={styles.noResults}>No advocates found.</p>
        )}
      </div>

      {/* Load More Trigger */}
      {!isSearching && <div ref={loadMoreRef} className="h-1" />}
    </main>
  );
};

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
