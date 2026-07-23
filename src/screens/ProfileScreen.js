import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { UpdateChecker } from "../components/UpdateChecker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { useAlert } from "../components/Customalert";
import { secureStorage } from "../storage/secureStorageTMDB";

export default function ProfileScreen() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

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

  const handleReset = () => {
    Alert.alert(
      "Reset App data",
      "This will clear your watch history, favorites, and cached data. Your TMDB token will be kept.\n\nAre you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              // tmdb token need to be kept
              const token = await secureStorage.get("tmdb_token");
              await AsyncStorage.clear();
              if (token) {
                await SecureStore.setItemAsync("tmdb_token", token);
              }
              // queryClient.clear();

              showAlert({
                title: "App Reset",
                body: "All data cleared successfully",
                type: "success",
              });
            } catch (err) {
              console.log(err);
              showAlert({
                title: "Error",
                body: "Something went wrong",
                type: "error",
              });
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/**    <View style={{ top: 40, left: 10 }}>
        <BackButton />
      </View> **/}

      <Text style={styles.title}>Profile</Text>
      <View
        style={{
          borderWidth: 1,
          borderRadius: 20,
          padding: 10,
          backgroundColor: "#2e2525",
          gap: 9,
        }}
      >
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

        <View style={styles.card}>
          <View style={styles.HeaderCard}>
            <Text style={styles.updateLabel}>App Updates</Text>
            <MaterialIcons name="update" size={22} color="white" />
          </View>
          <Text style={styles.updateSubLabel}>
            Stay up to date with the latest release.
          </Text>
          <UpdateChecker />
        </View>
        <View style={styles.card}>
          <View style={styles.HeaderCard}>
            <View style={{ gap: 2 }}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                Need help or found a bug?
              </Text>
              <Text style={{ color: "#666", fontSize: 10 }}>
                Open an issue or browse the README on GitHub
              </Text>
            </View>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#333",
                borderRadius: 6,
                paddingVertical: 4,
                paddingHorizontal: 8,
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11 }}>Github</Text>
              <AntDesign name="github" size={11} color="white" />
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "600" }}>
            App Data
          </Text>
          <Text style={styles.helper}>
            Clear Watch history, favorites, and catched data
          </Text>
          <Pressable style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetText}>Reset App Data</Text>
          </Pressable>
        </View>
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
  },
  helper: {
    color: "#777",
    fontSize: 12,
    marginTop: 10,
    lineHeight: 20,
  },

  HeaderCard: {
    flexDirection: "row",
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
    marginBottom: 4,
  },
  resetBtn: {
    marginTop: 12,
    backgroundColor: "#1a1a1a",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3a1a1a",
    alignItems: "center",
  },
  resetText: {
    color: "#e50914",
    fontSize: 16,
    fontFamily: "Bebas",
  },
});
