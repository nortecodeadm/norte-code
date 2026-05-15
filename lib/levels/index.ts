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

/**
 * Bloco da solução ótima de um nível (gabarito do mascote).
 *
 * Estrutura mínima: só `type` (e `children` pra containers). NÃO carrega
 * `id` — diferente do `ProgramBlock` da UI, cujos ids são gerados em
 * runtime. A camada de tela (`app/level/[id].tsx`) converte
 * `OptimalSolutionBlock[]` em `ProgramBlock[]` gerando ids estáticos,
 * pra alimentar tanto o `blocksToAST` quanto a renderização na
 * ProgramArea durante a execução do mascote.
 *
 * Tipo definido aqui (não importado de components/) pra manter a
 * direção de dependência sã — `lib/` não depende de `components/`.
 */
export interface OptimalSolutionBlock {
  type: BlockType;
  children?: OptimalSolutionBlock[];
}

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
  /**
   * Solução ótima do nível — o "gabarito visual" que o mascote executa
   * após a criança vencer (feature Mascote-Gabarito, a partir do Nível 7).
   * Opcional e aditivo: Níveis 1-6 não definem, e nada muda neles.
   * Quando presente, dispara a cena posterior do mascote.
   */
  optimalSolution?: OptimalSolutionBlock[];
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

// ─── Level 5: Bloco de loop fixo (repeat_3) — par pedagógico do Nível 4 ───────
// Cenário IDÊNTICO ao Nível 4. Mesmas pedras, mesmos canteiros, mesmo "U" no
// sentido horário. Diferença: os 3 canteiros começam com sementes plantadas
// (content === "seed") e a criança rega cada um. O bloco repeat_3 entra na
// paleta — a solução-alvo cai de 12 pra 9 blocos (alívio pedagógico).

function createLevel5(): LevelDefinition {
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

  // Mesmas 6 rochas do Nível 4 (bloco central que força caminho em "U")
  grid[1][0].content = "rock";
  grid[2][0].content = "rock";
  grid[1][1].content = "rock";
  grid[1][2].content = "rock";
  grid[2][1].content = "rock";
  grid[2][2].content = "rock";

  // Os 3 canteiros já aparecem com SEMENTES plantadas (estágio 1). O objetivo
  // é regar cada um — water em "seed" transforma em "sprout" (já implementado
  // no interpreter desde o Nível 2).
  grid[0][3].content = "seed";
  grid[3][3].content = "seed";
  grid[3][0].content = "seed";

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
        // Os 3 canteiros precisam estar regados (sprout). Ordem e tamanho
        // do programa não importam — só o estado final.
        const c1 = state.grid[0][3].content === "sprout";
        const c2 = state.grid[3][3].content === "sprout";
        const c3 = state.grid[3][0].content === "sprout";
        return c1 && c2 && c3;
      },
    },
  };

  return {
    id: 5,
    title: "Repetir é mais esperto",
    description:
      "Rega as três sementes que você plantou. Tenta usar o bloco \"Repetir 3×\"!",
    hint:
      "Em vez de [Direita][Direita][Direita], experimenta [Repetir 3× [Direita]]. Faz a mesma coisa, com menos blocos.",
    objective: "💧 Regue os três canteiros",
    gridWidth,
    gridHeight,
    initialWorld,
    availableBlocks: [
      "move_right",
      "move_left",
      "move_up",
      "move_down",
      "water",
      "repeat_3",
    ],
    // maxBlocks: 14
    // Margem de 5 sobre solução-alvo de 9 blocos. Permite que solução
    // longa do Nível 4 (12 blocos sem repeat_3) ainda caiba, preservando
    // "necessidade antes da ferramenta": criança pode escolher fazer
    // manual e depois descobrir o repeat_3.
    // Contagem: cada bloco conta 1, incluindo filhos dentro de repeat_3.
    maxBlocks: 14,
    errorMessages: {
      blocked_by_rock: "Hmm, tem uma pedra aí. Tenta outro caminho.",
      out_of_grid: "Esse lado não dá. O caminho continua em outra direção.",
      no_water:
        "Você esqueceu de regar! Cada canteiro precisa de um \"Regar\".",
      not_at_watering_spot:
        "Você ainda não regou todos os canteiros. Olha o caminho de novo.",
      wrong_path: "Quase! Olha onde estão os canteiros e tenta outro caminho.",
    },
    reward: {
      message:
        "Olha que esperto! Em vez de mandar o mesmo movimento três vezes, você usou o bloco de repetir. Programar bem é fazer mais com menos. Lembra disso — vai ser útil mais pra frente.",
      elements: [
        // Operação 1 — substituir o background do Mundo (primeira mudança
        // visual radical do MVP). Mesma lógica de substituição usada pra
        // plantas. Ver DECISIONS.md ("background é substituível").
        { add: "background_mundo_v2", replaces: "background_mundo_v1" },
        // Operação 2 — planta principal evolui de mini-árvore pra árvore
        // jovem (antecipada do Nível 6 conforme decisão tomada na entrega
        // do Nível 5 — reforça o "salto visual forte" deste nível).
        { add: "young_tree_lvl5", replaces: "mini_tree_lvl4" },
        // Operação 3 — as 3 sementes do Nível 4 viram plantinhas estágio 3.
        // Pulam estágio 2 (broto) — sinal de que regar acelerou crescimento.
        { add: "plant_stage3_lvl5_a", replaces: "seed_lvl4_a" },
        { add: "plant_stage3_lvl5_b", replaces: "seed_lvl4_b" },
        { add: "plant_stage3_lvl5_c", replaces: "seed_lvl4_c" },
        // Operação 4 — +2 flores decorativas (total no Mundo passa de 2 pra 4).
        { add: "flower_lvl5_a" },
        { add: "flower_lvl5_b" },
        // Operação 5 — flor brota do tronco caído. SUBSTITUI o tronco
        // (asset flor_no_tronco.png inclui o tronco + flor integrados,
        // mesma proporção 1426×624). Ver DECISIONS.md sobre essa correção.
        { add: "flower_no_tronco" },
      ],
    },
  };
}

