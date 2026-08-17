import {
  FlatList,
  Text,
  View,
  Pressable,
  StyleSheet,
  Animated,
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { useFavorites } from "../hooks/useFavorites";
import { useCallback, useEffect, useRef, useState } from "react";
import { Swipeable } from "react-native-gesture-handler";
import SwipeDeleteAction from "../components/SwipeDeleteAction";

import { getImageUrl } from "../services/api/tmdb";
import { fp, hp, wp } from "../utils/responsive";
import ActionModal from "../components/ActionModal";
import {
  markFavoritesWithNewEpisodes,
  markSeriesSeen,
} from "../utils/checkNewEpisode";
import NewEpisodeBadgeDot from "../components/NewEpisodeBadgeDot";

import { useNewEpisodesContext } from "../context/NewEpisodesContext";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

function FavoriteRow({
  item,
  index,
  isSelected,
  isSelectionMode,
  scrollY,
  onPress,
  onLongPress,
  renderRightActions,
}) {
  const mountAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(mountAnim, {
      toValue: 1,
      duration: 320,
      delay: Math.min(index * 45, 300),
      useNativeDriver: true,
    }).start();
  }, []);

  const inputRange = [-1, 0, index * 90, (index + 2) * 90];
  const scrollScale = scrollY.interpolate({
    inputRange,
    outputRange: [1, 1, 1, 0.92],
    extrapolate: "clamp",
  });
  const scrollOpacity = scrollY.interpolate({
    inputRange,
    outputRange: [1, 1, 1, 0.4],
    extrapolate: "clamp",
  });

  const translateY = mountAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  return (
    <Animated.View
      style={{
        opacity: Animated.multiply(mountAnim, scrollOpacity),
        transform: [{ translateY }, { scale: scrollScale }],
      }}
    >
      <Swipeable
        renderRightActions={(progress, dragX) =>
          !isSelectionMode && renderRightActions(progress, dragX, item.id)
        }
        overshootRight={false}
      >
        <Pressable
          style={({ pressed }) => [
            styles.item,
            isSelected && styles.selectedItem,
            pressed && styles.itemPressed,
          ]}
          onPress={onPress}
          onLongPress={onLongPress}
        >
          {isSelectionMode && (
            <View style={styles.checkbox}>
              <MaterialIcons
                name={isSelected ? "check-circle" : "radio-button-unchecked"}
                size={22}
                color={isSelected ? "#e50914" : "#555"}
              />
            </View>
          )}

          <View style={styles.posterWrapper}>
            <Image
              source={{ uri: getImageUrl(item.poster_path) }}
              style={styles.poster}
            />
            <View
              style={[
                styles.typeTag,
                item.type === "movie" ? styles.movieTag : styles.tvTag,
              ]}
            >
              <Text style={styles.typeTagText}>
                {item.type === "movie" ? "MOVIE" : "TV"}
              </Text>
            </View>
          </View>

          <View style={styles.itemContent}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.name || item.title}
            </Text>

            <View style={styles.metaRow}>
              {item.year && (
                <View style={styles.yearBadge}>
                  <Text style={styles.yearText}>
                    {item.year.substring(0, 4)}
                  </Text>
                </View>
              )}
              {item.hasNewEpisode && (
                <View style={styles.newBadge}>
                  <NewEpisodeBadgeDot compact />
                </View>
              )}
            </View>
          </View>

          {!isSelectionMode && (
            <MaterialIcons name="chevron-right" size={22} color="#444" />
          )}
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
}

