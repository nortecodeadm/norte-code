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
// Referência visual: mundo-fase1.png (criado pelo Gui no Canva)
//
// Composição:
//   - Avatar + Mascote: canto INFERIOR ESQUERDO, juntos, no chão
//   - Pedra + Tronco: quadrante SUPERIOR DIREITO, distantes (cenário de fundo)
//   - Sementinha: canto INFERIOR DIREITO, separada do grupo (recompensa)
//   - Botão Play: canto inferior direito, abaixo/junto da sementinha
//
// Avatar PNG: 890×1705 → aspectRatio 890/1705 (aplicado no componente)
// Mascote PNG: 880×1062 → aspectRatio 880/1062 (aplicado no componente)
// Com aspectRatio real, os componentes agora têm proporções corretas
// e não precisam de box gigante para compensar transparência.

const pctW = (p: number) => SCREEN_WIDTH * (p / 100);
const pctH = (p: number) => SCREEN_HEIGHT * (p / 100);

const WORLD_LAYOUT = {
  // Cenário — quadrante SUPERIOR DIREITO
  pedra: { top: pctH(3), right: pctW(5), width: pctW(20) },
  tronco: { top: pctH(31.8), right: pctW(30), width: pctW(28) },

  // Protagonistas — INFERIOR ESQUERDO
  // Avatar: box GRANDE pra compensar margem do PNG (quadrado, conteúdo ocupa ~52%)
  avatar: { bottom: pctH(2), left: pctW(-20), width: pctW(80) },
  // Mascote: PNG do cachorro tem 95% preenchimento — box menor OK
  mascote: { bottom: pctH(7), left: pctW(65), width: pctW(30) },

  // Recompensa — canto INFERIOR DIREITO
  sementinha: { bottom: pctH(4), left: pctW(38), width: pctW(25) },

  // UI
  botaoPlay: { bottom: pctH(90), right: pctW(6) },
};

// ─── Asset requires ─────────────────────────────────────────────────────────
const MUNDO_BG = require("../assets/mundo/mundo_terreno_vazio.png");
const MUNDO_PEDRA = require("../assets/mundo/mundo_pedra.png");
const MUNDO_TRONCO = require("../assets/mundo/mundo_tronco.png");
const MUNDO_SEMENTINHA = require("../assets/mundo/mundo_sementinha.png");
const MUNDO_BROTO = require("../assets/mundo/mundo_broto.png");
const MUNDO_BROTO_CRESCIDO = require("../assets/mundo/mundo_broto_crescido.png");
const MUNDO_FLOR = require("../assets/mundo/mundo_flor.png");

/**
 * World Screen — The player's permanent home.
 *
 * Full-screen background with overlaid elements positioned absolutely.
 * Composition follows Gui's Canva reference (mundo-fase1.png).
 */
export default function WorldScreen() {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [nextLevel, setNextLevel] = useState(1);
  const [showSeed, setShowSeed] = useState(false);
  const [showSprout, setShowSprout] = useState(false);
  const [showGrownSprout, setShowGrownSprout] = useState(false);
  const [showFlower, setShowFlower] = useState(false);

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

  const loadData = useCallback(async () => {
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

    // Check world element rewards (with substitution logic)
    const worldElements = await storage.get<string[]>(
      storage.keys.WORLD_ELEMENTS
    );
    console.log('[world] worldElements loaded:', worldElements);
    const hasGrownSprout = worldElements?.includes("grown_sprout_lvl3") ?? false;
    const hasSprout = worldElements?.includes("sprout_lvl2") ?? false;
    const hasSeed = worldElements?.includes("seed_lvl1") ?? false;
    const hasFlower = worldElements?.includes("flower_lvl3") ?? false;

    // Substitution chain: grown_sprout > sprout > seed (only most evolved shows)
    setShowGrownSprout(hasGrownSprout);
    setShowSprout(hasSprout && !hasGrownSprout);
    setShowSeed(hasSeed && !hasSprout && !hasGrownSprout);
    setShowFlower(hasFlower);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
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
        {/* Z-layer 1: Scenery (pedra, tronco) — quadrante superior direito */}
        <Animated.View style={[fadeStyle, { position: "absolute", width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}>
          {/* Pedra — upper right area */}
          <Image
            source={MUNDO_PEDRA}
            resizeMode="contain"
            style={{
              position: "absolute",
              top: WORLD_LAYOUT.pedra.top,
              right: WORLD_LAYOUT.pedra.right,
              width: WORLD_LAYOUT.pedra.width,
              aspectRatio: 1062 / 880,
            }}
          />

          {/* Tronco — upper right area, slightly lower */}
          <Image
            source={MUNDO_TRONCO}
            resizeMode="contain"
            style={{
              position: "absolute",
              top: WORLD_LAYOUT.tronco.top,
              right: WORLD_LAYOUT.tronco.right,
              width: WORLD_LAYOUT.tronco.width,
              transform: [{ rotate: '-6deg' }],
              aspectRatio: 1426 / 624,
            }}
          />
        </Animated.View>

        {/* Z-layer 2: Avatar — bottom left, large */}
        <Animated.View
          style={[
            avatarStyle,
            {
              position: "absolute",
              bottom: WORLD_LAYOUT.avatar.bottom,
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
        </Animated.View>

        {/* Z-layer 3: Mascote — to the right of avatar, smaller */}
        <Animated.View
          style={[
            mascotStyle,
            {
              position: "absolute",
              bottom: WORLD_LAYOUT.mascote.bottom,
              left: WORLD_LAYOUT.mascote.left,
              width: WORLD_LAYOUT.mascote.width,
            },
          ]}
        >
          <Mascote type={player.pet_type} state="padrao" size={WORLD_LAYOUT.mascote.width} />
        </Animated.View>

        {/* Z-layer 3.5: Sementinha (recompensa do Nível 1) — canto inferior direito */}
        {showSeed && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.sementinha.bottom,
                right: WORLD_LAYOUT.sementinha.left,
                width: WORLD_LAYOUT.sementinha.width,
                aspectRatio: 838 / 580,
              },
            ]}
          >
            <Image
              source={MUNDO_SEMENTINHA}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}

        {/* Z-layer 3.6: Broto (recompensa do Nível 2) — substitui sementinha, mesma posição */}
        {showSprout && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.sementinha.bottom,
                left: WORLD_LAYOUT.sementinha.left,
                width: WORLD_LAYOUT.sementinha.width,
                aspectRatio: 610 / 625,
              },
            ]}
          >
            <Image
              source={MUNDO_BROTO}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}

        {/* Z-layer 3.7: Broto crescido (recompensa do Nível 3) — substitui broto, mesma posição */}
        {showGrownSprout && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.sementinha.bottom,
                left: WORLD_LAYOUT.sementinha.left,
                width: WORLD_LAYOUT.sementinha.width,
                aspectRatio: 534 / 774,
              },
            ]}
          >
            <Image
              source={MUNDO_BROTO_CRESCIDO}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}

        {/* Z-layer 3.8: Flor (recompensa do Nível 3) — ao lado da pedra */}
        {showFlower && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: pctH(45),
                right: pctW(2),
                width: pctW(7),
                aspectRatio: 272 / 732,
              },
            ]}
          >
            <Image
              source={MUNDO_FLOR}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}

        {/* Z-layer 4: UI — Play button */}
        <Animated.View
          style={[
            playBtnStyle,
            {
              position: "absolute",
              bottom: WORLD_LAYOUT.botaoPlay.bottom,
              right: WORLD_LAYOUT.botaoPlay.right,
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
