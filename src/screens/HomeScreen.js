import { FlatList, Text, TextInput, View } from "react-native";
import SeriesCard from "../components/SeriesCard";
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

export default function HomeScreen() {
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
        style={{
          backgroundColor: "#111",
          color: "#fff",
          padding: 14,
          borderRadius: 12,
          marginBottom: 20,
        }}
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
    </View>
  );
}
