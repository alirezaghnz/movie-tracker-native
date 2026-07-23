import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function SwipeDeleteAction({ dragX, onDelete }) {
  const scale = dragX.interpolate({
    inputRange: [-100, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  return (
    <Pressable style={styles.deleteBox} onPress={onDelete}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <MaterialIcons name="delete" size={24} color="#fff" />
        <Text style={styles.deleteText}>Delete</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  deleteBox: {
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "82%",

    marginBottom: 12,
    borderEndEndRadius: 12,
    borderTopEndRadius: 12,
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
});
