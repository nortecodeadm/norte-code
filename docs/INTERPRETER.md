# Interpretador de Blocos — Norte Code

**Última atualização:** 14/05/2026
**Versão:** 1.7.0 (Nível 7 jogável — bloco if/else embutido `if_canteiro_com_semente_then_regar_else_if_canteiro_vazio_then_plantar`; migração `conditionResult: boolean → "plant" | "water" | "none"`)

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
| `if_canteiro_vazio_then_plantar` | **Condicional embutido (1 ramo).** Se célula atual é `flowerbed` → planta (vira `seed`) e emite `conditionResult: "plant"`. Caso contrário → ignora e emite `conditionResult: "none"`. Step sempre carrega `action: "plant"`. | Condicional sólido | Nível 6 |
| `if_canteiro_com_semente_then_regar_else_if_canteiro_vazio_then_plantar` | **Condicional embutido (2 ramos / if/else).** Se célula é `seed` → rega (vira `sprout`), `action: "water"` + `conditionResult: "water"`. Senão se `flowerbed` → planta (vira `seed`), `action: "plant"` + `conditionResult: "plant"`. Senão → no-op, `conditionResult: "none"`. | Condicional sólido | Nível 7 |

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

**Blocos condicionais embutidos (Níveis 6 e 7):**

Categoria de blocos onde a lógica condicional mora dentro de `executeAction`
(não como `IfNode` no AST). São `ActionNode` na árvore — o handler verifica
o estado da célula atual e decide o que fazer + qual `conditionResult` emitir.

- **`if_canteiro_vazio_then_plantar` (Nível 6 — 1 ramo):** se `"flowerbed"`,
  planta e emite `"plant"`; senão, não mexe no mundo e emite `"none"`.

- **`if_canteiro_com_semente_then_regar_else_if_canteiro_vazio_then_plantar`
  (Nível 7 — if/else, 2 ramos):** se `"seed"`, rega (seed→sprout) e emite
  `"water"`; senão se `"flowerbed"`, planta (flowerbed→seed) e emite
  `"plant"`; senão, no-op e emite `"none"`. O `action` do step reflete a
  ação concreta executada (`"water"` / `"plant"`) — integra com a infra
  de animação existente. Quando ignora, mantém `action: "plant"` só pra o
  step contabilizar tempo de animação.

Decisão pedagógica: bloco sólido único na UI (sem slot, sem modo de edição)
mantém a mecânica simples enquanto a criança aprende os conceitos. A
camada de UI usa `conditionResult` pra colorir o destaque do bloco ativo
(verde pra `"plant"`, azul pra `"water"`, cinza pra `"none"`). Ver seção 6
(ExecutionStep) e DECISIONS.md.

### 2.3 Loop (níveis 5+)

Repete um bloco de statements N vezes:

```json
{
  "type": "loop",
  "times": 3,
  "body": [
    { "type": "action", "name": "move_right" }
  ],
  "id": "blk_loop_1"
}
```

O campo `times` define quantas iterações. O `body` pode conter qualquer tipo de nó, incluindo loops aninhados (o engine suporta — não há restrição em runtime).

**Origem na UI:** o bloco `repeat_3` da paleta vira `LoopNode { times: 3, ... }` (Nível 5). O bloco `repeat_5` da paleta vira `LoopNode { times: 5, ... }` (Nível 6). Ambos N hardcoded pelo conversor `blocksToAST` em `app/level/[id].tsx`. Variar N na UI só acontece em níveis posteriores (Nível 8 — pendente).

**Comportamento em falha:** se algum nó dentro do `body` retorna `fail_move` (bate em pedra ou sai da grade), `executeLoop` para a iteração atual via `ctx.error` (na verdade não há erro hard — o controle volta porque `executeBlock` retorna ao detectar próximo step com falha). Mensagem contextual é montada pela UI a partir do `failReason` do primeiro `fail_move` da execução (mesma lógica do Nível 4 — não regressa).

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
| `fruits_equal` | `player.inventory.fruits` igual a N (`conditionValue`) | **Declarada em `ConditionType` mas não implementada em `evaluateCondition` — sempre retorna `false`.** Ver dívida técnica em DECISIONS.md. Dúvida pra reaproveitamento futuro. |
| `fruits_equal_3` | `player.inventory.fruits === 3` | **Implementada (Nível 8).** Hardcoded em "= 3" — usada exclusivamente pelo `RepeatUntilNode` do `repeat_until_frutas_3`. Quando o MVP ganhar 2º caso de variável, vale generalizar pra `fruits_equal_N`. |

