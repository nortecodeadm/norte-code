# Briefing de Execução — Nível 7 (Passo 4 do Protocolo)

**Projeto:** Norte Code
**De:** Claude (Estrategista)
**Para:** Claude Code (Dev Temporário — Cenário A do Protocolo)
**Via:** Gui
**Data:** Maio/2026

---

## Antes de começar — Leitura obrigatória

1. **Leia o `docs/internal/NORTECODE_Protocolo_Dev_Temporario.md` (v1.1)** — define seu papel e o cenário operacional (Cenário A).
2. **Leia o `docs/internal/NORTECODE_Protocolo_Colaboracao_IAs.md`** — fluxo geral e regras de não-retroatividade.
3. **Leia o `docs/internal/NORTECODE_Briefing_MVP.md` (atualmente v2.11)** — visão completa atualizada. Em especial: Seção 10 (Estado Atual de Implementação) e a entrada do Nível 7 dentro da Seção 4.7.
4. **Leia o `docs/internal/NORTECODE_Style_Guide_Visual.md` (v1.3)** — referência visual.
5. **Inspecione o código existente** — em especial o que foi feito no Nível 6 (bloco condicional sólido único, campo `conditionResult` em `ExecutionStep`, padrões visuais de blocos: `getContrastTextColor`, borda no wrapper, legenda adaptativa do mapa). Foco em `lib/levels/index.ts`, `lib/interpreter/blocks.ts`, `lib/interpreter/interpreter.ts`, `lib/interpreter/world-state.ts`, `components/level/BlockPalette.tsx`, `components/level/ProgramArea.tsx`, `components/level/LevelScene.tsx`, e `app/world.tsx`.

Se algo neste briefing conflitar com o código existente, **PARE e pergunte ao Gui antes de prosseguir**. Não chute.

---

## Estratégia de execução (Cenário A — você roda local)

- Filesystem do projeto + git CLI no Windows do Gui.
- Repo: `https://github.com/nortecodeadm/norte-code`. Último estado conhecido: ciclo do Nível 6 fechado.
- **Commits direto no `main`.** Sem branch, sem PR. Quebrar em commits lógicos.
- Antes de começar: `git pull origin main`.
- Conventional Commits.
- Não commitar `.env` ou credenciais.
- Pode rodar `npx expo start` localmente pra validar que o app sobe. Não gere APK EAS.

---

## Demanda

Implementar o **Nível 7** do MVP: introduzir o conceito de **condicional com 2 ramos (if/else)** através de um bloco "tudo em um" (`if_canteiro_com_semente_then_regar_else_if_canteiro_vazio_then_plantar`). O nível ensina **discernimento amadurecido** — a criança não só decide "fazer ou não fazer" como no Nível 6, ela **escolhe entre 2 ações** dependendo do contexto da célula.

---

## Decisão tomada (contexto e razões)

### Posição do Nível 7 no roadmap

Após Nível 6 (condicional simples — agir ou não agir), o Nível 7 amadurece o conceito: **2 ramos de ação possíveis**. É o quarto conceito de programação do MVP, e o último de "discernimento" antes do Nível 8 introduzir variável.

### Por que bloco "tudo em um" (consistente com Nível 6)

Mantém o padrão estabelecido: bloco sólido único, sem slot interno. Comportamento embutido: SE célula tem canteiro com semente ENTÃO rega; SENÃO SE canteiro vazio ENTÃO planta. SENÃO ignora (passa em branco).

Razões:
- Consistência com Nível 6 (criança já entende "blocos condicionais existem e funcionam assim").
- Princípio "uma virada por nível" — Nível 7 introduz **2 ramos**, não "construir condicional do zero com slots".
- Reduz carga cognitiva.

### Por que `seed` em vez de "planta seca"

Decisão tomada na sessão de alinhamento: reusar o `CellContent` existente (`seed`) em vez de criar estado novo "planta seca". O conceito é literalmente "canteiro com semente que precisa ser regada pra evoluir". Mais simples, sem novo asset, sem novo estado.

A criança vê:
- Canteiro vazio (`flowerbed`) → planta
- Canteiro com semente (`seed`) → rega

