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
  arvoreJovem: { top: pctH(11), left: pctW(25), width: pctW(55) },

  // Recompensa Nível 4 — 3 sementes plantadas neste nível, lado a lado na frente
  // da cena. Posições placeholder — Gui calibra.
  sementeLvl4A: { bottom: pctH(4), left: pctW(32), width: pctW(10) },
  sementeLvl4B: { bottom: pctH(5), left: pctW(44), width: pctW(10) },
  sementeLvl4C: { bottom: pctH(4), left: pctW(56), width: pctW(10) },

  // Recompensa Nível 4 — flor decorativa adicional (reusa asset da flor do Nível 3)
  florLvl4: { top: pctH(70), left: pctW(40), width: pctW(7) },

  // Recompensa Nível 5 — 3 plantinhas estágio 3 SUBSTITUEM as 3 sementes
  // plantadas no Nível 4 (mesmas posições). Pulam estágio 2 (broto) —
  // sinal de que regar acelerou o crescimento. Posições placeholder.
  plantinhaLvl5A: { bottom: pctH(4), left: pctW(32), width: pctW(12) },
  plantinhaLvl5B: { bottom: pctH(5), left: pctW(44), width: pctW(12) },
  plantinhaLvl5C: { bottom: pctH(4), left: pctW(56), width: pctW(12) },

  // Recompensa Nível 5 — +2 flores decorativas (reuso do asset da flor do
  // Nível 3). Posições placeholder — Gui calibra.
  florLvl5A: { top: pctH(55), left: pctW(32), width: pctW(7) },
  florLvl5B: { top: pctH(39), right: pctW(29), width: pctW(7) },

  // Recompensa Nível 5 "flor no tronco": SUBSTITUI o tronco (não sobrepõe).
  // Posição/proporção idênticas ao `tronco` — asset novo (1426×624) entra
  // exatamente no lugar. O source do Image do tronco é trocado via state
  // `showFlorNoTronco`. Sem entrada própria no WORLD_LAYOUT.

  // Recompensa Nível 6 — 3 mini-árvores SUBSTITUEM as 3 plantinhas estágio 3
  // do Nível 5 (asset reusa o mundo_mini_arvore que era da planta principal
  // no Nível 4). Posições idênticas às plantinhas — continuidade narrativa.
  miniArvoreLvl6A: { bottom: pctH(55), left: pctW(1), width: pctW(25) },
  miniArvoreLvl6B: { bottom: pctH(54.5), left: pctW(16), width: pctW(25) },
  miniArvoreLvl6C: { bottom: pctH(54), left: pctW(74), width: pctW(25) },

  // Recompensa Nível 6 — 2 pássaros (primeira fauna do MVP). Asset
  // mundo_passaro_pousado (850×736). bird_lvl6_a pousa no tronco caído com
  // flor; bird_lvl6_b pousa na pedra (espelhado horizontalmente via
  // scaleX -1 no render, pra parecer um "casal" virado em direções opostas).
  // Posições placeholder — Gui calibra.
  passaroLvl6A: { top: pctH(54), right: pctW(82), width: pctW(10) },
  passaroLvl6B: { top: pctH(50), right: pctW(15), width: pctW(10) },

  // Recompensa Nível 6 — 3 flores amarelas decorativas espalhadas pelo
  // jardim. Asset mundo_flor_amarela (458×855). Posições placeholder.
  florAmarelaLvl6A: { top: pctH(82), left: pctW(54), width: pctW(10) },
  florAmarelaLvl6B: { top: pctH(80), right: pctW(45), width: pctW(10) },
  florAmarelaLvl6C: { bottom: pctH(10), left: pctW(35), width: pctW(10) },

  // Recompensa Nível 7 — árvore frutífera SUBSTITUI a árvore jovem na
  // cadeia da planta principal. Asset mundo_arvore_frutifera (1024×1024).
  // Posição placeholder herda da arvoreJovem como ponto de partida —
  // Gui calibra (a frutífera é mais cheia, pode pedir top diferente).
  arvoreFrutifera: { top: pctH(8.5), left: pctW(8), width: pctW(90) },

  // Recompensa Nível 7 — 1 esquilo decorativo no chão. Asset
  // mundo_esquilo (887×878). Posição placeholder — Gui calibra
  // (provavelmente perto da base da árvore frutífera).
  esquiloChao: { bottom: pctH(52.5), left: pctW(44), width: pctW(12) },

  // Recompensa Nível 7 — 4 flores brancas decorativas espalhadas pelo
  // jardim. Asset mundo_flor_branca (373×854). Posições placeholder.
  florBrancaLvl7A: { top: pctH(46), left: pctW(25), width: pctW(8) },
  florBrancaLvl7B: { top: pctH(65), right: pctW(30), width: pctW(8) },
  florBrancaLvl7C: { bottom: pctH(46), left: pctW(18), width: pctW(8) },
  florBrancaLvl7D: { bottom: pctH(26), right: pctW(22), width: pctW(8) },

  // Recompensa Nível 7 "tronco com flor e esquilo": SUBSTITUI o tronco
  // do Nível 5, mas com posição/tamanho próprios porque o conteúdo
  // visual do asset (3072×1344) tem composição diferente do tronco
  // original — usar o WORLD_LAYOUT.tronco com aspectRatio antigo
  // empurra o esquilo pra fora da área visível. Quando showTroncoEsquilo
  // está ativo, o `<Image>` do tronco original deixa de renderizar e
  // este aqui entra no lugar. Posição placeholder — Gui calibra.
  troncoEsquilo: { bottom: pctH(-21.5), right: pctW(68), width: pctW(28) },

  // Recompensa Nível 7 — pássaro A SUBSTITUI o bird_lvl6_a (mesmo asset).
  // Render próprio com posição independente pra permitir reposicionar o
  // pássaro entre Níveis 6 e 7. Valor inicial idêntico ao do Nível 6 —
  // Gui calibra pra mover o pássaro.
  passaroLvl7A: { top: pctH(23.3), right: pctW(30), width: pctW(10) },

  // ─── Recompensas Nível 8 ────────────────────────────────────────────────
  // Cesta da recompensa com serpente dentro — asset único combinado
  // (cesta + 3 frutas + serpente envolvida). Posição placeholder perto
  // do avatar; Gui calibra. NÃO confundir com a cesta da atividade
  // (essa é permanente no Mundo, aquela é só do mapa de jogo).
  cestaSerpente: { bottom: pctH(8), left: pctW(40), width: pctW(28) },
  // 2 borboletas DIFERENTES (não é mirror). butterfly_perched_lvl8
  // pousada numa flor; butterfly_flying_lvl8 voando em direção a outra.
  // Posições placeholder — Gui calibra.
  borboletaPousada: { top: pctH(60), left: pctW(20), width: pctW(12) },
  borboletaVoando: { top: pctH(40), right: pctW(20), width: pctW(12) },

  // ─── Recalibração Nível 8 — versões _lvl8 com posições próprias ────────
  // Padrão "elemento que muda de posição entre níveis" (Nv 7 → Nv 8).
  // Posições iniciais HERDADAS das versões anteriores como ponto de
  // partida — Gui ajusta na fase de polish via Fast Refresh, sem afetar
  // os layouts dos Níveis 1-7 (que continuam usando as chaves originais).

  // Pedra Nv 8 — versão calibrável (a `pedra` original sempre renderizou
  // sem flag; agora `pedra_lvl8` é o slot independente).
  pedraLvl8: { top: pctH(3), right: pctW(8), width: pctW(20) },

  // Tronco com flor e esquilo Nv 8 — herda do troncoEsquilo (Nv 7).
  troncoEsquiloLvl8: { bottom: pctH(-21.5), right: pctW(68), width: pctW(28) },

  // 2 pássaros Nv 8 — bird_lvl8_a herda do passaroLvl7A;
  // bird_lvl8_b herda do passaroLvl6B (que era espelhado scaleX -1).
  passaroLvl8A: { top: pctH(23.3), right: pctW(30), width: pctW(10) },
  passaroLvl8B: { top: pctH(50), right: pctW(15), width: pctW(10) },

  // Esquilo no chão Nv 8 — herda do esquiloChao (Nv 7).
  esquiloChaoLvl8: { bottom: pctH(38), left: pctW(41), width: pctW(12) },

  // 4 flores rosa Nv 8 — A herda do flor (Nv 3), B do florLvl4,
  // C/D dos florLvl5A/B.
  florLvl8A: { top: pctH(49), right: pctW(1), width: pctW(7) },
  florLvl8B: { top: pctH(70), left: pctW(40), width: pctW(7) },
  florLvl8C: { top: pctH(55), left: pctW(32), width: pctW(7) },
  florLvl8D: { top: pctH(39), right: pctW(29), width: pctW(7) },

  // 3 flores amarelas Nv 8 — herdam dos florAmarelaLvl6A/B/C.
  florAmarelaLvl8A: { top: pctH(82), left: pctW(54), width: pctW(10) },
  florAmarelaLvl8B: { top: pctH(80), right: pctW(45), width: pctW(10) },
  florAmarelaLvl8C: { bottom: pctH(10), left: pctW(35), width: pctW(10) },

  // 4 flores brancas Nv 8 — herdam dos florBrancaLvl7A/B/C/D.
  florBrancaLvl8A: { top: pctH(46), left: pctW(25), width: pctW(8) },
  florBrancaLvl8B: { top: pctH(65), right: pctW(30), width: pctW(8) },
  florBrancaLvl8C: { bottom: pctH(46), left: pctW(18), width: pctW(8) },
  florBrancaLvl8D: { bottom: pctH(26), right: pctW(22), width: pctW(8) },

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
// Assets Nível 6 (extensão .jpg, mas conteúdo binário é PNG com transparência —
// Gui validar visualmente que o Metro carrega corretamente).
const MUNDO_PASSARO = require("../assets/mundo/mundo_passaro_pousado.jpg");
const MUNDO_FLOR_AMARELA = require("../assets/mundo/mundo_flor_amarela.jpg");
// Assets Nível 7 (todos .png após padronização — antes chegaram como
// .jpg/.jpeg mas o binário sempre foi PNG; renomeio na Fase 2 evita
// o risco que tivemos no Nível 6 com o Metro decidindo decoder pela
// extensão. O tronco_com_flor_e_esquilo é colormap (sem RGBA) — Gui
// validar visualmente se a transparência funciona corretamente).
const MUNDO_ARVORE_FRUTIFERA = require("../assets/mundo/mundo_arvore_frutifera.png");
const MUNDO_ESQUILO = require("../assets/mundo/mundo_esquilo.png");
const MUNDO_FLOR_BRANCA = require("../assets/mundo/mundo_flor_branca.png");
const MUNDO_TRONCO_FLOR_ESQUILO = require("../assets/mundo/mundo_tronco_com_flor_e_esquilo.png");
// Assets Nível 8 — transformação visual major. background_mundo_v3
// (720×1260, vertical) substitui o v2 quando ativo. Cesta com
// serpente (2048², asset combinado), 2 borboletas DIFERENTES
// (não é mirror — assets distintos). Ver DECISIONS.md sobre a
// entrada da serpente.
const MUNDO_BG_V3 = require("../assets/mundo/background_mundo_v3.png");
const MUNDO_CESTA_SERPENTE = require("../assets/mundo/mundo_cesta_recompensa_com_serpente.png");
const MUNDO_BORBOLETA_POUSADA = require("../assets/mundo/mundo_borboleta_pousada.png");
const MUNDO_BORBOLETA_VOANDO = require("../assets/mundo/mundo_borboleta_voando.png");

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
  // Recompensas do Nível 6: 2 pássaros + 3 mini-árvores (substituem as 3
  // plantinhas estágio 3 do Nível 5) + 3 flores amarelas decorativas.
  const [showMiniArvoreLvl6A, setShowMiniArvoreLvl6A] = useState(false);
  const [showMiniArvoreLvl6B, setShowMiniArvoreLvl6B] = useState(false);
  const [showMiniArvoreLvl6C, setShowMiniArvoreLvl6C] = useState(false);
  const [showPassaroLvl6A, setShowPassaroLvl6A] = useState(false);
  const [showPassaroLvl6B, setShowPassaroLvl6B] = useState(false);
  const [showFlorAmarelaLvl6A, setShowFlorAmarelaLvl6A] = useState(false);
  const [showFlorAmarelaLvl6B, setShowFlorAmarelaLvl6B] = useState(false);
  const [showFlorAmarelaLvl6C, setShowFlorAmarelaLvl6C] = useState(false);
  // Recompensas do Nível 7: árvore frutífera substitui a árvore jovem;
  // tronco com flor+esquilo substitui o tronco-com-flor (cadeia tripla);
  // +1 esquilo no chão; +4 flores brancas.
  const [showArvoreFrutifera, setShowArvoreFrutifera] = useState(false);
  const [showTroncoEsquilo, setShowTroncoEsquilo] = useState(false);
  const [showEsquiloChao, setShowEsquiloChao] = useState(false);
  const [showFlorBrancaLvl7A, setShowFlorBrancaLvl7A] = useState(false);
  const [showFlorBrancaLvl7B, setShowFlorBrancaLvl7B] = useState(false);
  const [showFlorBrancaLvl7C, setShowFlorBrancaLvl7C] = useState(false);
  const [showFlorBrancaLvl7D, setShowFlorBrancaLvl7D] = useState(false);
  const [showPassaroLvl7A, setShowPassaroLvl7A] = useState(false);
  // Recompensas do Nível 8 — TRANSFORMAÇÃO VISUAL MAJOR.
  // showBgV3 ativa background v3 (substitui v2) E suprime do primeiro
  // plano a árvore frutífera (fruit_tree_lvl7) + 3 mini-árvores
  // (mini_tree_lvl6_a/b/c) — eles passam a fazer parte do background.
  // Tronco caído + esquilo + fauna + flores MANTÊM no primeiro plano.
  // Cesta da recompensa (com serpente dentro) + 2 borboletas DIFERENTES
  // entram como elementos novos.
  const [showBgV3, setShowBgV3] = useState(false);
  const [showCestaSerpente, setShowCestaSerpente] = useState(false);
  const [showBorboletaPousada, setShowBorboletaPousada] = useState(false);
  const [showBorboletaVoando, setShowBorboletaVoando] = useState(false);
  // Recalibração Nv 8 — versões _lvl8 com posições próprias (mesmos
  // assets dos elementos originais, IDs independentes pra calibração
  // sem afetar layout dos Níveis 1-7).
  const [showPedraLvl8, setShowPedraLvl8] = useState(false);
  const [showTroncoEsquiloLvl8, setShowTroncoEsquiloLvl8] = useState(false);
  const [showPassaroLvl8A, setShowPassaroLvl8A] = useState(false);
  const [showPassaroLvl8B, setShowPassaroLvl8B] = useState(false);
  const [showEsquiloChaoLvl8, setShowEsquiloChaoLvl8] = useState(false);
  const [showFlorLvl8A, setShowFlorLvl8A] = useState(false);
  const [showFlorLvl8B, setShowFlorLvl8B] = useState(false);
  const [showFlorLvl8C, setShowFlorLvl8C] = useState(false);
  const [showFlorLvl8D, setShowFlorLvl8D] = useState(false);
  const [showFlorAmarelaLvl8A, setShowFlorAmarelaLvl8A] = useState(false);
  const [showFlorAmarelaLvl8B, setShowFlorAmarelaLvl8B] = useState(false);
  const [showFlorAmarelaLvl8C, setShowFlorAmarelaLvl8C] = useState(false);
  const [showFlorBrancaLvl8A, setShowFlorBrancaLvl8A] = useState(false);
  const [showFlorBrancaLvl8B, setShowFlorBrancaLvl8B] = useState(false);
  const [showFlorBrancaLvl8C, setShowFlorBrancaLvl8C] = useState(false);
  const [showFlorBrancaLvl8D, setShowFlorBrancaLvl8D] = useState(false);

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
    // Nível 8 — flag de transformação visual major. Quando ativo:
    //   - Background v3 substitui v2 (lógica do source do ImageBackground).
    //   - Árvore principal (cadeia inteira) E 3 mini-árvores DEIXAM de
    //     renderizar no primeiro plano (passam a fazer parte do bg v3).
    // Tronco com flor+esquilo, fauna e flores CONTINUAM normalmente.
    const hasBgV3 = worldElements?.includes("background_mundo_v3") ?? false;
    // Recalibração Nv 8 — flags lidas no topo pra poder suprimir os
    // elementos antigos correspondentes (cada `_lvl8` "esconde" sua
    // versão anterior mantendo posicionamento independente).
    const hasPedraLvl8 = worldElements?.includes("stone_lvl8") ?? false;
    const hasTroncoEsquiloLvl8 =
      worldElements?.includes("fallen_log_with_flower_and_squirrel_lvl8") ??
      false;
    const hasBirdLvl8A = worldElements?.includes("bird_lvl8_a") ?? false;
    const hasBirdLvl8B = worldElements?.includes("bird_lvl8_b") ?? false;
    const hasEsquiloChaoLvl8 =
      worldElements?.includes("squirrel_lvl8_ground") ?? false;
    const hasFlorLvl8A = worldElements?.includes("flower_lvl8_a") ?? false;
    const hasFlorLvl8B = worldElements?.includes("flower_lvl8_b") ?? false;
    const hasFlorLvl8C = worldElements?.includes("flower_lvl8_c") ?? false;
    const hasFlorLvl8D = worldElements?.includes("flower_lvl8_d") ?? false;
    const hasFlorAmarelaLvl8A =
      worldElements?.includes("yellow_flower_lvl8_a") ?? false;
    const hasFlorAmarelaLvl8B =
      worldElements?.includes("yellow_flower_lvl8_b") ?? false;
    const hasFlorAmarelaLvl8C =
      worldElements?.includes("yellow_flower_lvl8_c") ?? false;
    const hasFlorBrancaLvl8A =
      worldElements?.includes("white_flower_lvl8_a") ?? false;
    const hasFlorBrancaLvl8B =
      worldElements?.includes("white_flower_lvl8_b") ?? false;
    const hasFlorBrancaLvl8C =
      worldElements?.includes("white_flower_lvl8_c") ?? false;
    const hasFlorBrancaLvl8D =
      worldElements?.includes("white_flower_lvl8_d") ?? false;
    const hasArvoreFrutifera = worldElements?.includes("fruit_tree_lvl7") ?? false;
    const hasArvoreJovem = worldElements?.includes("young_tree_lvl5") ?? false;
    const hasMiniArvore = worldElements?.includes("mini_tree_lvl4") ?? false;
    const hasGrownSprout = worldElements?.includes("grown_sprout_lvl3") ?? false;
    const hasSprout = worldElements?.includes("sprout_lvl2") ?? false;
    const hasSeed = worldElements?.includes("seed_lvl1") ?? false;
    const hasFlower = worldElements?.includes("flower_lvl3") ?? false;

    setShowBgV3(hasBgV3);

    // Substitution chain da planta principal (estendida no Nível 7,
    // suprimida no Nível 8): fruit_tree (lvl7) > young_tree (lvl5) >
    // mini_arvore (lvl4) > grown_sprout (lvl3) > sprout (lvl2) >
    // seed (lvl1). Cada estágio renderiza em posição própria; quando
    // um mais evoluído aparece, os anteriores somem.
    //
    // No Nível 8 (hasBgV3), a cadeia INTEIRA some do primeiro plano —
    // a planta principal "virou paisagem" no background v3.
    setShowArvoreFrutifera(hasArvoreFrutifera && !hasBgV3);
    setShowArvoreJovem(hasArvoreJovem && !hasArvoreFrutifera && !hasBgV3);
    setShowMiniArvore(
      hasMiniArvore && !hasArvoreJovem && !hasArvoreFrutifera && !hasBgV3
    );
    setShowGrownSprout(
      hasGrownSprout &&
        !hasMiniArvore &&
        !hasArvoreJovem &&
        !hasArvoreFrutifera &&
        !hasBgV3
    );
    setShowSprout(
      hasSprout &&
        !hasGrownSprout &&
        !hasMiniArvore &&
        !hasArvoreJovem &&
        !hasArvoreFrutifera &&
        !hasBgV3
    );
    setShowSeed(
      hasSeed &&
        !hasSprout &&
        !hasGrownSprout &&
        !hasMiniArvore &&
        !hasArvoreJovem &&
        !hasArvoreFrutifera &&
        !hasBgV3
    );
    setShowFlower(hasFlower && !hasFlorLvl8A);

    // Recompensas do Nível 8 — elementos NOVOS no primeiro plano.
    setShowCestaSerpente(
      worldElements?.includes("basket_with_serpent_lvl8") ?? false
    );
    setShowBorboletaPousada(
      worldElements?.includes("butterfly_perched_lvl8") ?? false
    );
    setShowBorboletaVoando(
      worldElements?.includes("butterfly_flying_lvl8") ?? false
    );

    setShowPedraLvl8(hasPedraLvl8);
    setShowTroncoEsquiloLvl8(hasTroncoEsquiloLvl8);
    setShowPassaroLvl8A(hasBirdLvl8A);
    setShowPassaroLvl8B(hasBirdLvl8B);
    setShowEsquiloChaoLvl8(hasEsquiloChaoLvl8);
    setShowFlorLvl8A(hasFlorLvl8A);
    setShowFlorLvl8B(hasFlorLvl8B);
    setShowFlorLvl8C(hasFlorLvl8C);
    setShowFlorLvl8D(hasFlorLvl8D);
    setShowFlorAmarelaLvl8A(hasFlorAmarelaLvl8A);
    setShowFlorAmarelaLvl8B(hasFlorAmarelaLvl8B);
    setShowFlorAmarelaLvl8C(hasFlorAmarelaLvl8C);
    setShowFlorBrancaLvl8A(hasFlorBrancaLvl8A);
    setShowFlorBrancaLvl8B(hasFlorBrancaLvl8B);
    setShowFlorBrancaLvl8C(hasFlorBrancaLvl8C);
    setShowFlorBrancaLvl8D(hasFlorBrancaLvl8D);

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
    setShowFlowerLvl4(
      (worldElements?.includes("flower_lvl4") ?? false) && !hasFlorLvl8B
    );

    // Recompensas do Nível 5:
    //   1. background v2 substitui v1 (ImageBackground source decide qual usar)
    //   2. plantinhas estágio 3 substituem sementes lvl4 (já tratado acima)
    //   3. +2 flores decorativas
    //   4. +1 flor brota do tronco caído
    //
    // Cadeia de substituição: cada plantinha lvl5 é por sua vez SUBSTITUÍDA
    // pela mini-árvore lvl6 correspondente (mesma posição, asset diferente).
    const hasMiniArvore6A = worldElements?.includes("mini_tree_lvl6_a") ?? false;
    const hasMiniArvore6B = worldElements?.includes("mini_tree_lvl6_b") ?? false;
    const hasMiniArvore6C = worldElements?.includes("mini_tree_lvl6_c") ?? false;
    setShowBgV2(worldElements?.includes("background_mundo_v2") ?? false);
    setShowPlantinhaLvl5A(hasPlantinhaA && !hasMiniArvore6A);
    setShowPlantinhaLvl5B(hasPlantinhaB && !hasMiniArvore6B);
    setShowPlantinhaLvl5C(hasPlantinhaC && !hasMiniArvore6C);
    setShowFlowerLvl5A(
      (worldElements?.includes("flower_lvl5_a") ?? false) && !hasFlorLvl8C
    );
    setShowFlowerLvl5B(
      (worldElements?.includes("flower_lvl5_b") ?? false) && !hasFlorLvl8D
    );
    setShowFlorNoTronco(worldElements?.includes("flower_no_tronco") ?? false);

    // Recompensas do Nível 7:
    //   1. árvore frutífera substitui árvore jovem (já tratado acima na cadeia)
    //   2. tronco com flor+esquilo substitui flor_no_tronco — cadeia tripla
    //      do tronco: tronco original → flor_no_tronco → tronco_flor_esquilo
    //   3. +1 esquilo no chão
    //   4. +4 flores brancas
    setShowTroncoEsquilo(
      (worldElements?.includes("fallen_log_with_flower_and_squirrel_lvl7") ??
        false) && !hasTroncoEsquiloLvl8
    );
    setShowEsquiloChao(
      (worldElements?.includes("squirrel_lvl7_ground") ?? false) &&
        !hasEsquiloChaoLvl8
    );
    setShowFlorBrancaLvl7A(
      (worldElements?.includes("white_flower_lvl7_a") ?? false) &&
        !hasFlorBrancaLvl8A
    );
    setShowFlorBrancaLvl7B(
      (worldElements?.includes("white_flower_lvl7_b") ?? false) &&
        !hasFlorBrancaLvl8B
    );
    setShowFlorBrancaLvl7C(
      (worldElements?.includes("white_flower_lvl7_c") ?? false) &&
        !hasFlorBrancaLvl8C
    );
    setShowFlorBrancaLvl7D(
      (worldElements?.includes("white_flower_lvl7_d") ?? false) &&
        !hasFlorBrancaLvl8D
    );

    // Recompensas do Nível 6:
    //   1. 3 mini-árvores substituem as 3 plantinhas estágio 3 do Nível 5
    //      (sementes do Nível 4 → plantinhas do Nível 5 → mini-árvores do Nível 6)
    //   2. 2 pássaros (primeira fauna) — bird_lvl6_b é espelhado horizontalmente
    //      no render (transform scaleX: -1)
    //   3. 3 flores amarelas decorativas
    // Mini-árvores Nível 6 — quando hasBgV3 ativo (Nível 8 completo),
    // as 3 SOMEM do primeiro plano (passam a ser parte das árvores
    // médias do background v3). Mesmo padrão da árvore principal.
    setShowMiniArvoreLvl6A(hasMiniArvore6A && !hasBgV3);
    setShowMiniArvoreLvl6B(hasMiniArvore6B && !hasBgV3);
    setShowMiniArvoreLvl6C(hasMiniArvore6C && !hasBgV3);
    // Cadeia do pássaro A: bird_lvl6_a → bird_lvl7_a (mesmo asset, posição
    // independente entre os níveis). O lvl6 só aparece se o lvl7 não está
    // ativo — caso contrário visualmente teríamos 2 pássaros idênticos.
    const hasBirdLvl7A = worldElements?.includes("bird_lvl7_a") ?? false;
    setShowPassaroLvl6A(
      (worldElements?.includes("bird_lvl6_a") ?? false) && !hasBirdLvl7A
    );
    setShowPassaroLvl7A(hasBirdLvl7A && !hasBirdLvl8A);
    setShowPassaroLvl6B(
      (worldElements?.includes("bird_lvl6_b") ?? false) && !hasBirdLvl8B
    );
    setShowFlorAmarelaLvl6A(
      (worldElements?.includes("yellow_flower_lvl6_a") ?? false) &&
        !hasFlorAmarelaLvl8A
    );
    setShowFlorAmarelaLvl6B(
      (worldElements?.includes("yellow_flower_lvl6_b") ?? false) &&
        !hasFlorAmarelaLvl8B
    );
    setShowFlorAmarelaLvl6C(
      (worldElements?.includes("yellow_flower_lvl6_c") ?? false) &&
        !hasFlorAmarelaLvl8C
    );
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
        source={showBgV3 ? MUNDO_BG_V3 : showBgV2 ? MUNDO_BG_V2 : MUNDO_BG_V1}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        {/* Z-layer 1: Scenery (pedra, tronco) — quadrante superior direito */}
        <Animated.View style={[fadeStyle, { position: "absolute", width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}>
          {/* Pedra (Nv 1-7) — upper right area. Suprimida quando
              stone_lvl8 está ativo (Nível 8 completo) — a pedraLvl8
              entra como elemento próprio com posição independente. */}
          {!showPedraLvl8 && (
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
          )}

          {/* Pedra Nv 8 — versão calibrável independente. Mesmo asset
              MUNDO_PEDRA, posição própria via WORLD_LAYOUT.pedraLvl8. */}
          {showPedraLvl8 && (
            <Image
              source={MUNDO_PEDRA}
              resizeMode="contain"
              style={{
                position: "absolute",
                top: WORLD_LAYOUT.pedraLvl8.top,
                right: WORLD_LAYOUT.pedraLvl8.right,
                width: WORLD_LAYOUT.pedraLvl8.width,
                aspectRatio: 1062 / 880,
              }}
            />
          )}

          {/* Tronco — upper right area. Cadeia tronco original → tronco
              com flor (Nível 5), substituição direta por terem proporção
              idêntica (1426×624). Quando showTroncoEsquilo está ativo
              (Nível 7), o tronco com esquilo entra como elemento próprio
              embaixo, e este tronco aqui some pra não duplicar. Mesma
              regra pro Nv 8 (showTroncoEsquiloLvl8) — quando ele entra,
              este tronco aqui também some. */}
          {!showTroncoEsquilo && !showTroncoEsquiloLvl8 && (
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
          )}

          {/* Tronco com flor e esquilo (recompensa Nível 7) — render
              próprio porque o conteúdo visual do asset (3072×1344) tem
              composição diferente do tronco original. Posição placeholder
              herdada do tronco como ponto de partida — Gui calibra
              (provavelmente vai precisar width maior + top diferente
              pra acomodar o esquilo). */}
          {showTroncoEsquilo && (
            <Image
              source={MUNDO_TRONCO_FLOR_ESQUILO}
              resizeMode="contain"
              style={{
                position: "absolute",
                top: WORLD_LAYOUT.troncoEsquilo.bottom,
                right: WORLD_LAYOUT.troncoEsquilo.right,
                width: WORLD_LAYOUT.troncoEsquilo.width,
                transform: [{ rotate: '-4deg' }],
                aspectRatio: 3072 / 1344,
              }}
            />
          )}
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
                zIndex: 10,
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

        {/* Z-layer 3.96: Árvore frutífera (recompensa do Nível 7) —
             substitui a árvore jovem na cadeia da planta principal.
             Asset 1024×1024 RGBA. Posição placeholder herda da árvore
             jovem como ponto de partida — Gui calibra. */}
        {showArvoreFrutifera && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.arvoreFrutifera.top,
                left: WORLD_LAYOUT.arvoreFrutifera.left,
                width: WORLD_LAYOUT.arvoreFrutifera.width,
                aspectRatio: 1024 / 1024,
                zIndex: 10,
              },
            ]}
          >
            <Image
              source={MUNDO_ARVORE_FRUTIFERA}
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

        {/* Z-layer 4.4: 3 mini-árvores (recompensa Nível 6) — substituem
             visualmente as 3 plantinhas estágio 3 do Nível 5, mesma posição.
             Cadeia: semente lvl4 → plantinha lvl5 → mini-árvore lvl6.
             Asset reusa mundo_mini_arvore.png (784×1176). */}
        {showMiniArvoreLvl6A && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.miniArvoreLvl6A.bottom,
                left: WORLD_LAYOUT.miniArvoreLvl6A.left,
                width: WORLD_LAYOUT.miniArvoreLvl6A.width,
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
        {showMiniArvoreLvl6B && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.miniArvoreLvl6B.bottom,
                left: WORLD_LAYOUT.miniArvoreLvl6B.left,
                width: WORLD_LAYOUT.miniArvoreLvl6B.width,
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
        {showMiniArvoreLvl6C && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.miniArvoreLvl6C.bottom,
                left: WORLD_LAYOUT.miniArvoreLvl6C.left,
                width: WORLD_LAYOUT.miniArvoreLvl6C.width,
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

        {/* Z-layer 4.5: 2 pássaros (recompensa Nível 6, primeira fauna do MVP).
             Mesmo asset (850×736). bird_lvl6_b é espelhado horizontalmente
             via transform scaleX: -1 — parece um "casal" virado em direções
             opostas. Posições placeholder — Gui calibra. */}
        {showPassaroLvl6A && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.passaroLvl6A.top,
                right: WORLD_LAYOUT.passaroLvl6A.right,
                width: WORLD_LAYOUT.passaroLvl6A.width,
                aspectRatio: 850 / 736,
                zIndex: 10,
              },
            ]}
          >
            <Image
              source={MUNDO_PASSARO}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}
        {showPassaroLvl6B && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.passaroLvl6B.top,
                right: WORLD_LAYOUT.passaroLvl6B.right,
                width: WORLD_LAYOUT.passaroLvl6B.width,
                aspectRatio: 850 / 736,
                transform: [{ scaleX: -1 }],
              },
            ]}
          >
            <Image
              source={MUNDO_PASSARO}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}

        {/* Pássaro lvl7_a (recompensa Nível 7) — substitui bird_lvl6_a.
             Mesmo asset, render próprio com posição independente do Nível 6.
             Permite que o pássaro mude de lugar no jardim conforme a história
             avança. */}
        {showPassaroLvl7A && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.passaroLvl7A.top,
                right: WORLD_LAYOUT.passaroLvl7A.right,
                width: WORLD_LAYOUT.passaroLvl7A.width,
                aspectRatio: 850 / 736,
                zIndex: 10,
              },
            ]}
          >
            <Image
              source={MUNDO_PASSARO}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}

        {/* Z-layer 4.6: 3 flores amarelas decorativas (recompensa Nível 6).
             Mesmo asset (458×855). Posições placeholder — Gui calibra. */}
        {showFlorAmarelaLvl6A && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.florAmarelaLvl6A.top,
                left: WORLD_LAYOUT.florAmarelaLvl6A.left,
                width: WORLD_LAYOUT.florAmarelaLvl6A.width,
                aspectRatio: 458 / 855,
              },
            ]}
          >
            <Image
              source={MUNDO_FLOR_AMARELA}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}
        {showFlorAmarelaLvl6B && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.florAmarelaLvl6B.top,
                right: WORLD_LAYOUT.florAmarelaLvl6B.right,
                width: WORLD_LAYOUT.florAmarelaLvl6B.width,
                aspectRatio: 458 / 855,
              },
            ]}
          >
            <Image
              source={MUNDO_FLOR_AMARELA}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}
        {showFlorAmarelaLvl6C && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.florAmarelaLvl6C.bottom,
                left: WORLD_LAYOUT.florAmarelaLvl6C.left,
                width: WORLD_LAYOUT.florAmarelaLvl6C.width,
                aspectRatio: 458 / 855,
              },
            ]}
          >
            <Image
              source={MUNDO_FLOR_AMARELA}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}

        {/* Z-layer 4.7: Esquilo no chão (recompensa Nível 7, segunda fauna
             do MVP). Asset mundo_esquilo (887×878). Posição placeholder —
             Gui calibra (perto da base da árvore frutífera). */}
        {showEsquiloChao && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.esquiloChao.bottom,
                left: WORLD_LAYOUT.esquiloChao.left,
                width: WORLD_LAYOUT.esquiloChao.width,
                aspectRatio: 887 / 878,
                zIndex: 10,
              },
            ]}
          >
            <Image
              source={MUNDO_ESQUILO}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}

        {/* Z-layer 4.8: 4 flores brancas decorativas (recompensa Nível 7).
             Mesmo asset mundo_flor_branca (373×854). Posições placeholder —
             Gui calibra. */}
        {showFlorBrancaLvl7A && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.florBrancaLvl7A.top,
                left: WORLD_LAYOUT.florBrancaLvl7A.left,
                width: WORLD_LAYOUT.florBrancaLvl7A.width,
                aspectRatio: 373 / 854,
              },
            ]}
          >
            <Image
              source={MUNDO_FLOR_BRANCA}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}
        {showFlorBrancaLvl7B && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.florBrancaLvl7B.top,
                right: WORLD_LAYOUT.florBrancaLvl7B.right,
                width: WORLD_LAYOUT.florBrancaLvl7B.width,
                aspectRatio: 373 / 854,
              },
            ]}
          >
            <Image
              source={MUNDO_FLOR_BRANCA}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}
        {showFlorBrancaLvl7C && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.florBrancaLvl7C.bottom,
                left: WORLD_LAYOUT.florBrancaLvl7C.left,
                width: WORLD_LAYOUT.florBrancaLvl7C.width,
                aspectRatio: 373 / 854,
              },
            ]}
          >
            <Image
              source={MUNDO_FLOR_BRANCA}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}
        {showFlorBrancaLvl7D && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.florBrancaLvl7D.bottom,
                right: WORLD_LAYOUT.florBrancaLvl7D.right,
                width: WORLD_LAYOUT.florBrancaLvl7D.width,
                aspectRatio: 373 / 854,
              },
            ]}
          >
            <Image
              source={MUNDO_FLOR_BRANCA}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}

        {/* ─── Recalibração Nv 8: 15 elementos com posições próprias ─────
             Mesmos assets dos elementos originais (MUNDO_TRONCO_FLOR_ESQUILO,
             MUNDO_PASSARO, MUNDO_ESQUILO, MUNDO_FLOR, MUNDO_FLOR_AMARELA,
             MUNDO_FLOR_BRANCA), mas com WORLD_LAYOUT.*Lvl8 independentes
             pra Gui calibrar sem afetar layout dos Níveis 1-7. ─────────── */}

        {/* Tronco com flor e esquilo Nv 8 */}
        {showTroncoEsquiloLvl8 && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.troncoEsquiloLvl8.bottom,
                right: WORLD_LAYOUT.troncoEsquiloLvl8.right,
                width: WORLD_LAYOUT.troncoEsquiloLvl8.width,
                transform: [{ rotate: '-4deg' }],
                aspectRatio: 3072 / 1344,
              },
            ]}
          >
            <Image
              source={MUNDO_TRONCO_FLOR_ESQUILO}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}

        {/* 2 pássaros Nv 8 — bird_lvl8_b mantém o mirror horizontal
             (transform scaleX -1) que vinha do bird_lvl6_b */}
        {showPassaroLvl8A && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.passaroLvl8A.top,
                right: WORLD_LAYOUT.passaroLvl8A.right,
                width: WORLD_LAYOUT.passaroLvl8A.width,
                aspectRatio: 850 / 736,
                zIndex: 10,
              },
            ]}
          >
            <Image
              source={MUNDO_PASSARO}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}
        {showPassaroLvl8B && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.passaroLvl8B.top,
                right: WORLD_LAYOUT.passaroLvl8B.right,
                width: WORLD_LAYOUT.passaroLvl8B.width,
                aspectRatio: 850 / 736,
                transform: [{ scaleX: -1 }],
              },
            ]}
          >
            <Image
              source={MUNDO_PASSARO}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}

        {/* Esquilo no chão Nv 8 */}
        {showEsquiloChaoLvl8 && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.esquiloChaoLvl8.bottom,
                left: WORLD_LAYOUT.esquiloChaoLvl8.left,
                width: WORLD_LAYOUT.esquiloChaoLvl8.width,
                aspectRatio: 887 / 878,
                zIndex: 10,
              },
            ]}
          >
            <Image
              source={MUNDO_ESQUILO}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}

        {/* 4 flores rosa Nv 8 — A herda da flor Nv 3 (top/right), B/C/D
             herdam de flowerLvl4/5A/5B respectivamente (top/left).      */}
        {showFlorLvl8A && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.florLvl8A.top,
                right: WORLD_LAYOUT.florLvl8A.right,
                width: WORLD_LAYOUT.florLvl8A.width,
                aspectRatio: 272 / 732,
              },
            ]}
          >
            <Image source={MUNDO_FLOR} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
          </Animated.View>
        )}
        {showFlorLvl8B && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.florLvl8B.top,
                left: WORLD_LAYOUT.florLvl8B.left,
                width: WORLD_LAYOUT.florLvl8B.width,
                aspectRatio: 272 / 732,
              },
            ]}
          >
            <Image source={MUNDO_FLOR} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
          </Animated.View>
        )}
        {showFlorLvl8C && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.florLvl8C.top,
                left: WORLD_LAYOUT.florLvl8C.left,
                width: WORLD_LAYOUT.florLvl8C.width,
                aspectRatio: 272 / 732,
              },
            ]}
          >
            <Image source={MUNDO_FLOR} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
          </Animated.View>
        )}
        {showFlorLvl8D && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.florLvl8D.top,
                right: WORLD_LAYOUT.florLvl8D.right,
                width: WORLD_LAYOUT.florLvl8D.width,
                aspectRatio: 272 / 732,
              },
            ]}
          >
            <Image source={MUNDO_FLOR} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
          </Animated.View>
        )}

        {/* 3 flores amarelas Nv 8 — A/B herdam de florAmarelaLvl6A/B
             (top/left e top/right), C herda de C (bottom/left).         */}
        {showFlorAmarelaLvl8A && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.florAmarelaLvl8A.top,
                left: WORLD_LAYOUT.florAmarelaLvl8A.left,
                width: WORLD_LAYOUT.florAmarelaLvl8A.width,
                aspectRatio: 458 / 855,
              },
            ]}
          >
            <Image source={MUNDO_FLOR_AMARELA} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
          </Animated.View>
        )}
        {showFlorAmarelaLvl8B && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.florAmarelaLvl8B.top,
                right: WORLD_LAYOUT.florAmarelaLvl8B.right,
                width: WORLD_LAYOUT.florAmarelaLvl8B.width,
                aspectRatio: 458 / 855,
              },
            ]}
          >
            <Image source={MUNDO_FLOR_AMARELA} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
          </Animated.View>
        )}
        {showFlorAmarelaLvl8C && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.florAmarelaLvl8C.bottom,
                left: WORLD_LAYOUT.florAmarelaLvl8C.left,
                width: WORLD_LAYOUT.florAmarelaLvl8C.width,
                aspectRatio: 458 / 855,
              },
            ]}
          >
            <Image source={MUNDO_FLOR_AMARELA} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
          </Animated.View>
        )}

        {/* 4 flores brancas Nv 8 — A/B herdam de florBrancaLvl7A/B
             (top/left e top/right), C/D herdam de C/D (bottom/left/right). */}
        {showFlorBrancaLvl8A && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.florBrancaLvl8A.top,
                left: WORLD_LAYOUT.florBrancaLvl8A.left,
                width: WORLD_LAYOUT.florBrancaLvl8A.width,
                aspectRatio: 373 / 854,
              },
            ]}
          >
            <Image source={MUNDO_FLOR_BRANCA} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
          </Animated.View>
        )}
        {showFlorBrancaLvl8B && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.florBrancaLvl8B.top,
                right: WORLD_LAYOUT.florBrancaLvl8B.right,
                width: WORLD_LAYOUT.florBrancaLvl8B.width,
                aspectRatio: 373 / 854,
              },
            ]}
          >
            <Image source={MUNDO_FLOR_BRANCA} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
          </Animated.View>
        )}
        {showFlorBrancaLvl8C && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.florBrancaLvl8C.bottom,
                left: WORLD_LAYOUT.florBrancaLvl8C.left,
                width: WORLD_LAYOUT.florBrancaLvl8C.width,
                aspectRatio: 373 / 854,
              },
            ]}
          >
            <Image source={MUNDO_FLOR_BRANCA} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
          </Animated.View>
        )}
        {showFlorBrancaLvl8D && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.florBrancaLvl8D.bottom,
                right: WORLD_LAYOUT.florBrancaLvl8D.right,
                width: WORLD_LAYOUT.florBrancaLvl8D.width,
                aspectRatio: 373 / 854,
              },
            ]}
          >
            <Image source={MUNDO_FLOR_BRANCA} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
          </Animated.View>
        )}

        {/* Z-layer 4.9: Cesta da recompensa COM SERPENTE dentro
             (recompensa Nível 8). Asset único combinado (2048×2048,
             square) — cesta + 3 frutas + serpente envolvida. Decisão
             narrativa-chave registrada em DECISIONS.md (a serpente
             entra como elemento atrativo, calmo, "boa" — antecipa a
             tentação ativa do Nível 9). Posição placeholder perto do
             avatar — Gui calibra. NÃO confundir com a cesta da
             ATIVIDADE (essa só aparece no mapa de jogo). */}
        {showCestaSerpente && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                bottom: WORLD_LAYOUT.cestaSerpente.bottom,
                left: WORLD_LAYOUT.cestaSerpente.left,
                width: WORLD_LAYOUT.cestaSerpente.width,
                aspectRatio: 1,
                zIndex: 10,
              },
            ]}
          >
            <Image
              source={MUNDO_CESTA_SERPENTE}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}

        {/* Z-layer 4.95: Borboletas do Nível 8. ASSETS DIFERENTES (não é
             mirror do mesmo asset como nos pássaros) — pousada (906×683)
             e voando (820×782) são imagens distintas. Posições placeholder
             — Gui calibra (pousada perto duma flor existente; voando em
             trajetória pra outra flor). */}
        {showBorboletaPousada && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.borboletaPousada.top,
                left: WORLD_LAYOUT.borboletaPousada.left,
                width: WORLD_LAYOUT.borboletaPousada.width,
                aspectRatio: 906 / 683,
              },
            ]}
          >
            <Image
              source={MUNDO_BORBOLETA_POUSADA}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}
        {showBorboletaVoando && (
          <Animated.View
            style={[
              fadeStyle,
              {
                position: "absolute",
                top: WORLD_LAYOUT.borboletaVoando.top,
                right: WORLD_LAYOUT.borboletaVoando.right,
                width: WORLD_LAYOUT.borboletaVoando.width,
                aspectRatio: 820 / 782,
              },
            ]}
          >
            <Image
              source={MUNDO_BORBOLETA_VOANDO}
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        )}

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
