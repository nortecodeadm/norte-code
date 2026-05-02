import { useEffect, useCallback } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { ensureAnonymousSession } from "../lib/auth";
import { isOnboardingComplete } from "../lib/player";

export default function SplashScreen() {
  const router = useRouter();
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.9);
  const taglineOpacity = useSharedValue(0);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const navigateAfterSplash = useCallback(async () => {
    // Ensure we have an anonymous session (creates one if needed)
    await ensureAnonymousSession();

    // Check if onboarding was already completed
    const completed = await isOnboardingComplete();

    if (completed) {
      router.replace("/world");
    } else {
      router.replace("/onboarding/welcome");
    }
  }, [router]);

  useEffect(() => {
    // Animate logo in with subtle scale
    logoOpacity.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
    logoScale.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });

    // Tagline fades in after logo
    taglineOpacity.value = withDelay(
      400,
      withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Navigate after splash duration (1.5s as per briefing + animation time)
    const timer = setTimeout(() => {
      navigateAfterSplash();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-garden-green">
      <Animated.View style={logoStyle} className="items-center">
        {/* TODO: Replace with actual logo asset when available */}
        <Text
          className="text-warm-white text-center"
          style={{ fontFamily: "Fraunces-Bold", fontSize: 42 }}
        >
          Norte Code
        </Text>
      </Animated.View>

      <Animated.View style={taglineStyle} className="mt-4 px-10">
        <Text
          className="text-center"
          style={{
            fontFamily: "Nunito",
            fontSize: 15,
            color: "#FAEDCC", // gold-100
            lineHeight: 22,
          }}
        >
          A bússola da lógica e programação para crianças.
        </Text>
      </Animated.View>
    </View>
  );
}
