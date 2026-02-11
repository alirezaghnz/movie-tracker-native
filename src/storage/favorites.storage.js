import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "favorites";

export async function getFavorites() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveFavorites(list) {
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
