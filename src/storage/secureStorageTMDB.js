import * as SecureStore from "expo-secure-store";

export const secureStorage = {
  async get(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async set(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  async remove(key) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

export const STORAGE_KEYS = {
  TMDB_TOKEN: "tmdb_token",
};

export const saveTmdbToken = (token) =>
  secureStorage.set(STORAGE_KEYS.TMDB_TOKEN, token);
export const getTmdbToken = () => secureStorage.get(STORAGE_KEYS.TMDB_TOKEN);
export const removeTmdbToken = () =>
  secureStorage.remove(STORAGE_KEYS.TMDB_TOKEN);
