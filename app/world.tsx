import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { getPlayer, type PlayerData } from "../lib/player";
import { getCurrentUserId } from "../lib/auth";
import { Avatar } from "../components/Avatar";
import { Mascote } from "../components/Mascote";
import { storage } from "../lib/storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * World Screen — The player's permanent home.
 *
 * State initial (MVP): empty terrain with avatar + mascot.
 * As levels are completed, visual rewards appear (future).
 * Play button (▶) in bottom-right opens the next available level.
 */
export default function WorldScreen() {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [nextLevel, setNextLevel] = useState(1);
  const [showSeed, setShowSeed] = useState(false);

  // Animations
  const fadeIn = useSharedValue(0);
  const titleSlide = useSharedValue(-20);
  const avatarScale = useSharedValue(0.8);
  const mascotSlide = useSharedValue(30);
  const playBtnScale = useSharedValue(0);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: titleSlide.value }],
  }));
  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));
  const mascotStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateX: mascotSlide.value }],
  }));
  const playBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playBtnScale.value }],
  }));

  const loadData = async () => {
    const userId = await getCurrentUserId();
    if (userId) {
      const data = await getPlayer(userId);
      setPlayer(data);
    }

    // Check level progress to determine next level
    const progress = await storage.get<Record<number, boolean>>(
      storage.keys.LEVEL_PROGRESS
    );
    if (progress) {
      // Find the first incomplete level
      let next = 1;
      while (progress[next] === true && next <= 10) {
        next++;
      }
      setNextLevel(next);
    }

    // Check if seed reward should show (level 1 completed)
    const worldElements = await storage.get<string[]>(
      storage.keys.WORLD_ELEMENTS
    );
    if (worldElements && worldElements.includes("seed_lvl1")) {
      setShowSeed(true);
    }
  };

  // Reload data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    // Entrance animations
    fadeIn.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    titleSlide.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    avatarScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
    mascotSlide.value = withDelay(400, withSpring(0, { damping: 12, stiffness: 100 }));
    playBtnScale.value = withDelay(
      800,
      withSpring(1, { damping: 10, stiffness: 150 })
    );
  }, []);

  const handlePlayPress = () => {
    if (nextLevel > 10) return; // All levels done
    router.push(`/level/${nextLevel}`);
  };

  if (!player) {
    return (
      <View className="flex-1 bg-warm-white items-center justify-center">
        <Text
          className="text-garden-green-400"
          style={{ fontFamily: "Nunito-Regular", fontSize: 16 }}
        >
          Carregando...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-warm-white">
      {/* Title */}
      <Animated.View style={titleStyle} className="pt-14 pb-4 items-center">
        <Text
          className="text-garden-green"
          style={{ fontFamily: "Fraunces-Bold", fontSize: 22 }}
        >
          Seu mundo
        </Text>
      </Animated.View>

      {/* Terrain area — the world canvas */}
      <Animated.View style={fadeStyle} className="flex-1 items-center justify-center px-6">
        {/* Empty terrain visual (placeholder — will be replaced by actual terrain asset) */}
        <View
          className="w-full rounded-3xl items-center justify-center relative"
          style={{
            height: SCREEN_WIDTH * 0.75,
            backgroundColor: "#E8DCC8", // earthy tone for empty terrain
            borderWidth: 1,
            borderColor: "rgba(31, 95, 63, 0.1)",
          }}
        >
          {/* Subtle terrain elements (placeholders) */}
          <View
            className="absolute"
            style={{
              top: "20%",
              left: "15%",
              width: 24,
              height: 16,
              backgroundColor: "#B8A88A",
              borderRadius: 8,
            }}
          />
          <View
            className="absolute"
            style={{
              bottom: "25%",
              right: "20%",
              width: 20,
              height: 28,
              backgroundColor: "#8B7355",
              borderRadius: 4,
            }}
          />

          {/* Seed reward from Level 1 */}
          {showSeed && (
            <View
              className="absolute"
              style={{
                bottom: "35%",
                left: "40%",
                width: 12,
                height: 12,
                backgroundColor: "#5D8A3C",
                borderRadius: 6,
              }}
            />
          )}

          {/* Avatar + Mascot in center */}
          <View className="items-center">
            <Animated.View style={avatarStyle}>
              <Avatar
                skinTone={player.avatar_skin}
                hairStyle={player.avatar_hair_style}
                hairColor={player.avatar_hair_color}
                outfit={player.avatar_outfit}
                size={100}
              />
            </Animated.View>

            <Animated.View style={mascotStyle} className="mt-2 items-center">
              <Mascote type={player.pet_type} state="padrao" size={70} />
              <Text
                className="text-garden-green-700 mt-1"
                style={{ fontFamily: "Nunito-SemiBold", fontSize: 12 }}
              >
                {player.pet_name}
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* World status text */}
        <Text
          className="text-garden-green-400 text-center mt-4"
          style={{
            fontFamily: "Nunito-Regular",
            fontSize: 13,
            lineHeight: 20,
          }}
        >
          {showSeed
            ? "Uma sementinha apareceu no seu mundo!"
            : "O mundo ainda está vazio... mas em breve vai crescer."}
        </Text>
      </Animated.View>

      {/* Play button — bottom right */}
      <Animated.View
        style={[playBtnStyle, { position: 'absolute', bottom: 32, right: 24 }]}
      >
        <Pressable
          onPress={handlePlayPress}
          className="bg-garden-green rounded-full items-center justify-center active:opacity-80"
          style={({ pressed }) => ({
            width: 56,
            height: 56,
            transform: [{ scale: pressed ? 0.9 : 1 }],
            shadowColor: "#1F5F3F",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          })}
        >
          <Text style={{ fontSize: 24, color: "#FFFDF7" }}>▶</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
