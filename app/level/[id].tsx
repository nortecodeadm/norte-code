/**
 * Level Screen — The gameplay screen where the child assembles and runs blocks.
 *
 * Layout (top to bottom):
 * 1. Level title + back button
 * 2. Scene (grid visualization) — ~40%
 * 3. Block palette — ~15%
 * 4. Program area (assembled blocks) — ~35%
 * 5. Execute button — ~10%
 */

import { useState, useCallback, useRef } from "react";
import { View, Text, Pressable, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
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

  const blockIdCounter = useRef(0);

  // Animation
  const sceneOpacity = useSharedValue(1);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: sceneOpacity.value }));

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

    // Reset state if was in error
    if (executeState === "error") {
      setExecuteState("idle");
      resetWorld();
    }
  };

  const handleRemoveBlock = (blockId: string) => {
    if (executeState === "running") return;
    setProgramBlocks((prev) => prev.filter((b) => b.id !== blockId));

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
    }
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
        setTimeout(playNextStep, 500); // 500ms per step
      };

      playNextStep();
    });
  };

  const handleReset = () => {
    setProgramBlocks([]);
    setExecuteState("idle");
    resetWorld();
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-warm-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-1">
        <Pressable
          onPress={() => router.back()}
          className="px-3 py-2"
        >
          <Text style={{ fontSize: 18, color: "#1F5F3F" }}>←</Text>
        </Pressable>

        <View className="flex-1 items-center">
          <Text
            className="text-garden-green"
            style={{ fontFamily: "Fraunces-Bold", fontSize: 16 }}
          >
            {level.title}
          </Text>
          <Text
            className="text-garden-green-400"
            style={{ fontFamily: "Nunito-Regular", fontSize: 12 }}
          >
            {level.description}
          </Text>
        </View>

        <Pressable
          onPress={handleReset}
          className="px-3 py-2"
        >
          <Text style={{ fontSize: 14, color: "#7A9E7E" }}>↺</Text>
        </Pressable>
      </View>

      {/* Scene */}
      <Animated.View style={fadeStyle}>
        <LevelScene world={worldState} />
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
