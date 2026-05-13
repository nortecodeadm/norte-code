# Interpretador de Blocos — Norte Code

**Última atualização:** 13/05/2026
**Versão:** 1.4.0 (Nível 4 jogável — `move_left` ativo em paleta + `failReason` em `ExecutionStep`)

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

**Ações disponíveis (implementadas no engine):**

| name | Efeito | Tipo | Introduzido |
|------|--------|------|-------------|
| `walk_forward` / `move_forward` | Move 1 célula na direção atual do player | Relativo | Nível 1 |
| `move_right` | Move 1 célula para a direita (leste, +X) | Absoluto | Nível 3 |
| `move_left` | Move 1 célula para a esquerda (oeste, -X) | Absoluto | Nível 4 (engine: Nível 3) |
| `move_down` | Move 1 célula para baixo (sul, +Y) | Absoluto | Nível 3 |
| `move_up` | Move 1 célula para cima (norte, -Y) | Absoluto | Nível 3 |
| `turn_left` | Gira 90° anti-horário (atualiza `player.direction`) | Relativo | Disponível |
| `turn_right` | Gira 90° horário (atualiza `player.direction`) | Relativo | Disponível |
| `plant` | Planta semente em célula `empty` ou `flowerbed` | Ação | Nível 1 |
| `water` | Rega (seed→sprout, sprout→flower, watering_spot→watered) | Ação | Nível 2 |
| `pick_fruit` | Coleta fruta da célula atual (incrementa `inventory.fruits`) | Ação | Disponível |

> **Nota sobre aliases:** `walk_forward` e `move_forward` apontam para o mesmo handler (fall-through no switch de `executeAction`). Os níveis novos usam `move_forward` por consistência com os movimentos absolutos; `walk_forward` é mantido por compatibilidade com a nomenclatura original alinhada com Claude.

> **"Disponível" vs "Introduzido":** ações marcadas como "Disponível" estão implementadas no engine mas ainda não são usadas por nenhum nível em produção. Não há barreira técnica para incluí-las num nível novo.

**Movimentos relativos vs absolutos:**
- **Relativos** (`walk_forward`, `turn_*`): dependem de `player.direction`. Usados nos Níveis 1-2.
- **Absolutos** (`move_right`, `move_down`, `move_up`, `move_left`): ignoram `player.direction`, movem em direção fixa da tela. Usados no Nível 3+.
- Ambos coexistem no interpretador. Cada nível define quais blocos estão disponíveis na paleta.

**Validação de movimento (todos os tipos):**
- Bounds check: se a posição destino está fora do grid → `fail_move` (step registrado, posição não muda).
- Obstacle check: se a célula destino contém `rock` → `fail_move`.
- Sucesso: atualiza `player.position` → step com `action: "move"`.

**Validação de ações de mordomia:**
- `plant` em célula não-vazia e não-`flowerbed` → step registrado com `action: "plant"`, mas **nenhuma mudança no mundo**. A criança vê o avatar tentar plantar e nada acontece — feedback implícito.
- `water` em célula que não seja `seed`/`sprout`/`watering_spot` → idem (no-op silencioso).
- `pick_fruit` em célula sem fruta → idem.
- O engine não falha nem aborta — a aprendizagem por tentativa e erro é fundamental no método (ver decisão "Botão Executar: ativo com ≥1 bloco" em DECISIONS.md).

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

| condition | Verdadeiro quando... | Status no engine |
|-----------|---------------------|------------------|
| `has_seed` | Célula atual contém semente | Implementada |
| `has_sprout` | Célula atual contém broto | Implementada |
| `has_puddle` | Célula atual contém poça | Implementada |
| `has_fruit` | Célula atual contém fruta | Implementada |
| `has_flowerbed` | Célula atual contém canteiro | Implementada |
| `fruits_equal` | `player.inventory.fruits` igual a N (`conditionValue`) | **Declarada em `ConditionType` mas não implementada em `evaluateCondition` — sempre retorna `false`.** Ver dívida técnica em DECISIONS.md. |

