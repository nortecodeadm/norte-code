# Arquitetura — Norte Code MVP

**Última atualização:** 14/05/2026
**Versão:** 0.8.0 (Nível 6 — condicional embutido `if_canteiro_vazio_then_plantar`, `conditionResult` em ExecutionStep, primeira fauna no Mundo)

---

## 1. Visão Geral

O Norte Code é um app Android para crianças de 7 a 10 anos que ensina lógica de programação através de uma jornada de mordomia (cuidar de um jardim que cresce e se transforma em cidade). A cosmovisão cristã reformada (Missão Integral) entra pela ambientação e pelo arco narrativo, não por catequese explícita.

## 2. Stack Técnica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Expo SDK | 54 |
| UI | React Native | 0.81.5 |
| Linguagem | TypeScript | 5.9.2 |
| Estilização | NativeWind (Tailwind CSS) | 4.x |
| Navegação | Expo Router (file-based) | 6.x |
| Animações | React Native Reanimated | 4.x |
| Gestos | React Native Gesture Handler | — |
| Safe Area | react-native-safe-area-context | ~5.6.0 |
| Backend | Supabase (PostgreSQL + Auth) | — |
| Persistência Local | AsyncStorage | — |
| Build | EAS Build | — |

## 3. Estrutura de Pastas

```
norte-code/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout (fonts, GestureHandler, Stack)
│   ├── index.tsx                 # Splash screen (entrada do app)
│   ├── onboarding/
│   │   ├── welcome.tsx           # Boas-vindas
│   │   ├── pet-choice.tsx        # Escolha do bichinho
│   │   ├── pet-name.tsx          # Nome do bichinho
│   │   ├── avatar.tsx            # Customização de avatar
│   │   └── transition.tsx        # Transição narrativa pós-onboarding
│   ├── world.tsx                 # Tela Mundo (home permanente)
│   ├── level/[id].tsx            # Tela de nível (gameplay)
│   ├── level-summary/[id].tsx    # Resumo pós-nível
│   └── chapter/[id].tsx          # Capítulo narrativo
├── components/
│   ├── world/                    # Componentes visuais do mundo
│   ├── level/                    # BlockPalette, ProgramArea, ExecuteButton
│   ├── avatar/                   # Componentes de avatar
│   ├── pet/                      # Componentes do bichinho
│   └── ui/                       # Primitivos (botões, cards, etc.)
├── lib/
│   ├── supabase.ts               # Cliente Supabase configurado
│   ├── storage.ts                # Wrapper AsyncStorage (offline-first)
│   ├── levels/
│   │   └── index.ts              # Definições dos níveis (LevelDefinition)
│   └── interpreter/              # Motor de execução dos blocos (AST JSON)
│       ├── index.ts              # Exports públicos
│       ├── blocks.ts             # Definição de tipos de blocos (UI)
│       ├── interpreter.ts        # Engine AST (executeProgram)
│       └── world-state.ts        # Estado do mundo durante execução
├── data/
│   ├── levels/                   # Configuração de cada nível (1-10)
│   └── chapters/                 # Dados dos capítulos narrativos
├── assets/
│   ├── images/                   # Ilustrações, ícones, sprites
│   ├── audio/                    # Efeitos sonoros, trilha
│   └── fonts/                    # Nunito, Fraunces
└── docs/                         # Documentação obrigatória
    ├── ARCHITECTURE.md           # Este arquivo
    ├── LEVELS.md                 # Descrição funcional dos níveis
    ├── INTERPRETER.md            # Como o interpretador funciona
    ├── DECISIONS.md              # Log de decisões técnicas
    └── chapters/                 # Roteiros dos capítulos narrativos
```

## 4. Fluxo de Navegação

```
Splash (index.tsx)
  │
  ├── [primeiro acesso] → Onboarding
  │     welcome → avatar → player-name → pet-choice → pet-name → transition → world
  │
  └── [retorno] → World (home)
        │
        ├── [botão ▶] → Level [id]
        │     │
        │     └── [sucesso] → Level Summary [id]
        │           │
        │           ├── [continuar] → Level [id+1] ou Chapter
        │           └── [voltar] → World
        │
        └── [após nível 5] → Chapter [1] → Level [6]
```

