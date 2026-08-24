import { useEffect, useRef, useState } from "react";
import {
  getMovieRecommendations,
  getMovieSimilar,
  getTVRecommendations,
  getTVSimilar,
} from "../services/api/tmdb";

export function useRecommendations(recentlyWatched) {
  const [recommendations, setRecommendations] = useState([]);

  // Tracks the last set of source IDs used to generate recommendations,
  // so we can skip re-fetching when nothing has actually changed.
  const lastSourceKey = useRef(null);

  useEffect(() => {
    if (!recentlyWatched || recentlyWatched.length === 0) return;
    const sources = recentlyWatched.slice(0, 5);

    const sourcesKey = sources.map((s) => `${s.type}_${s.id}`).join(",");

    if (sourcesKey === lastSourceKey.current) return;

    const watchedIds = new Set(
      recentlyWatched.map((h) => `${h.type || "movie"}_${h.id}`),
    );

    const controller = new AbortController();

    // For each recently watched item, fetch recommendations.
    // If TMDB returns no recommendations, fall back to "similar" titles.
    const fetches = sources.map((source) => {
      const type = source.type === "tv" ? "tv" : "movie";
      const getRecs =
        type === "tv" ? getTVRecommendations : getMovieRecommendations;

      const getSim = type === "tv" ? getTVSimilar : getMovieSimilar;
      return getRecs(source.id, { signal: controller.signal })
        .then((data) => {
          const results = (data.results || []).map((i) => ({
            ...i,
            media_type: type,
          }));
          if (results.length > 0) return results;
          // if recommendations is empty go for similar
          return getSim(source.id, { signal: controller.signal }).then((d) =>
            (d.results || []).map((i) => ({ ...i, media_type: type })),
          );
        })
        .catch((e) => {
          if (e.name !== "AbortError") return [];
          throw e; // let the abort propagate so Promise.all rejects cleanly
        });
    });

    Promise.all(fetches)
      .then((allRecommendations) => {
        // Interleave results from each source (round-robin) instead of concatenating
        // so recommendations aren't dominated by a single watched title.
        const merged = [];
        const maxLen = Math.max(
          ...allRecommendations.map((list) => list.length),
          0,
        );
        for (let position = 0; position < maxLen; position++) {
          for (const recommendationsFromOneSource of allRecommendations) {
            const item = recommendationsFromOneSource[position];
            if (item) merged.push(item);
          }
        }

        //Remove duplicates across sources and filter out anything
        //the user has already watched.
        const seen = new Set();
        const deduped = merged.filter((item) => {
          const key = `${item.media_type}_${item.id}`;
          if (seen.has(key) || watchedIds.has(key)) return false;
          seen.add(key);
          return true;
        });
        setRecommendations(deduped.slice(0, 20));
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          console.warn("Recommendations fetch failed", e);
        }
      });
    return () => controller.abort();
  }, [recentlyWatched?.length]);
  return recommendations;
}
