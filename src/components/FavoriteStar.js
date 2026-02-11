import { Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export function FavoriteStar({ active, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <MaterialIcons
        name={active ? "star" : "star-border"}
        size={30}
        color={active ? "#FFD700" : "#999"}
      />
    </Pressable>
  );
}
