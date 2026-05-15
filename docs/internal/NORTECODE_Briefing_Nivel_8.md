# Briefing de Execução — Nível 8 (Passo 4 do Protocolo)

**Projeto:** Norte Code
**De:** Claude (Estrategista)
**Para:** Claude Code (Dev Temporário — Cenário A do Protocolo)
**Via:** Gui
**Data:** Maio/2026

---

## Antes de começar — Leitura obrigatória

1. **Leia o `docs/internal/NORTECODE_Protocolo_Dev_Temporario.md` (v1.1)** — define seu papel e o cenário operacional (Cenário A).
2. **Leia o `docs/internal/NORTECODE_Protocolo_Colaboracao_IAs.md`** — fluxo geral e regras de não-retroatividade.
3. **Leia o `docs/internal/NORTECODE_Briefing_MVP.md` (v2.14)** — visão completa atualizada. Em especial: Seção 10 (Estado Atual de Implementação) e a entrada do Nível 8 dentro da Seção 4.7.
4. **Leia o `docs/internal/NORTECODE_DECISIONS_PendingEntries_Nivel8.md`** — entrada cronológica do `DECISIONS.md` sobre a serpente, pra você copiar pro `docs/DECISIONS.md` durante a implementação. Esta é a decisão narrativa mais importante deste ciclo.
5. **Leia o `docs/internal/NORTECODE_Style_Guide_Visual.md` (v1.3)** — referência visual.
6. **Inspecione o código existente** — em especial o que foi feito no Nível 7 (campo `conditionResult` em `ExecutionStep` como string, cadeia tripla do tronco, padrão "elemento que muda posição entre níveis", migração de assets do primeiro plano pro background). Foco em `lib/levels/index.ts`, `lib/interpreter/blocks.ts`, `lib/interpreter/interpreter.ts`, `lib/interpreter/world-state.ts`, `components/level/BlockPalette.tsx`, `components/level/ProgramArea.tsx`, `components/level/LevelScene.tsx`, e `app/world.tsx`.

Se algo neste briefing conflitar com o código existente, **PARE e pergunte ao Gui antes de prosseguir**. Não chute.

---

## Estratégia de execução (Cenário A — você roda local)

- Filesystem do projeto + git CLI no Windows do Gui.
- Repo: `https://github.com/nortecodeadm/norte-code`. Último estado conhecido: ciclo do Nível 7 fechado.
- **Commits direto no `main`.** Sem branch, sem PR. Quebre em commits lógicos.
- Antes de começar: `git pull origin main`.
- Conventional Commits.
- Não commitar `.env` ou credenciais.
- Pode rodar `npx expo start` localmente pra validar que o app sobe. Não gere APK EAS.

---

## Demanda

Implementar o **Nível 8** do MVP: introduzir o conceito de **variável (contador)** + bloco condicional novo `repeat_until_frutas_3` (loop com condição embutida) + transformação visual major do Mundo Permanente (background v3 substitui v2 + planta principal e mini-árvores migram pro background + novos elementos no primeiro plano incluindo a entrada visual da **serpente**).

Este é o briefing mais denso da série. Tem 4 frentes simultâneas:

1. **Engine** — sistema de variável + novo bloco `repeat_until_frutas_3` + edge cases
2. **UI nova** — contador no HUD ("Frutas: 0/3") + cesta da atividade (4 estados visuais enchendo) + sincronização cesta+HUD
3. **Mapa de atividade** — grade 1×5 com mecânica de "coletar frutas"
4. **Mundo permanente** — transformação visual major (substituir background, migrar 4 elementos pro background, adicionar 4 elementos novos incluindo a serpente)

Cada frente abaixo é detalhada na sua seção.

---

## Decisão tomada (contexto e razões)

### Posição do Nível 8 no roadmap

Quinto conceito de programação do MVP. Variável é a primeira ideia **abstrata sem comportamento visível imediato** — outros conceitos têm efeito direto (andar move o avatar, plantar planta), variável é "guardar um número". Resolvemos isso tornando a variável **dupla-mente visível**: contador no HUD (texto numérico) + cesta enchendo (visual concreto).

### Por que `repeat_until_frutas_3` (e não outras opções)

3 opções foram avaliadas em sessão:
- **(A)** `repeat_until_frutas_3` — loop com condição hardcoded "frutas = 3" → escolhida
- **(B)** `if_frutas_3_then_stop` + repeat genérico — exige conceito "Parar" novo
- **(C)** `pegar_fruta_se_frutas_menor_3` — variável fica implícita

