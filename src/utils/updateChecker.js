import Constants from "expo-constants";
export const GITHUB_REPO = "alirezaghnz/movie-tracker-native";

export function getCurrentVersion() {
  return Constants.expoConfig?.version ?? "0.0.0";
}

export async function checkForUpdate() {
  try {
    const currentVersion = getCurrentVersion();

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
    );

    if (!res.ok) {
      return { hasUpdate: false, error: "fetch_failed" };
    }

    const data = await res.json();
    const latestVersion = data.tag_name.replace(/^v/, ""); // "v1.0.2" → "1.0.2"
    const hasUpdate = latestVersion !== currentVersion;

    const apkAsset = data.assets?.find((a) => a.name.endsWith(".apk"));

    return {
      hasUpdate,
      currentVersion,
      latestVersion,
      downloadUrl: apkAsset?.browser_download_url ?? null,
      releaseNotes: data.body ?? "",
    };
  } catch (err) {
    return { hasUpdate: false, error: "network_error" };
  }
}
