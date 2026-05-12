/**
 * ProgramArea — Shows the blocks the child has assembled into a program.
 *
 * MVP: Vertical list of blocks. Tap a block to remove it.
 * Blocks highlight during execution playback.
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import type { BlockType } from "../../lib/interpreter";

export interface ProgramBlock {
  id: string;
  type: BlockType;
}

interface ProgramAreaProps {
  blocks: ProgramBlock[];
  onBlockRemove: (id: string) => void;
  activeBlockId?: string; // Block currently being executed (for highlight)
  maxBlocks: number;
  disabled?: boolean;
}

const BLOCK_COLORS: Record<BlockType, string> = {
  move_forward: "#4A90D9",
  move_right: "#4A90D9",
  move_down: "#4A90D9",
  move_up: "#4A90D9",
  move_left: "#4A90D9",
  turn_left: "#7B68EE",
  turn_right: "#7B68EE",
  plant: "#5D8A3C",
  water: "#4ECDC4",
  pick_fruit: "#F5A623",
  repeat: "#E8853D",
  if_condition: "#D4577B",
  if_else: "#D4577B",
  define_function: "#8E44AD",
  call_function: "#8E44AD",
  stop: "#95A5A6",
};

const BLOCK_LABELS: Record<BlockType, string> = {
  move_forward: "Andar →",
  move_right: "Direita →",
  move_down: "Descer ↓",
  move_up: "Subir ↑",
  move_left: "Esquerda ←",
  turn_left: "↰ Esquerda",
  turn_right: "Direita ↱",
  plant: "🌱 Plantar",
  water: "💧 Regar",
  pick_fruit: "🍎 Pegar",
  repeat: "🔄 Repetir",
  if_condition: "? Se...",
  if_else: "?! Se/Senão",
  define_function: "📦 Definir",
  call_function: "▶ Fazer",
  stop: "⏹ Parar",
};

export function ProgramArea({
  blocks,
  onBlockRemove,
  activeBlockId,
  maxBlocks,
  disabled = false,
}: ProgramAreaProps) {
  return (
    <View style={{ flex: 1 }} className="mx-4 rounded-2xl bg-white/80 border border-garden-green/10 p-3">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-2">
        <Text
          style={{ fontFamily: "Nunito-SemiBold", fontSize: 12, color: "#1F5F3F" }}
        >
          Seu programa:
        </Text>
        <Text
          style={{
            fontFamily: "Nunito-Regular",
            fontSize: 11,
            color: blocks.length >= maxBlocks ? "#D4577B" : "#7A9E7E",
          }}
        >
          {blocks.length === 0
            ? ""
            : blocks.length >= maxBlocks
              ? `${blocks.length} blocos (máx.)`
              : `${blocks.length} bloco${blocks.length > 1 ? "s" : ""}`}
        </Text>
      </View>

      {/* Block list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingBottom: 8 }}
      >
        {blocks.length === 0 ? (
          <View className="items-center justify-center py-6">
            <Text
              style={{
                fontFamily: "Nunito-SemiBold",
                fontSize: 14,
                color: "#7A9E7E",
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              👆 Toque nos blocos coloridos acima{"\n"}para montar seu programa!
            </Text>
            <Text
              style={{
                fontFamily: "Nunito-Regular",
                fontSize: 11,
                color: "#A0B8A4",
                textAlign: "center",
                marginTop: 6,
              }}
            >
              Depois aperte ▶ para rodar
            </Text>
          </View>
        ) : (
          blocks.map((block, index) => {
            const isActive = activeBlockId === block.id;
            const color = BLOCK_COLORS[block.type];

            return (
              <Pressable
                key={block.id}
                onPress={() => !disabled && onBlockRemove(block.id)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: isActive ? color : `${color}22`,
                  borderLeftWidth: 4,
                  borderLeftColor: color,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  opacity: pressed && !disabled ? 0.6 : 1,
                  transform: [{ scale: isActive ? 1.02 : 1 }],
                })}
              >
                <Text
                  style={{
                    fontFamily: "Nunito-Regular",
                    fontSize: 11,
                    color: "#7A9E7E",
                    marginRight: 8,
                    width: 16,
                  }}
                >
                  {index + 1}.
                </Text>
                <Text
                  style={{
                    fontFamily: "Nunito-SemiBold",
                    fontSize: 13,
                    color: isActive ? "#FFFFFF" : color,
                    flex: 1,
                  }}
                >
                  {BLOCK_LABELS[block.type]}
                </Text>
                {!disabled && (
                  <Text style={{ fontSize: 12, color: "#CCC" }}>✕</Text>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
