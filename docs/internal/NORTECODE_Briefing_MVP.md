# Briefing de Execução — MVP do Norte Code (Passo 4 do Protocolo)

**Projeto:** Norte Code — A bússola da lógica e programação para crianças.
**De:** Claude (Estrategista)
**Para:** Dev Temporário ativo (atualmente Claude Code, em substituição ao Manus)
**Via:** Gui
**Data:** Maio/2026
**Versão:** 2.8 — Refinamentos durante implementação do Nível 5.

**Changelog v2.8:**
- Nível 5 ganha mais 2 recompensas no Mundo permanente:
  - Planta principal evolui de mini-árvore pra árvore jovem (era previsto pro Nível 6, antecipado pro 5 pra reforçar o "salto visual forte" do nível).
  - Tronco caído é SUBSTITUÍDO por versão com flor brotando (originalmente seria sobreposição, agora é substituição — mais limpo arquiteturalmente, evita problema de calibração).
- Nível 6 perde a evolução da planta principal como recompensa (já aconteceu no 5). Mantém fauna (pássaro) e plantinhas extras.
- Sequência de estágios da planta principal ajustada — descarta o estágio intermediário "arbusto/planta adulta" que estava na reserva. Vai direto de mini-árvore pra árvore jovem.

**Changelog v2.7:**
- Roadmap completo dos Níveis 5-10 desenhado em sessão dedicada de estratégia.
- Decisões narrativas estruturais registradas: MVP cobre Criação + Tentação + Queda + início da Restauração (NÃO inclui cidade — pós-MVP).
- Princípio "Mundo permanente é narrativa visual" aplicado a todos os níveis.
- Decisão narrativa-chave: a queda no Nível 9 é inevitável (toda criança "cai") — não é punição por escolha errada, é a história sendo contada. Mecânica específica TBD em sessão dedicada antes da implementação.
- Princípio pedagógico "ferramentas antecipadas": cada conceito de programação aprendido nos Níveis 5-8 é apresentado também como ferramenta que a criança vai usar pra restaurar o mundo no Nível 10. Texto de conclusão de cada nível planta essa expectativa.
- Background do Mundo permanente passa a ser substituível por estágio (Nível 5 introduz `background_mundo_v2.png`).
- Fauna entra gradualmente a partir do Nível 6 (1 elemento por nível).
- Árvore frutífera aparece no Nível 7 (antecipando coleta do Nível 8).
- Cenário árido aparece SÓ no Nível 10 — primeira grande mudança ambiental do MVP.

**Changelog v2.6:** (anterior — Nível 4 entregue, Nível 5 redesenhado como par pedagógico).
**Changelog v2.5:** (anterior — consolidação após primeiras semanas de execução).

---

## Contexto pra você, Manus

Este é um **projeto separado do HoloSpot**. Mesma metodologia de colaboração (Protocolo de Colaboração entre IAs v1.3), papéis idênticos: Gui orquestra, Claude decide, você executa e documenta.

**Diferenças críticas em relação ao HoloSpot:**

1. **Stack diferente.** HoloSpot é web (HTML/CSS/JS vanilla + Supabase). Este projeto é **app mobile Android** (Expo + React Native + Supabase + NativeWind).
2. **Confidencialidade total** — projeto secreto, padrão HoloSpot.
3. **Gui também edita código diretamente.** Desde meados de Maio/2026, Gui configurou ambiente local Windows e passou a fazer ajustes visuais/calibração diretamente no código. Isso afeta a divisão de trabalho — ver seção dedicada abaixo.

---

## NOVO: Divisão de trabalho entre Gui e Manus

A partir desta versão do briefing, a divisão é:

**Gui faz diretamente (Fast Refresh local):**
- Calibração visual (posicionamento de elementos no Mundo, ajustes de WORLD_LAYOUT)
- Pequenos ajustes de cor, espaçamento, fontes
- Correção de bugs visuais simples já identificados
- Git pull → mexe → commit → push

**Manus faz (entrega via PR ou commit direto no main):**
- Lógica de produto (interpretador, comandos novos, validação)
- Novos níveis (configuração, mecânica, mensagens)
- Integração com Supabase
- Estrutura de dados (WorldState, schema de levels)
- Animações complexas
- Documentação técnica (ARCHITECTURE, INTERPRETER, DECISIONS, LEVELS)

**Conjunto (discussão com Claude antes):**
- Decisões de produto novas
- Bugs complexos de Reanimated/animação
- Refatorações estruturais

**Antes de Manus começar qualquer trabalho:** `git pull origin main` pra pegar as mudanças do Gui. Sempre.

---

## 0. Setup Inicial

### 0.1. Estado atual do ambiente

**Já feito:**
- Repositório criado: https://github.com/nortecodeadm/norte-code
- Conta Expo: `norte.code.adm`
- Supabase configurado
- Gui tem ambiente Windows local funcional (Node 24, JDK 17, Android Studio + SDK API 34, ANDROID_HOME configurado)
- Gui consegue rodar `npx expo start` e gerar APK release/debug local

**Manus, se for primeira vez no projeto, pedir ao Gui:**
1. Convite como colaborador no repo
2. Credenciais Supabase (SUPABASE_URL, SUPABASE_ANON_KEY)
3. Acesso à conta Expo (modelo de acesso a definir)

### 0.2. Documentação obrigatória no repo (`docs/`)

- `SETUP.md` — passo a passo do ambiente
- `ARCHITECTURE.md` — visão técnica geral
- `LEVELS.md` — descrição funcional de cada nível
- `INTERPRETER.md` — como funciona o interpretador de blocos
- `DECISIONS.md` — log de decisões técnicas

---

## 1. Visão do Produto

### 1.1. Tese central

Crianças de 7 a 10 anos aprendendo lógica de programação **dentro de uma jornada de mordomia** (cuidar de algo, fazê-lo crescer, restaurar). Cosmovisão cristã embutida sem catequese explícita: o jardim cresce porque há alguém cuidando.

### 1.1.1. As três fases (visão macro)

1. **Origem** — primeiro terreno vazio, criança ajudando a cuidar de algo do zero
2. **Quebra** — algo se perde/quebra, criança é deslocada
3. **Reconstrução** — novo terreno, mais árido, reconstrução começa

### 1.1.2. Missões especiais (pós-MVP)

Cenários temporários com **marca permanente** no mundo da criança. **Arquitetura aberta** pra suportar essas missões — não implementar no MVP, mas não fechar portas.

