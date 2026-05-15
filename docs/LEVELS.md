# Níveis — Norte Code MVP

**Última atualização:** 14/05/2026
**Versão:** 1.6.0 (Nível 7: condicional if/else via bloco "tudo em um" + árvore frutífera + esquilos + flores brancas; migração conditionResult boolean→string)

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

## Nível 7 — Cuidar de jeitos diferentes (if/else) ✅ IMPLEMENTADO

- **Conceito:** condicional com 2 ramos (se / senão). Discernimento
  amadurecido: criança não só "age ou não", ela **escolhe entre 2 ações**.
- **Cenário:** grade 1×6 linear. Avatar parte da coluna 0. Distribuição
  `[Avatar][CP][CV][CP][CV][CP]`:
  - CP = canteiro com semente plantada (`"seed"`) — precisa ser regado
  - CV = canteiro vazio (`"flowerbed"`) — precisa ser plantado
  3 CPs intercalados com 2 CVs forçam a criança a usar AMBOS os ramos
  do condicional várias vezes — sem isso, ela poderia "passar batido".
- **Blocos disponíveis:** [Direita] [Se com semente, regar; senão se vazio,
  plantar] [Repetir 5×].
  - `plant` e `water` solto **NÃO** entram — única forma de agir é via
    o condicional. Esse é o ponto pedagógico do nível.
- **Solução-alvo (3 blocos):**
  ```
  [Repetir 5× [Direita, Se com semente, regar; senão se vazio, plantar]]
  ```
- **Solução longa aceita (10 blocos):** 5 iterações manuais. Cabe em
  `maxBlocks: 12`.
- **Texto de conclusão (literal — não alterar):** "Agora você sabe
  escolher entre dois caminhos. Cuidar é responder ao que cada coisa
  precisa — não tratar tudo igual. Lembra disso — vai ser muito
  importante mais pra frente."

**Implementação técnica:**
- Grid: 6×1, player em (0,0).
- `grid[0][1]/[3]/[5] = "seed"` (CP), `grid[0][2]/[4] = "flowerbed"` (CV),
  `grid[0][0] = "empty"` (avatar).
- Condição de vitória `custom`: cols 1/3/5 viraram `"sprout"` (regadas) E
  cols 2/4 viraram `"seed"` (plantadas, sem rega). **Não há tempo no
  mesmo programa pra regar o que acabou de ser plantado** — esse é o
  ponto pedagógico (a criança vai ver as CVs viraram CPs no estado final).
- Max blocos: 12.
- Arquivo: `lib/levels/index.ts` → `createLevel7()`.

**Mecânica nova — bloco "tudo em um" if/else:**
- ID: `if_canteiro_com_semente_then_regar_else_if_canteiro_vazio_then_plantar`.
  Segue convenção do Nível 6 (`if_X_then_Y_else_Z_then_W`).
- Bloco sólido único — sem slot interno, sem modo de edição (mesma UX
  do bloco condicional simples do Nível 6).
- Cor: roxo claro `#A88FD9` (mesma do Nível 6 — categoria visual
  coerente "condicional").
- Ícone: `🌱💧 ⭕🌱` — representa os 2 ramos: regar uma semente vs
  plantar num canteiro vazio.
- **Comportamento de execução** (em `lib/interpreter/interpreter.ts`):
  - Se célula atual é CP (`"seed"`): rega (vira `"sprout"`), emite step
    com `action: "water"` + `conditionResult: "water"`.
  - Se célula atual é CV (`"flowerbed"`): planta (vira `"seed"`), emite
    step com `action: "plant"` + `conditionResult: "plant"`.
  - Caso contrário (SC ou outro): no-op, emite step com
    `conditionResult: "none"`.

**Migração técnica — `conditionResult: boolean → string`:**

Pra acomodar os 3 resultados possíveis do if/else (`"plant"` /
`"water"` / `"none"`), o campo `conditionResult` em `ExecutionStep`
deixou de ser `boolean` e virou `"plant" | "water" | "none"`.

- Mapeamento da migração no Nível 6:
  - `true`  → `"plant"` (era "plantou")
  - `false` → `"none"` (era "ignorou")
