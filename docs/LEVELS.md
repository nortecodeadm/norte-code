# Níveis — Norte Code MVP

**Última atualização:** 14/05/2026
**Versão:** 1.5.0 (Nível 6: condicional simples via bloco "tudo em um" + 2 pássaros + mini-árvores + flores amarelas)

---

## Princípio

Cada nível ensina **uma única coisa**. Não acumular conceitos novos por nível.

## Layout Padrão de um Nível

- Cenário no topo (40% da tela): mundo do nível onde o personagem age
- Paleta de blocos no meio (15%): blocos arrastáveis disponíveis
- Área de montagem embaixo (35%): onde a criança encaixa os blocos
- Botão "▶ Executar" (10%): roda o programa montado

## Mapeamento Narrativo

| Níveis | Fase Narrativa | Descrição |
|--------|---------------|-----------|
| 1–5 | Fase 1 (Origem) | Primeiro jardim, ajudando "alguém" a criar |
| Transição | Fase 2 (Quebra) | Capítulo narrativo: serpente, jardim se fecha |
| 6–10 | Fase 3 (Reconstrução) | Novo terreno árido, reconstrução |

---

## Nível 1 — Sequência simples (2 passos) ✅ IMPLEMENTADO

- **Conceito:** sequência de ações em ordem
- **Cenário:** avatar anda até sementinha e planta
- **Blocos:** [Andar para frente] [Plantar]
- **Solução:** [Andar para frente] → [Plantar]
- **Recompensa visual:** sementinha aparece no chão do Mundo
- **Texto de resumo:** "Você fez seu primeiro programa! Cada passo na ordem certa. Isso se chama **sequência**."

**Implementação técnica:**
- Grid: 3×1, player em (0,0) facing east
- Célula (1,0) marcada como `flowerbed` (alvo visual com borda pontilhada verde)
- Condição de vitória: `plant_all_seeds` (nenhum flowerbed restante sem semente)
- Max blocos: 4
- Reward key: `seed_lvl1`
- Arquivo: `lib/levels/index.ts` → `createLevel1()`

**UX implementada:**
- Objetivo claro no topo: "🌱 Plante no canteiro marcado"
- Instrução: "Toque nos blocos para montar seu programa"
- Hint após 5s de inatividade: "Dica: toque em 'Andar' e depois em 'Plantar' — nessa ordem!"
- Feedback de erro contextual (não plantou, plantou no lugar errado, não andou)
- Animação de sucesso: 1.2s delay → navega pro Level Summary

**Comportamento de recompensa pós-nível:**
- Level Summary salva `seed_lvl1` em `WORLD_ELEMENTS` (AsyncStorage)
- Ao voltar pra Tela Mundo, se `seed_lvl1` está em `WORLD_ELEMENTS`, renderiza `mundo_sementinha.png` na posição definida em `WORLD_LAYOUT`
- Persistência: local (AsyncStorage) + remoto (Supabase `world_elements` quando online)

## Nível 2 — Sequência mais longa (5 passos) ✅ IMPLEMENTADO

- **Conceito:** sequência (reforço do Nível 1, com mais passos)
- **Cenário:** avatar anda até canteiro, planta, anda mais um passo, rega
- **Blocos:** [Andar para frente] [Plantar] [Regar]
- **Solução:** [Andar] [Andar] [Plantar] [Andar] [Andar] [Regar]
- **Recompensa visual:** broto verde **substitui** a sementinha do Nível 1
- **Texto:** "Sequências mais longas funcionam igual. Um passo de cada vez, na ordem certa."

**Implementação técnica:**
- Grid: 5×1, player em (0,0) facing east
- Célula (2,0) marcada como `flowerbed` (canteiro — borda pontilhada laranja)
- Célula (4,0) marcada como `watering_spot` (destino regar — borda pontilhada azul)
- Condição de vitória: `custom` (célula 2 = `seed` E célula 4 = `watered`)
- Max blocos: 6
- Reward key: `sprout_lvl2` (replaces: `seed_lvl1`)
- Arquivo: `lib/levels/index.ts` → `createLevel2()`

