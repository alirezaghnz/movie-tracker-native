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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DropdownSelect from "../components/DropdownSelect";

const TODAY = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();

const AD_BLOCKS = [
  "*://www.google-analytics.com/*",
  "*://analytics.google.com/*",
  "*://googletagmanager.com/*",
  "*://www.googletagmanager.com/*",
  "*://googletagservices.com/*",
  "*://doubleclick.net/*",
  "*://*.doubleclick.net/*",
  "*://adservice.google.com/*",
  "*://adservice.google.de/*",
  "*://pagead2.googlesyndication.com/*",
  "*://stats.g.doubleclick.net/*",
  "*://yt3.ggpht.com/ytc/*",
  "*://fonts.googleapis.com/*",
  "*://fonts.gstatic.com/*",
  "*://googleapis.com/*",
  "*://gstatic.com/*",
  "*://cdn.adx1.com/*",
  "*://intelligenceadx.com/*",
  "*://adsco.re/*",
  "*://mc.yandex.com/*",
  "*://mc.yandex.ru/*",
  "*://bvtpk.com/*",
  "*://my.rtmark.net/*",
  "*://bvtpk.com/*",
  "*://b7510.com/*",
  "*://gt.unbrownunflat.com/*",
  "*://im.malocacomals.com/*",
  "*://users.videasy.net/*",
  "*://nf.sixmossin.com/*",
  "*://realizationnewestfangs.com/*",
  "*://acscdn.com/*",
  "*://lt.taloseempest.com/*",
  "*://pl26708123.profitableratecpm.com/*",
  "*://preferencenail.com/*",
  "*://protrafficinspector.com/*",
  "*://s10.histats.com/*",
  "*://weirdopt.com/*",
  "*://*.cloudflareinsights.com/*",
  "*://cloudflareinsights.com/*",
  "*://kettledroopingcontinuation.com/*",
  "*://wayfarerorthodox.com/*",
  "*://woxaglasuy.net/*",

  "*://rzjzjnavztycv.online/*",
  "*://tmstr4.cloudnestra.com/*",
  "*://tmstr4.neonhorizonworkshops.com/*",
  "*://hameltnoummos.com/*",
  "*://ancillammmm.com/*",
  "*://*.ancillammmm.com/*",
  "*://hubeamily.com/*",
  "*://*.hubeamily.com/*",
  "*://llvpn.com/*",
  "*://americanacademyofthermology.org/*",
  "*://d2pf0ys5xus6n.cloudfront.net/*",
  "*://gillyspencie.com/*",
  "*://soakysecrets.com/*",
  "*://*.soakysecrets.com/*",
  "*://mdstats.info/*",
  "*://ads-twitter.com/*",
  "*://*.ads-twitter.com/*",
  "*://connatix.com/*",
  "*://*.connatix.com/*",
  "*://imasdk.googleapis.com/*",
  "*://jwpltx.com/*",
  "*://*.jwpltx.com/*",
  "*://datariaarpent.com/*",
  "*://*.datariaarpent.com/*",
];
const INJECTED_JS = `
  window.open = () => null;

  setInterval(() => {
    document.querySelectorAll('iframe:not([src*="embed"]), div[class*="popup"]')
      .forEach(el => el.remove());
  }, 1000);
  true;
`;

export default function PlayerScreen() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
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
  const [sourceId, setSourceId] = useState(PLAYER_SOURCES[0].id);
  const [currentEp, setCurrentEp] = useState(ep);
  const [hasTracked, setHasTracked] = useState(false);

  const url = getSourceUrl(sourceId, type, id, season, currentEp);

  const sourceNames = PLAYER_SOURCES.map((src) => src.name);
  const currentSourceName =
    PLAYER_SOURCES.find((src) => src.id === sourceId)?.name ?? "";

  const handleSourceChange = (name) => {
    const found = PLAYER_SOURCES.find((src) => src.name === name);
    if (found) setSourceId(found.id);
  };

  useEffect(() => {
    if (hasTracked) return;

    const timer = setTimeout(async () => {
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
        release_date,
        first_air_date,
        visitedAt: Date.now(),
      });
      setHasTracked(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [currentEp, sourceId, hasTracked]);

  const handleEpisodePress = (episode) => {
    setCurrentEp(episode.episode_number);
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
          userAgen="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
        />
      </View>
      <View style={styles.sourceBar}>
        <DropdownSelect
          label="Sources"
          value={currentSourceName}
          options={sourceNames}
          onChange={handleSourceChange}
          width={120}
        />
      </View>
      {episodes.length > 0 && (
        <FlatList
          key={currentEp}
          data={episodes}
          keyExtractor={(item) =>
            `${item.id}-${item.episode_number.toString()}`
          }
          contentContainerStyle={[
            styles.episodeList,
            { paddingBottom: insets.bottom + 70 },
          ]}
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
                    Episode {item.episode_number}
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
  episodeList: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
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
    fontFamily: "Bebas",
    marginBottom: 3,
  },
  episodeTitle: {
    color: "#fff",
    fontSize: 13,
  },
  episodeDate: { color: "#555", fontSize: 10, marginTop: 4 },
});
