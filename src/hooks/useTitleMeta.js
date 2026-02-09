import { useQuery } from "@tanstack/react-query";
import { getTitleMeta } from "../services/api/titleMeta";

export function useTitleMeta(imdbID) {
  return useQuery({
    queryKey: ["titleMeta", imdbID],
    queryFn: () => getTitleMeta(imdbID),
    enabled: !!imdbID,
  });
}
