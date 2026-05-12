# Interpretador de Blocos — Norte Code

**Última atualização:** 05/05/2026
**Versão:** 1.2.0 (Engine com movimentos absolutos — Nível 3 jogável)

---

## 1. O que é o Interpretador

O interpretador é o **motor central** do Norte Code. Ele transforma a sequência de blocos que a criança montou em ações executáveis no cenário do nível. É o equivalente a um compilador/runtime simplificado para a linguagem visual do app.

**Princípio fundamental:** O mesmo JSON que renderiza a UI dos blocos É o programa que é executado. Sem duplicação de estado.

---

## 2. Arquitetura AST (Abstract Syntax Tree)

O programa da criança é representado como uma árvore JSON. Cada nó da árvore é um dos tipos abaixo:

### 2.1 Program (raiz)

Todo programa é envolvido por um nó `program`:

```json
{
  "type": "program",
  "body": [ ...statements ]
}
```

O campo `body` contém uma lista ordenada de nós (statements) que serão executados sequencialmente.

### 2.2 Action (folhas)

Ações são os blocos atômicos — cada um executa uma operação no mundo:

```json
{ "type": "action", "name": "walk_forward", "id": "blk_1" }
{ "type": "action", "name": "move_right", "id": "blk_2" }
{ "type": "action", "name": "move_down", "id": "blk_3" }
{ "type": "action", "name": "move_up", "id": "blk_4" }
{ "type": "action", "name": "plant", "id": "blk_5" }
{ "type": "action", "name": "water", "id": "blk_6" }
{ "type": "action", "name": "pick_fruit", "id": "blk_7" }
```

O campo `id` é opcional e usado para highlight visual durante execução.

**Ações disponíveis:**

| name | Efeito | Tipo | Introduzido |
|------|--------|------|-------------|
| `walk_forward` / `move_forward` | Move 1 célula na direção atual do player | Relativo | Nível 1 |
| `move_right` | Move 1 célula para a direita (leste, +X) | Absoluto | Nível 3 |
| `move_down` | Move 1 célula para baixo (sul, +Y) | Absoluto | Nível 3 |
| `move_up` | Move 1 célula para cima (norte, -Y) | Absoluto | Nível 3 |
| `move_left` | Move 1 célula para a esquerda (oeste, -X) | Absoluto | Reservado |
| `turn_left` | Gira 90° anti-horário | Relativo | Reservado |
| `turn_right` | Gira 90° horário | Relativo | Reservado |
| `plant` | Planta semente na célula atual | Ação | Nível 1 |
| `water` | Rega (seed→sprout, sprout→flower, watering_spot→watered) | Ação | Nível 2 |
| `pick_fruit` | Coleta fruta da célula atual | Ação | Reservado |

**Movimentos relativos vs absolutos:**
- **Relativos** (`walk_forward`, `turn_*`): dependem de `player.direction`. Usados nos Níveis 1-2.
- **Absolutos** (`move_right`, `move_down`, `move_up`, `move_left`): ignoram `player.direction`, movem em direção fixa da tela. Usados no Nível 3+.
- Ambos coexistem no interpretador. Cada nível define quais blocos estão disponíveis.

**Validação de movimento (todos os tipos):**
- Bounds check: se a posição destino está fora do grid → `fail_move`
- Obstacle check: se a célula destino contém `rock` → `fail_move`
- Sucesso: atualiza `player.position` → `move`

### 2.3 Loop (níveis 4+)

Repete um bloco de statements N vezes:

```json
{
  "type": "loop",
  "times": 3,
  "body": [
    { "type": "action", "name": "walk_forward" },
    { "type": "action", "name": "plant" }
  ],
  "id": "blk_loop_1"
}
```

O campo `times` define quantas iterações. O `body` pode conter qualquer tipo de nó, incluindo loops aninhados.

### 2.4 Conditional (níveis 6+)

Executa um bloco condicionalmente:

```json
{
  "type": "if",
  "condition": "has_seed",
  "then": [
    { "type": "action", "name": "water" }
  ],
  "else": [
    { "type": "action", "name": "plant" }
  ],
  "id": "blk_if_1"
}
```

O campo `else` é opcional. Se omitido, nada acontece quando a condição é falsa.

**Condições disponíveis:**

| condition | Verdadeiro quando... |
|-----------|---------------------|
| `has_seed` | Célula atual contém semente |
| `has_sprout` | Célula atual contém broto |
| `has_puddle` | Célula atual contém poça |
| `has_fruit` | Célula atual contém fruta |
| `has_flowerbed` | Célula atual contém canteiro |

---

## 3. Fluxo de Execução

```
[Criança monta blocos na UI]
       │
       ▼
[UI converte ProgramBlock[] → ProgramNode (AST JSON)]
       │
       ▼
[executeProgram(ast, worldState, config)]
       │
       ▼
[Engine percorre AST recursivamente]
  ├── action → executa no WorldState, gera ExecutionStep
  ├── loop → repete body N vezes
  └── if → avalia condição, executa then ou else
       │
       ▼
[Retorna ExecutionResult]
  ├── success: boolean (goal atingido?)
  ├── steps: ExecutionStep[] (para animação)
  ├── finalState: WorldState (estado final do mundo)
  └── error?: string (se houve problema)
       │
       ▼
[UI anima steps sequencialmente (500ms cada)]
       │
       ▼
[Se success → tela de resumo + recompensa]
[Se falha → mensagem + permite editar programa]
```

---

## 4. Modelo de Mundo (WorldState)

O mundo de cada nível é representado como um grid 2D:

