/**
 * LevelScene — Visual representation of the level grid.
 *
 * MVP: Colored cells with clear visual cues:
 * - Player: green circle with direction arrow
 * - Flowerbed (target): dashed border + "plante aqui" indicator
 * - Seed: green dot with sprout emoji
 * - Other cells: colored with icons
 */

import React from "react";
import { View, Text, Dimensions } from "react-native";
import type { WorldState, CellContent, Direction } from "../../lib/interpreter";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCENE_PADDING = 24;

interface LevelSceneProps {
  world: WorldState;
}

const CELL_COLORS: Record<CellContent, string> = {
  empty: "#F0E8D8",
  seed: "#C8E6C9",
  sprout: "#A5D6A7",
  flower: "#FFF9C4",
  fruit: "#FFCDD2",
  puddle: "#B3E5FC",
  rock: "#BCAAA4",
  flowerbed: "#FFF3E0", // Light orange to stand out as target
  watering_spot: "#E3F2FD", // Light blue to indicate watering target
  watered: "#B3E5FC", // Blue when watered
  basket: "#D7CCC8",
};

const CELL_ICONS: Record<CellContent, string> = {
  empty: "",
  seed: "🌱",
  sprout: "🌿",
  flower: "🌻",
  fruit: "🍎",
  puddle: "💧",
  rock: "🪨",
  flowerbed: "⭕", // Target indicator
  watering_spot: "💧", // Water drop indicator
  watered: "💦", // Splashing water (completed)
  basket: "🧲",
};

const DIRECTION_ARROWS: Record<Direction, string> = {
  north: "↑",
  south: "↓",
  east: "→",
  west: "←",
};

