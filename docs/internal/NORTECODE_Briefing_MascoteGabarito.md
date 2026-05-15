# Briefing de Execução — Mascote como Gabarito Visual (Passo 4 do Protocolo)

**Projeto:** Norte Code
**De:** Claude (Estrategista)
**Para:** Claude Code (Dev Temporário — Cenário A do Protocolo)
**Via:** Gui
**Data:** Maio/2026

---

## Antes de começar — Leitura obrigatória

1. **Leia o `CLAUDE.md` da raiz** — identidade, princípios, fluxo.
2. **Leia o `docs/internal/NORTECODE_Protocolo_Dev_Temporario.md` (v1.1)** — seu papel e o cenário operacional (Cenário A).
3. **Leia o `docs/internal/NORTECODE_Protocolo_Colaboracao_IAs.md`** — fluxo geral e regras de não-retroatividade.
4. **Leia o `docs/internal/NORTECODE_Briefing_MVP.md` (v2.16)** — visão completa. Em especial: Seção 10 (Estado Atual de Implementação) — esta tarefa é o **mini-projeto "Mascote como Gabarito Visual"** listado em Pendente.
5. **Leia o `docs/internal/NORTECODE_DECISIONS_PendingEntries_MascoteGabarito.md`** — entrada cronológica do `DECISIONS.md` sobre esta decisão, pra você copiar pro `docs/DECISIONS.md` durante a implementação. É a fundação narrativa-arquitetural do que você vai implementar.
6. **Leia o `docs/DECISIONS.md`** atual — decisões já tomadas, especialmente as do Nível 8 (mais recente).
7. **Inspecione o código existente** — em especial:
   - `lib/levels/index.ts` (configs dos níveis, com foco nos Níveis 7 e 8)
   - `lib/interpreter/interpreter.ts` (motor de execução)
   - `app/level/[id].tsx` (fluxo de execução do programa + level summary)
   - `components/level/LevelScene.tsx` (renderização do mapa)
   - `components/Mascote.tsx` (sistema de humores do mascote — vai usar)
   - `lib/assets/mascotes.ts` (assets do mascote)

Se algo neste briefing conflitar com o código existente, **PARE e pergunte ao Gui antes de prosseguir**. Não chute.

---

## Estratégia de execução (Cenário A — você roda local)

- Filesystem do projeto + git CLI no Windows do Gui.
- Repo: `https://github.com/nortecodeadm/norte-code`. Último estado conhecido: ciclo do Nível 8 fechado (v2.16 do Briefing MVP).
- **Commits direto no `main`.** Sem branch, sem PR. Quebre em commits lógicos.
- Antes de começar: `git pull origin main`.
- Conventional Commits.
- Pode rodar `npx expo start` localmente pra validar que o app sobe. Não gere APK EAS.

---

## Demanda

Implementar a feature **"Mascote como Gabarito Visual"** nos Níveis 7 e 8 (níveis já entregues). Após a execução bem-sucedida do programa da criança, o mascote refaz a tarefa aplicando a solução ótima do nível (gabarito definido na config), com sprite próprio substituindo o avatar verde no mapa. Estabelece expectativa visual de "mascote sempre aprende e acerta", fundação narrativa pra quebra de expectativa no Nível 9 (a ser implementado depois).

**Implementação aditiva-retroativa** — adiciona cena posterior após o sucesso, sem mudar mecanicamente os Níveis 7 e 8.

---

## Decisão tomada (contexto e razões)

Esta feature surgiu durante a sessão estratégica do Nível 9 (Maio/2026). Gui propôs que o mascote vire o agente da queda no Nível 9 quando a criança escolhe certo, e em seguida refinou pra que o mascote já tenha papel ativo nos níveis anteriores — como "gabarito visual" da solução ótima.

