import {
  FlatList,
  Text,
  View,
  Pressable,
  StyleSheet,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { useFavorites } from "../hooks/useFavorites";
import { useCallback, useRef, useState } from "react";
import { Swipeable } from "react-native-gesture-handler";
import SwipeDeleteAction from "../components/SwipeDeleteAction";
import ErrorModal from "../components/ErrorModal";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
export function FavoriteScreen() {
  const { favorites = [], removeFavorite, clearFavorites } = useFavorites();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleRemoveItem = useCallback(
    async (imdbID) => {
      setIsLoading(true);
      try {
        await removeFavorite(imdbID);
      } finally {
        setIsLoading(false);
      }
    },
    [removeFavorite],
  );

  const handleClearAll = useCallback(() => {
    setShowConfirmClear(true);
  }, []);

  const toggleSelectItem = useCallback(
    (imdbID) => {
      if (selectedItems.includes(imdbID)) {
        setSelectedItems(selectedItems.filter((id) => id !== imdbID));
      } else {
        setSelectedItems([...selectedItems, imdbID]);
      }
    },
    [selectedItems],
  );

  const handleDeleteSelected = useCallback(async () => {
    Alert.alert(
      "حذف موارد انتخاب شده",
      `${selectedItems.length} مورد از علاقه‌مندی‌ها حذف شود؟`,
      [
        { text: "لغو", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              for (const id of selectedItems) {
                await removeFavorite(id);
              }
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
    (progress, dragX, imdbID) => {
      return (
        <SwipeDeleteAction
          dragX={dragX}
          onDelete={() => handleRemoveItem(imdbID)}
        >
          حذف
        </SwipeDeleteAction>
      );
    },
    [handleRemoveItem],
  );

  const HeaderComponent = useCallback(() => {
    const headerTranslate = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [0, -40],
      extrapolate: "clamp",
    });

    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0.9],
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
        <View style={styles.headerContent}>
          <Text style={styles.headerCount}>{favorites.length} سریال</Text>
          <Text style={styles.headerTitle}>علاقه‌مندی‌ها</Text>
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
                  <MaterialIcons name="close" size={22} color="#666" />
                  <Text style={styles.headerButtonText}>لغو</Text>
                </Pressable>
                {selectedItems.length > 0 && (
                  <Pressable
                    style={[styles.headerButton, styles.deleteButton]}
                    onPress={handleDeleteSelected}
                  >
                    <MaterialIcons
                      name="delete-sweep"
                      size={22}
                      color="#ff4444"
                    />
                    <Text
                      style={[styles.headerButtonText, styles.deleteButtonText]}
                    >
                      حذف ({selectedItems.length})
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
                  <MaterialIcons name="check-box" size={22} color="#666" />
                  <Text style={styles.headerButtonText}>انتخاب</Text>
                </Pressable>
                <Pressable style={styles.headerButton} onPress={handleClearAll}>
                  <MaterialIcons name="delete-sweep" size={22} color="#666" />
                  <Text style={styles.headerButtonText}>حذف همه</Text>
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
      const inputRange = [-1, 0, index * 50, (index + 2) * 50];
      const scale = scrollY.interpolate({
        inputRange,
        outputRange: [1, 1, 1, 0],
      });

      const isSelected = selectedItems.includes(item.id);

      return (
        <Animated.View style={{ transform: [{ scale }] }}>
          <Swipeable
            renderRightActions={(progress, dragX) =>
              !isSelectionMode && renderRightActions(progress, dragX, item.id)
            }
            overshootRight={false}
          >
            <Pressable
              style={[styles.item, isSelected && styles.selectedItem]}
              onPress={() => {
                if (isSelectionMode) {
                  toggleSelectItem(item.id);
                } else {
                  navigation.navigate("Title", { id: item.id, type: "tv" });
                }
              }}
              onLongPress={() => {
                if (!isSelectionMode) {
                  setIsSelectionMode(true);
                  toggleSelectItem(item.id);
                }
              }}
            >
              {isSelectionMode && (
                <View style={styles.checkbox}>
                  <MaterialIcons
                    name={isSelected ? "check-box" : "check-box-outline-blank"}
                    size={24}
                    color={isSelected ? "#e50914" : "#666"}
                  />
                </View>
              )}

              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.name || item.title}
                  </Text>
                  {item.year && (
                    <View style={styles.yearBadge}>
                      <Text style={styles.yearText}>
                        {item.year.substring(0, 4)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {!isSelectionMode && (
                <MaterialIcons name="chevron-right" size={24} color="#666" />
              )}
            </Pressable>
          </Swipeable>
        </Animated.View>
      );
    },
    [
      navigation,
      isSelectionMode,
      selectedItems,
      toggleSelectItem,
      scrollY,
      renderRightActions,
    ],
  );

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Animated.View style={styles.emptyContent}>
          <MaterialIcons name="favorite-border" size={80} color="#333" />
          <Text style={styles.emptyTitle}>لیست علاقه‌مندی‌ها خالی است</Text>
          <Text style={styles.emptySubtitle}>
            فیلم‌ها و سریال‌های مورد علاقه خود را اینجا ذخیره کنید
          </Text>
          <Pressable
            style={styles.exploreButton}
            onPress={() => navigation.navigate("Home")}
          >
            <MaterialIcons name="arrow-left" size={30} color="#fff" />
            <Text style={styles.exploreButtonText}>
              بریم برای کشف سریال مورد علاقه‌ات
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <HeaderComponent />
      <AnimatedFlatList
        data={favorites}
        keyExtractor={(item, index) => item?.id ?? String(index)}
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
      <ErrorModal
        isVisible={showConfirmClear}
        onClose={() => setShowConfirmClear(false)}
        handleClearFavorites={async () => {
          await clearFavorites();
          setShowConfirmClear(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 30,
  },
  header: {
    backgroundColor: "#0a0a0a",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    justifyContent: "flex-end",
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    color: "#ffee00",
    fontSize: 20,
    fontFamily: "IRANSans",
    writingDirection: "rtl",
  },
  headerCount: {
    color: "#999",
    fontSize: 14,
    fontFamily: "IRANSans",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
  },
  headerButtonText: {
    color: "#666",
    marginLeft: 6,
    fontSize: 14,
    writingDirection: "rtl",
  },
  deleteButton: {
    backgroundColor: "#2a1a1a",
  },
  deleteButtonText: {
    color: "#ff4444",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  item: {
    backgroundColor: "#0a0a0a",
    borderTopLeftRadius: 12,
    borderBottomStartRadius: 12,
    marginBottom: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  selectedItem: {
    backgroundColor: "#1a1a1a",
    borderColor: "#e50914",
  },
  checkbox: {
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  itemHeader: {
    flex: 1,
  },
  itemTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    writingDirection: "rtl",
  },
  yearBadge: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  yearText: {
    color: "#c5f31d",
    fontSize: 12,
  },
  poster: {
    width: 50,
    height: 70,
    borderRadius: 6,
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContent: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    writingDirection: "rtl",
  },
  emptySubtitle: {
    color: "#666",
    fontFamily: "IRANSans",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 30,
    writingDirection: "rtl",
  },
  exploreButton: {
    backgroundColor: "#e50914",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,

    fontWeight: "bold",
    marginRight: 8,
    writingDirection: "rtl",
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
