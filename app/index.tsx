import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

export default function SplashScreen() {
  const router = useRouter();
  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  useEffect(() => {
    // Animate in
    logoOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });
    taglineOpacity.value = withDelay(
      400,
      withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      })
    );

    // Navigate after 2.5s
    const timer = setTimeout(() => {
      // TODO: Check if user has completed onboarding
      // If yes, go to world. If no, go to onboarding.
      router.replace("/onboarding/welcome");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-garden-green">
      <Animated.View style={logoStyle} className="items-center">
        {/* TODO: Replace with actual logo asset */}
        <Text className="font-fraunces text-5xl font-bold text-warm-white">
          Norte Code
        </Text>
      </Animated.View>

      <Animated.View style={taglineStyle} className="mt-4">
        <Text className="font-nunito text-base text-gold-200 text-center px-8">
          A bússola da lógica e programação para crianças.
        </Text>
      </Animated.View>
    </View>
  );
}