**Motivações principais** (detalhadas em `NORTECODE_DECISIONS_PendingEntries_MascoteGabarito.md`):
- Pedagógica: mostra a solução ótima sem corrigir explicitamente a criança
- Narrativa: estabelece mascote como segundo agente moral do jogo, com agência própria
- Estrutural: fundação pra quebra de expectativa no Nível 9 (quando a serpente seduzir o mascote)

---

## Especificação completa

### Frente 1 — Campo `optimalSolution` na config dos Níveis 7 e 8

Adicionar campo opcional `optimalSolution` na estrutura de Level. Aditivo: Níveis 1-6 não definem (não usam mascote-gabarito).

**Sugestão de tipo:**
```typescript
interface Level {
  // ... campos existentes
  optimalSolution?: ProgramBlock[];  // sequência de blocos da solução ótima
}
```

**Conteúdo da `optimalSolution` do Nível 7:**

```typescript
optimalSolution: [
  {
    type: "repeat_5",
    children: [
      { type: "move_right" },
      { type: "if_canteiro_com_semente_then_regar_else_if_canteiro_vazio_then_plantar" }
    ]
  }
]
```

Solução elegante de **3 blocos** (1 repeat + 2 dentro).

**Conteúdo da `optimalSolution` do Nível 8:**

```typescript
optimalSolution: [
  { type: "move_right" },
  { type: "move_right" },
  { type: "move_right" },
  {
    type: "repeat_until_frutas_3",
    children: [
      { type: "pick_fruit" }
    ]
  }
]
```

Solução elegante de **5 blocos** (3 movimentos + 1 repeat_until + 1 pick_fruit dentro).

**Atenção:** o formato exato dos blocos com children deve seguir o schema atual do projeto. Inspecione `lib/interpreter/interpreter.ts` (especialmente `blocksToAST`) pra confirmar a estrutura. Se houver dúvida, **PARE e pergunte**.

### Frente 2 — Mecânica do interpretador rodando 2 vezes

Após a execução bem-sucedida do programa da criança (estado final = sucesso), o sistema precisa:

1. **Mostrar a mensagem de transição** ("O {mascote} aprendeu com você. Olha o jeito dele!") por ~1.8s
2. **Resetar o estado do mapa** atrás da mensagem (estado inicial do nível)
3. **Trocar o sprite renderizado no mapa** de avatar verde pra sprite do mascote
4. **Executar novamente** — desta vez com a `optimalSolution` da config

**Importante:**
- A 2ª execução **NÃO conta como nova tentativa da criança** — é cena posterior, não jogo.
- A 2ª execução é **sempre bem-sucedida** (a `optimalSolution` é, por definição, válida).
- Após a 2ª execução, vai direto pro level summary (recompensas no Mundo permanente + texto de conclusão pluralizado).

**Sugestão de implementação:**
- No fluxo de "programa executou com sucesso" (provavelmente em `app/level/[id].tsx`):
  1. Após a animação da última step da criança, aguarda ~500ms (respiração)
  2. Renderiza componente `TransitionMessage` (novo) sobre o mapa, com fade-in 200ms
  3. Aguarda ~1.8s
  4. Reseta `WorldState` pro estado inicial (clone do `initialWorld`)
  5. Substitui sprite do avatar pelo sprite do mascote escolhido pela criança
  6. Aplica humor do mascote: `"atento"` ou equivalente — ver Frente 5
  7. Fade-out da mensagem (~300ms)
  8. Roda interpretador com `level.optimalSolution`
  9. Anima execução normalmente (mesma mecânica de step animation)
  10. Ao final da execução do mascote, vai pro level summary

### Frente 3 — Componente `TransitionMessage`

**Visual:**
- Fundo: branco-cream com leve transparência (~90% opacity)
- Borda: leve, verde-folha (provavelmente cor da fauna existente — `#7FB069` ou similar do Style Guide)
- Texto: fonte Fraunces, tamanho médio-grande
- Centralizada na tela, posicionada de forma que **não bloqueie a posição inicial do avatar/mascote no mapa**
- Animação de entrada: fade-in 200ms
- Animação de saída: fade-out 300ms

