import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAlert } from "../components/Customalert";
import { checkForUpdate, getCurrentVersion } from "../utils/updateChecker";
import { useState } from "react";
import { fp, wp } from "../utils/responsive";
import UpdateModal from "./UpdateModal";

export function UpdateChecker() {
  const { showAlert } = useAlert();
  const [checking, setChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const currentVersion = getCurrentVersion();

  const handleCheck = async () => {
    setChecking(true);
    const result = await checkForUpdate();
    setChecking(false);

    if (result.error) {
      showAlert({
        title: "Error",
        body: "Unable to check for updates",
        type: "error",
      });
      return;
    }

    if (!result.hasUpdate) {
      showAlert({
        title: "You're Up to Date ✓",
        body: `Current Version: ${result.currentVersion}`,
        type: "success",
      });
      return;
    }

    /* showAlert({
      title: `Version ${result.latestVersion} Available!`,
      body: "Opening download page...",
      type: "info",
    });

    if (result.downloadUrl) {
      Linking.openURL(result.downloadUrl);
    }
      */

    setUpdateInfo(result);
    setShowModal(true);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.versionRow}>
        <Text style={styles.versionLabel}>Current Version</Text>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>v{currentVersion}</Text>
        </View>
      </View>

      <Pressable
        onPress={handleCheck}
        disabled={checking}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          checking && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.buttonText}>
          {checking ? "Checking..." : "Check for Updates"}
        </Text>
      </Pressable>
      {updateInfo && (
        <UpdateModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          currentVersion={updateInfo.currentVersion}
          latestVersion={updateInfo.latestVersion}
          releaseNotes={updateInfo.releaseNotes}
          downloadUrl={updateInfo.downloadUrl}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 14,
    gap: 10,
  },
  versionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  versionLabel: {
    color: "#888",
    fontSize: fp(12),
    fontWeight: "600",
  },
  versionBadge: {
    backgroundColor: "#244224",
    paddingHorizontal: wp(12),
    paddingVertical: wp(4),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  versionText: {
    color: "#aaa",
    fontSize: fp(12),
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#d42929",
    paddingVertical: wp(12),
    paddingHorizontal: wp(20),
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
  },
  buttonPressed: {
    backgroundColor: "#b52222",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: fp(14),
    fontWeight: 600,
  },
});
