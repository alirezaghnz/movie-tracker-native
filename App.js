import { useFonts } from "expo-font";
import AppContent from "./src/components/AppContent";

import { AlertProvider } from "./src/components/Customalert";

export default function App() {
  const [fontsLoaded] = useFonts({
    IRANSans: require("./src/styles/fonts/IRANSans.ttf"),
    Bebas: require("./src/styles/fonts/BebasNeue-Regular.ttf"),
  });

  if (!fontsLoaded) return null;
  return (
    <AlertProvider>
      <AppContent />
    </AlertProvider>
  );
}