**Mecânica nova — Regar:**
- Bloco `water` já existia no interpretador (transforma seed→sprout, sprout→flower)
- Adicionado: `watering_spot` → `watered` quando o avatar executa `water` nessa célula
- Animação: mesma cadeia de 600ms/step do Nível 1, célula muda de cor ao ser regada

**Sistema de substituição de recompensas:**
- Ambos `seed_lvl1` e `sprout_lvl2` ficam em `WORLD_ELEMENTS` (histórico)
- Renderização decide: se `sprout_lvl2` existe, mostra broto; senão, mostra sementinha
- Asset: `assets/mundo/mundo_broto.png` (610×625, RGBA)

**Mensagens de erro contextuais:**
- Sem plantar: "Você esqueceu de plantar! Use o bloco 'Plantar' no canteiro marcado."
- Sem regar: "Você plantou, mas a sementinha precisa de água! Use o bloco 'Regar' no final."
- Caminho errado: "Acho que o caminho não está certo. Olha onde está o canteiro e onde precisa regar."
- Plantou no lugar errado: "A sementinha precisa ser plantada no canteiro marcado."

## Nível 3 — Desviando do caminho (Grade 2D) ✅ IMPLEMENTADO

- **Conceito:** movimentos direcionais absolutos + obstáculo
- **Cenário:** avatar desvia de pedra usando movimentos absolutos (descer, direita, subir)
- **Blocos:** [Descer ↓] [Direita →] [Subir ↑] [Plantar 🌱]
- **Solução:** [Descer] [Direita] [Direita] [Subir] [Plantar]
- **Recompensa visual:** broto cresce (substitui broto) + flor ao lado da pedra no Mundo
- **Texto:** "Bom! Às vezes o caminho não é reto. Programar é dar direção certa."

**Implementação técnica:**
- Grid: 3×2, player em (0,0)
- Célula (1,0) marcada como `rock` (obstáculo — fundo marrom, ícone 🪨)
- Célula (2,0) marcada como `flowerbed` (canteiro — borda pontilhada verde)
- Condição de vitória: `custom` (célula (2,0) = `seed`)
- Max blocos: 8
- Reward: multi-element (`grown_sprout_lvl3` replaces `sprout_lvl2` + `flower_lvl3`)
- Arquivo: `lib/levels/index.ts` → `createLevel3()`

**Mecânica nova — Movimentos absolutos:**
- `move_right` (→): move +1 no eixo X (leste)
- `move_down` (↓): move +1 no eixo Y (sul)
- `move_up` (↑): move -1 no eixo Y (norte)
- Coexistem com `move_forward` dos Níveis 1-2 (que usa direção relativa do player)
- `move_left` (←): implementado no interpretador, reservado para níveis futuros

