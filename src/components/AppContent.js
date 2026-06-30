import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { useAlert } from "./Customalert";
import { secureStorage, STORAGE_KEYS } from "../storage/secureStorageTMDB";
import {
  setAuthErrorHandler,
  setUnreachableHandler,
} from "../services/api/tmdb";
import { errorMessage, validateToken } from "../utils/validateTokenTMDB";
import MainNavigator from "../navigation";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 10, // 10min
      cacheTime: 1000 * 60 * 30,
    },
  },
});

export default function AppContent() {
  const { showAlert } = useAlert();
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkingInitial, setCheckingInitial] = useState(true);
  const [navKey, setNavKey] = useState(0);

  useEffect(() => {
    secureStorage.get(STORAGE_KEYS.TMDB_TOKEN).then((token) => {
      if (!token) {
        setShowApiModal(true);
      }
      setCheckingInitial(false);
    });

    setAuthErrorHandler(() => setShowApiModal(true));

    setUnreachableHandler(() => {
      const { title, body } = errorMessage("unreachable");
      showAlert({ title, body, type: "error" });
    });
  }, [showAlert]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      showAlert({
        title: "توکن خالی است",
        body: "لطفاً توکن را وارد کنید",
        type: "error",
      });
      return;
    }
    setChecking(true);
    const result = await validateToken(apiKey.trim());
    setChecking(false);

    if (!result.ok) {
      const { title, body } = errorMessage(result.reason, result.status);
      showAlert({ title, body, type: "error" });
      return;
    }

    await secureStorage.set(STORAGE_KEYS.TMDB_TOKEN, apiKey.trim());
    setApiKey("");
    setShowApiModal(false);
    showAlert({
      title: "توکن ذخیره شد",
      body: "اتصال با موفقیت برقرار شد",
      type: "success",
    });
    setNavKey((k) => k + 1);
  };

  if (checkingInitial) {
    return (
      <View
        style={{ flex: 1, backgroundColor: "#000", justifyContent: "center" }}
      >
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer key={navKey}>
            <MainNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </GestureHandlerRootView>
      </QueryClientProvider>

      <Modal visible={showApiModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
        >
          <View
            style={{
              width: "88%",
              backgroundColor: "#fff",
              borderRadius: 16,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View
              style={{
                backgroundColor: "#01b4e4",
                paddingVertical: 16,
                paddingHorizontal: 20,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                🎬 اتصال به TMDB
              </Text>
            </View>

            <View style={{ padding: 20 }}>
              <Text
                style={{
                  textAlign: "right",
                  writingDirection: "rtl",
                  fontSize: 13.5,
                  lineHeight: 26,
                  color: "#444",
                  marginBottom: 6,
                  fontFamily: "IRANSans",
                }}
              >
                برای شروع، توکن{" "}
                <Text style={{ fontWeight: "bold", color: "#01b4e4" }}>
                  رایگان TMDB
                </Text>{" "}
                خود را وارد کنید.
                {"\n"}به{" "}
                <Text
                  style={{
                    color: "#1a73e8",
                    textDecorationLine: "underline",
                    fontWeight: "500",
                  }}
                  onPress={() =>
                    Linking.openURL("https://www.themoviedb.org/settings/api")
                  }
                >
                  themoviedb.org ← تنظیمات ← API
                </Text>{" "}
                بروید و توکن دسترسی خواندن را کپی کنید.
              </Text>

              <Text
                style={{
                  textAlign: "right",
                  writingDirection: "rtl",
                  fontSize: 11.5,
                  fontFamily: "IRANSans",
                  color: "#999",
                  marginBottom: 16,
                }}
              >
                ⚠️ توکن JWT بلند را کپی کنید، نه کلید کوتاه‌تر API
              </Text>

              <TextInput
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="توکن را اینجا paste کنید..."
                placeholderTextColor="#bbb"
                multiline
                numberOfLines={3}
                editable={!checking}
                style={{
                  borderWidth: 1.5,
                  borderColor: "#e0e0e0",
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 12,
                  fontFamily: "IRANSans",
                  color: "#333",
                  backgroundColor: "#f9f9f9",
                  textAlignVertical: "top",
                  marginBottom: 16,
                  minHeight: 70,
                }}
              />

              {checking && (
                <ActivityIndicator
                  style={{ marginBottom: 12 }}
                  color="#01b4e4"
                />
              )}

              <View style={{ flexDirection: "row" }}>
                <Pressable
                  onPress={handleSave}
                  disabled={checking}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 10,
                    backgroundColor: "#01b4e4",
                    alignItems: "center",
                    opacity: checking ? 0.5 : 1,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontFamily: "IRANSans",
                    }}
                  >
                    {checking ? "در حال بررسی..." : "ذخیره"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