Escolhemos (A) porque mantém o padrão "N hardcoded no bloco" (estabelecido nos Níveis 5-6) e mostra a variável crescendo explicitamente no HUD durante a execução — ponto pedagógico crítico.

### Por que cenário 1×5 linear

Princípio "uma virada por nível". Aqui o conceito novo é **variável + parada por condição**. Adicionar exigências espaciais (grade 2D com múltiplas árvores) seria sobrecarga. Linear 1×5 mantém familiaridade dos Níveis 6-7 + permite combinar movimento aprendido com conceito novo.

### Por que a transformação visual major acontece neste nível

Decisão estratégica registrada no Briefing MVP v2.7/v2.10: o jardim chegou em **plenitude** no Nível 8. O que era "cuidado individual" virou **paisagem**. Elementos que a criança plantou e cuidou (árvore principal + 3 mini-árvores que vieram das sementes do Nível 4) **se integram ao mundo permanente**, abrindo espaço visual pros eventos do Nível 9 (serpente atuando) e Nível 10 (cenário árido).

### Por que a serpente entra como recompensa neste nível (e NÃO no Nível 9)

**Decisão narrativa-chave da sessão de Maio/2026** (registrada em `NORTECODE_DECISIONS_PendingEntries_Nivel8.md`):

- **Motivação prática:** a serpente vai "atuar" no Nível 9. Pra atuar, precisa já existir no `WORLD_LAYOUT`. Mesmo padrão dos outros elementos.
- **Motivação narrativa:** coerência com Gn 3:1 — "A serpente era mais astuta que todos os animais selvagens." Ela **estava** no jardim antes da tentação, não foi importada.
- **Execução visual decidida:** serpente DENTRO da cesta de recompensa, envolvida entre as frutas, postura calma e atraente, passando confiança ("boa"). Não é ameaçadora visualmente — é convidativa. Esse é o ponto teológico: o mal bíblico em Gn 3 chega como conselho aparentemente bom, não como ameaça.

Quando a criança ver a serpente "atuar" no Nível 9, **já confiou nela visualmente** desde o Nível 8. Aproximação narrativa cultivada com peso.

**Princípio "sem catequese explícita" preservado:** restringe TEXTOS do jogo (sem versículos, sem menção a "Deus", "Jesus", "Bíblia", sem sermão). Não restringe composição visual — simbologia visual reconhecível é exatamente o que o produto carrega (Roadmap Narrativo: "uma serpente aparece — sem nome, sem fala explícita — só presença").

---

## Especificação completa do Nível 8

### Estrutura do mapa de atividade

- **Tipo:** grade 1×5 linear (1 linha × 5 colunas)
- **Posição inicial do avatar:** (linha 0, coluna 0) — célula mais à esquerda

### Layout da grade

```
Coluna:     0          1          2          3          4
Conteúdo: [AVATAR]  [chão]    [chão]    [chão]    [ÁRVORE FRUTÍFERA]
```

Onde:
- `AVATAR` = posição inicial, célula sem nada especial (chão simples)
- `chão` = células intermediárias, sem nada (caminho)
- `ÁRVORE FRUTÍFERA` = a árvore que tem as 3 frutas a serem coletadas. Avatar precisa estar nesta célula (col=4) pra executar `pegar_fruta`.

### Estados visuais (durante o jogo)

**No mapa de atividade:**
- Avatar: visual padrão (já existente)
- Chão: visual padrão (já existente, vazio)
- Árvore frutífera: usa o asset `mundo_arvore_frutifera.png` (já existente no projeto). **Visualmente fixa** — não diminui frutas conforme criança coleta (decisão simplificadora prévia).
- **Cesta da atividade** (NOVO ELEMENTO VISUAL): posicionada visualmente perto do avatar (Gui calibra posição depois). Vai trocando de asset conforme a criança coleta frutas:
  - Estado inicial: `atividade_cesta_vazia.png`
  - Após 1ª coleta: `atividade_cesta_1.png`
  - Após 2ª coleta: `atividade_cesta_2.png`
  - Após 3ª coleta: `atividade_cesta_3.png`

**No HUD:**
- Contador "🍎 Frutas: 0 / 3" posicionado no topo (abaixo ou ao lado do contador de movimentos existente). Cor neutra inicialmente.
- Quando `frutas === 3` → cor passa pra **verde-plant `#5D8A3C`** + animação de pulse (mesma família visual de "sucesso").

### Paleta de blocos disponíveis

3 blocos:

