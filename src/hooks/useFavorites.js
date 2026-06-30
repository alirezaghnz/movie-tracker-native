import { getFavorites, saveFavorites } from "../storage/favorites.storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFavorites() {
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
  });

  const toggleMutation = useMutation({
    mutationFn: async (item) => {
      const current = favoritesQuery.data ?? [];
      const exists = current.some((f) => f.id === item.id);
      const updated = exists
        ? current.filter((f) => f.id !== item.id)
        : [...current, item];
      await saveFavorites(updated);
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["favorites"], updated);
    },
  });

  const removeMutate = useMutation({
    mutationFn: async (id) => {
      const updated = favoritesQuery.data.filter((f) => f.id !== id);
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
    isFavorite: (id) => favoritesQuery.data?.some((f) => f.id === id) ?? false,
    toggleFavorite: toggleMutation.mutate,
    removeFavorite: removeMutate.mutate,
    clearFavorites: clearMutation.mutate,
  };
}
