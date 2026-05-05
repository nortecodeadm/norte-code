/**
 * ExecuteButton — The "Run" button that executes the child's program.
 *
 * States: idle, running, success, error
 */

import React from "react";
import { Pressable, Text, View } from "react-native";
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

  return (
    <Animated.View style={animStyle} className="mx-4 mb-4">
      <Pressable
        onPress={() => !isDisabled && onPress()}
        style={({ pressed }) => ({
          backgroundColor: isDisabled && state !== "running" ? "#B0C4B0" : config.bg,
          borderRadius: 16,
          paddingVertical: 14,
          alignItems: "center",
          opacity: pressed && !isDisabled ? 0.8 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.97 : 1 }],
          shadowColor: config.bg,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 4,
        })}
      >
        <Text
          style={{
            fontFamily: "Nunito-Bold",
            fontSize: 16,
            color: config.text,
          }}
        >
          {config.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
