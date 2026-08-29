import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MOVIE_GENRES, TV_GENRES } from "../constants/genres";

const TYPES = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "Series" },
];

const YEARS = Array.from(
  { length: 30 },
  (_, i) => new Date().getFullYear() - i,
);
export default function FilterModal({
  visible,
  onClose,
  filters,
  toggleGenre,
  setYear,
  setType,
  resetFitlers,
}) {
  const genreList =
    filters.mediaType === "movie"
      ? MOVIE_GENRES
      : filters.mediaType === "tv"
        ? TV_GENRES
        : MOVIE_GENRES;
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.container}>
        <View
          style={{
            width: "90%",
            height: "75%",
            backgroundColor: "#000",
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: "#242222",
          }}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Type</Text>
            <View style={styles.chipRow}>
              {TYPES.map((type) => {
                const active = filters.mediaType === type.value;
                return (
                  <Pressable
                    style={[styles.chip, active && styles.chipActive]}
                    key={type.value}
                    onPress={() => setType(type.value)}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {type.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>Genre</Text>
            <View style={styles.chipRow}>
              {genreList.map((genre) => {
                const active = filters.selectedGenreId === genre.id;

                return (
                  <Pressable
                    style={[styles.chip, active && styles.chipActive]}
                    key={genre.id}
                    onPress={() => toggleGenre(genre.id)}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {genre.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>Year</Text>
            <View style={styles.chipRow}>
              {YEARS.map((y) => {
                const active = filters.selectedYear === y;

                return (
                  <Pressable
                    style={[styles.chip, active && styles.chipActive]}
                    key={y}
                    onPress={() => setYear(y)}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {y}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.resetBtn} onPress={resetFitlers}>
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
            <Pressable style={styles.applyBtn} onPress={onClose}>
              <Text style={styles.applyText}>Show Results</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 26,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 24,
  },
  close: {
    color: "#c02020",
    fontSize: 15,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#111",
  },
  chipActive: {
    backgroundColor: "#e50914",
    borderColor: "#e50914",
  },
  chipText: {
    color: "#999",
    fontSize: 10,
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
  },
  resetText: {
    color: "#888",
    fontWeight: "600",
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#e50914",
    alignItems: "center",
  },
  applyText: {
    color: "#fff",
    fontWeight: "700",
  },
});
