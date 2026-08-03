import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "recent_searches";
const MAX_ITEMS = 3;

export const getRecentSearches = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addRecentSearch = async (query) => {
  try {
    const trimmed = query.trim();
    if (!trimmed) return;
    // Remove duplicates and limit the number of items
    const current = await getRecentSearches();
    const filtered = current.filter(
      (q) => q.toLowerCase() !== trimmed.toLowerCase(),
    );
    // Add the new query to the front of the list
    const updated = [trimmed, ...filtered].slice(0, MAX_ITEMS);

    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const removeRecentSearch = async (query) => {
  const current = await getRecentSearches();
  const updated = current.filter((q) => q !== query);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
};

export const clearRecentSearch = async () => {
  await AsyncStorage.removeItem(KEY);
};
