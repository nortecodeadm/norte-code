# Norte Code — Backlog de Tarefas Pendentes

**Documento vivo. Atualizado conforme novas tarefas surgem ou tarefas são concluídas.**
**Propósito:** Manter visibilidade de tarefas pequenas/médias que ficaram pra depois, pra não esquecer e pra próxima IA (ou o Gui-do-futuro) saber o que tem em aberto.

**O que entra aqui:** débitos técnicos, polish visual, ajustes pontuais, melhorias que apareceram durante execução de outras tarefas mas que não cabiam no escopo da entrega.

**O que NÃO entra aqui:** novos níveis do MVP (aparecem no Briefing MVP na ordem certa), features grandes do roadmap (mordomia pós-MVP, multiplayer, etc.) ou pendências documentadas em outros lugares (ex: pendências técnicas conhecidas estão na Seção 10 do Briefing MVP).

---

## Em aberto

### UX / Pedagogia

#### 1. Mensagem contextual quando criança planta em canteiro já plantado
**Origem:** descoberta durante entrega do Nível 4 (Maio/2026).
**Descrição:** hoje, se a criança coloca `plant` duas vezes em seguida sem mover, o interpretador trata a segunda plantação como no-op silencioso. Sem feedback. Pedagogicamente ruim — a criança não entende que errou.
**O que fazer:** adicionar mensagem "Você já plantou aqui! Vai pro próximo." Configurar via `errorMessages.plant_already_done` no level config, opt-in por nível (não-retroativo aos Níveis 1-3).
**Impacto técnico:** mexe no comportamento do `plant` no interpretador. Precisa cuidado com não-retroatividade — Níveis 1-3 não devem ser afetados.
**Prioridade:** média. Não bloqueia novos níveis, mas é polish que vale fazer antes do MVP fechar.

#### 2. Limite máximo de blocos por nível (`maxBlocks`) — revisar critério geral
**Origem:** decisão pontual no Nível 4 (Maio/2026), `maxBlocks: 16` com solução-alvo de 12.
**Descrição:** ainda não há critério geral pra definir `maxBlocks` por nível. Foi por intuição caso a caso. Vale registrar um critério explícito (ex: "solução-alvo + 30% de margem, arredondado pra cima") pra consistência.
**Prioridade:** baixa. Decisão de processo, não bug.

---

### Visual / Style Guide

#### 3. Cores dos blocos — alinhar com Style Guide
**Origem:** descoberta durante entregas do Nível 4 e Nível 5 (Maio/2026).
**Descrição:** divergências entre o código e o Style Guide v1.3 nas cores dos blocos:
- Blocos de movimento usam `#4A90D9` em `BlockPalette.tsx`; Style Guide define azul-rio `#5B8AA6`.
- Bloco `repeat_3` usa `#E8853D` (laranja consistente com outros elementos do projeto); Style Guide define `#D4A744` pra categoria similar.
**O que fazer:** alinhar TODAS as cores de blocos ao Style Guide. Pode ser absorvido pelo item 11 (redesign visual completo dos blocos pré-release) se preferir, em vez de tarefa isolada.
**Prioridade:** baixa. Será atacado junto com o item 11.

#### 4. Ícone profissional do `move_left`
**Origem:** entrega do Nível 4 (Maio/2026).
**Descrição:** ícone atual é placeholder unicode "←" (igual aos outros movimentos absolutos). Vale gerar/encomendar ícone profissional alinhado com Style Guide (seta curva pra esquerda, mesma família visual dos outros ícones).
**Onde gerar:** Gemini ou Canva, prompt seguindo o template da Seção 9.2 do Style Guide (bloco "Andar para frente" como referência de estilo).
**Prioridade:** baixa. Placeholder funciona.

#### 5. Ícones profissionais dos outros blocos de movimento
**Origem:** observação geral do projeto.
**Descrição:** se for fazer o item 4, vale fazer junto todos os ícones de movimento (`move_right`, `move_up`, `move_down`) pra manter consistência. Hoje todos são placeholder unicode.
**Prioridade:** baixa. Faz junto com item 4 pra otimizar.

---

### Dívida técnica

#### 6. Erros TypeScript pré-existentes em `Avatar.tsx` e `Mascote.tsx`
**Origem:** descoberta durante validação do Nível 4 (Maio/2026).
**Descrição:** 2 erros `Type 'unknown' is not assignable to type 'ImageSourcePropType'` em `components/Avatar.tsx:27` e `components/Mascote.tsx:28`. Não afetam runtime (provavelmente lookup dinâmico em map com chave string).
**O que fazer:** investigar a fonte dos erros e corrigir tipagem. Provavelmente é uma assinatura de função ou tipo de retorno que precisa de cast explícito ou de tipo mais preciso.
**Prioridade:** baixa. Limpeza. Não bloqueia nada, mas é o tipo de coisa que acumula.

