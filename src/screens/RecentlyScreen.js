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

export default function RecentlyScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);

  // fetch recently watched items when the screen is focused
  useFocusEffect(
    // useCallback is used to memoize the callback function so that it doesn't get recreated on every render
    useCallback(() => {
      getRecentlyWatched().then(setItems);
    }, []),
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.libTitle}>MY LIBRARY</Text>
          <Text style={styles.libSub}>
            Watch history, progress, and saved titles
          </Text>
        </View>
        <Pressable
          style={styles.clearBtnWrapper}
          onPress={() => clearRecentlyWatched().then(() => setItems([]))}
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
            marginBottom: 12,
          }}
          contentContainerStyle={{
            padding: 16,
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
                    marginTop: 4,
                  }}
                >
                  <Text
                    style={{ color: "#e50914", fontSize: 11, marginTop: 2 }}
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

                <Text style={{ color: "#777", fontSize: 11, marginTop: 3 }}>
                  {getTimeAgo(item.visitedAt)}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    alignItems: "flex-end",
  },
  libTitle: {
    color: "#fff",
    fontSize: 38,
    fontFamily: "Bebas",
    marginBottom: 4,
  },
  libSub: {
    color: "#909090",
    fontSize: 15,
  },
  clearBtnWrapper: {
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 4,
  },
  clearBtn: {
    color: "#e50914",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#909090",
    fontSize: 16,
  },
  itemRecently: {
    width: "48%",
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 12,
  },
  posterContainer: {
    position: "relative",
  },
  typeTag: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeTextTag: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  poster: {
    width: "100%",
    aspectRatio: 16 / 19,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
  },
  itemInfo: {
    marginTop: 10,
  },
  itemTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  itemYear: {
    color: "#666",
    fontSize: 11,
    marginTop: 4,
  },
});
