import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "recently_watched";
const MAX_ITEMS = 20;

export const getRecentlyWatched = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addToRecentlyWatched = async (item) => {
  try {
    const current = await getRecentlyWatched();

    // Remove the item if it already exists i the list.
    const filtered = current.filter((i) => i.id !== item.id);

    // Add the new item to the top opf the list.
    const updated = [{ ...item, visitedAt: Date.now() }, ...filtered].slice(
      0,
      MAX_ITEMS,
    );

    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
};

export const clearRecentlyWatched = async () => {
  await AsyncStorage.removeItem(KEY);
};
