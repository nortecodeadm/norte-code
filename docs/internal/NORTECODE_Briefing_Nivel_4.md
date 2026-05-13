# Briefing de Execução — Nível 4 (Passo 4 do Protocolo)

**Projeto:** Norte Code
**De:** Claude (Estrategista)
**Para:** Claude Code (Dev Temporário — Cenário A do Protocolo)
**Via:** Gui
**Data:** Maio/2026

---

## Antes de começar — Leitura obrigatória

Você está atuando como Dev Temporário do Norte Code. Antes de qualquer linha de código:

1. **Leia o `NORTECODE_Protocolo_Dev_Temporario.md`** — define seu papel e o cenário operacional (você se encaixa no **Cenário A**: tem acesso ao filesystem local e git CLI).
2. **Leia o `NORTECODE_Protocolo_Colaboracao_IAs.md`** — define o fluxo geral e as regras de não-retroatividade.
3. **Leia o `NORTECODE_Briefing_MVP_v2_5.md`** — visão completa do produto, decisões já tomadas, estado atual da implementação (Níveis 1, 2, 3 prontos; Nível 4 = sua tarefa).
4. **Inspecione o código existente antes de gerar nada** — especialmente `lib/levels/index.ts`, `lib/interpreter/blocks.ts`, `lib/interpreter/interpreter.ts`, `lib/interpreter/world-state.ts`, `components/level/BlockPalette.tsx` e `app/world.tsx`. Você NÃO deve assumir como o código está estruturado — leia e siga o padrão existente.

Se algo neste briefing conflitar com o que existe no código, **PARE e pergunte ao Gui antes de prosseguir**. Não chute.

---

## Estratégia de execução (Cenário A — você roda local)

