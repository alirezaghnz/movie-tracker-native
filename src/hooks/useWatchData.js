import { useQuery } from "@tanstack/react-query";
import { getWatchData } from "../services/api/watch";

export function useWatchData(imdbID, season, quality) {
  return useQuery({
    queryKey: ["watchData", imdbID, season, quality],
    queryFn: () => getWatchData(imdbID, season, quality),
    enabled: !!imdbID && !!season && !!quality,
    keepPreviousData: true,
  });
}
