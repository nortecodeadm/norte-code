# Briefing de Execução — Nível 6 (Passo 4 do Protocolo)

**Projeto:** Norte Code
**De:** Claude (Estrategista)
**Para:** Claude Code (Dev Temporário — Cenário A do Protocolo)
**Via:** Gui
**Data:** Maio/2026

---

## Antes de começar — Leitura obrigatória

Você está atuando como Dev Temporário do Norte Code. Antes de qualquer linha de código:

1. **Leia o `docs/internal/NORTECODE_Protocolo_Dev_Temporario.md` (v1.1)** — define seu papel e o cenário operacional (Cenário A: filesystem local + git CLI).
2. **Leia o `docs/internal/NORTECODE_Protocolo_Colaboracao_IAs.md`** — fluxo geral e regras de não-retroatividade.
3. **Leia o `docs/internal/NORTECODE_Briefing_MVP.md` (atualmente v2.10)** — visão completa atualizada. Em especial: Seção 10 (Estado Atual de Implementação) e a entrada do Nível 6 dentro da Seção 4.7.
4. **Leia o `docs/internal/NORTECODE_Style_Guide_Visual.md` (v1.3)** — referência visual.
5. **Inspecione o código existente** — em especial o que foi feito no Nível 5 (mudança estrutural pra blocos com filhos, sistema de loops, lógica de validação por estado final do mundo). Foco em `lib/levels/index.ts`, `lib/interpreter/blocks.ts`, `lib/interpreter/interpreter.ts`, `lib/interpreter/world-state.ts`, `components/level/BlockPalette.tsx`, `components/level/ProgramArea.tsx` e `app/world.tsx`.

Se algo neste briefing conflitar com o que existe no código, **PARE e pergunte ao Gui antes de prosseguir**. Não chute.

---

## Estratégia de execução (Cenário A — você roda local)

- Você tem acesso ao filesystem do projeto e ao git CLI no Windows do Gui.
- Repositório: `https://github.com/nortecodeadm/norte-code`. Último push: commit `5c57312` (fim do Nível 5).
- **Estratégia de commits: direto no `main`.** Sem branch, sem PR. Quebre em commits lógicos.
- Antes de começar: `git pull origin main`.
- Conventional Commits sempre.
- Não commitar `.env` ou credenciais.
- Pode rodar `npx expo start` localmente pra validar que o app sobe sem crash. Não gere APK EAS.

---

## Demanda

Implementar o **Nível 6** do MVP do Norte Code: introduzir o conceito de **condicional simples (se → então)** através de um bloco "tudo em um" (`if_canteiro_vazio_then_plantar`). O nível ensina **discernimento** — a criança aprende a olhar antes de agir, executando ações só quando condições são verdadeiras.

---

## Decisão tomada (contexto e razões)

### Posição do Nível 6 no roadmap

Após o par pedagógico 4-5 (sequência longa + loop fixo), o Nível 6 inaugura o **terceiro conceito de programação** do MVP: condicional. É o primeiro nível em que a criança aprende que blocos podem ter **comportamento variável** dependendo do contexto da célula em que o avatar está.

### Por que bloco "tudo em um" e não envelope com slot

Nível 6 é a primeira introdução ao conceito condicional. Manter mecânica simples: o bloco `if_canteiro_vazio_then_plantar` é **único e indivisível** — não tem slot interno onde a criança escolhe o que fazer. Comportamento embutido: SE célula tem canteiro vazio ENTÃO planta. SENÃO ignora.

Isso reduz carga cognitiva pra criança aprender **o que é condicional** primeiro. No Nível 7, com `if/else`, ela aprende a **escolher entre 2 ações** — aí sim o conceito amadurece. Princípio "uma virada por nível".

### Por que cenário 1×6 linear e não 2D

Nível 4 introduziu navegação 2D. Nível 5 reforçou com loop. Nível 6 não precisa adicionar dificuldade espacial — o foco é o conceito novo de condicional. Cenário linear (1×6) deixa o conceito brilhar sem competição.

### Por que distribuição `[Avatar][SC][CV][CP][CV][CV]`

