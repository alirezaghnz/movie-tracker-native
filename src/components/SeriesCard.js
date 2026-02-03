import { View, Text, Image, Pressable } from "react-native";

export default function SeriesCard({ item, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: "48%",
        marginBottom: 16,
      }}
    >
      <Image
        source={{ uri: item.poster }}
        style={{
          width: "100%",
          height: 220,
          borderRadius: 12,
        }}
      />

      <Text
        numberOfLines={1}
        style={{
          color: "#fff",
          fontSize: 14,
          marginTop: 6,
          fontWeight: "600",
        }}
      >
        {item.title}
      </Text>

      <Text style={{ color: "#888", fontSize: 12 }}>{item.year}</Text>
    </Pressable>
  );
}
