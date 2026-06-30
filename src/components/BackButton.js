import { useNavigation } from "@react-navigation/native";
import { Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

export function BackButton() {
  const navigation = useNavigation();

  return (
    <Pressable onPress={() => navigation.goBack()}>
      <Feather name="arrow-left-circle" size={28} color="white" />
    </Pressable>
  );
}
