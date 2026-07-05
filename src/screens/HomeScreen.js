import {
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import FavoriteFab from "../components/FavoriteFab";
import {
  getImageUrl,
  getTopRatedTV,
  getTrending,
  searchTV,
} from "../services/api/tmdb";
import TextTicker from "react-native-text-ticker";
import TopRatedSlider from "../components/TopRatedSlider";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null); // for focus on input

  useEffect(() => {
    getTrending("tv", "day")
      .then((data) => setTrendingSeries(data.results))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getTopRatedTV()
      .then((data) => setTopRated(data.results?.slice(0, 10) ?? []))
      .catch(console.erro);
  }, []);
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearchLoading(true);
    const timeout = setTimeout(() => {
      searchTV(query)
        .then((data) => setResults(data.results))
        .catch(console.error)
        .finally(() => setSearchLoading(false));
    }, 500);
    return () => clearTimeout(timeout);
  }, [query]);

  const isSearching = query.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Text style={styles.discover}>IronBranch</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            style={styles.profileBtn}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchRow}>
          <TextInput
            ref={inputRef}
            placeholder="نام سریال مورد نظر را وارد نمایید..."
            placeholderTextColor="#777"
            value={query}
            onChangeText={setQuery}
            style={styles.input}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} style={styles.clearBtn}>
              <Text style={styles.clearText}>×</Text>
            </Pressable>
          )}
        </View>

        {searchLoading && (
          <ActivityIndicator style={{ marginBottom: 10 }} color="#fff" />
        )}

        {isSearching &&
          results.map((item) => (
            <Pressable
              key={item.id.toString()}
              style={styles.item}
              onPress={() =>
                navigation.navigate("Title", { id: item.id, type: "tv" })
              }
            >
              <Image
                source={{ uri: getImageUrl(item.poster_path) }}
                style={styles.searchPoster}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>
                  {item.name}{" "}
                  <Text
                    style={{
                      color: "yellow",
                      fontSize: 10,
                      marginTop: 4,
                      textAlign: "right",
                    }}
                  >
                    ({item.first_air_date.substring(0, 4)}) . IMDB ⭐{" "}
                    {item.vote_average?.toFixed(1)}
                  </Text>
                </Text>
              </View>
            </Pressable>
          ))}

        {!isSearching && (
          <>
            <TopRatedSlider data={topRated} />
            <Text style={styles.sectionTitle}>جدیدترین سریال</Text>

            {loading && (
              <ActivityIndicator style={{ marginTop: 20 }} color="#fff" />
            )}

            <View style={styles.grid}>
              {trendingSeries.map((item) => (
                <Pressable
                  key={item.id.toString()}
                  onPress={() =>
                    navigation.navigate("Title", { id: item.id, type: "tv" })
                  }
                  style={styles.card}
                >
                  <Image
                    source={{ uri: getImageUrl(item.poster_path) }}
                    style={styles.poster}
                  />
                  <TextTicker
                    style={styles.cardTitle}
                    duration={8000}
                    loop
                    bounce
                    repeatSpacer={50}
                    marqueeDelay={1000}
                  >
                    {item.name}
                  </TextTicker>
                  <Text style={styles.rating}>
                    ⭐ {item.vote_average?.toFixed(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Open-source project. Contribute on GitHub.
        </Text>

        <Pressable
          onPress={() =>
            Linking.openURL(
              "https://github.com/alirezaghnz/movie-tracker-native",
            )
          }
          style={styles.githubBtn}
        >
          <Text style={styles.githubText}>View on GitHub</Text>
        </Pressable>
      </View>
      <FavoriteFab />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 46,
    marginBottom: 16,
  },
  discover: {
    color: "#03a75a",
    fontSize: 26,
    fontWeight: "700",
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  profileIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    color: "#fff",
    padding: 14,
    fontFamily: "IRANSans",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "IRANSans",
    marginBottom: 12,
    textAlign: "right",
  },
  item: {
    flexDirection: "row-reverse",
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: "center",
    borderBottomColor: "#222",
    gap: 12,
  },
  searchPoster: {
    width: 46,
    height: 66,
    borderRadius: 6,
    backgroundColor: "#1a1a1a",
  },
  itemTitle: {
    color: "#fff",
    fontSize: 15,
    textAlign: "left",
    writingDirection: "ltr",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "47%",
    marginBottom: 20,
  },
  poster: {
    width: "100%",
    height: 220,
    borderRadius: 10,
  },
  cardTitle: {
    fontWeight: "bold",
    marginTop: 6,
    color: "#fff",
    fontSize: 13,
  },
  rating: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    paddingTop: 5,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#222",
    alignItems: "center",
  },

  footerText: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 2,
  },

  githubBtn: {
    backgroundColor: "#111",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },

  githubText: {
    color: "#fff",
    fontSize: 13,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 16,
    paddingRight: 8,
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#ac3030",
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: {
    color: "#a51010",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 12,
  },
});
