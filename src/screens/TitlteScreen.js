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
import { getTitleDetails } from "../services/api/title";
import { getWatchData } from "../services/api/watch";
import ErrorContainer from "../components/ErrorContainer";
import DropdownSelect from "../components/DropdownSelect";
import { getTitleMeta } from "../services/api/titleMeta";

export default function TitleScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  // Extracting imdbID and quality from route params (guard if params is null)
  const { imdbID, quality } = route.params || {};

  const [title, setTitle] = useState(null);
  const [meta, setMeta] = useState(null);
  const [episodes, setEpisodes] = useState([]);

  const [season, setSeason] = useState("S01");
  const [selectedQuality] = useState(quality);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!imdbID) return;
    // meta data => country , plot, totalSeasons
    (async () => {
      try {
        const data = await getTitleMeta(imdbID);
        setMeta(data);
      } catch {
        console.warn("Meta not available");
      }
    })();
  }, [imdbID]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch title details and watch data in parallel
      const t = await getTitleDetails(imdbID);
      const w = await getWatchData(imdbID, season, selectedQuality);
      setTitle(t);
      setEpisodes(w.episodes || []);
    } catch (err) {
      setError(err.message || "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!imdbID || !quality) return;
    load();
  }, [imdbID, season, selectedQuality]);

  // Generate season options based on meta data api
  const seasons = meta?.totalSeasons
    ? Array.from(
        { length: meta.totalSeasons },
        (_, i) => `S${String(i + 1).padStart(2, "0")}`,
      )
    : ["S01"];

  if (error) {
    return (
      <ErrorContainer
        message={error}
        onRetry={load}
        onBack={() => navigation.goBack()}
      />
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title?.title}</Text>
        <Text style={styles.year}>{title?.year}</Text>

        <View style={styles.genresRow}>
          {title?.genres.map((g, index) => (
            <View key={index} style={styles.genreBadge}>
              <Text style={styles.genreText}>{g}</Text>
            </View>
          ))}
        </View>

        {!!meta?.plot && <Text style={styles.plot}>{meta?.plot}</Text>}
        {!!meta?.country && <Text style={styles.country}>{meta?.country}</Text>}
      </View>

      <View style={styles.section}>
        <DropdownSelect
          label="انتخاب فصل"
          value={season}
          options={seasons}
          onChange={setSeason}
        />
      </View>

      {loading && (
        <View style={styles.loadOverlay}>
          <ActivityIndicator size="large" color="#e50914" />
        </View>
      )}

      <FlatList
        data={episodes}
        keyExtractor={(item, index) => item?.episode ?? String(index)}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.episodeCard}>
            <View style={styles.episodeInfo}>
              <Text style={styles.episodeText}>
                قسمت {item.episode ? item.episode.replace("E", "") : "?"}
              </Text>
              <Text style={styles.qualityText}>{selectedQuality}</Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={styles.watchBtn}
                onPress={() =>
                  navigation.navigate("Player", {
                    streamUrl: item.streamUrl,
                    downloadUrl: item.downloadUrl,
                    title: title?.title,
                    year: title?.year,
                    season,
                    episode: item.episode,
                  })
                }
              >
                <Text style={styles.watchText}> پخش ▶</Text>
              </Pressable>

              <Pressable
                style={styles.downloadBtn}
                onPress={() => console.log(item.downloadUrl)}
              >
                <Text style={styles.downloadText}>⬇ دانلود</Text>
              </Pressable>
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
    width: 40,
  },

  genresRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    marginTop: 10,
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
    marginBottom: 16,
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
  },

  qualityText: {
    color: "#aaa",
    fontSize: 12,
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
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
  },

  watchText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
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
});
