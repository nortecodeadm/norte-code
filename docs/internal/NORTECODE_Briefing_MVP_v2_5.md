# Briefing de Execução — MVP do Norte Code (Passo 4 do Protocolo)

**Projeto:** Norte Code — A bússola da lógica e programação para crianças.
**De:** Claude (Estrategista)
**Para:** Manus (Executor)
**Via:** Gui
**Data:** Maio/2026
**Versão:** 2.5 — Briefing consolidado após primeiras semanas de execução. Reflete estado real do projeto: Gui passou a editar código localmente, princípio de não-retroatividade estabelecido (novos níveis não refatoram níveis anteriores), recompensas visuais detalhadas, divisão de trabalho ajustada.

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

### 4.5.2. Mapeamento dos níveis nas fases narrativas

- **Níveis 1-5 — Fase 1 (Origem).** Primeiro terreno, criança cuidando do que era vazio
- **Capítulo Narrativo (após Nível 5):** transição Fase 1 → Fase 2 (Quebra)
- **Níveis 6-10 — Fase 3 (Reconstrução, início).** Novo terreno, mais árido. Condicionais, variáveis, primeiras funções

**Implicação visual:** mundo permanente muda visualmente após Nível 5 (de "primeiro jardim" pra "novo terreno árido"). Arquitetura visual deve suportar essa transição.

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

#### Nível 3 — Direção (grade 2D) 🚧 EM IMPLEMENTAÇÃO

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

**Nota:** Esquerda (`move_left`) NÃO entra neste nível. Reservado pra Nível 4 ou 5.

---

#### Nível 4 — Primeira repetição (loop fixo simples) — PENDENTE

- **Conceito:** loop / repetição
- **Cenário:** avatar precisa plantar 3 sementinhas seguidas
- **Blocos:** [Andar/Direita] [Plantar] [Repetir 3 vezes [...]]
- **Solução elegante:** [Repetir 3 vezes [Andar, Plantar]]
- **Solução aceita (longa):** [Andar][Plantar][Andar][Plantar][Andar][Plantar] (acerta, mas dica sugere o loop)
- **Recompensa:** três brotos enfileirados no Mundo + (a discutir: plantinha brotando do tronco?)
- **Texto:** "Quando você precisa fazer a mesma coisa várias vezes, **repetir** funciona. Programar bem é fazer mais com menos."

**Decisão pendente:** introduzir `move_left` neste nível? Tem espaço narrativo.

---

#### Nível 5 — Loop com variação de quantidade — PENDENTE

- **Conceito:** loop (reforço, com escolha de quantas vezes repetir)
- **Cenário:** avatar precisa regar 5 brotos em sequência
- **Blocos:** [Andar/Direita] [Regar] [Repetir N vezes [...]] (N selecionável: 2, 3, 4, 5)
- **Solução:** [Repetir 5 vezes [Andar, Regar]]
- **Recompensa:** brotos viram pequenas flores. Caminho de pedras começa.
- **Texto:** "Você escolheu quantas vezes repetir. Esse é o jeito de cuidar bem: na medida certa."

---

### >>> CAPÍTULO NARRATIVO <<<

(Após Nível 5)

---

#### Nível 6 — Primeira condicional — PENDENTE

- **Conceito:** condicional (se / então)
- **Cenário:** caminho com casas. Em algumas tem semente, em outras não. Plantar **só** onde tem semente
- **Blocos:** [Andar] [Plantar] [Se houver semente [Plantar]]
- **Solução:** [Repetir 5 vezes [Andar, Se houver semente [Plantar]]]
- **Recompensa:** flores formam padrão de canteiro organizado
- **Texto:** "Você ensinou seu personagem a **decidir**. Isso é uma das coisas mais importantes da programação: saber quando fazer e quando não fazer."

---

#### Nível 7 — Condicional com duas ações (se/senão) — PENDENTE

- **Conceito:** se / senão
- **Cenário:** algumas casas têm semente (planta), outras têm broto (rega)
- **Blocos:** [Andar] [Plantar] [Regar] [Se houver semente, plantar, senão regar]
- **Solução:** [Repetir 6 vezes [Andar, Se houver semente plantar senão regar]]
- **Recompensa:** primeiro arbusto adulto com frutinhas
- **Texto:** "Cada situação pede uma resposta diferente. Você está aprendendo a **escolher bem**."