// ─── Level 6: Condicional simples (if_canteiro_vazio_then_plantar) ──────────
// Primeiro nível com condicional. Grade 1×6 linear:
//   [Avatar][SC][CV][CP][CV][CV]
// SC = sem canteiro (chão, "empty"), CV = canteiro vazio ("flowerbed"),
// CP = canteiro já plantado ("seed").
// Solução-alvo (3 blocos): [Repetir 5× [Direita, Se vazio, plantar]].
// Solução longa aceita (10 blocos): 5 iterações manuais de [Direita, Se vazio, plantar].
// O bloco condicional é o ÚNICO jeito de plantar — não há `plant` solto.
// Esse é o ponto pedagógico: criança aprende a olhar antes de agir.

function createLevel6(): LevelDefinition {
  const gridWidth = 6;
  const gridHeight = 1;

  const grid: Cell[][] = [];
  for (let y = 0; y < gridHeight; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < gridWidth; x++) {
      row.push({ position: { x, y }, content: "empty" });
    }
    grid.push(row);
  }

  // [Avatar][SC][CV][CP][CV][CV]
  // col 0 e col 1 já são "empty" (SC).
  grid[0][2].content = "flowerbed"; // CV
  grid[0][3].content = "seed";      // CP (já plantado)
  grid[0][4].content = "flowerbed"; // CV
  grid[0][5].content = "flowerbed"; // CV

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
        // As 3 CV (cols 2, 4, 5) devem virar "seed". O CP de col 3
        // continua "seed" (intocado). Ordem do programa não importa.
        const cv2 = state.grid[0][2].content === "seed";
        const cv4 = state.grid[0][4].content === "seed";
        const cv5 = state.grid[0][5].content === "seed";
        return cv2 && cv4 && cv5;
      },
    },
  };

  return {
    id: 6,
    title: "Olha antes de plantar",
    description:
      "Plante apenas onde tiver canteiro vazio. Use 'Se vazio, plantar' dentro do Repetir.",
    hint:
      "O bloco roxo 'Se vazio, plantar' só age quando o lugar tem canteiro vazio. Tenta [Repetir 5× [Direita, Se vazio, plantar]].",
    objective: "🌱 Plante só onde for canteiro vazio",
    gridWidth,
    gridHeight,
    initialWorld,
    availableBlocks: [
      "move_right",
      "if_canteiro_vazio_then_plantar",
      "repeat_5",
    ],
    // maxBlocks: 12
    // Solução elegante: 3 blocos (Repetir 5× + 2 dentro).
    // Solução longa sem repeat_5: 10 blocos (5 iterações de Direita + Se vazio).
    // Margem de 2 sobre solução longa — mesma lógica do Nível 5.
    // Contagem inclui filhos (cada bloco conta 1).
    maxBlocks: 12,
    errorMessages: {
      out_of_grid: "Esse lado não dá. O caminho continua em outra direção.",
      // Genérica: programa terminou mas ainda há canteiros vazios não plantados.
      // O interpretador NÃO trata o if_canteiro_vazio_then_plantar como
      // "tentou plantar no lugar errado" — só ignora silenciosamente.
      not_at_planting_spot:
        "Ainda há canteiros vazios. Olha de novo onde o avatar passou.",
      wrong_path:
        "Ainda há canteiros vazios. Olha de novo onde o avatar passou.",
    },
    reward: {
      message:
        "Você aprendeu a olhar antes de fazer. Nem todo lugar pede a mesma ação. Saber decidir é cuidar bem. Lembra disso — vai ser muito útil mais pra frente.",
      elements: [
        // Operação 1 — 2 pássaros (primeira fauna do MVP). Mesmo asset, IDs
        // distintos. O mirror do segundo é tratado direto no render do
        // app/world.tsx (transform: scaleX -1) — schema dos rewards continua
        // { add, replaces } sem campo "transform", preservando não-retroatividade.
        { add: "bird_lvl6_a" },
        { add: "bird_lvl6_b" },
        // Operação 2 — as 3 plantinhas estágio 3 do Nível 5 viram mini-árvores.
        // Continuidade narrativa das sementes do Nível 4 que cresceram.
        { add: "mini_tree_lvl6_a", replaces: "plant_stage3_lvl5_a" },
        { add: "mini_tree_lvl6_b", replaces: "plant_stage3_lvl5_b" },
        { add: "mini_tree_lvl6_c", replaces: "plant_stage3_lvl5_c" },
        // Operação 3 — 3 flores amarelas decorativas espalhadas.
        { add: "yellow_flower_lvl6_a" },
        { add: "yellow_flower_lvl6_b" },
        { add: "yellow_flower_lvl6_c" },
      ],
    },
  };
}