- Você tem acesso ao filesystem do projeto e ao git CLI no Windows do Gui.
- Repositório: `https://github.com/nortecodeadm/norte-code`.
- **Estratégia de commits: direto no `main`.** Sem branch separada, sem PR. O Gui não revisa código — confia na entrega + Relatório de Execução. Quebre em commits lógicos (não um único commit gigante), mas todos vão pro `main`.
- Antes de começar: `git pull origin main` pra pegar mudanças recentes do Gui.
- Conventional Commits sempre (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
- Não commitar `.env` ou credenciais. Verificar que `.gitignore` está respeitado.
- Você pode rodar `npx expo start` localmente pra validar que o app sobe e o nível carrega sem crash. Não precisa gerar APK EAS no MVP de teste — Gui valida visualmente via Fast Refresh ou Expo Go no celular.

---

## Demanda

Implementar o **Nível 4** do MVP do Norte Code: introduzir o bloco `move_left` à mecânica e preparar a criança para o conceito de loop (a ser introduzido no Nível 5), através de uma sequência longa com padrão repetitivo claro.

---

## Decisão tomada (contexto e razões)

### O par pedagógico Nível 4 ↔ Nível 5

O Nível 4 e o Nível 5 formam um **par pedagógico** que precisa ser entendido em conjunto antes da implementação. A virada didática é "necessidade antes da ferramenta":

- **Nível 4** — criança PLANTA 3 sementes percorrendo um caminho em "U" no sentido horário. Não tem bloco `repeat` disponível. Programa típico: 12 blocos, em **3 grupos simétricos** de "3 movimentos + 1 plant". A criança SENTE o cansaço da repetição manual.
- **Nível 5** — criança REGA as mesmas 3 sementes (mesmo cenário, mesmos movimentos). Agora com bloco `repeat 3x` disponível. Programa típico: 9 blocos. Criança SENTE o alívio do loop.

O Nível 5 está fora do escopo deste briefing — será briefing separado. **Mas a implementação do Nível 4 precisa deixar o terreno preparado** (cenário, recompensas, estrutura de dados) para o Nível 5 reusar tudo.

### Por que `move_left` é introduzido aqui

O caminho do "U" termina com a criança movendo o avatar 3 vezes pra esquerda — uso pedagógico natural do `move_left` ("voltar"). Introduzir esquerda separadamente sem essa motivação narrativa torna o bloco abstrato.

### Por que o cenário tem 6 pedras (não 4)

Pra forçar a única solução válida ser o caminho do "U" em sentido HORÁRIO (direita → desce → esquerda), e não anti-horário (desce → direita → sobe). Sem as 2 pedras adicionais na coluna 0, a criança poderia começar descendo e o nível teria duas soluções de 12 blocos. Queremos UMA solução previsível pra que o Nível 5 transforme exatamente ela em `[Repetir 3x [→]] [plant] [Repetir 3x [↓]] [plant] [Repetir 3x [←]] [plant]`.

### Por que `move_up` está na paleta mesmo não sendo necessário

Decisão pedagógica do Gui: a paleta inclui `move_up` mesmo sem ser usado na solução. Isso permite que a criança explore (tente usar `move_up` no início → sai da grade → erro produtivo) e aprenda que nem todo bloco disponível serve pra toda situação. Princípio: a paleta não revela a solução.

### Princípio narrativo: o Mundo permanente é narrativa visual, não decoração

**Este é o princípio que governa as recompensas deste e dos próximos níveis.** O Mundo permanente (Tela Mundo) NÃO é uma vitrine decorativa — é a história do projeto sendo contada visualmente, em paralelo ao gameplay. Cada nível concluído adiciona elementos que dão a sensação contínua de que o jardim está crescendo, florescendo, ficando mais vivo.

Os elementos do Mundo **não precisam ter coerência ficcional perfeita** entre si (uma planta pode "mudar de posição" entre níveis sem explicação). O que importa é a sensação de progresso e vida se expandindo.

Esboço do roadmap visual (sujeito a refinamento em sessão dedicada após Nível 4 entregue):
- Níveis 1-3: foco em uma planta individual crescendo. Brotação inicial.
- Níveis 4-6: expansão da paisagem. Árvore central + várias plantinhas + flores. Primeiros sinais de fauna.
- Níveis 7-9: floresta diversa. Frutos, mais animais. Auge do jardim.
- Nível 10: serpente entra (briefing futuro define mecânica).

**Cosmovisão cristã embutida, nunca explícita:** o arco geral (jardim → quebra → restauração) é a estrutura narrativa, sem que nenhum texto do app mencione Bíblia, Deus ou narrativas bíblicas. Criança vive a história; pais cristãos reconhecem; pais não-cristãos veem um jogo bonito sobre cuidado.

### Por que as recompensas têm o design que têm

O Nível 4 marca o **primeiro nível de expansão visual do jardim**. Faz duas coisas:

1. **Faz a planta principal evoluir.** O "broto crescido" (`grown_sprout_lvl3`) que estava no Mundo desde o Nível 3 é **substituído** por uma **mini-árvore** (`mini_tree_lvl4`), posicionada ao fundo. Sinal visual de que a planta continua sendo cuidada e continua crescendo, mesmo que a criança agora foque em plantar coisas novas.
2. **Adiciona 3 sementes novas + 1 flor decorativa.** As 3 sementes representam o que a criança acabou de plantar dentro do nível. A flor é decoração ambiental (mundo ficando mais bonito).

No **Nível 5** (briefing futuro), as 3 sementes serão regadas e virarão 3 plantinhas estágio 3 (pulando o broto estágio 2), e +2 flores serão adicionadas. A mini-árvore continua lá ao fundo, possivelmente evoluindo de novo em níveis posteriores.

**Padrão de substituição já estabelecido:** o Nível 3 fez exatamente isso ao substituir `sprout_lvl2` por `grown_sprout_lvl3`. Não há refator de Níveis 1-3 — só substituição de um elemento existente no Mundo (operação que a estrutura `WORLD_LAYOUT` já suporta).

### Princípio de não-retroatividade

Seguindo a regra 4.6 do Briefing MVP v2.5: este nível ADICIONA estruturas, não refatora as anteriores. O Nível 4 reusa a estrutura `grid.cells[row][col]` já existente desde o Nível 3. Sem mexer em Níveis 1, 2 ou 3.

---

## Especificação completa do Nível 4

### Estrutura do mundo do nível

- **Tipo:** grade 2D (`grid.cells[row][col]`)
- **Dimensões:** 4 linhas × 4 colunas
- **Posição inicial do avatar:** (linha 0, coluna 0) — canto superior esquerdo
- **Direção inicial do avatar:** irrelevante (movimentos são absolutos do ponto de vista do usuário, não do avatar — ver seção "Referencial direcional" abaixo)

### Layout da grade

```
Coluna:     0       1       2       3
Linha 0:  [AVATAR] [   ]   [   ]   [C1 ]
Linha 1:  [PEDRA]  [PEDRA] [PEDRA] [   ]
Linha 2:  [PEDRA]  [PEDRA] [PEDRA] [   ]
Linha 3:  [C3   ]  [   ]   [   ]   [C2 ]
```

Onde:
- `AVATAR` = posição inicial do avatar
- `C1`, `C2`, `C3` = canteiros plantáveis
- `PEDRA` = obstáculo bloqueante
- `[   ]` = célula vazia transitável

### Posições exatas

| Elemento | Linha | Coluna |
|---|---|---|
| Avatar (inicial) | 0 | 0 |
| Canteiro C1 | 0 | 3 |
| Canteiro C2 | 3 | 3 |
| Canteiro C3 | 3 | 0 |
| Pedra 1 | 1 | 0 |
| Pedra 2 | 2 | 0 |
| Pedra 3 | 1 | 1 |
| Pedra 4 | 1 | 2 |
| Pedra 5 | 2 | 1 |
| Pedra 6 | 2 | 2 |

### Paleta de blocos disponíveis

5 blocos:

| ID do bloco | Label visível (PT-BR) | Categoria |
|---|---|---|
| `move_right` | Direita | Movimento |
| `move_left` | Esquerda | Movimento (NOVO neste nível) |
| `move_up` | Subir | Movimento (já existe desde Nível 3) |
| `move_down` | Descer | Movimento (já existe desde Nível 3) |
| `plant` | Plantar | Ação |

`move_left` é o bloco efetivamente NOVO. Os outros 4 já existem no projeto.

### Referencial direcional (CRÍTICO — não inverter)

**Os blocos de movimento usam referencial ABSOLUTO do ponto de vista do usuário que está olhando a tela.** NÃO há rotação do avatar. NÃO há "frente" ou "trás" do avatar.

- `move_right` = coluna +1 (uma célula pra direita NA TELA)
- `move_left` = coluna −1 (uma célula pra esquerda NA TELA)
- `move_up` = linha −1 (uma célula pra cima NA TELA)
- `move_down` = linha +1 (uma célula pra baixo NA TELA)

Isso é consistente com Níveis 1-3 (já implementados assim). Não inverter, não rotacionar, não introduzir referencial relativo ao avatar. Se houver dúvida, consultar Gui antes.

### Solução-alvo (única válida em 12 blocos)

```
[move_right] [move_right] [move_right] [plant]   → planta C1 em (0, 3)
[move_down]  [move_down]  [move_down]  [plant]   → planta C2 em (3, 3)
[move_left]  [move_left]  [move_left]  [plant]   → planta C3 em (3, 0)
```

Total: **12 blocos**. 3 plants em 3 canteiros distintos. Padrão simétrico: 3 grupos de "3 movimentos + 1 plant".

### Validação de sucesso

O nível é considerado completo quando o estado final do mundo tem os 3 canteiros (C1, C2, C3) plantados. **A ordem NÃO importa, e o tamanho do programa NÃO importa** — qualquer programa que termine com os 3 canteiros plantados é aceito.

(Importante: por design da grade, com as 6 pedras nas posições especificadas, a única forma de chegar nos 3 canteiros sem atravessar pedras é o caminho do "U" em sentido horário descrito acima. A validação acontece naturalmente — não precisa ser uma validação "programa == solução exata", basta validar o estado final do mundo.)

### Mensagens de erro contextuais

Quando o avatar tenta uma ação inválida durante a execução, exibir mensagem amigável (não punir, não usar palavras como "errado" ou "falhou"):

| Situação | Mensagem |
|---|---|
| Avatar bate em pedra | "Hmm, tem uma pedra aí. Tenta outro caminho." |
| Avatar tenta sair da grade (por qualquer borda) | "Esse lado não dá. O caminho continua em outra direção." |
| Avatar tenta plantar em célula sem canteiro | "Aqui não tem canteiro. Procura o lugar certo pra plantar." |
| Avatar tenta plantar em canteiro já plantado | "Você já plantou aqui! Vai pro próximo." |

Após qualquer erro, a execução PARA, o avatar volta à posição inicial, e a criança pode reorganizar o programa. Sem contadores de tentativas, sem penalidade.

### Texto de conclusão do nível

Após sucesso, exibir na tela de resumo do nível:

> "Você reparou que fez quase a mesma coisa três vezes? Andar pra um lado e plantar. Andar pra outro lado e plantar. Andar pra outro lado e plantar. Programar é assim mesmo — às vezes a gente repete. No próximo nível você vai descobrir um jeito mais esperto de fazer isso."

Esse texto NÃO é negociável e não deve ser alterado sem consulta ao Gui. Está calibrado pra preparar o "aha moment" do Nível 5.

### Recompensas no Mundo permanente

Após sucesso no Nível 4, atualizar o Mundo permanente (`world_state`) com **duas operações distintas**:

**Operação 1 — Substituir (igual ao padrão estabelecido no Nível 3):**
- Remover/ocultar `grown_sprout_lvl3` (broto crescido que foi adicionado no Nível 3).
- Adicionar no MESMO contexto visual (mas pode mudar de posição se necessário, conforme princípio narrativo acima) o novo elemento `mini_tree_lvl4` — uma mini-árvore. Pensar nela como "a planta do Nível 3 cresceu mais". Posicioná-la **mais ao fundo da cena** do que o broto crescido estava, pra abrir espaço visual pras 3 sementes novas que aparecerão na frente.

**Operação 2 — Adicionar elementos novos:**
- **3 sementes (estágio 1)** posicionadas perto uma da outra, na frente da cena (mais próximas do observador do que a mini-árvore). Simbolizam o que foi plantado neste nível. IDs sugeridos:
   - `seed_lvl4_a`
   - `seed_lvl4_b`
   - `seed_lvl4_c`
- **1 flor decorativa** adicionada ao Mundo, em posição livre. ID sugerido: `flower_lvl4`.

**Asset NOVO necessário pra esta operação:** `mini_tree_lvl4.png` (e equivalentes em outras densidades, conforme padrão de assets do projeto). O Gui está providenciando esse asset via Gemini/Canva conforme prompt já preparado. **Você pode começar a implementação usando placeholder visual** (ex: um quadrado verde com label "MINI-ÁRVORE" ou reusar `grown_sprout_lvl3` em escala maior temporariamente) e substituir pelo asset real quando o Gui entregar. Comunicar no Relatório de Execução se ficou com placeholder ou se já está com o asset final.

**Reuso de assets existentes:**
- 3 sementes (estágio 1): reusar o mesmo asset do `seed_lvl1` (sementinha original do Nível 1). É a MESMA imagem, só multiplicada três vezes em posições diferentes do Mundo.
- Flor decorativa: reusar o mesmo asset do `flower_lvl3`. É a MESMA imagem.

**Posicionamento inicial:** coloque os elementos novos em posições placeholder que NÃO conflitem visualmente com elementos já existentes no `WORLD_LAYOUT` (sementinha do Nível 1, broto/sprout do Nível 2, flor do Nível 3). **Gui fará o ajuste fino das posições após implementação** — não gaste tempo calibrando pixel perfect, só garanta que nada está sobreposto de forma óbvia.

**Para Nível 5 (briefing futuro):** os IDs `seed_lvl4_a/b/c` serão **substituídos** por `plant_stage3_lvl5_a/b/c`. Estruture o `WORLD_LAYOUT` e o tipo `Reward` para suportar substituição (o Nível 3 já fez isso ao substituir `sprout_lvl2` por `grown_sprout_lvl3`, e agora o Nível 4 faz de novo ao substituir `grown_sprout_lvl3` por `mini_tree_lvl4`). NÃO crie agora os assets do Nível 5.

---

## Escopo de execução

### Frontend (React Native / Expo)

**Arquivos a modificar/criar:**

1. **`lib/levels/index.ts`** — adicionar configuração do Nível 4 ao array/objeto de níveis. Estrutura sugerida (manter consistência com Níveis 1-3 já existentes — inspecionar o código real antes de seguir esta sugestão):

```typescript
{
  id: 4,
  title: "Plantar três sementes",
  description: "Vá pela direita, desça, e volte pela esquerda. Plante em cada parada.",
  worldType: "grid_2d",
  grid: {
    rows: 4,
    cols: 4,
    avatarStart: { row: 0, col: 0 },
    obstacles: [
      { row: 1, col: 0, type: "rock" },
      { row: 2, col: 0, type: "rock" },
      { row: 1, col: 1, type: "rock" },
      { row: 1, col: 2, type: "rock" },
      { row: 2, col: 1, type: "rock" },
      { row: 2, col: 2, type: "rock" }
    ],
    plantableCells: [
      { row: 0, col: 3, id: "C1" },
      { row: 3, col: 3, id: "C2" },
      { row: 3, col: 0, id: "C3" }
    ]
  },
  availableBlocks: ["move_right", "move_left", "move_up", "move_down", "plant"],
  successCondition: "all_plantable_cells_planted",
  rewards: [
    // Operação de SUBSTITUIÇÃO (igual padrão do Nível 3):
    { type: "world_element_replace", removeId: "grown_sprout_lvl3", addId: "mini_tree_lvl4", asset: "mini_tree" },
    // Operações de ADIÇÃO:
    { type: "world_element_add", id: "seed_lvl4_a", asset: "seed_stage1" },
    { type: "world_element_add", id: "seed_lvl4_b", asset: "seed_stage1" },
    { type: "world_element_add", id: "seed_lvl4_c", asset: "seed_stage1" },
    { type: "world_element_add", id: "flower_lvl4", asset: "flower_decorative" }
  ],
  successText: "Você reparou que fez quase a mesma coisa três vezes? Andar pra um lado e plantar. Andar pra outro lado e plantar. Andar pra outro lado e plantar. Programar é assim mesmo — às vezes a gente repete. No próximo nível você vai descobrir um jeito mais esperto de fazer isso."
}
```

(O formato acima é sugestão — ajuste pra schema real do projeto. Inspecione `lib/levels/index.ts` antes de inventar campos. Se o Nível 3 usou outra nomenclatura pra "substituir elemento do Mundo" — ex: `type: "world_element"` com flag `replaces: "..."` — siga a nomenclatura existente. NÃO reinvente a estrutura.)

2. **`lib/interpreter/blocks.ts`** — garantir que `move_left` está registrado como tipo de bloco. Se já existe (desde Nível 3 a estrutura suporta `move_right`, `move_up`, `move_down`), apenas confirmar que `move_left` segue a mesma forma. NÃO refatorar blocos existentes.

3. **`lib/interpreter/interpreter.ts`** — confirmar que o interpretador trata `move_left` (coluna −1 com check de bounds e de obstáculo). Se a lógica já existe pra `move_right`, espelhar pra `move_left`.

4. **`components/level/BlockPalette.tsx`** ou equivalente — garantir que a paleta do Nível 4 exibe os 5 blocos especificados, com ícone do `move_left` (seta curva pra esquerda) seguindo o padrão do Style Guide visual (categoria movimento = azul-rio #5B8AA6).

5. **`app/world.tsx`** — duas operações:
   - **Substituir** `grown_sprout_lvl3` por `mini_tree_lvl4` no `WORLD_LAYOUT`. Posicionar a mini-árvore mais ao fundo da cena que o broto crescido estava (princípio narrativo: "abrir espaço pra novas plantas na frente").
   - **Adicionar** 3 sementes (estágio 1) + 1 flor decorativa em posições placeholder. Gui fará calibração visual depois.

6. **Lógica de recompensas** — após Nível 4 ser marcado como completo, executar AS DUAS operações no estado do Mundo (substituir broto crescido + adicionar 4 novos elementos). Persistir no AsyncStorage e em Supabase via sync.

### Backend (Supabase)

Sem mudanças de schema previstas. A tabela de `world_state` já deve suportar adicionar/substituir elementos via JSON ou registros separados (verificar como os Níveis 1-3 estão persistindo recompensas e seguir o mesmo padrão — o Nível 3 já fez substituição de elemento, então a operação está suportada).

Se a estrutura atual de `rewards` não suportar substituição (`replace`/`removeId`) ou múltiplos elementos por nível (`elements[]`), confirmar com o Gui antes de fazer qualquer alteração de schema.

### Assets

**Asset NOVO necessário (a ser criado pelo Gui antes ou durante a implementação):**
- **`mini_tree_lvl4.png`** — mini-árvore (estágio de evolução do `grown_sprout_lvl3`). Gui está providenciando via Gemini/Canva conforme prompt já preparado. Se ainda não estiver disponível quando você for implementar, use placeholder visual (quadrado verde com label, ou `grown_sprout_lvl3` em escala maior) e mencione no Relatório de Execução.
- **Ícone do bloco `move_left`**: seta curva pra esquerda, seguindo padrão visual dos outros ícones de movimento (estilo, tamanho, cor). Categoria movimento = azul-rio #5B8AA6 (do Style Guide v6.3). Mesma observação: se Gui não providenciou ainda, use placeholder e mencione no Relatório.

**Assets reusados (já existentes no projeto):**
- Pedra (asset do Nível 3)
- Canteiro (asset dos Níveis 1, 2, 3)
- Avatar do jogador (já configurado no onboarding)
- Mascote (acompanha o avatar)
- Semente estágio 1 (asset do Nível 1) — reusar 3 vezes pras 3 sementes novas
- Flor decorativa (asset do Nível 3) — reusar pra `flower_lvl4`

Se algum desses assets não estiver disponível, perguntar ao Gui antes de criar.

### Build/Validação local

- Após implementar, rode `npx expo start` localmente pra validar que o app sobe sem crash.
- Verifique no console se há warnings/erros relacionados ao Nível 4.
- NÃO gere APK EAS pra esta entrega — Gui testa via Fast Refresh ou Expo Go no celular.
- Você pode testar a lógica do interpretador sem o app rodar, escrevendo um script de teste rápido se julgar útil (não obrigatório).

---

## Critérios de aceite

1. Nível 4 aparece no fluxo do jogo após conclusão do Nível 3.
2. Grade 4×4 renderiza corretamente, com avatar em (0,0), 3 canteiros em (0,3), (3,3), (3,0), e 6 pedras nas posições especificadas.
3. Paleta exibe 5 blocos: `move_right`, `move_left`, `move_up`, `move_down`, `plant`. Ícone do `move_left` está visualmente alinhado com os outros.
4. Solução de 12 blocos `[→][→][→][🌱][↓][↓][↓][🌱][←][←][←][🌱]` executa com sucesso e termina o nível.
5. Tentativa de `move_down` como primeiro bloco resulta em mensagem de erro contextual ("Hmm, tem uma pedra aí…") e avatar volta à posição inicial.
6. Tentativa de `move_up` como primeiro bloco resulta em mensagem de erro contextual ("Esse lado não dá…") e avatar volta à posição inicial.
7. Tentativa de `plant` sem estar em canteiro resulta em mensagem de erro contextual.
8. Após sucesso, tela de resumo do nível exibe o texto especificado na seção "Texto de conclusão do nível".
9. Após sucesso, Mundo permanente é atualizado:
   - Broto crescido (`grown_sprout_lvl3`) é substituído por mini-árvore (`mini_tree_lvl4`), posicionada mais ao fundo da cena.
   - 3 sementes (estágio 1) com IDs `seed_lvl4_a/b/c` aparecem na frente, perto uma da outra.
   - 1 flor decorativa (`flower_lvl4`) é adicionada em posição livre.
   - Nenhum elemento sobreposto de forma óbvia com elementos dos Níveis 1, 2, 3.
10. Níveis 1, 2 e 3 continuam funcionando exatamente como antes (princípio de não-retroatividade).
11. Estado do Mundo persiste após fechar e reabrir o app (AsyncStorage + sync Supabase).

---

## O que NÃO fazer

1. **Não inventar mecânicas não especificadas.** Sem bloco de loop, sem contadores, sem decisões morais, sem rotação do avatar.
2. **Não refatorar Níveis 1, 2, 3.** Princípio de não-retroatividade. Se a estrutura atual obriga refator pra adicionar Nível 4, PARE e pergunte ao Gui.
3. **Não alterar o texto de conclusão do nível.** Está calibrado pedagogicamente.
4. **Não criar assets do Nível 5** (plantinhas estágio 3 etc.). Esse é briefing futuro.
5. **Não calibrar pixel perfect** as posições das 3 sementes e 1 flor no Mundo. Gui faz isso depois. Só garanta que não há conflito visual óbvio com elementos existentes.
6. **Não introduzir referencial relativo ao avatar nos movimentos.** Tudo absoluto, ponto de vista do usuário.
7. **Não tomar decisões de produto sozinho.** Se algo ambíguo no briefing, pergunte ao Gui antes de implementar (NÃO chute).
8. **Não pular a documentação textual** (regra 11 do Protocolo). Ver seção "Documentação esperada" abaixo.
9. **Não fazer commits gigantes monolíticos.** Quebre em commits lógicos (interpretador, levels config, world layout, paleta, docs).

---

## Documentação esperada

Após implementação, atualizar os seguintes arquivos `.md` no projeto:

1. **`docs/LEVELS.md`** — adicionar entrada do Nível 4 com:
   - Descrição da mecânica
   - Layout da grade (texto ASCII como o deste briefing)
   - Blocos disponíveis
   - Solução-alvo
   - Recompensas adicionadas ao Mundo
   - Texto de conclusão

2. **`docs/INTERPRETER.md`** — confirmar/adicionar que `move_left` é suportado, com bounds-check e check de obstáculo. Se já estava na lista por implementação anterior, só validar.

3. **`docs/ARCHITECTURE.md`** — se houver qualquer decisão estrutural nova (improvável neste nível, mas possível), registrar.

4. **`docs/DECISIONS.md`** — adicionar DUAS entradas cronológicas (a primeira é estratégica, a segunda é técnica do nível):

```
[YYYY-MM-DD] Decisão estratégica: Mundo permanente é narrativa visual, não decoração.

O Mundo permanente (Tela Mundo) não é uma vitrine de troféus, é a HISTÓRIA do
projeto sendo contada visualmente, em paralelo ao gameplay. Cada nível
concluído adiciona elementos que dão a sensação contínua de que o jardim
está crescendo, florescendo, ficando mais vivo.

Os elementos do Mundo não precisam ter coerência ficcional perfeita entre
si (uma planta pode "mudar de posição" entre níveis sem explicação). O que
importa é a sensação geral de progresso e vida se expandindo.

Esboço do roadmap visual (sujeito a refinamento em sessão dedicada):
- Níveis 1-3: foco em uma planta individual crescendo (já implementado).
- Níveis 4-6: expansão da paisagem. Árvore central + várias plantinhas + flores. Primeiros sinais de fauna.
- Níveis 7-9: floresta diversa. Frutos, mais animais. Auge do jardim.
- Nível 10: serpente entra (briefing futuro define mecânica).

Cosmovisão cristã embutida, nunca explícita: o arco geral (jardim → quebra
→ restauração) é a estrutura narrativa, sem que nenhum texto do app
mencione Bíblia ou narrativas bíblicas. Esta é a TESE CENTRAL do Norte Code.

Esta decisão governa todas as futuras escolhas de recompensas no Mundo
permanente. Sessão dedicada ao Roadmap Visual completo será feita após
o Nível 4 entregue.
```

```
[YYYY-MM-DD] Decisão técnica: Nível 4 introduz move_left + sequência longa sem loop.

Justificativa pedagógica: o Nível 4 foi desenhado como par pedagógico com o
Nível 5 ("necessidade antes da ferramenta"). A criança sente o cansaço da
repetição manual aqui pra que o bloco repeat do Nível 5 seja sentido como
alívio. A grade 4x4 com 6 pedras força caminho único (U em sentido horário)
pra que a transição Nível 4 → Nível 5 transforme exatamente uma solução.
Paleta inclui move_up mesmo não sendo necessário, como "trap pedagógico"
(criança aprende que nem todo bloco serve em toda situação).

Justificativa visual: o Nível 4 é o PRIMEIRO nível de expansão visual do
jardim no Mundo permanente. A planta principal (broto crescido do Nível 3)
evolui pra mini-árvore, e 3 sementes novas + 1 flor decorativa são
adicionadas. No Nível 5, as 3 sementes serão regadas e virarão plantinhas
estágio 3 (+2 flores adicionais).
```

---

## Relatório de Execução (obrigatório ao final — preencha e entregue ao Gui)

Quando terminar a implementação, gere o seguinte relatório em markdown e entregue ao Gui (no chat ou como arquivo). Sem o relatório, a entrega é considerada incompleta.

```
Relatório de Execução: Claude Code -> Claude (Estrategista)
Projeto: Norte Code

Demanda executada: Implementação do Nível 4 — sequência longa + move_left

O que foi implementado:
[Descrição feature por feature do que foi feito.]

Decisões técnicas tomadas (fora do briefing):
[Qualquer decisão que você precisou tomar sozinho durante a execução.
Incluir justificativa. Tambem registrar em DECISIONS.md.]

Arquivos alterados:
- [lista com path + descrição curta da mudança em cada um]

Commits feitos (no main):
- [SHA] [mensagem do commit]
- [SHA] [mensagem do commit]
...

Critérios de aceite — Status:
1. [x] Nível 4 aparece no fluxo após Nível 3 — OK
2. [x] Grade 4x4 renderiza corretamente — OK
3. [x] Paleta exibe 5 blocos — OK
4. [x] Solução de 12 blocos executa com sucesso — OK
5. [x] Erro contextual em move_down inicial — OK
6. [x] Erro contextual em move_up inicial — OK
7. [x] Erro contextual em plant sem canteiro — OK
8. [x] Texto de conclusão correto — OK
9. [x] Mundo permanente atualizado com 3 sementes + 1 flor — OK
10. [x] Níveis 1-3 não afetados — OK
11. [x] Persistência funciona — OK

Validações técnicas executadas (o que você conseguiu validar sem o app no celular):
- [Ex: rodou npx expo start sem erros; testou lógica do interpretador
  com script de teste; validou que move_left respeita bounds; etc.]

Nota de escopo: o teste no celular (sensação de uso, validação visual em
dispositivo real, calibração de posições no Mundo) é responsabilidade do
Gui no Passo 7 do Protocolo. Você não preenche esse campo.

Documentação atualizada:
- LEVELS.md: adicionado Nível 4
- INTERPRETER.md: confirmado suporte a move_left
- DECISIONS.md: adicionada entrada do dia
- ARCHITECTURE.md: [se aplicável]

Pontos de atenção para validação do Gui:
- [Áreas que merecem atenção especial no teste — ex: "a posição da flor
  decorativa no Mundo pode estar muito próxima da flor do Nível 3,
  recomenda ajuste fino"]
- [Edge cases descobertos durante a implementação]
- [Tradeoffs feitos que valem revisão futura]
```

---

## Resumo curto

- Você é o Dev Temporário (Cenário A — local + git).
- Tarefa: implementar Nível 4 (sequência longa com 12 blocos + introdução do `move_left`).
- Grade 4×4, avatar em (0,0), 3 canteiros e 6 pedras em posições exatas (ver tabela).
- Paleta tem 5 blocos. `move_left` é o novo. `move_up` está lá como trap pedagógico.
- Recompensa no Mundo: SUBSTITUIR broto crescido (Nível 3) por mini-árvore + ADICIONAR 3 sementes (reuso do asset do Nível 1) + 1 flor decorativa (reuso do asset do Nível 3). Posições placeholder — Gui calibra depois.
- Assets novos esperados do Gui: `mini_tree_lvl4.png` e ícone do `move_left`. Se ainda não estiverem disponíveis, use placeholders e sinalize no Relatório.
- Texto de conclusão é fixo e não-negociável.
- Commit direto no `main`. Conventional Commits. Quebre em commits lógicos.
- Documentação obrigatória nos 4 `.md` (LEVELS, INTERPRETER, ARCHITECTURE se aplicável, DECISIONS com DUAS entradas). Relatório de Execução obrigatório no fim.
- Em qualquer dúvida: PARE e pergunte ao Gui. Não chute.
