import { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getImageUrl } from "../services/api/tmdb";
import {
  clearRecentlyWatched,
  getRecentlyWatched,
} from "../storage/RecentlyStorage";
import { getTimeAgo } from "../utils/date";
import { fp, wp } from "../utils/responsive";
import { SafeAreaView } from "react-native-safe-area-context";
import ActionModal from "../components/ActionModal";

export default function RecentlyScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [showClearModal, setShowClearModal] = useState(false);
  // fetch recently watched items when the screen is focused
  useFocusEffect(
    // useCallback is used to memoize the callback function so that it doesn't get recreated on every render
    useCallback(() => {
      getRecentlyWatched().then(setItems);
    }, []),
  );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.libTitle}>MY LIBRARY</Text>
          <Text style={styles.libSub}>
            Watch history, progress, and saved titles
          </Text>
        </View>
        <Pressable
          style={styles.clearBtnWrapper}
          onPress={() => setShowClearModal(true)}
        >
          <Text style={styles.clearBtn}>Clear</Text>
        </Pressable>
      </View>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recently watched items</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: wp(12),
          }}
          contentContainerStyle={{
            padding: wp(16),
          }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.itemRecently}
              onPress={() =>
                navigation.navigate("HomeStack", {
                  screen: "Title",
                  params: { id: item.id, type: item.type },
                })
              }
            >
              <View style={styles.posterContainer}>
                <Image
                  style={styles.poster}
                  source={{ uri: getImageUrl(item.poster_path) }}
                />
                <View style={styles.typeTag}>
                  <Text style={styles.typeTextTag}>
                    {item.type === "tv" ? "TV" : "MOVIE"}
                  </Text>
                </View>
              </View>

              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.title || item.name}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 2,
                    marginTop: wp(4),
                  }}
                >
                  <Text
                    style={{
                      color: "#e50914",
                      fontSize: fp(10.5),
                      marginTop: 2,
                    }}
                  >
                    {item.type === "tv"
                      ? `S${item.season} · E${item.episode_number}`
                      : "Movie 🎬"}{" "}
                  </Text>

                  {(item.first_air_date || item.release_date) && (
                    <Text style={styles.itemYear}>
                      {(item.first_air_date || item.release_date).substring(
                        0,
                        4,
                      )}
                    </Text>
                  )}
                </View>

                <Text
                  style={{ color: "#777", fontSize: fp(10.5), marginTop: 3 }}
                >
                  {getTimeAgo(item.visitedAt)}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
      <ActionModal
        isVisible={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={async () => {
          await clearRecentlyWatched();
          setItems([]);
          setShowClearModal(false);
        }}
        title="Clear History"
        message="Are you sure you want to clear your watch history?"
        confirmText="Clear"
        cancelText="Cancel"
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp(20),
    paddingTop: wp(10),
    paddingBottom: wp(16),
    alignItems: "flex-end",
  },
  libTitle: {
    color: "#fff",
    fontSize: fp(30),
    fontFamily: "Bebas",
    marginBottom: 4,
  },
  libSub: {
    color: "#909090",
    fontSize: fp(13),
  },
  clearBtnWrapper: {
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: wp(12),
    paddingVertical: wp(6),
    marginBottom: 4,
  },
  clearBtn: {
    color: "#e50914",
    fontSize: fp(13),
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#909090",
    fontSize: fp(15),
  },
  itemRecently: {
    width: "48%",
    backgroundColor: "#111",
    borderRadius: 12,
    padding: wp(12),
  },
  posterContainer: {
    position: "relative",
  },
  typeTag: {
    position: "absolute",
    top: wp(8),
    right: wp(8),
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: wp(6),
    paddingVertical: wp(2),
    borderRadius: 6,
  },
  typeTextTag: {
    color: "#fff",
    fontSize: fp(9),
    fontWeight: "700",
  },
  poster: {
    width: "100%",
    aspectRatio: 16 / 19,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
  },
  itemInfo: {
    marginTop: wp(10),
  },
  itemTitle: {
    color: "#fff",
    fontSize: fp(14),
    fontWeight: "600",
  },
  itemYear: {
    color: "#666",
    fontSize: fp(10.5),
    marginTop: 4,
  },
});