### 1.2. Três camadas (de cada nível individual)

- **Camada técnica:** o que está sendo ensinado (sequência, loop, etc.)
- **Camada narrativa:** o que acontece na história
- **Camada de cuidado:** que tipo de zelo/mordomia se manifesta

### 1.3. Princípios não-negociáveis

- Uso saudável — sem mecânicas viciantes
- Sem catequese explícita — cosmovisão integrada à narrativa
- Respeito à criança — sem condescendência, sem infantilização
- Ritmo contemplativo — não corrida, não pressa, não pontuação
- Acessibilidade — textos lidos em voz alta opcionalmente, contraste alto

### 1.4. Cosmovisão orientadora — Missão Integral e Mordomia

- O jardim cresce porque há alguém cuidando
- Toda escolha técnica é também uma escolha de valores
- O caminho não é reto — programar é dar direção certa
- Sequência, repetição, decisão — analogias de como Deus chamou Adão a cultivar

### 1.5. Identidade da Marca

**Nome:** Norte Code

**Tagline:** "A bússola da lógica e programação para crianças"

**Pronúncia:** "Norte Code" (português + inglês, mantém familiaridade da palavra "code")

**Identidade visual:**
- Paleta principal: verde-jardim `#1F5F3F` (cor central), branco quente `#FFFDF7`, marrom-terra `#8B4513`, laranja-canteiro `#E67E22`
- Cor de apoio: verde-claro `#7BA05B` (broto), `#9BC274` (folhas)
- Fonte primária: **Nunito** (Bold, SemiBold, Regular)
- Fonte secundária para títulos: serifa elegante (a definir)
- Tom visual: flat-design, calmo, contemplativo, não-cartoon, não-saturado

**Tom de marca:**
- Direto sem ser frio
- Acolhedor sem ser piegas
- Respeitoso com a criança
- Inspirador sem ser sermão

---

## 2. Stack Técnica Definitiva

### 2.1. Frontend (App)

- **Expo SDK** ~54
- **React Native** ~0.81
- **TypeScript** ~5.9
- **Expo Router** ~6 (file-based routing)
- **NativeWind** ~5.6 (Tailwind pra RN)
- **react-native-reanimated** ~4.x (animações)
- **react-native-gesture-handler**
- **react-native-safe-area-context** ~5.6 (SafeAreaView correto pra Android)
- **expo-av** (áudio)
- **@react-native-async-storage/async-storage** (storage local)
- **@supabase/supabase-js** (auth + DB)
- **Sentry** (monitoramento opcional)

### 2.2. Backend

- **Supabase** — Auth + Postgres + Storage
- **Row Level Security (RLS)** habilitado em todas as tabelas
- **Funcionamento offline** — gameplay local com `AsyncStorage`, sync com Supabase quando online

### 2.3. Build e distribuição

- **Desenvolvimento:** `npx expo start` + Fast Refresh (USB ou tunnel)
- **Build local de APK:** `gradlew assembleRelease` (release) ou `assembleDebug` (debug)
- **Build em nuvem:** EAS Build (pra distribuição via Expo)
- **Produção final:** Google Play Store (futuro, pós-MVP)

### 2.4. Repositório