A maioria das condições olha a **célula atual do player**. `fruits_equal_3` é a primeira a olhar **estado global do jogador** (`player.inventory.fruits`) — abre o caminho pra condições baseadas em variáveis ou estado de mundo no futuro.

---

### 2.5 RepeatUntil — loop com condição embutida (Nível 8+)

Loop que repete os filhos ATÉ a condição ser satisfeita. Diferente do
`LoopNode` (`times` fixo), aqui a iteração para quando a condição
vira verdadeira:

```json
{
  "type": "repeat_until",
  "condition": "fruits_equal_3",
  "body": [
    { "type": "action", "name": "pick_fruit" }
  ],
  "id": "blk_repeat_until_1"
}
```

**Comportamento de execução** (`executeRepeatUntil` em `interpreter.ts`):
1. Avalia `condition`. Se já verdadeira → encerra sem executar filhos.
2. Senão → executa `body` uma vez via `executeBlock`.
3. Volta ao passo 1.

**Origem na UI:** o bloco `repeat_until_frutas_3` da paleta vira
`RepeatUntilNode { condition: "fruits_equal_3", ... }`. Hoje é o
único caso. Quando o 2º bloco condicional surgir, vale parametrizar
o nome do bloco (ex: `repeat_until_<condicao>_<valor>`) ou
introduzir um seletor de condição na UI.

**Fail-safe contra loop infinito:** mesma proteção do `LoopNode` —
`MAX_EXECUTION_STEPS` (200). Adicional específico do `RepeatUntil`:
se uma iteração não emite nenhum step (corpo só com containers
vazios) E a condição não muda, o `executeRepeatUntil` força saída
com `ctx.error` antes de loopar tight. Sem isso, o `executeBlock`
só pararia depois das 200 iterações por contar steps internos
(zero por iteração).

**Edge case do Nível 8 — `repeat_until_frutas_3` sem `pick_fruit`
dentro:** o corpo emite steps (move_*, etc.) mas a condição nunca
muda, e `MAX_EXECUTION_STEPS` para o engine. UI traduz pra
mensagem contextual "Hmm, parece que faltou pegar fruta dentro do
repetir." (chave `wrong_path` do level 8).

---

### 2.6 Estrutura de programa na UI — blocos com filhos (Nível 5+)

A partir do Nível 5, a camada de UI suporta **blocos estruturais** (containers) que aceitam filhos. Hoje só um bloco é container — `repeat_3` — mas o padrão está preparado pra todas as estruturas aninhadas dos níveis 6-9 (condicional, if/else, função).

**Tipo `ProgramBlock` (camada UI, definido em `components/level/ProgramArea.tsx`):**

```typescript
interface ProgramBlock {
  id: string;
  type: BlockType;
  children?: ProgramBlock[]; // Opcional: definido só em containers
}
```

Quando `children` é `undefined`, o bloco é simples (folha) — `Níveis 1-4` continuam funcionando idênticos, sem qualquer mudança de comportamento.

**Predicado `isContainerBlock(type)`** em `ProgramArea.tsx` enumera quais tipos são containers. Hoje: `repeat_3`, `repeat_5` e `repeat_until_frutas_3` (Nível 8 — mesma mecânica de envelope, semântica diferente). Estruturas dos níveis seguintes serão adicionadas conforme entrarem.

> **Importante:** `if_canteiro_vazio_then_plantar` (Nível 6) **NÃO** é container — é folha. O comportamento condicional embutido fica dentro do `executeAction`, não como `IfNode` com filhos. Ver seção 2.2.

**Conversão `ProgramBlock[]` → `ASTNode[]`** (recursiva, em `app/level/[id].tsx`):

```typescript
function blocksToAST(blocks: ProgramBlock[]): ASTNode[] {
  return blocks.map((b): ASTNode => {
    if (b.type === "repeat_3" || b.type === "repeat_5") {
      return {
        type: "loop",
        times: b.type === "repeat_3" ? 3 : 5,
        body: blocksToAST(b.children ?? []),
        id: b.id,
      };
    }
    if (b.type === "repeat_until_frutas_3") {
      return {
        type: "repeat_until",
        condition: "fruits_equal_3",
        body: blocksToAST(b.children ?? []),
        id: b.id,
      };
    }
    return { type: "action", name: b.type, id: b.id };
  });
}
```

