import { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DropdownSelect({
  label,
  value,
  options = [],
  onChange,
  width = "100%",
}) {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    // Animate the layout change
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(!open);
  };
  const select = (option) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <View style={[styles.wrapper, { width }]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable style={styles.selectBtn} onPress={toggle}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.arrow}>{open ? "▲" : "▼"}</Text>
      </Pressable>

      {open && (
        <View style={styles.dropdown}>
          {options.map((item) => (
            <Pressable
              key={item}
              style={styles.option}
              onPress={() => select(item)}
            >
              <Text
                style={[styles.optionText, item === value && styles.active]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    zIndex: 20,
    marginBottom: 12,
  },
  label: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 4,
  },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  value: {
    color: "#fff",
    fontSize: 14,
  },
  arrow: {
    color: "#888",
    fontSize: 10,
  },
  dropdown: {
    position: "absolute",
    top: 63,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: "#111",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#222",
    overflow: "hidden",
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionText: {
    color: "#ccc",
    textAlign: "right",
    fontSize: 14,
  },
  active: {
    color: "#e50914",
    fontWeight: "bold",
  },
});
