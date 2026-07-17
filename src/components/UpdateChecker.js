import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useAlert } from "../components/Customalert";
import { checkForUpdate, getCurrentVersion } from "../utils/updateChecker";
import { useState } from "react";

export function UpdateChecker() {
  const { showAlert } = useAlert();
  const [checking, setChecking] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const currentVersion = getCurrentVersion();
  const handleCheck = async () => {
    setChecking(true);
    const result = await checkForUpdate();
    setChecking(false);
    setLastResult(result);

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

    showAlert({
      title: `Version ${result.latestVersion} Available!`,
      body: "Opening download page...",
      type: "info",
    });

    if (result.downloadUrl) {
      Linking.openURL(result.downloadUrl);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.versionRow}>
        <Text style={styles.versionLabel}>Current Version</Text>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>v{currentVersion}</Text>
        </View>
      </View>
      {lastResult && !lastResult.error && (
        <View style={styles.resultRow}>
          <Text style={styles.resultText}>
            {lastResult.hasUpdate
              ? `Version (v${lastResult.latestVersion}) is available`
              : "Latest version installed ✓"}
          </Text>
        </View>
      )}
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  versionLabel: {
    color: "#888",
    fontSize: 12,
  },
  versionBadge: {
    backgroundColor: "#244224",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  versionText: {
    color: "#aaa",
    fontSize: 12,
    fontFamily: "IRANSans",
  },
  resultRow: {
    alignItems: "flex-end",
  },
  resultText: {
    color: "#666",
    fontSize: 11,
  },
  button: {
    backgroundColor: "#d42929",
    paddingVertical: 12,
    paddingHorizontal: 20,
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
    fontSize: 14,
    fontWeight: 600,
  },
});
