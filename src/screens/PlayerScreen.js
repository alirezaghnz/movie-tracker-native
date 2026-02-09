import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Video } from "expo-av";
import { useRoute } from "@react-navigation/native";
import { useRef, useState } from "react";

export default function PlayerScreen() {
  const route = useRoute();
  const { streamUrl, downloadUrl, title: navTitle, year, episode, season } = route.params || {};
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: streamUrl }}
        useNativeControls
        resizeMode="contain"
        shouldPlay
        onLoad={() => setLoading(false)}
        onError={(e) => console.log("Video erro", e)}
      />

      <View style={styles.info}>
        <Text style={styles.title}>{navTitle ?? ""}</Text>
        <Text style={styles.sub}>
          {year} | {season} {episode}
        </Text>

        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={() => Linking.openURL(downloadUrl)}
        >
          <Text style={styles.downloadText}>⬇ دانلود اپیزود</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "55%",
    backgroundColor: "#000",
  },
  info: {
    padding: 16,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "right",
  },
  sub: {
    color: "#aaa",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "right",
  },
  downloadBtn: {
    backgroundColor: "#1db954",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  downloadText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
