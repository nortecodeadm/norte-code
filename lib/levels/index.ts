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
    replaces?: string; // If set, this reward visually replaces the given element
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

// ─── Level 2: Sequência mais longa (Andar → Andar → Plantar → Andar → Regar) ──

function createLevel2(): LevelDefinition {
  // 5x1 grid: player starts at (0,0) facing east
  // Target: walk to (2,0) and plant, then walk to (4,0) and water
  const gridWidth = 5;
  const gridHeight = 1;

  const grid: Cell[][] = [];
  for (let y = 0; y < gridHeight; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < gridWidth; x++) {
      row.push({ position: { x, y }, content: "empty" });
    }
    grid.push(row);
  }

  // Mark cell 2 as flowerbed (plant here) and cell 4 as watering_spot (water here)
  grid[0][2].content = "flowerbed";
  grid[0][4].content = "watering_spot";

  const initialWorld: WorldState = {
    grid,
    gridWidth,
    gridHeight,
    player: {
      position: { x: 0, y: 0 },
      direction: "east",
      inventory: { fruits: 0 },
    },
    goalCondition: {
      type: "custom",
      check: (state: WorldState) => {
        // Cell 2 must have been planted (content = seed)
        // Cell 4 must have been watered (content = watered)
        const cell2 = state.grid[0][2];
        const cell4 = state.grid[0][4];
        return cell2.content === "seed" && cell4.content === "watered";
      },
    },
  };

  return {
    id: 2,
    title: "Sequência mais longa",
    description: "Ande até o canteiro, plante, ande mais um passo e regue!",
    hint: "Lembra: andar, plantar e regar são ações separadas. Cada ação acontece onde o personagem está.",
    objective: "💧 Plante e regue a sementinha",
    gridWidth,
    gridHeight,
    initialWorld,
    availableBlocks: ["move_forward", "plant", "water"],
    maxBlocks: 6,
    errorMessages: {
      no_plant: 'Você esqueceu de plantar! Use o bloco "Plantar" no canteiro marcado.',
      no_water: "Você plantou, mas a sementinha precisa de água! Use o bloco \"Regar\" no final.",
      wrong_path: "Acho que o caminho não está certo. Olha onde está o canteiro e onde precisa regar.",
      plant_wrong_spot: "A sementinha precisa ser plantada no canteiro marcado.",
    },
    reward: {
      elementKey: "sprout_lvl2",
      replaces: "seed_lvl1",
      message: "Sequências mais longas funcionam igual. Um passo de cada vez, na ordem certa.",
    },
  };
}

// ─── Level Registry ────────────────────────────────────────────────────────

const LEVELS: LevelDefinition[] = [createLevel1(), createLevel2()];

export function getLevel(id: number): LevelDefinition | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function getAllLevels(): LevelDefinition[] {
  return LEVELS;
}

export function getTotalLevels(): number {
  return LEVELS.length;
}
