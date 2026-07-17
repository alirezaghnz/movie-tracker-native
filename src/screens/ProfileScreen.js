import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { BackButton } from "../components/BackButton";
import { UpdateChecker } from "../components/UpdateChecker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function ProfileScreen() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  const maskToken = (token) => {
    if (!token) return "";

    return `${token.slice(0, 8)}********${token.slice(-6)}`;
  };

  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync("tmdb_token");
        setToken(savedToken || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  return (
    <View style={styles.container}>
      {/**    <View style={{ top: 40, left: 10 }}>
        <BackButton />
      </View> **/}

      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}> TMDB Token</Text>

        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <TextInput
            value={maskToken(token)}
            editable={false}
            selectTextOnFocus={false}
            style={styles.input}
          />
        )}

        <Text style={styles.helper}>
          This token is securely stored on your device.
        </Text>
      </View>

      <View style={styles.updateContainer}>
        <View style={styles.updateHeader}>
          <MaterialIcons name="update" size={22} color="white" />
          <Text style={styles.updateLabel}>App Updates</Text>
        </View>
        <Text style={styles.updateSubLabel}>
          Stay up to date with the latest release.
        </Text>
        <UpdateChecker />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    padding: 20,
  },
  title: {
    color: "#FFF",
    fontSize: 40,
    marginTop: 50,
    marginBottom: 24,
    fontFamily: "Bebas",
  },
  card: {
    backgroundColor: "#161616",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#242424",
  },
  label: {
    color: "#AAA",
    fontSize: 15,
    fontFamily: "IRANSans",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#1F1F1F",
    color: "#FFF",
    borderRadius: 12,
    padding: 12,
    minHeight: 40,
    textAlign: "right",
    writingDirection: "rtl",
  },
  helper: {
    color: "#777",
    fontSize: 12,
    marginTop: 10,
    lineHeight: 20,
  },
  updateContainer: {
    padding: 18,
    backgroundColor: "#161616",
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#242424",
  },
  updateHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  updateLabel: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  updateSubLabel: {
    color: "#666",
    fontSize: 11,
    fontFamily: "IRANSans",
    marginBottom: 4,
  },
});
