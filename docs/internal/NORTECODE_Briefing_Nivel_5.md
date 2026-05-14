# Briefing de Execução — Nível 5 (Passo 4 do Protocolo)

**Projeto:** Norte Code
**De:** Claude (Estrategista)
**Para:** Claude Code (Dev Temporário — Cenário A do Protocolo)
**Via:** Gui
**Data:** Maio/2026

---

## Antes de começar — Leitura obrigatória

Você está atuando como Dev Temporário do Norte Code. Antes de qualquer linha de código:

1. **Leia o `docs/internal/NORTECODE_Protocolo_Dev_Temporario.md`** — define seu papel e o cenário operacional (você é Cenário A: tem acesso ao filesystem local e git CLI).
2. **Leia o `docs/internal/NORTECODE_Protocolo_Colaboracao_IAs.md`** — define o fluxo geral e as regras de não-retroatividade.
3. **Leia o `docs/internal/NORTECODE_Briefing_MVP.md` (atualmente v2.7)** — visão completa do produto. Em especial: Seção 10 (Estado Atual de Implementação), e Nível 5 dentro da Seção 4.7 (roadmap dos níveis).
4. **Leia o `docs/internal/NORTECODE_Style_Guide_Visual.md`** — relevante pra ícone do bloco `[Repetir 3×]` e pra entender estágios visuais.
5. **Inspecione o código existente antes de gerar nada** — especialmente `lib/levels/index.ts` (ver como o Nível 4 ficou registrado), `lib/interpreter/blocks.ts` (registro de tipos de bloco), `lib/interpreter/interpreter.ts` (lógica de execução), `lib/interpreter/world-state.ts`, `components/level/BlockPalette.tsx` e `app/world.tsx` (WORLD_LAYOUT atual e cadeia de substituição).

Se algo neste briefing conflitar com o que existe no código, **PARE e pergunte ao Gui antes de prosseguir**. Não chute.

---

## Estratégia de execução (Cenário A — você roda local)

- Você tem acesso ao filesystem do projeto e ao git CLI no Windows do Gui.
- Repositório: `https://github.com/nortecodeadm/norte-code`.
- **Estratégia de commits: direto no `main`.** Sem branch separada, sem PR. Quebre em commits lógicos.
- Antes de começar: `git pull origin main` pra pegar mudanças recentes.
- Conventional Commits sempre.
- Não commitar `.env` ou credenciais.
- Pode rodar `npx expo start` localmente pra validar que o app sobe sem crash. Não gere APK EAS — Gui valida via Fast Refresh (dev build já instalado no celular).

---

## Demanda

Implementar o **Nível 5** do MVP do Norte Code: introduzir o **bloco de loop fixo `[Repetir 3×]`** à mecânica do jogo, no MESMO cenário do Nível 4 (mesma grade, mesmas pedras, mesmos canteiros). Esta é a entrega que fecha o par pedagógico Nível 4 ↔ Nível 5: a criança refaz o que fez antes, mas agora com a ferramenta certa.

---

## Decisão tomada (contexto e razões)

### O par pedagógico Nível 4 ↔ Nível 5 (fechamento)

O Nível 4 entregou a criança "cansada" de fazer 12 blocos manualmente (3 grupos simétricos de "3 movimentos + 1 plant"). O Nível 5 é o **alívio**:

- **Mesmo cenário** (grade 4×4 com 6 pedras forçando o caminho do "U" em sentido horário).
- **Mesmo trajeto** (direita 3×, descer 3×, esquerda 3×).
- **Ação diferente:** em vez de plantar, a criança **rega** as 3 sementes que ela própria plantou no Nível 4.
- **Novo bloco disponível:** `[Repetir 3×]`, que recebe outros blocos dentro e executa N vezes.
- **Solução-alvo:** 9 blocos em vez de 12 (redução de 25%).

A criança SENTE o alívio porque acabou de fazer manualmente o mesmo trabalho. Princípio: necessidade antes da ferramenta.