| ID do bloco | Label visível (PT-BR) | Categoria | Cor |
|---|---|---|---|
| `move_right` | Direita | Movimento | azul atual (`#4A90D9`) |
| `pegar_fruta` | Pegar fruta | Ação | a definir (sugestão: rosa-fruta `#D8848C` ou similar — categoria "ação de coleta", visualmente distinta de plant/water) |
| `repeat_until_frutas_3` | Repetir até pegar 3 frutas | Controle/Loop | roxo claro `#A88FD9` (mesma família dos condicionais — apesar de ser loop, é loop COM CONDIÇÃO, conceito mais próximo dos condicionais que do repeat fixo) |

**`move_left`, `move_up`, `move_down` NÃO entram** — não são necessários, adicionariam ruído.
**`repeat_3` e `repeat_5` (de níveis anteriores) NÃO entram** — paleta é por nível, não acumulativa.
**Blocos condicionais (`if_canteiro_vazio_then_plantar`, `if_canteiro_com_semente...`) NÃO entram.**
**`plant` e `water` NÃO entram** — não são parte da mecânica deste nível.

**Sobre a cor do `repeat_until_frutas_3`:** apesar de ser tecnicamente um "loop", semanticamente é um "loop condicional" — para quando uma condição é satisfeita. Coerente com a família visual condicional (roxo). **Se essa decisão de cor conflitar com o `repeat_5` ou outras estruturas existentes, PARE e me pergunte antes de implementar.**

### O bloco `pegar_fruta` (visual e comportamento)

**Visual na paleta e no programa:**
- Bloco sólido único.
- Cor: a definir conforme nota acima.
- Label de texto dentro do bloco: **"Pegar fruta"**.
- Ícone sugerido: 🍎 (emoji da maçã) — antes do texto ou em cima dele, conforme padrão de altura uniforme da paleta (estabelecido no Nível 6).

**Comportamento durante execução:**
- Verifica se avatar está na célula da árvore frutífera (col=4 neste nível).
- Se SIM:
  - Incrementa variável `frutas` em 1 (`frutas++`).
  - Anima fruta voando da árvore até a cesta da atividade (animação curta ~400ms).
  - Atualiza asset da cesta da atividade (vazia → 1, ou 1 → 2, etc.).
  - Atualiza contador HUD.
- Se NÃO (avatar não está na árvore):
  - Falha silenciosamente — não incrementa, não anima, não atualiza HUD.
  - Emite mensagem contextual: "O avatar precisa estar perto da árvore pra pegar frutas. Use os blocos de movimento." (mesma estrutura da heurística `didnt_move` do Nível 6).

### O bloco `repeat_until_frutas_3` (visual e comportamento)

**Visual:**
- Bloco "envelope" com slot interno pra blocos filhos (igual ao `repeat_5`, mesma mecânica de "modo edição via toque" estabelecida no Nível 5).
- Cor: roxo claro `#A88FD9`.
- Label: **"Repetir até pegar 3 frutas"** (texto literal, exatamente este).
- Indicador de iteração: pode mostrar "x até 3" ao lado, ou similar — definir conforme padrão visual já estabelecido.

**Comportamento durante execução:**
- A cada iteração, ANTES de executar os filhos:
  - Verifica se `frutas === 3`.
  - Se SIM: **interrompe o loop**. Passa pros próximos blocos do programa (se houver).
  - Se NÃO: executa os filhos em sequência. Depois volta a checar a condição.

**Limite de segurança (CRÍTICO):**
- Reusar o `MAX_EXECUTION_STEPS` já existente no interpretador.
- Se o loop atingir o limite sem completar (ex: programa sem `pegar_fruta` dentro do loop), exibir mensagem contextual: **"Hmm, parece que faltou pegar fruta dentro do repetir."**

**Mecânica de adição ao programa:**
- Mesma do `repeat_5` (modo edição via toque, slot interno). Padrão já estabelecido.

### Sistema de variável

**CRÍTICO:** este é o primeiro nível que introduz uma **variável real** no interpretador. Provavelmente requer mudança estrutural no `ExecutionStep` ou no estado de execução do interpretador.

**Sugestão de implementação:**

```typescript
// Novo campo no ExecutionState (não no ExecutionStep)
interface ExecutionState {
  // ... campos existentes (cells, avatarPos, etc.)
  variables: Map<string, number>; // ou Record<string, number>
}

// Inicialização: ao começar o nível, variables = { "frutas": 0 }
// pegar_fruta: variables["frutas"] += 1
// repeat_until_frutas_3: checa variables["frutas"] === 3
```

