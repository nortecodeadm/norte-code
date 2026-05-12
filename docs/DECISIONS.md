# Log de Decisões Técnicas — Norte Code

**Última atualização:** 02/05/2026

---

## Formato

Cada entrada segue o padrão:

> **[DATA] DECISÃO:** Descrição
> **Contexto:** Por que essa decisão foi necessária
> **Alternativas consideradas:** O que mais foi avaliado
> **Resultado:** O que foi escolhido e por quê

---

## Decisões

### [02/05/2026] Template Expo: tabs → custom

**Decisão:** Usar o template `tabs` do Expo como base e remover toda a estrutura de tabs, substituindo por navegação Stack pura.

**Contexto:** O Norte Code não usa tabs. A navegação é linear (splash → onboarding → mundo → níveis). O template `tabs` foi escolhido como ponto de partida porque já vem com Expo Router, TypeScript, e Reanimated configurados, economizando setup manual.

**Alternativas:** Template `blank` (mais limpo, mas sem Reanimated/Router pré-configurados). Template `default` (sem Router).

**Resultado:** Template `tabs` como base, com remoção completa dos arquivos de tabs e substituição pela estrutura de navegação do Norte Code.

---

### [02/05/2026] Fontes: expo-google-fonts → assets locais

**Decisão:** Baixar as fontes Nunito e Fraunces do pacote `@expo-google-fonts` e copiá-las para `assets/fonts/` como arquivos estáticos.

**Contexto:** O briefing define Nunito (texto corrido) e Fraunces (títulos) como tipografia obrigatória. Usar os pacotes `@expo-google-fonts` diretamente no runtime exige download em tempo de execução, o que viola o requisito de funcionamento offline.

**Alternativas:** (1) Usar `@expo-google-fonts` com `useFonts()` direto — depende de rede na primeira carga. (2) Baixar manualmente do Google Fonts — dificuldade com URLs de download.

**Resultado:** Instalar os pacotes `@expo-google-fonts/nunito` e `@expo-google-fonts/fraunces` como dependência de desenvolvimento, copiar os `.ttf` estáticos para `assets/fonts/`, e carregá-los via `useFonts()` do `expo-font` apontando para os arquivos locais. Funciona 100% offline.

---

### [02/05/2026] NativeWind v4 (não v5)

**Decisão:** Usar NativeWind v4 com Tailwind CSS 3.4.x.

**Contexto:** NativeWind v5 está em pre-release e há relatos de incompatibilidade com Expo SDK 54 (Reddit, GitHub issues). O briefing pede estabilidade e qualidade acima de features novas.

**Alternativas:** NativeWind v5 (mais features, mas instável com SDK 54). StyleSheet puro (mais verboso, sem utilidade do Tailwind).

**Resultado:** NativeWind v4 com babel preset + metro config. Estável, documentado, funciona com SDK 54.

---

### [02/05/2026] Paleta de cores no Tailwind config

**Decisão:** Definir toda a paleta da marca Norte Code diretamente no `tailwind.config.js` como cores customizadas.

