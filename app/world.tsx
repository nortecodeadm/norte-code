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
import { getTotalLevels } from "../lib/levels";
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
  pedra: { top: pctH(3), right: pctW(8), width: pctW(20) },
  tronco: { top: pctH(21.5), right: pctW(68), width: pctW(28) },

  // Protagonistas — INFERIOR ESQUERDO
  // Avatar: box GRANDE pra compensar margem do PNG (quadrado, conteúdo ocupa ~52%)
  avatar: { bottom: pctH(2), left: pctW(-20), width: pctW(80) },
  // Mascote: PNG do cachorro tem 95% preenchimento — box menor OK
  mascote: { bottom: pctH(7), left: pctW(65), width: pctW(30) },

  // Recompensa — canto INFERIOR DIREITO (planta principal: semente/broto/broto_crescido)
  sementinha: { bottom: pctH(4), left: pctW(38), width: pctW(25) },

  // Recompensa Nível 3 — flor ao lado da pedra (quadrante superior direito)
  flor: { top: pctH(49), right: pctW(1), width: pctW(7) },

  // Recompensa Nível 4 — mini-árvore SUBSTITUI o broto crescido, mais ao fundo
  // pra abrir espaço pras 3 sementes na frente. Posição placeholder — Gui calibra.
  miniArvore: { top: pctH(50), left: pctW(35), width: pctW(28) },

  // Recompensa Nível 5 — árvore jovem SUBSTITUI a mini-árvore (antecipada
  // do Nível 6 conforme decisão tomada na entrega do Nível 5). Mais alta
  // que a mini-árvore (PNG 606×903 vs 784×1176), top um pouco mais baixo
  // pra ficar bem posicionada. Posição placeholder — Gui calibra.
  arvoreJovem: { top: pctH(16), left: pctW(28), width: pctW(50) },

  // Recompensa Nível 4 — 3 sementes plantadas neste nível, lado a lado na frente
  // da cena. Posições placeholder — Gui calibra.
  sementeLvl4A: { bottom: pctH(4), left: pctW(32), width: pctW(10) },
  sementeLvl4B: { bottom: pctH(5), left: pctW(44), width: pctW(10) },
  sementeLvl4C: { bottom: pctH(4), left: pctW(56), width: pctW(10) },

  // Recompensa Nível 4 — flor decorativa adicional (reusa asset da flor do Nível 3)
  florLvl4: { top: pctH(40), left: pctW(42), width: pctW(7) },

  // Recompensa Nível 5 — 3 plantinhas estágio 3 SUBSTITUEM as 3 sementes
  // plantadas no Nível 4 (mesmas posições). Pulam estágio 2 (broto) —
  // sinal de que regar acelerou o crescimento. Posições placeholder.
  plantinhaLvl5A: { bottom: pctH(4), left: pctW(32), width: pctW(12) },
  plantinhaLvl5B: { bottom: pctH(5), left: pctW(44), width: pctW(12) },
  plantinhaLvl5C: { bottom: pctH(4), left: pctW(56), width: pctW(12) },

  // Recompensa Nível 5 — +2 flores decorativas (reuso do asset da flor do
  // Nível 3). Posições placeholder — Gui calibra.
  florLvl5A: { top: pctH(55), left: pctW(32), width: pctW(7) },
  florLvl5B: { top: pctH(41), right: pctW(33), width: pctW(7) },

  // Recompensa Nível 5 "flor no tronco": SUBSTITUI o tronco (não sobrepõe).
  // Posição/proporção idênticas ao `tronco` — asset novo (1426×624) entra
  // exatamente no lugar. O source do Image do tronco é trocado via state
  // `showFlorNoTronco`. Sem entrada própria no WORLD_LAYOUT.

  // UI
  botaoPlay: { bottom: pctH(90), right: pctW(6) },
};