**Atenção arquitetural:** este é o primeiro caso de "variável" no sistema. Você está estabelecendo o padrão pra futuros blocos que usem variáveis. **PARE e me pergunte antes de implementar** se houver dúvida sobre como modelar:
- Variáveis no `ExecutionState` ou em escopo separado?
- Persistir variáveis entre etapas do loop ou resetar?
- Se uma variável é "consumida" pelo `repeat_until`, ela existe globalmente no nível ou só dentro do loop?

**Sugestão pragmática:** começar com escopo do nível (variável existe enquanto o nível executa, reseta ao reiniciar). Não over-engineer.

### Sincronização cesta + HUD

A cada execução de `pegar_fruta` bem-sucedida, **3 mudanças visuais simultâneas**:

1. Animação de fruta voando da árvore pra cesta da atividade (~400ms)
2. Asset da cesta da atividade troca (vazia → 1 → 2 → 3)
3. Contador HUD atualiza

**Sequência sugerida na timeline da execução:**
- Step de `pegar_fruta` inicia
- Animação de voo (400ms) — fruta visualmente translada
- Ao final da animação:
  - Asset da cesta troca instantaneamente
  - HUD incrementa
- Próximo step do programa começa

**Quando `frutas === 3`:**
- HUD passa pra cor verde + pulse (animação curta de "sucesso")
- Loop `repeat_until_frutas_3` interrompe (se estiver em execução)
- Programa continua pros blocos seguintes (provavelmente nenhum)

### Solução-alvo (5 blocos)

```
[move_right]
[move_right]
[move_right]
[repeat_until_frutas_3 [
  [pegar_fruta]
]]
```

Total: **5 blocos** (3 movimentos + 1 repeat_until + 1 pegar_fruta dentro).

**Após sucesso:** cesta da atividade no estado `atividade_cesta_3` + HUD em "🍎 Frutas: 3 / 3" (verde + pulse).

### Solução longa aceita (6 blocos)

```
[move_right]
[move_right]
[move_right]
[pegar_fruta]
[pegar_fruta]
[pegar_fruta]
```

Total: **6 blocos**. Sem usar variável (princípio "necessidade antes da ferramenta" — criança pode descobrir o `repeat_until` depois).

### `maxBlocks`

Sugestão: **`maxBlocks: 12`**.

Justificativa:
- Solução elegante: 5 blocos.
- Solução longa: 6 blocos.
- Margem confortável (12) pra exploração + casos esquisitos.

### Validação de sucesso

`successCondition`: `frutas === 3` ao final da execução do programa.

### Mensagens de erro contextuais

| Situação | Mensagem |
|---|---|
| Avatar tenta sair da grade (ex: 4º `move_right` na coluna 4) | "Esse lado não dá. O caminho continua em outra direção." (reusar mensagem dos Níveis 4-7) |
| `pegar_fruta` sem avatar estar na árvore | "O avatar precisa estar perto da árvore pra pegar frutas. Use os blocos de movimento." |
| `repeat_until_frutas_3` sem `pegar_fruta` dentro (loop atinge MAX_EXECUTION_STEPS) | "Hmm, parece que faltou pegar fruta dentro do repetir." |
| Programa termina sem `frutas === 3` | (mensagem genérica de "ainda há frutas pra pegar") |

### Edge cases

**E1) Solução longa sem `repeat_until`** — 6 blocos com 3 `pegar_fruta` em sequência:
- ✅ **Aceitar**. Princípio "necessidade antes da ferramenta".

**E2) Mais `pegar_fruta` que o necessário** — 4 `pegar_fruta` em sequência:
- O 4º falha silenciosamente (já tem 3 frutas, não há "4ª fruta" disponível). Programa continua, sucesso preservado (porque `frutas === 3` ao final).
- **Decisão arquitetural:** o `pegar_fruta` deve ser **idempotente quando o contador já está em 3** — não decrementa, não erra, só não acontece nada visual.

**E3) `repeat_until` sem `pegar_fruta` dentro:**
- Loop nunca termina sozinho. Interceptado pelo `MAX_EXECUTION_STEPS`.
- Mensagem contextual conforme tabela acima.

**E4) Avatar tenta executar `pegar_fruta` antes de chegar à árvore:**
- Falha silenciosamente. Mensagem contextual.

**E5) Programa coloca `pegar_fruta` fora do `repeat_until`, mas avatar não chegou à árvore:**
- Mesma mensagem do E4.

### Texto de conclusão do nível

> "Você usou um **lugar pra guardar** uma informação (quantas frutas). Isso se chama variável. Cuidar bem é saber a quantidade certa — não pegar tudo, não pegar de menos. Lembra disso — vai ser muito importante mais pra frente."