// ─── Level 7: Condicional com 2 ramos (if/else) ─────────────────────────────
// Amadurece o discernimento do Nível 6: criança não só "age ou não", ela
// ESCOLHE entre 2 ações. Grade 1×6 linear:
//   [Avatar][CP][CV][CP][CV][CP]
// 3 CPs (canteiros com semente, precisam ser regados) intercalados com
// 2 CVs (canteiros vazios, precisam ser plantados). Solução-alvo (3 blocos):
//   [Repetir 5× [Direita, Se com semente, regar; senão se vazio, plantar]]
// O bloco condicional é o ÚNICO jeito de agir (sem plant/water soltos).

function createLevel7(): LevelDefinition {
  const gridWidth = 6;
  const gridHeight = 1;

  const grid: Cell[][] = [];
  for (let y = 0; y < gridHeight; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < gridWidth; x++) {
      row.push({ position: { x, y }, content: "empty" });
    }
    grid.push(row);
  }

  // [Avatar][CP][CV][CP][CV][CP]
  // col 0 = "empty" (chão, avatar). Demais alternam CP/CV.
  grid[0][1].content = "seed";       // CP — vai ser regada
  grid[0][2].content = "flowerbed";  // CV — vai ser plantada
  grid[0][3].content = "seed";       // CP — vai ser regada
  grid[0][4].content = "flowerbed";  // CV — vai ser plantada
  grid[0][5].content = "seed";       // CP — vai ser regada

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
        // Estado final correto:
        //   cols 1, 3, 5 (CP originais) → "sprout" (foram regadas)
        //   cols 2, 4    (CV originais) → "seed"   (foram plantadas, sem rega)
        // Não há tempo no mesmo programa pra regar o que acabou de
        // ser plantado — esse é o ponto pedagógico do nível.
        const cp1 = state.grid[0][1].content === "sprout";
        const cv2 = state.grid[0][2].content === "seed";
        const cp3 = state.grid[0][3].content === "sprout";
        const cv4 = state.grid[0][4].content === "seed";
        const cp5 = state.grid[0][5].content === "sprout";
        return cp1 && cv2 && cp3 && cv4 && cp5;
      },
    },
  };

  return {
    id: 7,
    title: "Cuidar de jeitos diferentes",
    description:
      "Cada canteiro precisa de uma coisa. Use 'Se com semente, regar; senão se vazio, plantar' dentro do Repetir.",
    hint:
      "O bloco roxo decide sozinho: rega onde já tem semente, planta onde tá vazio. Tenta [Repetir 5× [Direita, Se com semente, regar; senão se vazio, plantar]].",
    objective: "💧🌱 Regue o que tem semente, plante o que está vazio",
    gridWidth,
    gridHeight,
    initialWorld,
    availableBlocks: [
      "move_right",
      "if_canteiro_com_semente_then_regar_else_if_canteiro_vazio_then_plantar",
      "repeat_5",
    ],
    // maxBlocks: 12
    // Solução elegante: 3 blocos (Repetir 5× + 2 dentro).
    // Solução longa sem repeat_5: 10 blocos (5 iterações manuais).
    // Margem de 2 sobre a solução longa — mesmo padrão dos Níveis 5-6.
    maxBlocks: 12,
    errorMessages: {
      out_of_grid: "Esse lado não dá. O caminho continua em outra direção.",
      // Programa terminou mas alguma célula ainda precisa ser cuidada
      // (canteiro vazio não plantado, ou semente não regada).
      not_at_planting_spot:
        "Ainda há canteiros pra cuidar. Olha de novo onde o avatar passou.",
      wrong_path:
        "Ainda há canteiros pra cuidar. Olha de novo onde o avatar passou.",
      didnt_move:
        "O avatar precisa andar pra encontrar canteiros. Use o bloco Direita.",
    },
    // Gabarito do mascote (feature Mascote-Gabarito). Solução elegante
    // de 3 blocos: repeat_5 envolvendo move_right + condicional if/else.
    optimalSolution: [
      {
        type: "repeat_5",
        children: [
          { type: "move_right" },
          {
            type: "if_canteiro_com_semente_then_regar_else_if_canteiro_vazio_then_plantar",
          },
        ],
      },
    ],
    reward: {
      // Texto pluralizado (criança + mascote como dupla) — feature
      // Mascote-Gabarito. Mudança mínima: só verbos e pronomes.
      message:
        "Agora vocês sabem escolher entre dois caminhos. Cuidar é responder ao que cada coisa precisa — não tratar tudo igual. Lembrem disso — vai ser muito importante mais pra frente.",
      elements: [
        // Operação 1 — árvore principal evolui de jovem pra frutífera.
        // Asset novo mundo_arvore_frutifera (1024×1024 RGBA). Cadeia
        // estendida: seed → sprout → grown_sprout → mini_tree → young_tree → fruit_tree.
        { add: "fruit_tree_lvl7", replaces: "young_tree_lvl5" },
        // Operação 2 — tronco caído com flor ganha esquilo morando dentro.
        // Asset mundo_tronco_com_flor_e_esquilo SUBSTITUI o anterior na
        // mesma posição/rotação (proporções ~idênticas, 3072×1344 vs
        // 1426×624 — ambas ≈2.28). Símbolo amadurecido: vida vence até
        // o que parecia morto E abriga novas formas de vida.
        { add: "fallen_log_with_flower_and_squirrel_lvl7", replaces: "flower_no_tronco" },
        // Operação 3 — 1 esquilo decorativo no chão (asset mundo_esquilo).
        // Segunda fauna do MVP (depois dos pássaros do Nível 6).
        { add: "squirrel_lvl7_ground" },
        // Operação 4 — 4 flores brancas decorativas espalhadas.
        { add: "white_flower_lvl7_a" },
        { add: "white_flower_lvl7_b" },
        { add: "white_flower_lvl7_c" },
        { add: "white_flower_lvl7_d" },
        // Operação 5 — pássaro lvl7_a SUBSTITUI o bird_lvl6_a (mesmo asset
        // mundo_passaro_pousado). Permite que o pássaro mude de posição
        // entre os Níveis 6 e 7 — agora ele pousa em outro lugar do
        // jardim, mas continua sendo "o mesmo pássaro" visualmente.
        { add: "bird_lvl7_a", replaces: "bird_lvl6_a" },
      ],
    },
  };
}