Pedagogicamente calibrado:
- **Avatar inicial** numa célula sem canteiro nem decisão necessária.
- **1ª célula = SC (sem canteiro)** — primeiro encontro com "não dá pra plantar". O conceito de "ação condicionada" entra logo, sem ambiguidade.
- **2ª célula = CV (canteiro vazio)** — primeiro plantio. Criança sente o condicional retornando verdadeiro.
- **3ª célula = CP (canteiro já plantado)** — caso mais sutil: tem canteiro, mas já está ocupado. Testa se criança realmente *olhou* antes de agir.
- **4ª e 5ª = CV, CV** — confirmação de domínio. Criança já testou todos os casos do condicional, agora aplica com confiança.

Os 3 estados aparecem nas 3 primeiras células. Ordem pensada pra dar familiaridade incremental sem virar sequência decorada.

### Por que `repeat_5` como bloco novo (não `repeat_n` variável)

Mantém princípio "N hardcoded no bloco" estabelecido no Nível 5 com `repeat_3`. O Nível 6 introduz **condicional** — adicionar "loop com N variável" no mesmo nível seria sobrecarga.

Quando o N variável for introduzido (provavelmente entre Nível 8 e 9), ele substitui os `repeat_N` específicos. Princípio retroativo será aplicado com cuidado.

Na paleta do Nível 6, **só aparece `repeat_5`** — o `repeat_3` do Nível 5 não fica disponível neste nível (paleta é por nível, não acumulativa).

### Princípio narrativo do Mundo permanente

O Nível 6 marca o **primeiro nível com fauna no Mundo**. Sinal de que a vida não é só vegetação — agora há criaturas habitando o jardim que a criança cuidou. Coerência narrativa com "elementos antigos viram parte da paisagem permanente" — as 3 plantinhas do Nível 5 viram 3 mini-árvores, integrando-se ao jardim consolidado.

---

## Especificação completa do Nível 6

### Estrutura do mundo do nível

- **Tipo:** grade 1×6 linear (1 linha × 6 colunas)
- **Posição inicial do avatar:** (linha 0, coluna 0) — célula mais à esquerda

### Layout da grade

```
Coluna:     0          1            2          3           4         5
Conteúdo: [AVATAR]  [SEM_CANT]   [CV]      [CP]        [CV]       [CV]
```

Onde:
- `AVATAR` = posição inicial, célula sem canteiro (apenas chão)
- `SEM_CANT` (SC) = célula sem canteiro algum (chão simples)
- `CV` = canteiro vazio (terra fofa, sem broto/semente — pronto pra plantar)
- `CP` = canteiro com semente já plantada (sementinha visível ali, sinalizando "já tem")

### Estado das células visível

Crítico: a criança vê o estado de TODAS as células ANTES de executar. Visualmente distinto:
- **Avatar / SC:** chão liso, sem nenhum elemento
- **CV:** quadradinho de terra fofa, sem broto (similar ao asset de canteiro pronto pra plantar que já existe nos Níveis 4-5)
- **CP:** quadradinho de terra fofa com **sementinha visível por cima** (reusar asset da semente já existente)

A diferença visual entre CV e CP precisa ser **óbvia pra criança de 7-10 anos** — não sutil. CP tem semente visivelmente plantada; CV está vazio.

### Paleta de blocos disponíveis

3 blocos:

| ID do bloco | Label visível (PT-BR) | Categoria | Cor |
|---|---|---|---|
| `move_right` | Direita | Movimento | mesma cor azul dos movimentos (atualmente `#4A90D9` — pendência do BACKLOG item 3) |
| `if_canteiro_vazio_then_plantar` | Se vazio, plantar | Controle/Condicional | **Roxo claro `#A88FD9`** (NOVO — categoria nova) |
| `repeat_5` | Repetir 5× | Controle/Loop | Laranja atual (`#E8853D` — mesmo padrão do `repeat_3`) |

**`move_left`, `move_up`, `move_down` NÃO entram na paleta** — não são necessários e adicionariam ruído.
**`plant` simples NÃO entra na paleta isoladamente** — o `if_canteiro_vazio_then_plantar` é a única forma de plantar neste nível. Esse é o ponto pedagógico: criança aprende que plantar SÓ acontece quando a condição é verdadeira.

