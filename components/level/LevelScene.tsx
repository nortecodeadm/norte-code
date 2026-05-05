/**
 * LevelScene — Visual representation of the level grid.
 *
 * MVP: Simple colored cells with the avatar position indicator.
 * Placeholder visuals — will be replaced by proper assets later.
 */

import React from "react";
import { View, Text, Dimensions } from "react-native";
import type { WorldState, CellContent, Direction } from "../../lib/interpreter";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCENE_PADDING = 32;

interface LevelSceneProps {
  world: WorldState;
}

const CELL_COLORS: Record<CellContent, string> = {
  empty: "#E8DCC8",
  seed: "#A8D5A2",
  sprout: "#7BC47F",
  flower: "#FFD93D",
  fruit: "#FF6B6B",
  puddle: "#87CEEB",
  rock: "#8B7355",
  flowerbed: "#C4A882",
  basket: "#DEB887",
};

const CELL_ICONS: Record<CellContent, string> = {
  empty: "",
  seed: "•",
  sprout: "↑",
  flower: "✿",
  fruit: "●",
  puddle: "~",
  rock: "■",
  flowerbed: "▭",
  basket: "□",
};

const DIRECTION_ARROWS: Record<Direction, string> = {
  north: "△",
  south: "▽",
  east: "▷",
  west: "◁",
};

export function LevelScene({ world }: LevelSceneProps) {
  const maxCellSize = (SCREEN_WIDTH - SCENE_PADDING * 2) / world.gridWidth;
  const cellSize = Math.min(maxCellSize, 80);
  const gridWidth = cellSize * world.gridWidth;
  const gridHeight = cellSize * world.gridHeight;

  return (
    <View
      className="items-center justify-center"
      style={{ paddingVertical: 16 }}
    >
      <View
        style={{
          width: gridWidth + 4,
          height: gridHeight + 4,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: "rgba(31, 95, 63, 0.15)",
          backgroundColor: "#F5EFE0",
          overflow: "hidden",
        }}
      >
        {world.grid.map((row, y) => (
          <View key={y} style={{ flexDirection: "row" }}>
            {row.map((cell, x) => {
              const isPlayer =
                world.player.position.x === x &&
                world.player.position.y === y;

              return (
                <View
                  key={`${x}-${y}`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: CELL_COLORS[cell.content],
                    borderWidth: 0.5,
                    borderColor: "rgba(31, 95, 63, 0.08)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Cell content icon */}
                  {cell.content !== "empty" && !isPlayer && (
                    <Text
                      style={{
                        fontSize: cellSize * 0.4,
                        color: "#1F5F3F",
                        opacity: 0.7,
                      }}
                    >
                      {CELL_ICONS[cell.content]}
                    </Text>
                  )}

                  {/* Player indicator */}
                  {isPlayer && (
                    <View
                      style={{
                        width: cellSize * 0.6,
                        height: cellSize * 0.6,
                        borderRadius: cellSize * 0.3,
                        backgroundColor: "#1F5F3F",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: cellSize * 0.3,
                          color: "#FFFDF7",
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
    </View>
  );
}
