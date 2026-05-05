/**
 * Interpreter module — public API
 */

// AST types and executor
export { executeProgram } from "./interpreter";
export type {
  InterpreterConfig,
  ProgramNode,
  ASTNode,
  ActionNode,
  LoopNode,
  IfNode,
} from "./interpreter";

// Block definitions (for UI palette)
export { createBlock } from "./blocks";
export type {
  BlockType,
  ConditionType,
  Block,
  RepeatBlock,
  ConditionalBlock,
  IfElseBlock,
  FunctionDefBlock,
  FunctionCallBlock,
  AnyBlock,
} from "./blocks";

// World state types
export type {
  Direction,
  CellContent,
  Position,
  PlayerState,
  Cell,
  WorldState,
  GoalCondition,
  StepAction,
  ExecutionStep,
  ExecutionResult,
} from "./world-state";
