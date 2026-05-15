/**
 * World State definitions for the Norte Code interpreter.
 *
 * The world state represents the grid/environment of a level,
 * including the player position, entities, and conditions.
 * The interpreter modifies this state as blocks are executed.
 */

export type Direction = "north" | "south" | "east" | "west";

export type CellContent =
  | "empty"
  | "seed"
  | "sprout"
  | "flower"
  | "fruit"
  | "puddle"
  | "rock"
  | "flowerbed"
  | "watering_spot"
  | "watered"
  | "basket"
  // Árvore frutífera "inesgotável" do Nível 8 — diferente do `fruit`
  // (que é fruta solta consumível). A célula `fruit_tree` permanece
  // visualmente fixa: cada `pick_fruit` incrementa inventory.fruits sem
  // alterar o conteúdo da célula. Idempotente quando inventory.fruits >= 3.
  | "fruit_tree";

export interface Position {
  x: number;
  y: number;
}

export interface PlayerState {
  position: Position;
  direction: Direction;
  inventory: {
    fruits: number;
  };
}

export interface Cell {
  position: Position;
  content: CellContent;
}

export interface WorldState {
  grid: Cell[][];
  gridWidth: number;
  gridHeight: number;
  player: PlayerState;
  goalCondition: GoalCondition;
}

export type GoalCondition =
  | { type: "reach_position"; target: Position }
  | { type: "plant_all_seeds" }
  | { type: "water_all_sprouts" }
  | { type: "collect_fruits"; target: number }
  | { type: "tend_all_flowerbeds" }
  | { type: "custom"; check: (state: WorldState) => boolean };

export type StepAction =
  | "move"
  | "turn"
  | "plant"
  | "water"
  | "pick"
  | "stop"
  | "fail_move" // Tried to move but couldn't (wall/obstacle)
  | "condition_true"
  | "condition_false";

export interface ExecutionStep {
  action: StepAction;
  fromState: PlayerState;
  toState: PlayerState;
  worldChanges?: {
    position: Position;
    from: CellContent;
    to: CellContent;
  }[];
  blockId: string; // Which block produced this step
  failReason?: "rock" | "out_of_grid"; // Only set when action === "fail_move"
  // Resultado da avaliação condicional, quando o bloco é condicional
  // embutido (Nível 6+). Identifica qual ramo executou. Permanece
  // undefined em ações comuns. A UI mapeia cada valor pra uma cor de
  // glow no bloco ativo:
  //   "plant" → verde  (Nível 6: condicional plantou; Nível 7: ramo "senão se vazio")
  //   "water" → azul   (Nível 7: ramo "se com semente, regar")
  //   "none"  → cinza  (condição não satisfeita — nenhum ramo executou)
  // Aditivo — Níveis 1-5 não emitem, comportamento preservado.
  conditionResult?: "plant" | "water" | "none";
}

export interface ExecutionResult {
  success: boolean;
  steps: ExecutionStep[];
  finalState: WorldState;
  error?: string;
}
