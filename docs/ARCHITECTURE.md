# Arquitetura — Norte Code MVP

**Última atualização:** 03/05/2026
**Versão:** 0.3.0 (Assets v3 — Gemini Pro + Avatar 3-Layer)

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
│   │   └── avatar.tsx            # Customização de avatar
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
│   └── interpreter/              # Motor de execução dos blocos
│       ├── index.ts              # Exports públicos
│       ├── blocks.ts             # Definição de tipos de blocos
│       ├── interpreter.ts        # Executor do programa
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
  │     welcome → pet-choice → pet-name → avatar → world
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
- `players` — dados do jogador (avatar_skin, avatar_hair_style, avatar_hair_color, avatar_outfit, pet_type, pet_name)
- `level_progress` — progresso por nível (completed, attempts)
- `world_elements` — elementos visuais desbloqueados no mundo
- `narrative_chapters_viewed` — capítulos já vistos

### 5.3. Persistência
- **Offline-first**: toda lógica roda client-side
- AsyncStorage guarda estado local
- Supabase sincroniza em background quando há conexão
- Se offline, app funciona normalmente com dados locais

## 6. Interpretador de Blocos

O interpretador é o **núcleo do app**. Ele:
1. Recebe um programa (array de blocos montados pela criança)
2. Recebe o estado inicial do mundo do nível (grid, entidades)
3. Executa bloco a bloco, gerando "steps" para animação
4. Retorna resultado (sucesso/falha) + estado final

Suporta: sequência, loops (aninhados), condicionais (if/else), variáveis (contador), funções (definir/chamar).

Documentação detalhada em `docs/INTERPRETER.md`.

## 7. Identidade Visual

- **Paleta**: verde-jardim (#1F5F3F), dourado (#D4A744), branco quente (#FDFBF7), terras, azul céu
- **Tipografia**: Nunito (texto corrido), Fraunces (títulos)
- **Estilo**: flat-design contemporâneo com toques orgânicos
- **Animações**: suaves, contemplativas, ease-in-out

### 7.1. Sistema de Avatar (3 Layers)

O avatar é renderizado por composição de **3 camadas** PNG transparentes (1024×1024px) sobrepostas no mesmo canvas:

| Layer | Ordem (z-index) | Variações | Exemplo de arquivo |
|-------|-----------------|-----------|--------------------|
| Corpo (pele) | 1 (base) | 4 tons de pele | `corpo_pele1_clara.png` |
| Roupa (camiseta) | 2 (meio) | 3 cores | `roupa_verde.png` |
| Cabelo | 3 (topo) | 16 combos (4 estilos × 4 cores) | `cabelo_curtoliso_castanho-escuro.png` |

**Nota:** Todas as layers compartilham o mesmo canvas 1024×1024 com o personagem na mesma posição e escala. As layers se sobrepõem perfeitamente quando empilhadas com `position: absolute` no mesmo container.

**Total de combinações:** 4 skins × 3 outfits × 4 estilos × 4 cores = **192 avatares possíveis**.
**Total de imagens:** 4 corpos + 3 roupas + 16 cabelos = **23 PNGs** (~5MB).

**Props do componente `<Avatar />`:**
- `skinTone`: `'clara'` | `'media-clara'` | `'media-escura'` | `'escura'`
- `hairStyle`: `'curtoliso'` | `'curtobaguncado'` | `'longoliso'` | `'cacheado'`
- `hairColor`: `'castanho-escuro'` | `'castanho-medio'` | `'castanho-claro'` | `'loiro-mel'`
- `outfit`: `'verde'` | `'azul'` | `'amarela'`
- `size`: número (largura/altura em px)

**API de assets (`lib/assets/avatar.ts`):**
- `getBodyAsset(skinTone)` → retorna require() do corpo (só pele)
- `getOutfitAsset(outfit)` → retorna require() da roupa
- `getHairAsset(style, color)` → retorna require() do cabelo

### 7.2. Mascotes

3 mascotes disponíveis, cada um com 5 estados emocionais:

| Mascote | Estados | Tamanho |
|---------|---------|----------|
| Cachorro | padrão, atento, feliz, pensativo, dormindo | 1024×1024px |
| Gato | padrão, atento, feliz, pensativo, dormindo | 1024×1024px |
| Coelho | padrão, atento, feliz, pensativo, dormindo | 1024×1024px |

**Total:** 15 PNGs (~7MB)

**Props do componente `<Mascote />`:**
- `type`: `'cachorro'` | `'gato'` | `'coelho'`
- `state`: `'padrao'` | `'atento'` | `'feliz'` | `'pensativo'` | `'dormindo'` (default: `'padrao'`)
- `width`: número (altura calculada automaticamente)

### 7.3. Estrutura de Assets

```
assets/
├── mascotes/
│   ├── cachorro/
│   │   ├── cachorro_padrao.png
│   │   ├── cachorro_atento.png
│   │   ├── cachorro_feliz.png
│   │   ├── cachorro_pensativo.png
│   │   └── cachorro_dormindo.png
│   ├── gato/
│   │   └── ... (5 estados)
│   └── coelho/
│       └── ... (5 estados)
├── avatar/
│   ├── corpos/                          # Body layer (só pele)
│   │   ├── corpo_pele1_clara.png
│   │   ├── corpo_pele2_media-clara.png
│   │   ├── corpo_pele3_media-escura.png
│   │   └── corpo_pele4_escura.png
│   ├── roupas/                          # Outfit layer (camiseta)
│   │   ├── roupa_verde.png
│   │   ├── roupa_azul.png
│   │   └── roupa_amarela.png
│   └── cabelos/                         # Hair layer (pré-posicionado no canvas)
│       ├── cabelo_curtoliso_castanho-escuro.png
│       ├── cabelo_curtoliso_castanho-medio.png
│       ├── ... (16 combinações: 4 estilos × 4 cores)
│       └── cabelo_cacheado_loiro-mel.png
└── fonts/
    ├── Nunito-*.ttf
    └── Fraunces-*.ttf
```

**Total de assets visuais:** 38 PNGs (~12MB)

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
3. **Mundo permanente com transição visual**: após nível 5, o cenário muda (jardim → terreno árido). A arquitetura de renderização do mundo deve suportar múltiplos "biomas"
4. **Arquitetura aberta para missões especiais**: embora não implementadas no MVP, a estrutura de carregamento de cenários deve prever cenários temporários isolados do mundo permanente
5. **Sem mecânicas viciantes**: nenhum streak, timer, loot box ou moeda premium na arquitetura
