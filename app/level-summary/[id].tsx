/**
 * Level Summary Screen — shown after completing a level.
 *
 * MVP: Basic success message + reward info + button to return to World.
 * Saves progress to local storage (offline-first).
 */

import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";

import { getLevel } from "../../lib/levels";
import { storage } from "../../lib/storage";

export default function LevelSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const levelId = parseInt(id ?? "1", 10);
  const level = getLevel(levelId);

  const [saved, setSaved] = useState(false);

  // Animations
  const titleOpacity = useSharedValue(0);
  const rewardScale = useSharedValue(0.5);
  const rewardOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const rewardStyle = useAnimatedStyle(() => ({
    opacity: rewardOpacity.value,
    transform: [{ scale: rewardScale.value }],
  }));
  const buttonStyle = useAnimatedStyle(() => ({ opacity: buttonOpacity.value }));

  useEffect(() => {
    // Entrance animations
    titleOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    rewardOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    rewardScale.value = withDelay(400, withSpring(1, { damping: 10, stiffness: 120 }));
    buttonOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }));

    // Save progress
    saveProgress();
  }, []);

  const saveProgress = async () => {
    if (!level) return;

    // Save level completion
    const progress = (await storage.get<Record<number, boolean>>(
      storage.keys.LEVEL_PROGRESS
    )) ?? {};
    progress[levelId] = true;
    await storage.set(storage.keys.LEVEL_PROGRESS, progress);

    // Save world element reward
    const elements = (await storage.get<string[]>(
      storage.keys.WORLD_ELEMENTS
    )) ?? [];
    if (!elements.includes(level.reward.elementKey)) {
      elements.push(level.reward.elementKey);
      await storage.set(storage.keys.WORLD_ELEMENTS, elements);
    }

    setSaved(true);
  };

  const handleContinue = () => {
    // Go back to world (replace so user can't go back to summary)
    router.replace("/world");
  };

  if (!level) {
    return (
      <SafeAreaView className="flex-1 bg-warm-white items-center justify-center">
        <Text className="text-garden-green" style={{ fontFamily: "Nunito-Bold" }}>
          Nível não encontrado
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-warm-white items-center justify-center px-8">
      {/* Title */}
      <Animated.View style={titleStyle} className="items-center mb-8">
        <Text
          className="text-garden-green text-center"
          style={{ fontFamily: "Fraunces-Bold", fontSize: 28 }}
        >
          Parabéns!
        </Text>
        <Text
          className="text-garden-green-600 text-center mt-2"
          style={{ fontFamily: "Nunito-Regular", fontSize: 15, lineHeight: 22 }}
        >
          Você completou "{level.title}"
        </Text>
      </Animated.View>

      {/* Reward */}
      <Animated.View
        style={rewardStyle}
        className="items-center bg-garden-green-50 rounded-3xl px-8 py-6 mb-10"
      >
        <Text style={{ fontSize: 40, marginBottom: 12 }}>🌱</Text>
        <Text
          className="text-garden-green text-center"
          style={{ fontFamily: "Nunito-SemiBold", fontSize: 15, lineHeight: 22 }}
        >
          {level.reward.message}
        </Text>
      </Animated.View>

      {/* Continue button */}
      <Animated.View style={buttonStyle} className="w-full">
        <Pressable
          onPress={handleContinue}
          className="bg-garden-green rounded-2xl py-4 active:opacity-80"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <Text
            className="text-warm-white text-center"
            style={{ fontFamily: "Nunito-Bold", fontSize: 16 }}
          >
            Voltar ao meu mundo
          </Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