// ─── Level 8: Variável (contador) + repeat_until_frutas_3 ────────────────────
// Quinto conceito de programação do MVP. Primeira variável real. Grade 1×5
// linear:
//   [Avatar][chão][chão][chão][Árvore frutífera]
// Solução-alvo (5 blocos): [Direita, Direita, Direita,
//   Repetir até pegar 3 frutas [Pegar fruta]]
// Solução longa aceita (6 blocos): 3 Direita + 3 Pegar fruta direto
//   (princípio "necessidade antes da ferramenta").
//
// Notas de modelagem:
//   - Variável: reusa player.inventory.fruits (decisão registrada em
//     DECISIONS.md — YAGNI sobre `variables: Record<string,number>`).
//   - Árvore frutífera: CellContent novo `fruit_tree`, visualmente fixa
//     (não consome com pick_fruit). Idempotente quando inventário já
//     está em 3 (edge case E2 do briefing).
//   - goalCondition `custom` com check === 3 (não usei `collect_fruits`
//     porque ele é `>=`, e o Nível 8 exige EXATAMENTE 3).
//   - Cesta da atividade + contador HUD são overlays em app/level/[id].tsx
//     condicionais ao id === 8.
//   - Recompensas disparam a "transformação visual major" do Mundo:
//     background v3 substitui v2, e a presença do flag suprime a
//     renderização de fruit_tree_lvl7 e mini_tree_lvl6_a/b/c no primeiro
//     plano (lógica em app/world.tsx).