### Por que o bloco é fixo em N=3

Decisão pedagógica: o conceito de "loop fixo" precisa entrar limpo, sem complexidade de escolher quantidade. N=3 está hardcoded no bloco. Loop com N variável é o salto pedagógico do Nível 7 ou 8 (a definir).

### Por que o cenário é literalmente o mesmo

Reuso narrativo e técnico:
- **Narrativo:** a criança reconhece "ah, é o mesmo lugar, mas agora vou regar". Causa-e-efeito direto entre níveis.
- **Técnico:** reaproveita configuração de grade, obstáculos, validação. Foco do nível é o BLOCO novo, não cenário novo.

### Por que regar (e não plantar)

Continuação narrativa: o Nível 4 deixou 3 sementes plantadas. A próxima ação lógica de cuidado é regar. Isso fortalece o ciclo de mordomia (plantou → rega → cresce).

### Princípio narrativo: o Mundo permanente entra em maturidade visual

O Nível 5 é o **primeiro grande salto visual do Mundo permanente** do MVP. Não é só "mais um elemento adicionado" — é **mudança do background do Mundo inteiro**.

Detalhes:
- O background atual (jardim inicial) é **substituído** por uma versão v2 (mesma cena, mas com graminha esparsa pelo solo, florestinha em silhueta no horizonte). Mesma lógica de substituição já usada pra plantas (`grown_sprout_lvl3` substituiu `sprout_lvl2`, e por aí vai).
- Uma flor brota do tronco caído (asset novo sobreposto ao log existente). Símbolo: vida vence até o que parecia morto.

### Princípio pedagógico: ferramenta antecipada

O texto de conclusão deste nível PRECISA plantar a semente de que o loop vai ser útil de novo lá na frente. Não enrolação narrativa — é princípio de design pedagógico (registrado em DECISIONS.md). Cada conceito aprendido nos Níveis 5-8 antecipa sua utilidade no Nível 10.

### Princípio de não-retroatividade

Este nível ADICIONA estruturas, não refatora as anteriores. O bloco `[Repetir 3×]` é tipo de bloco NOVO no interpretador. Níveis 1-4 não dependem dele e continuam funcionando intactos.

---

## Especificação completa do Nível 5

### Estrutura do mundo do nível (idêntica ao Nível 4)

- **Tipo:** grade 2D (`grid.cells[row][col]`)
- **Dimensões:** 4 linhas × 4 colunas
- **Posição inicial do avatar:** (linha 0, coluna 0)
- **Layout:** literalmente o mesmo do Nível 4 (ver tabela abaixo)

### Posições exatas

| Elemento | Linha | Coluna |
|---|---|---|
| Avatar (inicial) | 0 | 0 |
| Canteiro C1 (com semente plantada do Nível 4) | 0 | 3 |
| Canteiro C2 (com semente plantada do Nível 4) | 3 | 3 |
| Canteiro C3 (com semente plantada do Nível 4) | 3 | 0 |
| Pedra 1 | 1 | 0 |
| Pedra 2 | 2 | 0 |
| Pedra 3 | 1 | 1 |
| Pedra 4 | 1 | 2 |
| Pedra 5 | 2 | 1 |
| Pedra 6 | 2 | 2 |

**Diferença visual em relação ao Nível 4:** os 3 canteiros aparecem JÁ COM SEMENTES (estágio 1) plantadas. O asset usado pro canteiro plantado pode ser o mesmo já presente no Nível 4 quando a criança planta com sucesso. Inspecionar como o Nível 4 mostra o canteiro "plantado" e reusar.

### Paleta de blocos disponíveis

6 blocos:

| ID do bloco | Label visível (PT-BR) | Categoria |
|---|---|---|
| `move_right` | Direita | Movimento |
| `move_left` | Esquerda | Movimento |
| `move_up` | Subir | Movimento |
| `move_down` | Descer | Movimento |
| `water` | Regar | Ação (NOVO neste nível, se não existir já) |
| `repeat_3` | Repetir 3× | Estrutura de controle (NOVO neste nível) |