### O bloco `if_canteiro_vazio_then_plantar` (visual e comportamento)

**Visual na paleta e no programa:**
- Bloco sólido único (NÃO é envelope com slot interno).
- Cor: roxo claro `#A88FD9`.
- Label de texto dentro do bloco: **"Se vazio, plantar"** (escolha visual: pode usar ícone `🌱` no fim se houver espaço, mas o texto literal é prioritário).
- Aparência: igual aos outros blocos sólidos (`move_right`, etc.), só muda a cor e o texto.

**Mecânica de adição ao programa:**
- Igual a todos os blocos sem filhos: criança **tapa nele** na paleta → ele é adicionado ao programa.
- **NÃO há modo de edição** (igual ao do `repeat_3`). Bloco vai direto pro programa, ponto.

**Comportamento durante execução:**
- Quando o interpretador encontra este bloco, verifica o estado da célula ATUAL do avatar.
- Se a célula é **CV** (canteiro vazio sem semente) → executa ação `plant` (transforma CV em CP) e emite step com `conditionResult: true`.
- Se a célula é **CP** (canteiro com semente) OU **SC** (sem canteiro algum) → não faz nada, emite step com `conditionResult: false`.

**Feedback visual durante execução:**
- O `ExecutionStep` ganha campo opcional `conditionResult?: boolean`.
- O `ProgramArea` usa esse campo pra pulsar/destacar o bloco:
  - `conditionResult: true` → bloco pulsa em **verde** (sutil, mesmo padrão visual de "bloco executando" que já existe).
  - `conditionResult: false` → bloco pulsa em **cinza claro** (indicando "ignorado" sem ser punitivo).
- Princípio de não-retroatividade: `conditionResult` é campo opcional. Outros blocos não declaram, comportamento normal preservado.

### Solução-alvo (3 blocos visíveis, 2 dentro do repeat)

```
[Repetir 5× [
  move_right,
  if_canteiro_vazio_then_plantar
]]
```

Contagem com a regra do Nível 5 ("cada bloco conta 1, incluindo filhos"):
- Repeat = 1
- move_right (dentro) = 1
- if_canteiro_vazio_then_plantar (dentro) = 1
- **Total: 3 blocos**

### `maxBlocks`

Sugestão: `maxBlocks: 12`.

Justificativa:
- Solução elegante: 3 blocos.
- Solução longa sem `repeat_5` (5 iterações manuais de `[move_right, if_canteiro_vazio_then_plantar]`): 10 blocos.
- Margem de 2 sobre a solução longa.

Mesma lógica do Nível 5: permitir solução longa como alternativa, com margem de exploração. Comentar isso no código.

### Validação de sucesso

`successCondition`: ao final da execução, as 3 células CV originais (colunas 2, 4, 5) precisam estar transformadas em CP (com semente plantada). Estado da célula CP original (coluna 3) deve permanecer inalterado. Estados das células SC (colunas 0 e 1) também inalterados.

### Mensagens de erro contextuais

| Situação | Mensagem |
|---|---|
| Avatar tenta sair da grade (ex: 6º `move_right` na coluna 5) | "Esse lado não dá. O caminho continua em outra direção." (mesma do Nível 4-5) |
| Programa termina sem plantar todos os canteiros vazios | (mensagem genérica de "ainda há canteiros vazios") |

Não há outras condições de erro neste nível — sem pedras, sem obstáculos.

### Texto de conclusão do nível

Após sucesso, exibir na tela de resumo:

> "Você aprendeu a **olhar antes de fazer**. Nem todo lugar pede a mesma ação. Saber decidir é cuidar bem. Lembra disso — vai ser muito útil mais pra frente."

A frase final ("vai ser muito útil mais pra frente") é o princípio de "ferramentas antecipadas" registrado em DECISIONS.md — planta a semente de que condicional vai voltar no Nível 10. NÃO alterar este texto sem consultar o Gui.

### Recompensas no Mundo permanente

Após sucesso no Nível 6, atualizar o Mundo permanente (`world_state`) com **múltiplas operações**:

**Operação 1 — Adicionar 2 pássaros (primeira fauna do MVP):**
- Asset: `mundo_passaro_pousado.png` (já está em `assets/mundo/`, gerado pelo Gui).
- 2 instâncias do **mesmo asset**:
  - `bird_lvl6_a`: pousa no tronco caído com flor. Posição placeholder (Gui calibra depois).
  - `bird_lvl6_b`: pousa na pedra. Posição placeholder. **Espelhada horizontalmente** (transform `scaleX: -1` ou equivalente em React Native) — assim parece "casal" virado em direções opostas, em vez de 2 pássaros clones.
- IDs distintos pra cada um. Asset reusado.

**Operação 2 — Substituir as 3 plantinhas estágio 3 por 3 mini-árvores:**
- Continuidade narrativa: as plantinhas que a criança regou no Nível 5 agora cresceram.
- Substituir `plant_stage3_lvl5_a/b/c` por `mini_tree_lvl6_a/b/c`.
- Asset: reusar `mundo_mini_arvore.png` que já existe (mesmo asset usado pra `mini_tree_lvl4` da planta principal antes dela virar árvore jovem).
- 3 instâncias do MESMO asset, nas posições que as plantinhas ocupavam (Gui calibra).

**Operação 3 — Adicionar 3 flores amarelas decorativas:**
- Asset: `mundo_flor_amarela.png` (já está em `assets/mundo/`, gerado pelo Gui).
- 3 instâncias do MESMO asset, em posições placeholder espalhadas pelo jardim (não agrupadas). Gui calibra.
- IDs: `yellow_flower_lvl6_a/b/c`.

**Planta principal NÃO muda neste nível.** Continua sendo árvore jovem do Nível 5. Evolução pra árvore frutífera fica reservada pro Nível 7.

**Background do Mundo NÃO muda neste nível.** Continua sendo v2 (com graminha + florestinha em silhueta). Background v3 fica reservado pro Nível 8.

---

## Escopo de execução

### Frontend (React Native / Expo)

**Arquivos a modificar/criar (inspecionar como os Níveis 4-5 foram feitos e seguir os padrões):**

1. **`lib/levels/index.ts`** — adicionar `createLevel6()` e incluir em `LEVELS`. Estrutura sugerida (ajustar pra schema real):

```typescript
{
  id: 6,
  title: "Olha antes de plantar",
  description: "Plante apenas nos canteiros vazios. Use o bloco 'Se vazio, plantar' dentro do Repetir.",
  worldType: "grid_1d",  // ou "grid_2d" com rows: 1, conforme schema real
  grid: {
    rows: 1,
    cols: 6,
    avatarStart: { row: 0, col: 0 },
    cells: [
      { row: 0, col: 0, type: "ground" },        // SC (avatar parte daqui)
      { row: 0, col: 1, type: "ground" },        // SC
      { row: 0, col: 2, type: "empty_planter" }, // CV
      { row: 0, col: 3, type: "planted_seed" },  // CP
      { row: 0, col: 4, type: "empty_planter" }, // CV
      { row: 0, col: 5, type: "empty_planter" }, // CV
    ]
  },
  availableBlocks: ["move_right", "if_canteiro_vazio_then_plantar", "repeat_5"],
  successCondition: "all_empty_planters_planted",
  maxBlocks: 12,
  rewards: [
    // Operações de ADIÇÃO (2 pássaros + 3 flores amarelas)
    { type: "world_element_add", id: "bird_lvl6_a", asset: "mundo_passaro_pousado", transform: { mirrored: false } },
    { type: "world_element_add", id: "bird_lvl6_b", asset: "mundo_passaro_pousado", transform: { mirrored: true } },
    { type: "world_element_add", id: "yellow_flower_lvl6_a", asset: "mundo_flor_amarela" },
    { type: "world_element_add", id: "yellow_flower_lvl6_b", asset: "mundo_flor_amarela" },
    { type: "world_element_add", id: "yellow_flower_lvl6_c", asset: "mundo_flor_amarela" },
    // Operações de SUBSTITUIÇÃO (3 plantinhas → 3 mini-árvores)
    { type: "world_element_replace", removeId: "plant_stage3_lvl5_a", addId: "mini_tree_lvl6_a", asset: "mundo_mini_arvore" },
    { type: "world_element_replace", removeId: "plant_stage3_lvl5_b", addId: "mini_tree_lvl6_b", asset: "mundo_mini_arvore" },
    { type: "world_element_replace", removeId: "plant_stage3_lvl5_c", addId: "mini_tree_lvl6_c", asset: "mundo_mini_arvore" },
  ],
  successText: "Você aprendeu a olhar antes de fazer. Nem todo lugar pede a mesma ação. Saber decidir é cuidar bem. Lembra disso — vai ser muito útil mais pra frente."
}
```

