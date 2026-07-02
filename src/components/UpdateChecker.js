import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useAlert } from "../components/Customalert";
import { checkForUpdate, getCurrentVersion } from "../utils/updateChecker";
import { useState, version } from "react";

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
      showAlert({ title: "خطا", body: "بررسی آپدیت ممکن نشد", type: "error" });
      return;
    }

    if (!result.hasUpdate) {
      showAlert({
        title: "اپ به‌روزه ✓",
        body: `نسخه فعلی: ${result.currentVersion}`,
        type: "success",
      });
      return;
    }

    showAlert({
      title: `نسخه ${result.latestVersion} موجوده!`,
      body: "در حال باز کردن صفحه دانلود...",
      type: "info",
    });

    if (result.downloadUrl) {
      Linking.openURL(result.downloadUrl);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.versionRow}>
        <Text style={styles.versionLabel}>نسخه فعلی</Text>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>v{currentVersion}</Text>
        </View>
      </View>
      {lastResult && !lastResult.error && (
        <View style={styles.resultRow}>
          <Text style={styles.resultText}>
            {lastResult.hasUpdate
              ? `نسخه ${lastResult.latestVersion} موجود است`
              : "آخرین نسخه نصب شده است ✓"}
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
          {checking ? "در حال بررسی..." : "بررسی آپدیت"}
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
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  versionLabel: {
    color: "#888",
    fontSize: 12,
    fontFamily: "IRANSans",
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
    fontFamily: "IRANSans",
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
    fontFamily: "IRANSans",
    fontWeight: 600,
  },
});
