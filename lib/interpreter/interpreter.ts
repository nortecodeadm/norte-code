/**
 * Norte Code Block Interpreter — AST JSON Engine
 *
 * Core engine that executes a program (AST in JSON format) against a WorldState.
 * The same JSON that renders the UI blocks IS the program that gets executed.
 * No duplication of state.
 *
 * AST Format (defined with Claude):
 * - Program:    { type: "program", body: [...statements] }
 * - Action:     { type: "action", name: "walk_forward" | "plant" | ... }
 * - Loop:       { type: "loop", times: N, body: [...statements] }
 * - Conditional: { type: "if", condition: "has_seed", then: [...], else?: [...] }
 */

import {
  WorldState,
  ExecutionStep,
  ExecutionResult,
  Direction,
  CellContent,
  Position,
  PlayerState,
  StepAction,
} from "./world-state";

// ─── AST Node Types ────────────────────────────────────────────────────────

export interface ActionNode {
  type: "action";
  name: string;
  id?: string; // Optional block ID for UI highlight
}

export interface LoopNode {
  type: "loop";
  times: number;
  body: ASTNode[];
  id?: string;
}

export interface IfNode {
  type: "if";
  condition: string;
  then: ASTNode[];
  else?: ASTNode[];
  id?: string;
}

export interface ProgramNode {
  type: "program";
  body: ASTNode[];
}

export type ASTNode = ActionNode | LoopNode | IfNode;

// ─── Config ────────────────────────────────────────────────────────────────

const MAX_EXECUTION_STEPS = 200;

export interface InterpreterConfig {
  maxSteps?: number;
  stepDelay?: number; // ms between steps for animation (used by UI, not engine)
}

// ─── Direction helpers ─────────────────────────────────────────────────────

const DIRECTION_VECTORS: Record<Direction, Position> = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
};

const TURN_LEFT: Record<Direction, Direction> = {
  north: "west",
  west: "south",
  south: "east",
  east: "north",
};

const TURN_RIGHT: Record<Direction, Direction> = {
  north: "east",
  east: "south",
  south: "west",
  west: "north",
};

// ─── Execution Context ─────────────────────────────────────────────────────

interface ExecutionContext {
  world: WorldState;
  steps: ExecutionStep[];
  maxSteps: number;
  error?: string;
}

// ─── Main Entry Point ──────────────────────────────────────────────────────

/**
 * Execute a program (AST JSON) against a world state.
 * Returns the execution result with all steps for animation playback.
 */
export function executeProgram(
  program: ProgramNode,
  initialState: WorldState,
  config: InterpreterConfig = {}
): ExecutionResult {
  const maxSteps = config.maxSteps ?? MAX_EXECUTION_STEPS;

  // Deep clone the initial state to avoid mutations
  const world: WorldState = JSON.parse(JSON.stringify(initialState));

  // Preserve the original goalCondition reference (functions are lost during JSON clone)
  world.goalCondition = initialState.goalCondition;

  const ctx: ExecutionContext = {
    world,
    steps: [],
    maxSteps,
  };

  // Execute the program body
  executeBlock(program.body, ctx);

  // Check if goal was reached
  const success = ctx.error ? false : checkGoal(ctx.world);

  return {
    success,
    steps: ctx.steps,
    finalState: ctx.world,
    error: ctx.error,
  };
}

// ─── Block Execution (recursive) ──────────────────────────────────────────

function executeBlock(nodes: ASTNode[], ctx: ExecutionContext): void {
  for (const node of nodes) {
    if (ctx.error) return; // Stop on error
    if (ctx.steps.length >= ctx.maxSteps) {
      ctx.error = "Seu programa ficou rodando demais! Tente simplificar.";
      return;
    }

    switch (node.type) {
      case "action":
        executeAction(node, ctx);
        break;
      case "loop":
        executeLoop(node, ctx);
        break;
      case "if":
        executeIf(node, ctx);
        break;
    }
  }
}

// ─── Action Execution ──────────────────────────────────────────────────────

