# Arquitetura — Norte Code MVP

**Última atualização:** 02/05/2026
**Versão:** 0.1.0 (Setup Inicial)

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
- Auth anônima via Supabase (device_id como identificador)
- Sem coleta de dados pessoais (COPPA/LGPD compliance)

### 5.2. Tabelas (Supabase)
- `players` — dados do jogador (avatar, pet, device_id)
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

## 8. Build e Distribuição

- **Preview**: `.apk` via EAS Build (profile: preview)
- **Produção futura**: `.aab` via EAS Build (profile: production) → Play Store
- **Sem iOS no MVP**

## 9. Decisões Arquiteturais Importantes

1. **Offline-first**: o app deve funcionar 100% sem internet após primeira abertura
2. **Interpretador client-side**: toda lógica de execução roda no device, não no servidor
3. **Mundo permanente com transição visual**: após nível 5, o cenário muda (jardim → terreno árido). A arquitetura de renderização do mundo deve suportar múltiplos "biomas"
4. **Arquitetura aberta para missões especiais**: embora não implementadas no MVP, a estrutura de carregamento de cenários deve prever cenários temporários isolados do mundo permanente
5. **Sem mecânicas viciantes**: nenhum streak, timer, loot box ou moeda premium na arquitetura