(Formato sugerido — ajustar pra schema real. Em particular, o conceito `transform.mirrored` pode não existir no schema atual. Se não existir, sinalizar e propor adição. Se preferir resolver via prop visual no `app/world.tsx` em vez de no level config, tudo bem.)

2. **`lib/interpreter/blocks.ts`** — registrar 2 tipos novos de bloco:
   - `if_canteiro_vazio_then_plantar` (categoria condicional, cor roxa, comportamento conditional simples)
   - `repeat_5` (categoria loop, comportamento idêntico ao `repeat_3` mas com N=5 hardcoded)

3. **`lib/interpreter/interpreter.ts`** — adicionar lógica de execução:
   - `if_canteiro_vazio_then_plantar`: verifica `cell.type === "empty_planter"` na posição atual. Se sim, executa transformação pra `"planted_seed"` e emite step com `conditionResult: true`. Se não, emite step com `conditionResult: false` sem mexer no estado.
   - `repeat_5`: igual ao `repeat_3` com `times: 5` hardcoded.

4. **`lib/interpreter/world-state.ts`** — adicionar campo opcional `conditionResult?: boolean` em `ExecutionStep`. Aditivo, não quebra steps existentes (campo undefined em steps de Níveis 1-5).

5. **`components/level/BlockPalette.tsx`** — adicionar entradas pros 2 blocos novos:
   - `if_canteiro_vazio_then_plantar`: cor `#A88FD9`, label "Se vazio, plantar"
   - `repeat_5`: cor laranja atual, label "Repetir 5×"

6. **`components/level/ProgramArea.tsx`** — quando renderizar um bloco com `conditionResult` no step ativo:
   - Se `true` → glow verde sutil (mesma família visual de "bloco ativo" já existente)
   - Se `false` → glow cinza claro
   - Se `undefined` (blocos sem condição) → comportamento atual preservado

7. **`app/world.tsx`** — duas operações:
   - **Substituir** `plant_stage3_lvl5_a/b/c` por `mini_tree_lvl6_a/b/c` no `WORLD_LAYOUT`.
   - **Adicionar** 2 pássaros (com mirror em 1 deles) + 3 flores amarelas em posições placeholder.

8. **Lógica de recompensas** — após Nível 6 ser marcado como completo, executar TODAS as operações no estado do Mundo. Persistir no AsyncStorage e em Supabase via sync (mesmo fluxo dos Níveis 4-5).

### Backend (Supabase)

Sem mudanças de schema previstas, exceto possivelmente:
- Suporte ao campo `conditionResult` em steps (se houver persistência de steps no banco — verificar).
- Suporte ao novo `cell.type === "planted_seed"` como estado distinto de `"empty_planter"` (verificar como os Níveis 4-5 representavam estado de canteiro).

Se a estrutura atual não suportar, **confirmar com o Gui antes de fazer qualquer alteração de schema**.

### Assets

**Assets NOVOS (Gui está providenciando — todos já entregues):**
- `mundo_passaro_pousado.png` ✅ (em `assets/mundo/`)
- `mundo_flor_amarela.png` ✅ (em `assets/mundo/`)

**Assets reusados (já existentes no projeto):**
- `mundo_mini_arvore.png` (do Nível 4 — vai ser usado 3 vezes pras 3 mini-árvores)
- Asset de canteiro vazio (dos Níveis 4-5)
- Asset de semente plantada (do Nível 1 e Níveis 4-5)
- Asset de chão simples (background)

### Build/Validação local