Não há necessidade de "murcha" ou "secura" — a semente recém-plantada está esperando água pra brotar. Coerente com o ciclo natural já estabelecido pelos Níveis 1-2 (plantar → regar → cresce).

### Por que cenário 1×6 (mesmo tamanho do Nível 6)

Manter familiaridade visual. O conceito novo é if/else, não cenário novo. Distribuição calibrada: `[Avatar][CP][CV][CP][CV][CP]` — 3 CPs (regar) + 2 CVs (plantar), forçando criança a usar ambos os ramos várias vezes.

### Princípio narrativo do Mundo permanente

O Nível 7 marca a evolução visual da planta principal — a árvore jovem (`young_tree_lvl5`) vira árvore frutífera (`fruit_tree_lvl7`). Asset estático (sem versão parcialmente colhida — decisão prévia simplificadora). Também entra a **segunda fauna** do MVP: 2 esquilos. Um deles brota da cavidade do tronco caído com flor (asset combinado especial).

Coerência narrativa com "elementos antigos viram parte da paisagem permanente" — o tronco caído agora não só tem flor (sinal de vida vegetal), como **abriga vida animal** (esquilo morando dentro). A simbologia "vida vencendo o que parecia morto" amadurece.

---

## Especificação completa do Nível 7

### Estrutura do mundo do nível

- **Tipo:** grade 1×6 linear (1 linha × 6 colunas)
- **Posição inicial do avatar:** (linha 0, coluna 0) — célula mais à esquerda

### Layout da grade

```
Coluna:     0          1        2          3        4          5
Conteúdo: [AVATAR]   [CP]    [CV]       [CP]    [CV]       [CP]
```

Onde:
- `AVATAR` = posição inicial, célula sem canteiro (apenas chão)
- `CP` = canteiro com semente já plantada (`CellContent: "seed"`) — precisa ser regada
- `CV` = canteiro vazio (`CellContent: "flowerbed"`) — precisa ser plantada

### Estado das células visível antes da execução

Crítico: criança vê estado de TODAS as células ANTES de executar — igual ao Nível 6.

Reusar exatamente os mesmos visuais do Nível 6:
- **AVATAR / chão simples:** sem canteiro, só piso
- **CV:** asset de canteiro vazio (terra fofa, sem semente — `CellContent: "flowerbed"`)
- **CP:** asset de canteiro com semente plantada visível (`CellContent: "seed"`)

A distinção visual entre CV e CP é a mesma que já existe — não introduz asset novo. **Item 14 do BACKLOG** sinaliza que vale revisitar essa distinção visualmente algum dia, mas NÃO é escopo do Nível 7.

### Paleta de blocos disponíveis

3 blocos:

| ID do bloco | Label visível (PT-BR) | Categoria | Cor |
|---|---|---|---|
| `move_right` | Direita | Movimento | azul atual (`#4A90D9`) |
| `if_canteiro_com_semente_then_regar_else_if_canteiro_vazio_then_plantar` | Se com semente, regar; senão se vazio, plantar | Controle/Condicional | **Roxo claro `#A88FD9`** (mesma cor do `if_canteiro_vazio_then_plantar` do Nível 6 — categoria visual coerente) |
| `repeat_5` | Repetir 5× | Controle/Loop | Laranja atual (`#E8853D`) |

**`move_left`, `move_up`, `move_down` NÃO entram** — não são necessários, adicionariam ruído.
**`plant` e `water` simples NÃO entram isoladamente** — a única forma de plantar/regar é via o bloco condicional. Esse é o ponto pedagógico do nível.
**`if_canteiro_vazio_then_plantar` (do Nível 6) NÃO entra** — paleta é por nível, não acumulativa. No Nível 7, criança usa só o bloco if/else.
**`repeat_3` (do Nível 5) NÃO entra** — só `repeat_5`.

### O bloco if/else (visual e comportamento)

**ID técnico (sugestão):** `if_seed_then_water_else_if_flowerbed_then_plant` ou variante mais curta que faça sentido no padrão do código existente. Reusar nomenclatura próxima ao `if_canteiro_vazio_then_plantar` do Nível 6 pra coerência. **PARE e pergunte ao Gui** se quiser usar nome diferente do sugerido.

