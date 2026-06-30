import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import DropdownSelect from "../components/DropdownSelect";

import { useFavorites } from "../hooks/useFavorites";
import { FavoriteStar } from "../components/FavoriteStar";

import { getTVDetails, getTVSeasonsDetails } from "../services/api/tmdb";
import ErrorContainer from "../components/ErrorContainer";

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
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    getTVDetails(id, type)
      .then((data) => {
        setDetails(data);

        const firstSeason = data.seasons?.find((s) => s.season_number > 0);
        if (firstSeason) {
          setSeason(firstSeason.season_number);
          setSeasonName(firstSeason.name);
        }
      })
      .finally(() => setLoading(false));
  }, [id, type]);

  useEffect(() => {
    if (!id || !season) return;
    setEpisodeLoading(true);
    getTVSeasonsDetails(id, season)
      .then(setSeasonData)
      .finally(() => setEpisodeLoading(false));
  }, [id, season]);

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

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!details) return <ErrorContainer />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.fav}>
          <Text style={styles.title}>{details?.name}</Text>
          <FavoriteStar
            active={isFavorite(details?.id)}
            onPress={() =>
              toggleFavorite({
                id: details?.id,
                title: details?.name,
                year: details?.first_air_date,
              })
            }
          />
        </View>

        <Text style={styles.year}>{details?.first_air_date}</Text>
        <View style={styles.genresRow}>
          {details?.genres.map((g, index) => (
            <View key={`${g}-${index}`} style={styles.genreBadge}>
              <Text style={styles.genreText}>{g.name}</Text>
            </View>
          ))}
        </View>

        {!!details?.overview && (
          <Text style={styles.plot}>{details?.overview}</Text>
        )}
        {!!details?.origin_country && (
          <Text style={styles.country}>{details?.origin_country}</Text>
        )}
      </View>

      <View style={styles.section}>
        <DropdownSelect
          label="انتخاب فصل"
          value={seasonName}
          options={seasonOptions}
          onChange={handleSeasonChange}
        />
      </View>
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

      {episodeLoading && <ActivityIndicator style={{ marginVertical: 10 }} />}
      <FlatList
        data={seasonData?.episodes}
        keyExtractor={(item) => `${id}-${season}-${item.episode_number}`}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.episodeCard}>
            <View style={styles.episodeInfo}>
              <Text style={styles.episodeText}>
                قسمت {item.episode_number} - {item.name}
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={styles.watchBtn}
                onPress={() =>
                  navigation.navigate("Player", {
                    id,
                    type: "tv",
                    season,
                    ep: item.episode_number,
                  })
                }
              >
                <Text style={styles.watchText}> پخش ▶</Text>
              </Pressable>

              {/*
              <Pressable
                style={styles.downloadBtn}
                onPress={() => downloadWithAdm(item.streamUrl)}
              >
                <Text style={styles.downloadText}>⬇ دانلود</Text>
              </Pressable>
              */}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 40,
    marginBottom: 20,
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
  },

  year: {
    color: "#880000",
    fontSize: 14,
    marginTop: 4,
    backgroundColor: "#fbff00",
    borderRadius: 8,
    padding: 4,
    width: 80,
  },

  genresRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    marginTop: 10,
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
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 6,
    marginBottom: 6,
  },

  genreText: {
    color: "#ccc",
    fontSize: 11,
  },

  section: {
    marginBottom: 1,
  },

  episodeCard: {
    backgroundColor: "#111",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  episodeInfo: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  episodeText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "IRANSans",
  },

  actions: {
    flexDirection: "row-reverse",
  },

  watchBtn: {
    backgroundColor: "#e50914",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginLeft: 10,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  watchText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "IRANSans",
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
    marginTop: 10,
    lineHeight: 20,
  },
  country: {
    color: "#777",
    marginTop: 6,
    fontSize: 12,
  },
  fav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
});
