import {
  FlatList,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";
import SeriesCard from "../components/SeriesCard";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { searchTitles } from "../services/api/search";
import FavoriteFab from "../components/FavoriteFab";

const FEATURED_SERIES = [
  {
    id: "tt0903747",
    title: "Breaking Bad",
    year: "2008",
    poster:
      "https://zardfilm.in/wp-content/uploads/2023/09/Breaking-Bad-3.webp",
  },
  {
    id: "tt3032476",
    title: "Better Call Saul",
    year: "2015",
    poster:
      "https://zardfilm.in/wp-content/uploads/2022/04/Better-Call-Saul-Season-6-1.jpg",
  },
  {
    id: "tt1475582",
    title: "Sherlock",
    year: "2010",
    poster: "https://zardfilm.in/wp-content/uploads/2023/08/1-110.webp",
  },
  {
    id: "tt0944947",
    title: "Game of Thrones",
    year: "2011",
    poster:
      "https://zardfilm.in/wp-content/uploads/2024/08/ae8c21bc78b35923cdd54ef5868915ef.webp",
  },
  {
    id: "tt2861424",
    title: "Rick and Morty",
    year: "2013",
    poster:
      "https://zardfilm.in/wp-content/uploads/2025/09/Haunted-Hotel-2-500x741.webp",
  },
  {
    id: "tt4574334",
    title: "Stranger Things",
    year: "2016",
    poster:
      "https://zardfilm.in/wp-content/uploads/2024/08/static-assets-upload16249666914462580424.webp",
  },
];
const QUALITIES = ["480", "720", "1080"];
export default function HomeScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [quality, setQuality] = useState(QUALITIES[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const data = await searchTitles(query);
      setResults(data);
      setLoading(false);
    }, 350); // for debounce
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 30 }}>
      <Text
        style={{
          color: "#fff",
          fontSize: 26,
          fontWeight: "700",
          marginBottom: 12,
        }}
      >
        Discover
      </Text>

      <TextInput
        placeholder="نام سریال مورد نظر را وارد نمایید..."
        placeholderTextColor="#777"
        value={query}
        onChangeText={setQuery}
        style={{
          backgroundColor: "#111",
          color: "#fff",
          padding: 14,
          borderRadius: 12,
          marginBottom: 20,
        }}
      />
      <View style={styles.qualityRow}>
        <Text style={{ color: "#ccc" }}>انتخاب کیفیت:</Text>
        {QUALITIES.map((q) => (
          <Pressable
            key={q}
            onPress={() => setQuality(q)}
            style={[
              styles.qualityBtn,
              quality === q && styles.qualityBtnActive,
            ]}
          >
            <Text style={styles.qualityText}>{q}</Text>
          </Pressable>
        ))}
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

      <FlatList
        data={results}
        keyExtractor={(item) => item.imdbID}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            style={styles.item}
            onPress={() =>
              navigation.navigate("Title", { imdbID: item.imdbID, quality })
            }
          >
            <Text style={styles.title}>{item.title}</Text>

            {!item.hasLink && (
              <Text style={styles.noLink}>No download link</Text>
            )}
          </Pressable>
        )}
      />

      <Text
        style={{
          color: "#fff",
          fontSize: 18,
          fontWeight: "600",
          marginBottom: 12,
        }}
      >
        Featured Series
      </Text>

      <FlatList
        data={FEATURED_SERIES}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SeriesCard
            item={item}
            onPress={() => console.log("Pressed:", item.title)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
      <FavoriteFab />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#000",
  },
  input: {
    backgroundColor: "#1c1c1c",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  title: {
    color: "#fff",
    fontSize: 15,
  },
  noLink: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
  qualityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  qualityBtn: {
    borderWidth: 1,
    borderColor: "#444",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  qualityBtnActive: {
    backgroundColor: "#eeeb3f",
    borderColor: "#000000",
  },
  qualityText: {
    color: "#ffffff",
    fontSize: 12,
  },
});
