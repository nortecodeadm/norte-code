import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, Image, ImageBackground, Dimensions } from "react-native";
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── World Layout ─────────────────────────────────────────────────────────────
// Composição com hierarquia de profundidade:
// - Pedra/tronco = cenário ao fundo (menores, laterais)
// - Avatar/mascote = protagonistas no primeiro plano (grandes, centrais)
// - Sementinha = relativa ao avatar (nos pés dele)
// - Botão = UI fixa no canto inferior direito

const pctW = (p: number) => SCREEN_WIDTH * (p / 100);
const pctH = (p: number) => SCREEN_HEIGHT * (p / 100);

const WORLD_LAYOUT = {
  // Cenário — ao fundo, pequeno
  pedra: { top: pctH(52), left: pctW(5), width: pctW(14) },
  tronco: { top: pctH(56), right: pctW(8), width: pctW(20) },

  // Protagonistas — primeiro plano, grandes
  avatar: { top: pctH(58), left: pctW(32), width: pctW(32) },
  mascote: { top: pctH(70), left: pctW(55), width: pctW(24) },

  // UI
  botaoExecutar: { bottom: pctH(6), right: pctW(6) },
};

// ─── Asset requires ─────────────────────────────────────────────────────────
const MUNDO_BG = require("../assets/mundo/mundo_terreno_vazio.png");
const MUNDO_PEDRA = require("../assets/mundo/mundo_pedra.png");
const MUNDO_TRONCO = require("../assets/mundo/mundo_tronco.png");
const MUNDO_SEMENTINHA = require("../assets/mundo/mundo_sementinha.png");

/**
 * World Screen — The player's permanent home.
 *
 * Full-screen background with overlaid elements positioned via percentages.
 * Composition follows children's book illustration principles:
 * - Avatar & mascote are protagonists (large, foreground)
 * - Pedra & tronco are scenery (small, background)
 * - Sementinha is relative to avatar (at its feet)
 */
export default function WorldScreen() {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [nextLevel, setNextLevel] = useState(1);
  const [showSeed, setShowSeed] = useState(false);

  // Animations
  const fadeIn = useSharedValue(0);
  const avatarScale = useSharedValue(0.8);
  const mascotSlide = useSharedValue(30);
  const playBtnScale = useSharedValue(0);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));
  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
    opacity: fadeIn.value,
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

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    fadeIn.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    avatarScale.value = withDelay(
      200,
      withSpring(1, { damping: 12, stiffness: 100 })
    );
    mascotSlide.value = withDelay(
      400,
      withSpring(0, { damping: 12, stiffness: 100 })
    );
    playBtnScale.value = withDelay(
      800,
      withSpring(1, { damping: 10, stiffness: 150 })
    );
  }, []);

  const handlePlayPress = () => {
    if (nextLevel > 10) return;
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
    <View className="flex-1">
      <ImageBackground
        source={MUNDO_BG}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        {/* Z-layer 1: Scenery elements (pedra, tronco) — background, small */}
        <Animated.View style={[fadeStyle, { position: "absolute", width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}>
          {/* Pedra — left side, background */}
          <Image
            source={MUNDO_PEDRA}
            resizeMode="contain"
            style={{
              position: "absolute",
              top: WORLD_LAYOUT.pedra.top,
              left: WORLD_LAYOUT.pedra.left,
              width: WORLD_LAYOUT.pedra.width,
              aspectRatio: 1062 / 880,
            }}
          />

          {/* Tronco — right side, background */}
          <Image
            source={MUNDO_TRONCO}
            resizeMode="contain"
            style={{
              position: "absolute",
              top: WORLD_LAYOUT.tronco.top,
              right: WORLD_LAYOUT.tronco.right,
              width: WORLD_LAYOUT.tronco.width,
              aspectRatio: 1426 / 624,
            }}
          />
        </Animated.View>

        {/* Z-layer 2: Avatar container (avatar + sementinha relativa) */}
        <Animated.View
          style={[
            avatarStyle,
            {
              position: "absolute",
              top: WORLD_LAYOUT.avatar.top,
              left: WORLD_LAYOUT.avatar.left,
              width: WORLD_LAYOUT.avatar.width,
            },
          ]}
        >
          <Avatar
            skinTone={player.avatar_skin}
            hairStyle={player.avatar_hair_style}
            hairColor={player.avatar_hair_color}
            outfit={player.avatar_outfit}
            size={WORLD_LAYOUT.avatar.width}
          />

          {/* Sementinha — relative to avatar, at its feet */}
          {showSeed && (
            <Image
              source={MUNDO_SEMENTINHA}
              resizeMode="contain"
              style={{
                position: "absolute",
                bottom: "-8%",
                left: "35%",
                width: "30%",
                aspectRatio: 838 / 580,
              }}
            />
          )}
        </Animated.View>

        {/* Z-layer 3: Mascote — beside avatar, slightly lower */}
        <Animated.View
          style={[
            mascotStyle,
            {
              position: "absolute",
              top: WORLD_LAYOUT.mascote.top,
              left: WORLD_LAYOUT.mascote.left,
              width: WORLD_LAYOUT.mascote.width,
            },
          ]}
        >
          <Mascote type={player.pet_type} state="padrao" size={WORLD_LAYOUT.mascote.width} />
        </Animated.View>

        {/* Z-layer 4: UI — Play button */}
        <Animated.View
          style={[
            playBtnStyle,
            {
              position: "absolute",
              bottom: WORLD_LAYOUT.botaoExecutar.bottom,
              right: WORLD_LAYOUT.botaoExecutar.right,
            },
          ]}
        >
          <Pressable
            onPress={handlePlayPress}
            className="bg-garden-green rounded-full items-center justify-center active:opacity-80"
            style={({ pressed }) => ({
              width: 64,
              height: 64,
              transform: [{ scale: pressed ? 0.9 : 1 }],
              shadowColor: "#1F5F3F",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            })}
          >
            <Text style={{ fontSize: 28, color: "#FFFDF7", marginLeft: 4 }}>▶</Text>
          </Pressable>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}