## 5. Modelo de Dados

### 5.1. Auth
- **Sem login com email/senha** no MVP
- Auth anônima pura via Supabase (`players.id = auth.uid()`)
- Sem `device_id` — recuperação de progresso via conta parental entra pós-MVP
- Sem coleta de dados pessoais (COPPA/LGPD compliance)

### 5.2. Tabelas (Supabase)
- `players` — dados do jogador (player_name, avatar_skin, avatar_hair_style, avatar_hair_color, avatar_outfit, pet_type, pet_name)
- `level_progress` — progresso por nível (completed, attempts)
- `world_elements` — elementos visuais desbloqueados no mundo
- `narrative_chapters_viewed` — capítulos já vistos

### 5.3. Persistência
- **Offline-first**: toda lógica roda client-side
- AsyncStorage guarda estado local
- Supabase sincroniza em background quando há conexão
- Se offline, app funciona normalmente com dados locais

## 6. Interpretador de Blocos (AST JSON)

O interpretador é o **núcleo do app**. Arquitetura:

1. **AST JSON** — O mesmo JSON renderiza a UI dos blocos E é executado pelo interpretador
2. **Engine recursiva** — Percorre a árvore (Program → Action/Loop/If)
3. **ExecutionSteps** — Cada ação atômica gera um step para animação (500ms/step)
4. **GoalCondition** — Verificada ao final da execução

**Tipos de nó AST:**
- `action` — Folhas: walk_forward, plant, water, turn_left, turn_right, pick_fruit, move_right/left/up/down, **if_canteiro_vazio_then_plantar (Nível 6 — condicional embutido, comportamento condicional dentro do handler, não no AST)**
- `loop` — Repetição N vezes (`repeat_3` da UI vira `LoopNode { times: 3 }` — Nível 5; `repeat_5` vira `LoopNode { times: 5 }` — Nível 6)
- `if` — Condicional com then/else no AST (declarado mas usado apenas pelo Nível 7+ futuro; o Nível 6 usa condicional embutido em `action`, não `IfNode`)

**ExecutionStep** carrega campo opcional `conditionResult?: boolean` (introduzido no Nível 6) — preenchido apenas por blocos condicionais embutidos. A UI usa pra colorir o destaque do bloco ativo (verde quando true, cinza quando false). Aditivo, não-retroativo.

**Estrutura do programa (camada UI):**
A partir do Nível 5, `ProgramBlock` aceita campo opcional `children?: ProgramBlock[]`. Programa deixa de ser array linear e passa a ser árvore — blocos estruturais (containers, ex: `repeat_3`) carregam seus filhos no slot interno. Conversão `ProgramBlock[] → ASTNode[]` é recursiva: blocos com filhos viram `LoopNode` (ou `IfNode` no futuro). Blocos folha viram `ActionNode`. Princípio de não-retroatividade preservado: Níveis 1-4 não declaram `children` e continuam executando idênticos.

**Componentes visuais:**
- `BlockPalette` — Blocos disponíveis (tap-to-add)
- `ProgramArea` — Programa montado (tap-to-remove). A partir do Nível 5 renderiza envelopes pros containers (Container/Simple block rows separados).
- `ExecuteButton` — Botão executar (idle/running/success/error)
- `LevelScene` — Grid visual do nível

**UX "modo edição via toque"** — padrão pra qualquer bloco com filhos. Tap em container na paleta cria envelope vazio + entra em modo edição. Próximos taps na paleta inserem dentro do envelope. Sai via tap no envelope ou botão "Pronto ✓". Validação de envelope vazio na saída. Ver `DECISIONS.md`.

Documentação detalhada em `docs/INTERPRETER.md`.

## 7. Identidade Visual

