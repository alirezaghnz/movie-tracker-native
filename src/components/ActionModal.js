import { Pressable, Text, View } from "react-native";
import ReactNativeModal from "react-native-modal";

export default function ActionModal({
  isVisible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  return (
    <ReactNativeModal
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.6}
      animationInTiming={200}
      animationOutTiming={150}
      isVisible={isVisible}
      onBackdropPress={onClose}
    >
      <View
        style={{
          backgroundColor: "#161616",
          padding: 20,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "#242424",
        }}
      >
        {title && (
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 18,
              color: "#fff",
            }}
          >
            {title}
          </Text>
        )}

        <Text
          style={{
            fontSize: 18,
            marginBottom: 24,
            color: "#999",
            lineHeight: 22,
          }}
        >
          {message}
        </Text>

        <View
          style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}
        >
          <Pressable
            style={{
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: "#1f1f1f",
              borderWidth: 1,
              borderColor: "#333",
            }}
            onPress={() => onClose()}
          >
            <Text
              style={{
                color: "#bbb",
                fontWeight: "600",
              }}
            >
              {cancelText}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              onClose();
              onConfirm?.();
            }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: "#e50914",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {confirmText}
            </Text>
          </Pressable>
        </View>
      </View>
    </ReactNativeModal>
  );
}