- **GitHub:** https://github.com/nortecodeadm/norte-code (público)
- Branch principal: `main`
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`)

---

## 3. Identidade Visual e Tom

### 3.1. Estética

- **Flat-design**, sem 3D, sem gradientes pesados
- Cores quentes e terrosas, evocando jardim e terra
- Composição contemplativa, com áreas vazias propositais
- Ilustrações com bordas suaves, sem outline forte

### 3.2. Tom de texto

- Frases curtas, claras
- Sem gerúndio onde puder evitar
- Sempre tratamento direto à criança ("você")
- Mensagens de erro nunca punitivas ("Quase!" em vez de "Errado!")
- Textos de resumo curtos, com um conceito-chave em negrito

### 3.3. Áudio

- Sons leves, suaves, não-eletrônicos quando possível
- Música de fundo apenas em capítulos narrativos
- Pa-pa-pum-pum-pum de passos do avatar deve ser sutil

---

## 4. Escopo do MVP

### 4.1. Telas do MVP

1. **Splash** — logo + tagline + fade pra próxima
2. **Onboarding** (3-4 telas dependendo do fluxo)
3. **Customização do Avatar** + Nome do Jogador
4. **Escolha do Mascote** + Nome do Mascote
5. **Tela de Transição** — "Este é o seu lugar..."
6. **Tela Mundo** (home, persistente)
7. **Tela do Nível** (gameplay)
8. **Tela de Resumo do Nível** (pós-execução)
9. **Capítulo Narrativo** (entre Nível 5 e Nível 6)

### 4.2. Onboarding

**Passo 1 — Boas-vindas.** Tela única.
- Texto: "Oi! Vamos começar uma jornada juntos? Você vai cuidar de um lugar que ainda está vazio e fazê-lo crescer."
- Botão: "Vamos começar"

**Passo 2 — Customização do Avatar.**
- Avatar pré-renderizado, 36 combinações (2 peles × 3 estilos cabelo × 3 cores cabelo × 3 roupas — combinação ajustada conforme arquivos atuais)
- Opções:
  - 2 cores de pele (clara, escura)
  - 3 estilos de cabelo (liso curto, liso médio, cacheado)
  - 3 cores de cabelo (preto, castanho, loiro)
  - 3 cores de camiseta (verde, azul, amarelo)
- Avatar mostrado em tempo real
- Botão "É esse!"

**Passo 3 — Nome do avatar/jogador (jogador).**
- Avatar customizado renderizado no topo
- Texto: "Como vou te chamar?"
- Input (1-20 caracteres, preserva capitalização)
- Botão "Continuar"

**Passo 4 — Escolha do mascote.** 3 opções visuais grandes.
- Texto: "Quem você quer levar com você?"
- Opções: cachorro, gato, coelho
- Botão "Esse aí!"

**Passo 5 — Nome do mascote.**
- Texto: "Qual vai ser o nome dele(a)?"
- Input (1-12 caracteres)
- Botão "Pronto!"

**Pós-onboarding:** Tela de transição → Tela Mundo

### 4.3. Regra de exibição de nomes

**NEM nome do avatar NEM nome do mascote aparecem como label/header permanente em qualquer tela.**

Os nomes aparecem **apenas em textos narrativos** que se referem especificamente ao avatar ou ao mascote:
- *"Muito bem, {playerName}! Você plantou sua primeira semente."* (resumo pós-nível)
- *"{petName} está animado pra ver o que vamos fazer agora!"* (capítulo narrativo futuro)
- *"Vamos lá, {playerName}?"* (introdução de nível)

Justificativa: UI limpa, foco no cenário/ação, nomes só quando importam narrativamente.

### 4.4. Tela Mundo (Home)

**Importância:** a tela mais importante visualmente. **É a "casa" do jogador.**

**Composição visual da Fase 1 (Origem):**
- Background full-screen: terreno calmo, dunas suaves, paleta quente (`mundo_terreno_vazio.png`)
- Cenário fixo: pedra ao fundo, tronco caído ao fundo (mais altos na tela)
- Protagonistas: avatar grande no primeiro plano (canto inferior esquerdo), mascote pequeno ao lado
- Botão "▶" no canto inferior direito (abre próximo nível disponível)

**Sistema de posicionamento:** `WORLD_LAYOUT` com coordenadas relativas (`pctH(n)`, `pctW(n)`), não absolutas. Gui calibra visualmente.

**Conforme níveis são completados, recompensas aparecem:**

| Após Nível | Recompensa visual no Mundo |
|---|---|
| 1 | Sementinha no chão |
| 2 | Sementinha vira broto verde (substitui) |
| 3 | Broto cresce mais + flor ao lado da pedra |
| 4 | (a definir) — provavelmente nova sementinha em outro lugar + plantinha brotando do tronco |
| 5 | Brotos viram pequenas flores, caminho de pedras começa |
| 6 | Padrão de canteiro mais organizado |
| 7 | Primeiro arbusto adulto com frutinhas |
| 8 | Cesto de frutas no canto |
| 9 | Três canteiros completos |
| 10 | Cerca de madeira (símbolo de "começo de cidade") |

**Sistema técnico de recompensas:**

Dois formatos coexistem:
- **Formato simples (Níveis 1-2):** `reward: { elementKey: "seed_lvl1" }`
- **Formato com múltiplas operações (Nível 3+):** `reward: { elements: [{ add: "...", replaces: "..." }, ...] }`

A renderização decide qual elemento mostrar (substituições resolvidas em tempo de render, não de save).

**Interações no Mundo:**
- Tocar no avatar: pequena animação (acena)
- Tocar no mascote: animação (pula, balança a cauda — chama o mascote pelo nome em balão de fala curtinha: "Oi!")
- Tocar em elementos do mundo: pequena descrição em texto curto
- Botão "▶" abre o próximo nível

### 4.5. Capítulo Narrativo

No MVP haverá **1 capítulo narrativo único**, posicionado **entre o Nível 5 e o Nível 6** (transição da Fase 1 pra Fase 2 — "Quebra").

**Formato:** sequência de 4-5 telas com ilustração + texto curto. Storybook estático, sem interação além de "tocar para avançar".

**Roteiro (versão final, não negociar):**

**Tela 1.**
> Era uma vez um lugar sem nada.
> Só terra, vento, e silêncio.

**Tela 2.**
> Mas alguém ouviu o silêncio.
> E achou que aquele lugar tinha jeito de jardim.

**Tela 3.**
> Então começou a cuidar.
> Plantou. Regou. Esperou.
> E o que era vazio começou a viver.

**Tela 4.**
> O jardim cresceu tanto, tanto, que precisou de mais mãos.
> Agora é a sua vez de continuar.

**Tela 5.**
> O que você vai fazer com o que recebeu?

**Após a tela 5:** transição para o nível 6.

**Notas de execução:**
- Texto centralizado, fontes grandes
- Ilustrações de fundo evoluindo: tela 1 só terra, tela 2 primeiro broto, tela 3 vários brotos, tela 4 jardim cheio, tela 5 jardim com horizonte de cidade ao fundo
- Música suave diferente do gameplay
- Sem botão de pular

### 4.5.1. Decisões de mordomia (pós-MVP)

Mecânica registrada como direção de produto. **Não entra nos 10 níveis do MVP.** Em níveis futuros (11+), surgem decisões sem "resposta certa de programação" — apenas "resposta certa de cuidado".

**Manus:** ao implementar o MVP, **não inserir** decisões morais nos níveis 1-10. **Manter arquitetura aberta** pra adicionar depois. Documentar intenção em `ARCHITECTURE.md`.

### 4.5.2. Mapeamento dos níveis nas fases narrativas (atualizado v2.7)

**Estrutura narrativa do MVP:**

- **Níveis 1-8 — Construção do jardim (Fase 1, evoluindo visualmente).** Da sementinha inicial à floresta madura com fauna diversa. Cada nível adiciona vida ao Mundo permanente.
- **Nível 9 — Tentação e queda.** Serpente aparece e oferece atalho. Criança aceita (inevitabilidade narrativa).
- **Nível 10 — Recomeço no árido + esperança.** Cenário muda radicalmente. Criança aplica o que aprendeu pra começar a restaurar a vida em terra difícil.

**O que ficou fora do MVP (pós-MVP):**
- Cidade que cuida do jardim
- Capítulo Narrativo formal (telas dedicadas de história entre níveis) — pode entrar antes do release, mas em sessão dedicada
- Continuação do árido (mais níveis de restauração após o 10)

**Implicação visual:** o Mundo permanente passa por DUAS grandes mudanças visuais ao longo do MVP:
1. **Nível 5:** background v1 → background v2 (graminha, florestinha, flor no tronco). Mesma cena, mais madura.
2. **Nível 10:** background v2 → background árido. Cenário radicalmente diferente. O jardim Fase 1 vira memória/silhueta no horizonte.

### 4.6. PRINCÍPIO TRANSVERSAL — Complexidade Crescente, Não Retroativa

**A partir da v2.5 do briefing, fica estabelecido:** novos níveis adicionam complexidade **em cima** do que existe, sem refatorar o passado.

Exemplo concreto:
- Nível 1 usa bloco "Andar" (`walk_forward`) em estrutura linear (`cells[]`)
- Nível 3 usa bloco "Direita" (`move_right`) em estrutura de grade 2D (`grid.cells[row][col]`)
- **AMBAS as estruturas coexistem no código.** Níveis 1-2 não são refatorados.

Justificativa pedagógica: a complexidade cresce conforme a criança avança. Reescrever o passado não faz sentido — se complexidade já existisse no Nível 1, ela teria estado lá desde o início.

Implicação técnica:
- WorldState suporta múltiplos formatos
- Tipo `Reward` suporta versão antiga (`elementKey`) e nova (`elements[]`)
- Interpretador detecta qual estrutura usar baseado no nível

### 4.7. Os 10 Níveis do MVP

Layout padrão de um nível:
- Cenário no topo (40% da tela)
- Paleta de blocos no meio (15%)
- Área de montagem embaixo (35%)
- Botão "▶ Executar" (10%)

Quando a criança aperta "Executar":
- Acertou: animação de sucesso, recompensa visual no Mundo, transição para tela de resumo
- Errou: personagem tenta, falha sem punição ("Quase! Tente de novo."), criança pode reorganizar

---

#### Nível 1 — Sequência simples (2 passos) ✅ IMPLEMENTADO

- **Conceito:** sequência de ações em ordem
- **Cenário:** 3 células em linha. Avatar precisa andar até um canteiro e plantar
- **Blocos:** [→ Andar] [🌱 Plantar]
- **Solução:** [Andar] → [Plantar]
- **Estrutura:** linear (`cells[]`)
- **Recompensa:** sementinha aparece no chão do Mundo (`seed_lvl1`)
- **Texto:** "Você fez seu primeiro programa! Cada passo na ordem certa. Isso se chama **sequência**."

---

#### Nível 2 — Sequência mais longa (5 passos) ✅ IMPLEMENTADO

- **Conceito:** sequência (reforço)
- **Cenário:** 5 células em linha. Avatar precisa andar, plantar, andar, regar
- **Blocos:** [→ Andar] [🌱 Plantar] [💧 Regar] (regador só no código, não como objeto físico)
- **Solução:** [Andar] [Andar] [Plantar] [Andar] [Regar]
- **Estrutura:** linear (`cells[]`)
- **Recompensa:** broto verde substitui sementinha no Mundo (`sprout_lvl2`)
- **Texto:** "Sequências mais longas funcionam igual. Um passo de cada vez, na ordem certa."

---

#### Nível 3 — Direção (grade 2D) ✅ IMPLEMENTADO

- **Conceito:** sequência com escolha de direção
- **Cenário:** grade 2×3. Pedra bloqueia o caminho direto até o canteiro
  ```
  [V] [P] [C]
  [ ] [ ] [ ]
  ```
- **Blocos:** [→ Direita] [↓ Descer] [↑ Subir] [🌱 Plantar]
- **Solução:** [Descer] [Direita] [Direita] [Subir] [Plantar]
- **Estrutura:** grade 2D (`grid.cells[row][col]`)
- **Recompensa:**
  - Broto cresce → broto crescido substitui broto atual (`grown_sprout_lvl3` replaces `sprout_lvl2`)
  - Flor aparece ao lado da pedra do Mundo (`flower_lvl3`)
- **Texto:** "Bom! Às vezes o caminho não é reto. Programar é dar direção certa."

**Nota:** Esquerda (`move_left`) foi reservada pro Nível 4.

---

#### Nível 4 — Sequência longa + `move_left` ✅ IMPLEMENTADO

- **Conceito:** sequência longa sem loop + introdução de `move_left`
- **Função pedagógica:** par com o Nível 5. A criança sente o cansaço da repetição manual aqui pra que o loop do Nível 5 seja sentido como alívio (princípio "necessidade antes da ferramenta")
- **Cenário:** grade 4×4. Avatar em (0,0). 3 canteiros em (0,3), (3,3), (3,0). 6 pedras formando bloco central (linhas 1-2, colunas 0-2) que força rota única em "U" no sentido horário
- **Blocos disponíveis:** [→ Direita] [← Esquerda] [↑ Subir] [↓ Descer] [🌱 Plantar] — `move_up` está na paleta como "trap pedagógico" (criança aprende que nem todo bloco serve em toda situação)
- **Solução-alvo:** 12 blocos em 3 grupos simétricos
  ```
  [Direita][Direita][Direita][Plantar]   → C1 em (0,3)
  [Descer][Descer][Descer][Plantar]      → C2 em (3,3)
  [Esquerda][Esquerda][Esquerda][Plantar] → C3 em (3,0)
  ```
- **Validação:** qualquer programa que termine com os 3 canteiros plantados é aceito (`maxBlocks: 16` pra dar margem de exploração)
- **Estrutura:** grade 2D (`grid.cells[row][col]`)
- **Recompensa:**
  - Mini-árvore substitui broto crescido (`mini_tree_lvl4` replaces `grown_sprout_lvl3`), posicionada mais ao fundo da cena pra abrir espaço pras 3 sementes na frente
  - 3 sementes (estágio 1) novas em (`seed_lvl4_a/b/c`), reusando o asset do Nível 1
  - 1 flor decorativa nova (`flower_lvl4`), reusando o asset do Nível 3
- **Texto de conclusão:** "Você reparou que fez quase a mesma coisa três vezes? Andar pra um lado e plantar. Andar pra outro lado e plantar. Andar pra outro lado e plantar. Programar é assim mesmo — às vezes a gente repete. No próximo nível você vai descobrir um jeito mais esperto de fazer isso."
- **Mensagens de erro contextuais:**
  - Bate em pedra: "Hmm, tem uma pedra aí. Tenta outro caminho."
  - Sai da grade: "Esse lado não dá. O caminho continua em outra direção."
  - Planta sem canteiro: "Aqui não tem canteiro. Procura o lugar certo pra plantar."
- **Decisão arquitetural:** campo opcional `failReason` em `ExecutionStep` permite distinguir "rock" de "out_of_grid" pra mensagens contextuais. Aditivo, não-retroativo.

---

#### Nível 5 — Bloco de Repetição (loop fixo) — PENDENTE (próximo a implementar)

- **Conceito de programação:** loop com N fixo (`[Repetir 3×]`).
- **Função pedagógica:** par com o Nível 4. A criança refaz o MESMO trajeto do Nível 4 (rega as 3 sementes que plantou) mas agora com bloco de loop disponível. Sente o alívio de fazer mais com menos. Princípio "necessidade antes da ferramenta".
- **Função narrativa:** primeiro grande salto visual do Mundo permanente. O jardim entra em maturidade — vida começa a se espalhar pelo solo, primeira fauna se prepara, vida vence até o que parecia morto (flor no tronco).
- **Cenário do nível:** mesma grade 4×4 do Nível 4, mesmas 6 pedras, mesmos 3 canteiros (agora com sementes plantadas esperando rega).
- **Blocos disponíveis:** `move_right`, `move_left`, `move_up`, `move_down`, `regar`, `[Repetir 3×]`.
- **Solução-alvo (9 blocos):**
  ```
  [Repetir 3× [Direita]][Regar]
  [Repetir 3× [Descer]][Regar]
  [Repetir 3× [Esquerda]][Regar]
  ```
- **Solução longa aceita:** versão sem loop (igual à do Nível 4 com `Regar` em vez de `Plantar`).
- **Validação:** as 3 sementes regadas viram plantinhas estágio 3.
- **Mudança no Mundo permanente:**
  - **Background v1 → background v2** (substituição completa, mesmo padrão de substituição das plantas): graminha esparsa pelo solo (não tapete — tufos espalhados), florestinha em silhueta no horizonte. Esta é a mudança visual mais forte do MVP até aqui.
  - **Planta principal evolui:** mini-árvore (`mini_tree_lvl4`) substituída por árvore jovem (`young_tree_lvl5`). Tronco lenhoso mais alto, copa redonda definida, sem frutos ainda.
  - **Tronco caído substituído por versão com flor brotando** (`fallen_log_with_flower_lvl5` substitui `fallen_log` original). Símbolo: vida vence até no que parecia morto.
  - 3 sementes do Nível 4 (`seed_lvl4_a/b/c`) viram 3 plantinhas estágio 3 (pulam estágio 2 — sinal visual de que regar acelerou o crescimento).
  - +2 flores decorativas adicionais (total: 4 flores no Mundo).
- **Assets novos necessários:**
  - `background_mundo_v2.png` (substitui o background atual)
  - `mundo_arvore_jovem.png` (substitui a mini-árvore — evolução natural da planta principal)
  - `flor_no_tronco.png` (já existe, mas será usado como SUBSTITUIÇÃO do tronco original, não como sobreposição. O asset já inclui o tronco completo com a flor.)
  - `plantinha_estagio3.png` (planta com caule + folhas, mais desenvolvida que broto)
- **Texto de conclusão (rascunho):** "Olha que esperto! Em vez de mandar o mesmo movimento três vezes, você usou o bloco de **repetir**. Programar bem é fazer mais com menos. Lembra disso — vai ser útil mais pra frente."
- **Conexão com Nível 10 (ferramenta antecipada):** a frase final planta a semente de que loop vai ser útil de novo no recomeço. No árido, a criança vai precisar replantar muito — loop é o que permite plantar rápido.

---

#### Nível 6 — Condicional simples (se → então) — PENDENTE

- **Conceito de programação:** condicional. "Se acontecer X, então faça Y."
- **Função pedagógica:** introdução do **discernimento**. Até agora a criança fazia coisas em sequência. Agora ela aprende a **olhar antes de agir**. Mordomia exige discernimento — não é todo solo que recebe semente.
- **Função narrativa:** primeira fauna entra no Mundo permanente. Sinal de que a vida não é só vegetação — agora há criaturas. A planta principal evolui pra árvore jovem.
- **Cenário do nível (esboço):** grade 2D maior (sugestão: 3×5). Caminho linear de células. Algumas células têm canteiro vazio, outras têm canteiro com semente já plantada, outras estão vazias. Criança planta SÓ onde tem canteiro vazio.
- **Blocos disponíveis:** `move_right`, `[Se houver canteiro vazio → Plantar]`, `[Repetir N×]`.
- **Solução-alvo:** `[Repetir 5× [Direita, Se canteiro vazio → Plantar]]`.
- **Mudança no Mundo permanente:**
  - Primeira fauna: 1 pássaro pousado em algum ponto do cenário (asset novo, marcante).
  - +1 ou +2 plantinhas no chão.
  - Planta principal NÃO evolui neste nível (já tinha evoluído pra árvore jovem no Nível 5 — evolução pra árvore frutífera fica reservada pro Nível 7).
- **Assets novos necessários:**
  - `passaro_pousado.png` (estilo Style Guide — formas arredondadas, paleta suave)
- **Texto de conclusão (rascunho):** "Você aprendeu a **olhar antes de fazer**. Nem todo lugar pede a mesma ação. Saber decidir é cuidar bem."
- **Conexão com Nível 10:** condicional vai permitir diagnóstico do solo árido — "se solo tem umidade → planta; senão → continua andando até achar solo bom". Discernimento é vital pra lidar com terreno difícil.

---

#### Nível 7 — Se / senão (condicional com dois ramos) — PENDENTE

- **Conceito de programação:** if/else. "Se X, faça Y; senão, faça Z."
- **Função pedagógica:** discernimento amadurecido. A criança não só "vê e age" — tem duas respostas possíveis dependendo do que vê.
- **Função narrativa:** árvore frutífera aparece — sinaliza que o jardim agora produz. Visualmente antecipa a coleta de frutas do Nível 8.
- **Cenário do nível (esboço):** caminho com células variadas. Algumas têm canteiros vazios, outras têm plantinhas secas que precisam de rega, outras estão vazias.
- **Blocos disponíveis:** `move_right`, `[Se planta seca → Regar; senão se canteiro vazio → Plantar]`, `[Repetir N×]`.
- **Solução-alvo:** `[Repetir 6× [Direita, Se planta seca → Regar; senão se canteiro vazio → Plantar]]`.
- **Mudança no Mundo permanente:**
  - Árvore frutífera aparece (asset novo, ou variação da árvore_jovem com frutos sobrepostos — definir na hora da implementação). Frutos em vermelho-fruta suave (#B5483A da paleta).
  - +1 esquilo aparece no chão (segunda peça de fauna).
  - Mais grama, mais flores espalhadas — consolida "jardim maduro".
- **Assets novos necessários:**
  - `arvore_frutifera.png`
  - `esquilo.png` (em pose calma, paleta suave)
- **Texto de conclusão (rascunho):** "Agora você sabe escolher entre dois caminhos. Cuidar é responder ao que cada coisa precisa — não tratar tudo igual."
- **Conexão com Nível 10:** if/else permite escolhas críticas com pouca água — "se solo tem umidade → planta semente; senão → continua andando". Sem if/else, criança gasta sementes em terra ruim.

---

#### Nível 8 — Variável (contador simples) — PENDENTE

- **Conceito de programação:** variável. "Guardar um número e usá-lo depois."
- **Função pedagógica:** consciência de **quantidade**. Cuidar não é "fazer pra sempre" — é "fazer até atingir o que é necessário". Mordomia tem medida.
- **Função narrativa:** primeira ideia de **provisão guardada** (cesta com 3 frutas). Pequenos animais consolidam ambiente vivo.
- **Cenário do nível (esboço):** árvore frutífera no canto da grade. Ao lado, uma cesta vazia. Indicador na tela: "Frutas: 0 / 3". Criança precisa pegar EXATAMENTE 3 frutas e parar.
- **Blocos disponíveis:** `move_right`, `move_left`, `move_up`, `move_down`, `[Pegar fruta (frutas + 1)]`, `[Se frutas = 3 → Parar]`, `[Repetir N×]`.
- **Solução-alvo:** `[Repetir até frutas = 3 [Andar até árvore, Pegar fruta]]`.
- **Mudança no Mundo permanente:**
  - Cesta com 3 frutas aparece num canto do Mundo (símbolo de provisão guardada).
  - Mascote ganha animação de "comer fruta" no level summary (não no Mundo permanente).
  - 1 ou 2 elementos pequenos de fauna (borboleta, formiga ou similar).
  - **Decisão simplificadora:** a árvore frutífera NÃO muda visualmente (não tem "versão parcialmente colhida"). A coleta acontece logicamente, mas a árvore permanece igual.
  - Planta principal não muda neste nível.
- **Assets novos necessários:**
  - `cesta_com_frutas.png`
  - 1-2 elementos pequenos de fauna
- **Texto de conclusão (rascunho):** "Você usou um **lugar pra guardar** uma informação (quantas frutas). Isso se chama variável. Cuidar bem é saber a quantidade certa — não pegar tudo, não pegar de menos."
- **Conexão com Nível 10:** variável permite no árido **racionar sementes** com a água disponível. Sem variável, criança não consegue medir quanto plantar.

---

#### Nível 9 — Função + Tentação da serpente — PENDENTE (decisões TBD)

**TBD — sessão dedicada pendente antes da implementação.**

**O que está decidido:**
- **Conceito de programação:** função (definir e usar sub-rotina, ex: definir `cuidar` = `[Plantar, Regar]`).
- **Função narrativa:** a serpente aparece e oferece um "atalho". A criança acaba seguindo o atalho (inevitabilidade — ver Decisão estratégica na Seção 4.6 / DECISIONS.md). Programa do Nível 9 termina com sucesso TÉCNICO, mas algo se quebra NARRATIVAMENTE.
- **Princípio decidido:** a queda não é punição por escolha errada. É a história sendo contada — toda criança "cai". O Nível 10 é consequência, não castigo.
- **Asset crítico:** serpente (estilo Style Guide — silhueta arredondada, NÃO assustadora, NÃO realista, verde-escuro com padrões sutis).
- **Mudança no Mundo permanente:** algo sutil sinaliza que algo se quebrou (sombra, som diferente, cor mais fria entrando) — sem ainda explicitar.

**O que está pendente (sessão dedicada):**
- **Mecânica do atalho:** como a serpente "oferece" o atalho? NPC clicável? Bloco mágico aparecendo na paleta? Outra forma?
- **Como garantir a inevitabilidade:** o que faz a criança aceitar o atalho? Restrição de `maxBlocks` que só cabe com o atalho? Único caminho técnico funcional?
- **Hipótese de design forte (a discutir):** a serpente oferece um bloco pré-pronto (`pegar_tudo`, `fazer_tudo`) que substitui a função `cuidar` que a criança construiria. Subverte a abstração que ela acabou de aprender. A criança escolhe o "pronto" sobre o que ela cultivou — eis a queda.

---

#### Nível 10 — Recomeço na terra árida + Esperança — PENDENTE (decisões TBD)

**TBD — depende da decisão do Nível 9 + sessão de polish narrativo.**

**O que está decidido:**
- **Conceito de programação:** combinação de 2-3 conceitos aprendidos (NÃO todos, conforme decisão do Gui). Lista exata a definir, baseada em quais conceitos se aplicam melhor à mecânica de recomeço no árido.
- **Função narrativa:** consequência da queda + restauração começa. Não punição — "novo começo, com o que aprendi".
- **Cenário do nível:** cenário árido (totalmente diferente do jardim). Terra rachada, poucas plantas, sol mais alto. Tamanho da grade TBD.
- **Solução-alvo:** programa relativamente longo, juntando 2-3 conceitos. NÃO é elegante — é trabalhoso, como recomeçar deve ser.
- **Mudança no Mundo permanente:**
  - Cenário principal da Tela Mundo passa a ser o **árido** após Nível 10. Mas o jardim Fase 1 não some — fica como memória/silhueta ao horizonte.
  - Ao final do nível, o árido tem 3-5 sementinhas e brotos novos brotando no solo rachado. **Esperança visível.**
- **Mensagem final do MVP (rascunho, calibrar muito):**
  > *"O que você plantou no jardim não se perdeu. Continua dentro de você — em cada bloco que aprendeu a usar. Agora você sabe cuidar até onde parecia impossível. Continua, em breve."*
- **Assets novos necessários:**
  - `background_arido.png` (referência: prompt Style Guide Seção 9.2 "Cenário Terreno Árido Fase 2")
  - `solo_rachado.png`, `solo_umidade.png` (texturas)
  - `sementinha_arida.png`, `broto_arido.png` (variações das plantas em contexto árido)
- **Conexão com pós-MVP:** o Nível 10 abre caminho pra continuação — construção da "cidade que cuida do jardim". Mas o MVP encerra com a sensação de "tem esperança, e sou eu quem vai fazer".

---

### Princípios consolidados do roadmap (registrados em DECISIONS.md)

1. **Cada conceito de programação tem uso explícito no Nível 10.** Texto de conclusão de cada nível 5-8 antecipa essa utilidade futura ("Lembra disso — vai ser útil mais pra frente", "vai te ajudar no árido", etc.).
2. **A virada do Nível 5 é a primeira marcação visual forte do MVP.** Background novo, grama, flor no tronco, florestinha. Antes era "uma planta crescendo"; agora é "o lugar todo está vivo".
3. **Fauna entra gradualmente a partir do Nível 6.** 1 elemento por nível (pássaro, esquilo, borboleta/formiga). Constrói afeto antes da quebra.
4. **Árvore frutífera precede o Nível 8 (Nível 7).** Visual antecede pedido pedagógico.
5. **Cenário árido só aparece no Nível 10.** Primeira mudança radical de paleta. Justifica impacto emocional.
6. **A queda no Nível 9 é decisão de design pendente.** Será resolvida em sessão dedicada antes da implementação.

---

### Notas sobre o Capítulo Narrativo (antes Briefing v2.5 dizia "após Nível 5")

A v2.7 NÃO inclui Capítulo Narrativo entre Níveis 5 e 6. O Capítulo Narrativo (Origem → Quebra → Recomeço) será adicionado ao MVP em sessão dedicada após o roadmap visual estar todo testado. Provavelmente:
- Tela de abertura ANTES do Nível 1 (1-2 telas — "Era uma vez um lugar sem nada...")
- Tela entre Nível 9 e Nível 10 (transição da queda — narrativa da serpente, vista de fora)
- Tela final pós-Nível 10 (mensagem de esperança)

Mas a definição exata, mesma sessão dedicada da serpente.

---

### 4.8. Acessibilidade no MVP

- Contraste alto (mínimo 4.5:1)
- Fontes legíveis (Nunito 16+ pra textos do jogo)
- Não-dependência de cor (sempre há texto/ícone reforçando)
- Toques grandes (mínimo 48×48dp)
- Sem flashes/animações abruptas
- Leitura em voz alta opcional (TTS) — registrar como pendência, implementar quando viável

---

## 5. Persistência e Backend

### 5.1. Modelo de Auth (MVP)

- **Auth anônima** via Supabase no primeiro acesso
- Sessão persiste localmente em `AsyncStorage`
- Sem login/senha no MVP

### 5.2. Schema do Banco (Supabase)

```sql
-- players
CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  player_name text NOT NULL DEFAULT '',
  pet_type text CHECK (pet_type IN ('cachorro', 'gato', 'coelho')),
  pet_name text,
  avatar_slug text,  -- ex: "clara_lisocurto_castanhomedio_verde"
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- level_progress
CREATE TABLE level_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id),
  level_id int NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(player_id, level_id)
);