**Mecânica nova — Obstáculo (pedra):**
- `rock` em CellContent: bloqueia movimento (retorna `fail_move`)
- Visual: fundo marrom (#BCAAA4) com ícone 🪨
- Legenda dinâmica: "Pedra" aparece na legenda quando grid contém rock

**Sistema de recompensas múltiplas:**
- `reward.elements[]` com operações `add` e `replaces`
- `grown_sprout_lvl3` substitui `sprout_lvl2` visualmente no Mundo
- `flower_lvl3` é adicionado como novo elemento (ao lado da pedra)
- Cadeia de substituição: grown_sprout > sprout > seed (só o mais evoluído aparece)
- Assets: `mundo_broto_crescido.png` (534×774) e `mundo_flor.png` (272×732)

**Mensagens de erro contextuais:**
- Bloqueado por pedra: "Cuidado! Tem uma pedra no caminho. Você precisa desviar."
- Não chegou no canteiro: "O canteiro está lá, mas você não chegou nele."
- Esqueceu de plantar: "Você chegou no canteiro mas esqueceu de plantar!"
- Fora do grid: "Espera! Você está tentando ir pra fora do mundo."

## Nível 4 — Plantar três sementes (sequência longa em U + move_left) ✅ IMPLEMENTADO

- **Conceito:** sequência longa com padrão repetitivo claro + introdução do bloco `move_left`. Prepara pedagogicamente o `repeat` que entra no Nível 5.
- **Cenário:** grade 4×4 com 6 pedras formando um bloco central que força caminho em "U" no sentido horário. Três canteiros nos cantos (topo-direita, base-direita, base-esquerda).
- **Blocos:** [Direita →] [Esquerda ←] [Subir ↑] [Descer ↓] [Plantar 🌱]
- **Solução-alvo (12 blocos):** `[→][→][→][🌱][↓][↓][↓][🌱][←][←][←][🌱]`
- **Recompensa visual:** mini-árvore substitui broto crescido (Nível 3), 3 sementes adicionadas perto uma da outra, 1 flor decorativa nova.
- **Texto de resumo:** "Você reparou que fez quase a mesma coisa três vezes? Andar pra um lado e plantar. Andar pra outro lado e plantar. Andar pra outro lado e plantar. Programar é assim mesmo — às vezes a gente repete. No próximo nível você vai descobrir um jeito mais esperto de fazer isso."

**Implementação técnica:**
- Grid: 4×4, player em (0,0)
- 6 rochas: (0,1), (0,2), (1,1), (1,2), (2,1), (2,2) — formato xy onde grid[y][x]: `grid[1][0]`, `grid[2][0]`, `grid[1][1]`, `grid[1][2]`, `grid[2][1]`, `grid[2][2]`
- 3 canteiros (flowerbed): grid[0][3] (C1), grid[3][3] (C2), grid[3][0] (C3)
- Condição de vitória: `custom` (C1, C2 e C3 todos com content === "seed")
- Max blocos: 16 (margem sobre a solução-alvo de 12)
- Reward: multi-element
  - `mini_tree_lvl4` replaces `grown_sprout_lvl3` (substituição visual da planta principal)
  - `seed_lvl4_a`, `seed_lvl4_b`, `seed_lvl4_c` (3 sementes novas)
  - `flower_lvl4` (flor decorativa adicional)
- Arquivo: `lib/levels/index.ts` → `createLevel4()`

**Layout da grade:**
```
Coluna:     0       1       2       3
Linha 0:  [AVATAR] [   ]   [   ]   [C1 ]
Linha 1:  [PEDRA]  [PEDRA] [PEDRA] [   ]
Linha 2:  [PEDRA]  [PEDRA] [PEDRA] [   ]
Linha 3:  [C3   ]  [   ]   [   ]   [C2 ]
```

**Decisão pedagógica — paleta com move_up "trap":**
A paleta inclui `move_up` mesmo sem ser necessário na solução. A criança que tenta usar `move_up` no início sai da grade e recebe mensagem contextual. Aprendizagem: nem todo bloco disponível serve pra toda situação. A paleta NÃO revela a solução.

**Decisão estrutural — 6 pedras forçam caminho único:**
Sem as 2 pedras adicionais na coluna 0 (`grid[1][0]` e `grid[2][0]`), a criança poderia começar descendo e o nível teria duas soluções de 12 blocos (horário e anti-horário). Forçar caminho único garante que o Nível 5 transforme exatamente uma sequência em `[Repetir 3x [→]] [plant] [Repetir 3x [↓]] [plant] [Repetir 3x [←]] [plant]`.

**Mecânica nova — `move_left`:**
O bloco `move_left` (coluna -1, absoluto) já estava implementado no interpretador desde o Nível 3, mas só agora aparece em uma paleta. Comportamento idêntico aos outros movimentos absolutos: bounds check + obstacle check, gera step `fail_move` quando inválido. Ver `INTERPRETER.md`.

**Mecânica nova — `failReason` em `ExecutionStep`:**
`ExecutionStep` ganhou o campo opcional `failReason?: "rock" | "out_of_grid"`, preenchido pelo interpretador quando o action é `fail_move`. A camada de UI (`getContextualError` em `app/level/[id].tsx`) usa isso pra escolher entre as mensagens `blocked_by_rock` e `out_of_grid` configuradas no nível. Níveis 1-3 não declaram `out_of_grid` — caem no fallback existente, sem regressão.

**Mensagens de erro contextuais (configuradas no nível):**
- Bate em pedra: "Hmm, tem uma pedra aí. Tenta outro caminho."
- Sai da grade: "Esse lado não dá. O caminho continua em outra direção."
- Planta em célula sem canteiro / não chegou em todos: "Aqui não tem canteiro. Procura o lugar certo pra plantar."
- Esqueceu de plantar: "Você esqueceu de plantar em algum canteiro. Cada parada precisa de um \"Plantar\"."
- Genérico: "Quase! Olha onde estão os canteiros e tenta outro caminho."

**Recompensas no Mundo permanente:**
- Mini-árvore (asset `mundo_mini_arvore.png`, 784×1176) é renderizada em posição própria mais ao fundo da cena, substituindo visualmente o broto crescido do Nível 3 (cadeia de substituição: `mini_tree_lvl4 > grown_sprout_lvl3 > sprout_lvl2 > seed_lvl1`).
- 3 sementes (`seed_lvl4_a/b/c`) reusam o asset `mundo_sementinha.png` em 3 posições placeholder lado a lado na frente da cena.
- 1 flor decorativa (`flower_lvl4`) reusa o asset `mundo_flor.png` em posição livre.
- Posições são placeholder — Gui calibra visualmente após implementação.

## Nível 5 — Bloco de loop fixo (repeat_3) ✅ IMPLEMENTADO

- **Conceito:** loop com N fixo. Introduz o primeiro bloco "estrutura de controle" do projeto (aceita filhos no slot interno).
- **Função pedagógica:** par com o Nível 4. A criança refaz o MESMO trajeto do Nível 4 (rega as 3 sementes que plantou) mas agora com o bloco `[Repetir 3×]` disponível. Sente o alívio de fazer mais com menos (princípio "necessidade antes da ferramenta").
- **Cenário:** mesma grade 4×4 do Nível 4, mesmas 6 pedras, mesmos 3 canteiros — agora com sementes (`seed`) já plantadas aguardando rega.
- **Blocos:** [Direita →] [Esquerda ←] [Subir ↑] [Descer ↓] [💧 Regar] [🔄 Repetir 3×]
- **Solução-alvo (9 blocos):**
  ```
  [Repetir 3× [Direita]][Regar]   → C1 em (0,3)
  [Repetir 3× [Descer]][Regar]    → C2 em (3,3)
  [Repetir 3× [Esquerda]][Regar]  → C3 em (3,0)
  ```
- **Solução longa aceita:** versão sem `repeat_3` no padrão do Nível 4 mas com `Regar` em vez de `Plantar` (12 blocos exatos — ainda cabe em maxBlocks 14).
- **Texto de conclusão:** "Olha que esperto! Em vez de mandar o mesmo movimento três vezes, você usou o bloco de **repetir**. Programar bem é fazer mais com menos. Lembra disso — vai ser útil mais pra frente."

**Implementação técnica:**
- Grid: 4×4, player em (0,0)
- 6 rochas (mesmas posições do Nível 4): `grid[1][0]`, `grid[2][0]`, `grid[1][1]`, `grid[1][2]`, `grid[2][1]`, `grid[2][2]`
- 3 canteiros já plantados: `grid[0][3]`, `grid[3][3]`, `grid[3][0]` com content === `"seed"`
- Condição de vitória: `custom` (C1, C2 e C3 todos com content === `"sprout"`)
- Max blocos: 14 (contagem plana, inclui filhos de containers)
- Reward: multi-element com 8 operações no Mundo permanente
- Arquivo: `lib/levels/index.ts` → `createLevel5()`

**Mecânica nova — bloco `repeat_3` (estrutura aninhada):**
- Primeiro bloco do projeto que aceita FILHOS no slot interno.
- `BlockType` ganhou variante `repeat_3`. `ProgramBlock` ganhou campo opcional `children?: ProgramBlock[]`.
- O conversor `Block → AST` em `app/level/[id].tsx` virou recursivo: `repeat_3` com filhos vira `LoopNode { times: 3, body: blocksToAST(children) }`. Demais blocos viram `ActionNode` (igual antes — não-retroativo).
- Se algum filho falha durante a execução (bate em pedra, sai da grade), o loop INTEIRO para. Mensagem de erro contextual normal — mesma lógica do Nível 4 via `failReason`.

**UX nova — "Modo edição via toque":**
- Tap no bloco `repeat_3` na paleta cria envelope vazio na lista do programa. O envelope entra automaticamente em modo edição.
- Tap em outro bloco da paleta enquanto modo está ativo: o bloco entra DENTRO do envelope.
- Tap no cabeçalho do envelope alterna o modo (entra/sai). Tap no botão "Pronto ✓" também sai.
- **Validação na saída:** se envelope estiver vazio, mostra "Coloca pelo menos um bloco dentro do repetir." e mantém o modo aberto (não pune).
- **Indicador permanente no topo** enquanto modo está ativo: "✎ Adicionando blocos dentro de Repetir 3×".
- **Feedback visual no envelope:** em modo edição a borda fica mais grossa, fundo clareia, dica interna muda de "Toque no envelope pra adicionar blocos dentro" pra "Toque nos blocos acima — eles entram aqui".

Padrão de UX aplicável a TODAS as estruturas aninhadas futuras (condicional do Nível 6, if/else do Nível 7, função do Nível 9). Ver `DECISIONS.md`.

**Mensagens de erro contextuais (configuradas no nível):**
- Bate em pedra: "Hmm, tem uma pedra aí. Tenta outro caminho." (mesma do Nível 4)
- Sai da grade: "Esse lado não dá. O caminho continua em outra direção."
- Esqueceu de regar: "Você esqueceu de regar! Cada canteiro precisa de um \"Regar\"."
- Não regou todos: "Você ainda não regou todos os canteiros. Olha o caminho de novo." (`not_at_watering_spot`)
- Genérico: "Quase! Olha onde estão os canteiros e tenta outro caminho."

**Recompensas no Mundo permanente — 8 operações:**

Esta é a PRIMEIRA grande mudança visual do Mundo permanente do MVP.

1. `background_mundo_v2` substitui `background_mundo_v1` — mesma cena com graminha esparsa pelo solo e florestinha em silhueta no horizonte (asset NOVO).
2. `young_tree_lvl5` substitui `mini_tree_lvl4` — planta principal evolui de mini-árvore pra árvore jovem (asset NOVO `mundo_arvore_jovem.png`, 606×903 RGBA). **Antecipação do Nível 6 pro Nível 5** — reforça o "salto visual forte" deste nível.
3. `plant_stage3_lvl5_a` substitui `seed_lvl4_a` — plantinha estágio 3 ocupa a posição da semente plantada no Nível 4 (asset NOVO, reusado nas 3 plantinhas).
4. `plant_stage3_lvl5_b` substitui `seed_lvl4_b`.
5. `plant_stage3_lvl5_c` substitui `seed_lvl4_c`.
6. `flower_lvl5_a` — +1 flor decorativa (reuso do asset da flor do Nível 3).
7. `flower_lvl5_b` — +1 flor decorativa (mesmo asset).
8. `flower_no_tronco` — flor brota do tronco caído. **SUBSTITUI** o tronco original (não sobrepõe): o asset `flor_no_tronco.png` (1426×624) tem o tronco + flor integrados na mesma proporção do tronco antigo, então entra exatamente no lugar. Símbolo: vida vence até o que parecia morto.

**Cadeia de substituição da planta principal** (consolidada após Nível 5):
`seed_lvl1 → sprout_lvl2 → grown_sprout_lvl3 → mini_tree_lvl4 → young_tree_lvl5`. Cada estágio renderiza em posição própria; quando um mais evoluído aparece, os anteriores somem. A próxima evolução (árvore frutífera) entra no Nível 7.

**Cadeia de substituição das sementes do Nível 4:**
`seed_lvl4_a/b/c → plant_stage3_lvl5_a/b/c`. As sementes plantadas no Nível 4 viram plantinhas estágio 3 quando regadas no Nível 5 (pula estágio 2 — sinal de que regar acelerou o crescimento).

**Substituição do tronco:**
`mundo_tronco.png → flor_no_tronco.png`. O source do `Image` do tronco no `app/world.tsx` alterna baseado em `WORLD_ELEMENTS` conter `flower_no_tronco`. Padrão idêntico à substituição do background v1 → v2.

**Conexão com Nível 10 (ferramenta antecipada):**
A frase final do texto de conclusão ("vai ser útil mais pra frente") planta a semente de que loop vai ser útil de novo no recomeço. No árido, a criança vai precisar replantar muito — loop é o que permite plantar rápido. Princípio pedagógico registrado em `DECISIONS.md`.

---

### >>> CAPÍTULO NARRATIVO (entre nível 5 e 6) <<<

---

## Nível 6 — Olha antes de plantar (condicional simples) ✅ IMPLEMENTADO

- **Conceito:** condicional embutido (se → então), via bloco "tudo em um".
- **Cenário:** grade 1×6 linear. Avatar parte da coluna 0. Distribuição
  `[Avatar][SC][CV][CP][CV][CV]`:
  - SC = sem canteiro (chão simples — `"empty"`)
  - CV = canteiro vazio pronto pra plantar (`"flowerbed"`)
  - CP = canteiro com semente já plantada (`"seed"`)
  Os 3 estados aparecem nas 3 primeiras células — familiaridade incremental
  sem virar sequência decorada.
- **Blocos disponíveis:** [Direita] [Se vazio, plantar] [Repetir 5×]
- **Solução-alvo (3 blocos):**
  ```
  [Repetir 5× [Direita, Se vazio, plantar]]
  ```
- **Solução longa aceita (10 blocos):** 5 iterações manuais de
  `Direita, Se vazio, plantar`. Cabe em `maxBlocks: 12`.
- **Texto de conclusão (literal — não alterar):** "Você aprendeu a **olhar
  antes de fazer**. Nem todo lugar pede a mesma ação. Saber decidir é
  cuidar bem. Lembra disso — vai ser muito útil mais pra frente."

**Implementação técnica:**
- Grid: 6×1, player em (0,0).
- `grid[0][2] = "flowerbed"` (CV), `grid[0][3] = "seed"` (CP),
  `grid[0][4] = "flowerbed"` (CV), `grid[0][5] = "flowerbed"` (CV).
  Coluna 0 e 1 já são `"empty"` (SC).
- Condição de vitória: `custom` — as 3 CV (cols 2, 4, 5) devem virar
  `"seed"`. O CP de col 3 continua intocado.
- Max blocos: 12 (contagem plana inclui filhos de containers).
- Reward: 8 operações no Mundo permanente (ver abaixo).
- Arquivo: `lib/levels/index.ts` → `createLevel6()`.

**Mecânica nova — bloco "tudo em um" `if_canteiro_vazio_then_plantar`:**
- Bloco sólido único — **NÃO** é envelope, **NÃO** tem slot interno,
  **NÃO** tem modo de edição. Vai pro programa via tap simples na paleta,
  igual aos blocos de movimento. Cor roxa clara `#A88FD9` (categoria
  condicional, distinta dos azuis dos movimentos e do laranja do loop).
- **Comportamento de execução** (em `lib/interpreter/interpreter.ts`):
  - Se célula atual é CV (`"flowerbed"`): planta (vira `"seed"`),
    emite step com `action: "plant"` + `conditionResult: true`.
  - Se célula atual é CP (`"seed"`), SC (`"empty"`) ou qualquer outro:
    não faz nada, emite step com `conditionResult: false` (sem
    `worldChanges`).
- **Feedback visual durante execução** (`components/level/ProgramArea.tsx`):
  - `conditionResult: true` → bloco pulsa em **verde** (`#5D8A3C`, a mesma
    cor do bloco `plant` — associação: "a ação que aconteceu aqui foi um
    plantio").
  - `conditionResult: false` → bloco pulsa em **cinza claro** (`#BDBDBD`,
    indicando "ignorou" sem ser punitivo).
- **Princípio pedagógico:** o condicional é a ÚNICA forma de plantar
  neste nível. `plant` solto não entra na paleta. A criança aprende que
  plantar só acontece quando a condição é verdadeira — o conceito
  brilha sem competição.

**Mecânica nova — bloco `repeat_5`:**
- Idêntico ao `repeat_3` do Nível 5, com N=5 hardcoded.
- Princípio "N hardcoded no bloco" mantido. Loop com N variável fica
  reservado pra Nível 8+.
- Na paleta do Nível 6, só `repeat_5` aparece (paleta é por nível, não
  acumulativa). `repeat_3` não fica disponível aqui.
- Reusa todo o aparato de UX já estabelecido pelo `repeat_3`: modo
  edição via toque no envelope, botão "Pronto ✓", validação de vazio,
  indicador "✎ Adicionando blocos dentro de Repetir 5×".

**Campo novo no `ExecutionStep`:**
- `conditionResult?: boolean` — opcional, aditivo. Steps dos Níveis 1-5
  não emitem (campo undefined → comportamento atual preservado, não-
  retroatividade). Apenas o bloco condicional embutido emite.

**Mensagens de erro contextuais:**
- Sai da grade (6º `move_right` na coluna 5): "Esse lado não dá. O
  caminho continua em outra direção." (mesma do Nível 4-5).
- Programa termina com canteiros vazios remanescentes:
  "Ainda há canteiros vazios. Olha de novo onde o avatar passou."
- Criança usa só o condicional sem `move_right` (avatar fica parado):
  mensagem específica em `getContextualError` — "O avatar precisa andar
  pra encontrar canteiros. Use o bloco Direita." Caso edge raro, mas
  evita o "Monte seu programa!" confuso que dispararia com programa
  não-vazio antes.

**Recompensas no Mundo permanente — 8 operações:**

Este nível marca a **primeira fauna do MVP**.

1. `bird_lvl6_a` — pássaro pousado no tronco caído com flor.
2. `bird_lvl6_b` — pássaro pousado na pedra. **Mesmo asset**
   (`mundo_passaro_pousado.jpg`) mas **espelhado horizontalmente** no
   render do `app/world.tsx` via `transform: [{ scaleX: -1 }]`. Parece
   um "casal" virado em direções opostas. O schema do `reward.elements`
   continua `{ add, replaces }` sem campo `transform` — o mirror mora
   no render, não no level config (preserva não-retroatividade).
3. `mini_tree_lvl6_a` **substitui** `plant_stage3_lvl5_a` — a plantinha
   estágio 3 do Nível 5 cresceu pra mini-árvore.
4. `mini_tree_lvl6_b` **substitui** `plant_stage3_lvl5_b`.
5. `mini_tree_lvl6_c` **substitui** `plant_stage3_lvl5_c`.
6. `yellow_flower_lvl6_a` — flor amarela decorativa (asset novo
   `mundo_flor_amarela.jpg`).
7. `yellow_flower_lvl6_b` — mesma flor amarela, posição diferente.
8. `yellow_flower_lvl6_c` — mesma flor amarela, posição diferente.

**Cadeia de substituição das sementes do Nível 4 (estendida no Nível 6):**
`seed_lvl4_a/b/c → plant_stage3_lvl5_a/b/c → mini_tree_lvl6_a/b/c`.
Continuidade narrativa: as sementes que a criança plantou no Nível 4
viraram plantinhas regadas no Nível 5, e agora cresceram em mini-árvores.

**Planta principal NÃO muda neste nível.** Continua sendo árvore jovem
do Nível 5. Evolução pra árvore frutífera reservada pro Nível 7.

**Background do Mundo NÃO muda neste nível.** Continua sendo v2.
Background v3 reservado pro Nível 8.

**Conexão com Nível 10 (ferramenta antecipada):**
A frase final "vai ser muito útil mais pra frente" planta a semente
de que condicional vai voltar com força no Nível 10, onde discernimento
será vital pra plantar no árido (não dá pra plantar em qualquer canto —
só onde há terra fértil). Princípio "ferramentas antecipadas" registrado
em `DECISIONS.md`.

## Nível 7 — Condicional com duas ações (se/senão)

- **Conceito:** se / senão (else)
- **Cenário:** avatar anda por caminho. Casas com semente (planta), casas com broto (rega).
- **Blocos:** [Andar] [Plantar] [Regar] [Se houver semente, plantar, senão regar]
- **Solução:** [Repetir 6 vezes [Andar, Se houver semente plantar senão regar]]
- **Recompensa visual:** primeiro arbusto adulto com frutas
- **Texto:** "Cada situação pede uma resposta diferente. Você está aprendendo a **escolher bem**."

## Nível 8 — Introdução à variável (contador simples)

- **Conceito:** variável
- **Cenário:** avatar coleta exatamente 3 frutas e leva pra cesto. Indicador "Frutas: 0".
- **Blocos:** [Andar] [Pegar fruta (frutas + 1)] [Se frutas = 3, parar]
- **Solução:** [Repetir [Andar, Se houver fruta pegar, Se frutas = 3 parar]]
- **Recompensa visual:** cesta com frutas no Mundo, bichinho come fruta
- **Texto:** "Você usou um lugar pra **guardar** uma informação (quantas frutas). Isso se chama **variável**. Programadores usam isso o tempo todo."

## Nível 9 — Função simples (agrupar ações)

- **Conceito:** função / sub-rotina
- **Cenário:** avatar cuida de 3 canteiros. Cada canteiro = andar, plantar, regar.
- **Blocos:** [Andar] [Plantar] [Regar] [Definir "cuidar" = [...]] [Fazer "cuidar"]
- **Solução:** [Definir "cuidar" = [Plantar, Regar]] depois [Repetir 3 vezes [Andar, Cuidar]]
- **Recompensa visual:** três canteiros completos, espaço de cultivo organizado
- **Texto:** "Você criou um nome novo ('cuidar') que junta várias ações. Isso se chama **função**. É como ensinar uma palavra nova pro seu programa."

## Nível 10 — Combinação (loop + condicional + função)

- **Conceito:** combinar tudo
- **Cenário:** avatar atravessa caminho com canteiros e poças. Canteiros → "cuida". Poças → desvia.
- **Blocos:** [Andar] [Virar] [Cuidar (função pré-definida)] [Se houver poça, virar]
- **Solução:** [Repetir 8 vezes [Se houver poça, virar; senão se houver canteiro, cuidar; senão andar]]
- **Recompensa visual:** cerca de madeira no Mundo (início simbólico da cidade)
- **Texto:** "Você juntou tudo o que aprendeu! Sequência, repetição, decisão, lembrar de coisas, e dar nomes pra ações. É assim que tudo o que existe nos celulares foi feito."

---

## Tela Final (após nível 10)

- **Texto:** "Você terminou a primeira jornada. Mais coisas estão crescendo aqui — em breve."
- **Ação:** Botão "Voltar para o mundo" (sem próximo nível)