function executeAction(node: ActionNode, ctx: ExecutionContext): void {
  const { world } = ctx;
  const player = world.player;
  const fromState: PlayerState = JSON.parse(JSON.stringify(player));

  let action: StepAction;
  let worldChanges: ExecutionStep["worldChanges"];

  switch (node.name) {
    case "walk_forward":
    case "move_forward": {
      const vec = DIRECTION_VECTORS[player.direction];
      const newPos: Position = {
        x: player.position.x + vec.x,
        y: player.position.y + vec.y,
      };

      // Bounds check
      if (
        newPos.x < 0 ||
        newPos.x >= world.gridWidth ||
        newPos.y < 0 ||
        newPos.y >= world.gridHeight
      ) {
        action = "fail_move";
        break;
      }

      // Obstacle check
      const targetCell = world.grid[newPos.y][newPos.x];
      if (targetCell.content === "rock") {
        action = "fail_move";
        break;
      }

      player.position = newPos;
      action = "move";
      break;
    }

    // ─── Absolute directional moves (Level 3+) ─────────────────────────
    // These move in absolute screen directions, ignoring player.direction.
    // move_right = east (+x), move_left = west (-x)
    // move_down = south (+y), move_up = north (-y)
    case "move_right":
    case "move_down":
    case "move_up":
    case "move_left": {
      const absoluteVectors: Record<string, Position> = {
        move_right: { x: 1, y: 0 },
        move_left: { x: -1, y: 0 },
        move_down: { x: 0, y: 1 },
        move_up: { x: 0, y: -1 },
      };
      const absVec = absoluteVectors[node.name];
      const absNewPos: Position = {
        x: player.position.x + absVec.x,
        y: player.position.y + absVec.y,
      };

      // Bounds check
      if (
        absNewPos.x < 0 ||
        absNewPos.x >= world.gridWidth ||
        absNewPos.y < 0 ||
        absNewPos.y >= world.gridHeight
      ) {
        action = "fail_move";
        break;
      }

      // Obstacle check
      const absTargetCell = world.grid[absNewPos.y][absNewPos.x];
      if (absTargetCell.content === "rock") {
        action = "fail_move";
        break;
      }

      player.position = absNewPos;
      action = "move";
      break;
    }

    case "turn_left": {
      player.direction = TURN_LEFT[player.direction];
      action = "turn";
      break;
    }

    case "turn_right": {
      player.direction = TURN_RIGHT[player.direction];
      action = "turn";
      break;
    }

    case "plant": {
      const cell = world.grid[player.position.y][player.position.x];
      if (cell.content === "empty" || cell.content === "flowerbed") {
        worldChanges = [
          {
            position: { ...player.position },
            from: cell.content,
            to: "seed" as CellContent,
          },
        ];
        cell.content = "seed";
        action = "plant";
      } else {
        // Can't plant here — still counts as a step but no effect
        action = "plant";
      }
      break;
    }

    case "water": {
      const cell = world.grid[player.position.y][player.position.x];
      if (cell.content === "seed" || cell.content === "sprout") {
        const newContent: CellContent =
          cell.content === "seed" ? "sprout" : "flower";
        worldChanges = [
          {
            position: { ...player.position },
            from: cell.content,
            to: newContent,
          },
        ];
        cell.content = newContent;
        action = "water";
      } else if (cell.content === "watering_spot") {
        worldChanges = [
          {
            position: { ...player.position },
            from: "watering_spot",
            to: "watered" as CellContent,
          },
        ];
        cell.content = "watered";
        action = "water";
      } else {
        action = "water";
      }
      break;
    }

    case "pick_fruit": {
      const cell = world.grid[player.position.y][player.position.x];
      if (cell.content === "fruit") {
        worldChanges = [
          {
            position: { ...player.position },
            from: "fruit",
            to: "empty",
          },
        ];
        cell.content = "empty";
        player.inventory.fruits += 1;
        action = "pick";
      } else {
        action = "pick";
      }
      break;
    }

    default:
      // Unknown action — treat as no-op
      action = "stop";
      break;
  }

  const toState: PlayerState = JSON.parse(JSON.stringify(player));

  ctx.steps.push({
    action: action!,
    fromState,
    toState,
    worldChanges,
    blockId: node.id ?? "",
  });
}

// ─── Loop Execution ────────────────────────────────────────────────────────

function executeLoop(node: LoopNode, ctx: ExecutionContext): void {
  for (let i = 0; i < node.times; i++) {
    if (ctx.error) return;
    if (ctx.steps.length >= ctx.maxSteps) {
      ctx.error = "Seu programa ficou rodando demais! Tente simplificar.";
      return;
    }
    executeBlock(node.body, ctx);
  }
}

// ─── Conditional Execution ─────────────────────────────────────────────────

function executeIf(node: IfNode, ctx: ExecutionContext): void {
  const conditionMet = evaluateCondition(node.condition, ctx.world);

  // Record the condition evaluation as a step
  const player = ctx.world.player;
  const state: PlayerState = JSON.parse(JSON.stringify(player));
  ctx.steps.push({
    action: conditionMet ? "condition_true" : "condition_false",
    fromState: state,
    toState: state,
    blockId: node.id ?? "",
  });

  if (conditionMet) {
    executeBlock(node.then, ctx);
  } else if (node.else) {
    executeBlock(node.else, ctx);
  }
}

// ─── Condition Evaluation ──────────────────────────────────────────────────

function evaluateCondition(condition: string, world: WorldState): boolean {
  const cell = world.grid[world.player.position.y][world.player.position.x];

  switch (condition) {
    case "has_seed":
      return cell.content === "seed";
    case "has_sprout":
      return cell.content === "sprout";
    case "has_puddle":
      return cell.content === "puddle";
    case "has_fruit":
      return cell.content === "fruit";
    case "has_flowerbed":
      return cell.content === "flowerbed";
    default:
      return false;
  }
}

// ─── Goal Checking ─────────────────────────────────────────────────────────

function checkGoal(world: WorldState): boolean {
  const goal = world.goalCondition;

  switch (goal.type) {
    case "reach_position":
      return (
        world.player.position.x === goal.target.x &&
        world.player.position.y === goal.target.y
      );

    case "plant_all_seeds": {
      // All flowerbeds must have been planted (converted to seed)
      // AND at least one seed must exist
      const hasUnplantedFlowerbed = world.grid.some((row) =>
        row.some((cell) => cell.content === "flowerbed")
      );
      if (hasUnplantedFlowerbed) return false;

      const hasSeed = world.grid.some((row) =>
        row.some((cell) => cell.content === "seed")
      );
      return hasSeed;
    }

    case "water_all_sprouts": {
      // All cells that were sprouts should now be flowers
      const hasUnwateredSprout = world.grid.some((row) =>
        row.some((cell) => cell.content === "sprout")
      );
      return !hasUnwateredSprout;
    }

    case "collect_fruits":
      return world.player.inventory.fruits >= goal.target;

    case "tend_all_flowerbeds": {
      const hasUntended = world.grid.some((row) =>
        row.some((cell) => cell.content === "flowerbed")
      );
      return !hasUntended;
    }

    case "custom":
      return goal.check(world);

    default:
      return false;
  }
}
