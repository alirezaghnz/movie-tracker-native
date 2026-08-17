import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ChangelogRender from "./ChangelogRender";
import { fp, wp } from "../utils/responsive";

export default function UpdateModal({
  visible,
  onClose,
  latestVersion,
  currentVersion,
  releaseNotes,
  downloadUrl,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerIcon}>🎉</Text>
            <Text style={styles.title}>New Version Available</Text>
            <Text style={styles.versionRow}>
              v{currentVersion} → v{latestVersion}
            </Text>
          </View>
          <ScrollView
            style={styles.notesContainer}
            showsVerticalScrollIndicator={false}
          >
            <ChangelogRender text={releaseNotes} />
          </ScrollView>

          <View style={styles.actions}>
            <Pressable style={styles.laterBtn} onPress={onClose}>
              <Text style={styles.laterText}>Later</Text>
            </Pressable>
            <Pressable
              style={styles.downloadBtn}
              onPress={() => {
                Linking.openURL(downloadUrl);
                onClose();
              }}
            >
              <Text style={styles.downloadText}>Download</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: wp(20),
  },
  card: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "75%",
    backgroundColor: "#141414",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#242424",
    overflow: "hidden",
  },
  header: {
    padding: wp(20),
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#242424",
  },
  headerIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  title: {
    color: "#fff",
    fontSize: fp(18),
    fontWeight: "700",
    marginBottom: 4,
  },
  versionRow: {
    color: "#888",
    fontSize: fp(13),
  },
  notesContainer: {
    paddingHorizontal: wp(20),
    paddingVertical: wp(12),
    maxHeight: 300,
  },
  actions: {
    flexDirection: "row",
    padding: wp(16),
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#242424",
  },
  laterBtn: {
    flex: 1,
    paddingVertical: wp(12),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
  },
  laterText: {
    color: "#888",
    fontSize: fp(14),
    fontWeight: "600",
  },
  downloadBtn: {
    flex: 1,
    paddingVertical: wp(12),
    borderRadius: 12,
    backgroundColor: "#e50914",
    alignItems: "center",
  },
  downloadText: {
    color: "#fff",
    fontSize: fp(14),
    fontWeight: "700",
  },
});
