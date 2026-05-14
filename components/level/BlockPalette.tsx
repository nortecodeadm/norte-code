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

// Decide cor do texto (preto ou branco) baseado na luminância do fundo,
// pela fórmula YIQ. Threshold 120 (mais agressivo) força fundos médios
// como azul #4A90D9 e lavanda #7B68EE a ganharem texto preto — caso
// contrário ficavam branco-sobre-claro de baixo contraste. Preto puro
// em vez de #1F2937 maximiza o contraste em fundos médios.
function getContrastTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 120 ? "#000000" : "#FFFFFF";
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
  // a criança lê — ícones ⭕ (mesmo do canteiro vazio no mapa, criando
  // associação visual) + 🌱 (ação embutida).
  if_canteiro_vazio_then_plantar: {
    label: "Se vazio, plantar",
    color: "#A88FD9",
    icon: "⭕ 🌱",
  },
  // Bloco "tudo em um" do Nível 7 (if/else). Mesma cor do Nível 6 — pertence
  // à categoria condicional. Ícone duplo com "/" separa visualmente os 2
  // ramos: 🌱💧 (regar uma semente) / ⭕🌱 (plantar num vazio). Label quebra
  // em 2 linhas pra acomodar o texto longo dentro do bloco da paleta.
  if_canteiro_com_semente_then_regar_else_if_canteiro_vazio_then_plantar: {
    label: "Se com semente, regar;\nsenão, se vazio, plantar",
    color: "#A88FD9",
    icon: "🌱💧 / ⭕🌱",
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
            // Bloco "outline": interior transparente, borda colorida.
            // Cor da borda recebe sufixo 66 (≈40% alpha) pra ficar
            // suave/desbotada, no mesmo registro visual da borda do
            // box "Seu programa" (border-garden-green/10).
            <View
              key={type}
              style={{
                backgroundColor: "transparent",
                borderRadius: 12,
                borderWidth: 2,
                borderColor: disabled ? "#CCC" : `${config.color}66`,
              }}
            >
              <Pressable
                onPress={() => !disabled && onBlockTap(type)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <Text style={{ fontSize: 16 }}>{config.icon}</Text>
                <Text
                  style={{
                    fontFamily: "Nunito-Bold",
                    fontSize: 11,
                    color: "#000000",
                    textAlign: "center",
                  }}
                >
                  {config.label}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
