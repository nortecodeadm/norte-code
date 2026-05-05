import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

/**
 * Transition screen — shown once after onboarding, before the World.
 * Text is definitive (approved by Claude). Do not modify.
 */
export default function TransitionScreen() {
  const router = useRouter();

  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(12);
  const buttonOpacity = useSharedValue(0);

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  useEffect(() => {
    textOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    textTranslateY.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    buttonOpacity.value = withDelay(
      1000,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  return (
    <View className="flex-1 bg-warm-white items-center justify-center px-10">
      <Animated.View style={textStyle} className="items-center">
        <Text
          className="text-garden-green text-center"
          style={{
            fontFamily: "Fraunces-Bold",
            fontSize: 22,
            lineHeight: 34,
          }}
        >
          Este é o seu lugar.{"\n"}Ainda está vazio.{"\n"}Vamos cuidar dele juntos?
        </Text>
      </Animated.View>

      <Animated.View style={buttonStyle} className="mt-12 w-full">
        <Pressable
          onPress={() => router.replace("/world")}
          className="bg-garden-green rounded-2xl py-4 active:opacity-80"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <Text
            className="text-warm-white text-center"
            style={{ fontFamily: "Nunito-Bold", fontSize: 17 }}
          >
            Vamos!
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
