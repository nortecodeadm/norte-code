import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";

export default function WelcomeScreen() {
  const router = useRouter();

  // Animation values
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.9);

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  useEffect(() => {
    // Text fades in and slides up
    textOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    textTranslateY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });

    // Button appears after text
    buttonOpacity.value = withDelay(
      500,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    buttonScale.value = withDelay(500, withSpring(1, { damping: 12 }));
  }, []);

  return (
    <View className="flex-1 bg-warm-white">
      {/* Content centered vertically with slight upward offset */}
      <View className="flex-1 items-center justify-center px-10 pb-20">
        <Animated.View style={textStyle} className="items-center">
          <Text
            className="text-garden-green text-center"
            style={{
              fontFamily: "Nunito-SemiBold",
              fontSize: 22,
              lineHeight: 34,
            }}
          >
            Oi! Vamos começar uma{"\n"}jornada juntos?
          </Text>

          <Text
            className="text-garden-green-600 text-center mt-6"
            style={{
              fontFamily: "Nunito",
              fontSize: 18,
              lineHeight: 28,
            }}
          >
            Você vai cuidar de um lugar{"\n"}que ainda está vazio{"\n"}e
            fazê-lo crescer.
          </Text>
        </Animated.View>

        <Animated.View style={buttonStyle} className="mt-14">
          <Pressable
            onPress={() => router.push("/onboarding/avatar")}
            className="bg-garden-green rounded-2xl px-10 py-4 active:opacity-80"
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <Text
              className="text-warm-white text-center"
              style={{ fontFamily: "Nunito-Bold", fontSize: 17 }}
            >
              Vamos começar
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
