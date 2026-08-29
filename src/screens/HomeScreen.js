import {
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Image,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getImageUrl,
  getTopRatedTV,
  getTrending,
  searchAll,
} from "../services/api/tmdb";
import TextTicker from "react-native-text-ticker";
import TopRatedSlider from "../components/TopRatedSlider";
import {
  addRecentSearch,
  clearRecentSearch,
  getRecentSearches,
  removeRecentSearch,
} from "../storage/recentSearch.storage";
import { getRecentlyWatched } from "../storage/RecentlyStorage";
import { useRecommendations } from "../hooks/useRecommendations";
import FilterModal from "../components/FilterModal";
import { useFilters } from "../hooks/useFilters";
import { useDiscoverResults } from "../hooks/useDiscoverResults";
import { getGenreName } from "../constants/genres";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const {
    filters,
    selectMediaType,
    toggleGenre,
    toggleYear,
    resetFilters,
    hasActiveFilters,
  } = useFilters();
  const { results: discoverResults, loading: discoverLoading } =
    useDiscoverResults(filters);

  const [recentlyWatched, setRecentlyWatched] = useState([]);
  const inputRef = useRef(null); // for focus on input

  const fetchData = () => {
    setError(false);
    setLoading(true);
    // Fetch trending series, movies, and top-rated TV shows in parallel
    Promise.all([
      getTrending("tv", "day"),
      getTrending("movie", "day"),
      getTopRatedTV(),
    ])
      .then(([tvData, movieData, topRatedData]) => {
        setTrendingSeries(tvData.results);
        setTrendingMovies(movieData.results);
        setTopRated(topRatedData.results?.slice(0, 10) ?? []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearchLoading(true);
    const timeout = setTimeout(() => {
      searchAll(query)
        .then((data) => {
          const filtered = data.results.filter(
            (item) => item.media_type === "movie" || item.media_type === "tv",
          );
          setResults(filtered);
        })
        .catch(console.error)
        .finally(() => setSearchLoading(false));
    }, 500);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    getRecentSearches().then(setRecentSearches);
  }, []);

  useFocusEffect(
    useCallback(() => {
      getRecentlyWatched().then(setRecentlyWatched);
    }, []),
  );

  const recommendedItems = useRecommendations(recentlyWatched);

  const handleResultPress = async (item) => {
    await addRecentSearch(query);
    // Update the list of recent searches after adding the new query
    setRecentSearches(await getRecentSearches());
    navigation.navigate("Title", {
      id: item.id,
      type: item.media_type,
    });
  };

  const handleRemoveRecentSearch = async (q) => {
    const updated = await removeRecentSearch(q);
    setRecentSearches(updated);
  };

  const handleClearRecentSearch = async () => {
    await clearRecentSearch();
    setRecentSearches([]);
  };

  const isSearching = query.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Text style={styles.discover}>IronBranch</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            style={styles.profileBtn}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRow}>
          <View style={styles.searchRow}>
            <TextInput
              ref={inputRef}
              placeholder="Search movies and series..."
              placeholderTextColor="#777"
              value={query}
              onChangeText={setQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={styles.input}
            />

            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")} style={styles.clearBtn}>
                <Text style={styles.clearText}>×</Text>
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={() => setShowFilters(true)}
            style={styles.filterBtn}
          >
            <Feather name="settings" size={20} color="white" />
          </Pressable>
          <FilterModal
            visible={showFilters}
            onClose={() => setShowFilters(false)}
            filters={filters}
            setType={selectMediaType}
            toggleGenre={toggleGenre}
            setYear={toggleYear}
            resetFitlers={resetFilters}
          />
        </View>
        {isFocused && !isSearching && recentSearches.length > 0 && (
          <View style={styles.recentContainer}>
            <View style={styles.recetnHeader}>
              <Text style={styles.recentTitle}>Recent Searches (Max:3)</Text>
              <Pressable onPress={handleClearRecentSearch}>
                <Text style={styles.recentClear}>Clear</Text>
              </Pressable>
            </View>
            {recentSearches.map((q) => (
              <Pressable
                key={q}
                style={styles.recentItem}
                onPress={() => setQuery(q)}
              >
                <Text style={styles.recentText}>{q}</Text>
                <Pressable
                  onPress={() => handleRemoveRecentSearch(q)}
                  hitSlop={8}
                >
                  <Text style={styles.recentRemove}>×</Text>
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}

        {searchLoading && (
          <ActivityIndicator style={{ marginBottom: 10 }} color="#fff" />
        )}

        {isSearching &&
          results.map((item) => (
            <Pressable
              key={item.id.toString()}
              style={styles.item}
              onPress={() => handleResultPress(item)}
            >
              <Image
                source={{ uri: getImageUrl(item.poster_path) }}
                style={styles.searchPoster}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.name || item.title} </Text>
                <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                  <Text
                    style={[
                      styles.typeBadge,
                      item.media_type === "movie"
                        ? styles.movieBadge
                        : styles.tvBadge,
                    ]}
                  >
                    {item.media_type === "movie" ? "Movie🎬" : "Series📺"}
                  </Text>
                  <Text
                    style={{
                      color: "yellow",
                      fontSize: 10,
                      marginTop: 4,
                      textAlign: "right",
                    }}
                  >
                    (
                    {(
                      item.first_air_date ||
                      item.release_date ||
                      "null"
                    ).substring(0, 4)}
                    ) . IMDB ⭐ {item.vote_average?.toFixed(1)}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}

        {hasActiveFilters ? (
          <View style={styles.filteredSection}>
            <View style={styles.filteredHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.filteredTitle}>
                  {discoverResults.length} Result
                  {discoverResults.length !== 1 ? "s" : ""}
                </Text>
                <Text style={styles.filteredSubtitle}>
                  {filters.mediaType !== "all" &&
                    (filters.mediaType === "movie" ? "Movies" : "Series")}
                  {filters.selectedGenreId &&
                    ` · ${getGenreName(filters.selectedGenreId, filters.mediaType)}`}
                  {filters.selectedYear && ` · ${filters.selectedYear}`}
                </Text>
              </View>

              <Pressable style={styles.exitFilterBtn} onPress={resetFilters}>
                <Feather name="x" size={16} color="#fff" />
                <Text style={styles.exitFilterText}>Clear</Text>
              </Pressable>
            </View>

            {discoverLoading ? (
              <ActivityIndicator style={{ marginTop: 40 }} color="#fff" />
            ) : discoverResults.length === 0 ? (
              <View style={styles.emptyFilterState}>
                <Text style={styles.emptyFilterIcon}>🔍</Text>
                <Text style={styles.emptyFilterText}>No results found</Text>
                <Text style={styles.emptyFilterSubtext}>
                  Try different filters
                </Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {discoverResults.map((item) => (
                  <Pressable
                    key={`${item.media_type}_${item.id}`}
                    style={styles.filterCard}
                    onPress={() =>
                      navigation.navigate("Title", {
                        id: item.id,
                        type: item.media_type,
                      })
                    }
                  >
                    <View style={styles.filterPosterWrapper}>
                      <Image
                        source={{ uri: getImageUrl(item.poster_path) }}
                        style={styles.filterPoster}
                      />
                      <View
                        style={[
                          styles.typeTag,
                          item.media_type === "tv"
                            ? styles.tvTag
                            : styles.movieTag,
                        ]}
                      >
                        <Text style={styles.typeText}>
                          {item.media_type === "tv" ? "TV" : "MOVIE"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.filterCardTitle} numberOfLines={2}>
                      {item.title || item.name}
                    </Text>
                    <Text style={styles.filterCardRating}>
                      ⭐ {item.vote_average?.toFixed(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ) : (
          !isSearching &&
          (error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>📡</Text>
              <Text style={styles.errorTitle}>Unable to Connect</Text>
              <Text style={styles.errorSubtitle}>
                Check your internet connection and try again.
              </Text>
              <Pressable style={styles.retryBtn} onPress={fetchData}>
                <Text style={styles.retryText}>Try Again</Text>
              </Pressable>
            </View>
          ) : loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color="#fff" />
          ) : (
            <>
              <TopRatedSlider data={topRated} />

              {recommendedItems.length > 0 && (
                <>
                  <View style={styles.sectionTitleHeader}>
                    <Text style={styles.sectionTitle}>Recommended For You</Text>
                    <View style={styles.sectionLine} />
                  </View>

                  <FlatList
                    data={recommendedItems}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => `${item.media_type}_${item.id}`}
                    contentContainerStyle={{ paddingHorizontal: 4, gap: 12 }}
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() =>
                          navigation.navigate("Title", {
                            id: item.id,
                            type: item.media_type,
                          })
                        }
                        style={styles.card}
                      >
                        <View style={styles.posterContainer}>
                          <Image
                            source={{ uri: getImageUrl(item.poster_path) }}
                            style={styles.poster}
                          />
                          <View
                            style={[
                              styles.typeTag,
                              item.media_type === "tv"
                                ? styles.tvTag
                                : styles.movieTag,
                            ]}
                          >
                            <Text style={styles.typeText}>
                              {item.media_type === "tv" ? "TV" : "MOVIE"}
                            </Text>
                          </View>
                        </View>

                        <TextTicker
                          style={styles.cardTitle}
                          duration={8000}
                          loop
                          bounce
                          repeatSpacer={50}
                          marqueeDelay={1000}
                        >
                          {item.title || item.name}
                        </TextTicker>
                        <Text style={styles.rating}>
                          ⭐ {item.vote_average?.toFixed(1)}
                        </Text>
                      </Pressable>
                    )}
                  />
                </>
              )}
              <View style={styles.sectionTitleHeader}>
                <Text style={styles.sectionTitle}>Trending Series</Text>
                <View style={styles.sectionLine} />
              </View>

              <FlatList
                data={trendingSeries}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingHorizontal: 4, gap: 12 }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() =>
                      navigation.navigate("Title", {
                        id: item.id,
                        type: "tv",
                      })
                    }
                    style={styles.card}
                  >
                    <Image
                      source={{ uri: getImageUrl(item.poster_path) }}
                      style={styles.poster}
                    />
                    <TextTicker
                      style={styles.cardTitle}
                      duration={8000}
                      loop
                      bounce
                      repeatSpacer={50}
                      marqueeDelay={1000}
                    >
                      {item.name}
                    </TextTicker>
                    <Text style={styles.rating}>
                      ⭐ {item.vote_average?.toFixed(1)}
                    </Text>
                  </Pressable>
                )}
              />

              <View style={styles.sectionTitleHeader}>
                <Text style={styles.sectionTitle}>Trending Movies</Text>
                <View style={styles.sectionLine} />
              </View>
              <FlatList
                data={trendingMovies}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingHorizontal: 4, gap: 12 }}
                renderItem={({ item }) => {
                  const rawDate = item.release_date || item.first_air_date;
                  const isUnreleased = rawDate
                    ? new Date(rawDate) > new Date()
                    : false;

                  return (
                    <Pressable
                      disabled={isUnreleased}
                      onPress={() =>
                        navigation.navigate("Title", {
                          id: item.id,
                          type: "movie",
                        })
                      }
                      style={styles.card}
                    >
                      <View>
                        <Image
                          source={{ uri: getImageUrl(item.poster_path) }}
                          style={styles.poster}
                        />
                        {isUnreleased && (
                          <View style={styles.comingSoonOverlay}>
                            <Text style={styles.comingSoonText}>
                              Coming Soon 🔒
                            </Text>
                          </View>
                        )}
                      </View>

                      <TextTicker
                        style={styles.cardTitle}
                        duration={8000}
                        loop
                        bounce
                        repeatSpacer={50}
                        marqueeDelay={1000}
                      >
                        {item.title}
                      </TextTicker>
                      <Text style={styles.rating}>
                        ⭐ {item.vote_average?.toFixed(1)}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 46,
    marginBottom: 16,
  },
  discover: {
    color: "#215ecf",
    fontSize: 26,
    fontFamily: "Bebas",
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  profileIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    color: "#fff",
    padding: 14,
  },
  sectionTitleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 32,
    fontFamily: "Bebas",
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#222",
  },
  item: {
    flexDirection: "row-reverse",
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: "center",
    borderBottomColor: "#222",
    gap: 12,
  },
  searchPoster: {
    width: 46,
    height: 66,
    borderRadius: 6,
    backgroundColor: "#1a1a1a",
  },
  typeBadge: {
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  movieBadge: {
    backgroundColor: "rgba(229,9,20,0.2)",
    color: "#e50914",
  },
  tvBadge: {
    backgroundColor: "rgba(59,130,246,0.2)",
    color: "#3b82f6",
  },
  itemTitle: {
    color: "#fff",
    fontSize: 15,
    textAlign: "left",
    writingDirection: "ltr",
  },

  card: {
    width: "140",
    marginBottom: 20,
  },
  filterCard: {
    width: "48%",
    marginBottom: 20,
  },
  filterPosterWrapper: {
    position: "relative",
  },
  filterPoster: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 10,
    backgroundColor: "#1a1a1a",
  },
  filterCardTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },
  filterCardRating: {
    color: "#888",
    fontSize: 11,
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  poster: {
    width: 140,
    height: 200,
    borderRadius: 10,
  },
  cardTitle: {
    fontWeight: "bold",
    marginTop: 6,
    color: "#fff",
    fontSize: 13,
  },
  rating: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },

  searchRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 3,
    paddingRight: 8,
  },
  filterBtn: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#ac3030",
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: {
    color: "#a51010",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 12,
  },
  errorContainer: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 8,
  },

  errorTitle: {
    color: "#fff",
    fontSize: 18,
  },
  errorSubtitle: {
    color: "#666",
    fontSize: 12,
    fontFamily: "IRANSans",
    textAlign: "center",
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "IRANSans",
  },
  comingSoonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  comingSoonText: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Bebas",
    textAlign: "center",
  },
  recentContainer: {
    marginBottom: 16,
  },
  recetnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recentTitle: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
  },
  recentClear: {
    color: "#e50914",
    fontSize: 12,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  recentIcon: {
    fontSize: 14,
  },
  recentText: {
    color: "#ccc",
    fontSize: 14,
    flex: 1,
  },
  recentRemove: {
    color: "#555",
    fontSize: 18,
    paddingHorizontal: 8,
  },
  posterContainer: {
    position: "relative",
  },
  typeTag: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tvTag: {
    backgroundColor: "rgba(59,130,246,0.85)",
  },
  movieTag: {
    backgroundColor: "rgba(229,9,20,0.85)",
  },
  typeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  filteredSection: {
    marginTop: 8,
  },
  filteredHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  filteredTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Bebas",
  },
  filteredSubtitle: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
  exitFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e50914",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exitFilterText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyFilterState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 8,
  },
  emptyFilterIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyFilterText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyFilterSubtext: {
    color: "#666",
    fontSize: 13,
  },
});