- **Paleta**: verde-jardim (#1F5F3F), dourado (#D4A744), branco quente (#FDFBF7), terras, azul céu
- **Tipografia**: Nunito (texto corrido), Fraunces (títulos)
- **Estilo**: flat-design contemporâneo com toques orgânicos
- **Animações**: suaves, contemplativas, ease-in-out

### 7.1. Sistema de Avatar (Pré-renderizado)

O avatar é uma **imagem única pré-renderizada** por combinação. Sem composição em runtime.

| Atributo | Opções | Quantidade |
|----------|--------|------------|
| Cor de pele (SkinTone) | `clara`, `media-escura` | 2 |
| Estilo do cabelo (HairStyle) | `lisocurto`, `lisomedio`, `cacheado` | 3 |
| Cor do cabelo (HairColor) | `castanhomedio`, `castanhoescuro`, `loiro` | 3 |
| Camiseta (Outfit) | `verde`, `amarelo` | 2 |

**Total de combinações:** 2 × 3 × 3 × 2 = **36 avatares**.
**Total de imagens:** 36 PNGs (~14MB).
**Dimensões:** 1024×1024px, RGBA com transparência real.

**Props do componente `<Avatar />`:**
- `skinTone`: `'clara'` | `'media-escura'`
- `hairStyle`: `'lisocurto'` | `'lisomedio'` | `'cacheado'`
- `hairColor`: `'castanhomedio'` | `'castanhoescuro'` | `'loiro'`
- `outfit`: `'verde'` | `'amarelo'`
- `size`: número (largura em px, altura auto-calculada)

**API de assets (`lib/assets/avatar.ts`):**
- `getAvatarAsset(skin, hairStyle, hairColor, outfit)` → retorna require() da imagem pré-renderizada
- Nomenclatura: `avatar_{skin}_{hairStyle}_{hairColor}_{outfit}.png`

### 7.2. Mascotes

3 mascotes disponíveis, cada um com 4 estados emocionais:

| Mascote | Estados | Tamanho |
|---------|---------|----------|
| Cachorro | padrao, atento, feliz, dormindo | 1024×1024px |
| Gato | padrao, atento, feliz, dormindo | 1024×1024px |
| Coelho | padrao, atento, feliz, dormindo | 1024×1024px |

**Total:** 12 PNGs
**MVP:** Usa apenas estado `padrao`. Outros 3 prontos para Sprint 2 (gameplay).

**Props do componente `<Mascote />`:**
- `type`: `'cachorro'` | `'gato'` | `'coelho'`
- `state`: `'padrao'` | `'atento'` | `'feliz'` | `'dormindo'` (default: `'padrao'`)
- `size`: número (square, default 200)

### 7.3. Estrutura de Assets

```
assets/
├── mascotes/                            # Flat structure (sem subpastas)
│   ├── cachorro_padrao.png
│   ├── cachorro_atento.png
│   ├── cachorro_feliz.png
│   ├── cachorro_dormindo.png
│   ├── gato_padrao.png
│   ├── ... (4 estados × 3 tipos = 12 PNGs)
│   └── coelho_dormindo.png
├── avatares/                            # Pré-renderizados (sem subpastas)
│   ├── avatar_clara_lisocurto_castanhomedio_verde.png
│   ├── avatar_clara_lisocurto_castanhomedio_amarelo.png
│   ├── ... (36 combinações)
│   └── avatar_media-escura_cacheado_loiro_amarelo.png
├── mundo/                              # Cenário da Tela Mundo
│   ├── mundo_terreno_vazio.png          # Background full-screen (912×1600)
│   ├── mundo_pedra.png                  # Cenário ao fundo (1062×880, sem sombra)
│   ├── mundo_tronco.png                 # Cenário ao fundo (1426×624, sem sombra)
│   └── mundo_sementinha.png             # Recompensa nível 1 (838×580, transp.)
└── fonts/
    ├── Nunito-*.ttf
    └── Fraunces-*.ttf
```

**Total de assets visuais:** 52 PNGs (36 avatares + 12 mascotes + 4 mundo)

### 7.4. Composição da Tela Mundo (WORLD_LAYOUT)

A Tela Mundo segue princípios de ilustração de livro infantil com hierarquia de profundidade:

| Elemento | Papel | Posição | Tamanho |
|----------|-------|---------|----------|
| Pedra | Cenário (fundo) | top: 52%, left: 5% | 14% width |
| Tronco | Cenário (fundo) | top: 56%, right: 8% | 20% width |
| Avatar | Protagonista (1º plano) | top: 58%, left: 32% | 32% width |
| Mascote | Companheiro (1º plano) | top: 70%, left: 55% | 24% width |
| Sementinha | Recompensa (relativa ao avatar) | bottom: -8%, left: 35% do container avatar | 30% do container |
| Botão ▶ | UI | bottom: 6%, right: 6% | 64×64px |

**Regra da sementinha:** Renderizada dentro do container do avatar (posição relativa, não absoluta). Se a posição do avatar mudar, a sementinha acompanha automaticamente.

**Z-order (ordem de renderização):**
1. Background (ImageBackground)
2. Cenário estático (pedra, tronco)
3. Container avatar + sementinha
4. Mascote
5. UI (botão play)

## 8. Build e Distribuição

| Perfil | Uso | Formato | Notas |
|--------|-----|---------|-------|
| `development` | Debug com tela de erro visível | `.apk` | Inclui `expo-dev-client` |
| `preview` | Teste de produção no device | `.apk` | Sem dev tools |
| `production` | Play Store (futuro) | `.aab` | Signing de produção |

- **Sem iOS no MVP**

## 9. Observabilidade e Debug

### 9.1. Sentry (Crash Reporting)

- **SDK:** `@sentry/react-native`
- **Inicialização:** Primeiro import no `_layout.tsx`, antes de qualquer outro módulo. Garante captura de crashes na inicialização.
- **DSN:** Via variável de ambiente `EXPO_PUBLIC_SENTRY_DSN`
- **Funcionalidades ativas:**
  - Captura automática de exceções JS não tratadas
  - Captura de crashes nativos (Android)
  - Performance tracing (`tracesSampleRate: 1.0`)
  - Error boundary automático via `Sentry.wrap()`
- **Dashboard:** Acessível em sentry.io pela org do projeto
- **Quando usar:** Todo crash em builds `preview` ou `production` aparece automaticamente no dashboard com stack trace, device info, e breadcrumbs.

### 9.2. Development Build

- Build com `expo-dev-client` que mostra tela vermelha com stack trace completo diretamente no dispositivo
- Usado para diagnóstico rápido quando Sentry não captura (ex: crash antes da inicialização do JS)
- Perfil `development` no `eas.json`

### 9.3. Fluxo de Debug

1. **Crash em preview/production** → Verificar dashboard Sentry
2. **Sentry não capturou** → Gerar build `development`, reproduzir, ler tela vermelha
3. **Crash antes do JS carregar** → Analisar logs do EAS Build (fase Run Gradlew)

---

## 10. Decisões Arquiteturais Importantes

1. **Offline-first**: o app deve funcionar 100% sem internet após primeira abertura
2. **Interpretador client-side**: toda lógica de execução roda no device, não no servidor
3. **Mundo permanente com background substituível**: o `ImageBackground` da Tela Mundo escolhe entre `mundo_terreno_vazio.png` (v1) e `background_mundo_v2.png` (v2 — desbloqueado no Nível 5) baseado em `WORLD_ELEMENTS`. O Nível 10 fará uma segunda substituição radical (background árido). Padrão: `{ add: "background_mundo_vN", replaces: "background_mundo_vN-1" }` na reward do nível.
4. **Arquitetura aberta para missões especiais**: embora não implementadas no MVP, a estrutura de carregamento de cenários deve prever cenários temporários isolados do mundo permanente
5. **Sem mecânicas viciantes**: nenhum streak, timer, loot box ou moeda premium na arquitetura
6. **SafeAreaView sempre de `react-native-safe-area-context`**: nunca usar o SafeAreaView nativo do `react-native` (só funciona no iOS). `SafeAreaProvider` envolve o app inteiro no `_layout.tsx`
7. **Navegação pós-onboarding**: botão "voltar" em telas de gameplay usa `router.replace('/world')`, nunca `router.back()`. Evita retorno acidental ao fluxo de onboarding
