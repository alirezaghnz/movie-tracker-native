import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import PlayerScreen from "../screens/PlayerScreen";
import TitleScreen from "../screens/TitlteScreen";
import { FavoriteScreen } from "../screens/FavoriteScreen";

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Title" component={TitleScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} />
      <Stack.Screen
        name="Favorites"
        component={FavoriteScreen}
        options={{ title: "علاقه مندی ها" }}
      />
    </Stack.Navigator>
  );
}
