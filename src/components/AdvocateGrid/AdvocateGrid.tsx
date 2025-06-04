"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";

import AdvocateGridFilter from "@/components/AdvocateGrid/AdvocateGridFilter";
import AdvocateGridSearch from "@/components/AdvocateGrid/AdvocateGridSearch";
import { Advocate } from "@/types/advocate";
import AdvocateCard from "../AdvocateCard";
import useSWRInfinite from "swr/infinite";

type AdvocateGridProps = {
  pageSize: number;  
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load advocates");
  return res.json();
};

const AdvocateGrid: React.FC<AdvocateGridProps> = ({ pageSize }) => {
  const [finalSearchTerm, setFinalSearchTerm] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false)

  // SWR Infinite Hook for pagination
  const { data, size, setSize, isValidating } = useSWRInfinite(
    (index) =>
      `/api/advocates?page=${index + 1}&pageSize=${pageSize}&search=${encodeURIComponent(finalSearchTerm)}`,
    fetcher,
    {
      fallbackData: [{ data: [] }],
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 2000, // reduce repeated fetches for the same page
      revalidateFirstPage: false // don't refetch page=1 on scroll
    }
  );

  const advocates = useMemo(() => (data ? data.flatMap((page) => page.data) : []), [data]);
  const lastPage = data?.[data.length - 1]; // no more data if last page has 
  const hasMore = lastPage && lastPage.data && lastPage.data.length === pageSize;

  const [displayAdvocates, setDisplayAdvocates] = useState<Advocate[]>([]);

  const handleFilteredAdvocatesUpdate = useCallback((newFilteredList: Advocate[]) => {
    setDisplayAdvocates(currentDisplayAdvocates => {
      if (newFilteredList.length !== currentDisplayAdvocates.length) {
        return newFilteredList;
      }
      for (let i = 0; i < newFilteredList.length; i++) {
        // Assuming advocate objects have stable references if their content is the same
        if (newFilteredList[i] !== currentDisplayAdvocates[i]) {
          return newFilteredList;
        }
      }
      return currentDisplayAdvocates; // No actual change, return current state reference
    });
  }, []); // Empty dependency array: setDisplayAdvocates is stable


  // Handle reset button click from AdvocateGridSearch
  const handleSearchReset = useCallback(() => {
    setFinalSearchTerm("");
    setIsSearching(false);
    setSize(1); // Reset to page 1
  }, [setSize]);

  const handleDebouncedSearchUpdate = useCallback((newSearchTerm: string) => {
    setFinalSearchTerm(newSearchTerm);
    setIsSearching(newSearchTerm !== ""); // Set isSearching based on if there's a term
    setSize(1); // Reset to page 1 on new search
  }, [setSize]);

   // Reset fetching state when new data loads
   useEffect(() => {
    isFetchingRef.current = false;
  }, [data]);

  // Lazy loading with observer and hasMore safeguard
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || isSearching || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isValidating && !isFetchingRef.current) {
          isFetchingRef.current = true;
          setSize((prev) => prev + 1);
        }
      },
      { rootMargin: "200px", threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isSearching, isValidating, hasMore, setSize]);

  return (
    <main className={styles.main}>
      <h2 className={styles.title}>Find Your Advocate</h2>

      {/* Search Bar */}
      <AdvocateGridSearch
        initialSearchTerm={finalSearchTerm} // Pass current final search term if needed for initialization
        onDebouncedSearch={handleDebouncedSearchUpdate}
        onResetAppSearch={handleSearchReset}
        className={styles.searchContainer}
        placeholder="Search by name, city, specialty, or degree..."
      />

      {/* Filtering Section */}
      <AdvocateGridFilter
        allAdvocates={advocates} // Pass all advocates fetched by SWR
        onFilteredAdvocatesUpdate={handleFilteredAdvocatesUpdate} // Pass the memoized callback
      />

      {/* Advocate Grid */}
      {(data?.length === 1 && data[0].data.length === 0 && isValidating && !advocates.length) ? 
        <div>Loading...</div> :
        <div className={styles.grid}>
          {displayAdvocates.length > 0 ? (
            displayAdvocates.map((advocate) => (
              <AdvocateCard key={advocate.id} advocate={advocate} searchTerm={finalSearchTerm} />
            ))
          ) : (
            <p className={styles.noResults}>No advocates found matching your criteria.</p>
          )}
        </div>
      }

      {/* Load More Trigger */}
      {!isSearching && hasMore && (<div ref={loadMoreRef} className="h-16 w-full bg-transparent" aria-hidden="true" />)}
    </main>
  );
};

const styles = {
  main: "container mx-auto px-4 py-8",
  title: "text-3xl font-semibold text-center text-gray-800 mb-6",
  searchContainer: "relative w-full max-w-lg mx-auto mb-6",
  searchInput: "w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none",
  resetButton: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-blue-300 rounded-full",
  filtersContainer: "flex flex-row items-center gap-4 mb-6 w-full max-w-lg mx-auto",
  picker: "px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none",
  grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:grid-cols-2",
  noResults: "text-center text-gray-500 col-span-full",
};

export default AdvocateGrid;