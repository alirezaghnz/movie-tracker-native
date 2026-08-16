import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function PulsingFavIcon({ color, size, hasNew }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!hasNew) {
      pulse.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.3,
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
  }, [hasNew, pulse]);

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <MaterialIcons
        name="favorite"
        size={size}
        color={hasNew ? "#e50914" : color}
      />
    </Animated.View>
  );
}