- Após implementar, rode `npx expo start` localmente pra validar que o app sobe sem crash.
- Verifique console pra warnings/erros relacionados ao Nível 6.
- NÃO gere APK EAS — Gui testa via Fast Refresh.

---

## Critérios de aceite

1. Nível 6 aparece no fluxo do jogo após conclusão do Nível 5.
2. Grade 1×6 linear renderiza corretamente, com avatar na coluna 0 e o estado de cada célula visualmente distinto (SC, CV, CP).
3. Paleta exibe 3 blocos: `move_right`, `if_canteiro_vazio_then_plantar` (roxo, "Se vazio, plantar"), `repeat_5` (laranja, "Repetir 5×").
4. Criança consegue adicionar o `if_canteiro_vazio_then_plantar` ao programa via tap simples (sem modo de edição).
5. Solução elegante de 3 blocos `[Repetir 5× [Direita, Se vazio, plantar]]` executa com sucesso.
6. Solução longa sem `repeat_5` (10 blocos: 5 iterações de `Direita + Se vazio, plantar`) também é aceita.
7. Durante execução, bloco condicional pulsa **verde** quando a condição é verdadeira (plantou) e **cinza claro** quando falsa (ignorou). Steps com `conditionResult` corretamente emitidos.
8. Após sucesso, tela de resumo exibe texto especificado (literal, sem alterações).
9. Após sucesso, Mundo permanente é atualizado com TODAS as operações:
   - 2 pássaros adicionados (1 espelhado)
   - 3 plantinhas estágio 3 do Nível 5 substituídas por 3 mini-árvores
   - 3 flores amarelas adicionadas
10. Níveis 1-5 continuam funcionando exatamente como antes (princípio de não-retroatividade preservado).
11. Estado do Mundo persiste após fechar e reabrir o app.

---

## O que NÃO fazer

1. **Não inventar mecânicas não especificadas.** Sem if/else (entra no Nível 7), sem variável (Nível 8), sem função (Nível 9).
2. **Não permitir N variável no `repeat_5`.** N é hardcoded em 5. Loop com N variável entra em outro nível futuro.
3. **Não fazer o `if_canteiro_vazio_then_plantar` ter slot interno.** É bloco sólido único.
4. **Não permitir aninhamento profundo.** `if_canteiro_vazio_then_plantar` dentro de `repeat_5` é OK (esse é a solução). Mas NÃO permitir `repeat_5` dentro de `if_canteiro_vazio_then_plantar` (esse bloco não tem filhos).
5. **Não refatorar Níveis 1-5.** Princípio de não-retroatividade. Se a estrutura atual obriga refator, PARE e pergunte.
6. **Não alterar o texto de conclusão do nível.** Calibrado com princípio "ferramentas antecipadas".
7. **Não criar assets do Nível 7+** (árvore frutífera, esquilo). Briefings futuros.
8. **Não calibrar pixel perfect** as posições no Mundo. Gui faz depois.
9. **Não introduzir blocos de movimento extra na paleta.** Só `move_right`. Não `move_left`, `move_up`, `move_down`.
10. **Não permitir `plant` solto na paleta.** A única forma de plantar é via `if_canteiro_vazio_then_plantar`. Esse é o ponto pedagógico.
11. **Não tomar decisões de produto sozinho.** Em dúvida, pergunte.
12. **Não pular a documentação textual** (regra 11 do Protocolo).
13. **Não fazer commits gigantes.** Quebre em commits lógicos.

---

## Documentação esperada

Após implementação, atualizar os seguintes `.md`:

1. **`docs/LEVELS.md`** — adicionar entrada completa do Nível 6: descrição, layout, blocos, solução, recompensas, texto de conclusão.

2. **`docs/INTERPRETER.md`** — documentar:
   - Novo tipo de bloco `if_canteiro_vazio_then_plantar` (categoria condicional, comportamento, conditionResult emitido).
   - Novo tipo de bloco `repeat_5` (idêntico ao `repeat_3` com N=5).
   - Novo campo opcional `conditionResult?: boolean` em `ExecutionStep`.

3. **`docs/ARCHITECTURE.md`** — se houver decisão arquitetural nova (ex: como categorias de blocos são representadas se foi necessário introduzir "condicional" como categoria nova).