**Visual:**
- Bloco sólido único (igual ao do Nível 6).
- Cor: roxo claro `#A88FD9` (mesmo do Nível 6).
- Label de texto dentro do bloco: **"Se com semente, regar; senão se vazio, plantar"** (texto literal).
- **Ícone (opcional pra UX):** pode usar combinação tipo `🌱💧 / ⭕🌱` ou similar, se houver espaço visual. Não é obrigatório — texto literal já é o suficiente.

**Mecânica de adição ao programa:**
- Igual a todos os blocos sem filhos: criança tapa nele na paleta → adicionado ao programa.
- **SEM modo de edição** (igual ao Nível 6).

**Comportamento durante execução:**
- Quando o interpretador encontra este bloco, verifica o estado da célula ATUAL do avatar:
  - Se `cell.content === "seed"` (CP): executa ação `water` (transforma `"seed"` → `"sprout"`, igual fluxo existente nos Níveis 1-5 quando water é aplicado em seed). Emite step com `conditionResult: "water"`.
  - Se `cell.content === "flowerbed"` (CV): executa ação `plant` (transforma `"flowerbed"` → `"seed"`). Emite step com `conditionResult: "plant"`.
  - Caso contrário (`"empty"` ou outro): não faz nada, emite step com `conditionResult: "none"`.

### Feedback visual durante execução

O campo `conditionResult` em `ExecutionStep` foi introduzido no Nível 6 como `boolean` (true/false). **PRECISA SER EXPANDIDO** pra suportar 3 estados no Nível 7.

**Decisão:** trocar tipo de `conditionResult` de `boolean` pra `string | undefined` (ou enum equivalente). Valores possíveis:
- `"plant"` → plantou (ramo "senão se vazio então plantar" executou) → bloco pulsa **verde** `#5D8A3C` (cor do plant — mesma do Nível 6)
- `"water"` → regou (ramo "se com semente então regar" executou) → bloco pulsa **azul-rio** `#5B8AA6` (cor do regar, do Style Guide v1.3)
- `"none"` → nenhum ramo executou → bloco pulsa **cinza claro** `#BDBDBD` (mesma do Nível 6)
- `undefined` → bloco não é condicional → comportamento atual preservado

**Atenção à compatibilidade retroativa do Nível 6:**
O Nível 6 usa o campo `conditionResult` com valores `true | false`. Tem 2 caminhos:

**(A) Migração**: trocar `true → "plant"` e `false → "none"` no interpretador do Nível 6. Renderização do Nível 6 passa a tratar string em vez de boolean. Mais limpo, sem dívida técnica.

**(B) Coexistência**: campo aceita `boolean | string | undefined`. Renderização tem `if (typeof === "boolean") ... else ...`. Mais defensivo, sem refator do Nível 6.

**Recomendação: (A) migração.** Mais limpo. O Nível 6 só usa o campo internamente, então a mudança é contida — não há persistência externa de `conditionResult` que sofra retroatividade. Mas **PARE e pergunte ao Gui se houver risco escondido** ao inspecionar o código.

### Solução-alvo (3 blocos visíveis, 2 dentro do repeat)

```
[Repetir 5× [
  move_right,
  if_canteiro_com_semente_then_regar_else_if_canteiro_vazio_then_plantar
]]
```

Contagem (regra estabelecida desde Nível 5):
- Repeat = 1
- move_right (dentro) = 1
- if/else (dentro) = 1
- **Total: 3 blocos**

Mesma elegância do Nível 6. Diferença pedagógica: a criança usa um bloco mais sofisticado dentro do mesmo "esqueleto".

### `maxBlocks`

`maxBlocks: 12`.

Justificativa:
- Solução elegante: 3 blocos.
- Solução longa sem `repeat_5` (5 iterações manuais de `[move_right, if/else]`): 10 blocos.
- Margem de 2 sobre a solução longa (mesma proporção do Nível 6).

Comentar no código (mesmo padrão do Nível 5).

### Validação de sucesso

