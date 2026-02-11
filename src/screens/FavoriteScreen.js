import { FlatList, Text, View, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFavorites } from "../hooks/useFavorites";

export function FavoriteScreen() {
  const { favorites } = useFavorites();
  const navigation = useNavigation();

  if (favorites.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#666", fontSize: 16 }}>
          هنوز چیزی اضافه نکردی
        </Text>
      </View>
    );
  }
  return (
    <FlatList
      data={favorites}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          style={styles.item}
          onPress={() => navigation.navigate("Title", { imdbID: item.imdbID })}
        >
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            {item.year && <Text style={styles.year}>{item.year}</Text>}
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    flex: 1,
  },
  year: {
    fontSize: 14,
    color: "#666",
    marginLeft: 12,
  },
});