export function LevelScene({ world }: LevelSceneProps) {
  const maxCellSize = (SCREEN_WIDTH - SCENE_PADDING * 2) / world.gridWidth;
  const cellSize = Math.min(maxCellSize, 100);
  const gridWidth = cellSize * world.gridWidth;
  const gridHeight = cellSize * world.gridHeight;

  // Determine which legend items to show based on grid content
  const hasFlowerbed = world.grid.some((row) =>
    row.some((cell) => cell.content === "flowerbed")
  );
  // CP (canteiro plantado) — célula com semente já plantada. Aparece desde o
  // início no Nível 5 (3 sementes pra regar) e no Nível 6 (1 célula a ignorar).
  // Sem isso na legenda, a criança vê os quadradinhos verdes e não sabe o que é.
  const hasSeed = world.grid.some((row) =>
    row.some((cell) => cell.content === "seed")
  );
  const hasWateringSpot = world.grid.some((row) =>
    row.some((cell) => cell.content === "watering_spot")
  );
  const hasRock = world.grid.some((row) =>
    row.some((cell) => cell.content === "rock")
  );
  // Quando os DOIS aparecem (Nível 6), a legenda precisa distinguir:
  // "Canteiro vazio" vs "Canteiro plantado". Quando só flowerbed (Níveis
  // 1-4), mantém o texto curto "Canteiro" — não-retroativo.
  const flowerbedLabel = hasSeed ? "Canteiro vazio" : "Canteiro";

  return (
    <View
      className="items-center justify-center"
      style={{ paddingVertical: 16 }}
    >
      <View
        style={{
          width: gridWidth + 8,
          height: gridHeight + 8,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: "rgba(31, 95, 63, 0.2)",
          backgroundColor: "#F5EFE0",
          overflow: "hidden",
          padding: 2,
        }}
      >
        {world.grid.map((row, y) => (
          <View key={y} style={{ flexDirection: "row" }}>
            {row.map((cell, x) => {
              const isPlayer =
                world.player.position.x === x &&
                world.player.position.y === y;
              const isFlowerbed = cell.content === "flowerbed";

              const isWateringSpot = cell.content === "watering_spot";
              const isTargetCell = isFlowerbed || isWateringSpot;

              return (
                <View
                  key={`${x}-${y}`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: CELL_COLORS[cell.content],
                    borderWidth: isTargetCell ? 2.5 : 1,
                    borderColor: isFlowerbed
                      ? "#FF8F00"
                      : isWateringSpot
                        ? "#4A90D9"
                        : "rgba(31, 95, 63, 0.1)",
                    borderStyle: isTargetCell ? "dashed" : "solid",
                    borderRadius: isTargetCell ? 12 : 4,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Flowerbed target label */}
                  {isFlowerbed && !isPlayer && (
                    <View style={{ alignItems: "center" }}>
                      <Text style={{ fontSize: cellSize * 0.3 }}>
                        {CELL_ICONS.flowerbed}
                      </Text>
                      <Text
                        style={{
                          fontSize: 9,
                          color: "#E65100",
                          fontFamily: "Nunito-Bold",
                          marginTop: 2,
                        }}
                      >
                        aqui!
                      </Text>
                    </View>
                  )}

                  {/* Watering spot target label */}
                  {isWateringSpot && !isPlayer && (
                    <View style={{ alignItems: "center" }}>
                      <Text style={{ fontSize: cellSize * 0.3 }}>
                        {CELL_ICONS.watering_spot}
                      </Text>
                      <Text
                        style={{
                          fontSize: 9,
                          color: "#1565C0",
                          fontFamily: "Nunito-Bold",
                          marginTop: 2,
                        }}
                      >
                        regar aqui!
                      </Text>
                    </View>
                  )}

                  {/* Cell content icon (non-target, non-empty) */}
                  {cell.content !== "empty" &&
                    !isFlowerbed &&
                    !isWateringSpot &&
                    !isPlayer && (
                      <Text style={{ fontSize: cellSize * 0.35 }}>
                        {CELL_ICONS[cell.content]}
                      </Text>
                    )}

                  {/* Player indicator */}
                  {isPlayer && (
                    <View
                      style={{
                        width: cellSize * 0.65,
                        height: cellSize * 0.65,
                        borderRadius: cellSize * 0.325,
                        backgroundColor: "#2E7D32",
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 3,
                        elevation: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: cellSize * 0.3,
                          color: "#FFFFFF",
                          fontWeight: "bold",
                        }}
                      >
                        {DIRECTION_ARROWS[world.player.direction]}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Legend for first-time players */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 8,
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: "#2E7D32",
            }}
          />
          <Text
            style={{
              fontSize: 11,
              color: "#5D7A5D",
              fontFamily: "Nunito-Regular",
            }}
          >
            Você
          </Text>
        </View>
        {hasFlowerbed && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                borderWidth: 1.5,
                borderColor: "#FF8F00",
                borderStyle: "dashed",
                backgroundColor: "#FFF3E0",
              }}
            />
            <Text
              style={{
                fontSize: 11,
                color: "#5D7A5D",
                fontFamily: "Nunito-Regular",
              }}
            >
              {flowerbedLabel}
            </Text>
          </View>
        )}
        {hasSeed && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                backgroundColor: "#C8E6C9",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 9 }}>🌱</Text>
            </View>
            <Text
              style={{
                fontSize: 11,
                color: "#5D7A5D",
                fontFamily: "Nunito-Regular",
              }}
            >
              Canteiro plantado
            </Text>
          </View>
        )}
        {hasWateringSpot && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                borderWidth: 1.5,
                borderColor: "#4A90D9",
                borderStyle: "dashed",
                backgroundColor: "#E3F2FD",
              }}
            />
            <Text
              style={{
                fontSize: 11,
                color: "#5D7A5D",
                fontFamily: "Nunito-Regular",
              }}
            >
              Regar
            </Text>
          </View>
        )}
        {hasRock && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                backgroundColor: "#BCAAA4",
              }}
            />
            <Text
              style={{
                fontSize: 11,
                color: "#5D7A5D",
                fontFamily: "Nunito-Regular",
              }}
            >
              Pedra
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
