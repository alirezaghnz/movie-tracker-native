import { Button, Text, View } from "react-native";
import ReactNativeModal from "react-native-modal";

export default function ErrorModal({
  isVisible,
  onClose,
  handleClearFavorites,
}) {
  return (
    <ReactNativeModal
      animationIn="slideInDown"
      coverScreen={false}
      isVisible={isVisible}
      onBackdropPress={onClose}
    >
      <View
        style={{
          backgroundColor: "#d3c5c5",
          padding: 20,
          borderRadius: 10,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            marginBottom: 20,
          }}
        >
          آیا از حذف همه علاقه‌مندی‌ها اطمینان دارید؟
        </Text>
        <View
          style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}
        >
          <Button title="لغو" color="#3e6bcc" onPress={onClose} />
          <Button
            title="حذف"
            color="red"
            onPress={() => {
              onClose();
              handleClearFavorites();
            }}
          />
        </View>
      </View>
    </ReactNativeModal>
  );
}