Texto literal, não negociável. Frase final ("vai ser muito importante mais pra frente") é o princípio "ferramentas antecipadas".

---

## TRANSFORMAÇÃO VISUAL MAJOR DO MUNDO PERMANENTE

Este é o ponto arquiteturalmente mais delicado deste briefing. **Atenção máxima aqui.**

### Operação A — Substituir background v2 por v3

- Remover `background_mundo_v2.png` do `app/world.tsx` (deixa de ser renderizado quando o estado contém `background_v3_active === true`).
- Adicionar `background_mundo_v3.png`.
- Padrão de substituição já estabelecido (Nível 5 substituiu v1 por v2). Reusar mesma lógica.

### Operação B — Remover árvore frutífera do primeiro plano

- A árvore principal (asset `fruit_tree_lvl7`, último elo da cadeia da planta principal) **deixa de renderizar** no primeiro plano após o Nível 8.
- **Não apaga o asset** — ele continua existindo no projeto. Só não é mais renderizado quando `level >= 8`.
- Razão: a árvore frutífera **passou a fazer parte do background v3** (é a árvore central destacada da composição).

**Implementação sugerida:** lógica condicional na cadeia da planta principal — quando o Mundo está em estado pós-Nível 8, a cadeia (seed_lvl1 → ... → fruit_tree_lvl7) **NÃO renderiza nada no primeiro plano** (porque a planta principal "virou paisagem").

### Operação C — Remover 3 mini-árvores do primeiro plano

- Mesma lógica que (B): as 3 mini-árvores (`mini_tree_lvl6_a/b/c`) **deixam de renderizar** no primeiro plano.
- Razão: viraram 3 das árvores médias do background v3.

### Operação D — Manter tronco caído com flor e esquilo no primeiro plano

- O `fallen_log_with_flower_and_squirrel_lvl7` **continua renderizando**. Sem mudança.
- Razão: tronco carrega 3 layers narrativos (morte → flor → esquilo). Migrar pro background descaracterizaria.

### Operação E — Manter fauna e flores existentes no primeiro plano

- 2 pássaros (`bird_lvl7_a` + `bird_lvl6_b`): continuam.
- Esquilo no chão (`squirrel_lvl7_ground`): continua.
- Flores rosa (Nível 3): continuam.
- 3 flores amarelas (Nível 6): continuam.
- 4 flores brancas (Nível 7): continuam.
- Outros elementos pequenos (pedras, etc.): continuam.

### Operação F — Adicionar cesta de recompensa com serpente

- **Asset:** `mundo_cesta_recompensa_com_serpente.png` (já está em `assets/mundo/`). É um asset único combinado — cesta + 3 frutas + serpente envolvida entre elas.
- **ID sugerido:** `basket_with_serpent_lvl8` (ou similar).
- **Posição:** placeholder (Gui calibra depois — provavelmente perto do avatar, no primeiro plano).
- **NÃO é a mesma cesta da atividade.** São 2 cestas conceitualmente distintas: a da atividade aparece só no mapa de atividade do Nível 8; a da recompensa fica permanente no Mundo.

### Operação G — Adicionar 2 borboletas (assets DIFERENTES)

- **Asset 1:** `mundo_borboleta_pousada.png` (já em `assets/mundo/`).
  - ID sugerido: `butterfly_perched_lvl8`.
  - Posição: placeholder, próxima a uma das flores existentes (Gui calibra).
- **Asset 2:** `mundo_borboleta_voando.png` (já em `assets/mundo/`).
  - ID sugerido: `butterfly_flying_lvl8`.
  - Posição: placeholder, em voo em direção a uma das flores (Gui calibra).

**IMPORTANTE:** as 2 borboletas são assets DIFERENTES (não é o padrão "1 asset com mirror" dos pássaros do Nível 6). São 2 imagens distintas.

### Observação técnica sobre as remoções (Operações B e C)

**A árvore frutífera e as 3 mini-árvores DEIXAM de renderizar no primeiro plano após o Nível 8 estar completo.** Mas os assets continuam existindo no projeto.

Possíveis implementações:

**(1) Flag no estado do mundo** — quando `worldElements` contém `background_v3_active === true`, a cadeia da planta principal e as mini-árvores não renderizam. Simples.

**(2) Substituição com asset transparente** — substitui os elementos por um "asset vazio" (placeholder transparente). Funciona mas é hack.

**(3) Lógica de visibilidade explícita** — adicionar campo `visible: boolean` aos elementos do `WORLD_LAYOUT`. Mais limpo mas adiciona complexidade ao schema.

