import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ErrorContainer({
  message = " مشکلی پیش آمده است. لطفا دوباره تلاش کنید",
  onRetry,
  onBack,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      <View style={styles.actions}>
        {onRetry && (
          <Pressable style={styles.btn} onPress={onRetry}>
            <Text style={styles.btnText}>تلاش مجدد</Text>
          </Pressable>
        )}

        {onBack && (
          <Pressable style={[styles.btn, styles.outline]} onPress={onBack}>
            <Text style={styles.outlineText}>بازگشت به خانه</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
  },
  btn: {
    backgroundColor: "#1db954",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 6,
    marginBottom: 6,
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#555",
  },
  outlineText: {
    color: "#aaa",
    fontSize: 14,
  },
});