`successCondition`: ao final da execução, **todas as células do grid devem estar em estado `"sprout"` ou superior** (ou seja: CP regados viraram sprouts; CV plantados viraram seeds e... não há tempo de regar no mesmo programa, então CV viraram seeds).

**Atenção:** o estado final correto é:
- Coluna 1 (CP original): `"sprout"` (foi regado)
- Coluna 2 (CV original): `"seed"` (foi plantado)
- Coluna 3 (CP original): `"sprout"` (foi regado)
- Coluna 4 (CV original): `"seed"` (foi plantado)
- Coluna 5 (CP original): `"sprout"` (foi regado)

Então `successCondition` custom: verificar que colunas 1/3/5 viraram `"sprout"` E colunas 2/4 viraram `"seed"`. Mesmo padrão do Nível 6 (custom explícito em vez de heurística genérica).

### Mensagens de erro contextuais

Reusar mensagens existentes onde aplicável:

| Situação | Mensagem |
|---|---|
| Avatar tenta sair da grade | "Esse lado não dá. O caminho continua em outra direção." (mesma do Nível 4-6) |
| Criança colocou só o bloco condicional sem `move_right` | "O avatar precisa andar pra encontrar canteiros. Use o bloco Direita." (heurística `didnt_move` do Nível 6) |
| Programa termina sem regar/plantar todas as células corretas | (mensagem genérica de "ainda há trabalho a fazer") |

Nada de novo neste front.

### Texto de conclusão do nível

> "Agora você sabe escolher entre dois caminhos. Cuidar é responder ao que cada coisa precisa — não tratar tudo igual. Lembra disso — vai ser muito importante mais pra frente."

Texto literal, não negociável. Frase final ("vai ser muito importante mais pra frente") é o princípio de "ferramentas antecipadas".

### Recompensas no Mundo permanente

Após sucesso no Nível 7, atualizar `world_state` com **múltiplas operações**:

**Operação 1 — Substituir a árvore principal (cadeia da planta original):**
- Remover `young_tree_lvl5` (árvore jovem).
- Adicionar `fruit_tree_lvl7` (árvore frutífera) na mesma posição.
- Asset: `mundo_arvore_frutifera.png` — **AINDA NÃO foi gerado pelo Gui**. Sinalize no Relatório se não estiver disponível e use placeholder (ex: `mundo_arvore_jovem.png` em escala maior, ou quadrado verde com label "ÁRVORE FRUTÍFERA"). Gui substitui depois.
- Cadeia de substituição estendida: `seed_lvl1 → sprout_lvl2 → grown_sprout_lvl3 → mini_tree_lvl4 → young_tree_lvl5 → fruit_tree_lvl7`. Atualize `app/world.tsx` pra refletir a nova ponta da cadeia.

**Operação 2 — Substituir o tronco caído por versão com esquilo:**
- Remover `fallen_log_with_flower_lvl5` (tronco caído com flor).
- Adicionar `fallen_log_with_flower_and_squirrel_lvl7` na mesma posição/rotação.
- Asset: `mundo_tronco_com_flor_e_esquilo.png` ✅ (já está em `assets/mundo/`).
- Mesmo padrão de substituição já estabelecido pro tronco no Nível 5.

**Operação 3 — Adicionar 1 esquilo no chão:**
- Asset: `mundo_esquilo.png` ✅ (já está em `assets/mundo/`).
- ID: `squirrel_lvl7_ground`.
- Posição: placeholder (Gui calibra depois — provavelmente perto da base da árvore frutífera).
- 1 instância apenas (o esquilo do tronco é o "segundo esquilo" via Operação 2).

**Operação 4 — Adicionar 4 flores brancas com matinho:**
- Asset: `mundo_flor_branca.png` ✅ (já está em `assets/mundo/` — flor branca com tufos de grama na base).
- 4 instâncias do mesmo asset, em posições placeholder espalhadas pelo jardim. Gui calibra.
- IDs: `white_flower_lvl7_a/b/c/d`.