---

#### Nível 8 — Variável (contador simples) — PENDENTE

- **Conceito:** variável
- **Cenário:** coletar exatamente 3 frutas e levar pra cesto. Indicador "Frutas: 0"
- **Blocos:** [Andar] [Pegar fruta (frutas + 1)] [Se frutas = 3, parar]
- **Solução:** [Repetir [Andar, Se houver fruta pegar, Se frutas = 3 parar]]
- **Recompensa:** cesta com frutas no canto. Mascote ganha animação de "comer fruta"
- **Texto:** "Você usou um lugar pra **guardar** uma informação (quantas frutas). Isso se chama **variável**."

---

#### Nível 9 — Função simples — PENDENTE

- **Conceito:** função / sub-rotina
- **Cenário:** cuidar de 3 canteiros (andar até ele, plantar, regar)
- **Blocos:** [Andar] [Plantar] [Regar] [Definir "cuidar" = [...]] [Fazer "cuidar"]
- **Solução:** [Definir "cuidar" = [Plantar, Regar]] depois [Repetir 3 vezes [Andar, Cuidar]]
- **Recompensa:** três canteiros completos. Início de espaço de cultivo organizado
- **Texto:** "Você criou um nome novo ('cuidar') que junta várias ações. Isso se chama **função**."

---

#### Nível 10 — Combinação (loop + condicional + função) — PENDENTE

- **Conceito:** combinar tudo
- **Cenário:** caminho com canteiros e poças. Canteiros: "cuidar" (função). Poças: desviar
- **Blocos:** [Andar] [Virar] [Cuidar (função pré-definida)] [Se houver poça, virar]
- **Solução:** [Repetir 8 vezes [Se houver poça, virar; senão se houver canteiro, cuidar; senão andar]]
- **Recompensa:** cerca de madeira aparece no Mundo (primeira "estrutura construída" — início simbólico da cidade)
- **Texto:** "Você juntou tudo o que aprendeu! Sequência, repetição, decisão, lembrar de coisas, e dar nomes pra ações. É assim que tudo o que existe nos celulares foi feito."

**Tela final do MVP (após Nível 10):**
- Texto: "Você terminou a primeira jornada. Mais coisas estão crescendo aqui — em breve."
- Sem botão "próximo nível". Botão "Voltar para o mundo".

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
- Sistema de recompensas com substituição (sementinha → broto)
- SafeAreaView correto (react-native-safe-area-context)
- Botão voltar com router.replace('/world')
- Persistência local (AsyncStorage)
- Sync com Supabase
- Build local funcional no Windows do Gui

### 🚧 Em implementação

- Nível 3 (Direção, grade 2D)

### ⏳ Pendente

- Níveis 4-10
- Capítulo narrativo entre Nível 5 e 6
- Transição visual Mundo Fase 1 → Mundo Fase 3
- Acessibilidade (TTS opcional)

### Pendências técnicas conhecidas

- **Mascote com aspectRatio fixo do cachorro:** `components/Mascote.tsx` usa `aspectRatio: 880/1062` (cachorro_padrao), mas gato e coelho têm dimensões diferentes. Pode causar distorção visual nos outros mascotes. Solução proposta: padronizar PNGs pra canvas 1024×1024 (regenerar no Canvas) ou usar `Image.resolveAssetSource` em runtime.
- **ExecuteButton sem sombra:** versão atual simplificada (sem `Animated.View` externo, sem sombra, sem pulse animation) porque combinação `Animated.View + transform + alignSelf:'stretch'` quebrava renderização. Polish visual pode voltar depois (re-introduzir features uma a uma).
- **Animação de movimento do avatar:** validar se está suave (~500ms, easing inOut). Se não estiver, melhorar.

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

*Atualizado em Maio/2026 — v2.5*
*Reflete: setup local do Gui, primeiros 2 níveis funcionando, Nível 3 em implementação, princípio de não-retroatividade, sistema de recompensas com múltiplas operações.*
