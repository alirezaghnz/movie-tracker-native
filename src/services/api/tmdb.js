import { secureStorage, STORAGE_KEYS } from "../../storage/secureStorageTMDB";

const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

//Global auth-error callback
let _onAuthError = null;
let _onUnreachable = null;
export const setAuthErrorHandler = (fn) => {
  _onAuthError = fn;
};
export const setUnreachableHandler = (fn) => {
  _onUnreachable = fn;
};
const fetchTMDB = async (endpoint) => {
  const token = await secureStorage.get(STORAGE_KEYS.TMDB_TOKEN);
  if (!token) {
    _onAuthError?.();
    throw new Error("No TMDB token found");
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.status === 401 || res.status === 403) {
      _onAuthError?.();
      throw new Error(`TMDB ${res.status}`);
    }
    if (!res.ok) {
      throw new Error(`TMDB ${res.status}`);
    }

    return res.json();
  } catch {
    _onUnreachable?.();
    throw new Error("TMDB unreachable");
  }
};

// Trending
export const getTrending = (type = "tv", time = "day") => {
  return fetchTMDB(`/trending/${type}/${time}`);
};

//Details
export const getTVDetails = (tmdbId) => {
  return fetchTMDB(`/tv/${tmdbId}`);
};

// image url fetch with tmdb
export const getImageUrl = (path, size = "w500") => {
  return path ? `${IMG_BASE}/${size}${path}` : null;
};

export const getTVSeasonsDetails = (tvId, seasonNumber) => {
  return fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`);
};

export const searchTV = (query) => {
  return fetchTMDB(`/search/tv?query=${encodeURIComponent(query)}`);
};
export const getTopRatedTV = () => {
  return fetchTMDB("/tv/top_rated?page=1");
};