```typescript
interface WorldState {
  grid: Cell[][];          // Grid[y][x]
  gridWidth: number;
  gridHeight: number;
  player: PlayerState;
  goalCondition: GoalCondition;
}

interface Cell {
  position: Position;
  content: CellContent;    // "empty" | "seed" | "sprout" | "flower" | "fruit" | "puddle" | "rock" | "flowerbed" | "watering_spot" | "watered" | "basket"
}

interface PlayerState {
  position: Position;      // { x, y }
  direction: Direction;    // "north" | "south" | "east" | "west"
  inventory: { fruits: number };
}
```

**Regras de movimento:**
- Mover para fora do grid → `fail_move` (step registrado, posição não muda)
- Mover para célula com `rock` → `fail_move`
- Plantar em célula não-vazia → no-op (step registrado, sem efeito)
- Regar seed → vira sprout. Regar sprout → vira flower.

---

## 5. Condições de Vitória (GoalCondition)

Cada nível define uma condição verificada ao final da execução:

| type | Descrição | Parâmetro |
|------|-----------|-----------|
| `reach_position` | Jogador chegou a (x,y) | `target: Position` |
| `plant_all_seeds` | Pelo menos 1 semente plantada | — |
| `water_all_sprouts` | Nenhum sprout restante | — |
| `collect_fruits` | N frutas no inventário | `target: number` |
| `tend_all_flowerbeds` | Nenhum flowerbed restante | — |
| `custom` | Função customizada | `check: (world) => boolean` |

---

## 6. ExecutionStep (para animação)

Cada step atômico gerado pelo interpretador:

```typescript
interface ExecutionStep {
  action: StepAction;          // "move" | "turn" | "plant" | "water" | "pick" | "fail_move" | "stop" | "condition_true" | "condition_false"
  fromState: PlayerState;      // Estado antes
  toState: PlayerState;        // Estado depois
  worldChanges?: WorldChange[];// Mudanças nas células
  blockId: string;             // ID do bloco que gerou (para highlight)
}
```

A UI reproduz os steps com 500ms de intervalo, destacando o bloco ativo na ProgramArea.

---

## 7. Proteção contra Loop Infinito

Limite: `MAX_EXECUTION_STEPS = 200`. Se ultrapassado:
- Execução para imediatamente
- `error` retorna: "Seu programa ficou rodando demais! Tente simplificar."
- UI mostra estado de erro

---

## 8. Validação de Programa e Botão Executar

**Princípio pedagógico:** O interpretador NÃO valida o programa antes da execução. Qualquer programa com ≥1 bloco é executável.

**Comportamento do botão Executar:**
- `disabled = programBlocks.length === 0` — única condição de desativação
- Programa "errado" (ex: só Plantar sem Andar) → executa, falha, criança aprende com feedback
- Não há bloqueio preventivo — aprendizagem por tentativa e erro é fundamental

**Feedback de erro contextual (pós-execução):**
- Sem bloco de movimento: "Tente andar até o canteiro primeiro!"
- Sem bloco de plantar: "Faltou plantar! Use o bloco Plantar."
- Plantou no lugar errado: "Você precisa andar até o canteiro antes de plantar!"
- Genérico: "Quase! Tente uma ordem diferente dos blocos."

**Indicador de blocos:** Mostra contagem simples ("2 blocos"), não fração ("2/4") que sugere obrigatoriedade.

---

## 9. Como Adicionar um Novo Tipo de Bloco

1. Adicionar o `name` no switch case de `executeAction()` em `interpreter.ts`
2. Adicionar o tipo em `BlockType` (arquivo `blocks.ts`)
3. Adicionar label/cor/ícone em `BLOCK_CONFIG` no `BlockPalette.tsx`
4. Adicionar label em `BLOCK_LABELS` no `ProgramArea.tsx`
5. Se for bloco composto (loop/if), adicionar handler próprio
6. Atualizar esta documentação

---

## 10. Como Adicionar uma Nova Condição

1. Adicionar o case em `evaluateCondition()` em `interpreter.ts`
2. Documentar na tabela da seção 2.4 acima
3. Adicionar ao UI de seleção de condição (quando implementado)

---

## 11. Exemplo Completo — Nível 1

**Objetivo:** Andar até posição (1,0) e plantar uma semente.

**Programa montado pela criança:**
```json
{
  "type": "program",
  "body": [
    { "type": "action", "name": "move_forward", "id": "blk_1" },
    { "type": "action", "name": "plant", "id": "blk_2" }
  ]
}
```

**Mundo inicial:**
- Grid 3×1, todo vazio
- Player em (0,0) virado para east

**Execução:**
1. `move_forward` → player move de (0,0) para (1,0)
2. `plant` → célula (1,0) muda de "empty" para "seed"

**Verificação:** `plant_all_seeds` → existe seed no grid? Sim → **SUCCESS**

---

## 12. Status de Implementação

- [x] AST JSON definido (Program, Action, Loop, If)
- [x] Engine de execução sequencial
- [x] Suporte a loops (simples e aninhados)
- [x] Suporte a condicionais (if e if/else)
- [x] Detecção de loop infinito (200 steps)
- [x] Geração de ExecutionSteps para animação
- [x] Componentes visuais (BlockPalette, ProgramArea, ExecuteButton, LevelScene)
- [x] Nível 1 jogável (ciclo completo)
- [ ] Suporte a funções (definir/chamar) — Nível 9
- [ ] Testes unitários
- [ ] Drag-and-drop de blocos (MVP usa tap-to-add)
