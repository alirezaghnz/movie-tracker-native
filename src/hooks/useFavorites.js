import { getFavorites, saveFavorites } from "../storage/favorites.storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFavorites() {
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
  });

  const toggleMutation = useMutation({
    mutationFn: saveFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries(["favorites"]);
    },
  });

  const removeMutate = useMutation({
    mutationFn: async (imdbID) => {
      const updated = favoritesQuery.data.filter((f) => f.imdbID !== imdbID);
      await saveFavorites(updated);
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["favorites"], updated);
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await saveFavorites([]);
      return [];
    },
    onSuccess: () => {
      queryClient.setQueryData(["favorites"], []);
    },
  });
  return {
    favorites: favoritesQuery.data ?? [],
    isFavorite: (id) => favoritesQuery.data?.some((f) => f.imdbID === id),
    toggleFavorite: toggleMutation.mutate,
    removeFavorite: removeMutate.mutate,
    clearFavorites: clearMutation.mutate,
  };
}
