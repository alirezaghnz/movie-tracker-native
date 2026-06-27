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

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null); // { title, body, type }

  const translateY = useRef(new Animated.Value(-150)).current;
  const timerRef = useRef(null);

  const showAlert = ({ title, body, type = "error" }) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAlert({ title, body, type });

    translateY.setValue(-150);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 16,
      stiffness: 180,
    }).start();

    timerRef.current = setTimeout(() => hideAlert(), 4000);
  };

  const hideAlert = () => {
    Animated.timing(translateY, {
      toValue: -150,
      duration: 220,
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
        <View style={styles.modalRoot} pointerEvents="box-none">
          {alert && (
            <Animated.View
              style={[styles.wrapper, { transform: [{ translateY }] }]}
            >
              <Pressable
                onPress={hideAlert}
                style={[styles.card, styles[`card_${alert.type}`]]}
              >
                <View style={[styles.iconCircle, styles[`icon_${alert.type}`]]}>
                  <Text style={styles.iconText}>
                    {alert.type === "error"
                      ? "!"
                      : alert.type === "success"
                        ? "✓"
                        : "i"}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{alert.title}</Text>
                  {!!alert.body && (
                    <Text style={styles.body}>{alert.body}</Text>
                  )}
                </View>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

// alert custom hook
export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error("useAlert باید داخل AlertProvider استفاده بشه");
  }
  return ctx;
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: "transparent",
  },
  wrapper: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 999,
  },
  card: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#1c1c1e",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#2c2c2e",
  },
  card_error: { borderColor: "#e5484d" },
  card_success: { borderColor: "#2dd4bf" },
  card_info: { borderColor: "#3b82f6" },

  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  icon_error: { backgroundColor: "rgba(229, 72, 77, 0.15)" },
  icon_success: { backgroundColor: "rgba(45, 212, 191, 0.15)" },
  icon_info: { backgroundColor: "rgba(59, 130, 246, 0.15)" },
  iconText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  title: {
    color: "#fff",
    fontSize: 14.5,
    fontWeight: "700",
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 2,
  },
  body: {
    color: "#b5b5ba",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "right",
    writingDirection: "rtl",
  },
});
