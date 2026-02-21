import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as IntentLauncher from "expo-intent-launcher";
import ErrorContainer from "../components/ErrorContainer";
import DropdownSelect from "../components/DropdownSelect";
import { useTitleMeta } from "../hooks/useTitleMeta";
import { useTitleDetails } from "../hooks/useTitleDetails";
import { useWatchData } from "../hooks/useWatchData";
import { useFavorites } from "../hooks/useFavorites";
import { FavoriteStar } from "../components/FavoriteStar";

export default function TitleScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  // Extracting imdbID and quality from route params (guard if params is null)
  const { imdbID, quality = "720" } = route.params ?? {};
  const [season, setSeason] = useState("S01");
  const { isFavorite, toggleFavorite } = useFavorites();

  //fetch with react query
  const {
    data: title,
    isPending: titleLoading,
    error: titleError,
    refetch: refetchTitle,
  } = useTitleDetails(imdbID);

  const {
    data: meta,
    isPending: metaLoading,
    error: metaError,
  } = useTitleMeta(imdbID);

  const {
    data: watchData,
    isPending: watchLoading,
    error: watchError,
    refetch: refetchWatch,
  } = useWatchData(imdbID, season, quality);

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

  const loading = titleLoading || metaLoading || (watchLoading && quality);
  const error = titleError || metaError || (watchError && quality);

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
        onRetry={() => {
          refetchTitle();
          refetchWatch();
        }}
        onBack={() => navigation.goBack()}
      />
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.fav}>
          <Text style={styles.title}>{title?.title}</Text>
          <FavoriteStar
            active={isFavorite(title?.imdbID)}
            onPress={() =>
              toggleFavorite({ imdbID: title?.imdbID, title: title?.title })
            }
          />
        </View>

        <Text style={styles.year}>{title?.year}</Text>

        <View style={styles.genresRow}>
          {title?.genres.map((g, index) => (
            <View key={`${g}-${index}`} style={styles.genreBadge}>
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
            }}
          >
            دانلود کل فصل
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadOverlay}>
          <ActivityIndicator size="large" color="#e50914" />

          {/* Show qualities based on the quality value */}
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                color: "#0968e5",
                marginBottom: 5,
                fontWeight: "bold",
                fontSize: 22,
              }}
            >
              در حال گشتن بین کیفیت های موجود:
            </Text>
            {quality === "480" ? (
              <View>
                <Text style={styles.qualityText}>480p.BluRay</Text>
                <Text style={styles.qualityText}>480p.Web-DL</Text>
              </View>
            ) : quality === "720" ? (
              <View>
                <Text style={styles.qualityText}>720p.x265.10bit.BluRay</Text>
                <Text style={styles.qualityText}>720p.BluRay</Text>
                <Text style={styles.qualityText}>720p.x265.BluRay</Text>
                <Text style={styles.qualityText}>720p.Web-DL</Text>
                <Text style={styles.qualityText}>720p.x265.10bit.Web-DL</Text>
              </View>
            ) : quality === "1080" ? (
              <View>
                <Text style={styles.qualityText}>1080p.BluRay</Text>
                <Text style={styles.qualityText}>1080p.x265.10bit.BluRay</Text>
                <Text style={styles.qualityText}>1080p.Web-DL</Text>
                <Text style={styles.qualityText}>1080p.x265.10bit.Web-DL</Text>
              </View>
            ) : null}
          </View>
        </View>
      )}

      <FlatList
        data={watchData?.episodes}
        keyExtractor={(item) => `${imdbID}-${season}-${item?.episode}`}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.episodeCard}>
            <View style={styles.episodeInfo}>
              <Text style={styles.episodeText}>
                قسمت {item.episode ? item.episode.replace("E", "") : "?"}
              </Text>
              <Text style={styles.qualityText}>{quality}</Text>
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
                    // subtitles: item.subtitles,
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
  fav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
});
