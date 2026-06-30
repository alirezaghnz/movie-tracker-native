import { View, Text, StyleSheet, Pressable, StatusBar } from "react-native";
import { useKeepAwake } from "expo-keep-awake";

import { useRoute } from "@react-navigation/native";
import { useState } from "react";
import { getSourceUrl, PLAYER_SOURCES } from "../services/api/watch";
import WebView from "react-native-webview";
import { SafeAreaView } from "react-native";

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
    true;
`;

export default function PlayerScreen() {
  useKeepAwake();
  const route = useRoute();
  const { id, type, season, ep } = route.params || {};
  const [sourceId, setSourceId] = useState("videasy");

  const url = getSourceUrl(sourceId, type, id, season, ep);

  return (
    <SafeAreaView style={styles.contentContainer}>
      <View style={styles.playerWrapper}>
        <WebView
          key={url}
          source={{ uri: url }}
          blockedNavigationUrls={AD_BLOCKS}
          injectedJavaScript={INJECTED_JS}
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          style={{ flex: 1 }}
        />
      </View>
      <View style={styles.sourceBar}>
        <Text style={styles.sourceLabel}>منبع پخش:</Text>
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
    </SafeAreaView>
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
    fontSize: 11,
    marginBottom: 10,
    textAlign: "right",
  },
  sourceBtns: {
    flexDirection: "row",
    gap: 8,
  },
  sourceBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
  },
  sourceBtnActive: {
    backgroundColor: "#1a73e8",
    borderColor: "#1a73e8",
  },
});