**Texto:**
- Template: `"O {nomeDoMascote} aprendeu com você. Olha o jeito dele!"`
- `{nomeDoMascote}` é o nome dado pela criança durante o onboarding (já existe no estado do `player`)
- Pronome "dele" pode precisar de ajuste se o mascote for coelho? Como é hoje? **Pergunte se houver dúvida** — provavelmente "dele" funciona pros 2 (cachorro/coelho são masculinos em PT-BR).

**Tempo total visível:** ~1.8s (incluindo fade-in e fade-out).

### Frente 4 — Sprite do mascote substituindo o avatar verde

**Substituição total** (P1 = (a) na sessão estratégica):
- Avatar verde **some** durante o reset invisível (atrás da mensagem)
- Mascote **aparece** na célula inicial do mapa
- Mascote usa a mesma mecânica de movimento que o avatar verde usa (pulinho de célula em célula, mesma timing, mesmas animações de plantio/rega/coleta)
- Diferença é só o **sprite** renderizado

**Asset do mascote:**
- Reusar asset existente do mascote escolhido pela criança (cachorro ou coelho, já registrado no player state)
- Provavelmente em `lib/assets/mascotes.ts`
- Tamanho do sprite no mapa: equivalente ao avatar verde atual (calibração visual fica pro Gui se ficar errado)

### Frente 5 — Humor do mascote durante a 2ª execução

**Humor: "atento/aprendendo"** (P2 = (b) na sessão estratégica).

**Implementação:**
- Verificar quais humores já existem em `components/Mascote.tsx` e `lib/assets/mascotes.ts`
- Se houver humor `"atento"`, `"focado"`, `"aprendendo"` ou similar — usar
- Se não houver — usar `"neutro"` ou `"feliz"` como fallback, e **registrar no Relatório** que humor específico precisa ser criado depois

**Atenção:** se for usar fallback, **NÃO criar humor novo agora**. Isso fica como nota pro Gui adicionar depois (item de BACKLOG).

### Frente 6 — Pluralização do `successText` dos Níveis 7 e 8

**Decisão**: o texto atual de conclusão de cada nível deve ser ajustado pra refletir a dupla (criança + mascote) como protagonistas conjuntos. Flexionar verbos e pronomes pra 1ª/2ª pessoa do plural onde aplicável, **sem reescrever a mensagem inteira** — só ajustar o sujeito.

**Exemplos:**

Nível 7 (atual):
> "Agora você sabe escolher entre dois caminhos. Cuidar é responder ao que cada coisa precisa — não tratar tudo igual. Lembra disso — vai ser muito importante mais pra frente."

Nível 7 (pluralizado):
> "Agora vocês sabem escolher entre dois caminhos. Cuidar é responder ao que cada coisa precisa — não tratar tudo igual. Lembrem disso — vai ser muito importante mais pra frente."

Nível 8 (atual):
> "Você usou um lugar pra guardar uma informação (quantas frutas). Isso se chama variável. Cuidar bem é saber a quantidade certa — não pegar tudo, não pegar de menos. Lembra disso — vai ser muito importante mais pra frente."

Nível 8 (pluralizado):
> "Vocês usaram um lugar pra guardar uma informação (quantas frutas). Isso se chama variável. Cuidar bem é saber a quantidade certa — não pegar tudo, não pegar de menos. Lembrem disso — vai ser muito importante mais pra frente."

**Atenção:**
- Mudanças mínimas — só verbos e pronomes
- Manter a estrutura, o tom, as quebras de linha originais
- Não mexer em mensagens de níveis anteriores (1-6) — eles não têm mascote-gabarito

### Frente 7 — Casos especiais (já decididos)

| Caso | Decisão |
|---|---|
| Criança fez exatamente o gabarito | Mostra execução do mascote mesmo assim (uniforme) |
| Criança falhou várias vezes | Sem ajuste — uniforme |
| Modo de teste / skip | Sem opção de desabilitar (YAGNI) |
| Blocos diferentes na execução | Execução do mascote usa exatamente os blocos da `optimalSolution` |

