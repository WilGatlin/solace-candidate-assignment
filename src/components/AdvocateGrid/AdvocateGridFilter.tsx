import React from "react";
import Picker from "@/components/Picker";

import { Advocate } from "@/types/advocate";
import { useState, useEffect, useMemo } from "react";

// Helper to check if advocate falls in selected years bucket
function matchesYearsBucket(years: number, bucket: string): boolean {
  if (!bucket) return true; // No bucket selected, always match
  if (bucket === "1-5 years") return years >= 1 && years <= 5;
  if (bucket === "6-10 years") return years >= 6 && years <= 10;
  if (bucket === "10+ years") return years > 10;
  return true; // Should not happen if bucket is one of the options
}

interface AdvocateGridFilterProps {
  allAdvocates: Advocate[];
  onFilteredAdvocatesUpdate: (filteredAdvocates: Advocate[]) => void;
}


const AdvocateGridFilter: React.FC<AdvocateGridFilterProps> = ({
  allAdvocates,
  onFilteredAdvocatesUpdate,
}) => {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedYears, setSelectedYears] = useState("");

  const cityOptions = useMemo(() => Array.from(new Set(allAdvocates.map(a => a.city))).filter(Boolean).sort(), [allAdvocates]);
  const degreeOptions = useMemo(() => Array.from(new Set(allAdvocates.map(a => a.degree))).filter(Boolean).sort(), [allAdvocates]);
  const yearsOptions = useMemo(() => [
    "1-5 years",
    "6-10 years",
    "10+ years",
  ], []);

  const filteredAdvocates = useMemo(() => {
    return allAdvocates.filter(a => {
      const cityMatch = !selectedCity || a.city === selectedCity;
      const degreeMatch = !selectedDegree || a.degree === selectedDegree;
      const yearsMatch = !selectedYears || matchesYearsBucket(a.yearsOfExperience, selectedYears);
      return cityMatch && degreeMatch && yearsMatch;
    });
  }, [allAdvocates, selectedCity, selectedDegree, selectedYears]);

  useEffect(() => {
    onFilteredAdvocatesUpdate(filteredAdvocates);
  }, [filteredAdvocates, onFilteredAdvocatesUpdate]);

  return (
    <div className="flex flex-row items-center gap-4 mb-6 w-full max-w-lg mx-auto">
      <Picker
        label="City:"
        options={cityOptions}
        value={selectedCity}
        onChange={setSelectedCity}
        allLabel="All Cities"
        className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      <Picker
        label="Degree:"
        options={degreeOptions}
        value={selectedDegree}
        onChange={setSelectedDegree}
        allLabel="All Degrees"
        className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      <Picker
        label="Years:"
        options={yearsOptions}
        value={selectedYears}
        onChange={setSelectedYears}
        allLabel="All Years"
        className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );
};

export default AdvocateGridFilter;
