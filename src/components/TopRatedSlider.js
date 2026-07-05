import { useNavigation } from "@react-navigation/native";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getImageUrl } from "../services/api/tmdb";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useRef, useState } from "react";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.65;
const SIDE_WIDTH = width * 0.1;
const CARD_HEIGHT = CARD_WIDTH * 1.5;
const SPACING = 15;

export default function TopRatedSlider({ data }) {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!data?.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % data.length;
        flatListRef.current?.scrollToIndex({
          index: next,
          animated: true,
          viewPosition: 0.5,
        });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [data]);
  if (!data?.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>سریال های برتر</Text>

      <Animated.FlatList
        ref={flatListRef}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingHorizontal: SIDE_WIDTH,
          gap: SPACING,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING),
          );
          setCurrentIndex(index);
        }}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + SPACING),
            index * (CARD_WIDTH + SPACING),
            (index + 1) * (CARD_WIDTH + SPACING),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.88, 1, 0.88],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: "clamp",
          });

          const isCenter = currentIndex === index;

          return (
            <Animated.View
              style={[
                styles.cardWrapper,
                !isCenter && { transform: [{ scale }], opacity },
              ]}
            >
              <Pressable
                style={styles.card}
                onPress={() =>
                  navigation.navigate("Title", { id: item.id, type: "tv" })
                }
              >
                <Image
                  style={styles.poster}
                  source={{ uri: getImageUrl(item.poster_path, "w500") }}
                />
                {!isCenter && (
                  <BlurView
                    intensity={90}
                    style={StyleSheet.absoluteFill}
                    tint="dark"
                  />
                )}

                {isCenter && (
                  <View style={styles.overlay}>
                    <View style={styles.ratingBadge}>
                      <FontAwesome name="star" size={11} color="#FFD700" />
                      <Text style={styles.ratingText}>
                        {item.vote_average?.toFixed(1)}
                      </Text>
                    </View>
                    <Text style={styles.title} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.year}>
                      {item.first_air_date?.substring(0, 4)}
                    </Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          );
        }}
      />

      <View style={styles.dots}>
        {data.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "IRANSans",
    marginBottom: 12,
    paddingHorizontal: 20,
    textAlign: "right",
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 14,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right",
    fontFamily: "IRANSans",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 4,
    marginBottom: 4,
  },
  year: {
    color: "#aaa",
    fontSize: 12,
    textAlign: "right",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#444",
  },
  dotActive: {
    width: 18,
    backgroundColor: "#e50914",
    borderRadius: 3,
  },
});