**Importante:**
- `move_up` permanece na paleta como trap pedagógico (consistência com Nível 4).
- `plant` NÃO entra (não é o objetivo neste nível).
- `water` (`Regar`) — verificar se já existe no projeto. Provavelmente foi introduzido no Nível 2 (que tinha sequência [Andar][Andar][Plantar][Andar][Regar]). Se já existe, reusa. Se não, registra como bloco novo.
- `repeat_3` é o bloco efetivamente NOVO em termos de mecânica. Estrutura de controle, não ação. Recebe outros blocos "dentro" e os executa 3 vezes.

### Referencial direcional

Mantém referencial absoluto do ponto de vista do usuário (igual aos Níveis 3 e 4). NÃO inverter. NÃO introduzir rotação.

### Mecânica do bloco `[Repetir 3×]`

Este é o ponto de maior novidade técnica do nível.

**Comportamento:**
- O bloco `repeat_3` aceita **outros blocos dentro dele** (slot único de "corpo" do loop).
- No corpo cabem qualquer número de blocos (movimento ou ação), conforme o `maxBlocks` permitir.
- Ao executar, o interpretador executa o conteúdo do corpo do loop 3 vezes em sequência.
- Se durante a execução algum bloco do corpo falhar (ex: bate em pedra), o loop INTEIRO para (não tenta a próxima iteração). Mensagem de erro contextual normal.

**UX sugerida (consultar como o Scratch Jr. faz e seguir padrão similar):**
- O bloco `repeat_3` aparece na paleta como um bloco "envelope" — visualmente mostra que tem espaço dentro pra encaixar outros blocos.
- Quando a criança arrasta `repeat_3` pra área de programação, ele aparece com um slot vazio visualmente sinalizado.
- A criança arrasta blocos pra dentro do slot. Esses blocos ficam visualmente "agrupados" dentro do envelope do `repeat_3`.
- Indicador visual "× 3" do lado.

**Atenção arquitetural:** este é o primeiro bloco do projeto que pode conter OUTROS blocos. Isso pode exigir mudança na estrutura de dados do programa. Hoje, programa = array linear de blocos. Agora, programa = array onde alguns elementos podem ter "filhos". Sugestão: cada bloco tem campo opcional `children: Block[]`. Para blocos comuns, `children` é undefined ou vazio. Para `repeat_3`, é um array de Blocks que serão executados N vezes.

Se a estrutura de dados atual NÃO suportar isso, **PARE e pergunte ao Gui antes de refatorar**. Esta é uma mudança arquitetural com impacto potencial em níveis futuros (todos os loops e condicionais).

### Solução-alvo (9 blocos)

```
[Repetir 3× [move_right]] [water]   → rega C1 em (0, 3)
[Repetir 3× [move_down]]  [water]   → rega C2 em (3, 3)
[Repetir 3× [move_left]]  [water]   → rega C3 em (3, 0)
```

Total: **9 blocos** (contando o `repeat_3` como 1 bloco e o `move_right`/`move_down`/`move_left` dentro dele como 1 bloco cada).

Redução de 25% em relação aos 12 blocos do Nível 4. A criança PERCEBE essa economia.

### Solução longa aceita

Mesmo padrão do Nível 4 (versão sem loop, com 12 blocos), trocando `plant` por `water`:

```
[move_right][move_right][move_right][water]
[move_down][move_down][move_down][water]
[move_left][move_left][move_left][water]
```

Qualquer programa que termine com os 3 canteiros REGADOS é aceito.

### `maxBlocks`

Sugestão: `maxBlocks: 14` (margem de 5 sobre a solução-alvo de 9; menor que os 16 do Nível 4 porque agora há o bloco repeat que comprime, mas ainda permite exploração).

