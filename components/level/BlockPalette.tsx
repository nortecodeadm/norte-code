/**
 * BlockPalette — Shows available blocks that the child can drag to the ProgramArea.
 *
 * MVP: Tap to add (no drag-and-drop yet). Each block is a colored pill
 * with an icon placeholder and label.
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import type { BlockType } from "../../lib/interpreter";

interface BlockPaletteProps {
  availableBlocks: BlockType[];
  onBlockTap: (type: BlockType) => void;
  disabled?: boolean;
}

// Block visual config
const BLOCK_CONFIG: Record<
  BlockType,
  { label: string; color: string; icon: string }
> = {
  move_forward: { label: "Andar", color: "#4A90D9", icon: "→" },
  move_right: { label: "Direita", color: "#4A90D9", icon: "→" },
  move_down: { label: "Descer", color: "#4A90D9", icon: "↓" },
  move_up: { label: "Subir", color: "#4A90D9", icon: "↑" },
  move_left: { label: "Esquerda", color: "#4A90D9", icon: "←" },
  turn_left: { label: "Esquerda", color: "#7B68EE", icon: "↰" },
  turn_right: { label: "Direita", color: "#7B68EE", icon: "↱" },
  plant: { label: "Plantar", color: "#5D8A3C", icon: "🌱" },
  water: { label: "Regar", color: "#4ECDC4", icon: "💧" },
  pick_fruit: { label: "Pegar", color: "#F5A623", icon: "🍎" },
  repeat: { label: "Repetir", color: "#E8853D", icon: "🔄" },
  repeat_3: { label: "Repetir 3×", color: "#E8853D", icon: "🔄" },
  repeat_5: { label: "Repetir 5×", color: "#E8853D", icon: "🔄" },
  if_condition: { label: "Se...", color: "#D4577B", icon: "?" },
  if_else: { label: "Se/Senão", color: "#D4577B", icon: "?!" },
  // Bloco "tudo em um" do Nível 6 (categoria condicional). Cor roxa clara
  // distinta dos demais blocos. Label textual "Se vazio, plantar" é o que
  // a criança lê — ícone 🌱 reforça a ação embutida.
  if_canteiro_vazio_then_plantar: {
    label: "Se vazio, plantar",
    color: "#A88FD9",
    icon: "🌱",
  },
  define_function: { label: "Definir", color: "#8E44AD", icon: "📦" },
  call_function: { label: "Fazer", color: "#8E44AD", icon: "▶" },
  stop: { label: "Parar", color: "#95A5A6", icon: "⏹" },
};

export function BlockPalette({
  availableBlocks,
  onBlockTap,
  disabled = false,
}: BlockPaletteProps) {
  return (
    <View className="py-3 px-4">
      <Text
        style={{
          fontFamily: "Nunito-SemiBold",
          fontSize: 12,
          color: "#1A5035",
          marginBottom: 8,
        }}
      >
        Blocos disponíveis:
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {availableBlocks.map((type) => {
          const config = BLOCK_CONFIG[type];
          return (
            <Pressable
              key={type}
              onPress={() => !disabled && onBlockTap(type)}
              style={({ pressed }) => ({
                backgroundColor: disabled ? "#CCC" : config.color,
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                shadowColor: config.color,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              })}
            >
              <Text style={{ fontSize: 16 }}>{config.icon}</Text>
              <Text
                style={{
                  fontFamily: "Nunito-Bold",
                  fontSize: 13,
                  color: "#FFFFFF",
                }}
              >
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