- Cores do glow no `ProgramArea` reorganizadas em função pura
  `conditionResultColor(result)`:
  - `"plant"` → verde `#5D8A3C` (mesma cor de antes — Nível 6 sem regressão)
  - `"water"` → azul-rio `#5B8AA6` (Style Guide v1.3 — novo no Nível 7)
  - `"none"`  → cinza claro `#BDBDBD` (mesma cor de antes — Nível 6 sem regressão)
- **Aditivo, não-retroativo:** Níveis 1-5 nunca emitem o campo,
  comportamento preservado. Nível 6 funcional pixel a pixel após a
  migração (só o nome interno do valor mudou).

**Princípio pedagógico — "uma forma única de agir":**
Mesma lógica do Nível 6 estendida pro Nível 7: `plant` e `water`
soltos não estão na paleta. A criança aprende que cada ação só
acontece quando a condição correspondente é verdadeira. Reforça o
discernimento: olhar antes de agir, e escolher a ação certa pra
cada contexto.

**Mensagens de erro contextuais:**
- Sai da grade: "Esse lado não dá. O caminho continua em outra direção."
- Programa termina com canteiros sem cuidar: "Ainda há canteiros pra
  cuidar. Olha de novo onde o avatar passou."
- Criança usa só o condicional sem `move_right`: "O avatar precisa
  andar pra encontrar canteiros. Use o bloco Direita." (mesma heurística
  do Nível 6, agora cobrindo os 2 blocos condicionais embutidos).

**Recompensas no Mundo permanente — 7 operações:**

1. `fruit_tree_lvl7` **substitui** `young_tree_lvl5` — árvore principal
   evolui de jovem pra frutífera. Asset `mundo_arvore_frutifera.png`
   (1024×1024 RGBA).
2. `fallen_log_with_flower_and_squirrel_lvl7` **substitui**
   `flower_no_tronco` — tronco caído com flor agora abriga um esquilo
   morando dentro. Asset `mundo_tronco_com_flor_e_esquilo.png`
   (3072×1344). Cadeia tripla do tronco consolidada.
3. `squirrel_lvl7_ground` — esquilo decorativo no chão (segunda fauna
   do MVP, depois dos pássaros do Nível 6).
4-7. `white_flower_lvl7_a/b/c/d` — 4 flores brancas decorativas com
   matinho na base, espalhadas pelo jardim.

**Cadeia da planta principal estendida:**
`seed_lvl1 → sprout_lvl2 → grown_sprout_lvl3 → mini_tree_lvl4 → young_tree_lvl5 → fruit_tree_lvl7`.

**Cadeia tripla do tronco:**
`mundo_tronco.png → flor_no_tronco.png (Nível 5) → mundo_tronco_com_flor_e_esquilo.png (Nível 7)`.
Cada estágio é uma substituição direta no `source` do `Image` baseada
em qual recompensa está ativa. Mais evoluído tem prioridade.

**Mini-árvores, pássaros e flores amarelas do Nível 6:** mantidos sem
mudança. **Background do Mundo:** continua v2 (substituição pra v3
reservada pro Nível 8).

**Conexão com Nível 10 ("ferramenta antecipada"):**
A frase final "vai ser muito importante mais pra frente" planta a
semente: condicional + discernimento vão ser vitais no recomeço do
árido, onde "tratar tudo igual" não funciona.

**Mascote-Gabarito (feature aditiva — ver seção própria abaixo):**
A partir do Nível 7, após a criança vencer, o mascote refaz a tarefa
aplicando a solução ótima. Gabarito do Nível 7 (`optimalSolution`):
`[Repetir 5× [Direita, Se com semente, regar; senão se vazio, plantar]]`
— 3 blocos. Texto de conclusão pluralizado pra refletir a dupla
criança + mascote (ver detalhes na seção do mascote-gabarito).

---

## Nível 8 — Saber a medida certa (variável + repeat_until) ✅ IMPLEMENTADO

- **Conceito:** variável (contador). Primeira ideia abstrata sem
  comportamento visível imediato — outros conceitos do MVP têm efeito
  direto (andar move o avatar, plantar planta), variável é "guardar um
  número". Resolvemos com dupla representação: contador HUD (texto
  numérico) + cesta da atividade (visual concreto enchendo).
