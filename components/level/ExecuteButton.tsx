/**
 * ExecuteButton — The "Run" button that executes the child's program.
 *
 * States: idle, running, success, error
 *
 * Design decisions:
 * - Only disabled when program is completely empty (0 blocks)
 * - "Wrong" programs (e.g. only Plant without Walk) are still executable
 *   → child learns from trial and error, not from being blocked
 * - Disabled state uses a visible but muted color (not invisible gray)
 * - Shows contextual label based on state
 */

import React from "react";
import { Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import { useEffect } from "react";

export type ExecuteState = "idle" | "running" | "success" | "error";

interface ExecuteButtonProps {
  state: ExecuteState;
  onPress: () => void;
  disabled?: boolean;
}

const STATE_CONFIG: Record<
  ExecuteState,
  { bg: string; text: string; label: string }
> = {
  idle: { bg: "#1F5F3F", text: "#FFFDF7", label: "▶  Executar" },
  running: { bg: "#4A90D9", text: "#FFFFFF", label: "⏳ Rodando..." },
  success: { bg: "#5D8A3C", text: "#FFFFFF", label: "✓  Conseguiu!" },
  error: { bg: "#D4577B", text: "#FFFFFF", label: "✗  Tente de novo" },
};

export function ExecuteButton({
  state,
  onPress,
  disabled = false,
}: ExecuteButtonProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (state === "running") {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.95, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [state]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const config = STATE_CONFIG[state];
  const isDisabled = disabled || state === "running";

  // Disabled label: helpful hint instead of just grayed out
  const displayLabel = isDisabled && state !== "running"
    ? "Adicione um bloco acima"
    : config.label;

  return (
    <Animated.View style={[animStyle, { marginHorizontal: 16, marginBottom: 16, marginTop: 8 }]}>
      <Pressable
        onPress={() => !isDisabled && onPress()}
        style={({ pressed }) => ({
          backgroundColor: isDisabled && state !== "running" ? "#7A9E7E" : config.bg,
          borderRadius: 16,
          paddingVertical: 16,
          paddingHorizontal: 24,
          alignItems: "center" as const,
          justifyContent: "center" as const,
          opacity: pressed && !isDisabled ? 0.8 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.97 : 1 }],
          shadowColor: config.bg,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: isDisabled ? 0.1 : 0.3,
          shadowRadius: 6,
          elevation: isDisabled ? 2 : 4,
        })}
      >
        <Text
          style={{
            fontFamily: "Nunito-Bold",
            fontSize: 16,
            color: isDisabled && state !== "running" ? "#D4E8D4" : config.text,
          }}
        >
          {displayLabel}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
