import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export default function NewEpisodeBadgeDot() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.6,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.dot, { transform: [{ scale: pulse }] }]} />
      <Text style={styles.text}>New Ep</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e50914",
  },
  text: {
    color: "#e50914",
    fontSize: 11,
    fontWeight: "600",
  },
});
