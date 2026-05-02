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

