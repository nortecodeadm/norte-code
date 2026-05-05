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
import { View, Text, Pressable, SafeAreaView } from "react-native";
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
  type ProgramBlock,
  type ExecuteState,
} from "../../components/level";

export default function LevelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const levelId = parseInt(id ?? "1", 10);
  const level = getLevel(levelId);

  // State
  const [programBlocks, setProgramBlocks] = useState<ProgramBlock[]>([]);
  const [executeState, setExecuteState] = useState<ExecuteState>("idle");
  const [activeBlockId, setActiveBlockId] = useState<string | undefined>();
  const [worldState, setWorldState] = useState<WorldState | null>(
    level ? JSON.parse(JSON.stringify(level.initialWorld)) : null
  );
  const [showHint, setShowHint] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const blockIdCounter = useRef(0);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (programBlocks.length >= level.maxBlocks) return;
    if (executeState !== "idle" && executeState !== "error") return;

    blockIdCounter.current += 1;
    const newBlock: ProgramBlock = {
      id: `blk_${blockIdCounter.current}_${Date.now()}`,
      type,
    };
    setProgramBlocks((prev) => [...prev, newBlock]);
    setErrorMessage(null);

    // Reset state if was in error
    if (executeState === "error") {
      setExecuteState("idle");
      resetWorld();
    }
  };

  const handleRemoveBlock = (blockId: string) => {
    if (executeState === "running") return;
    setProgramBlocks((prev) => prev.filter((b) => b.id !== blockId));
    setErrorMessage(null);

    // Reset if was in error/success
    if (executeState !== "idle") {
      setExecuteState("idle");
      resetWorld();
    }
  };

  const resetWorld = () => {
    setWorldState(JSON.parse(JSON.stringify(level.initialWorld)));
    setActiveBlockId(undefined);
  };

  const handleExecute = async () => {
    if (programBlocks.length === 0) return;
    if (executeState === "running") return;

    // Reset world before execution
    const freshWorld: WorldState = JSON.parse(
      JSON.stringify(level.initialWorld)
    );
    setWorldState(freshWorld);
    setExecuteState("running");
    setActiveBlockId(undefined);
    setErrorMessage(null);

    // Build AST from program blocks
    const ast: ProgramNode = {
      type: "program",
      body: programBlocks.map((block): ASTNode => ({
        type: "action",
        name: block.type,
        id: block.id,
      })),
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

    if (result.success) {
      setExecuteState("success");
      // Navigate to summary after a short delay
      setTimeout(() => {
        router.push(`/level-summary/${levelId}`);
      }, 1200);
    } else {
      setExecuteState("error");
      // Generate contextual error message
      const errMsg = getContextualError(result.finalState, programBlocks);
      setErrorMessage(errMsg);
    }
  };

  const getContextualError = (
    finalState: WorldState,
    blocks: ProgramBlock[]
  ): string => {
    const hasPlantBlock = blocks.some((b) => b.type === "plant");
    const hasMoveBlock = blocks.some((b) => b.type === "move_forward");

    if (!hasMoveBlock && !hasPlantBlock) {
      return "Monte seu programa! Toque nos blocos acima.";
    }
    if (!hasMoveBlock) {
      return level.errorMessages.didnt_move || "Tente andar até o canteiro primeiro!";
    }
    if (!hasPlantBlock) {
      return level.errorMessages.no_seed || "Faltou plantar! Use o bloco \"Plantar\".";
    }

    // Check if planted in wrong position
    const playerPos = finalState.player.position;
    const hasFlowerbedRemaining = finalState.grid.some((row) =>
      row.some((cell) => cell.content === "flowerbed")
    );
    if (hasFlowerbedRemaining) {
      return level.errorMessages.wrong_position || "Você precisa andar até o canteiro antes de plantar!";
    }

    return "Quase! Tente uma ordem diferente dos blocos.";
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

        // Highlight the active block
        setActiveBlockId(step.blockId);

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
    resetWorld();
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-warm-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-1">
        <Pressable onPress={() => router.back()} className="px-3 py-2">
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

      {/* Objective */}
      <View className="px-6 py-2">
        <Text
          className="text-garden-green-700 text-center"
          style={{ fontFamily: "Nunito-SemiBold", fontSize: 14, lineHeight: 20 }}
        >
          {level.objective}
        </Text>
        <Text
          className="text-garden-green-400 text-center mt-1"
          style={{ fontFamily: "Nunito-Regular", fontSize: 12 }}
        >
          {level.description}
        </Text>
      </View>

      {/* Scene */}
      <LevelScene world={worldState} />

      {/* Hint (shown after 5s of inactivity) */}
      <Animated.View style={hintStyle} className="px-6 py-1">
        {showHint && (
          <View className="bg-amber-50 rounded-xl px-4 py-2 border border-amber-200">
            <Text
              className="text-amber-700 text-center"
              style={{ fontFamily: "Nunito-Regular", fontSize: 12 }}
            >
              {level.hint}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Error message */}
      <Animated.View style={errorStyle} className="px-6 py-1">
        {errorMessage && (
          <View className="bg-red-50 rounded-xl px-4 py-2 border border-red-200">
            <Text
              className="text-red-600 text-center"
              style={{ fontFamily: "Nunito-SemiBold", fontSize: 12 }}
            >
              {errorMessage}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Block Palette */}
      <BlockPalette
        availableBlocks={level.availableBlocks}
        onBlockTap={handleAddBlock}
        disabled={executeState === "running" || executeState === "success"}
      />

      {/* Program Area */}
      <ProgramArea
        blocks={programBlocks}
        onBlockRemove={handleRemoveBlock}
        activeBlockId={activeBlockId}
        maxBlocks={level.maxBlocks}
        disabled={executeState === "running"}
      />

      {/* Execute Button */}
      <ExecuteButton
        state={executeState}
        onPress={handleExecute}
        disabled={programBlocks.length === 0}
      />
    </SafeAreaView>
  );
}
