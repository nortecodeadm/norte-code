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