// ─── Asset requires ─────────────────────────────────────────────────────────
const MUNDO_BG_V1 = require("../assets/mundo/mundo_terreno_vazio.png");
const MUNDO_BG_V2 = require("../assets/mundo/background_mundo_v2.png");
const MUNDO_PEDRA = require("../assets/mundo/mundo_pedra.png");
const MUNDO_TRONCO = require("../assets/mundo/mundo_tronco.png");
const MUNDO_SEMENTINHA = require("../assets/mundo/mundo_sementinha.png");
const MUNDO_BROTO = require("../assets/mundo/mundo_broto.png");
const MUNDO_BROTO_CRESCIDO = require("../assets/mundo/mundo_broto_crescido.png");
const MUNDO_FLOR = require("../assets/mundo/mundo_flor.png");
const MUNDO_MINI_ARVORE = require("../assets/mundo/mundo_mini_arvore.png");
const MUNDO_ARVORE_JOVEM = require("../assets/mundo/mundo_arvore_jovem.png");
const MUNDO_PLANTINHA_LVL5 = require("../assets/mundo/plantinha_estagio3.png");
const MUNDO_FLOR_NO_TRONCO = require("../assets/mundo/flor_no_tronco.png");

/**
 * World Screen — The player's permanent home.
 *
 * Full-screen background with overlaid elements positioned absolutely.
 * Composition follows Gui's Canva reference (mundo-fase1.png).
 */
