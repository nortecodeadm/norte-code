/**
 * ProgramArea — Shows the blocks the child has assembled into a program.
 *
 * Suporta blocos com filhos (children) — usado por estruturas aninhadas
 * como `repeat_3` (Nível 5+). Quando um bloco com filhos está em "modo de
 * edição", o envelope dele é destacado visualmente e novos toques na paleta
 * entram pra dentro do envelope. O contrato da UX está documentado em
 * DECISIONS.md ("modo de edição via toque").
 */

import React from "react";
import { View, Text, Pressable } from "react-native";
import type { BlockType } from "../../lib/interpreter";

export interface ProgramBlock {
  id: string;
  type: BlockType;
  /**
   * Filhos de blocos estruturais (ex: repeat_3). Quando undefined, o bloco
   * é simples (action). Quando definido, o bloco é envelope e os filhos são
   * executados dentro dele pela camada de interpretação.
   */
  children?: ProgramBlock[];
}

interface ProgramAreaProps {
  blocks: ProgramBlock[];
  onBlockRemove: (id: string) => void;
  /** Identifica o envelope atualmente em "modo edição" (recebe novos taps). */
  editingContainerId?: string;
  /** Toca no envelope: alterna o modo de edição. */
  onContainerToggle?: (id: string) => void;
  /** Botão "Pronto ✓" — sai do modo edição. */
  onContainerDone?: () => void;
  activeBlockId?: string; // Block currently being executed (for highlight)
  maxBlocks: number;
  disabled?: boolean;
  /** Conta plana de blocos (incluindo filhos), usada pra exibir contador. */
  totalCount?: number;
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
  repeat_3: "#E8853D",
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
  repeat_3: "🔄 Repetir 3×",
  if_condition: "? Se...",
  if_else: "?! Se/Senão",
  define_function: "📦 Definir",
  call_function: "▶ Fazer",
  stop: "⏹ Parar",
};

const CONTAINER_TYPES: ReadonlySet<BlockType> = new Set<BlockType>([
  "repeat_3",
]);

export function isContainerBlock(type: BlockType): boolean {
  return CONTAINER_TYPES.has(type);
}

// Verifica se algum descendant (filho, neto, etc) do bloco tem o id buscado.
// Usado pra destacar o envelope de um container quando o interpretador está
// executando um filho dele — pedagogicamente, a criança precisa enxergar que
// o envelope INTEIRO está "rodando", não só o filho folha.
function containsBlockId(block: ProgramBlock, id: string): boolean {
  if (!block.children) return false;
  for (const child of block.children) {
    if (child.id === id) return true;
    if (containsBlockId(child, id)) return true;
  }
  return false;
}

function SimpleBlockRow({
  block,
  index,
  isActive,
  onRemove,
  disabled,
  indent = 0,
}: {
  block: ProgramBlock;
  index: number;
  isActive: boolean;
  onRemove: (id: string) => void;
  disabled: boolean;
  indent?: number;
}) {
  const color = BLOCK_COLORS[block.type];
  return (
    <Pressable
      onPress={() => !disabled && onRemove(block.id)}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: isActive ? color : `${color}22`,
        borderLeftWidth: 4,
        borderLeftColor: color,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginLeft: indent,
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
          width: 18,
        }}
      >
        {index}.
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
      {!disabled && <Text style={{ fontSize: 12, color: "#CCC" }}>✕</Text>}
    </Pressable>
  );
}

