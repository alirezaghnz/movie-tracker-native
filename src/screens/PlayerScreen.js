import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  FlatList,
  Image,
} from "react-native";
import { useKeepAwake } from "expo-keep-awake";

import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { getSourceUrl, PLAYER_SOURCES } from "../services/api/watch";
import WebView from "react-native-webview";

import { getImageUrl } from "../services/api/tmdb";
import { addToRecentlyWatched } from "../storage/RecentlyStorage";

const TODAY = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();

const AD_BLOCKS = [
  "googlesyndication.com",
  "doubleclick.net",
  "popads.net",
  "exoclick.com",
];
const INJECTED_JS = `
  window.open = () => null;

  setInterval(() => {
    document.querySelectorAll('iframe:not([src*="embed"]), div[class*="popup"]')
      .forEach(el => el.remove());
  }, 1000);

  // when the action play, call the react native 
  const detectPlay = () => {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      if (!video._watchTracked) {
        video._watchTracked = true;
        video.addEventListener('play', () => {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'VIDEO_PLAYING' }));
        });
      }
    });
  };

  
  setInterval(detectPlay, 2000);

  true;
`;

export default function PlayerScreen() {
  useKeepAwake();
  const route = useRoute();
  const {
    id,
    type,
    season,
    ep,
    episodes = [],
    title,
    poster_path,
    first_air_date,
    release_date,
  } = route.params || {};
  const [sourceId, setSourceId] = useState("videasy");
  const [currentEp, setCurrentEp] = useState(ep);
  const [hasTracked, setHasTracked] = useState(false);

  const url = getSourceUrl(sourceId, type, id, season, currentEp);
  const handleEpisodePress = async (episode) => {
    setHasTracked(false); // need to reset for new ep
    setCurrentEp(episode.episode_number);
  };

  useEffect(() => {
    if (type !== "movie") return;

    addToRecentlyWatched({
      id,
      type,
      title,
      poster_path,
      release_date,
      visitedAt: Date.now(),
    });
  }, []);

  const handleWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "VIDEO_PLAYING" && !hasTracked) {
        setHasTracked(true);
        const currentEpisode = episodes.find(
          (e) => e.episode_number === currentEp,
        );
        await addToRecentlyWatched({
          id,
          type,
          season,
          episode_number: currentEp,
          episode_name: currentEpisode?.name ?? "",
          title,
          poster_path,
          first_air_date,
          visitedAt: Date.now(),
        });
      }
    } catch {}
  };

  return (
    <View style={styles.contentContainer} collapsable={false}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.playerWrapper}>
        <WebView
          source={{ uri: url }}
          blockedNavigationUrls={AD_BLOCKS}
          injectedJavaScript={INJECTED_JS}
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          style={{ flex: 1 }}
          onMessage={handleWebViewMessage}
        />
      </View>
      <View style={styles.sourceBar}>
        <Text style={styles.sourceLabel}>Sources:</Text>
        <View style={styles.sourceBtns}>
          {PLAYER_SOURCES.map((src) => (
            <Pressable
              key={src.id}
              onPress={() => setSourceId(src.id)}
              style={[
                styles.sourceBtn,
                sourceId === src.id && styles.sourceBtnActive,
              ]}
            >
              <Text
                style={{
                  color: sourceId === src.id ? "#fff" : "#aaa",
                  fontSize: 13,
                  fontWeight: sourceId === src.id ? "700" : "400",
                }}
              >
                {src.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      {episodes.length > 0 && (
        <FlatList
          key={currentEp}
          data={episodes}
          keyExtractor={(item) =>
            `${item.id}-${item.episode_number.toString()}`
          }
          contentContainerStyle={styles.episodeList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isUnreleased = item.air_date
              ? new Date(item.air_date) > TODAY
              : false;
            const isActive = item.episode_number === currentEp;
            //console.log(episodes[0]);
            //console.log(item.episode_number, item.name, item.still_path);

            return (
              <Pressable
                style={[
                  styles.episodeCard,
                  isActive && styles.episodeCardActive,
                  isUnreleased && styles.episodeCardUnreleased,
                ]}
                onPress={() => {
                  if (isUnreleased) return;
                  handleEpisodePress(item);
                }}
                disabled={isUnreleased}
              >
                <View style={styles.episodeThumbnail}>
                  {item.still_path ? (
                    <Image
                      source={{ uri: getImageUrl(item.still_path, "w300") }}
                      style={styles.episodeImage}
                    />
                  ) : (
                    <View style={styles.episodeImagePlaceholder}>
                      <Text style={{ color: "#555", fontSize: 10 }}>
                        {item.episode_number}
                      </Text>
                    </View>
                  )}

                  {isActive && (
                    <View style={styles.playingOverlay}>
                      <Text style={styles.playingIcon}>▶</Text>
                    </View>
                  )}

                  {isUnreleased && (
                    <View style={styles.lockOverlay}>
                      <Text style={{ color: "#fff", fontSize: 14 }}>🔒</Text>
                    </View>
                  )}
                </View>
                <View style={styles.episodeInfo}>
                  <Text style={styles.episodeNumber}>
                    {" "}
                    قسمت {item.episode_number}
                  </Text>
                  <Text style={styles.episodeTitle}>{item.name}</Text>
                  {item.air_date && (
                    <Text style={styles.episodeDate}>
                      {item.air_date.substring(0, 10)}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: StatusBar.currentHeight + 15,
  },
  playerWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  sourceBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  sourceLabel: {
    color: "#666",
    fontSize: 18,
    marginBottom: 10,
    fontFamily: "Bebas",
  },
  sourceBtns: { flexDirection: "row", gap: 8 },
  sourceBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
  },
  sourceBtnActive: { backgroundColor: "#1a73e8", borderColor: "#1a73e8" },
  episodeList: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 20 },
  episodeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 10,
    overflow: "hidden",
    gap: 10,
    padding: 8,
    marginBottom: 8,
  },
  episodeCardActive: {
    borderWidth: 1.5,
    borderColor: "#c03b42",
    backgroundColor: "#1a0000",
  },
  episodeCardUnreleased: { opacity: 0.4 },
  episodeThumbnail: {
    width: 110,
    height: 65,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#222",
    flexShrink: 0,
  },
  episodeImage: { width: "100%", height: "100%" },
  episodeImagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
  },
  playingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(229,9,20,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  playingIcon: { color: "#fff", fontSize: 20 },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  episodeInfo: { flex: 1 },
  episodeNumber: {
    color: "#e50914",
    fontSize: 11,
    fontFamily: "IRANSans",
    textAlign: "right",
    marginBottom: 3,
  },
  episodeTitle: {
    color: "#fff",
    fontSize: 13,

    fontFamily: "IRANSans",
  },
  episodeDate: { color: "#555", fontSize: 10, marginTop: 4 },
});