Inspecionar como o Nível 4 implementou `maxBlocks` e seguir o mesmo padrão. Se houver diferença lógica entre "contar repeat como 1 bloco" e "contar repeat + filhos", **PARE e pergunte ao Gui** qual contagem usar. Decisão é importante porque afeta o "alívio" pedagógico que a criança sente.

### Validação de sucesso

`successCondition`: os 3 canteiros (C1, C2, C3) precisam estar REGADOS ao final da execução. Estado intermediário (plantado, sem rega) não conta como sucesso.

(Provavelmente o estado da célula vai de "plantado" → "regado". Verificar como o Nível 2 faz isso e seguir o mesmo padrão.)

### Mensagens de erro contextuais

Mesmas do Nível 4, com adaptação pra "regar":

| Situação | Mensagem |
|---|---|
| Avatar bate em pedra | "Hmm, tem uma pedra aí. Tenta outro caminho." |
| Avatar tenta sair da grade | "Esse lado não dá. O caminho continua em outra direção." |
| Avatar tenta regar célula sem canteiro | "Aqui não tem nada pra regar. Procura o lugar certo." |
| Avatar tenta regar canteiro vazio (sem semente) | "Esse canteiro está vazio. Não tem o que regar." (Edge case — em teoria não acontece no Nível 5, mas vale prevenir.) |

(Pendência aberta do Backlog: mensagem "Você já fez isso aqui!" quando criança rega canteiro já regado. Não implementar agora — está no BACKLOG.md item 1.)

### Texto de conclusão do nível

Após sucesso, exibir na tela de resumo do nível:

> "Olha que esperto! Em vez de mandar o mesmo movimento três vezes, você usou o bloco de **repetir**. Programar bem é fazer mais com menos. Lembra disso — vai ser útil mais pra frente."

Esse texto NÃO é negociável. A última frase ("vai ser útil mais pra frente") é o princípio de "ferramenta antecipada" registrado em DECISIONS.md — planta a semente de que o loop vai voltar no Nível 10.

### Recompensas no Mundo permanente

Após sucesso no Nível 5, atualizar o Mundo permanente (`world_state`) com **MÚLTIPLAS operações**:

**Operação 1 — Substituir o background:**
- Remover/ocultar `background_v1` (ou nome equivalente do atual).
- Adicionar `background_mundo_v2.png` (asset NOVO). Mesma cena geral, mas com graminha esparsa no solo e silhuetas de florestinha no horizonte.

**Operação 2 — Substituir as 3 sementes do Nível 4 por plantinhas estágio 3:**
- Remover `seed_lvl4_a`, `seed_lvl4_b`, `seed_lvl4_c`.
- Adicionar `plant_stage3_lvl5_a`, `plant_stage3_lvl5_b`, `plant_stage3_lvl5_c` nas mesmas posições. **Pulam estágio 2** (broto) — vão direto de semente pra plantinha desenvolvida. Sinal de que regar acelerou o crescimento.

**Operação 3 — Adicionar 2 flores decorativas:**
- `flower_lvl5_a`, `flower_lvl5_b` (reusar asset `flower_decorative` do Nível 3, em posições livres).
- Total de flores no Mundo passa de 2 para 4.

**Operação 4 — Adicionar flor no tronco:**
- `flower_no_tronco` (asset NOVO). Sobreposto visualmente ao tronco caído existente.

**Assets NOVOS necessários:**
- `background_mundo_v2.png` — Gui está providenciando. Use placeholder visual se ainda não estiver disponível e sinalize no Relatório.
- `plantinha_estagio3.png` — Gui está providenciando. Idem.
- `flor_no_tronco.png` — Gui está providenciando. Idem.

**Assets reusados:**
- Flor decorativa (já existe desde Nível 3).
- Tronco caído (já existe).

**Posicionamento inicial:** placeholder. Gui calibra depois (princípio já estabelecido).

---

## Escopo de execução

### Frontend (React Native / Expo)

**Arquivos a modificar/criar (inspecionar como o Nível 4 foi feito e seguir o mesmo padrão):**

