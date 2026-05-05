/**
 * Level Definitions — Norte Code MVP
 *
 * Each level defines:
 * - Initial world state (grid, player position, goal)
 * - Available blocks for the palette
 * - Expected solution (for reference, not enforced)
 * - Reward on completion
 * - Instructional hints for the child
 */

import type { WorldState, Cell, Position, BlockType } from "../interpreter";

export interface LevelDefinition {
  id: number;
  title: string;
  description: string; // Child-friendly instruction shown at the top
  hint: string; // More specific hint shown after 5s of inactivity
  objective: string; // Short objective text (e.g., "Plante a semente no canteiro")
  gridWidth: number;
  gridHeight: number;
  initialWorld: WorldState;
  availableBlocks: BlockType[];
  maxBlocks: number; // Max blocks the child can use
  errorMessages: Record<string, string>; // Contextual error messages
  reward: {
    elementKey: string; // Key for world_elements storage
    message: string; // Success message shown to child
  };
}

// ─── Level 1: Sequência simples (Andar → Plantar) ─────────────────────────

function createLevel1(): LevelDefinition {
  // Simple 3x1 grid: player starts at (0,0) facing east
  // Target: walk to (1,0) and plant a seed there
  // Cell (1,0) has "flowerbed" content to visually mark the target
  const gridWidth = 3;
  const gridHeight = 1;

  const grid: Cell[][] = [];
  for (let y = 0; y < gridHeight; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < gridWidth; x++) {
      row.push({ position: { x, y }, content: "empty" });
    }
    grid.push(row);
  }

  // Mark the target cell as a flowerbed (visual cue for "plant here")
  grid[0][1].content = "flowerbed";

  const initialWorld: WorldState = {
    grid,
    gridWidth,
    gridHeight,
    player: {
      position: { x: 0, y: 0 },
      direction: "east",
      inventory: { fruits: 0 },
    },
    goalCondition: { type: "plant_all_seeds" },
  };

  return {
    id: 1,
    title: "Primeira semente",
    description: "Ande até o canteiro e plante uma semente!",
    hint: "Dica: toque em \"Andar\" e depois em \"Plantar\" — nessa ordem!",
    objective: "🌱 Plante no canteiro marcado",
    gridWidth,
    gridHeight,
    initialWorld,
    availableBlocks: ["move_forward", "plant"],
    maxBlocks: 4,
    errorMessages: {
      no_seed: "Nenhuma semente foi plantada. Tente usar o bloco \"Plantar\"!",
      wrong_position: "Você plantou no lugar errado. Ande até o canteiro primeiro!",
      didnt_move: "Você precisa andar até o canteiro antes de plantar!",
    },
    reward: {
      elementKey: "seed_lvl1",
      message: "Uma sementinha apareceu no seu mundo!",
    },
  };
}

// ─── Level Registry ────────────────────────────────────────────────────────

const LEVELS: LevelDefinition[] = [createLevel1()];

export function getLevel(id: number): LevelDefinition | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function getAllLevels(): LevelDefinition[] {
  return LEVELS;
}

export function getTotalLevels(): number {
  return LEVELS.length;
}