**3 mini-árvores do Nível 6 NÃO mudam neste nível.** Mantêm posição.
**2 pássaros do Nível 6 NÃO mudam.**
**3 flores amarelas do Nível 6 NÃO mudam.**
**Background do Mundo NÃO muda.** Continua v2 (substituição pra v3 fica reservada pro Nível 8).

---

## Escopo de execução

### Frontend (React Native / Expo)

**Arquivos a modificar/criar (inspecionar como o Nível 6 foi feito e seguir os padrões):**

1. **`lib/levels/index.ts`** — adicionar `createLevel7()` e incluir em `LEVELS`. Estrutura sugerida:

```typescript
{
  id: 7,
  title: "Cuidar de jeitos diferentes",
  description: "Use o bloco 'Se com semente, regar; senão se vazio, plantar' dentro do Repetir. Cuide do que cada canteiro precisa.",
  worldType: "grid_1d", // ou "grid_2d" com rows: 1, conforme schema
  grid: {
    rows: 1,
    cols: 6,
    avatarStart: { row: 0, col: 0 },
    cells: [
      { row: 0, col: 0, type: "ground" },     // Avatar (chão)
      { row: 0, col: 1, type: "seed" },        // CP
      { row: 0, col: 2, type: "flowerbed" },   // CV
      { row: 0, col: 3, type: "seed" },        // CP
      { row: 0, col: 4, type: "flowerbed" },   // CV
      { row: 0, col: 5, type: "seed" },        // CP
    ]
  },
  availableBlocks: [
    "move_right",
    "if_canteiro_com_semente_then_regar_else_if_canteiro_vazio_then_plantar",
    "repeat_5"
  ],
  successCondition: "custom",
  maxBlocks: 12,
  rewards: [
    // Operação 1 — substituir árvore principal
    {
      type: "world_element_replace",
      removeId: "young_tree_lvl5",
      addId: "fruit_tree_lvl7",
      asset: "mundo_arvore_frutifera"
    },
    // Operação 2 — substituir tronco
    {
      type: "world_element_replace",
      removeId: "fallen_log_with_flower_lvl5",
      addId: "fallen_log_with_flower_and_squirrel_lvl7",
      asset: "mundo_tronco_com_flor_e_esquilo"
    },
    // Operação 3 — adicionar esquilo no chão
    {
      type: "world_element_add",
      id: "squirrel_lvl7_ground",
      asset: "mundo_esquilo"
    },
    // Operação 4 — adicionar 4 flores brancas
    { type: "world_element_add", id: "white_flower_lvl7_a", asset: "mundo_flor_branca" },
    { type: "world_element_add", id: "white_flower_lvl7_b", asset: "mundo_flor_branca" },
    { type: "world_element_add", id: "white_flower_lvl7_c", asset: "mundo_flor_branca" },
    { type: "world_element_add", id: "white_flower_lvl7_d", asset: "mundo_flor_branca" },
  ],
  successText: "Agora você sabe escolher entre dois caminhos. Cuidar é responder ao que cada coisa precisa — não tratar tudo igual. Lembra disso — vai ser muito importante mais pra frente."
}
```

(Formato sugerido — ajustar pra schema real. Se algo divergir do schema atual, **PARE e pergunte ao Gui antes de modificar o schema**.)

2. **`lib/interpreter/blocks.ts`** — registrar tipo novo:
   - `if_canteiro_com_semente_then_regar_else_if_canteiro_vazio_then_plantar` (categoria condicional, cor `#A88FD9`).

3. **`lib/interpreter/interpreter.ts`** — adicionar case para o bloco if/else:
   - Verificar `cell.content` na posição atual do avatar.
   - Se `"seed"` → ação `water` (reusar lógica existente desde Nível 2) + emite step `conditionResult: "water"`.
   - Se `"flowerbed"` → ação `plant` (reusar lógica existente) + emite step `conditionResult: "plant"`.
   - Caso contrário → no-op + emite step `conditionResult: "none"`.

4. **`lib/interpreter/world-state.ts`** — **MIGRAR** o campo `conditionResult` em `ExecutionStep`:
   - Antes: `conditionResult?: boolean`
   - Depois: `conditionResult?: "plant" | "water" | "none"` (ou `string`)
   - Migrar comportamento do Nível 6 (que usa `boolean`) pra usar o tipo string novo.
   - **CRÍTICO:** garantir que o Nível 6 continue funcionando após a migração. Testar manualmente o Nível 6 antes de commitar.

