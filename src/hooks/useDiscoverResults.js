import { useEffect, useState } from "react";
import { discoverMovies, discoverTV } from "../services/api/tmdb";

export function useDiscoverResults(filters) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const hasActiveFilters =
    filters.mediaType !== "all" ||
    filters.selectedGenreId !== null ||
    filters.selectedYear !== null;

  useEffect(() => {
    if (!hasActiveFilters) {
      setResults([]);
      return;
    }

    setLoading(true);

    const params = {};
    if (filters.selectedGenreId) params.with_genres = filters.selectedGenreId;
    if (filters.selectedYear) {
      params.primary_release_year = filters.selectedYear;
      params.first_air_date_year = filters.selectedYear;
    }

    const fetches = [];
    if (filters.mediaType === "all" || filters.mediaType === "movie") {
      fetches.push(
        discoverMovies(params).then((data) =>
          (data.results || []).map((i) => ({ ...i, media_type: "movie" })),
        ),
      );
    }
    if (filters.mediaType === "all" || filters.mediaType === "tv") {
      fetches.push(
        discoverTV(params).then((data) =>
          (data.results || []).map((i) => ({ ...i, media_type: "tv" })),
        ),
      );
    }

    Promise.all(fetches)
      .then((arrays) => {
        const merged = [];
        const maxLen = Math.max(...arrays.map((a) => a.length), 0);
        for (let i = 0; i < maxLen; i++) {
          for (const arr of arrays) {
            if (arr[i]) merged.push(arr[i]);
          }
        }
        setResults(merged);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [filters.mediaType, filters.selectedGenreId, filters.selectedYear]);

  return { results, loading, hasActiveFilters };
}
