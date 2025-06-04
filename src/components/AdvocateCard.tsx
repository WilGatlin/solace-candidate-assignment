import { memo, useState, useMemo, useCallback } from "react";
import { UserCircle, Phone, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

import { Advocate } from "@/types/advocate";

type AdvocateCardProps = {
  advocate: Advocate;
  searchTerm: string;
};

const AdvocateCard: React.FC<AdvocateCardProps> = memo(({ advocate, searchTerm }) => {
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);

  // Memoize matching specialties based on search term
  function normalize(str: string) {
    return str.replace(/'/g, '').toLowerCase();
  }

  const matchingSpecialties = useMemo(() => {
    if (!searchTerm) return advocate.specialties;
    return advocate.specialties.filter((spec) =>
      normalize(spec).includes(normalize(searchTerm))
    );
  }, [advocate.specialties, searchTerm]);

  // Determine whether to show only the relevant specialties
  const shouldShowOnlyRelevant = useMemo(() => {
    return searchTerm && !showAllSpecialties && matchingSpecialties.length > 0;
  }, [searchTerm, showAllSpecialties, matchingSpecialties]);

  // Memoize the toggle button function to prevent unnecessary re-renders
  const toggleSpecialties = useCallback(() => {
    setShowAllSpecialties((prev) => !prev);
  }, []);

  return (
    <div className={styles.card}>
      {/* Profile Icon */}
      <UserCircle className="w-12 h-12 text-gray-400" />

      {/* Advocate Name & Qualification */}
      <h2 className={styles.name}>
        {advocate.firstName} {advocate.lastName}{" "}
        <span className={styles.degree}>({advocate.degree})</span>
      </h2>

      {/* Experience */}
      <p className={styles.experience}>{advocate.yearsOfExperience} years experience</p>

      {/* Specialties Section */}
      <div className={styles.specialtiesContainer}>
        <h3 className="text-xs font-medium text-gray-700 mb-1">Specialties:</h3>
        <div className="flex flex-wrap gap-1">
          {(shouldShowOnlyRelevant ? matchingSpecialties : advocate.specialties).map((s, i) => {
            const isMatch = searchTerm && normalize(s).includes(normalize(searchTerm));
            return (
              <div
                key={`${advocate.id}-${s}-${i}`}
                className={clsx(
                  styles.specialtyBadge,
                  isMatch ? styles.specialtyMatch : styles.specialtyDefault
                )}
              >
                {s}
              </div>
            );
          })}
        </div>

        {/* Toggle Button for Showing Relevant or All Specialties */}
        {searchTerm && (
          <button onClick={toggleSpecialties} className={styles.toggleButton}>
            {showAllSpecialties ? "Show Relevant" : "Show All Specialties"}
            {showAllSpecialties ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </button>
        )}
      </div>

      {/* Phone & Location Section */}
      <div className={styles.contactSection}>
        <div className={styles.contactItem}>
          <MapPin className="w-5 h-5 text-gray-500" />
          <span className="truncate max-w-[40%] sm:max-w-none">{advocate.city}</span>
        </div>

        <a href={`tel:${advocate.phoneNumber}`} className={styles.contactLink}>
          <Phone className="w-5 h-5 text-blue-500" />
          <span className="truncate max-w-[40%] sm:max-w-none">{advocate.phoneNumber}</span>
        </a>
      </div>
    </div>
  );
});

const styles = {
  card: "bg-white shadow-md rounded-lg p-4 border border-gray-200 flex flex-col items-center text-center transition-transform transform hover:scale-[1.02]",
  name: "text-md font-semibold text-gray-800 mt-2",
  degree: "text-gray-500 text-sm font-normal",
  experience: "text-xs text-gray-500",
  specialtiesContainer: "mt-2 w-full text-left pb-3",
  specialtyBadge: "px-3 py-1 rounded-md text-xs font-medium border",
  specialtyMatch: "bg-yellow-200 border-yellow-500",
  specialtyDefault: "bg-gray-100 border-transparent",
  toggleButton: "mt-1 text-blue-600 text-xs flex items-center",
  contactSection: "mt-auto pt-3 w-full border-t border-gray-300 flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-2",
  contactItem: "flex items-center gap-2 text-gray-600 text-sm px-4 py-3 rounded-lg sm:px-0 sm:py-0 sm:flex-1 truncate",
  contactLink: "flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline bg-blue-100 px-4 py-3 rounded-lg sm:bg-transparent sm:px-0 sm:py-0 sm:flex-1 truncate",
};

AdvocateCard.displayName = "AdvocateCard";

export default AdvocateCard;