#### 7. Mascote — aspectRatio fixo do cachorro
**Origem:** pendência técnica registrada na Seção 10 (Pendências Técnicas) do Briefing MVP.
**Descrição:** `components/Mascote.tsx` usa `aspectRatio: 880/1062` fixo (do cachorro), mas gato e coelho têm dimensões diferentes. Pode distorcer visualmente.
**O que fazer:** padronizar PNGs pra 1024×1024 (regenerar via Gemini/Canva) ou usar `Image.resolveAssetSource` em runtime.
**Prioridade:** média. Não afeta jogabilidade, mas afeta apresentação se a criança escolher gato ou coelho.

#### 8. ExecuteButton — sombra e pulse animation
**Origem:** pendência técnica registrada na Seção 10 (Pendências Técnicas) do Briefing MVP.
**Descrição:** versão atual está simplificada (sem sombra, sem pulse) porque a combinação `Animated.View + transform + alignSelf:'stretch'` quebrava renderização.
**O que fazer:** re-introduzir features uma a uma. Provavelmente envolver em `View` adicional pra isolar transformação.
**Prioridade:** baixa. Polish puro.

#### 9. Animação de movimento do avatar — validar suavidade
**Origem:** pendência técnica registrada na Seção 10 (Pendências Técnicas) do Briefing MVP.
**Descrição:** validar se está suave (~500ms, easing inOut). Se não estiver, melhorar.
**O que fazer:** revisar `lib/interpreter/executor.ts` (ou nome equivalente) onde a animação acontece. Conferir easing.
**Prioridade:** baixa. Subjetiva — depende da percepção visual do Gui.

---

### Documentação

#### 11. Redesign visual completo dos blocos antes do release do MVP
**Origem:** decisão do Gui durante implementação do Nível 5 (Maio/2026). Enriquecido com descobertas do Nível 6.
**Descrição:** os blocos atuais (movimento, plant, water, repeat_3, repeat_5, condicional, etc.) estão visualmente funcionais mas básicos — cores chapadas, ícones unicode/emoji ou placeholders simples, sem tratamento visual rico que combine com a identidade do Norte Code. Antes de fechar o MVP, fazer um redesign coeso de TODA a paleta.
**Padrões já estabelecidos durante implementações (manter no redesign):**
- Função `getContrastTextColor(bgColor)` baseada em luminância YIQ (threshold 120) — calcula texto preto/branco automaticamente conforme fundo do bloco. Reusar em todo bloco novo.
- Bordas no Android: aplicar borda no wrapper `View` externo (não no `Pressable` interno), e juntar `backgroundColor + borderRadius + borderWidth + borderColor` na mesma camada. Separar borda de fundo gera problemas com `borderRadius` e `overflow`. Descoberto no Nível 6 após 8 commits de troubleshooting.
- Visual "outline" dos blocos: cor original do bloco aplicada na borda com sufixo `66` (≈40% alpha) pra ficar sutil; texto preto/branco via `getContrastTextColor`.
- Layout interno: `flexDirection: column` com emoji em cima + texto embaixo (centralizado) é o padrão atual.
- Legenda do mapa adaptativa em `LevelScene.tsx`: distingue automaticamente entre "só canteiro vazio", "só canteiro plantado", e "ambos" com base no conteúdo do grid. Padrão pra próximos níveis.
**O que fazer no redesign:**
- Definir identidade visual final dos blocos (estilo, profundidade, ícones, tipografia interna)
- Gerar/desenhar ícones profissionais pra cada tipo de bloco (substituir unicode/emoji)
- Alinhar cores ao Style Guide v1.3 (resolve itens 3 e 4 do BACKLOG simultaneamente)
- Polir estados visuais (normal, pressed, ativo durante execução, dentro do envelope, condicional pulsando verde/cinza)
- Considerar identidade visual mais forte pra envelopes (`repeat_3`, `repeat_5`, e futuros containers)
**Pré-requisito:** ter TODOS os tipos de bloco do MVP implementados (Níveis 7-10 podem trazer novos: if/else, função). Fazer DEPOIS de todos os níveis prontos.
**Prioridade:** média-alta (pré-release).

---

#### 12. Tap fora do envelope encerra modo de edição
**Origem:** ajuste defensivo da UX do Nível 5 que ficou pra depois (Maio/2026).
**Descrição:** quando criança está com o envelope `repeat_3` ou `repeat_5` em modo de edição (adicionando blocos dentro), o único jeito de SAIR do modo hoje é tocando no botão "Pronto ✓" ou no header do envelope. **Tap em outro lugar da tela NÃO encerra o modo.**
**O que fazer:** implementar overlay com `pointerEvents` configurado seletivamente que detecta tap fora do envelope ativo e encerra o modo (com animação curta de fechamento pra criança ver que saiu).
**Prioridade:** baixa.

---

#### 13. Polish visual durante execução do repeat_3 — envelope brilha mais sutil
**Origem:** decisão de implementação do Nível 5 (Maio/2026). Versão atual está funcional.
**Descrição:** o envelope dos `repeat_*` brilha durante execução. Funciona bem, mas talvez valha versão mais nuançada (ex: pulsar diferente entre iterações, contador "1/3, 2/3, 3/3" visível durante execução).
**Prioridade:** muito baixa.

