import { useCallback, useState } from "react";

const initialFilters = {
  mediaType: "all", // all | movie | tv
  selectedGenreId: null,
  selectedYear: null,
};

export function useFilters() {
  const [filters, setFilters] = useState(initialFilters);

  const selectMediaType = useCallback((newMediaType) => {
    setFilters((previousState) => ({
      ...previousState,
      mediaType: newMediaType,
    }));
  }, []);

  const toggleGenre = useCallback((genreId) => {
    setFilters((previousState) => ({
      ...previousState,
      // Selecting the same genre again clears it (acts as a toggle)
      selectedGenreId:
        previousState.selectedGenreId === genreId ? null : genreId,
    }));
  }, []);

  const toggleYear = useCallback((year) => {
    setFilters((previousState) => ({
      ...previousState,
      selectedYear: previousState.selectedYear === year ? null : year,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const hasActiveFilters =
    filters.mediaType !== "all" ||
    filters.selectedGenreId !== null ||
    filters.selectedYear !== null;

  return {
    filters,
    selectMediaType,
    toggleGenre,
    toggleYear,
    resetFilters,
    hasActiveFilters,
  };
}
