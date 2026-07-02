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
      <View style={{ top: 40, left: 10 }}>
        <BackButton />
      </View>

      <Text style={styles.title}>پروفایل</Text>

      <View style={styles.card}>
        <Text style={styles.label}>توکن TMDB </Text>

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
          این توکن به صورت امن روی دستگاه شما ذخیره شده است.
        </Text>
      </View>

      <View style={styles.updateContainer}>
        <View style={styles.updateHeader}>
          <Text style={styles.updateLabel}>آپدیت برنامه</Text>

          <MaterialIcons name="update" size={22} color="white" />
        </View>
        <Text style={styles.updateSubLabel}>
          برای بررسی وجود نسخه جدید دکمه زیر را بزنید
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
    fontSize: 28,
    fontWeight: "700",
    marginTop: 50,
    marginBottom: 24,
    textAlign: "right",
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
    fontSize: 13,
    fontFamily: "IRANSans",
    marginBottom: 10,
    textAlign: "right",
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
    fontSize: 9,
    fontFamily: "IRANSans",
    marginTop: 10,
    textAlign: "right",
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
    textAlign: "right",
    color: "#fff",
    fontFamily: "IRANSans",
    fontSize: 14,
    fontWeight: "600",
  },

  updateSubLabel: {
    color: "#666",
    fontSize: 11,
    fontFamily: "IRANSans",
    textAlign: "right",
    marginBottom: 4,
  },
});