- **Função pedagógica:** consciência de **quantidade**. Cuidar não é
  "fazer pra sempre" — é "fazer até atingir o que é necessário".
  Mordomia tem medida.
- **Cenário:** grade 1×5 linear. Avatar começa na coluna 0. Layout:
  `[Avatar][chão][chão][chão][Árvore frutífera]`. A árvore frutífera
  é uma célula visualmente fixa (não consome — é "inesgotável").
  Cesta da atividade renderizada como overlay perto do avatar
  (componente novo `ActivityBasket`). Contador HUD "🍎 Frutas: X / 3"
  no topo.
- **Blocos disponíveis:** [Direita] [Pegar fruta] [Repetir até pegar
  3 frutas]. `pick_fruit` solto entra (princípio "necessidade antes
  da ferramenta": criança pode resolver sem o repeat_until antes de
  descobri-lo).
- **Solução-alvo (5 blocos):**
  ```
  [Direita, Direita, Direita, Repetir até pegar 3 frutas [Pegar fruta]]
  ```
- **Solução longa aceita (6 blocos):** 3 movimentos + 3 pick_fruit
  diretos, sem usar o loop. Cabe em `maxBlocks: 12`.
- **Texto de conclusão (literal — não alterar):** "Você usou um
  **lugar pra guardar** uma informação (quantas frutas). Isso se
  chama variável. Cuidar bem é saber a quantidade certa — não pegar
  tudo, não pegar de menos. Lembra disso — vai ser muito importante
  mais pra frente."

**Implementação técnica:**
- Grid: 5×1, player em (0,0).
- `grid[0][4] = "fruit_tree"` (CellContent novo do Nível 8). Demais
  células `"empty"`.
- Variável `frutas` REUSA `player.inventory.fruits` que já existia
  no `PlayerState` (decisão registrada em DECISIONS.md — YAGNI sobre
  campo genérico `variables: Record<string, number>`). Reset
  automático: `resetWorld` clona o `initialWorld` que tem
  `inventory: { fruits: 0 }`, então cada execução começa zerada.
- Condição de vitória `custom`: `state.player.inventory.fruits === 3`
  (EXATAMENTE 3 — não usei `goalCondition.collect_fruits` porque ele
  é `>=`, não cobre "exatamente N").
- Max blocos: 12.
- Arquivo: `lib/levels/index.ts` → `createLevel8()`.

**Mecânica nova — bloco `pick_fruit` (cor rosa-fruta):**
- ID: `pick_fruit` (REUSA o tipo que já existia no `BlockType` como
  código morto pré-Nível 8 — economiza um BlockType novo). Label:
  "Pegar fruta". Ícone: 🍎.
- Cor: `#D8848C` (rosa-fruta) — antes era `#F5A623` (laranja, brigava
  com a cor dos repeats fixos `#E8853D`). Rosa-fruta dialoga com a
  cor da fruta da árvore frutífera no jardim permanente.
- **Comportamento de execução** (em `lib/interpreter/interpreter.ts`):
  - Em célula `"fruit_tree"`: incrementa `inventory.fruits` em 1
    (sem alterar a célula — visualmente fixa). **Idempotente quando
    `inventory.fruits >= 3`** (edge case E2 do briefing — 4º
    pick_fruit é silencioso, sem decrementar nem errar).
  - Em célula `"fruit"` (caso solta, cenários futuros): mantém
    comportamento anterior (consome a célula).
  - Caso contrário: no-op silencioso (heurística da UI gera
    mensagem contextual).

**Mecânica nova — bloco `repeat_until_frutas_3` (envelope com
condição embutida):**
- ID: `repeat_until_frutas_3`. Label: "Repetir até pegar 3 frutas".
  Ícone: 🔄 🍎. Cor: roxo claro `#A88FD9` (mesma família visual dos
  condicionais — semanticamente é "loop com condição").
- Container envelope com slot interno + modo edição via toque,
  exatamente como `repeat_3`/`repeat_5` (registrado em
  `CONTAINER_TYPES`).
- AST novo: `RepeatUntilNode { type: "repeat_until", condition,
  body }`. Condição hardcoded em `"fruits_equal_3"` no MVP.
