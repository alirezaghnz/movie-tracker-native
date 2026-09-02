import { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { getImageUrl } from "../services/api/tmdb";
import { fp, wp } from "../utils/responsive";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CastSection({ cast = [] }) {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  if (!cast.length) return null;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={styles.container}>
      <Pressable style={styles.toggleRow} onPress={toggle}>
        <Text style={styles.toggleLabel}>
          Cast {cast.length > 0 && `(${cast.length})`}
        </Text>
        <Animated.Text style={[styles.arrow, { transform: [{ rotate }] }]}>
          ▼
        </Animated.Text>
      </Pressable>

      {expanded && (
        <FlatList
          data={cast.slice(0, 20)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.castCard}>
              {item.profile_path ? (
                <Image
                  source={{ uri: getImageUrl(item.profile_path, "w185") }}
                  style={styles.castImage}
                />
              ) : (
                <View style={styles.castImagePlaceholder}>
                  <Text style={styles.castInitial}>
                    {item.name?.[0] ?? "?"}
                  </Text>
                </View>
              )}
              <Text style={styles.castName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.castCharacter} numberOfLines={1}>
                {item.character}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(16),
    marginBottom: wp(12),
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: wp(8),
    paddingHorizontal: wp(10),
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  toggleLabel: {
    color: "#fff",
    fontSize: fp(15),
    fontWeight: "600",
  },
  arrow: {
    color: "#888",
    fontSize: fp(12),
  },
  list: {
    paddingTop: wp(14),
    gap: 12,
  },
  castCard: {
    width: 90,
    alignItems: "center",
  },
  castImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#1a1a1a",
    marginBottom: 6,
  },
  castImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  castInitial: {
    color: "#666",
    fontSize: fp(20),
    fontWeight: "700",
  },
  castName: {
    color: "#fff",
    fontSize: fp(11.5),
    fontWeight: "600",
    textAlign: "center",
  },
  castCharacter: {
    color: "#777",
    fontSize: fp(10.5),
    textAlign: "center",
    marginTop: 2,
  },
});
