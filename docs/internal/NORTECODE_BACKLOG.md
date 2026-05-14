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

#### 3. Cor dos blocos de movimento — alinhar com Style Guide
**Origem:** descoberta durante entrega do Nível 4 (Maio/2026).
**Descrição:** `components/level/BlockPalette.tsx` usa `#4A90D9` pra todos os blocos de movimento. O Style Guide v1.2 define **azul-rio `#5B8AA6`** como cor da categoria movimento. Pequena divergência.
**O que fazer:** trocar `#4A90D9` por `#5B8AA6` nas 5 entradas do `BLOCK_CONFIG` (move_right, move_left, move_up, move_down, e o que quer que seja o equivalente do `walk_forward`).
**Impacto:** mudança visual única, afeta blocos de Níveis 1-4. Estética, não funcional. Vale teste rápido no celular pra ver se a cor nova fica boa visualmente.
**Prioridade:** baixa. Pode ir junto com o item 4.

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

#### 10. Mover protocolos pra `docs/internal/`
**Origem:** convenção registrada no Protocolo de Dev Temporário v1.1.
**Descrição:** confirmar que os 3 documentos centrais (`NORTECODE_Protocolo_Dev_Temporario.md`, `NORTECODE_Protocolo_Colaboracao_IAs.md`, e `NORTECODE_Briefing_MVP.md`) estão todos em `docs/internal/`. Se algum estiver em outro lugar (raiz do repo, `docs/` direto), mover.
**Prioridade:** baixa. Organização.

---

## Concluídas (arquivo histórico — últimos 30 dias)

### Maio/2026

- ✅ Entrega Nível 4 — sequência longa + `move_left` (13/05/2026)
- ✅ Migração de Manus pra Claude Code como Dev Temporário ativo (Maio/2026)
- ✅ Atualização Protocolo Dev Temporário v1.0 → v1.1 (commit direto no main como default; convenção de `docs/internal/`)
- ✅ Atualização Style Guide v1.1 → v1.2 (subseção 9.2.1 de plantas; workflow Gemini ou Canva)
- ✅ Atualização Briefing MVP v2.5 → v2.6 → v2.7 (Nível 3 e 4 entregues; Nível 5 redesenhado; cadeia de substituição visual documentada; roadmap completo dos Níveis 5-10 consolidado; arquivo renomeado pra `NORTECODE_Briefing_MVP.md` sem versão no nome)
- ✅ Migração de APK release pra dev build com Fast Refresh (Maio/2026)
- ✅ Geração do asset `mundo_mini_arvore.png` (Maio/2026)

---

## Como usar este documento

**Quando uma tarefa nova surge** (ex: durante a execução de um nível, alguém percebe um polish que pode esperar): adicionar item na seção apropriada de "Em aberto" com origem, descrição, o que fazer e prioridade.

**Quando uma tarefa é concluída**: mover pra "Concluídas" com data. Se a lista de concluídas ficar grande demais, arquivar tarefas antigas em arquivo separado (`BACKLOG_HISTORICO.md`).

**Quando o Gui está com tempo livre e quer atacar algo pequeno**: vir aqui, pegar um item de prioridade média/baixa, executar (ou passar pro Dev Temporário ativo).

**Antes de fechar o MVP**: revisar tudo aqui. Decidir o que entra antes do release e o que vira backlog pós-MVP.

---

*Documento criado por Claude (Estrategista) — Maio/2026.*
