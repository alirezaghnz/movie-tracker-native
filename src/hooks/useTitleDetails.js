import { useQuery } from "@tanstack/react-query";
import { getTitleDetails } from "../services/api/title";

export function useTitleDetails(imdbID) {
  return useQuery({
    queryKey: ["titleDetails", imdbID],
    queryFn: () => getTitleDetails(imdbID),
    enabled: !!imdbID,
  });
}