- **Comportamento de execução**: a cada iteração, ANTES dos filhos:
  - Se `inventory.fruits === 3` → encerra o loop, próximo bloco do
    programa segue.
  - Senão → executa filhos uma vez, volta a checar.
- **Fail-safe:** `MAX_EXECUTION_STEPS` (200, já existia) protege
  contra loop infinito. Adicional: se uma iteração não emite
  nenhum step (ex: corpo só com containers vazios) E a condição
  não muda, o `executeRepeatUntil` força saída com `ctx.error`
  pra evitar loop tight em teste.

**Edge cases (briefing do Nível 8):**
- **E1 — Solução longa sem `repeat_until_frutas_3`:** 6 blocos com
  3 `pick_fruit` em sequência. ✅ Aceita. Princípio "necessidade
  antes da ferramenta".
- **E2 — Mais `pick_fruit` que o necessário:** 4º silenciosamente
  ignorado pela idempotência do interpretador. Programa termina
  com sucesso (3 === 3).
- **E3 — `repeat_until` sem `pick_fruit` dentro:** atinge
  `MAX_EXECUTION_STEPS`, `ctx.error` setado, UI mostra "Hmm,
  parece que faltou pegar fruta dentro do repetir." (chave
  `wrong_path` do level 8).
- **E4/E5 — pick_fruit fora da árvore:** falha silenciosa no
  interpretador. UI detecta por `inventory.fruits === 0` no fim
  e mostra "O avatar precisa estar perto da árvore pra pegar
  frutas. Use os blocos de movimento."

**HUD do contador + cesta da atividade (componentes novos):**
- HUD: pílula com "🍎 Frutas: X / 3" no topo, abaixo da
  descrição do nível. Cor neutra (rosa-fruta sobre fundo creme)
  enquanto X<3, vira verde-plant `#5D8A3C` com pulse curto
  quando X===3.
- `ActivityBasket` (`components/level/ActivityBasket.tsx`):
  componente novo. Recebe `fruitCount` e troca asset entre
  `atividade_cesta_vazia.png` / `_1.png` / `_2.png` / `_3.png`.
  Posição placeholder centralizada abaixo do grid — Gui calibra.
- **Animação "fruta voando da árvore pra cesta" NÃO implementada
  na primeira entrega.** Cesta troca instantaneamente quando
  `pick_fruit` executa. Decisão tomada com Gui pra reduzir escopo;
  fica como polish pós-teste no celular se valer adicionar.

**Recompensas no Mundo permanente — TRANSFORMAÇÃO VISUAL MAJOR:**

A flag `background_mundo_v3` é o gatilho de toda a transformação.
Quando presente em `worldElements`:

1. `background_mundo_v3` **substitui** `background_mundo_v2` —
   gramado predominante, 3-4 árvores médias ao redor de uma
   árvore frutífera central destacada, silhueta de mata distante
   (3 camadas de profundidade). Asset `background_mundo_v3.png`
   (720×1260).
2. **Árvore frutífera (`fruit_tree_lvl7`) DEIXA de renderizar
   no primeiro plano.** Passa a fazer parte do background v3 (é a
   árvore central destacada).
3. **3 mini-árvores (`mini_tree_lvl6_a/b/c`) DEIXAM de renderizar
   no primeiro plano.** Passam a ser 3 das árvores médias do
   background v3.
4. **Tronco caído com flor + esquilo MANTÉM no primeiro plano.**
   Decisão: o tronco carrega 3 layers narrativos (morte → flor →
   esquilo) — mover pro background descaracterizaria a cadeia.
5. **Fauna existente MANTÉM:** 2 pássaros, esquilo no chão.
   Flores rosa/amarelas/brancas também mantêm.
6. **NOVO — `basket_with_serpent_lvl8`** — cesta da recompensa
   com a serpente DENTRO, envolvida nas frutas. Asset único
   combinado `mundo_cesta_recompensa_com_serpente.png` (2048²).
   Decisão narrativa-chave registrada em DECISIONS.md — a
   serpente é apresentada como elemento atrativo, calmo, "boa".
   Antecipa visualmente a tentação ativa do Nível 9.