5. **`components/level/BlockPalette.tsx`** — adicionar entrada do bloco if/else:
   - Cor: `#A88FD9`
   - Label: "Se com semente, regar; senão se vazio, plantar"

6. **`components/level/ProgramArea.tsx`** — atualizar lógica de glow:
   - Mapeamento `conditionResult` → cor:
     - `"plant"` → verde `#5D8A3C` (plant)
     - `"water"` → azul-rio `#5B8AA6` (regar)
     - `"none"` → cinza claro `#BDBDBD`
     - `undefined` → comportamento atual

7. **`components/level/LevelScene.tsx`** — provavelmente sem mudanças (legenda adaptativa do Nível 6 já trata `flowerbed` + `seed`). Confirmar que funciona bem com o Nível 7 também.

8. **`app/world.tsx`** — operações:
   - **Substituir** `young_tree_lvl5` por `fruit_tree_lvl7` (cadeia da planta principal).
   - **Substituir** `fallen_log_with_flower_lvl5` por `fallen_log_with_flower_and_squirrel_lvl7`.
   - **Adicionar** 1 esquilo no chão (`squirrel_lvl7_ground`) + 4 flores brancas em posições placeholder. Gui calibra depois.

9. **Lógica de recompensas** — após Nível 7 ser marcado como completo, executar todas as operações no estado do Mundo. Persistir no AsyncStorage e Supabase (mesmo fluxo dos Níveis 4-6).

### Backend (Supabase)

Sem mudanças de schema previstas — exceto possivelmente o tipo do campo `conditionResult` (se houver persistência de steps no banco — verificar).

Se houver risco, **PARE e pergunte ao Gui**.

### Assets

**Assets já gerados pelo Gui (em `assets/mundo/`):**
- `mundo_esquilo.png` ✅
- `mundo_tronco_com_flor_e_esquilo.png` ✅
- `mundo_flor_branca.png` ✅

**Asset ainda NÃO gerado pelo Gui:**
- `mundo_arvore_frutifera.png` — Gui está providenciando. Se não estiver em `assets/mundo/` quando você for implementar, **use placeholder visual** (ex: `mundo_arvore_jovem.png` em escala 1.15, ou um quadrado verde com label "ÁRVORE FRUTÍFERA"). **Mencione no Relatório de Execução** que ficou com placeholder. Gui substitui pelo asset real depois.

**Assets reusados (já existentes):**
- `mundo_passaro_pousado.jpg` (2 pássaros do Nível 6 — mantêm)
- `mundo_flor_amarela.jpg` (3 flores amarelas do Nível 6 — mantêm)
- `mundo_mini_arvore.png` (3 mini-árvores do Nível 6 — mantêm)
- `mundo_arvore_jovem.png` (será substituída pela frutífera; mas o asset em si fica disponível pra placeholder se necessário)

### Build/Validação local

- Após implementar, rode `npx expo start` pra validar que o app sobe sem crash.
- Verifique console pra warnings/erros relacionados ao Nível 7 ou à migração do `conditionResult`.
- **Teste manual do Nível 6** após a migração de `conditionResult: boolean → string`. Se Nível 6 quebrar, **PARE** e me reporte.
- NÃO gere APK EAS — Gui testa via Fast Refresh.

---

## Critérios de aceite

1. Nível 7 aparece no fluxo do jogo após conclusão do Nível 6.
2. Grade 1×6 renderiza com o layout `[Avatar][CP][CV][CP][CV][CP]`. Estado de cada célula visualmente distinto (mesma distinção do Nível 6).
3. Paleta exibe 3 blocos: `move_right` (azul), bloco if/else (roxo, "Se com semente, regar; senão se vazio, plantar"), `repeat_5` (laranja).
4. Criança adiciona o bloco if/else ao programa via tap simples. Sem modo de edição.
5. Solução elegante de 3 blocos executa: avatar percorre as 5 células regando 3 CPs e plantando 2 CVs.
6. Solução longa sem `repeat_5` (10 blocos: 5 iterações manuais de `[Direita, if/else]`) também é aceita.
7. Durante execução:
   - Bloco condicional pulsa **verde** (`#5D8A3C`) quando ramo "plant" executou.
   - Bloco condicional pulsa **azul-rio** (`#5B8AA6`) quando ramo "water" executou.
   - Bloco condicional pulsa **cinza claro** (`#BDBDBD`) quando nenhum ramo executou.