export function FavoriteScreen() {
  const { favorites = [], removeFavorite, clearFavorites } = useFavorites();
  const { recheck } = useNewEpisodesContext();

  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enrichedFavorits, setEnrichedFavorites] = useState([]);

  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      markFavoritesWithNewEpisodes(favorites).then(setEnrichedFavorites);
    }, [favorites]),
  );

  const handleRemoveItem = useCallback(
    async (id) => {
      setIsLoading(true);
      try {
        await removeFavorite(id);
      } finally {
        setIsLoading(false);
      }
    },
    [removeFavorite],
  );

  const handleClearAll = useCallback(() => {
    setShowConfirmClear(true);
  }, []);

  const toggleSelectItem = useCallback((id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const handleDeleteSelected = useCallback(() => {
    Alert.alert(
      "Delete selected",
      `Remove ${selectedItems.length} from favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await removeFavorite(selectedItems);
              setSelectedItems([]);
              setIsSelectionMode(false);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  }, [selectedItems, removeFavorite]);

  const renderRightActions = useCallback(
    (progress, dragX, id) => (
      <SwipeDeleteAction dragX={dragX} onDelete={() => handleRemoveItem(id)}>
        Delete
      </SwipeDeleteAction>
    ),
    [handleRemoveItem],
  );

  const HeaderComponent = useCallback(() => {
    const headerTranslate = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [0, -30],
      extrapolate: "clamp",
    });
    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0.94],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: headerTranslate }],
            opacity: headerOpacity,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Favorites</Text>
          {favorites.length > 0 && (
            <View style={styles.headerCount}>
              <Text style={styles.headerCountText}>{favorites.length}</Text>
            </View>
          )}
        </View>

        {favorites.length > 0 && (
          <View style={styles.headerActions}>
            {isSelectionMode ? (
              <>
                <Pressable
                  style={styles.headerButton}
                  onPress={() => {
                    setSelectedItems([]);
                    setIsSelectionMode(false);
                  }}
                >
                  <MaterialIcons name="close" size={18} color="#888" />
                  <Text style={styles.headerButtonText}>Cancel</Text>
                </Pressable>
                {selectedItems.length > 0 && (
                  <Pressable
                    style={[styles.headerButton, styles.deleteButton]}
                    onPress={handleDeleteSelected}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={18}
                      color="#ff5555"
                    />
                    <Text
                      style={[styles.headerButtonText, styles.deleteButtonText]}
                    >
                      Delete ({selectedItems.length})
                    </Text>
                  </Pressable>
                )}
              </>
            ) : (
              <>
                <Pressable
                  style={styles.headerButton}
                  onPress={() => setIsSelectionMode(true)}
                >
                  <MaterialIcons
                    name="check-circle-outline"
                    size={18}
                    color="#888"
                  />
                  <Text style={styles.headerButtonText}>Select</Text>
                </Pressable>
                <Pressable style={styles.headerButton} onPress={handleClearAll}>
                  <MaterialIcons name="delete-outline" size={18} color="#888" />
                  <Text style={styles.headerButtonText}>Clear all</Text>
                </Pressable>
              </>
            )}
          </View>
        )}
      </Animated.View>
    );
  }, [
    favorites.length,
    isSelectionMode,
    selectedItems.length,
    scrollY,
    handleDeleteSelected,
    handleClearAll,
  ]);

  const renderItem = useCallback(
    ({ item, index }) => {
      const isSelected = selectedItems.includes(item.id);
      return (
        <FavoriteRow
          item={item}
          index={index}
          isSelected={isSelected}
          isSelectionMode={isSelectionMode}
          scrollY={scrollY}
          renderRightActions={renderRightActions}
          onPress={() => {
            if (isSelectionMode) {
              toggleSelectItem(item.id);
            } else {
              if (item.hasNewEpisode) {
                markSeriesSeen(item.id).then(() => recheck());
              }
              navigation.navigate("HomeStack", {
                screen: "Title",
                params: { id: item.id, type: item.type },
              });
            }
          }}
          onLongPress={() => {
            if (!isSelectionMode) {
              setIsSelectionMode(true);
              toggleSelectItem(item.id);
            }
          }}
        />
      );
    },
    [
      navigation,
      isSelectionMode,
      selectedItems,
      toggleSelectItem,
      scrollY,
      renderRightActions,
      recheck,
    ],
  );

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <View style={styles.emptyIconWrapper}>
            <MaterialIcons name="favorite-border" size={56} color="#333" />
          </View>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite movies and TV shows here.
          </Text>
          <Pressable
            style={styles.exploreButton}
            onPress={() => navigation.navigate("HomeStack")}
          >
            <Text style={styles.exploreButtonText}>
              Discover something to watch
            </Text>
            <MaterialIcons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent />
      <AnimatedFlatList
        data={enrichedFavorits}
        keyExtractor={(item, index) => item?.id?.toString() ?? String(index)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#e50914" />
        </View>
      )}
      <ActionModal
        isVisible={showConfirmClear}
        onClose={() => setShowConfirmClear(false)}
        onConfirm={async () => {
          await clearFavorites();
          setShowConfirmClear(false);
        }}
        title="Delete favorites"
        message="Are you sure you want to delete all favorites?"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingHorizontal: wp(20),
    paddingTop: wp(50),
    paddingBottom: wp(14),
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#161616",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: fp(34),
    fontFamily: "Bebas",
  },
  headerCount: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  headerCountText: {
    color: "#aaa",
    fontSize: fp(12),
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#242424",
  },
  headerButtonText: {
    color: "#999",
    fontSize: fp(13),
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#2a1414",
    borderColor: "#3a1a1a",
  },
  deleteButtonText: {
    color: "#ff5555",
  },

  listContent: {
    paddingHorizontal: wp(16),
    paddingTop: wp(14),
    paddingBottom: wp(100),
  },

  item: {
    backgroundColor: "#0d0d0d",
    borderRadius: 14,
    marginBottom: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#181818",
    gap: 12,
  },
  itemPressed: {
    backgroundColor: "#131313",
  },
  selectedItem: {
    backgroundColor: "#1a1010",
    borderColor: "#e50914",
  },

  checkbox: {
    marginRight: 2,
  },

  posterWrapper: {
    position: "relative",
  },
  poster: {
    width: wp(64),
    height: hp(92),
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
  },
  typeTag: {
    position: "absolute",
    top: 5,
    left: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tvTag: {
    backgroundColor: "rgba(59,130,246,0.85)",
  },
  movieTag: {
    backgroundColor: "rgba(229,9,20,0.85)",
  },
  typeTagText: {
    color: "#fff",
    fontSize: fp(8),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  dotWrapper: {
    position: "absolute",
    top: -4,
    right: -4,
  },

  itemContent: {
    flex: 1,
    justifyContent: "center",
  },
  itemTitle: {
    color: "#fff",
    fontSize: fp(15.5),
    fontWeight: "600",
    marginBottom: 8,
    lineHeight: fp(20),
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  yearBadge: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  yearText: {
    color: "#8fbf3f",
    fontSize: fp(11.5),
    fontWeight: "600",
  },
  newBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(229,9,20,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  newDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#e50914",
  },
  newBadgeText: {
    color: "#e50914",
    fontSize: fp(11),
    fontWeight: "600",
  },

  emptyContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#0d0d0d",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  emptyTitle: {
    color: "#fff",
    fontSize: fp(24),
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#666",
    fontSize: fp(13.5),
    textAlign: "center",
    marginBottom: 28,
    lineHeight: fp(20),
  },
  exploreButton: {
    backgroundColor: "#e50914",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: fp(14),
    fontWeight: "700",
  },

  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});