Demais utilitários recursivos (`countBlocks`, `removeBlockById`, `insertInContainer`, `findBlockById`) cuidam de manter a árvore consistente quando a criança adiciona, remove ou edita blocos.

**Contagem de `maxBlocks`** é PLANA — cada bloco conta 1, incluindo filhos. O contador no header do `ProgramArea` usa o prop `totalCount` calculado com `countBlocks(programBlocks)`.

**UX "modo edição via toque"** (decisão de produto registrada em `DECISIONS.md`):
- Estado `editingContainerId` em `app/level/[id].tsx` aponta pro envelope ativo.
- Tap em `repeat_3` na paleta cria envelope vazio + entra automaticamente em modo edição.
- Tap em outro bloco da paleta enquanto modo está ativo: bloco entra DENTRO do envelope (via `insertInContainer`).
- Tap no header do envelope alterna o modo. Botão "Pronto ✓" também sai. Tap fora encerra também (planejado — primeira versão só cobre tap no envelope/botão).
- Saída valida se envelope tem ao menos 1 filho — se não, exibe mensagem amigável e mantém modo aberto.
- Aninhamento profundo (`repeat_3` dentro de `repeat_3`) é bloqueado na função `handleAddBlock` — alinhado com "O que NÃO fazer" do briefing do Nível 5.

**Persistência:** programa NÃO é persistido em disco (AsyncStorage). Vive em `useState` local — mesmo padrão dos Níveis 1-4. Se a criança sai da tela e volta, o programa começa vazio (mesmo comportamento dos níveis anteriores). Se quiser persistência de rascunho no futuro, vira tarefa de BACKLOG.

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

## 3.1 Execução do Mascote-Gabarito (Níveis 7+)

A partir do Nível 7, quando a criança vence, o interpretador roda uma
**segunda vez** — desta vez com a solução ótima do nível, executada
pelo mascote. É a feature "Mascote como Gabarito Visual".

**Campo `optimalSolution` no `LevelDefinition`** (`lib/levels/index.ts`):

```typescript
interface LevelDefinition {
  // ... campos existentes
  optimalSolution?: OptimalSolutionBlock[];  // opcional, aditivo
}

interface OptimalSolutionBlock {
  type: BlockType;
  children?: OptimalSolutionBlock[];  // pra containers (repeat_*)
}
```

`OptimalSolutionBlock` é deliberadamente mais simples que o
`ProgramBlock` da UI: **não carrega `id`**. Os ids são gerados em
runtime por `optimalToProgramBlocks` (em `app/level/[id].tsx`), que
deriva ids estáveis do caminho na árvore (`opt_0`, `opt_3_0`, etc.).
Ids estáveis importam porque alimentam DOIS lados que precisam casar:
o `blocksToAST` (gera os `step.blockId`) e a renderização da
ProgramArea (recebe o highlight). Definido em `lib/levels` e não
importado de `components/` — mantém a direção de dependência sã.

**Fluxo da 2ª execução** (orquestrado em `app/level/[id].tsx`,
função `runMascoteGabarito`):

```
[Criança vence — result.success === true]
       │
       ▼
[Respiração ~500ms]
       │
       ▼
[TransitionMessage aparece sobre o mapa (~1.8s)]
       │
       ▼
[ATRÁS da mensagem: WorldState reseta pro initialWorld]
[ATRÁS da mensagem: executor "avatar" → "mascote" (troca de sprite)]
       │
       ▼
[Mensagem some]
       │
       ▼
[executeProgram(blocksToAST(optimalSolution), freshWorld)]
       │
       ▼
[animateSteps — mesma mecânica da 1ª execução]
       │
       ▼
[Level summary]
```

**Pontos-chave:**
- A 2ª execução **sempre tem sucesso** — a `optimalSolution` é, por
  definição, uma solução válida. Não há ramo de falha.
- A 2ª execução **não conta como tentativa** — o nível é registrado
  como completo uma única vez, no level summary.
- O **reset do mapa** entre execuções é um clone JSON do
  `level.initialWorld` (mesma técnica do reset normal), com o
  `goalCondition` restaurado por referência (funções se perdem no
  clone).
- A **troca de sprite** é puramente de renderização: o `LevelScene`
  recebe a prop `executor` (`"avatar" | "mascote"`); quando
  `"mascote"`, desenha o sprite do mascote (humor `"atento"`) na
  célula do player em vez do círculo verde. A mecânica de movimento
  é idêntica — só o pixel muda.
