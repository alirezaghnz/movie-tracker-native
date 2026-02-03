import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Video } from "expo-av";
import { DEMO_VIDEO } from "../data/demoVideo";

export default function PlayerScreen() {
  return (
    <View style={styles.container}>
      <Video
        style={styles.video}
        source={{ uri: DEMO_VIDEO.streamUrl }}
        useNativeControls
        resizeMode="contain"
        shouldPlay
      />

      <View style={styles.info}>
        <Text style={styles.title}>{DEMO_VIDEO.title}</Text>
        <Text style={styles.year}>{DEMO_VIDEO.year}</Text>

        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={() => Linking.openURL(DEMO_VIDEO.downloadUrl)}
        >
          <Text style={styles.downloadText}>⬇ Download Movie</Text>
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
    height: 240,
    backgroundColor: "#000",
  },
  info: {
    padding: 16,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  year: {
    color: "#aaa",
    marginTop: 4,
  },
  downloadBtn: {
    marginTop: 20,
    backgroundColor: "#1db954",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  downloadText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});