1. **`lib/levels/index.ts`** — adicionar `createLevel5()` ou equivalente. Reusar estrutura `grid` do Nível 4 (literalmente — mesma grade). Diferenças:
   - `availableBlocks` inclui `repeat_3` e `water`, NÃO inclui `plant`
   - `plantableCells` viram `wateringCells` (ou estrutura equivalente que represente "canteiros plantados aguardando rega")
   - `successCondition` checa rega, não plantio
   - `rewards` tem as 4 operações descritas acima
   - `errorMessages` adapta texto pra "regar"
   - `successText` é o exato especificado acima
   - `maxBlocks: 14` (sugestão — ajustar se a contagem de blocos for diferente devido ao repeat)

2. **`lib/interpreter/blocks.ts`** — registrar `repeat_3` como tipo novo de bloco. Estrutura sugerida (ajustar pra schema real):
   ```typescript
   {
     id: "repeat_3",
     type: "control",
     iterations: 3,
     canHaveChildren: true,
     label: "Repetir 3×"
   }
   ```

3. **`lib/interpreter/interpreter.ts`** — adicionar lógica de execução pra bloco com filhos:
   - Ao encontrar bloco `repeat_3`, executar `children` 3 vezes em sequência.
   - Se algum filho falhar no meio (ex: bate em pedra), interromper toda a execução do loop e do programa, retornar erro contextual.
   - Steps gerados pela execução do loop devem ser numerados continuamente (não resetar contador a cada iteração — facilita debug).

4. **`lib/interpreter/world-state.ts`** — confirmar que o tipo `ExecutionStep` suporta a sequência de ações do loop. Provavelmente não precisa mudar nada (cada iteração do loop gera steps normais).

5. **`components/level/BlockPalette.tsx`** ou equivalente — adicionar `repeat_3` à paleta. UX visual:
   - Bloco "envelope" com slot interno visível.
   - Label "Repetir 3×" e/ou indicador visual de "× 3".
   - Cor: a definir (não é movimento nem ação — pode ser uma 3ª categoria, ex: laranja-terra `#D4A744` da paleta ou outra cor consistente com Style Guide). **Se houver dúvida sobre cor, perguntar ao Gui.**

6. **Componente que renderiza o programa montado** — precisa suportar exibição de blocos aninhados (bloco `repeat_3` mostra os filhos visualmente DENTRO dele). Provavelmente recursivo. Inspecionar componente atual e estender.

7. **Lógica de drag-and-drop** — precisa permitir arrastar blocos PARA DENTRO do `repeat_3`. Esta é a maior mudança técnica do nível. Possíveis abordagens:
   - Drop zone interna no `repeat_3` que aceita filhos.
   - Atualização do estado do programa pra suportar árvore (não só lista linear).
   
   Se a complexidade for grande, vale **propor uma versão simplificada pro Gui** antes de implementar (ex: criança seleciona o `repeat_3` e os próximos N blocos arrastados vão automaticamente pra dentro dele, até a criança "fechar" o loop). Não é o ideal mas é mais fácil. **Discutir com Gui antes de optar pelo simplificado.**

8. **`app/world.tsx`** — atualizar `WORLD_LAYOUT` com as 4 operações de recompensa descritas acima. Background é substituído, as 3 sementes viram plantinhas estágio 3, +2 flores, +1 flor no tronco.

### Backend (Supabase)

Sem mudanças de schema previstas. A estrutura de programa do nível pode crescer pra suportar blocos aninhados — verificar se `programs.steps` ou estrutura equivalente persiste isso corretamente. Se houver risco, perguntar.

### Assets

**Assets NOVOS (Gui está providenciando — usar placeholder se necessário):**
- `background_mundo_v2.png`
- `plantinha_estagio3.png`
- `flor_no_tronco.png`
- Ícone do bloco `repeat_3` (visual de bloco-envelope com "× 3")

