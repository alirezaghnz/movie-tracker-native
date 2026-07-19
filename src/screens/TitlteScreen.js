import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import DropdownSelect from "../components/DropdownSelect";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { useFavorites } from "../hooks/useFavorites";
import { FavoriteStar } from "../components/FavoriteStar";

import {
  getImageUrl,
  getMovieDetails,
  getTVDetails,
  getTVSeasonsDetails,
} from "../services/api/tmdb";
import ErrorContainer from "../components/ErrorContainer";
import { BackButton } from "../components/BackButton";

const TODAY = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();

export default function TitleScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  // Extracting imdbID and quality from route params (guard if params is null)
  const { id, type } = route.params ?? {};
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(1);
  const [seasonName, setSeasonName] = useState("");
  const [seasonData, setSeasonData] = useState(null);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [expandedOverview, setExpandedOverview] = useState({});
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const fetchDetails = type === "movie" ? getMovieDetails : getTVDetails;
    fetchDetails(id)
      .then((data) => {
        setDetails(data);

        // just for tv series
        if (type === "tv") {
          const firstSeason = data.seasons?.find((s) => s.season_number > 0);
          if (firstSeason) {
            setSeason(firstSeason.season_number);
            setSeasonName(firstSeason.name);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id, type]);

  useEffect(() => {
    if (!id || !season || type !== "tv") return;
    setEpisodeLoading(true);
    getTVSeasonsDetails(id, season)
      .then(setSeasonData)
      .finally(() => setEpisodeLoading(false));
  }, [id, season, type]);

  const handleSeasonChange = (name) => {
    if (!details?.seasons) return;

    const found = details.seasons.find((s) => s.name === name);
    if (found) {
      setSeasonName(found.name);
      setSeason(found.season_number);
    }
  };

  const seasonOptions =
    details?.seasons?.filter((s) => s.season_number > 0).map((s) => s.name) ??
    [];
  /*
  const downloadSeasonWithAdm = async (e) => {
    try {
      for (let i = 0; i < e.length; i++) {
        await IntentLauncher.startActivityAsync("android.intent.action.SEND", {
          type: "text/plain",
          extra: {
            "android.intent.extra.TEXT": e[i].downloadUrl,
          },
          packageName: "com.dv.adm",
        });
        await new Promise((res) => setTimeout(res, 800));
      }
      Alert.alert("Added to ADM queue");
    } catch (err) {
      Alert.alert("ADM not installed");
    }
  };
*/
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.posterSkeleton} />

        <View style={styles.content}>
          <View style={styles.titleSkeleton} />
          <View style={styles.metaSkeleton} />

          <View style={styles.overviewSkeleton} />
          <View style={styles.overviewSkeleton} />
          <View style={styles.overviewSkeletonShort} />

          <View style={styles.dropdownSkeleton} />

          <View style={styles.episodeSkeleton} />
          <View style={styles.episodeSkeleton} />
          <View style={styles.episodeSkeleton} />
        </View>
      </View>
    );
  }
  if (!details) return <ErrorContainer />;

  return (
    <View style={styles.container}>
      {/*
      <View style={{ alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => downloadSeasonWithAdm(watchData?.episodes)}
        >
          <Text
            style={{
              color: "#ffffff",
              padding: 12,
              backgroundColor: "#138fe2",
              borderRadius: 12,
              marginBottom: 5,
              fontFamily: "IRANSans",
              fontSize: 12,
            }}
          >
            دانلود کل فصل
          </Text>
        </TouchableOpacity>
      </View>
      */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.posterContainer}>
          <Image
            source={{ uri: getImageUrl(details?.backdrop_path) }}
            style={styles.poster}
          />
          <View style={styles.backButton}>
            <BackButton />
          </View>

          <View style={styles.favoriteButton}>
            <FavoriteStar
              active={isFavorite(details?.id)}
              onPress={() =>
                toggleFavorite({
                  id: details?.id,
                  title: details?.name || details?.title,
                  year: details?.first_air_date || details?.release_date,
                  poster_path: details?.poster_path,
                  type,
                })
              }
            />
          </View>

          <View style={styles.posterOverlay}>
            <View style={styles.genresRow}>
              {details?.genres.map((g, index) => (
                <View key={`${g}-${index}`} style={styles.genreBadge}>
                  <Text style={styles.genreText}>{g.name}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.title}>{details?.name || details?.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.year}>
                {details?.first_air_date || details?.release_date}
              </Text>
              <Text style={styles.detailsRating}>
                <FontAwesome name="star" size={15} color="yellow" />
                {details?.vote_average?.toFixed(1)}
              </Text>
              {details?.number_of_seasons > 0 && (
                <Text style={styles.seasonCount}>
                  {details?.number_of_seasons} Season
                  {details?.number_of_seasons !== 1 ? "s" : ""}
                </Text>
              )}

              {type === "tv" && (
                <Text style={{ color: "#c0c0c0" }}>
                  {details?.number_of_episodes} Episodes
                </Text>
              )}

              <Text
                style={{
                  color: "#fff",
                  fontSize: 10,
                  backgroundColor: "green",
                  padding: 2,
                  borderRadius: 6,
                }}
              >
                {details?.status}
              </Text>
            </View>
          </View>
        </View>
        {!!details?.overview && (
          <Text style={styles.plot}>{details?.overview}</Text>
        )}

        {type === "movie" && (
          <Pressable
            style={styles.movieWatchBtn}
            onPress={() => navigation.navigate("Player", { id, type: "movie" })}
          >
            <Text style={styles.watchText}>Watch Movie</Text>
          </Pressable>
        )}

        {type === "tv" && (
          <View style={{ zIndex: 100, paddingHorizontal: 16, marginBottom: 8 }}>
            <DropdownSelect
              label="Select Season"
              value={seasonName}
              options={seasonOptions}
              onChange={handleSeasonChange}
            />
            {episodeLoading && (
              <ActivityIndicator style={{ marginVertical: 10 }} />
            )}
            {seasonData?.episodes?.map((item) => {
              const isUnreleased = item.air_date
                ? new Date(item.air_date) > TODAY
                : false;
              return (
                <View
                  key={`${id}-${season}-${item.episode_number}`}
                  style={[
                    styles.episodeCard,
                    { marginHorizontal: 16 },
                    isUnreleased && styles.episodeCardUnreleased,
                  ]}
                >
                  <View>
                    {item.still_path ? (
                      <Image
                        style={styles.episodeImage}
                        source={{ uri: getImageUrl(item.still_path, "w500") }}
                      />
                    ) : (
                      <View style={styles.episodeImagePlaceholder} />
                    )}
                    {isUnreleased && (
                      <View style={styles.lockOverlay}>
                        <FontAwesome name="lock" size={28} color="#fff" />
                        <Text style={styles.lockDate}>{item.air_date}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.episodeInfo}>
                    <Text style={styles.episdoeNumber}>
                      Episode {item.episode_number}
                    </Text>
                    <Text style={styles.episodeTitle} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {!!item.overview && (
                      <Text
                        style={styles.episodeOverview}
                        numberOfLines={
                          expandedOverview[item.episode_number] ? undefined : 2
                        }
                        onPress={() =>
                          setExpandedOverview((prev) => ({
                            ...prev,
                            [item.episode_number]: !prev[item.episode_number],
                          }))
                        }
                      >
                        {item.overview}
                      </Text>
                    )}
                  </View>

                  <Pressable
                    style={[
                      styles.watchBtn,
                      isUnreleased && styles.watchBtnDisabled,
                    ]}
                    onPress={() => {
                      if (isUnreleased) return;
                      navigation.navigate("Player", {
                        id,
                        type: "tv",
                        season,
                        ep: item.episode_number,
                        episodes: seasonData?.episodes ?? [],
                      });
                    }}
                    disabled={isUnreleased}
                  >
                    <Text style={styles.watchText}>
                      {" "}
                      {isUnreleased ? " Not Released 🔒" : "Watch ▶"}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 10,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 8,
  },
  favoriteButton: {
    position: "absolute",
    top: 40,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 999,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 10,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 999,
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  posterContainer: {
    width: "100%",
    height: 260,
    overflow: "hidden",
  },
  posterOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  episodeCardUnreleased: {
    opacity: 0.5,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  lockDate: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "IRANSans",
  },
  metaRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
    alignItems: "center",
  },
  year: {
    backgroundColor: "#666",
    color: "#fff",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
    overflow: "hidden",
  },
  detailsRating: {
    color: "yellow",
  },
  seasonCount: {
    color: "#c0c0c0",
  },
  genresRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
  },
  qualityText: {
    color: "#fff",
    fontSize: 14,
    marginVertical: 2,
    backgroundColor: "rgba(229, 9, 20, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },

  genreBadge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 6,
    marginBottom: 6,
  },

  genreText: {
    color: "#fff",
    fontSize: 12,
  },

  section: {
    marginBottom: 1,
  },

  episodeCard: {
    backgroundColor: "#222222",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 16,
  },
  episodeImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#1a1a1a",
  },
  episodeImagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  episodeInfo: {
    padding: 12,
  },

  episdoeNumber: {
    color: "#e50914",
    fontSize: 12,
    fontFamily: "Bebas",
    marginBottom: 4,
  },
  episodeTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "IRANSans",

    marginBottom: 6,
  },
  episodeOverview: {
    color: "#888",
    fontSize: 12,
    fontFamily: "IRANSans",
    lineHeight: 20,
  },

  watchBtn: {
    backgroundColor: "#e50914",
    paddingVertical: 10,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  watchBtnDisabled: {
    backgroundColor: "#333",
  },
  watchText: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Bebas",
  },

  downloadBtn: {
    borderWidth: 1,
    borderColor: "#444",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
  },

  downloadText: {
    color: "#ccc",
    fontSize: 13,
    fontFamily: "IRANSans",
  },
  loadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  plot: {
    color: "#aaa",
    marginTop: 5,
    lineHeight: 20,
    padding: 10,
  },
  country: {
    color: "#777",
    marginTop: 6,
    fontSize: 12,
    padding: 10,
  },
  fav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  posterSkeleton: {
    height: 350,
    backgroundColor: "#181818",
  },

  content: {
    padding: 16,
  },

  titleSkeleton: {
    width: "60%",
    height: 30,
    backgroundColor: "#222",
    borderRadius: 8,
    marginBottom: 12,
  },

  metaSkeleton: {
    width: "40%",
    height: 16,
    backgroundColor: "#222",
    borderRadius: 8,
    marginBottom: 20,
  },

  overviewSkeleton: {
    width: "100%",
    height: 14,
    backgroundColor: "#222",
    borderRadius: 8,
    marginBottom: 8,
  },

  overviewSkeletonShort: {
    width: "70%",
    height: 14,
    backgroundColor: "#222",
    borderRadius: 8,
    marginBottom: 24,
  },
  episodeSkeleton: {
    height: 280,
    backgroundColor: "#222",
    borderRadius: 10,
    marginBottom: 16,
  },
  dropdownSkeleton: {
    height: 52,
    backgroundColor: "#222",
    borderRadius: 12,
    marginBottom: 20,
  },
  movieWatchBtn: {
    backgroundColor: "#e50914",
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
});