Todas as condições implementadas hoje olham a **célula atual do player**. Condições que dependem de inventário ou estado global do mundo (como `fruits_equal`) exigem extensão do `evaluateCondition`.

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
  failReason?: "rock" | "out_of_grid"; // Preenchido só quando action === "fail_move"
}
```

A UI reproduz os steps com 500ms de intervalo, destacando o bloco ativo na ProgramArea.

**`failReason` (introduzido no Nível 4):** Quando um movimento falha, o interpretador agora diferencia se foi por colisão com `rock` ou por tentativa de sair da grade. A camada de UI (`getContextualError` em `app/level/[id].tsx`) usa o `failReason` do **primeiro** `fail_move` da execução pra escolher entre as mensagens `errorMessages.blocked_by_rock` e `errorMessages.out_of_grid` configuradas no nível. Níveis que não declaram `out_of_grid` caem no fallback anterior (`wrong_path` / `blocked_by_rock`) — sem regressão pros Níveis 1-3.

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

**Engine (lib/interpreter/):**
- [x] AST JSON definido (Program, Action, Loop, If)
- [x] Engine de execução sequencial recursiva
- [x] Movimentação relativa (`walk_forward`/`move_forward`, `turn_left`, `turn_right`)
- [x] Movimentação absoluta (`move_right`, `move_left`, `move_up`, `move_down`)
- [x] Ações de mordomia (`plant`, `water`, `pick_fruit`)
- [x] Suporte a loops (simples e aninhados)
- [x] Suporte a condicionais `if` e `if/else` no AST
- [x] 5 das 6 condições declaradas implementadas (`fruits_equal` falta)
- [x] Detecção de loop infinito (200 steps)
- [x] Geração de ExecutionSteps para animação
- [x] GoalCondition: todos os 6 tipos cobertos no `checkGoal`, incluindo `custom`
- [x] Preservação da função `goalCondition.check` após deep clone JSON

**Camada de UI (fora de lib/interpreter/):**
- [x] Componentes visuais (BlockPalette, ProgramArea, ExecuteButton, LevelScene)
- [x] Tap-to-add (MVP — drag-and-drop pós-MVP)
- [x] Níveis 1, 2 e 3 jogáveis

**Não implementado / pendente:**
- [ ] Suporte a funções (definir/chamar) — `BlockType` declarado, AST e executor faltam (Nível 9)
- [ ] Condição `fruits_equal` no `evaluateCondition`
- [ ] Bloco `stop` (declarado em `BlockType` sem semântica de runtime definida)
- [ ] Testes unitários
- [ ] Drag-and-drop de blocos

Ver seção 13 abaixo e o bloco "Dívida Técnica Conhecida" em DECISIONS.md para detalhes dos gaps.

---

## 13. Gaps e pontos de atenção do motor

Esta seção lista o que o engine **declara** mas ainda **não executa**, para evitar surpresas em quem for usar uma feature pela primeira vez. A análise completa de cada item (impacto, intencionalidade, plano) está em DECISIONS.md sob "Dívida Técnica Conhecida".

1. **Funções (`define_function` / `call_function`):** existem como `FunctionDefBlock` e `FunctionCallBlock` em `blocks.ts`, mas não há `FunctionDefNode`/`FunctionCallNode` no AST nem case correspondente em `executeBlock`. Tentar executar um programa que use esses blocos hoje cai no nada (são tratados como `Block` genérico sem handler). Endereçar antes do Nível 9.

2. **Condição `fruits_equal`:** declarada em `ConditionType` mas não tratada em `evaluateCondition`. Hoje retorna sempre `false`. Quem usar essa condição num nível não vai conseguir entrar no ramo `then`.

3. **Conversão `IfElseBlock` → `IfNode`:** o AST `IfNode` aceita `else?`. A camada que converte `Block[]` (UI) em `ProgramNode` (AST) está fora de `lib/interpreter/` e ainda não foi validada para `if_else`. Verificar antes de ativar `if_else` num nível.

4. **Bloco `stop`:** existe em `BlockType` mas sem semântica de runtime. No `executeAction` cai no `default` (sem efeito, gera step com `action: "stop"` mas não interrompe execução). Precisa de decisão de produto antes de aparecer num nível: parar programa? abortar bloco atual? saída de loop?

5. **Comentário de cabeçalho desatualizado em `interpreter.ts`:** o doc-comment do topo do arquivo cita só `walk_forward` como exemplo de ação. Como `move_forward` e os absolutos foram adicionados depois, o comentário ficou anacrônico. Sem impacto em runtime — só ruído de documentação no código.