- Níveis sem `optimalSolution` (1-6) pulam tudo isso: `result.success`
  vai direto pro level summary, como antes. Regressão zero.

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
  content: CellContent;    // "empty" | "seed" | "sprout" | "flower" | "fruit" | "puddle" | "rock" | "flowerbed" | "watering_spot" | "watered" | "basket" | "fruit_tree"
}

interface PlayerState {
  position: Position;      // { x, y }
  direction: Direction;    // "north" | "south" | "east" | "west"
  inventory: { fruits: number };
}
```

**`inventory.fruits` no Nível 8 — variável reaproveitada:** a partir
do Nível 8, esse campo deixa de ser só "estoque do avatar" e passa
a ser **a variável `frutas`** do programa. Decisão registrada em
DECISIONS.md (YAGNI sobre criar campo genérico `variables`).
Reset automático via clone do `initialWorld` no `resetWorld` de
`app/level/[id].tsx` — cada execução começa com `fruits: 0`.

**Regras de movimento:**
- Mover para fora do grid → `fail_move` (step registrado, posição não muda)
- Mover para célula com `rock` → `fail_move`
- Plantar em célula não-vazia → no-op (step registrado, sem efeito)
- Regar seed → vira sprout. Regar sprout → vira flower.
- `pick_fruit` em `fruit` → consome a célula (vira `empty`) e
  incrementa `inventory.fruits`. Comportamento original.
- `pick_fruit` em `fruit_tree` (Nível 8+) → célula NÃO muda
  (visualmente fixa). Incrementa `inventory.fruits` se < 3,
  idempotente quando >= 3.

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
  conditionResult?: "plant" | "water" | "none"; // Preenchido por blocos condicionais embutidos (Níveis 6 e 7)
}
```

A UI reproduz os steps com 500ms de intervalo, destacando o bloco ativo na ProgramArea.

**`failReason` (introduzido no Nível 4):** Quando um movimento falha, o interpretador agora diferencia se foi por colisão com `rock` ou por tentativa de sair da grade. A camada de UI (`getContextualError` em `app/level/[id].tsx`) usa o `failReason` do **primeiro** `fail_move` da execução pra escolher entre as mensagens `errorMessages.blocked_by_rock` e `errorMessages.out_of_grid` configuradas no nível. Níveis que não declaram `out_of_grid` caem no fallback anterior (`wrong_path` / `blocked_by_rock`) — sem regressão pros Níveis 1-3.

**`conditionResult` (introduzido no Nível 6, expandido no Nível 7):** Campo opcional preenchido apenas por blocos condicionais embutidos. Identifica qual ramo da condicional executou. **Aditivo, não-retroativo:** steps dos Níveis 1-5 nunca definem o campo, comportamento da UI preservado.

**Migração no Nível 7:** o campo passou de `boolean` pra `"plant" | "water" | "none"`. Necessário pra acomodar 3 resultados possíveis do if/else. Mapeamento da migração no Nível 6:
- `true`  → `"plant"` (CV virou seed)
- `false` → `"none"` (célula não era CV — ignorou)

Nenhuma persistência externa de `conditionResult` (não vai pro Supabase, não vai pro AsyncStorage) — a mudança é contida no runtime do interpretador. Comportamento do Nível 6 preservado pixel a pixel.

A camada de UI usa o campo pra pintar o destaque do bloco ativo via função pura `conditionResultColor(result)` no `ProgramArea`:
- `"plant"` → verde `#5D8A3C` (reusa cor do `plant` — Nível 6, e ramo "senão se vazio" do Nível 7)
- `"water"` → azul-rio `#5B8AA6` (cor do regar, Style Guide v1.3 — ramo "se com semente" do Nível 7)
- `"none"`  → cinza claro `#BDBDBD` ("ignorou" sem ser punitivo)
- `undefined` → cor original do bloco (não condicional)

O estado é propagado de `app/level/[id].tsx` (variável `activeConditionResult: "plant" | "water" | "none" | undefined`) pro `ProgramArea` via prop e, recursivamente, pros filhos de containers como `repeat_5`.

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
- [x] Níveis 1-7 jogáveis (sequência → 2D → loop → condicional simples → if/else)
- [x] Containers com filhos (`repeat_3`, `repeat_5`) + "modo edição via toque"
- [x] Feedback visual de condicional (verde/azul/cinza) via `conditionResult` string

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