4. **`docs/DECISIONS.md`** — adicionar entrada cronológica:

```
[YYYY-MM-DD] Decisão técnica: Nível 6 introduz condicional simples como bloco "tudo em um".

O bloco if_canteiro_vazio_then_plantar é bloco sólido único — sem slot
interno, sem modo de edição. Comportamento embutido: se célula tem
canteiro vazio, planta; senão, ignora.

Decisão pedagógica: Nível 6 é primeira introdução ao conceito de
condicional. Mantém mecânica simples pra criança aprender O QUE É
condicional primeiro. No Nível 7 (if/else), conceito amadurece com
2 ações possíveis.

ExecutionStep ganha campo opcional conditionResult: boolean. Aditivo,
não-retroativo (Níveis 1-5 não declaram, comportamento preservado).
ProgramArea usa o campo pra pulsar bloco verde (verdadeiro) ou cinza
claro (falso) durante execução.

Cenário 1×6 linear. Distribuição calibrada [Avatar][SC][CV][CP][CV][CV]
— os 3 estados aparecem nas 3 primeiras células, dando familiaridade
incremental sem virar sequência decorada.

Recompensas no Mundo: 2 pássaros (mesmo asset, 1 espelhado) +
substituição das 3 plantinhas estágio 3 do Nível 5 por 3 mini-árvores
(continuidade da história das sementes do Nível 4) + 3 flores amarelas
decorativas novas.

Princípio "ferramentas antecipadas" aplicado: texto de conclusão
menciona explicitamente que condicional vai ser útil mais pra frente
(preparação narrativa pro Nível 10 onde discernimento será vital pra
plantar no árido).
```

---

## Relatório de Execução (obrigatório ao final)

Gere ao final do trabalho, mesmo formato que foi usado nos Níveis 4 e 5:

```
Relatório de Execução: Claude Code → Claude (Estrategista)
Projeto: Norte Code
Demanda executada: Implementação do Nível 6 — condicional simples (if_canteiro_vazio_then_plantar)

O que foi implementado:
[Descrição feature por feature]

Decisões técnicas tomadas (fora do briefing):
[Decisões tomadas sozinho com justificativa. Especialmente:
 como você representou estados de célula (CV, CP, SC); como tratou
 o transform.mirrored dos pássaros se o schema não suportava;
 qualquer reuso ou padronização de cor/estilo do bloco condicional.]

Arquivos alterados:
- [lista]

Commits feitos (no main):
- [SHA] [mensagem]
...

Critérios de aceite — Status:
1. [x/?] [comentário]
...
11. [x/?] [comentário]

Validações técnicas executadas:
[TypeScript check, dimensões de assets, validações pontuais]

Documentação atualizada:
- LEVELS.md
- INTERPRETER.md
- ARCHITECTURE.md (se aplicável)
- DECISIONS.md

Pontos de atenção para validação do Gui:
[Áreas pra teste especial, edge cases, tradeoffs]
```

---

## Resumo curto

- Você é Dev Temporário (Cenário A — local + git). Substitui o Manus.
- Tarefa: implementar Nível 6 (condicional simples) + 2 blocos novos + feedback visual de condição.
- Grade 1×6 linear, distribuição `[Avatar][SC][CV][CP][CV][CV]`. Estados visíveis antes da execução.
- Paleta de 3 blocos: `move_right`, `if_canteiro_vazio_then_plantar` (roxo `#A88FD9`), `repeat_5` (laranja).
- Solução elegante: 3 blocos. Solução longa aceita: 10 blocos. `maxBlocks: 12`.
- Bloco condicional é "tudo em um" (não envelope). Adição via tap simples.
- Durante execução, bloco pulsa verde (verdadeiro) ou cinza (falso). Via `conditionResult?: boolean` em `ExecutionStep`.
- Recompensas: 2 pássaros (1 espelhado) + 3 plantinhas viram 3 mini-árvores + 3 flores amarelas.
- Texto de conclusão é fixo.
- Commit direto no `main`. Conventional Commits. Quebre em commits lógicos.
- Documentação obrigatória nos 4 `.md`.
- Em dúvida: PARE e pergunta. Não chute.