---

## Escopo de execução — frontend

### Arquivos a modificar/criar:

1. **`lib/levels/index.ts`** — adicionar `optimalSolution` em `createLevel7()` e `createLevel8()`. Atualizar `successText` pra versão pluralizada nos 2 níveis.

2. **Tipo do `Level`** (provavelmente em `lib/interpreter/world-state.ts` ou `lib/levels/types.ts` — confirmar onde está) — adicionar campo opcional `optimalSolution?: ProgramBlock[]`.

3. **`app/level/[id].tsx`** — modificar fluxo de "programa executou com sucesso":
   - Antes (atual): execução termina → level summary
   - Depois: execução termina → respiração → mensagem de transição → reset + swap → execução do mascote → level summary
   - Renderização condicional: só executa essa cena se `level.optimalSolution` estiver definida

4. **`components/level/TransitionMessage.tsx`** (NOVO) — componente da mensagem de transição.

5. **`components/level/LevelScene.tsx`** — adicionar lógica de "sprite do mascote substitui avatar verde" durante a 2ª execução. Provavelmente prop nova tipo `executor: "avatar" | "mascote"` que muda o sprite renderizado.

6. **`components/Mascote.tsx`** — se for usar humor específico ("atento" ou similar), confirmar que existe. Senão, usar fallback.

### Build/Validação local

- Após implementar, rode `npx expo start` localmente.
- **Teste manual obrigatório:** jogar Nível 7 e Nível 8 do começo ao fim, conferindo:
  - Mensagem de transição aparece após execução bem-sucedida
  - Mascote aparece no mapa após a mensagem
  - Mascote executa a `optimalSolution` corretamente
  - Reset do mapa funciona (mascote começa do estado inicial)
  - Level summary aparece após a execução do mascote
  - `successText` pluralizado
- **Teste de regressão obrigatório:** jogar Níveis 1-6 conferindo que **NADA mudou** (sem mensagem de transição, sem mascote no mapa, sem 2ª execução).
- NÃO gere APK EAS — Gui testa via Fast Refresh.

---

## Critérios de aceite

1. Campo `optimalSolution` definido nas configs dos Níveis 7 e 8.
2. Tipo `Level` atualizado pra incluir o campo opcional.
3. Após execução bem-sucedida no Nível 7 ou 8, mensagem de transição aparece por ~1.8s.
4. Mensagem tem texto "O {nomeDoMascote} aprendeu com você. Olha o jeito dele!" com substituição correta do nome.
5. Mensagem tem visual conforme especificado (fundo branco-cream, borda verde-folha, Fraunces, centralizada, fade-in/out).
6. Atrás da mensagem, o mapa reseta pro estado inicial (invisivelmente).
7. Atrás da mensagem, o sprite do avatar verde é substituído pelo sprite do mascote escolhido pela criança.
8. Após a mensagem sumir, o mascote executa a `optimalSolution` do nível.
9. Execução do mascote usa a mesma mecânica visual de movimento/plantio/rega/coleta que o avatar usa.
10. Humor do mascote durante a 2ª execução é "atento" ou equivalente (ou fallback documentado).
11. Após a execução do mascote, vai pro level summary com `successText` pluralizado.
12. Níveis 1-6 NÃO têm mensagem de transição nem 2ª execução (regressão zero).
13. Persistência do progresso continua funcionando (nada mudou na lógica de salvar nível como completo).
14. Funciona com mascote cachorro E mascote coelho.

---

## O que NÃO fazer

