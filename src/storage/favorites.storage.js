import AsyncStorage from "@react-native-async-storage/async-storage";

/* Key like a namespace for the fav series folder in the storage,
  so we can easily get/set the fav series list without worrying about other data in the storage.
*/
const KEY = "favorites";

// Get the list of fav seris from storage
export async function getFavorites() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

// This function can be used in two ways:
// 1. Pass and array to replace the entire fav list
// 2. Pass a single item to toggle it in the fav list
export async function saveFavorites(list) {
  // If an array is passed, treat it as the full list and save directly.
  if (Array.isArray(list)) {
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
    return list;
  }

  // Otherwise treat `list` as a single favorite item and toggle it.
  const favorites = await getFavorites();
  const exist = favorites.find((f) => f.imdbID === list.imdbID);
  let updated;
  if (exist) {
    updated = favorites.filter((f) => f.imdbID !== list.imdbID);
  } else {
    updated = [...favorites, list];
  }

  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}
