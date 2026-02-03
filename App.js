import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import MainNavigator from "./src/navigation";

export default function App() {
  return (
    <NavigationContainer>
      <MainNavigator />
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