-- world_state (snapshot do mundo persistente)
CREATE TABLE world_state (
  player_id uuid PRIMARY KEY REFERENCES players(id),
  elements jsonb NOT NULL DEFAULT '[]'::jsonb,  -- array de strings (ex: ["seed_lvl1", "sprout_lvl2"])
  updated_at timestamptz DEFAULT now()
);
```

### 5.3. Row Level Security

Todas as tabelas com RLS habilitado. Cada player só pode ler/escrever sua própria linha.

### 5.4. Funcionamento Offline

- Gameplay sempre local (`AsyncStorage` é fonte da verdade)
- Sync com Supabase em background quando online
- Conflito: last-write-wins (cliente é fonte da verdade pra MVP — sync server-side complexo entra pós-MVP)

---

## 6. Estrutura de Pastas

```
norte-code/
├── app/                       # Telas (Expo Router)
│   ├── _layout.tsx
│   ├── index.tsx              # Splash
│   ├── onboarding/
│   │   ├── welcome.tsx
│   │   ├── avatar.tsx
│   │   ├── player-name.tsx
│   │   ├── pet-choice.tsx
│   │   └── pet-name.tsx
│   ├── transition.tsx
│   ├── world.tsx              # Tela Mundo
│   ├── level/
│   │   └── [id].tsx           # Tela de Nível
│   ├── level-summary/
│   │   └── [id].tsx
│   └── chapter/
│       └── [id].tsx           # Capítulo Narrativo
├── components/
│   ├── Avatar.tsx
│   ├── Mascote.tsx
│   └── level/
│       ├── BlockPalette.tsx
│       ├── ProgramArea.tsx
│       ├── ExecuteButton.tsx
│       └── LevelScene.tsx
├── lib/
│   ├── assets/
│   │   ├── avatar.ts          # mapeamento PNG → slug
│   │   └── mascotes.ts
│   ├── interpreter/
│   │   ├── blocks.ts          # tipos de bloco
│   │   ├── interpreter.ts     # executa programa
│   │   └── world-state.ts     # tipo do WorldState
│   ├── levels/
│   │   └── index.ts           # configuração de cada nível
│   ├── storage.ts             # AsyncStorage wrapper
│   └── supabase.ts            # cliente Supabase
├── assets/
│   ├── mundo/                 # PNGs do cenário do Mundo
│   ├── avatares/              # 36 PNGs de avatar
│   ├── mascotes/              # PNGs dos mascotes
│   └── fonts/
├── docs/
│   ├── SETUP.md
│   ├── ARCHITECTURE.md
│   ├── INTERPRETER.md
│   ├── LEVELS.md
│   └── DECISIONS.md
└── package.json
```

---

## 7. Documentação Obrigatória

Manus mantém atualizados:

- **`SETUP.md`** — passo a passo do ambiente
- **`ARCHITECTURE.md`** — visão técnica geral, fluxo de dados, padrões
- **`LEVELS.md`** — descrição funcional de cada nível
- **`INTERPRETER.md`** — como funciona o interpretador, comandos disponíveis, estrutura do WorldState
- **`DECISIONS.md`** — log cronológico de decisões técnicas (formato: data + decisão + justificativa)

A cada commit que mude lógica/arquitetura, atualizar a doc correspondente.

---

## 8. Critérios de Aceite do MVP

### 8.1. Funcionais

- Onboarding completo (Splash + 5 passos)
- Customização de avatar com 36 combinações
- Escolha de mascote (3 tipos)
- Nome do jogador + nome do mascote persistidos
- Tela Mundo evolui visualmente conforme níveis completados
- 10 níveis jogáveis com solução validada
- Capítulo narrativo entre Nível 5 e 6
- Mensagens de erro contextuais por nível
- Botão voltar sempre leva à Tela Mundo (nunca ao onboarding)

### 8.2. Não-funcionais

- App roda sem crashes em pelo menos 1 dispositivo Android real (celular do Gui)
- Tempo de transição entre telas < 500ms
- Persistência local funciona (criança fecha app, reabre, continua onde parou)
- Sync com Supabase em background (não bloqueia gameplay)
- Suporte a Android com notch/punch-hole (SafeAreaView correto)

### 8.3. Documentação

- Todos os arquivos da seção 7 atualizados
- Relatório de Execução por entrega significativa do Manus
- `DECISIONS.md` registra cada decisão técnica importante

---

## 9. O Que NÃO Faz Parte do MVP

- Login/senha (apenas auth anônima)
- Múltiplos perfis por device
- Compras in-app
- Anúncios
- Mais de 10 níveis
- Decisões de mordomia (entram pós-MVP)
- Missões especiais
- Multiplayer
- Customização de mascote (cores, acessórios)
- Versão iOS (Android primeiro)
- Som/música além do mínimo

---

## 10. Estado Atual de Implementação (atualizado Maio/2026)

### ✅ Funcionando

- Onboarding completo (Splash + 5 passos: Welcome, Avatar, Player Name, Pet Choice, Pet Name)
- Customização de avatar (36 combinações)
- Tela Mundo com WORLD_LAYOUT calibrado
- Nível 1 (Sequência simples) — solução [Andar][Plantar]
- Nível 2 (Sequência mais longa) — solução [Andar][Andar][Plantar][Andar][Regar]
- Nível 3 (Direção em grade 2D) — introduz `move_right`, `move_up`, `move_down`. Solução tipo [Descer][Direita][Direita][Subir][Plantar]
- Nível 4 (Sequência longa + `move_left`) — grade 4×4 com caminho em "U" de 12 blocos. Introduz `move_left`. Cenário com 6 pedras forçando rota única em sentido horário. Padrão "3 movimentos + 1 plant" repetido 3 vezes (preparação pedagógica do Nível 5)
- Sistema de recompensas com substituição em cadeia (`seed_lvl1` → `sprout_lvl2` → `grown_sprout_lvl3` → `mini_tree_lvl4`)
- Mensagens de erro contextuais por nível (via campo opcional `failReason` no `ExecutionStep`)
- Princípio narrativo registrado: Mundo permanente é narrativa visual, não decoração (ver `DECISIONS.md`)
- SafeAreaView correto (react-native-safe-area-context)
- Botão voltar com router.replace('/world')
- Persistência local (AsyncStorage)
- Sync com Supabase
- Build local funcional no Windows do Gui (dev build via `npx expo run:android`, com Fast Refresh por Wi-Fi)

### 🚧 Em implementação

- (Nenhum nível em implementação no momento — próximo é o Nível 5)

### ⏳ Pendente

- Nível 5 (introdução do bloco `[Repetir N vezes]`) — par pedagógico do Nível 4. Mesmo cenário, mesmos movimentos, mas com bloco de loop. Solução de 9 blocos. Recompensa: 3 sementes do Nível 4 viram plantinhas estágio 3 (pulando broto estágio 2) + 2 flores novas
- Níveis 6-10
- Capítulo narrativo entre Nível 5 e 6
- Transição visual Mundo Fase 1 → Mundo Fase 3
- Acessibilidade (TTS opcional)

### Pendências técnicas conhecidas

- **Mascote com aspectRatio fixo do cachorro:** `components/Mascote.tsx` usa `aspectRatio: 880/1062` (cachorro_padrao), mas gato e coelho têm dimensões diferentes. Pode causar distorção visual nos outros mascotes. Solução proposta: padronizar PNGs pra canvas 1024×1024 (regenerar no Canvas) ou usar `Image.resolveAssetSource` em runtime.
- **ExecuteButton sem sombra:** versão atual simplificada (sem `Animated.View` externo, sem sombra, sem pulse animation) porque combinação `Animated.View + transform + alignSelf:'stretch'` quebrava renderização. Polish visual pode voltar depois (re-introduzir features uma a uma).
- **Animação de movimento do avatar:** validar se está suave (~500ms, easing inOut). Se não estiver, melhorar.
- **Erros TypeScript pré-existentes** em `components/Avatar.tsx:27` e `components/Mascote.tsx:28` (`Type 'unknown' is not assignable to type 'ImageSourcePropType'`). Não afetam runtime. Limpar quando houver oportunidade.

### Backlog de melhorias futuras

Ver `docs/internal/BACKLOG.md` pra lista completa de tarefas pequenas/médias que ficaram pra depois (mensagem "Você já plantou aqui!", alinhamento visual completo ao Style Guide, etc.).

---

## 11. Comunicação com Claude (via Gui)

Padrão estabelecido:
- Manus envia Relatório de Execução a cada entrega significativa
- Claude revisa, valida, ajusta direção se necessário
- Gui orquestra, testa no celular, dá feedback de produto
- Bugs visuais simples: Gui corrige direto (local Fast Refresh)
- Bugs complexos / lógica nova: discussão Manus ↔ Claude via Gui

---

## 12. Checklist Pré-Início (pra qualquer entrega nova)

Antes de começar qualquer entrega:

- [ ] `git pull origin main` — pegar mudanças do Gui ou de outros devs
- [ ] Ler o briefing da entrega (documento que Claude prepara via Gui)
- [ ] Confirmar que entendi todos os critérios de aceite
- [ ] Perguntar se houver qualquer dúvida — não assumir

Durante a entrega:

- [ ] Atualizar documentação correspondente
- [ ] Commit messages em Conventional Commits
- [ ] Não mexer em código que não é da entrega atual

Ao final:

- [ ] Relatório de Execução
- [ ] Sugestões de melhoria ou pontos de atenção
- [ ] Confirmação de que tudo passou nos critérios de aceite

---

## 13. Princípios Finais (Lembretes do Protocolo)

- **Decisões de produto:** Claude decide, via Gui. Não inventar feature.
- **Decisões técnicas:** Manus decide, documenta em `DECISIONS.md`. Pode perguntar quando incerto.
- **Decisões visuais:** Gui ajusta diretamente (Fast Refresh local). Quando dúvida estética, perguntar.
- **Princípio transversal:** complexidade crescente, não retroativa. Novos níveis adicionam, não refatoram passado.
- **Documentação importa.** O código nunca está sozinho. Cada decisão importante vira texto.
- **Confidencialidade.** Projeto secreto. Não falar publicamente sobre o Norte Code.

---

*Atualizado em Maio/2026 — v2.8*
*Reflete: roadmap completo dos Níveis 5-10 consolidado, Nível 5 ganha evolução da planta principal pra árvore jovem (antecipada do Nível 6) e substituição do tronco caído pelo tronco com flor. Dev Temporário ativo: Claude Code.*