**Recomendo (1)** — flag no estado. Mais simples, sem mudança no schema.

**Em qualquer caso, PARE e me pergunte antes de implementar** se houver risco de quebrar a renderização dos Níveis 1-7 (que esperam ver árvore principal e mini-árvores no primeiro plano).

---

## Escopo de execução — frontend

**Arquivos a modificar/criar:**

### Engine

1. **`lib/interpreter/blocks.ts`** — registrar 2 tipos novos:
   - `pegar_fruta` (categoria ação)
   - `repeat_until_frutas_3` (categoria controle/loop com condição)

2. **`lib/interpreter/interpreter.ts`** — adicionar cases:
   - `pegar_fruta`: verifica posição do avatar, incrementa variável, emite step com animação.
   - `repeat_until_frutas_3`: lógica condicional do loop (checa variável a cada iteração).
   - Reusar `MAX_EXECUTION_STEPS` pra prevenção de loop infinito.

3. **`lib/interpreter/world-state.ts`** — adicionar suporte a variáveis no estado:
   - Campo novo `variables: Record<string, number>` no `ExecutionState`.
   - Inicialização: `variables = { frutas: 0 }` ao começar Nível 8.
   - Aditivo, não-retroativo (Níveis 1-7 não usam).

### UI

4. **`components/level/BlockPalette.tsx`** — adicionar entradas:
   - `pegar_fruta` com cor + label + emoji 🍎.
   - `repeat_until_frutas_3` com cor roxa + label "Repetir até pegar 3 frutas".

5. **`components/level/ProgramArea.tsx`** — suporte ao envelope do `repeat_until_frutas_3` (mesma estrutura do `repeat_5`, mas com indicador de "até X frutas" em vez de "× N").

6. **`components/level/LevelScene.tsx`** — adicionar elementos novos ao mapa de atividade:
   - Asset da árvore frutífera (reusar `mundo_arvore_frutifera.png` existente) na coluna 4.
   - Asset da cesta da atividade — começa em `atividade_cesta_vazia.png`, troca conforme contador.
   - Posicionamento: cesta perto do avatar (Gui calibra).

7. **HUD do nível** — adicionar contador "🍎 Frutas: X / 3" no topo:
   - Cor neutra quando X < 3.
   - Cor verde-plant `#5D8A3C` + pulse quando X === 3.

8. **Animação fruta voando** — quando `pegar_fruta` executa com sucesso:
   - Fruta translada visualmente da árvore até a cesta (~400ms).
   - Ao final, troca asset da cesta + incrementa HUD.

### Mundo Permanente

9. **`app/world.tsx`** — múltiplas mudanças:
   - **Adicionar** ao `requires`: `background_mundo_v3`, `mundo_cesta_recompensa_com_serpente`, `mundo_borboleta_pousada`, `mundo_borboleta_voando`.
   - **Background v3:** lógica condicional renderiza v3 quando estado pós-Nível 8, senão v2.
   - **Remover renderização** de `fruit_tree_lvl7` e `mini_tree_lvl6_a/b/c` quando estado pós-Nível 8.
   - **Adicionar renderização** dos 4 elementos novos (cesta com serpente, 2 borboletas).
   - **Posições placeholder** pros 4 elementos novos. Gui calibra depois.
   - Estado: adicionar slots pros elementos novos no `WORLD_ELEMENTS`.

### Nível 8 propriamente dito

10. **`lib/levels/index.ts`** — adicionar `createLevel8()` e incluir em `LEVELS`:

```typescript
{
  id: 8,
  title: "Saber a medida certa",
  description: "Pegue exatamente 3 frutas. Use o bloco 'Repetir até pegar 3 frutas' pra parar na hora certa.",
  worldType: "grid_1d", // ou conforme schema existente
  grid: {
    rows: 1,
    cols: 5,
    avatarStart: { row: 0, col: 0 },
    cells: [
      { row: 0, col: 0, type: "ground" },           // Avatar
      { row: 0, col: 1, type: "ground" },           // chão
      { row: 0, col: 2, type: "ground" },           // chão
      { row: 0, col: 3, type: "ground" },           // chão
      { row: 0, col: 4, type: "fruit_tree" },       // Árvore frutífera (novo tipo? confirmar)
    ]
  },
  initialVariables: { frutas: 0 }, // se schema suportar; senão, lógica via interpreter
  availableBlocks: ["move_right", "pegar_fruta", "repeat_until_frutas_3"],
  successCondition: "frutas_equals_3", // ou custom
  maxBlocks: 12,
  // UI do mapa: cesta de atividade visível + contador no HUD
  rewards: [
    // Operação A: ativar background v3
    { type: "world_state_set", key: "background_v3_active", value: true },
    // Operações B, C: remover elementos (via flag global ou desativando IDs específicos)
    // (depende da implementação escolhida — consultar comigo)
    // Operação F: adicionar cesta com serpente
    { type: "world_element_add", id: "basket_with_serpent_lvl8", asset: "mundo_cesta_recompensa_com_serpente" },
    // Operação G: adicionar 2 borboletas
    { type: "world_element_add", id: "butterfly_perched_lvl8", asset: "mundo_borboleta_pousada" },
    { type: "world_element_add", id: "butterfly_flying_lvl8", asset: "mundo_borboleta_voando" },
  ],
  successText: "Você usou um lugar pra guardar uma informação (quantas frutas). Isso se chama variável. Cuidar bem é saber a quantidade certa — não pegar tudo, não pegar de menos. Lembra disso — vai ser muito importante mais pra frente."
}
```