export default function WorldScreen() {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  // Nível que o botão Play vai abrir. Em geral é o "próximo não-completado",
  // mas se a criança já passou de todos os níveis implementados, vira o
  // último (modo "rejogar") até que mais níveis sejam adicionados.
  const [levelToPlay, setLevelToPlay] = useState(1);
  const [showSeed, setShowSeed] = useState(false);
  const [showSprout, setShowSprout] = useState(false);
  const [showGrownSprout, setShowGrownSprout] = useState(false);
  const [showFlower, setShowFlower] = useState(false);
  const [showMiniArvore, setShowMiniArvore] = useState(false);
  const [showArvoreJovem, setShowArvoreJovem] = useState(false);
  const [showSeedLvl4A, setShowSeedLvl4A] = useState(false);
  const [showSeedLvl4B, setShowSeedLvl4B] = useState(false);
  const [showSeedLvl4C, setShowSeedLvl4C] = useState(false);
  const [showFlowerLvl4, setShowFlowerLvl4] = useState(false);
  // Recompensas do Nível 5 — background v2 substitui v1; plantinhas estágio 3
  // substituem as 3 sementes do Nível 4; +2 flores; +1 flor no tronco.
  const [showBgV2, setShowBgV2] = useState(false);
  const [showPlantinhaLvl5A, setShowPlantinhaLvl5A] = useState(false);
  const [showPlantinhaLvl5B, setShowPlantinhaLvl5B] = useState(false);
  const [showPlantinhaLvl5C, setShowPlantinhaLvl5C] = useState(false);
  const [showFlowerLvl5A, setShowFlowerLvl5A] = useState(false);
  const [showFlowerLvl5B, setShowFlowerLvl5B] = useState(false);
  const [showFlorNoTronco, setShowFlorNoTronco] = useState(false);

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

    // Determina qual nível o botão Play vai abrir.
    // Regra: primeiro nível não-completado, EXCETO quando esse "próximo"
    // ainda não foi implementado — aí cai pro último completado (rejogar).
    // Garante que o botão sempre faz algo útil mesmo quando a criança já
    // alcançou o limite atual do que está pronto.
    const totalImplemented = getTotalLevels();
    const progress = await storage.get<Record<number, boolean>>(
      storage.keys.LEVEL_PROGRESS
    );
    let next = 1;
    if (progress) {
      while (progress[next] === true && next <= 10) {
        next++;
      }
    }
    // Se o "próximo" já passou do que foi implementado, repete o último.
    setLevelToPlay(next <= totalImplemented ? next : totalImplemented);

    // Check world element rewards (with substitution logic)
    const worldElements = await storage.get<string[]>(
      storage.keys.WORLD_ELEMENTS
    );
    console.log('[world] worldElements loaded:', worldElements);
    const hasArvoreJovem = worldElements?.includes("young_tree_lvl5") ?? false;
    const hasMiniArvore = worldElements?.includes("mini_tree_lvl4") ?? false;
    const hasGrownSprout = worldElements?.includes("grown_sprout_lvl3") ?? false;
    const hasSprout = worldElements?.includes("sprout_lvl2") ?? false;
    const hasSeed = worldElements?.includes("seed_lvl1") ?? false;
    const hasFlower = worldElements?.includes("flower_lvl3") ?? false;

    // Substitution chain da planta principal (consolidada após Nível 5):
    //   young_tree (lvl5) > mini_arvore (lvl4) > grown_sprout (lvl3)
    //   > sprout (lvl2) > seed (lvl1).
    // Cada estágio renderiza em posição própria. Quando um estágio mais
    // evoluído aparece, os anteriores somem (só o mais evoluído brilha).
    setShowArvoreJovem(hasArvoreJovem);
    setShowMiniArvore(hasMiniArvore && !hasArvoreJovem);
    setShowGrownSprout(hasGrownSprout && !hasMiniArvore && !hasArvoreJovem);
    setShowSprout(
      hasSprout && !hasGrownSprout && !hasMiniArvore && !hasArvoreJovem
    );
    setShowSeed(
      hasSeed &&
        !hasSprout &&
        !hasGrownSprout &&
        !hasMiniArvore &&
        !hasArvoreJovem
    );
    setShowFlower(hasFlower);

    // Recompensas do Nível 4: 3 sementes plantadas + 1 flor decorativa nova.
    // Cada semente lvl4 é SUBSTITUÍDA visualmente pela plantinha estágio 3
    // correspondente do Nível 5 (mesma posição, asset diferente).
    const hasPlantinhaA = worldElements?.includes("plant_stage3_lvl5_a") ?? false;
    const hasPlantinhaB = worldElements?.includes("plant_stage3_lvl5_b") ?? false;
    const hasPlantinhaC = worldElements?.includes("plant_stage3_lvl5_c") ?? false;
    setShowSeedLvl4A(
      (worldElements?.includes("seed_lvl4_a") ?? false) && !hasPlantinhaA
    );
    setShowSeedLvl4B(
      (worldElements?.includes("seed_lvl4_b") ?? false) && !hasPlantinhaB
    );
    setShowSeedLvl4C(
      (worldElements?.includes("seed_lvl4_c") ?? false) && !hasPlantinhaC
    );
    setShowFlowerLvl4(worldElements?.includes("flower_lvl4") ?? false);

    // Recompensas do Nível 5:
    //   1. background v2 substitui v1 (ImageBackground source decide qual usar)
    //   2. plantinhas estágio 3 substituem sementes lvl4 (já tratado acima)
    //   3. +2 flores decorativas
    //   4. +1 flor brota do tronco caído
    setShowBgV2(worldElements?.includes("background_mundo_v2") ?? false);
    setShowPlantinhaLvl5A(hasPlantinhaA);
    setShowPlantinhaLvl5B(hasPlantinhaB);
    setShowPlantinhaLvl5C(hasPlantinhaC);
    setShowFlowerLvl5A(worldElements?.includes("flower_lvl5_a") ?? false);
    setShowFlowerLvl5B(worldElements?.includes("flower_lvl5_b") ?? false);
    setShowFlorNoTronco(worldElements?.includes("flower_no_tronco") ?? false);
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
    router.push(`/level/${levelToPlay}`);
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
        source={showBgV2 ? MUNDO_BG_V2 : MUNDO_BG_V1}
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

          {/* Tronco — upper right area. Quando a recompensa do Nível 5
              `flower_no_tronco` está ativa, o asset é substituído por
              `flor_no_tronco.png` (tronco+flor integrado, mesma proporção
              1426×624 — substituição direta, zero calibração). Padrão de
              substituição, igual à cadeia das plantas. */}
          <Image
            source={showFlorNoTronco ? MUNDO_FLOR_NO_TRONCO : MUNDO_TRONCO}
            resizeMode="contain"
            style={{
              position: "absolute",
              top: WORLD_LAYOUT.tronco.top,
              right: WORLD_LAYOUT.tronco.right,
              width: WORLD_LAYOUT.tronco.width,
              transform: [{ rotate: '-4deg' }],
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
                top: WORLD_LAYOUT.flor.top,
                right: WORLD_LAYOUT.flor.right,
                width: WORLD_LAYOUT.flor.width,
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

        {/* Z-layer 3.9: Mini-árvore (recompensa do Nível 4) — substitui o
             broto crescido, posicionada mais ao fundo da cena pra abrir espaço
             pras 3 sementes novas na frente. Posição placeholder. */}
        {showMiniArvore && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.miniArvore.top,
                left: WORLD_LAYOUT.miniArvore.left,
                width: WORLD_LAYOUT.miniArvore.width,
                aspectRatio: 784 / 1176,
              },
            ]}
          >
            <Image
              source={MUNDO_MINI_ARVORE}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}

        {/* Z-layer 3.95: Árvore jovem (recompensa do Nível 5, antecipada do
             Nível 6) — substitui a mini-árvore na cadeia da planta principal.
             Asset 606×903 RGBA. Posição placeholder. */}
        {showArvoreJovem && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.arvoreJovem.top,
                left: WORLD_LAYOUT.arvoreJovem.left,
                width: WORLD_LAYOUT.arvoreJovem.width,
                aspectRatio: 606 / 903,
              },
            ]}
          >
            <Image
              source={MUNDO_ARVORE_JOVEM}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}

        {/* Z-layer 4.0: 3 sementes plantadas no Nível 4 (reusa asset da
             sementinha do Nível 1). Posições placeholder — Gui calibra. */}
        {showSeedLvl4A && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.sementeLvl4A.bottom,
                left: WORLD_LAYOUT.sementeLvl4A.left,
                width: WORLD_LAYOUT.sementeLvl4A.width,
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
        {showSeedLvl4B && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.sementeLvl4B.bottom,
                left: WORLD_LAYOUT.sementeLvl4B.left,
                width: WORLD_LAYOUT.sementeLvl4B.width,
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
        {showSeedLvl4C && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.sementeLvl4C.bottom,
                left: WORLD_LAYOUT.sementeLvl4C.left,
                width: WORLD_LAYOUT.sementeLvl4C.width,
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

        {/* Z-layer 4.1: Flor decorativa adicional do Nível 4 (reusa asset
             da flor do Nível 3). Posição placeholder — Gui calibra. */}
        {showFlowerLvl4 && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.florLvl4.top,
                left: WORLD_LAYOUT.florLvl4.left,
                width: WORLD_LAYOUT.florLvl4.width,
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

        {/* Z-layer 4.2: 3 plantinhas estágio 3 (recompensa Nível 5) —
             substituem visualmente as 3 sementes do Nível 4, mesma posição.
             Pulam estágio 2 (broto) — sinal de que regar acelerou crescimento. */}
        {showPlantinhaLvl5A && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.plantinhaLvl5A.bottom,
                left: WORLD_LAYOUT.plantinhaLvl5A.left,
                width: WORLD_LAYOUT.plantinhaLvl5A.width,
                aspectRatio: 534 / 774,
              },
            ]}
          >
            <Image
              source={MUNDO_PLANTINHA_LVL5}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}
        {showPlantinhaLvl5B && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.plantinhaLvl5B.bottom,
                left: WORLD_LAYOUT.plantinhaLvl5B.left,
                width: WORLD_LAYOUT.plantinhaLvl5B.width,
                aspectRatio: 534 / 774,
              },
            ]}
          >
            <Image
              source={MUNDO_PLANTINHA_LVL5}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}
        {showPlantinhaLvl5C && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.plantinhaLvl5C.bottom,
                left: WORLD_LAYOUT.plantinhaLvl5C.left,
                width: WORLD_LAYOUT.plantinhaLvl5C.width,
                aspectRatio: 534 / 774,
              },
            ]}
          >
            <Image
              source={MUNDO_PLANTINHA_LVL5}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}

        {/* Z-layer 4.3: +2 flores decorativas (recompensa Nível 5) — reuso
             do asset da flor do Nível 3. Posições placeholder. */}
        {showFlowerLvl5A && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.florLvl5A.top,
                left: WORLD_LAYOUT.florLvl5A.left,
                width: WORLD_LAYOUT.florLvl5A.width,
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
        {showFlowerLvl5B && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.florLvl5B.top,
                right: WORLD_LAYOUT.florLvl5B.right,
                width: WORLD_LAYOUT.florLvl5B.width,
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

        {/* Recompensa Nível 5 "flor no tronco": NÃO renderiza nada aqui.
             A substituição é feita direto no source do tronco lá em cima
             (mesma proporção 1426×624 — asset novo entra no lugar). */}

        {/* Z-layer 5: UI — Play button */}
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