1. **Não criar humor novo** se o sistema atual não tiver "atento" ou equivalente. Usa fallback e registra como item futuro.
2. **Não mudar mecanicamente os Níveis 7 e 8**. A mecânica do jogo permanece idêntica — só adicionamos cena posterior.
3. **Não mexer em Níveis 1-6.** Eles não têm mascote-gabarito.
4. **Não criar opção de skip/desabilitar** a 2ª execução. YAGNI.
5. **Não pular a pluralização do `successText`.** É parte da entrega.
6. **Não pular cópia da entrada do `DECISIONS.md`** — copiar de `docs/internal/NORTECODE_DECISIONS_PendingEntries_MascoteGabarito.md` pra `docs/DECISIONS.md`.
7. **Não fazer commits gigantes.** Quebra em commits lógicos (sugestão: 1 commit pra cada Frente, ou agrupamentos coerentes).
8. **Não tomar decisões de produto sozinho.** Em dúvida, pergunta.

---

## Documentação esperada

Após implementação, atualizar:

1. **`docs/LEVELS.md`** — adicionar nas entradas dos Níveis 7 e 8 a menção do mascote-gabarito + a `optimalSolution`.

2. **`docs/INTERPRETER.md`** — documentar:
   - Campo `optimalSolution` no tipo Level
   - Fluxo de "execução do mascote após sucesso da criança"
   - Sistema de troca de sprite (avatar → mascote)

3. **`docs/ARCHITECTURE.md`** — documentar:
   - Padrão "execução do mascote como gabarito visual" como feature arquitetural
   - Reset de estado entre execuções

4. **`docs/DECISIONS.md`** — COPIAR a entrada de `docs/internal/NORTECODE_DECISIONS_PendingEntries_MascoteGabarito.md` adaptando a data pro dia da implementação.

---

## Relatório de Execução (obrigatório ao final)

Mesmo formato dos níveis anteriores:

```
Relatório de Execução: Claude Code → Claude (Estrategista)
Projeto: Norte Code
Demanda executada: Mascote como Gabarito Visual nos Níveis 7 e 8

O que foi implementado:
[Descrição por frente: campo optimalSolution, mensagem de transição,
 substituição de sprite, reset de mapa, humor do mascote,
 pluralização do successText]

Decisões técnicas tomadas (fora do briefing):
[Decisões tomadas sozinho com justificativa. Especialmente:
 - se foi usado humor "atento" existente ou fallback (qual?)
 - como modelou a substituição do sprite no LevelScene
 - timing exato das animações (se ajustou os ~1.8s sugeridos)]

Arquivos alterados:
- [lista]

Commits feitos (no main):
- [SHA] [mensagem]
...

Critérios de aceite — Status:
1. [x/?] [comentário]
...
14. [x/?] [comentário]

Validações técnicas executadas:
[TypeScript check; teste manual dos Níveis 7 e 8 com mascote-gabarito;
 teste de regressão dos Níveis 1-6]

Documentação atualizada:
- LEVELS.md, INTERPRETER.md, ARCHITECTURE.md, DECISIONS.md

Pontos de atenção pra validação do Gui:
[Áreas pra teste especial — timing das animações, visual da mensagem,
 humor do mascote, leitura do texto pluralizado]
```

---

## Resumo curto

- Você é Dev Temporário (Cenário A — local + git).
- Tarefa: implementar **Mascote como Gabarito Visual** nos Níveis 7 e 8.
- **Adição aditiva-retroativa** — sem mudar mecanicamente os níveis.
- **Frentes principais:** campo `optimalSolution` nas configs + componente `TransitionMessage` + substituição de sprite no `LevelScene` + reset de mapa + pluralização do `successText`.
- **Princípio uniforme:** sempre executa a 2ª vez quando a criança passa, sem casos especiais.
- **Humor do mascote durante a 2ª execução:** "atento" ou fallback documentado.
- **NÃO mexer em Níveis 1-6.**
- Commit direto no `main`. Conventional Commits. Quebre em commits lógicos.
- Documentação obrigatória em 4 `.md` + cópia da entrada do `DECISIONS.md`.
- Em dúvida: PARE e pergunta. Não chute.