**Assets reusados:**
- Asset de canteiro plantado (do Nível 4)
- Asset de regador / ação de regar (do Nível 2)
- Flor decorativa (do Nível 3)
- Pedra (do Nível 3)
- Tronco caído (do Mundo permanente desde início)

### Build/Validação local

- Após implementar, rode `npx expo start` localmente pra validar que o app sobe sem crash.
- Verifique no console se há warnings/erros relacionados ao Nível 5 ou ao novo sistema de blocos aninhados.
- NÃO gere APK EAS — Gui testa via Fast Refresh.

---

## Critérios de aceite

1. Nível 5 aparece no fluxo do jogo após conclusão do Nível 4.
2. Grade 4×4 renderiza idêntica ao Nível 4, mas com 3 canteiros já plantados (com sementes visíveis).
3. Paleta exibe 6 blocos: `move_right`, `move_left`, `move_up`, `move_down`, `water`, `repeat_3`. Ícone do `repeat_3` mostra que tem espaço pra blocos dentro.
4. Criança consegue arrastar blocos PARA DENTRO do `repeat_3`. Programa renderiza com aninhamento visível.
5. Solução de 9 blocos `[Rep3[→]][💧][Rep3[↓]][💧][Rep3[←]][💧]` executa com sucesso e termina o nível.
6. Solução longa (sem usar `repeat_3`, 12 blocos no padrão do Nível 4 mas regando) também é aceita.
7. Tentativas de erro contextual funcionam (igual ao Nível 4).
8. Após sucesso, tela de resumo exibe o texto especificado, incluindo a frase final "vai ser útil mais pra frente".
9. Após sucesso, Mundo permanente é atualizado com TODAS as 4 operações:
   - Background substituído (v1 → v2)
   - 3 sementes do Nível 4 viram 3 plantinhas estágio 3
   - +2 flores adicionadas
   - +1 flor no tronco
10. Níveis 1-4 continuam funcionando exatamente como antes (princípio de não-retroatividade).
11. Estado do Mundo persiste após fechar e reabrir o app.
12. Programa com blocos aninhados (`repeat_3` com filhos) é persistido e re-renderizado corretamente se o usuário sair e voltar.

---

## O que NÃO fazer

1. **Não inventar mecânicas não especificadas.** Sem condicional, sem variável, sem função — esses entram em níveis futuros.
2. **Não fazer o `repeat_3` ter N variável.** N é fixo em 3 neste nível. N variável é introdução pedagógica de outro nível.
3. **Não permitir aninhamento profundo** (`repeat_3` dentro de `repeat_3`). Neste nível, o `repeat_3` aceita só blocos simples como filhos. Aninhamento profundo entra em níveis mais avançados se houver necessidade.
4. **Não refatorar Níveis 1-4.** Princípio de não-retroatividade. Se mudanças na estrutura de programa pra suportar aninhamento exigirem ajuste em níveis antigos, PARE e pergunte ao Gui.
5. **Não alterar o texto de conclusão do nível.** Está calibrado com o princípio "ferramenta antecipada".
6. **Não criar assets do Nível 6 ou posteriores** (árvore jovem, pássaro, etc.). Briefings futuros.
7. **Não calibrar pixel perfect** as posições no Mundo. Gui faz depois.
8. **Não tomar decisões de produto sozinho.** Em dúvida, pergunte. NÃO chute.
9. **Não pular a documentação textual** (regra 11 do Protocolo). Ver seção "Documentação esperada" abaixo.
10. **Não fazer commits gigantes monolíticos.** Quebre em commits lógicos.

---

## Documentação esperada

Após implementação, atualizar os seguintes arquivos `.md`:

1. **`docs/LEVELS.md`** — adicionar entrada do Nível 5: descrição, layout da grade (texto), blocos disponíveis, solução-alvo, recompensas, texto de conclusão.

2. **`docs/INTERPRETER.md`** — documentar:
   - O bloco `repeat_3` (estrutura, comportamento, como filhos são executados).
   - Possível mudança na estrutura de dados de programa (de array linear pra árvore com filhos).
   - Como steps são gerados durante execução do loop.

