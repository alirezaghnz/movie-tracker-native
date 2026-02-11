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

  return {
    favorites: favoritesQuery.data ?? [],
    isFavorite: (id) => favoritesQuery.data?.some((f) => f.imdbID === id),
    toggleFavorite: toggleMutation.mutate,
  };
}