(Formato sugerido. Ajustar pra schema real. Se algo divergir, **PARE e pergunte ao Gui** antes de modificar schema.)

### Build/Validação local

- Após implementar, rode `npx expo start` localmente.
- **Teste manual dos Níveis 1-7** após mudanças no `app/world.tsx`. Crítico — você está mexendo na cadeia da planta principal e nas mini-árvores. Se algum nível antigo quebrar visualmente, **PARE** e reporte.
- NÃO gere APK EAS — Gui testa via Fast Refresh.

---

## Critérios de aceite

1. Nível 8 aparece no fluxo após Nível 7.
2. Grade 1×5 renderiza corretamente com avatar na coluna 0 e árvore frutífera na coluna 4.
3. Paleta exibe 3 blocos: `move_right`, `pegar_fruta` (com emoji 🍎), `repeat_until_frutas_3` (roxo, "Repetir até pegar 3 frutas").
4. Cesta da atividade renderiza perto do avatar com estado inicial `atividade_cesta_vazia`.
5. Contador HUD "🍎 Frutas: 0 / 3" visível no topo.
6. Solução elegante de 5 blocos executa corretamente:
   - Avatar anda 3 vezes pra direita
   - `repeat_until_frutas_3` executa 3 iterações de `pegar_fruta`
   - A cada iteração: fruta voa pra cesta + cesta troca de asset + HUD incrementa
   - Após 3ª iteração: loop interrompe, HUD passa pra verde + pulse, nível completo
7. Solução longa de 6 blocos também é aceita.
8. Edge case E2: 4º `pegar_fruta` falha silenciosamente, programa termina com sucesso.
9. Edge case E3: `repeat_until_frutas_3` sem `pegar_fruta` dentro → mensagem contextual aparece.
10. Edge case E4: `pegar_fruta` sem avatar na árvore → mensagem contextual aparece.
11. Após sucesso, texto de conclusão correto (literal).
12. Após sucesso, Mundo permanente atualizado com:
    - Background v2 → v3
    - Árvore frutífera DEIXA de aparecer no primeiro plano
    - 3 mini-árvores DEIXAM de aparecer no primeiro plano
    - Cesta de recompensa com serpente aparece
    - 2 borboletas aparecem
13. Tronco caído com flor + esquilo CONTINUA aparecendo. Fauna existente (pássaros, esquilo no chão) CONTINUA.
14. **Níveis 1-7 NÃO regridam** — todos continuam renderizando os elementos esperados antes do Nível 8.
15. Persistência do Mundo OK após fechar/reabrir app (estado pós-Nível 8 preservado).
16. Estado da variável `frutas` reseta corretamente ao reiniciar o nível.

---

## O que NÃO fazer

1. **Não inventar mecânicas não especificadas.** Sem função (Nível 9), sem mais variáveis além de `frutas`.
2. **Não permitir N variável no `repeat_until_frutas_3`.** Condição hardcoded em "= 3".
3. **Não criar variável como conceito explícito na paleta** (sem bloco "criar variável", "atribuir valor", etc.). Variável é IMPLÍCITA no comportamento dos blocos `pegar_fruta` e `repeat_until_frutas_3`.
4. **Não refatorar Níveis 1-7 mais do que o necessário.** A única mudança neles é VISUAL (cadeia da planta principal e mini-árvores não renderizam após Nível 8). Funcionalidade preservada.
5. **Não alterar texto de conclusão.** Calibrado.
6. **Não criar assets do Nível 9+.**
7. **Não calibrar pixel perfect.** Gui faz depois.
8. **Não tomar decisões de produto sozinho.** Em dúvida, pergunte.
9. **Não pular documentação textual.**
10. **Não fazer commits gigantes.** Quebre em commits lógicos.
11. **Não pular a entrada do DECISIONS.md sobre a serpente.** Esta é a decisão narrativa mais importante deste ciclo — precisa estar registrada no DECISIONS.md.