7. **NOVO — `butterfly_perched_lvl8`** — borboleta pousada
   numa flor (asset `mundo_borboleta_pousada.png`, 906×683).
8. **NOVO — `butterfly_flying_lvl8`** — borboleta voando em
   direção a uma flor (asset `mundo_borboleta_voando.png`,
   820×782). **NÃO é mirror da pousada — é asset distinto**
   (diferente do padrão dos pássaros do Nível 6, onde 1 asset
   foi espelhado).

**Princípio narrativo aplicado — "elemento que migra pro
background":**
A árvore principal e as mini-árvores que a criança "fez crescer"
nos níveis anteriores (sementes do Nível 1 e Nível 4) agora
fazem parte da paisagem permanente do jardim. O cuidado individual
virou paisagem — sensação de profundidade temporal (jardim chegou
à plenitude). Abre espaço visual pros eventos do Nível 9
(serpente atuando) e Nível 10 (cenário árido).

**Conexão com Nível 9 ("preparação narrativa"):**
A serpente entra no Nível 8 como recompensa, dentro da cesta.
Visualmente calma e atraente. Quando ela "agir" no Nível 9,
a criança já confiou nela visualmente — a queda ganha peso
emocional. Coerência com Gn 3:1 ("a serpente era mais astuta
que todos os animais selvagens"): ela ESTAVA no jardim antes
da tentação, não foi importada.

**Mascote-Gabarito (feature aditiva — ver seção própria abaixo):**
Gabarito do Nível 8 (`optimalSolution`):
`[Direita, Direita, Direita, Repetir até pegar 3 frutas [Pegar fruta]]`
— 5 blocos. Texto de conclusão pluralizado.

---

## Mascote como Gabarito Visual (feature — Níveis 7+) ✅ IMPLEMENTADO

Feature aditiva-retroativa aplicada aos Níveis 7 e 8 (já entregues).
**Não muda a mecânica dos níveis** — adiciona uma cena posterior após
o sucesso da criança.

**O que acontece:** depois que a criança vence um nível que tem
`optimalSolution` definida, o mascote dela refaz a tarefa no mapa
aplicando a solução ótima. A criança vê a versão elegante da solução
sem ser corrigida — aprendizagem por exemplo, não por correção.

**Sequência da cena:**
1. Criança vence → respiração de ~0.5s (sente a vitória).
2. Mensagem de transição aparece sobre o mapa por ~1.8s:
   _"O {nome do mascote} aprendeu com você. Olha o jeito dele!"_
3. Atrás da mensagem: o mapa reseta pro estado inicial e o sprite do
   avatar verde é trocado pelo sprite do mascote (humor "atento").
4. A mensagem some e o mascote executa a `optimalSolution` — mesma
   mecânica de animação da execução da criança (movimento célula a
   célula, plantio, rega, coleta).
5. Durante essa 2ª execução, a área de blocos (ProgramArea) exibe os
   blocos do gabarito, com o destaque acompanhando cada passo — a
   criança vê a solução elegante EM BLOCOS, não só o resultado.
6. Ao terminar, vai pro level summary com o texto de conclusão
   pluralizado.

**A 2ª execução não conta como tentativa** — é cena, não jogo. O
nível é registrado como completo uma única vez (no level summary).

**Texto de conclusão pluralizado:** o `reward.message` dos Níveis 7
e 8 foi flexionado pra 1ª/2ª pessoa do plural (criança + mascote como
dupla). Mudança mínima — só verbos e pronomes:
- Nível 7: "Agora **vocês sabem** escolher... **Lembrem** disso..."
- Nível 8: "**Vocês usaram** um lugar pra guardar... **Lembrem** disso..."

**Níveis 1-6 NÃO têm a feature** — sem `optimalSolution` definida,
sem cena do mascote. O mascote segue como personagem decorativo
afetivo no Mundo Permanente, função antiga preservada.

**Por que a partir do Nível 7:** decisão narrativa-arquitetural —
o mascote vira "segundo agente moral" do jogo, com agência própria.
A expectativa de "mascote sempre aprende e acerta" construída nos
Níveis 7-8 é a fundação pra quebra de expectativa no Nível 9 (quando
o mascote for seduzido pela serpente). Decisão completa em
`docs/DECISIONS.md`.

---

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