function ContainerBlockRow({
  block,
  index,
  isActive,
  isEditing,
  onToggle,
  onDone,
  onRemove,
  disabled,
  activeBlockId,
}: {
  block: ProgramBlock;
  index: number;
  isActive: boolean;
  isEditing: boolean;
  onToggle: () => void;
  onDone: () => void;
  onRemove: (id: string) => void;
  disabled: boolean;
  activeBlockId?: string;
}) {
  const color = BLOCK_COLORS[block.type];
  const children = block.children ?? [];
  const isEmpty = children.length === 0;

  // Envelope brilha quando algum descendant está sendo executado.
  // Mesma estética visual de bloco-folha ativo (background colorido + texto
  // branco). Lógica 100% na UI — interpretador não emite step pra LoopNode.
  const isAnyDescendantActive =
    activeBlockId !== undefined && containsBlockId(block, activeBlockId);
  const isHighlighted = isActive || isAnyDescendantActive;

  return (
    <View
      style={{
        borderWidth: isEditing || isHighlighted ? 2 : 1.5,
        borderColor: isEditing || isHighlighted ? color : `${color}55`,
        borderRadius: 12,
        backgroundColor: isHighlighted
          ? `${color}33`
          : isEditing
            ? `${color}1A`
            : `${color}0D`,
        padding: 10,
      }}
    >
      {/* Cabeçalho do envelope — tap pra alternar modo edição */}
      <Pressable
        onPress={() => !disabled && onToggle()}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          opacity: pressed && !disabled ? 0.7 : 1,
        })}
      >
        <Text
          style={{
            fontFamily: "Nunito-Regular",
            fontSize: 11,
            color: "#7A9E7E",
            marginRight: 8,
            width: 18,
          }}
        >
          {index}.
        </Text>
        <Text
          style={{
            fontFamily: "Nunito-Bold",
            fontSize: 14,
            color: isHighlighted ? "#FFFFFF" : color,
            flex: 1,
            backgroundColor: isHighlighted ? color : "transparent",
            paddingHorizontal: isHighlighted ? 6 : 0,
            borderRadius: 4,
          }}
        >
          {BLOCK_LABELS[block.type]}
        </Text>
        {!disabled && !isEditing && (
          <Pressable
            hitSlop={8}
            onPress={() => onRemove(block.id)}
            style={{ paddingHorizontal: 6 }}
          >
            <Text style={{ fontSize: 12, color: "#CCC" }}>✕</Text>
          </Pressable>
        )}
      </Pressable>

      {/* Slot interno */}
      <View
        style={{
          marginTop: 8,
          paddingLeft: 12,
          borderLeftWidth: 2,
          borderLeftColor: `${color}55`,
          gap: 6,
        }}
      >
        {isEmpty ? (
          <View
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: isEditing ? color : `${color}55`,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Nunito-SemiBold",
                fontSize: 12,
                color: isEditing ? color : "#A0B8A4",
                textAlign: "center",
              }}
            >
              {isEditing
                ? "Toque nos blocos acima — eles entram aqui"
                : "Toque no envelope pra adicionar blocos dentro"}
            </Text>
          </View>
        ) : (
          children.map((child, childIdx) => (
            <SimpleBlockRow
              key={child.id}
              block={child}
              index={childIdx + 1}
              isActive={activeBlockId === child.id}
              onRemove={onRemove}
              disabled={disabled}
            />
          ))
        )}
      </View>

      {/* Botão "Pronto ✓" — só aparece em modo edição. Cor de fundo
          verde-jardim da marca (#1F5F3F) com texto branco-quente — contraste
          ~5:1 (passa WCAG AA em qualquer tamanho de fonte). */}
      {isEditing && !disabled && (
        <Pressable
          onPress={onDone}
          style={({ pressed }) => ({
            marginTop: 10,
            alignSelf: "flex-end",
            backgroundColor: pressed ? "#163F2A" : "#1F5F3F",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 10,
          })}
        >
          <Text
            style={{
              fontFamily: "Nunito-Bold",
              fontSize: 13,
              color: "#FAF6EE",
            }}
          >
            Pronto ✓
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export function ProgramArea({
  blocks,
  onBlockRemove,
  editingContainerId,
  onContainerToggle,
  onContainerDone,
  activeBlockId,
  maxBlocks,
  disabled = false,
  totalCount,
}: ProgramAreaProps) {
  const count = totalCount ?? blocks.length;
  return (
    // Sem flex:1 e sem maxHeight: o componente cresce conforme blocos. A tela
    // do nível (ScrollView externo em app/level/[id].tsx) cuida da rolagem.
    <View className="mx-4 rounded-2xl bg-white/80 border border-garden-green/10 p-3">
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
            color: count >= maxBlocks ? "#D4577B" : "#7A9E7E",
          }}
        >
          {count === 0
            ? ""
            : count >= maxBlocks
              ? `${count} blocos (máx.)`
              : `${count} bloco${count > 1 ? "s" : ""}`}
        </Text>
      </View>

      {/* Block list — sem ScrollView interno (evita scroll-dentro-de-scroll).
          A tela inteira rola, e o programa cresce naturalmente. */}
      <View style={{ gap: 6, paddingBottom: 8 }}>
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
            if (isContainerBlock(block.type)) {
              return (
                <ContainerBlockRow
                  key={block.id}
                  block={block}
                  index={index + 1}
                  isActive={activeBlockId === block.id}
                  isEditing={editingContainerId === block.id}
                  onToggle={() => onContainerToggle?.(block.id)}
                  onDone={() => onContainerDone?.()}
                  onRemove={onBlockRemove}
                  disabled={disabled}
                  activeBlockId={activeBlockId}
                />
              );
            }
            return (
              <SimpleBlockRow
                key={block.id}
                block={block}
                index={index + 1}
                isActive={activeBlockId === block.id}
                onRemove={onBlockRemove}
                disabled={disabled}
              />
            );
          })
        )}
      </View>
    </View>
  );
}
