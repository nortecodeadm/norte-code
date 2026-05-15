/**
 * Level Screen — The gameplay screen where the child assembles and runs blocks.
 *
 * UX improvements for MVP:
 * - Clear objective text at the top
 * - Hint shown after 5s of inactivity
 * - Contextual error messages
 * - Visual feedback on success/error
 * - Step-by-step animation with block highlighting
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
} from "react-native-reanimated";

import { getLevel } from "../../lib/levels";
import {
  executeProgram,
  type ProgramNode,
  type ASTNode,
  type WorldState,
  type ExecutionStep,
  type BlockType,
} from "../../lib/interpreter";
import {
  BlockPalette,
  ProgramArea,
  ExecuteButton,
  LevelScene,
  ActivityBasket,
  isContainerBlock,
  type ProgramBlock,
  type ExecuteState,
} from "../../components/level";

// ─── Helpers pra programa com filhos (estruturas aninhadas, Nível 5+) ────────
// Estes utilitários assumem que cada bloco tem ID único na árvore inteira.

// Contagem plana de blocos (inclui filhos). Usada pra checar maxBlocks.
function countBlocks(blocks: ProgramBlock[]): number {
  let total = 0;
  for (const b of blocks) {
    total += 1;
    if (b.children) total += countBlocks(b.children);
  }
  return total;
}

// Converte árvore de ProgramBlock pra AST executável (recursivo).
// repeat_3/repeat_5 viram LoopNode com body recursivo (N hardcoded).
// repeat_until_frutas_3 vira RepeatUntilNode com condição "fruits_equal_3"
// (hardcoded no MVP — Nível 8).
// Demais blocos viram ActionNode — inclusive condicional embutido
// (if_canteiro_vazio_then_plantar), cuja lógica condicional mora no
// interpreter (executeAction), não no AST.
function blocksToAST(blocks: ProgramBlock[]): ASTNode[] {
  return blocks.map((b): ASTNode => {
    if (b.type === "repeat_3" || b.type === "repeat_5") {
      return {
        type: "loop",
        times: b.type === "repeat_3" ? 3 : 5,
        body: blocksToAST(b.children ?? []),
        id: b.id,
      };
    }
    if (b.type === "repeat_until_frutas_3") {
      return {
        type: "repeat_until",
        condition: "fruits_equal_3",
        body: blocksToAST(b.children ?? []),
        id: b.id,
      };
    }
    return { type: "action", name: b.type, id: b.id };
  });
}

// Remove um bloco da árvore por id, em qualquer nível de profundidade.
function removeBlockById(
  blocks: ProgramBlock[],
  id: string
): ProgramBlock[] {
  const result: ProgramBlock[] = [];
  for (const b of blocks) {
    if (b.id === id) continue;
    if (b.children) {
      result.push({ ...b, children: removeBlockById(b.children, id) });
    } else {
      result.push(b);
    }
  }
  return result;
}

// Insere um filho dentro de um container específico (por id), em qualquer
// profundidade. Devolve a árvore atualizada.
function insertInContainer(
  blocks: ProgramBlock[],
  containerId: string,
  child: ProgramBlock
): ProgramBlock[] {
  return blocks.map((b) => {
    if (b.id === containerId) {
      return { ...b, children: [...(b.children ?? []), child] };
    }
    if (b.children) {
      return {
        ...b,
        children: insertInContainer(b.children, containerId, child),
      };
    }
    return b;
  });
}

// Encontra um bloco por id em qualquer profundidade.
function findBlockById(
  blocks: ProgramBlock[],
  id: string
): ProgramBlock | undefined {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.children) {
      const inChild = findBlockById(b.children, id);
      if (inChild) return inChild;
    }
  }
  return undefined;
}

export default function LevelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const levelId = parseInt(id ?? "1", 10);
  const level = getLevel(levelId);

  // State
  const [programBlocks, setProgramBlocks] = useState<ProgramBlock[]>([]);
  const [executeState, setExecuteState] = useState<ExecuteState>("idle");
  const [activeBlockId, setActiveBlockId] = useState<string | undefined>();
  // Resultado da condição do step ativo (apenas blocos condicionais
  // embutidos emitem). UI usa isso pra colorir o destaque do bloco
  // pela cor do ramo executado (verde/azul/cinza).
  const [activeConditionResult, setActiveConditionResult] = useState<
    "plant" | "water" | "none" | undefined
  >(undefined);
  const [worldState, setWorldState] = useState<WorldState | null>(
    level ? JSON.parse(JSON.stringify(level.initialWorld)) : null
  );
  const [showHint, setShowHint] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // "Modo edição" dum container (repeat_3 etc): novos taps na paleta entram
  // pra dentro do envelope. undefined = modo normal (adiciona no topo).
  const [editingContainerId, setEditingContainerId] = useState<
    string | undefined
  >(undefined);

  const blockIdCounter = useRef(0);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // ScrollView que envolve todo o conteúdo central. Antes de executar o
  // programa, rolamos pro topo pra garantir que a criança veja o mapa
  // animando, mesmo que estivesse rolada pra baixo editando.
  const scrollRef = useRef<ScrollView>(null);

  // Hint timer: show hint after 5s of inactivity (no blocks added)
  useEffect(() => {
    if (programBlocks.length === 0 && executeState === "idle") {
      hintTimer.current = setTimeout(() => setShowHint(true), 5000);
    } else {
      setShowHint(false);
      if (hintTimer.current) clearTimeout(hintTimer.current);
    }
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, [programBlocks.length, executeState]);

  // Animations
  const hintOpacity = useSharedValue(0);
  const errorOpacity = useSharedValue(0);

  useEffect(() => {
    hintOpacity.value = withTiming(showHint ? 1 : 0, { duration: 400 });
  }, [showHint]);

  useEffect(() => {
    if (errorMessage) {
      errorOpacity.value = withTiming(1, { duration: 300 });
    } else {
      errorOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [errorMessage]);

  const hintStyle = useAnimatedStyle(() => ({ opacity: hintOpacity.value }));
  const errorStyle = useAnimatedStyle(() => ({ opacity: errorOpacity.value }));

  // ─── HUD do contador de frutas (Nível 8) ─────────────────────────────────
  // Detectado por presence do bloco repeat_until_frutas_3 na paleta —
  // amarra o HUD ao bloco específico, não ao id. Se outro nível usar o
  // mesmo bloco no futuro, o HUD funciona automaticamente.
  const usesFruitsCounter =
    level?.availableBlocks.includes("repeat_until_frutas_3") ?? false;
  const fruitCount = worldState?.player.inventory.fruits ?? 0;
  const fruitsAtTarget = fruitCount === 3;
  // Pulse do HUD quando atinge a meta — animação curta de "sucesso".
  const counterPulse = useSharedValue(1);
  useEffect(() => {
    if (fruitsAtTarget) {
      counterPulse.value = withSequence(
        withTiming(1.18, { duration: 220, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 220, easing: Easing.in(Easing.cubic) })
      );
    } else {
      counterPulse.value = 1;
    }
  }, [fruitsAtTarget]);
  const counterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: counterPulse.value }],
  }));

  if (!level || !worldState) {
    return (
      <SafeAreaView className="flex-1 bg-warm-white items-center justify-center">
        <Text
          className="text-garden-green"
          style={{ fontFamily: "Nunito-Bold", fontSize: 18 }}
        >
          Nível não encontrado
        </Text>
      </SafeAreaView>
    );
  }

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleAddBlock = (type: BlockType) => {
    if (executeState !== "idle" && executeState !== "error") return;

    // Contagem plana (inclui filhos de containers)
    const currentCount = countBlocks(programBlocks);
    if (currentCount >= level.maxBlocks) return;

    blockIdCounter.current += 1;
    const newBlock: ProgramBlock = {
      id: `blk_${blockIdCounter.current}_${Date.now()}`,
      type,
      ...(isContainerBlock(type) ? { children: [] } : {}),
    };

    setProgramBlocks((prev) => {
      // Se há container em modo edição, novo bloco entra DENTRO dele.
      // Containers aninhados são bloqueados aqui (repeat_3 dentro de repeat_3
      // não está suportado no MVP — ver "O que NÃO fazer" do briefing N5).
      if (editingContainerId && !isContainerBlock(type)) {
        return insertInContainer(prev, editingContainerId, newBlock);
      }
      // Container novo sempre vai pro topo da árvore.
      return [...prev, newBlock];
    });

    // Container recém-criado entra automaticamente em modo edição.
    if (isContainerBlock(type)) {
      setEditingContainerId(newBlock.id);
    }

    setErrorMessage(null);

    if (executeState === "error") {
      setExecuteState("idle");
      resetWorld();
    }
  };

  const handleRemoveBlock = (blockId: string) => {
    if (executeState === "running") return;

    // Se o bloco removido for o container em edição, sai do modo.
    if (blockId === editingContainerId) {
      setEditingContainerId(undefined);
    }

    setProgramBlocks((prev) => removeBlockById(prev, blockId));
    setErrorMessage(null);

    if (executeState !== "idle") {
      setExecuteState("idle");
      resetWorld();
    }
  };

  // Tap no cabeçalho do envelope: alterna modo edição. Tocar no envelope
  // que já está em edição encerra o modo (com validação de vazio).
  const handleContainerToggle = (containerId: string) => {
    if (executeState === "running") return;
    if (editingContainerId === containerId) {
      handleContainerDone();
      return;
    }
    setEditingContainerId(containerId);
    setErrorMessage(null);
  };

  // Botão "Pronto ✓": valida que o envelope não está vazio e sai do modo.
  const handleContainerDone = () => {
    if (!editingContainerId) return;
    const container = findBlockById(programBlocks, editingContainerId);
    if (container && (!container.children || container.children.length === 0)) {
      setErrorMessage("Coloca pelo menos um bloco dentro do repetir.");
      return; // modo continua aberto, sem punição
    }
    setEditingContainerId(undefined);
    setErrorMessage(null);
  };

  const resetWorld = () => {
    const cloned = JSON.parse(JSON.stringify(level.initialWorld));
    cloned.goalCondition = level.initialWorld.goalCondition;
    setWorldState(cloned);
    setActiveBlockId(undefined);
    setActiveConditionResult(undefined);
  };

  const handleExecute = async () => {
    if (programBlocks.length === 0) return;
    if (executeState === "running") return;

    // Autoscroll pro topo antes de executar — garante que a criança veja o
    // mapa animando mesmo se estava rolada pra baixo editando o programa.
    // Aguarda a animação terminar antes de iniciar a execução (~400ms).
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Reset world before execution
    const freshWorld: WorldState = JSON.parse(
      JSON.stringify(level.initialWorld)
    );
    // Preserve goalCondition (functions are lost during JSON serialization)
    freshWorld.goalCondition = level.initialWorld.goalCondition;
    setWorldState(freshWorld);
    setExecuteState("running");
    setActiveBlockId(undefined);
    setActiveConditionResult(undefined);
    setErrorMessage(null);

    // Build AST from program blocks (recursivo — suporta repeat_3 com filhos)
    const ast: ProgramNode = {
      type: "program",
      body: blocksToAST(programBlocks),
    };

    // Execute
    const result = executeProgram(ast, freshWorld);

    // Animate steps one by one
    if (result.steps.length > 0) {
      await animateSteps(result.steps, freshWorld);
    }

    // Set final state
    setWorldState(result.finalState);
    setActiveBlockId(undefined);
    setActiveConditionResult(undefined);

    if (result.success) {
      setExecuteState("success");
      // Navigate to summary after a short delay
      setTimeout(() => {
        router.push(`/level-summary/${levelId}`);
      }, 1200);
    } else {
      setExecuteState("error");
      // Caso especial — interpretador setou error (atingiu MAX_EXECUTION_STEPS).
      // No Nível 8 é tipicamente o `repeat_until_frutas_3` sem `pick_fruit`
      // dentro (edge case E3 do briefing) — loop não termina sozinho.
      // wrong_path do level 8 traduz o ctx.error técnico em mensagem
      // adequada à criança.
      if (
        result.error &&
        level.availableBlocks.includes("repeat_until_frutas_3")
      ) {
        setErrorMessage(level.errorMessages.wrong_path || result.error);
      } else {
        const errMsg = getContextualError(
          result.finalState,
          programBlocks,
          result.steps
        );
        setErrorMessage(errMsg);
      }
    }
  };

  const getContextualError = (
    finalState: WorldState,
    blocks: ProgramBlock[],
    steps: ExecutionStep[]
  ): string => {
    // Verificação recursiva: blocos dentro de containers (repeat_3) também contam.
    const anyBlock = (
      bs: ProgramBlock[],
      pred: (t: BlockType) => boolean
    ): boolean =>
      bs.some(
        (b) => pred(b.type) || (b.children ? anyBlock(b.children, pred) : false)
      );

    const hasPlantBlock = anyBlock(blocks, (t) => t === "plant");
    // Inclui ambos os blocos condicionais embutidos (Nível 6 e Nível 7) —
    // do ponto de vista da heurística "tem ou não tem alguma ação no
    // programa", os dois contam. A criança que coloca só o condicional
    // sem mover precisa do mesmo conselho ("ande primeiro") em ambos.
    const hasConditionalAction = anyBlock(
      blocks,
      (t) =>
        t === "if_canteiro_vazio_then_plantar" ||
        t ===
          "if_canteiro_com_semente_then_regar_else_if_canteiro_vazio_then_plantar"
    );
    const hasMoveBlock = anyBlock(
      blocks,
      (t) =>
        t === "move_forward" ||
        t === "move_right" ||
        t === "move_down" ||
        t === "move_up" ||
        t === "move_left"
    );
    const hasWaterBlock = anyBlock(blocks, (t) => t === "water");
    // Ação de coleta (Nível 8). Conta como "ação" pra heurística de
    // "Monte seu programa" — programa com só pick_fruit sem mover deve
    // cair em "ande até a árvore", não em "monte seu programa".
    const hasFruitAction = anyBlock(blocks, (t) => t === "pick_fruit");
    const usesFruitsCounter = level.availableBlocks.includes(
      "repeat_until_frutas_3"
    );

    // "Programa só com bloco condicional sem mover" cai numa msg específica
    // — a heurística antiga falava "Monte seu programa!" mesmo com blocos
    // presentes, o que confundiria a criança nos Níveis 6, 7 e 8.
    if (
      !hasMoveBlock &&
      !hasPlantBlock &&
      !hasConditionalAction &&
      !hasFruitAction
    ) {
      return "Monte seu programa! Toque nos blocos acima.";
    }
    if (
      !hasMoveBlock &&
      (hasConditionalAction || hasFruitAction) &&
      !hasPlantBlock
    ) {
      // Fallback string preserva texto antigo dos Níveis 6/7 ("canteiros").
      // Pra níveis com pick_fruit (Nível 8+), o nível define `didnt_move`
      // com mensagem específica ("perto da árvore"), que tem prioridade.
      return (
        level.errorMessages.didnt_move ||
        "O avatar precisa andar pra encontrar canteiros. Use o bloco Direita."
      );
    }
    if (!hasMoveBlock) {
      return level.errorMessages.didnt_move || "Tente andar até o canteiro primeiro!";
    }
    if (!hasPlantBlock && level.availableBlocks.includes("plant")) {
      return level.errorMessages.no_plant || level.errorMessages.no_seed || "Faltou plantar! Use o bloco \"Plantar\".";
    }
    if (!hasWaterBlock && level.availableBlocks.includes("water")) {
      return level.errorMessages.no_water || "Faltou regar! Use o bloco \"Regar\".";
    }
    // Nível 8: programa tem move + algum mecanismo de coleta (pick_fruit
    // direto ou dentro do repeat_until), mas terminou sem 3 frutas.
    if (usesFruitsCounter && hasFruitAction) {
      const finalFruits = finalState.player.inventory.fruits;
      if (finalFruits === 0) {
        // Avatar não chegou na árvore (E4/E5 do briefing): andou demais
        // pra um lado, ou andou de menos. Mensagem específica do nível.
        return (
          level.errorMessages.not_at_planting_spot ||
          "O avatar precisa estar perto da árvore pra pegar frutas. Use os blocos de movimento."
        );
      }
      if (finalFruits < 3) {
        // Avatar pegou alguma(s), mas terminou antes de 3 — tipicamente
        // programa muito curto (só 1-2 pick_fruit, sem repeat_until).
        return (
          level.errorMessages.no_fruits ||
          "Ainda faltam frutas pra pegar. Verifica seu programa."
        );
      }
      // > 3 não é alcançável — pick_fruit é idempotente em >= 3 e o
      // goalCondition === 3 trata succedido. Cai pra heurística genérica
      // se algum dia chegar aqui.
    }

    // Se houve fail_move, escolher mensagem específica baseada no motivo do primeiro
    // fail_move (rocha ou saída da grade). Mensagens distintas dependem do nível
    // ter as chaves configuradas — sem chave, cai pra mensagem genérica de caminho.
    const firstFailMove = steps.find((s) => s.action === "fail_move");
    if (firstFailMove) {
      if (
        firstFailMove.failReason === "out_of_grid" &&
        level.errorMessages.out_of_grid
      ) {
        return level.errorMessages.out_of_grid;
      }
      if (
        firstFailMove.failReason === "rock" &&
        level.errorMessages.blocked_by_rock
      ) {
        return level.errorMessages.blocked_by_rock;
      }
    }

    // Check if player tried to move into a rock (fail_move happened)
    // If flowerbed still exists and there's a rock in the grid, likely blocked
    const hasRock = finalState.grid.some((row) =>
      row.some((cell) => cell.content === "rock")
    );

    // Check if flowerbed still unplanted
    const hasFlowerbedRemaining = finalState.grid.some((row) =>
      row.some((cell) => cell.content === "flowerbed")
    );
    if (hasFlowerbedRemaining && hasRock) {
      return level.errorMessages.blocked_by_rock || level.errorMessages.wrong_path || "Tem uma pedra no caminho! Tente outro caminho.";
    }
    if (hasFlowerbedRemaining) {
      return level.errorMessages.not_at_planting_spot || level.errorMessages.plant_wrong_spot || level.errorMessages.wrong_position || "Você precisa andar até o canteiro antes de plantar!";
    }

    // Nível 5+: o objetivo é regar canteiros já plantados (content === "seed").
    // Se ainda restam seeds não regadas, a criança não cobriu todos os pontos.
    const usesWaterOnly =
      level.availableBlocks.includes("water") &&
      !level.availableBlocks.includes("plant");
    if (usesWaterOnly) {
      const hasUnwateredSeed = finalState.grid.some((row) =>
        row.some((cell) => cell.content === "seed")
      );
      if (hasUnwateredSeed) {
        return (
          level.errorMessages.not_at_watering_spot ||
          level.errorMessages.wrong_path ||
          "Você ainda não regou todos os canteiros."
        );
      }
    }

    // Check if watering_spot still unwatered
    const hasWateringSpotRemaining = finalState.grid.some((row) =>
      row.some((cell) => cell.content === "watering_spot")
    );
    if (hasWateringSpotRemaining && hasWaterBlock) {
      return level.errorMessages.wrong_path || "Acho que o caminho não está certo. Olha onde precisa regar.";
    }

    return level.errorMessages.wrong_path || "Quase! Tente uma ordem diferente dos blocos.";
  };

  const animateSteps = (
    steps: ExecutionStep[],
    initialWorld: WorldState
  ): Promise<void> => {
    return new Promise((resolve) => {
      let currentWorld = JSON.parse(JSON.stringify(initialWorld));
      let stepIndex = 0;

      const playNextStep = () => {
        if (stepIndex >= steps.length) {
          resolve();
          return;
        }

        const step = steps[stepIndex];

        // Highlight the active block + propaga resultado condicional (se houver)
        setActiveBlockId(step.blockId);
        setActiveConditionResult(step.conditionResult);

        // Update world state to show this step's result
        currentWorld = {
          ...currentWorld,
          player: step.toState,
        };

        // Apply world changes
        if (step.worldChanges) {
          for (const change of step.worldChanges) {
            currentWorld.grid[change.position.y][change.position.x].content =
              change.to;
          }
        }

        setWorldState(JSON.parse(JSON.stringify(currentWorld)));

        stepIndex++;
        setTimeout(playNextStep, 600); // 600ms per step for child readability
      };

      playNextStep();
    });
  };

  const handleReset = () => {
    setProgramBlocks([]);
    setExecuteState("idle");
    setErrorMessage(null);
    setEditingContainerId(undefined);
    resetWorld();
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-warm-white">
      {/* Header FIXO — sempre visível, mesmo quando criança rola o conteúdo. */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-1">
        <Pressable onPress={() => router.replace('/world')} className="px-3 py-2">
          <Text style={{ fontSize: 18, color: "#1F5F3F" }}>←</Text>
        </Pressable>

        <View className="flex-1 items-center">
          <Text
            className="text-garden-green"
            style={{ fontFamily: "Fraunces-Bold", fontSize: 16 }}
          >
            {level.title}
          </Text>
        </View>

        <Pressable onPress={handleReset} className="px-3 py-2">
          <Text style={{ fontSize: 18, color: "#7A9E7E" }}>↺</Text>
        </Pressable>
      </View>

      {/* Indicador de "modo edição" FIXO logo abaixo do header — fica sempre
          visível mesmo quando criança rola pra baixo editando dentro do
          envelope. Ver decisão de UX em DECISIONS.md (modo via toque).
          Texto dinâmico baseado no tipo do container em edição (Repetir 3×,
          Repetir 5×, etc). */}
      {editingContainerId && (
        <View className="px-6 pt-1">
          <View
            style={{
              backgroundColor: "#FFF4E5",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: "#E8853D",
            }}
          >
            <Text
              style={{
                fontFamily: "Nunito-SemiBold",
                fontSize: 11,
                color: "#A0522D",
                textAlign: "center",
              }}
            >
              ✎ Adicionando blocos dentro de{" "}
              {(() => {
                const container = findBlockById(programBlocks, editingContainerId);
                if (container?.type === "repeat_5") return "Repetir 5×";
                if (container?.type === "repeat_until_frutas_3")
                  return "Repetir até pegar 3 frutas";
                return "Repetir 3×";
              })()}
            </Text>
          </View>
        </View>
      )}

      {/* Conteúdo central rolável (Nível 5+ tem programa que pode crescer
          bastante; tela inteira fica scrollable em vez de ProgramArea ter
          maxHeight com scroll interno — evita scroll-dentro-de-scroll). */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Objective */}
        <View className="px-6 py-1">
          <Text
            className="text-garden-green-700 text-center"
            style={{ fontFamily: "Nunito-SemiBold", fontSize: 13, lineHeight: 18 }}
          >
            {level.objective}
          </Text>
          <Text
            className="text-garden-green-400 text-center mt-1"
            style={{ fontFamily: "Nunito-Regular", fontSize: 11 }}
          >
            {level.description}
          </Text>
        </View>

        {/* HUD do contador de frutas — só aparece nos níveis que usam o
            bloco repeat_until_frutas_3 (Nível 8 atualmente). Cor neutra
            quando X<3, verde-plant + pulse curto quando X===3 (sucesso). */}
        {usesFruitsCounter && (
          <View style={{ alignItems: "center", marginTop: 4 }}>
            <Animated.View
              style={[
                counterStyle,
                {
                  backgroundColor: fruitsAtTarget ? "#5D8A3C" : "#FFF8E7",
                  borderWidth: 1.5,
                  borderColor: fruitsAtTarget ? "#3F6628" : "#D8848C",
                  borderRadius: 999,
                  paddingHorizontal: 14,
                  paddingVertical: 4,
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: "Nunito-Bold",
                  fontSize: 14,
                  color: fruitsAtTarget ? "#FFFFFF" : "#7A4248",
                }}
              >
                🍎 Frutas: {fruitCount} / 3
              </Text>
            </Animated.View>
          </View>
        )}

        {/* Scene — mantém tamanho original (não tenta encolher pra caber). */}
        <LevelScene world={worldState} />

        {/* Cesta da atividade (Nível 8) — par concreto da variável (HUD é
            o par abstrato). Posição placeholder centralizada abaixo do
            grid; Gui calibra na fase de polish. Recebe fruitCount direto
            do worldState pra trocar de asset (vazia → 1 → 2 → 3). */}
        {usesFruitsCounter && (
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <ActivityBasket fruitCount={fruitCount} size={88} />
          </View>
        )}

        {/* Hint */}
        {showHint && (
          <Animated.View style={hintStyle} className="px-6 py-1">
            <View className="bg-amber-50 rounded-xl px-3 py-1 border border-amber-200">
              <Text
                className="text-amber-700 text-center"
                style={{ fontFamily: "Nunito-Regular", fontSize: 11 }}
              >
                {level.hint}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Error message */}
        {errorMessage && (
          <Animated.View style={errorStyle} className="px-6 py-1">
            <View className="bg-red-50 rounded-xl px-3 py-1 border border-red-200">
              <Text
                className="text-red-600 text-center"
                style={{ fontFamily: "Nunito-SemiBold", fontSize: 11 }}
              >
                {errorMessage}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Block Palette — rola junto com o conteúdo. Quando criança rola pra
            ver o programa, a paleta naturalmente fica visível logo acima. */}
        <BlockPalette
          availableBlocks={level.availableBlocks}
          onBlockTap={handleAddBlock}
          disabled={executeState === "running" || executeState === "success"}
        />

        {/* ProgramArea — cresce conforme blocos. Sem altura máxima, sem
            scroll interno (evita scroll-dentro-de-scroll). minHeight pra
            garantir presença visual mesmo com programa vazio. */}
        <View style={{ minHeight: 200 }}>
          <ProgramArea
            blocks={programBlocks}
            onBlockRemove={handleRemoveBlock}
            editingContainerId={editingContainerId}
            onContainerToggle={handleContainerToggle}
            onContainerDone={handleContainerDone}
            activeBlockId={activeBlockId}
            activeConditionResult={activeConditionResult}
            maxBlocks={level.maxBlocks}
            totalCount={countBlocks(programBlocks)}
            disabled={executeState === "running"}
          />
        </View>
      </ScrollView>

      {/* Execute Button FIXO no rodapé — sempre acessível, mesmo quando
          criança está rolada pra baixo editando. Autoscroll pro topo é
          disparado dentro do handleExecute antes da execução começar. */}
      <ExecuteButton
        state={executeState}
        onPress={handleExecute}
        disabled={programBlocks.length === 0}
      />
    </SafeAreaView>
  );
}