3. **`docs/ARCHITECTURE.md`** — se a estrutura de programa mudou (de array linear pra árvore), DOCUMENTAR aqui. Esta é mudança estrutural com impacto em todos os níveis futuros que envolvem loop/condicional/função.

4. **`docs/DECISIONS.md`** — adicionar entrada cronológica:

```
[YYYY-MM-DD] Decisão técnica: Nível 5 introduz bloco de loop fixo (repeat_3) + mudança estrutural na representação de programas.

Mecânica: bloco repeat_3 com N hardcoded em 3, aceita blocos filhos no
slot interno, executa filhos 3 vezes em sequência. Se algum filho falha,
loop para imediatamente.

Mudança estrutural: programa deixa de ser array linear pra suportar
blocos com filhos (campo children: Block[] opcional). Compatibilidade
retroativa preservada — blocos sem children executam normalmente
(Níveis 1-4 não afetados).

Princípio pedagógico aplicado: "ferramenta antecipada". O texto de
conclusão menciona explicitamente que loop vai ser útil mais pra frente.
Este princípio governa todos os Níveis 5-8 e está registrado em
entrada estratégica anterior do DECISIONS.md.

Visual: Mundo permanente sofre primeira grande mudança visual do MVP.
Background v1 substituído por v2 (graminha + florestinha). 3 sementes
do Nível 4 viram plantinhas estágio 3. +2 flores. +1 flor no tronco
caído (símbolo: vida vence até o que parecia morto).
```

---

## Relatório de Execução (obrigatório ao final)

Gere ao final do trabalho, mesmo formato que foi usado no Nível 4:

```
Relatório de Execução: Claude Code → Claude (Estrategista)
Projeto: Norte Code
Demanda executada: Implementação do Nível 5 — bloco de loop fixo (repeat_3)

O que foi implementado:
[Descrição feature por feature]

Decisões técnicas tomadas (fora do briefing):
[Qualquer decisão tomada sozinho, com justificativa. Especialmente
importantes aqui: como você lidou com a mudança estrutural de
programa linear → árvore com filhos.]

Arquivos alterados:
- [lista]

Commits feitos (no main):
- [SHA] [mensagem]
- [SHA] [mensagem]
...

Critérios de aceite — Status:
1. [x/?] [comentário]
...
12. [x/?] [comentário]

Validações técnicas executadas:
[O que conseguiu validar sem o app no celular]

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

- Você é o Dev Temporário (Cenário A — local + git).
- Tarefa: implementar Nível 5 (bloco `[Repetir 3×]` + regar 3 sementes no mesmo cenário do Nível 4).
- Grade 4×4 IDÊNTICA ao Nível 4 (mesmas posições de avatar, pedras, canteiros). 3 canteiros aparecem JÁ plantados.
- Paleta tem 6 blocos: 4 movimentos + `water` + `repeat_3`. `move_up` continua como trap pedagógico.
- Solução-alvo: 9 blocos com 3 `repeat_3` (cada um com 1 movimento dentro). Reduz 25% em relação aos 12 do Nível 4.
- **Mudança técnica grande:** programa precisa suportar blocos com filhos (`repeat_3` aceita blocos dentro). Provavelmente exige refator de estrutura de dados — em dúvida, pergunte.
- Recompensa no Mundo: 4 operações (substituir background, substituir 3 sementes por plantinhas estágio 3, +2 flores, +1 flor no tronco). Esta é a primeira grande mudança visual do Mundo no MVP.
- Texto de conclusão é fixo. Frase final ("vai ser útil mais pra frente") é princípio pedagógico registrado.
- Commit direto no `main`. Conventional Commits. Quebre em commits lógicos.
- Documentação obrigatória em LEVELS, INTERPRETER, ARCHITECTURE (se aplicável), DECISIONS.
- Em qualquer dúvida: PARE e pergunte. Não chute.