---

## Documentação esperada

Após implementação, atualizar os seguintes `.md`:

1. **`docs/LEVELS.md`** — entrada completa do Nível 8.

2. **`docs/INTERPRETER.md`** — documentar:
   - Sistema de variáveis (campo `variables` no `ExecutionState`).
   - Bloco `pegar_fruta` (categoria ação, mecânica de incremento).
   - Bloco `repeat_until_frutas_3` (categoria controle, mecânica de loop condicional).
   - Edge cases (E1-E5) registrados.

3. **`docs/ARCHITECTURE.md`** — documentar:
   - Sistema de variáveis (decisão arquitetural).
   - Padrão de "elemento que deixa de renderizar" para a transformação do primeiro plano (Operações B e C).
   - Cadeia da planta principal estendida (chega ao fim no Nível 7 — ela "migra" pro background no Nível 8).

4. **`docs/DECISIONS.md`** — COPIAR a entrada de `docs/internal/NORTECODE_DECISIONS_PendingEntries_Nivel8.md` (decisão narrativa sobre a serpente) + adicionar entrada técnica sobre o sistema de variáveis e a transformação visual major.

---

## Relatório de Execução (obrigatório ao final)

Mesmo formato dos Níveis 5, 6 e 7:

```
Relatório de Execução: Claude Code → Claude (Estrategista)
Projeto: Norte Code
Demanda executada: Implementação do Nível 8 — variável (contador) + transformação visual major do Mundo

O que foi implementado:
[Descrição por frente: engine, UI, mapa de atividade, mundo permanente]

Decisões técnicas tomadas (fora do briefing):
[Decisões tomadas sozinho com justificativa. Especialmente:
 - como modelou o sistema de variáveis
 - estratégia exata pra remover elementos do primeiro plano pós-Nível 8
 - sincronização entre cesta visual + HUD + animação
 - se houve placeholder pra animação de "fruta voando"]

Arquivos alterados:
- [lista]

Commits feitos (no main):
- [SHA] [mensagem]
...

Critérios de aceite — Status:
1. [x/?] [comentário]
...
16. [x/?] [comentário]

Validações técnicas executadas:
[TypeScript check; teste manual dos Níveis 1-7 pós-mudanças no world.tsx;
 dimensões dos 9 assets novos; conferência da entrada da serpente no DECISIONS]

Documentação atualizada:
- LEVELS.md, INTERPRETER.md, ARCHITECTURE.md, DECISIONS.md

Pontos de atenção pra validação do Gui:
[Áreas pra teste especial — especialmente regressão visual dos Níveis 1-7,
 calibração dos 4 elementos novos no Mundo, animação de fruta voando,
 sincronização cesta+HUD]
```

---

## Resumo curto

- Você é Dev Temporário (Cenário A — local + git).
- Tarefa: implementar Nível 8 (variável + transformação visual major).
- **Engine novo:** sistema de variáveis + 2 blocos (`pegar_fruta`, `repeat_until_frutas_3`).
- **UI nova:** contador HUD "🍎 Frutas: 0/3" + cesta da atividade com 4 estados visuais (vazia/1/2/3) + animação fruta voando.
- **Mapa de atividade:** grade 1×5 `[Avatar][chão][chão][chão][Árvore frutífera]`.
- **Solução-alvo:** 5 blocos. Solução longa: 6 blocos. `maxBlocks: 12`.
- **TRANSFORMAÇÃO VISUAL MAJOR do Mundo:**
  - Background v2 → v3
  - Árvore frutífera + 3 mini-árvores DEIXAM de renderizar no primeiro plano (viraram parte do background v3)
  - Tronco caído com flor+esquilo MANTÉM
  - 4 elementos NOVOS no primeiro plano: cesta com serpente + 2 borboletas
- **Decisão narrativa-chave:** serpente entra no Mundo como recompensa do Nível 8 (dentro da cesta, calma e atraente). Copiar entrada do DECISIONS_PendingEntries_Nivel8.md pro DECISIONS.md.
- **Todos os 9 assets novos já estão em `assets/mundo/`.**
- Commit direto no `main`. Conventional Commits. Quebre em commits lógicos.
- Documentação obrigatória nos 4 `.md`.
- Em dúvida: PARE e pergunta. Não chute.
