import { useRef, useState, createContext, useContext } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const AlertContext = createContext(null);

const TYPES = {
  error: { border: "#e5484d", bg: "rgba(229,72,77,0.12)", icon: "!" },
  success: { border: "#2dd4bf", bg: "rgba(45,212,191,0.12)", icon: "✓" },
  info: { border: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: "i" },
};

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null);
  const translateY = useRef(new Animated.Value(-120)).current;
  const timerRef = useRef(null);

  const showAlert = ({ title, body, type = "error" }) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAlert({ title, body, type });
    translateY.setValue(-120);

    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 200,
    }).start();

    timerRef.current = setTimeout(hideAlert, 4000);
  };

  const hideAlert = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.timing(translateY, {
      toValue: -120,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setAlert(null));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        visible={!!alert}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={hideAlert}
      >
        <View style={styles.root} pointerEvents="box-none">
          {alert && (
            <Animated.View
              style={[styles.wrapper, { transform: [{ translateY }] }]}
              pointerEvents="box-none"
            >
              <Pressable
                onPress={hideAlert}
                style={[
                  styles.card,
                  { borderColor: TYPES[alert.type]?.border ?? "#444" },
                ]}
              >
                <View
                  style={[
                    styles.icon,
                    { backgroundColor: TYPES[alert.type]?.bg ?? "transparent" },
                  ]}
                >
                  <Text
                    style={[
                      styles.iconText,
                      { color: TYPES[alert.type]?.border ?? "#fff" },
                    ]}
                  >
                    {TYPES[alert.type]?.icon ?? "!"}
                  </Text>
                </View>

                <View style={styles.content}>
                  <Text style={styles.title} numberOfLines={1}>
                    {alert.title}
                  </Text>
                  {!!alert.body && (
                    <Text style={styles.body} numberOfLines={2}>
                      {alert.body}
                    </Text>
                  )}
                </View>

                <Text style={styles.close}>×</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used inside AlertProvider");
  return ctx;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "transparent",
  },
  wrapper: {
    position: "absolute",
    top: 52,
    left: 14,
    right: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#18181b",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  icon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconText: {
    fontSize: 13,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 13.5,
    fontWeight: "600",
  },
  body: {
    color: "#a1a1aa",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  close: {
    color: "#52525b",
    fontSize: 18,
    lineHeight: 20,
    paddingLeft: 4,
    flexShrink: 0,
  },
});
