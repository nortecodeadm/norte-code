import "../global.css";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Nunito: require("../assets/fonts/Nunito-Regular.ttf"),
    "Nunito-Bold": require("../assets/fonts/Nunito-Bold.ttf"),
    "Nunito-SemiBold": require("../assets/fonts/Nunito-SemiBold.ttf"),
    Fraunces: require("../assets/fonts/Fraunces-Regular.ttf"),
    "Fraunces-Bold": require("../assets/fonts/Fraunces-Bold.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding/welcome" />
        <Stack.Screen name="onboarding/pet-choice" />
        <Stack.Screen name="onboarding/pet-name" />
        <Stack.Screen name="onboarding/avatar" />
        <Stack.Screen name="world" />
        <Stack.Screen name="level/[id]" />
        <Stack.Screen name="level-summary/[id]" />
        <Stack.Screen name="chapter/[id]" />
      </Stack>
    </GestureHandlerRootView>
  );
}