8. Steps emitidos corretamente com `conditionResult: "plant" | "water" | "none"`.
9. Após sucesso, texto de conclusão exibido literalmente, incluindo a frase final "Lembra disso — vai ser muito importante mais pra frente."
10. Mundo permanente atualizado com TODAS as operações:
    - Árvore jovem substituída por árvore frutífera (ou placeholder se asset não disponível)
    - Tronco caído com flor substituído por tronco com flor + esquilo
    - +1 esquilo no chão
    - +4 flores brancas
11. **Nível 6 continua funcionando IDENTICAMENTE após a migração de `conditionResult`** — bloco condicional pulsa verde/cinza como antes. Verificação manual obrigatória.
12. Níveis 1-5 sem regressão.
13. Persistência do Mundo OK após fechar/reabrir app.

---

## O que NÃO fazer

1. **Não inventar mecânicas não especificadas.** Sem variável (Nível 8), sem função (Nível 9).
2. **Não permitir N variável no `repeat_5`.** Hardcoded em 5.
3. **Não criar bloco if/else como envelope com slot.** Sólido único.
4. **Não permitir aninhamento profundo.** if/else dentro de `repeat_5` é OK. Mas NÃO `repeat_5` dentro de if/else (esse não tem filhos).
5. **Não refatorar Níveis 1-6 mais do que o necessário.** A migração de `conditionResult: boolean → string` é a única exceção, com teste obrigatório do Nível 6 antes do commit.
6. **Não alterar o texto de conclusão.** Calibrado.
7. **Não introduzir blocos extras na paleta.** Só os 3 listados.
8. **Não permitir `plant` ou `water` soltos na paleta.** Única forma de agir é via if/else.
9. **Não criar assets do Nível 8+.**
10. **Não calibrar pixel perfect** as posições no Mundo. Gui faz depois.
11. **Não tomar decisões de produto sozinho.** Em dúvida, pergunte.
12. **Não pular documentação textual.**
13. **Não fazer commits gigantes.** Quebre em commits lógicos.

---

## Documentação esperada

Após implementação, atualizar os seguintes `.md`:

1. **`docs/LEVELS.md`** — adicionar entrada completa do Nível 7: layout, blocos, solução, recompensas, texto.

2. **`docs/INTERPRETER.md`** — documentar:
   - Bloco if/else `if_canteiro_com_semente_then_regar_else_if_canteiro_vazio_then_plantar`.
   - **MIGRAÇÃO do campo `conditionResult`** em `ExecutionStep`: de `boolean` pra `string` (`"plant" | "water" | "none"`). Documentar valores possíveis e mapeamento de cores.
   - Atualização do comportamento do bloco do Nível 6 após a migração.

3. **`docs/ARCHITECTURE.md`** — se houver decisão arquitetural nova (ex: padronização de naming pra blocos condicionais com ramos múltiplos).

4. **`docs/DECISIONS.md`** — adicionar entrada cronológica:

```
[YYYY-MM-DD] Decisão técnica: Nível 7 introduz condicional com 2 ramos (if/else) + migração do campo conditionResult.

O bloco if_canteiro_com_semente_then_regar_else_if_canteiro_vazio_then_plantar
é bloco sólido único (igual ao condicional do Nível 6), sem slot
interno. Comportamento embutido: SE célula tem semente ENTÃO rega;
SENÃO SE canteiro vazio ENTÃO planta; SENÃO ignora.

Decisão pedagógica: amadurecer o discernimento. Criança aprende a
escolher entre 2 ações dependendo do contexto. Princípio "uma virada
por nível" — não introduz construção do zero com slots, só conceito
de "2 ramos possíveis".

Reutilização do CellContent existente: "seed" representa CP (precisa
de rega), "flowerbed" representa CV (precisa ser plantado). Não foi
necessário criar novo estado de "planta seca" — o ciclo natural já
estabelecido nos Níveis 1-2 (plantar → regar → cresce) é
reaproveitado.

MIGRAÇÃO do campo conditionResult em ExecutionStep:
- Antes: conditionResult?: boolean (Nível 6)
- Depois: conditionResult?: "plant" | "water" | "none" (Níveis 6 e 7)
- Migração não-retroativa: comportamento do Nível 6 preservado
  (true→"plant", false→"none"). Renderização passa a tratar string.

Glow do bloco condicional durante execução, agora com 3 estados:
- "plant" → verde #5D8A3C (cor do plant, mesma do Nível 6)
- "water" → azul-rio #5B8AA6 (cor do regar, Style Guide v1.3)
- "none" → cinza claro #BDBDBD (mesma do Nível 6)

Recompensas no Mundo: árvore jovem evolui pra árvore frutífera
(substituição na cadeia da planta principal); tronco caído com flor
ganha esquilo morando (substituição); +1 esquilo no chão; +4 flores
brancas com matinho.

Princípio "ferramentas antecipadas" aplicado: texto de conclusão
menciona explicitamente que escolher entre caminhos vai ser
importante mais pra frente (preparação narrativa pro Nível 10).
```

---

## Relatório de Execução (obrigatório ao final)

Mesmo formato dos Níveis 5 e 6:

```
Relatório de Execução: Claude Code → Claude (Estrategista)
Projeto: Norte Code
Demanda executada: Implementação do Nível 7 — condicional if/else (com migração do conditionResult)

O que foi implementado:
[Descrição feature por feature]

Decisões técnicas tomadas (fora do briefing):
[Decisões tomadas sozinho com justificativa. Especialmente:
 estratégia da migração de conditionResult; como ficou o teste de
 regressão do Nível 6; placeholder usado pra árvore frutífera se
 asset não estava disponível]

Arquivos alterados:
- [lista]

Commits feitos (no main):
- [SHA] [mensagem]
...

Critérios de aceite — Status:
1. [x/?] [comentário]
...
13. [x/?] [comentário]

Validações técnicas executadas:
[TypeScript check; teste manual do Nível 6 pós-migração;
 dimensões de assets]

Documentação atualizada:
- LEVELS.md, INTERPRETER.md, DECISIONS.md, ARCHITECTURE.md (se aplicável)

Pontos de atenção pra validação do Gui:
[Áreas pra teste especial, edge cases, regressão Nível 6,
 calibração visual das recompensas]
```

---

## Resumo curto

- Você é Dev Temporário (Cenário A — local + git). Substitui o Manus.
- Tarefa: implementar Nível 7 (if/else) + migrar `conditionResult: boolean → string` no `ExecutionStep`.
- Grade 1×6 linear, `[Avatar][CP][CV][CP][CV][CP]`. Estados visíveis.
- Paleta de 3 blocos: `move_right`, bloco if/else (roxo `#A88FD9`), `repeat_5`.
- Solução elegante: 3 blocos. Solução longa: 10 blocos. `maxBlocks: 12`.
- Bloco if/else é sólido único (igual Nível 6). Adição via tap simples.
- Durante execução: bloco pulsa verde (plant), azul-rio (water), ou cinza (none).
- **MIGRAÇÃO crítica:** `conditionResult` muda de `boolean` pra `string`. Teste regressão do Nível 6 OBRIGATÓRIO.
- Recompensas: árvore jovem → frutífera; tronco substituído por tronco+esquilo; +1 esquilo no chão; +4 flores brancas.
- Asset `mundo_arvore_frutifera.png` AINDA não está em `assets/mundo/` — use placeholder, mencione no Relatório.
- Commit direto no `main`. Conventional Commits. Quebre em commits lógicos.
- Documentação obrigatória nos 4 `.md`.
- Em dúvida: PARE e pergunta. Não chute.