function createLevel8(): LevelDefinition {
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

  // Árvore frutífera na coluna 4 — "alvo" da coleta. Avatar começa em (0,0).
  grid[0][4].content = "fruit_tree";

  const initialWorld: WorldState = {
    grid,
    gridWidth,
    gridHeight,
    player: {
      position: { x: 0, y: 0 },
      direction: "east",
      // CRÍTICO: começa com 0 frutas. resetWorld em [id].tsx clona o
      // initialWorld via JSON, então o reset SEMPRE volta pra 0 — não
      // carrega frutas da rodada anterior (lembrete A do briefing).
      inventory: { fruits: 0 },
    },
    goalCondition: {
      // EXATAMENTE 3 — não `>=` (collect_fruits faz `>=`). O bloco
      // pick_fruit é idempotente em >= 3, então mesmo "solução longa"
      // com 4 pick_fruit termina com fruits === 3.
      type: "custom",
      check: (state: WorldState) => state.player.inventory.fruits === 3,
    },
  };

  return {
    id: 8,
    title: "Saber a medida certa",
    description:
      "Pegue exatamente 3 frutas. Use 'Repetir até pegar 3 frutas' pra parar na hora certa.",
    hint:
      "Tenta [Direita, Direita, Direita, Repetir até pegar 3 frutas [Pegar fruta]]. O loop para sozinho quando você pega a 3ª fruta.",
    objective: "🍎 Pegue exatamente 3 frutas",
    gridWidth,
    gridHeight,
    initialWorld,
    availableBlocks: ["move_right", "pick_fruit", "repeat_until_frutas_3"],
    // maxBlocks: 12
    // Solução elegante: 5 blocos (3 Direita + Repetir até + 1 Pegar fruta).
    // Solução longa: 6 blocos (3 Direita + 3 Pegar fruta).
    // Margem confortável até 12 — espaço pra exploração e tentativas.
    maxBlocks: 12,
    errorMessages: {
      out_of_grid: "Esse lado não dá. O caminho continua em outra direção.",
      // pick_fruit fora da árvore — heurística getContextualError em [id].tsx
      // pega "tem pick_fruit mas player.inventory.fruits === 0" e mostra:
      not_at_planting_spot:
        "O avatar precisa estar perto da árvore pra pegar frutas. Use os blocos de movimento.",
      didnt_move:
        "O avatar precisa estar perto da árvore pra pegar frutas. Use os blocos de movimento.",
      // repeat_until_frutas_3 sem pick_fruit dentro — interpretador atinge
      // MAX_EXECUTION_STEPS, heurística traduz pra:
      wrong_path:
        "Hmm, parece que faltou pegar fruta dentro do repetir.",
      no_fruits:
        "Ainda faltam frutas pra pegar. Verifica seu programa.",
    },
    // Gabarito do mascote (feature Mascote-Gabarito). Solução elegante
    // de 5 blocos: 3 move_right + repeat_until_frutas_3 com pick_fruit
    // dentro.
    optimalSolution: [
      { type: "move_right" },
      { type: "move_right" },
      { type: "move_right" },
      {
        type: "repeat_until_frutas_3",
        children: [{ type: "pick_fruit" }],
      },
    ],
    reward: {
      // Texto pluralizado (criança + mascote como dupla) — feature
      // Mascote-Gabarito. Mudança mínima: só verbos e pronomes.
      message:
        "Vocês usaram um lugar pra guardar uma informação (quantas frutas). Isso se chama variável. Cuidar bem é saber a quantidade certa — não pegar tudo, não pegar de menos. Lembrem disso — vai ser muito importante mais pra frente.",
      elements: [
        // ─── Bg + supressão da planta principal e mini-árvores ────────────
        // Operação A — substituir background v2 por v3. Mesma lógica do
        // Nível 5 (que substituiu v1 por v2). Quando worldElements
        // contém "background_mundo_v3", o app/world.tsx renderiza v3
        // E suprime a árvore principal + 3 mini-árvores do primeiro plano
        // (passam a fazer parte da composição do bg).
        { add: "background_mundo_v3", replaces: "background_mundo_v2" },

        // ─── Elementos NOVOS no primeiro plano ────────────────────────────
        // Cesta da recompensa com a serpente dentro (decisão narrativa
        // registrada em DECISIONS.md).
        { add: "basket_with_serpent_lvl8" },
        // 2 borboletas DIFERENTES (não é mirror — assets distintos).
        { add: "butterfly_perched_lvl8" },
        { add: "butterfly_flying_lvl8" },

        // ─── Recalibração de TODOS os elementos do primeiro plano ─────────
        // Padrão "elemento que muda de posição entre níveis" estabelecido
        // no Nível 7 (bird_lvl7_a substituiu bird_lvl6_a com mesmo asset).
        // No Nível 8 a transformação visual major do bg exige reposicionar
        // todos os elementos pra integrar com a nova composição. Cada
        // elemento ganha versão _lvl8 com mesmo asset e posição própria
        // em WORLD_LAYOUT (Gui calibra). Substituições preservam não-
        // retroatividade — Níveis 1-7 mantêm posicionamento original.

        // Pedra (até o Nv 7 sempre renderizou sem flag — agora a versão
        // _lvl8 entra como elemento explícito do level 8 e o render da
        // pedra original é suprimido quando stone_lvl8 está ativo).
        { add: "stone_lvl8" },

        // Tronco caído com flor + esquilo (mesma asset 3072×1344).
        {
          add: "fallen_log_with_flower_and_squirrel_lvl8",
          replaces: "fallen_log_with_flower_and_squirrel_lvl7",
        },

        // 2 pássaros (mesmo asset mundo_passaro_pousado, lvl8_b mirrorado).
        { add: "bird_lvl8_a", replaces: "bird_lvl7_a" },
        { add: "bird_lvl8_b", replaces: "bird_lvl6_b" },

        // Esquilo no chão (mesmo asset mundo_esquilo).
        { add: "squirrel_lvl8_ground", replaces: "squirrel_lvl7_ground" },

        // 4 flores rosa (mesmo asset mundo_flor) — substituem as 4
        // instâncias rosa acumuladas dos Níveis 3, 4 e 5.
        { add: "flower_lvl8_a", replaces: "flower_lvl3" },
        { add: "flower_lvl8_b", replaces: "flower_lvl4" },
        { add: "flower_lvl8_c", replaces: "flower_lvl5_a" },
        { add: "flower_lvl8_d", replaces: "flower_lvl5_b" },

        // 3 flores amarelas (mesmo asset mundo_flor_amarela).
        { add: "yellow_flower_lvl8_a", replaces: "yellow_flower_lvl6_a" },
        { add: "yellow_flower_lvl8_b", replaces: "yellow_flower_lvl6_b" },
        { add: "yellow_flower_lvl8_c", replaces: "yellow_flower_lvl6_c" },

        // 4 flores brancas (mesmo asset mundo_flor_branca).
        { add: "white_flower_lvl8_a", replaces: "white_flower_lvl7_a" },
        { add: "white_flower_lvl8_b", replaces: "white_flower_lvl7_b" },
        { add: "white_flower_lvl8_c", replaces: "white_flower_lvl7_c" },
        { add: "white_flower_lvl8_d", replaces: "white_flower_lvl7_d" },
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
  createLevel5(),
  createLevel6(),
  createLevel7(),
  createLevel8(),
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
