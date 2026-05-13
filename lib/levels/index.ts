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
    elementKey?: string; // Key for world_elements storage (Levels 1-2)
    replaces?: string; // If set, this reward visually replaces the given element
    message: string; // Success message shown to child
    elements?: Array<{
      add: string;       // Key to add to WORLD_ELEMENTS
      replaces?: string; // Key this element visually replaces
    }>; // Multi-reward system (Level 3+)
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

// ─── Level 3: Desvio de obstáculo — Grade 2D (Descer → Direita → Direita → Subir → Plantar) ──

function createLevel3(): LevelDefinition {
  // 3×2 grid: player starts at (0,0)
  // Rock at (1,0) blocks direct path
  // Flowerbed at (2,0) is the target
  // Solution: Descer → Direita → Direita → Subir → Plantar
  const gridWidth = 3;
  const gridHeight = 2;

  const grid: Cell[][] = [];
  for (let y = 0; y < gridHeight; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < gridWidth; x++) {
      row.push({ position: { x, y }, content: "empty" });
    }
    grid.push(row);
  }

  // Rock obstacle at (1,0) — blocks direct path
  grid[0][1].content = "rock";
  // Flowerbed at (2,0) — target
  grid[0][2].content = "flowerbed";

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
        // Flowerbed at (2,0) must have been planted (content = seed)
        return state.grid[0][2].content === "seed";
      },
    },
  };

  return {
    id: 3,
    title: "Desviando do caminho",
    description: "Uma pedra está no caminho! Desça, vá pra direita e suba pra chegar no canteiro.",
    hint: "A pedra bloqueia o caminho direto. Que tal descer primeiro, andar pra direita, e depois subir?",
    objective: "🪨 Desvie da pedra para plantar",
    gridWidth,
    gridHeight,
    initialWorld,
    availableBlocks: ["move_down", "move_right", "move_up", "plant"],
    maxBlocks: 8,
    errorMessages: {
      blocked_by_rock: "Cuidado! Tem uma pedra no caminho. Você precisa desviar.",
      not_at_planting_spot: "O canteiro está lá, mas você não chegou nele. Olha o caminho de novo.",
      no_plant: 'Você chegou no canteiro mas esqueceu de plantar! Use o bloco "Plantar" no final.',
      out_of_grid: "Espera! Você está tentando ir pra fora do mundo. Olha onde dá pra andar.",
      wrong_path: "Tem uma pedra no caminho! Tente outro caminho.",
    },
    reward: {
      message: "Bom! Às vezes o caminho não é reto. Programar é dar direção certa.",
      elements: [
        { add: "grown_sprout_lvl3", replaces: "sprout_lvl2" },
        { add: "flower_lvl3" },
      ],
    },
  };
}

// ─── Level 4: Sequência longa em U + introdução do move_left ──────────────────
// Conceito pedagógico: criança planta 3 canteiros percorrendo um caminho em "U"
// no sentido horário. Sem bloco repeat — sente o cansaço da repetição manual.
// Par pedagógico com o Nível 5 (que introduz o repeat sobre o mesmo cenário).

function createLevel4(): LevelDefinition {
  // 4×4 grid: player starts at (0,0), top-left corner
  // 6 rochas formam um bloco central (linhas 1-2, colunas 0-2) que força o
  // caminho em U no sentido horário.
  // 3 canteiros em (0,3), (3,3), (3,0).
  // Solução-alvo (12 blocos):
  //   right×3, plant, down×3, plant, left×3, plant
  const gridWidth = 4;
  const gridHeight = 4;

  const grid: Cell[][] = [];
  for (let y = 0; y < gridHeight; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < gridWidth; x++) {
      row.push({ position: { x, y }, content: "empty" });
    }
    grid.push(row);
  }

  // 6 rochas (bloco central)
  grid[1][0].content = "rock";
  grid[2][0].content = "rock";
  grid[1][1].content = "rock";
  grid[1][2].content = "rock";
  grid[2][1].content = "rock";
  grid[2][2].content = "rock";

  // 3 canteiros — C1 (topo-direita), C2 (base-direita), C3 (base-esquerda)
  grid[0][3].content = "flowerbed";
  grid[3][3].content = "flowerbed";
  grid[3][0].content = "flowerbed";

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
        // Os 3 canteiros (C1, C2, C3) precisam estar plantados (content === "seed").
        // A ordem e o tamanho do programa não importam.
        const c1 = state.grid[0][3].content === "seed";
        const c2 = state.grid[3][3].content === "seed";
        const c3 = state.grid[3][0].content === "seed";
        return c1 && c2 && c3;
      },
    },
  };

  return {
    id: 4,
    title: "Plantar três sementes",
    description:
      "Vá pela direita, desça, e volte pela esquerda. Plante em cada parada.",
    hint:
      "Tem três canteiros: um na direita, outro em baixo, e o último na volta. Anda até cada um e planta.",
    objective: "🌱 Plante nos três canteiros",
    gridWidth,
    gridHeight,
    initialWorld,
    availableBlocks: ["move_right", "move_left", "move_up", "move_down", "plant"],
    maxBlocks: 16,
    errorMessages: {
      blocked_by_rock: "Hmm, tem uma pedra aí. Tenta outro caminho.",
      out_of_grid: "Esse lado não dá. O caminho continua em outra direção.",
      plant_wrong_spot: "Aqui não tem canteiro. Procura o lugar certo pra plantar.",
      wrong_position: "Aqui não tem canteiro. Procura o lugar certo pra plantar.",
      not_at_planting_spot:
        "Você ainda não chegou em todos os canteiros. Olha o caminho de novo.",
      no_plant:
        "Você esqueceu de plantar em algum canteiro. Cada parada precisa de um \"Plantar\".",
      wrong_path: "Quase! Olha onde estão os canteiros e tenta outro caminho.",
    },
    reward: {
      message:
        "Você reparou que fez quase a mesma coisa três vezes? Andar pra um lado e plantar. Andar pra outro lado e plantar. Andar pra outro lado e plantar. Programar é assim mesmo — às vezes a gente repete. No próximo nível você vai descobrir um jeito mais esperto de fazer isso.",
      elements: [
        { add: "mini_tree_lvl4", replaces: "grown_sprout_lvl3" },
        { add: "seed_lvl4_a" },
        { add: "seed_lvl4_b" },
        { add: "seed_lvl4_c" },
        { add: "flower_lvl4" },
      ],
    },
  };
}

// ─── Level Registry ──────────────────────────────────────────────────────────────────────────

const LEVELS: LevelDefinition[] = [
  createLevel1(),
  createLevel2(),
  createLevel3(),
  createLevel4(),
];

export function getLevel(id: number): LevelDefinition | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function getAllLevels(): LevelDefinition[] {
  return LEVELS;
}

export function getTotalLevels(): number {
  return LEVELS.length;
}
