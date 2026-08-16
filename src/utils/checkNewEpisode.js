import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTVDetails } from "../services/api/tmdb";

const CACHE_KEY = "episode_release_cache";
const CACHE_TIME_TO_LIVE = 12 * 60 * 60 * 1000; // 12 hours
const BATCH_SIZE = 3;

// Parse TMDB date strings (YYYY-MM-DD) as local dates to avoid timezone shifts.
const parseLocalDate = (d) => {
  if (!d) return null;
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
};

const getCache = async () => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};
const saveCache = async (cache) => {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

const checkAndEnrich = async (favorites) => {
  const tvFavorites = favorites.filter((f) => f.type === "tv");

  const otherFavorites = favorites.filter((f) => f.type !== "tv");

  if (!tvFavorites.length) {
    return favorites;
  }

  const cache = await getCache();
  const now = Date.now();

  // New episodes are only considered "recent" if they aired within the last 7 days.
  const todayLocal = new Date();
  todayLocal.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(todayLocal);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Only re-fetch series that have no cache entry or whose cache has expired.
  const needCheckList = tvFavorites.filter((fav) => {
    const cached = cache[fav.id];
    return !cached || now - (cached.checkedAt || 0) > CACHE_TIME_TO_LIVE;
  });

  // Reuse recent cache entries to avoid unnecessary TMDB requests.
  const cachedList = tvFavorites.filter((fav) => {
    const cached = cache[fav.id];
    return cached && now - (cached.checkedAt || 0) <= CACHE_TIME_TO_LIVE;
  });

  const cachedResults = cachedList.map((fav) => ({
    ...fav,
    hasNewEpisode: !!cache[fav.id]?.isNew,
  }));

  const fetchedResults = [];

  for (let i = 0; i < needCheckList.length; i += BATCH_SIZE) {
    const batch = needCheckList.slice(i, i + BATCH_SIZE);

    // Process a small batch of requests in parallel to reduce API load.
    const batchResults = await Promise.all(
      batch.map(async (fav) => {
        try {
          // Fetch the TV details and determine if there's a new episode
          const details = await getTVDetails(fav.id);
          const lastEp = details?.last_episode_to_air;
          const lastDate = lastEp?.air_date || null;
          const prev = cache[fav.id] || {};
          const isFirstCheck = !prev.checkedAt;

          let isNew = false;
          if (isFirstCheck) {
            const lastParsed = parseLocalDate(lastDate);
            isNew = !!(lastParsed && lastParsed >= sevenDaysAgo);
          } else {
            // For subsequent checks, detect whether a newer episode has been released.
            const prevLastDate = prev.lastEpDate ?? null;
            const lastParsed = parseLocalDate(lastDate);
            const prevParsed = parseLocalDate(prevLastDate);

            // If the last episode date has changed and it's within the last 7 days, mark it as new
            isNew = !!(
              lastDate &&
              lastDate !== prevLastDate &&
              lastParsed &&
              lastParsed >= sevenDaysAgo &&
              (!prevParsed || lastParsed > prevParsed)
            );
          }

          cache[fav.id] = { lastEpDate: lastDate, checkedAt: now, isNew };

          return { ...fav, hasNewEpisode: isNew, _latestEpisodeId: lastEp?.id };
        } catch {
          return fav;
        }
      }),
    );
    fetchedResults.push(...batchResults);
    if (i + BATCH_SIZE < needCheckList.length) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  await saveCache(cache);
  return [...cachedResults, ...fetchedResults, ...otherFavorites];
};

export const markFavoritesWithNewEpisodes = async (favorites) => {
  return checkAndEnrich(favorites);
};

export const checkForAnyNewEpisode = async (favorites) => {
  const enriched = await checkAndEnrich(favorites);
  return enriched.some((f) => f.hasNewEpisode);
};

export const markSeriesSeen = async (seriesId) => {
  const cache = await getCache();
  if (cache[seriesId]) {
    cache[seriesId].isNew = false;
    await saveCache(cache);
  }
};