**Contexto:** O briefing define cores específicas (garden-green #1F5F3F, gold #D4A744, warm-white #FDFBF7, earth, sky). Centralizar no config garante consistência em todo o app e facilita ajustes futuros.

**Alternativas:** Constantes em arquivo separado importadas manualmente. CSS variables (não suportado bem no NativeWind v4).

**Resultado:** Cores definidas em `tailwind.config.js` com escalas completas (50-900) para as cores principais, permitindo uso como `bg-garden-green`, `text-gold-200`, etc.

---

### [02/05/2026] Supabase Auth: anônimo puro (sem device_id)

**Decisão:** Usar Supabase Anonymous Auth puro, sem login com email/senha e sem vinculação por device_id.

**Contexto:** Crianças de 7-10 não criam contas. COPPA/LGPD complicam coleta de dados infantis. O MVP precisa de zero fricção para validar a tese do produto.

**Alternativas:** Login com email dos pais (fricção alta, escopo de MVP). Sem backend (perde analytics e backup).

**Resultado:** Auth anônima pura. Cada instalação gera UUID via sign-in anônimo, vincula ao Supabase Auth. Progresso salva local (AsyncStorage) + remote (Supabase). Nenhum dado pessoal coletado. Ver decisão posterior sobre remoção de device_id.

---

### [02/05/2026] Estrutura do interpretador: step-based

**Decisão:** O interpretador gera uma lista de steps (ações atômicas) em vez de executar em tempo real.

**Contexto:** Para animar a execução do programa da criança, precisamos de controle frame-a-frame. Executar em tempo real não permite replay, pausa, ou animação suave.

**Alternativas:** Execução em tempo real com callbacks (mais complexo de animar). Execução completa + replay (escolhido).

**Resultado:** `executeProgram()` retorna `ExecutionResult` com array de `ExecutionStep`. O componente de animação consome os steps sequencialmente com delay configurável.

---

### [02/05/2026] Auth anônima pura: remoção de device_id

**Decisão:** Remover a coluna `device_id` da tabela `players`. Auth anônima pura, sem tentativa de vinculação por dispositivo.

**Contexto:** O schema original incluía `device_id TEXT UNIQUE NOT NULL` como forma de recuperar progresso em caso de reinstalação. Porém, no Android 10+ os identificadores de dispositivo são randomizados por privacidade (Scoped Storage, ANDROID_ID por app), tornando `device_id` não confiável entre reinstalações. Cria falsa expectativa de recuperação que vai falhar na prática.

**Alternativas consideradas:**
1. Manter `device_id` como fallback — rejeitado porque Android moderno invalida a premissa.
2. Vincular conta de pai (email/senha do adulto) — solução real de recuperação, mas escopo pós-MVP.
3. Auth anônima pura sem `device_id` — aceito.

**Resultado:** 
- Coluna `device_id` removida da tabela `players`
- `players.id` = `auth.uid()` (UUID gerado pelo Supabase Anonymous Auth)
- Fluxo: app abre → restaura sessão local → se não tem, sign-in anônimo → UUID gerado → onboarding → INSERT em players com `id = auth.uid()`
- Recuperação real de progresso (vinculação de conta parental) entra pós-MVP
- Chave `DEVICE_ID` removida do storage local (não mais necessária)

**Decisor:** Gui (via análise do Manus que identificou a inconsistência)

---

### [02/05/2026] Build profile "development" com dev client

**Decisão:** Adicionar perfil `development` no `eas.json` com `developmentClient: true` e `distribution: internal`, gerando APK com dev client embutido.

**Contexto:** O app crashava silenciosamente em builds `preview` (produção-like) sem mostrar nenhuma mensagem de erro. Sem emulador Android disponível no ambiente de desenvolvimento (sandbox sem KVM), e sem ADB conectado ao dispositivo físico, não havia forma de capturar stack traces de crashes nativos. O dev client mostra a "tela vermelha" com stack trace completo diretamente no dispositivo.

**Alternativas consideradas:**
1. Pedir ao Gui pra rodar `adb logcat` — requer setup de ADB no PC dele.
2. Adicionar logging remoto (Sentry) — complementar, mas não resolve crash na inicialização antes do Sentry carregar.
3. Build de development com dev client — mostra erro na tela, zero setup extra.

**Resultado:** Perfil `development` configurado no `eas.json`. Usado como ferramenta de diagnóstico quando builds `preview` crasham. O fluxo de debug passa a ser: build development → instala → vê erro na tela → corrige → build preview pra validar.

**Decisor:** Gui

---

### [02/05/2026] Sentry para monitoramento de crashes em produção

**Decisão:** Integrar `@sentry/react-native` para captura automática de crashes, erros JS e performance.

**Contexto:** Após a experiência de crash silencioso no build preview, ficou claro que precisamos de telemetria de erros para builds que rodam fora do ambiente de desenvolvimento. Sentry captura crashes automaticamente e envia para dashboard acessível remotamente.

**Alternativas consideradas:**
1. Sem monitoramento (status quo) — cego pra erros em produção.
2. Firebase Crashlytics — bom, mas requer Google Services e setup mais pesado.
3. Sentry — SDK oficial pra Expo/React Native, plano free generoso, setup simples.

**Resultado:** 
- `@sentry/react-native` instalado como dependência
- Plugin configurado no `app.json`
- Inicialização condicional no `_layout.tsx` (só ativa se `EXPO_PUBLIC_SENTRY_DSN` estiver preenchido)
- Componente root wrapped com `Sentry.wrap()` para error boundary automático
- DSN será fornecido pelo Gui após criar conta no Sentry (plano free)

**Decisor:** Gui

---

### [03/05/2026] Migração para valores semânticos e assets reais

**Decisão:** Substituir valores genéricos (`skin_1`, `hair_1`, `outfit_1`, `dog`/`cat`/`rabbit`) por valores semânticos que correspondem exatamente aos nomes dos arquivos de assets (`clara`, `curtoliso`, `castanho-escuro`, `cachorro`, etc.).

**Contexto:** Os assets visuais reais foram entregues pelo Claude (Lotes 1 e 2) com nomenclatura semântica em português. Para manter consistência entre código, banco, e arquivos, os tipos TypeScript e colunas do banco precisam usar os mesmos nomes. Além disso, a coluna `avatar_hair` foi separada em `avatar_hair_style` e `avatar_hair_color` para refletir a composição real dos assets (ex: `cabelo_curtoliso_castanho-escuro.png`).

**Alterações:**
- `pet_type`: `dog`/`cat`/`rabbit` → `cachorro`/`gato`/`coelho`
- `avatar_skin`: `skin_1..4` → `clara`/`media-clara`/`media-escura`/`escura`
- `avatar_hair` removido → `avatar_hair_style` + `avatar_hair_color`
- `avatar_hair_style`: `curtoliso`/`curtobaguncado`/`longoliso`/`cacheado`
- `avatar_hair_color`: `castanho-escuro`/`castanho-medio`/`castanho-claro`/`loiro-mel`
- `avatar_outfit`: `outfit_1..3` → `verde`/`azul`/`amarela`

**Padrão:** Tudo lowercase, sem acento, separado por hífen quando composto.

**Migration:** `docs/migrations/0002_avatar_semantic_values.sql`

**Decisor:** Gui

---

### [03/05/2026] Assets visuais: geração por IA (Claude) para MVP

**Decisão:** Usar assets gerados por IA (via Claude) para o MVP, com possibilidade de substituir por ilustrações profissionais no lançamento.

**Contexto:** O app usava emojis como placeholder para mascotes e avatar. Para testar com o Benjamin (usuário-piloto), precisamos de visuais que representem a identidade da marca sem investir em ilustrador neste momento.

**Assets recebidos (Lotes 1 e 2):**
- 3 mascotes (cachorro, gato, coelho) com 3 estados cada (padrão, feliz, triste) — 512×512px
- Avatar componentizado em layers: 4 corpos (pele), 16 cabelos (4 estilos × 4 cores), 3 roupas — 512×512px
- Manequim de referência para alinhamento de layers

**Resultado:** Assets integrados como `require()` estáticos no bundle. Componentes `<Avatar />` e `<Mascote />` criados para renderização por composição de layers.

**Decisor:** Gui

---

### [03/05/2026] Fix: Xadrez de transparência incorporado nos PNGs

**Decisão:** Reprocessar todos os 38 PNGs de avatar e mascotes com rembg (AI background removal) para restaurar transparência real.

**Contexto:** Ao testar o build no dispositivo, todos os assets apareciam com fundo xadrez cinza/branco visível — o padrão clássico de "transparência" de editores gráficos. Investigação revelou que o xadrez estava **incorporado nos dados RGB** dos arquivos, não era transparência real. O canal alpha existia mas estava todo em 255 (opaco). Isso aconteceu durante a geração/exportação dos assets pela IA — o fundo de transparência foi "achatado" (flattened) junto com a ilustração.

**Diagnóstico realizado:**
1. Hipótese 1 (arquivos corrompidos): `file *.png` retornou "RGBA" — canal alpha presente. Mas análise com PIL mostrou 0% de pixels transparentes. **Causa raiz confirmada:** xadrez é dado RGB real.
2. Hipótese 2 (componente Image): Descartada — o componente não adiciona background.
3. Hipótese 3 (Metro bundler): Descartada — metro.config.js e app.json não fazem conversão de assets.

**Alternativas de solução:**
1. Detecção algorítmica de xadrez (v1 e v2) — tentou detectar blocos alternados e restaurar alpha. Resultado: artefatos nas bordas, qualidade insuficiente.
2. rembg (AI background removal) — modelo U2-Net remove fundo automaticamente. Resultado: perfeito em todos os 38 PNGs, sem artefatos.

**Resultado:** Todos os assets reprocessados com rembg. Transparência real restaurada. Tamanho reduzido de ~100MB para ~1MB após otimização.

**Decisor:** Gui

---

### [03/05/2026] Arquitetura do Avatar: de 3 layers para 2 layers (dressed body + hair)

**Decisão:** Mudar o sistema de composição do avatar de 3 layers independentes (corpo + roupa + cabelo) para 2 layers (corpo vestido + cabelo).

**Contexto:** Após restaurar a transparência, descobriu-se que os assets originais não eram layers composíveis — cada um foi gerado como ilustração standalone com escala e posição diferentes. O cabelo cobria o rosto inteiro, a roupa cobria a face. O componente `<Avatar />` estava correto (3 `<Image>` empilhadas), mas os assets não se alinhavam.

**Investigação de composição:**
- Testou-se composição normal, reversa, híbrida com máscara, e crop na testa
- Nenhuma produzia resultado aceitável com os assets originais
- Conclusão: os assets precisavam ser re-gerados como layers composíveis

**Solução implementada:**
1. **Corpos vestidos (pré-compostos):** Corpo original + colorização programática da camiseta branca. A camiseta branca do corpo base é detectada por HSV (alta luminosidade, baixa saturação, na região do torso) e recolorida para verde/azul/amarela. Resultado: 4 skins × 3 outfits = 12 imagens.
2. **Cabelos (re-gerados):** 4 estilos gerados por IA como layers isoladas, posicionados programaticamente no mesmo canvas 512×512 do corpo. Recoloridos via hue-shift para 4 cores. Resultado: 4 estilos × 4 cores = 16 imagens.
3. **Mascotes:** Reprocessados com rembg, redimensionados para 512×512.

**Mudanças no código:**
- `lib/assets/avatar.ts`: Novo mapeamento com `getBodyAsset(skin, outfit)` e `getHairAsset(style, color)`. Sem mais `getOutfitAsset()`.
- `components/Avatar.tsx`: 2 `<Image>` layers (body + hair) em vez de 3. Ambas usam `resizeMode="contain"` no mesmo container.
- `app/onboarding/avatar.tsx` e `app/world.tsx`: Sem mudanças — já usavam `<Avatar />` com as mesmas props.

**Resultado:**
- 28 imagens de avatar (12 corpos + 16 cabelos) + 15 mascotes = 43 total
- Tamanho total: ~1MB (era ~100MB)
- 192 combinações possíveis (4 skins × 3 outfits × 4 estilos × 4 cores)
- Composição funciona perfeitamente — rosto visível em todas as combinações

**Decisor:** Gui


---

### [03/05/2026] Assets v3: Tratamento profissional via Gemini Pro — volta ao sistema 3 layers

**Decisão:** Re-tratar todos os assets com Gemini Pro (IA de geração de imagem) e voltar ao sistema de 3 layers independentes (corpo + roupa + cabelo).

**Contexto:** Os assets v2 (gerados/tratados programaticamente pelo Manus) não atingiram qualidade visual suficiente. O Gui decidiu usar outra IA (Gemini Pro) para tratar as imagens originais com mais qualidade. O Manus preparou um briefing detalhado com as especificações técnicas, e o Gui executou o tratamento via Gemini Pro, que entregou 38 PNGs com:
- Transparência real (canal alpha funcional, 56-95% de pixels transparentes)
- Canvas padronizado 1024×1024 para todas as peças
- Posicionamento correto por categoria — layers se sobrepõem perfeitamente

**Mudança arquitetural:** O sistema volta de 2 layers (dressed body + hair) para **3 layers independentes** (corpo + roupa + cabelo), porque a Gemini Pro conseguiu gerar a roupa como layer separada que se alinha corretamente ao corpo.

**Mudanças no código:**
- `lib/assets/avatar.ts`: Novo mapeamento com `getBodyAsset(skin)`, `getOutfitAsset(outfit)`, e `getHairAsset(style, color)`. Body agora é indexado só por skin (4 imagens), outfit separado (3 imagens).
- `components/Avatar.tsx`: 3 `<Image>` layers (body + outfit + hair) com `position: absolute` no mesmo container.
- Nomes dos arquivos de corpo: `corpo_pele1_clara.png`, `corpo_pele2_media-clara.png`, etc.
- Nomes dos arquivos de roupa: `roupa_verde.png`, `roupa_azul.png`, `roupa_amarela.png`

**Resultado:**
- 23 imagens de avatar (4 corpos + 3 roupas + 16 cabelos) + 15 mascotes = 38 total
- Tamanho total: ~12MB (1024×1024, qualidade profissional)
- 192 combinações possíveis (4 skins × 3 outfits × 4 estilos × 4 cores)
- Composição validada: rosto visível, cabelo na cabeça, roupa no torso

**Decisor:** Gui

---

### [03/05/2026] Banco de dados: migração já aplicada, tabela vazia

**Decisão:** Confirmar que a migração `avatar_hair → avatar_hair_style + avatar_hair_color` já foi aplicada e a tabela `players` está vazia (sem registros antigos para deletar).

**Contexto:** Ao verificar o Supabase, a coluna `avatar_hair` não existe mais (erro 42703 ao tentar selecionar). As colunas `avatar_hair_style` e `avatar_hair_color` já existem e respondem corretamente. A tabela retorna `[]` (vazia). Nenhuma ação de migração ou DELETE necessária.

**Resultado:** Banco pronto para receber novos registros com o schema correto.

**Decisor:** Manus (verificação automatizada)


---

### [04/05/2026] Avatar: composição em runtime → pré-renderizado

**Decisão:** Abandonar o sistema de 3 layers compostas em runtime (corpo + roupa + cabelo) e adotar avatares pré-renderizados (36 imagens únicas, uma por combinação).

**Contexto:** Após 3 iterações tentando composição em layers:
1. Assets originais tinham xadrez de transparência "queimado" nos pixels RGB
2. Após rembg, layers ficaram com transparência real mas não se alinhavam (cada uma gerada com escala/posição diferente)
3. Tentativa de re-gerar com canvas padronizado produziu resultado visual insuficiente

A Gemini Pro foi usada para gerar os avatares finais como imagens completas pré-renderizadas, com qualidade visual muito superior.

**Alternativas consideradas:**
- Composição em runtime com 3 layers (complexo, propenso a bugs de alinhamento)
- Composição em runtime com 2 layers (corpo vestido + cabelo — melhor mas ainda com problemas de escala)
- Pré-renderizado (36 imagens) — escolhido

**Resultado:**
- 36 avatares pré-renderizados: 2 skins × 3 estilos × 3 cores × 2 outfits
- Componente `<Avatar />` simplificado para single `<Image />`
- Zero risco de bugs de composição em runtime
- Trade-off: mais imagens no bundle (~14MB), mas eliminação total de complexidade visual

**Decisor:** Gui (mudança de estratégia) + Gemini Pro (geração) + Manus (implementação)

---

### [04/05/2026] Mascotes: 5 estados → 4 estados, flat structure

**Decisão:** Reduzir de 5 estados (padrao, atento, feliz, pensativo, dormindo) para 4 (padrao, atento, feliz, dormindo). Mudar de subpastas por tipo para flat structure.

**Contexto:** O estado "pensativo" não tinha uso claro no gameplay planejado. A flat structure (`{tipo}_{estado}.png`) simplifica os requires e elimina subpastas desnecessárias.

**Resultado:**
- 12 mascotes: 3 tipos × 4 estados
- MVP usa apenas `padrao`; outros 3 prontos para Sprint 2
- Componente `<Mascote />` aceita prop `state` para fácil swap futuro

**Decisor:** Gui (briefing IMPLEMENTACAO_AVATAR_E_MASCOTE.md)

---

### [04/05/2026] Tipos MVP: redução de opções

**Decisão:** Reduzir opções de customização para o MVP visual.

**Mudanças:**
| Atributo | Antes | Agora (MVP) |
|----------|-------|-------------|
| Skin | 4 (clara, media-clara, media-escura, escura) | 2 (clara, media-escura) |
| Hair Style | 4 (curtoliso, curtobaguncado, longoliso, cacheado) | 3 (lisocurto, lisomedio, cacheado) |
| Hair Color | 4 (castanho-escuro, castanho-medio, castanho-claro, loiro-mel) | 3 (castanhomedio, castanhoescuro, loiro) |
| Outfit | 3 (verde, azul, amarela) | 2 (verde, amarelo) |
| **Total combinações** | **192** | **36** |

**Contexto:** Menos combinações = menos imagens pré-renderizadas = bundle menor + geração mais rápida. Expansão planejada para pós-MVP.

**Decisor:** Gui (briefing)

---

### [05/05/2026] Interpretador AST em JSON (alinhamento com Claude)

**Decisão:** Adotar formato AST JSON onde o mesmo JSON renderiza a UI dos blocos E é executado pelo interpretador. Sem duplicação de estado.

**Contexto:** Alinhamento com Claude definiu a estrutura: Program (raiz com body[]), Action (folhas com name), Loop (times + body[]), If (condition + then[] + else[]). Essa estrutura é recursiva e extensível.

**Alternativas:** (1) Modelo flat de blocos com IDs e referências — mais complexo de executar recursivamente. (2) Compilar blocos para linguagem intermediária — over-engineering para MVP.

**Resultado:** AST JSON implementado em `lib/interpreter/interpreter.ts`. Engine recursiva que percorre a árvore, executa ações no WorldState, e gera ExecutionSteps para animação. Documentado em INTERPRETER.md.

---

### [05/05/2026] Tela de transição pós-onboarding

**Decisão:** Adicionar tela intermediária entre onboarding e Tela Mundo com texto narrativo fixo: "Este é o seu lugar. Ainda está vazio. Vamos cuidar dele juntos?"

**Contexto:** Alinhamento com Claude definiu que a transição entre onboarding e gameplay precisa de um momento de pausa narrativa. Texto definitivo, não improvisado.

**Alternativas:** (1) Ir direto pro Mundo — abrupto. (2) Animação elaborada — fora do escopo MVP.

**Resultado:** Tela `app/onboarding/transition.tsx` com texto centralizado em Fraunces/Lora, botão "Vamos!" verde-jardim. Fundo neutro, mesma identidade visual.

---

### [05/05/2026] Gameplay: tap-to-add ao invés de drag-and-drop

**Decisão:** No MVP, blocos são adicionados ao programa por tap (toque) na paleta. Remoção por tap no bloco na ProgramArea.

**Contexto:** Drag-and-drop em React Native requer bibliotecas adicionais (react-native-gesture-handler com reordenação) e é complexo de implementar bem para crianças de 7-10 anos. Tap é mais simples e confiável.

**Alternativas:** (1) Drag-and-drop completo — complexo, pode ser frustrante para crianças. (2) Drag-and-drop simplificado — ainda requer gesture handler.

**Resultado:** Tap-to-add implementado. Drag-and-drop pode ser adicionado em versão futura como melhoria de UX.

---

### [05/05/2026] Animação de execução: 500ms por step

**Decisão:** Cada ExecutionStep é reproduzido com 500ms de intervalo, com highlight do bloco ativo na ProgramArea.

**Contexto:** Crianças precisam ver o que cada bloco faz. Muito rápido = não entende. Muito lento = perde atenção. 500ms é o sweet spot baseado em referências (Scratch Jr usa ~400ms, Code.org usa ~600ms).

**Alternativas:** (1) Velocidade configurável — complexidade desnecessária no MVP. (2) Animação contínua sem steps — perde a conexão bloco↔ação.

**Resultado:** 500ms fixo, com possibilidade de ajuste futuro via `InterpreterConfig.stepDelay`.

---

### [05/05/2026] Tela Mundo: background real + posicionamento relativo

**Contexto:** Assets da Tela Mundo entregues pelo Gui (mundo_terreno_vazio, pedra, tronco, sementinha). Precisava definir como posicionar elementos sobrepostos de forma responsiva.

**Alternativas consideradas:**
1. Pixels absolutos — quebra em telas diferentes
2. Porcentagens via string — TypeScript strict não aceita em React Native style
3. Porcentagens computadas (pctW/pctH helpers) — type-safe e responsivo

**Resultado:** Opção 3. Helpers `pctW(p)` e `pctH(p)` convertem porcentagem em pixels usando `Dimensions.get("window")`. Z-order implícito pela ordem de renderização: BG → elementos estáticos → recompensas → personagens → UI.

---

### [05/05/2026] Nomes só em contexto narrativo

**Contexto:** Gui definiu regra: nem nome do avatar nem nome do mascote devem aparecer como label/header permanente. Nomes só aparecem em textos narrativos que se referem ao personagem.

**Alternativas consideradas:** Nenhuma — decisão de produto do Gui.

**Resultado:** Removidos todos os labels de nome da Tela Mundo. Nomes usados apenas em: resumo pós-nível, introdução de nível, capítulos narrativos futuros. UI mais limpa, foco no cenário e ação.

---

### [05/05/2026] Nova tela "Nome do Avatar" no onboarding

**Contexto:** App pedia nome do mascote mas não do jogador. Gui adicionou ao escopo.

**Alternativas consideradas:** Nenhuma — funcionalidade necessária.

**Resultado:** Nova tela `player-name.tsx` entre avatar customization e pet-choice. Validação: 1-20 chars, letras/números/espaços/acentos, trim, preserva capitalização. Persistência: coluna `player_name` (text NOT NULL DEFAULT '') na tabela `players`.

---

### [05/05/2026] UX do Nível 1: instrução contextual + hint + feedback de erro

**Contexto:** Gui reportou que não ficava claro o que fazer no Nível 1 nem como finalizar. Criança de 7 anos precisa de orientação explícita na primeira vez.

**Alternativas consideradas:**
1. Tutorial overlay — complexo demais pro MVP
2. Instrução contextual no topo + hint após 5s + erro explicativo — simples e eficaz

**Resultado:** Opção 2. Nível 1 agora mostra: (1) objetivo claro no topo "🌱 Plante no canteiro marcado", (2) instrução "Toque nos blocos para montar seu programa", (3) dica após 5s de inatividade, (4) feedback de erro contextual ("Você precisa andar até o canteiro antes de plantar!"), (5) célula-alvo com borda pontilhada verde no grid. Bug fix: `plant` action agora funciona em células `flowerbed` (antes só funcionava em `empty`).

---

### [05/05/2026] Fix: botão Play na Tela Mundo

**Contexto:** Botão ▶ não aparecia — `Animated.View` wrapper sem posicionamento definido fazia o botão ficar fora da viewport.

**Resultado:** Movido `position: absolute` + `bottom/right` para o `Animated.View` pai. Botão agora visível e funcional.

---

### [05/05/2026] Composição da Tela Mundo: hierarquia de profundidade estilo livro infantil

**Decisão:** Reorganizar a composição visual da Tela Mundo seguindo princípios de ilustração de livro infantil: protagonistas grandes no primeiro plano, cenário pequeno ao fundo.

**Contexto:** Na primeira validação visual, avatar e mascote apareciam pequenos e distantes no horizonte (avatar 20% da tela, mascote 14%), enquanto pedra e tronco competiam visualmente. O resultado era uma "grade neutra de elementos" sem hierarquia clara.

**Princípios adotados:**
1. Avatar = protagonista (~32% da largura da tela), foco visual claro
2. Mascote ao lado/atrás do avatar, nunca afastado (24% width)
3. Pedra esquerda (14%), tronco direita (20%) — cenário ao fundo, equilibra peso visual
4. Topo da tela vazio (céu) é intencional
5. Sementinha relativa ao avatar (nos pés), não absoluta na tela

**Resultado:** WORLD_LAYOUT reescrito com percentuais corretos. Composição validada visualmente.

**Decisor:** Gui (via documento de correções do Claude)

---

### [05/05/2026] Sementinha: posicionamento relativo ao avatar, não absoluto

**Decisão:** A sementinha (recompensa do nível 1) é renderizada dentro do container do avatar, com coordenadas relativas a ele.

**Contexto:** Se a sementinha tiver coordenadas absolutas na tela e a posição do avatar for calibrada (ex: top muda de 58% pra 60%), a sementinha fica descolada do contexto narrativo. Já aconteceu de aparecer flutuando no horizonte.

**Implementação:** Avatar + sementinha compartilham o mesmo `<View>` container com `position: absolute`. Sementinha usa `bottom: '-8%'` e `left: '35%'` relativo ao container.

**Resultado narrativo:** Quando a criança planta no nível 1 e volta pro Mundo, vê a sementinha literalmente onde o avatar está pisando. Faz sentido: "eu plantei aqui mesmo, na minha frente."

**Decisor:** Gui (via documento de correções do Claude)

---

### [05/05/2026] Botão Executar: ativo com ≥1 bloco, aprendizagem por tentativa e erro

**Decisão:** O botão Executar só fica desabilitado quando o programa está completamente vazio (0 blocos). Qualquer programa com ≥1 bloco é executável, mesmo que "errado".

**Contexto:** Na primeira validação, o botão aparecia esmaecido/quase invisível. Análise revelou que o estilo de disabled usava cor muito clara (#B0C4B0). Além disso, o indicador "X/4" na ProgramArea sugeria que 4 blocos eram obrigatórios, quando na verdade representava capacidade máxima.

**Princípio pedagógico:** Aprendizagem por tentativa e erro é fundamental no método. Se a criança coloca só "Plantar" sem "Andar", o programa executa, falha, e a criança aprende com o feedback de erro contextual. Não bloquear preventivamente.

**Mudanças:**
1. `disabled={programBlocks.length === 0}` — única condição de desativação
2. Estilo disabled: cor mais escura (#7A9E7E) com texto legível (#D4E8D4)
3. Label disabled: "Adicione um bloco acima" (hint contextual)
4. Indicador na ProgramArea: removido "X/4", substituído por "X bloco(s)" ou "X blocos (máx.)" quando cheio

**Decisor:** Gui (via documento de correções do Claude)

---

### [05/05/2026] Assets pedra/tronco: versão sem sombra

**Decisão:** Substituir `mundo_pedra.png` e `mundo_tronco.png` por versões sem sombra elíptica inferior.

**Contexto:** Os assets originais tinham sombra embaixo que destoa quando o elemento é posicionado em escala diferente no cenário. A sombra ficava desproporcional e descolada do chão.

**Resultado:** Assets substituídos. Pedra: 1062×880px. Tronco: 1426×624px. Ambos com transparência real, sem sombra.

**Decisor:** Gui

---

### [05/05/2026] SafeAreaView: react-native-safe-area-context (não react-native)

**Decisão:** Usar `SafeAreaView` do pacote `react-native-safe-area-context` em todas as telas, nunca o `SafeAreaView` nativo do `react-native`.

**Contexto:** O `SafeAreaView` do `react-native` só funciona no iOS. Em Android com notch ou punch-hole (câmera frontal), o conteúdo fica atrás da câmera/status bar. Resultado: título "Primeira semente" e botões de navegação sobrepostos pela câmera frontal.

**Implementação:**
1. `SafeAreaProvider` adicionado como wrapper no `_layout.tsx` (envolve `GestureHandlerRootView`)
2. Todas as telas pós-onboarding trocaram o import: `import { SafeAreaView } from "react-native-safe-area-context"`
3. API é idêntica — só muda o import, JSX permanece igual

**Arquivos corrigidos:**
- `app/_layout.tsx` — SafeAreaProvider
- `app/level/[id].tsx` — SafeAreaView
- `app/level-summary/[id].tsx` — SafeAreaView

**Regra futura:** Qualquer nova tela que use SafeAreaView DEVE importar de `react-native-safe-area-context`.

**Decisor:** Gui (via análise do Claude)

---

### [05/05/2026] Navegação: router.replace('/world') em telas pós-onboarding

**Decisão:** O botão "voltar" (←) em telas pós-onboarding (level, level-summary, chapter) usa `router.replace('/world')` em vez de `router.back()`.

**Contexto:** Se a criança completou o onboarding e foi direto pro nível (sem passar pelo Mundo), `router.back()` retornava pra escolha de mascote ou outra tela do onboarding — comportamento errado e confuso.

**Regra de produto:** Voltar do nível SEMPRE leva pra Tela Mundo. A Tela Mundo é o "home" permanente.

**Por que `replace` e não `push`:** `replace` substitui a tela atual na pilha de navegação, mantendo a pilha limpa sem telas pendentes no histórico.

**Exceção:** Dentro do onboarding, `router.back()` é correto — criança deve poder voltar pra trocar avatar, mascote, etc.

**Decisor:** Gui (via análise do Claude)

---

### [05/05/2026] ExecuteButton: width 100% explícito

**Decisão:** O `Pressable` do ExecuteButton deve ter `width: '100%'` e `paddingHorizontal: 24` explícitos.

**Contexto:** Sem width definido, o Pressable colapsava pro tamanho do texto interno. O resultado era um botão minúsculo que parecia "texto branco solto" sobre fundo branco — quase invisível. O `Animated.View` pai com `className="mx-4"` só define margens, não largura.

**Resultado:** Botão largo de tela inteira, verde-jardim vibrante (#1F5F3F) quando ativo, verde-acinzentado (#7A9E7E) quando disabled. Texto sempre centralizado e visível. Altura suficiente para toque confortável (~50px).

**Decisor:** Gui (via análise do Claude)


---
### [12/05/2026] Nível 2: watering_spot como novo CellContent

**Decisão:** Adicionamos `watering_spot` e `watered` como novos tipos de `CellContent` no world-state.
**Contexto:** O Nível 2 precisa de uma célula-alvo para a ação "Regar" que é diferente de `flowerbed` (alvo para "Plantar"). Quando o avatar executa `water` em uma célula `watering_spot`, ela se transforma em `watered`.
**Alternativa descartada:** Usar `flowerbed` para ambos e diferenciar por posição — mais confuso e menos extensível.
**Resultado:** LevelScene renderiza `watering_spot` com borda tracejada azul (#4A90D9) e label "regar aqui!". Interpretador trata `water` em `watering_spot` → `watered`.
**Decisor:** Gui (via briefing)

---
### [12/05/2026] Recompensas com substituição visual (broto substitui sementinha)

**Decisão:** Recompensas podem substituir umas às outras visualmente. Implementação: ambas ficam em `WORLD_ELEMENTS` (histórico), renderização decide qual mostrar.
**Contexto:** Nível 2 premia com `sprout_lvl2` que visualmente substitui `seed_lvl1`. Manter ambos no storage preserva histórico de progressão para futuras features (galeria de progresso, timeline).
**Implementação:** `LevelDefinition.reward.replaces?: string` indica qual elemento é substituído. Em `world.tsx`: se `sprout_lvl2` existe, renderiza broto e ignora sementinha.
**Decisor:** Gui (via briefing do Claude)

---
### [12/05/2026] Goal condition custom para níveis com múltiplos objetivos

**Decisão:** Nível 2 usa `goalCondition: { type: "custom", check: (state) => ... }` em vez de um tipo pré-definido.
**Contexto:** O Nível 2 tem dois critérios simultâneos: célula 2 plantada E célula 4 regada. Nenhum dos tipos existentes (`plant_all_seeds`, `water_all_sprouts`) cobre esse caso composto.
**Resultado:** Flexibilidade para níveis futuros com condições complexas sem poluir o enum de GoalCondition.
**Decisor:** Manus (decisão técnica alinhada com briefing)

---
### [12/05/2026] Movimentos absolutos (move_right, move_down, move_up) a partir do Nível 3
**Decisão:** Movimentos do avatar a partir do Nível 3 usam referência ABSOLUTA da tela (direita/descer/subir). `walk_forward` dos Níveis 1-2 permanece inalterado.
**Contexto:** Nível 3 introduz grade 2D (3×2). Movimentos relativos (frente/virar) seriam confusos para crianças de 7-10 anos em grade 2D. Movimentos absolutos (→↓↑) são intuitivos: "direita" sempre vai pra direita.
**Alternativa descartada:** Refatorar Níveis 1-2 para usar movimentos absolutos — violaria o princípio de complexidade crescente sem retroatividade.
**Resultado:** `move_right`, `move_down`, `move_up`, `move_left` coexistem com `move_forward` no interpretador. Cada nível usa os blocos adequados à sua mecânica.
**Decisor:** Gui (via briefing do Claude)
---
### [12/05/2026] WorldState suporta grade 2D para todos os níveis (sem estrutura linear separada)
**Decisão:** Todos os níveis usam a mesma estrutura `grid[row][col]` 2D. Níveis 1-2 são grids com `gridHeight: 1` (efetivamente lineares). Nível 3+ usa `gridHeight > 1`.
**Contexto:** O código já usava `grid[][]` desde o início. Não há necessidade de criar uma estrutura `cells[]` linear separada — a grade 2D com 1 linha já é linear.
**Resultado:** Sem refatoração necessária. O interpretador funciona identicamente para qualquer dimensão de grid.
**Decisor:** Manus (decisão técnica — simplificação)
---
### [12/05/2026] Sistema de recompensas com múltiplas operações (elements[])
**Decisão:** `reward.elements[]` permite múltiplas operações de add/replace por nível. Mantém compatibilidade com `reward.elementKey` dos Níveis 1-2.
**Contexto:** Nível 3 premia com 2 elementos: broto crescido (substitui broto) + flor (novo). O formato antigo (`elementKey` + `replaces`) só suportava 1 operação.
**Implementação:** `level-summary` detecta se `elements[]` existe e itera; senão, usa `elementKey` (legacy). `world.tsx` usa cadeia de substituição: grown_sprout > sprout > seed.
**Decisor:** Gui (via briefing do Claude)