---

#### 14. Distinção visual entre canteiro vazio (CV) e canteiro plantado (CP) — revisar
**Origem:** Nível 6 (Maio/2026).
**Descrição:** o Nível 6 usa o asset de canteiro existente (`flowerbed`) com semente sobreposta pra representar CP. Funciona, mas a distinção entre CV e CP pode ser sutil demais pra criança de 7 anos identificar à primeira vista. Vale revisitar visualmente no Nível 7 (que também usa essa distinção implicitamente — `Se planta seca → Regar; senão se canteiro vazio → Plantar`).
**O que fazer:** observar no teste se a criança distingue CV de CP sem hesitação. Se houver dúvida, gerar asset mais distintivo (broto verde já saindo no CP, contraste maior, brilho sutil).
**Prioridade:** média. Pedagogicamente importante.

---

#### 15. Assets .jpg com conteúdo PNG funcionam neste setup
**Origem:** observação durante implementação do Nível 6 (Maio/2026).
**Descrição:** os assets `mundo_passaro_pousado.jpg` e `mundo_flor_amarela.jpg` foram gerados com extensão `.jpg` mas conteúdo PNG (RGBA com transparência). Testado e confirmado: o Metro bundler detecta os magic bytes corretamente, transparência preservada, renderização normal no Expo SDK atual. **Não renomear automaticamente** assets `.jpg` quando o conteúdo for PNG — comportamento estável.
**Status:** comportamento conhecido e validado. Item registrado pra próximas IAs não redescobrirem.
**Prioridade:** nenhuma (não é tarefa, é documentação).

---

#### 10. Mover protocolos pra `docs/internal/`
**Origem:** convenção registrada no Protocolo de Dev Temporário v1.1.
**Descrição:** confirmar que os 3 documentos centrais (`NORTECODE_Protocolo_Dev_Temporario.md`, `NORTECODE_Protocolo_Colaboracao_IAs.md`, e `NORTECODE_Briefing_MVP.md`) estão todos em `docs/internal/`. Se algum estiver em outro lugar (raiz do repo, `docs/` direto), mover.
**Prioridade:** baixa. Organização.

---

## Concluídas (arquivo histórico — últimos 30 dias)

### Maio/2026

- ✅ **Entrega Nível 6 — condicional simples (`if_canteiro_vazio_then_plantar`)** (14/05/2026, 19 commits — 3 base + 16 polish visual). Inclui: bloco condicional sólido único com feedback verde/cinza durante execução; bloco `repeat_5`; campo `conditionResult?: boolean` em `ExecutionStep`; legenda do mapa adaptativa; função `getContrastTextColor()` YIQ; saga das bordas dos blocos no Android (8 commits de troubleshooting); recompensas no Mundo (2 pássaros com mirror, 3 mini-árvores substituem plantinhas estágio 3, 3 flores amarelas).
- ✅ Briefing MVP atualizado pra v2.11.
- ✅ **Entrega Nível 5 — bloco de loop fixo `[Repetir 3×]` + mudança estrutural pra blocos com filhos** (Maio/2026, 16 commits, commit final `5c57312`).
- ✅ Atualização Briefing MVP v2.5 → v2.6 → v2.7 → v2.8 → v2.9 → v2.10 → v2.11.
- ✅ Style Guide v1.1 → v1.2 → v1.3.
- ✅ Entrega Nível 4 — sequência longa + `move_left` (13/05/2026).
- ✅ Migração de Manus pra Claude Code como Dev Temporário ativo (Maio/2026).
- ✅ Atualização Protocolo Dev Temporário v1.0 → v1.1.
- ✅ Migração de APK release pra dev build com Fast Refresh.
- ✅ Geração dos assets: `mundo_mini_arvore.png`, `mundo_arvore_jovem.png`, `background_mundo_v2.png`, `plantinha_estagio3.png`, `flor_no_tronco.png`, `mundo_passaro_pousado.jpg`, `mundo_flor_amarela.jpg`.

---

## Como usar este documento

**Quando uma tarefa nova surge** (ex: durante a execução de um nível, alguém percebe um polish que pode esperar): adicionar item na seção apropriada de "Em aberto" com origem, descrição, o que fazer e prioridade.

**Quando uma tarefa é concluída**: mover pra "Concluídas" com data. Se a lista de concluídas ficar grande demais, arquivar tarefas antigas em arquivo separado (`BACKLOG_HISTORICO.md`).

**Quando o Gui está com tempo livre e quer atacar algo pequeno**: vir aqui, pegar um item de prioridade média/baixa, executar (ou passar pro Dev Temporário ativo).

**Antes de fechar o MVP**: revisar tudo aqui. Decidir o que entra antes do release e o que vira backlog pós-MVP.

---

*Documento criado por Claude (Estrategista) — Maio/2026.*
