import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function FavoriteFab() {
  const navigation = useNavigation();

  return (
    <Pressable
      style={styles.fab}
      onPress={() => navigation.navigate("Favorites")}
    >
      <MaterialIcons name="list-alt" size={28} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#555dce",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});
