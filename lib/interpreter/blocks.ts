/**
 * Block type definitions for the Norte Code visual programming language.
 *
 * Each block represents an instruction that the child can drag and arrange
 * to create a program. The interpreter executes these blocks sequentially.
 *
 * IMPORTANT: This is the core data model of the app. Changes here affect
 * the interpreter, the level definitions, and the UI components.
 * Do not modify without aligning with the product owner.
 */

export type BlockType =
  | "move_forward"
  | "move_right"
  | "move_down"
  | "move_up"
  | "move_left"
  | "turn_left"
  | "turn_right"
  | "plant"
  | "water"
  | "pick_fruit"
  | "repeat"
  | "if_condition"
  | "if_else"
  | "define_function"
  | "call_function"
  | "stop";

export type ConditionType =
  | "has_seed"
  | "has_sprout"
  | "has_puddle"
  | "has_fruit"
  | "has_flowerbed"
  | "fruits_equal";

export interface Block {
  id: string;
  type: BlockType;
  label: string; // User-facing label (in Portuguese, child-friendly)
}

export interface RepeatBlock extends Block {
  type: "repeat";
  times: number; // How many times to repeat
  children: Block[]; // Blocks inside the loop
}

export interface ConditionalBlock extends Block {
  type: "if_condition";
  condition: ConditionType;
  conditionValue?: number; // For conditions like "fruits_equal" (e.g., = 3)
  children: Block[]; // Blocks to execute if condition is true
}

export interface IfElseBlock extends Block {
  type: "if_else";
  condition: ConditionType;
  conditionValue?: number;
  ifChildren: Block[]; // Blocks if true
  elseChildren: Block[]; // Blocks if false
}

export interface FunctionDefBlock extends Block {
  type: "define_function";
  functionName: string; // e.g., "cuidar"
  children: Block[]; // Blocks that make up the function body
}

export interface FunctionCallBlock extends Block {
  type: "call_function";
  functionName: string; // Which function to call
}

export type AnyBlock =
  | Block
  | RepeatBlock
  | ConditionalBlock
  | IfElseBlock
  | FunctionDefBlock
  | FunctionCallBlock;

/**
 * Block factory: creates block instances with unique IDs.
 * Used by the level definitions and the block palette component.
 */
export function createBlock(
  type: BlockType,
  overrides?: Partial<Block>
): Block {
  const labels: Record<BlockType, string> = {
    move_forward: "Andar para frente",
    move_right: "Direita",
    move_down: "Descer",
    move_up: "Subir",
    move_left: "Esquerda",
    turn_left: "Virar à esquerda",
    turn_right: "Virar à direita",
    plant: "Plantar",
    water: "Regar",
    pick_fruit: "Pegar fruta",
    repeat: "Repetir",
    if_condition: "Se...",
    if_else: "Se... senão...",
    define_function: "Definir",
    call_function: "Fazer",
    stop: "Parar",
  };

  return {
    id: generateBlockId(),
    type,
    label: labels[type],
    ...overrides,
  };
}

function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
