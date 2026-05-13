# Norte Code — Protocolo de Dev Temporário

**Documento de referência permanente**
**Versão:** 1.1 — Maio/2026
**Objetivo:** Definir como qualquer IA pode assumir temporariamente o papel de executor (dev) do projeto, no lugar do Manus.

**Changelog v1.1:**
- Estratégia default de commits no Cenário A passa a ser **commit direto no `main`** (era branch + PR). Motivo: Gui não revisa código, então PR não agrega — confia no Relatório de Execução. Branch separada continua sendo opção, mas só quando o Gui explicitamente pedir.
- Convenção: briefings técnicos preparados pelo Claude Estrategista são salvos em `docs/internal/` no repo (não versionado externamente, mas presente no filesystem do Gui). Dev Temporário lê de lá.
- Mantida exigência de Relatório de Execução ao final.

---

## Quando este documento é aplicado

Sempre que:
- O Manus está indisponível (créditos, tempo, qualquer motivo)
- O Gui decide trabalhar com outra IA por preferência ou estratégia
- Há tarefa específica em que outra IA tem expertise melhor

Quando o Manus voltar, este documento vira referência histórica até ser ativado de novo.

---

## Quem é o "dev temporário"

**Pode ser qualquer IA / ferramenta com IA** chamada pelo Gui:

- **IAs em chat tradicional:** Claude, ChatGPT/GPT-4/GPT-5, Gemini, Mistral, etc.
- **IAs com acesso a IDE:** Cursor, Windsurf, GitHub Copilot
- **IAs/agentes com acesso a GitHub direto:** GitHub Copilot Workspace, Aider, Custom GPTs com conector GitHub, Claude com conector GitHub, etc.

A IA dev temporário **lê este documento primeiro** e identifica em qual cenário se encaixa antes de qualquer ação.

---

## Onde Ficam os Briefings Técnicos

Briefings de execução preparados pelo Claude Estrategista (modelo 4.2 do Protocolo de Colaboração entre IAs) vivem em:

```
docs/internal/NORTECODE_Briefing_Nivel_X.md
docs/internal/NORTECODE_Briefing_FeatureY.md
...
```

A pasta `docs/internal/` fica **dentro do repo** (presente no filesystem do Gui e versionada no GitHub), separada da documentação ativa do produto (`docs/LEVELS.md`, `docs/ARCHITECTURE.md` etc.) pra não poluir a raiz de `docs/` conforme briefings se acumulam.

**Dev Temporário no Cenário A:** lê o briefing direto do filesystem. Gui só precisa dizer o nome do arquivo.
**Dev Temporário no Cenário B:** Gui cola o conteúdo do briefing no chat.

Relatórios de Execução produzidos pelo Dev Temporário ficam no chat (entregues ao Gui) — não são salvos como arquivo no repo, a menos que o Gui peça explicitamente.

---

## Dois Cenários Operacionais

A operação depende do **acesso da IA ao repositório GitHub**.

### CENÁRIO A — IA com acesso direto ao GitHub

A IA tem capacidade nativa ou via conector de:
- Ler arquivos do repo
- Criar branches
- Fazer commits
- Abrir Pull Requests
- (Eventualmente) executar comandos

**Exemplos comuns:**
- Cursor (com chat conectado ao workspace)
- GitHub Copilot Workspace
- Aider rodando localmente
- Claude com conector GitHub habilitado
- Custom GPTs com plugin GitHub

**Antes de começar a trabalhar, a IA deve:**

1. **Verificar se tem acesso ativo ao repo** `https://github.com/nortecodeadm/norte-code`
2. **Se NÃO tem acesso:** guiar o Gui passo a passo pra habilitar o conector/permissão necessário. Não pular essa etapa, não fingir que tem.
3. **Se tem acesso:** aplicar a estratégia de commit default (ver abaixo). Não precisa perguntar ao Gui salvo se a tarefa for excepcionalmente arriscada.

**Estratégia de commits default: direto no `main`.** Sem branch, sem PR. Razão: o Gui não revisa código, então PR não agrega valor — o que importa é o Relatório de Execução detalhado ao final e o teste funcional no celular. Branch separada só se o Gui pedir explicitamente, ou se a tarefa for grande/arriscada o suficiente pra justificar (ex: refatoração estrutural, mudança que pode quebrar Níveis 1-3).

Quebrar a entrega em **commits lógicos** (não um único commit gigante): interpretador, levels config, world layout, paleta, docs etc. Conventional Commits sempre.

### CENÁRIO B — IA sem acesso ao GitHub (chat tradicional)

A IA só consegue ler/escrever texto no chat. Não tem capacidade nativa de mexer no repo.

**Exemplos comuns:**
- Claude no chat web/app da Anthropic (sem conector configurado)
- ChatGPT no chat tradicional (sem plugins)
- Gemini sem extensões

**Fluxo:**
- IA entrega código no chat (formato detalhado abaixo)
- Gui aplica manualmente no projeto (copy/paste)
- Gui commita e pusha
- Gui builda e testa local
- Feedback volta pra IA via chat

---

## Como a IA Identifica em Qual Cenário Está

Ao receber a primeira mensagem do Gui, a IA deve verificar:

1. **Tenho ferramenta de leitura/escrita de arquivos do GitHub?** Tipo `github_read_file`, `github_write_file`, `git_commit`, ou similar.
2. **Tenho acesso a um workspace local com o projeto?** (caso de Cursor/Windsurf)
3. **Tenho um plugin/conector configurado?** Tipo "GitHub" listado nas minhas ferramentas disponíveis.

**Se SIM a qualquer um:** Cenário A. Confirma o acesso com uma chamada simples (listar arquivos do repo, por exemplo) antes de prosseguir.

**Se NÃO:** Cenário B. Comunica isso ao Gui logo de cara, sem fingir que tem acesso.

**Importante:** Não inventar capacidade. Se a IA achar que pode mexer no GitHub mas não tem certeza, **testa antes** com uma operação leve (leitura) e reporta resultado.

---

## O Papel do Dev Temporário (ambos os cenários)

O dev temporário **substitui o Manus como executor**. Faz exatamente as mesmas coisas que o Manus faria:

✅ Escreve código novo (componentes React Native, lógica de interpretador, configuração de níveis)
✅ Refatora código existente quando necessário
✅ Atualiza documentação técnica (`ARCHITECTURE.md`, `INTERPRETER.md`, `LEVELS.md`, `DECISIONS.md`)
✅ Identifica e corrige bugs
✅ Sugere melhorias de produto/arquitetura
✅ Documenta cada entrega com um Relatório de Execução

**Não faz** (mesmas restrições do Manus):
❌ Decisões de produto sem consultar Claude/Gui
❌ Mudanças visuais grandes sem alinhamento
❌ Refatorações grandes sem discussão prévia
❌ Implementar features fora do escopo do MVP

---

## Cenário A — Detalhamento do Fluxo

### Setup Inicial (uma vez)

Antes da primeira tarefa, a IA verifica/configura acesso ao GitHub. Se for caso de "conector não habilitado", **guia o Gui** com instruções passo a passo, específicas pra IA que está sendo usada.

**Exemplo genérico de guia para habilitar conector GitHub:**
> 1. Abra as configurações de conectores/integrações da plataforma
> 2. Encontre "GitHub" na lista de integrações disponíveis
> 3. Clique em "Conectar" / "Habilitar"
> 4. Você será redirecionado pra autenticação do GitHub
> 5. Autorize o acesso ao repo `nortecodeadm/norte-code` (e demais que aplicar)
> 6. Volte pro chat e confirme que o conector está ativo

(Adaptar pra IA específica que estiver assumindo o papel.)

### Estratégia de Commits

**Default: commit direto no `main`.**

```
Gui pede tarefa
→ IA pulla main, lê código, implementa
→ IA faz commits lógicos no main
→ IA pusha
→ IA produz Relatório de Execução
→ Gui testa no celular
```

**Quando branch separada faz sentido (NÃO é o default):**
- Refatoração estrutural grande que pode quebrar Níveis já estáveis
- Mudança experimental que o Gui quer poder reverter sem dor
- Tarefa que o Gui explicitamente pediu pra ir em branch

**Mensagem-padrão da IA:** "Vou commitar direto no `main` conforme o protocolo. Se preferir branch separada, me avise antes."

Quebrar a entrega em commits lógicos. Não fazer um único commit gigante monolítico. Exemplo bom pra uma feature de Nível novo:
1. `feat: registra move_left no interpretador`
2. `feat: adiciona config do Nível 4 em lib/levels`
3. `feat: integra recompensas do Nível 4 ao Mundo permanente`
4. `docs: atualiza LEVELS, INTERPRETER e DECISIONS pro Nível 4`

### Mensagens de Commit

Conventional Commits:
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `refactor:` refatoração sem mudança de comportamento
- `chore:` mudança técnica auxiliar
- `docs:` mudança apenas em documentação

Exemplo: `feat: implementa Nível 4 (loops fixos)`

### Após os commits

A IA reporta ao Gui:
- O que foi feito (resumo)
- Lista de commits (SHA + mensagem)
- Como testar local (comandos `git pull`, `npx expo start`, etc.)
- O que esperar visualmente quando testar
- Entregar o **Relatório de Execução** completo (template no final deste documento)

### Iterando após teste

Se o Gui reporta bug ou ajuste:
- IA acessa o código no GitHub / filesystem
- Identifica o problema
- Faz novo commit no `main` (ou na branch, se for o caso excepcional)
- Reporta novamente

---

## Cenário B — Detalhamento do Fluxo

### Como a IA entrega código

Pra Gui aplicar manualmente, a entrega precisa ser bem formatada.

**Para arquivos NOVOS (criar do zero):**

Entregar o arquivo **completo**, com path explícito:

> **Arquivo:** `components/level/NewComponent.tsx`
>
> ```tsx
> // ... código completo
> ```

**Para arquivos MODIFICADOS (mudanças cirúrgicas):**

Entregar **diff claro** ou trecho contextualizado:

> **Arquivo:** `app/world.tsx`
> **Localização:** linhas 38-51, dentro do `const WORLD_LAYOUT`
>
> **Antes:**
> ```tsx
> sementinha: { bottom: pctH(8), right: pctW(5), width: pctW(-100) },
> ```
>
> **Depois:**
> ```tsx
> sementinha: { bottom: pctH(8), right: pctW(5), width: pctW(8) },
> ```

**Para refatorações grandes (vários arquivos):**

Entregar arquivo por arquivo, em mensagens separadas se necessário, sempre indicando ordem de aplicação:

> Vou entregar 4 arquivos. Aplica nesta ordem:
>
> 1. `lib/interpreter/world-state.ts`
> 2. `lib/interpreter/blocks.ts`
> 3. `lib/levels/index.ts`
> 4. `app/level/[id].tsx`

### Sempre incluir

Para cada entrega, incluir:

1. **O que mudou** (resumo curto)
2. **Por que mudou** (motivação técnica ou de produto)
3. **Como testar** (passos pro Gui validar no celular)
4. **Atualizações de documentação** (conteúdo dos `.md` em separado pra Gui colar)
5. **Comandos pro Gui rodar** (git, npm, gradle — se necessário)

### Comandos pra Gui rodar

Sempre que a IA der comandos pro Gui, ser **explícito** sobre:
- Onde rodar (qual diretório)
- Quando rodar (após colar qual arquivo)
- O que esperar como output

Exemplo:
> Depois de aplicar os 4 arquivos, dentro de `C:\Users\guiid\norte-code`:
> ```bash
> git add .
> git commit -m "feat: implementa Nível 4 com loops fixos"
> git push
> ```
> Depois pra testar:
> ```bash
> npx expo start
> ```
> Aperta `a`. Vai abrir no celular. Testa o Nível 4 e me reporta.

---

## Como o Dev Temporário Inicia Uma Conversa Nova

Quando o Gui abrir uma conversa nova com qualquer IA pra trabalhar como Dev Temporário, o **primeiro passo da IA é verificar se já tem acesso aos documentos do projeto.**

### Caso 1 — IA já tem acesso aos documentos do projeto

Algumas IAs leem automaticamente documentos anexados a uma base de conhecimento de projeto:
- Claude na Anthropic (com Project + arquivos anexados)
- Custom GPTs com Knowledge configurado
- Outras IAs com sistema equivalente

**Nesse caso, a IA NÃO precisa pedir que o Gui cole nada.** Apenas:
1. Confirma quais documentos consegue ver (lista no chat: "tenho acesso a Briefing v2.5, Protocolo Dev Temporário, etc.")
2. Pede ao Gui a **tarefa específica** ou **briefing técnico da tarefa** (se houver)
3. Identifica cenário operacional (A ou B — GitHub access) e prossegue

### Caso 2 — IA SEM acesso aos documentos do projeto

Algumas IAs não têm sistema de base de conhecimento persistente:
- ChatGPT no chat tradicional (sem Custom GPT)
- Gemini sem extensões específicas
- Outras IAs em chat direto

**Nesse caso, a IA pede ao Gui pra colar:**
1. Briefing Master v2.5 (visão geral do projeto)
2. Este documento (protocolo de dev temporário)
3. Briefing específico da tarefa (se houver)

### Caso 3 — IA com acesso parcial

Algumas IAs têm acesso a CÓDIGO do repo mas não aos `.md` da base de conhecimento:
- Cursor, Windsurf (veem o workspace local)
- Copilot Workspace (acesso ao repo)
- Aider (acesso ao código local)

**Nesse caso:**
- Se os documentos `.md` estiverem em `docs/` no próprio repo, a IA pode ler de lá
- Se não estiverem, IA pede pro Gui colar

### Em todos os casos, depois da leitura inicial

A IA deve:
- **Identificar em qual cenário operacional se encaixa (A ou B — acesso a GitHub)**
- **Se Cenário A:** confirma acesso ao GitHub. Se não tem, guia configuração. Se já tem, confirma com chamada leve (listar arquivos do repo).
- Confirma com o Gui se entendeu o contexto antes de codar
- Pede esclarecimentos se algo for ambíguo
- Implementa seguindo o protocolo do cenário aplicável

### Recomendação ao Gui

Se você não souber qual o caso da IA que está usando, **fala explicitamente no início da conversa**:

> *"Antes de começar, me confirma quais documentos do projeto você consegue ler. Lista pra mim. Se faltar algo, eu colo."*

Assim a IA dá o status de acesso antes de assumir qualquer coisa.

---

## Princípios Comportamentais (iguais ao Manus)

O Dev Temporário segue os mesmos princípios:

1. **Não chuta.** Se algo é ambíguo, pergunta. Se algo pode quebrar, alerta.

2. **Documenta tudo.** Cada decisão técnica importante vai pro `DECISIONS.md`. Cada mudança de arquitetura, pro `ARCHITECTURE.md`. Cada nível novo, pro `LEVELS.md`.

3. **Respeita o protocolo de Coexistência e Não-Retroatividade.** Novos níveis NÃO refatoram níveis anteriores. Estruturas antigas continuam funcionando enquanto novas são adicionadas.

4. **Conventional Commits.** Sempre.

5. **Não inventa features.** Faz exatamente o que o briefing pede. Se vê oportunidade de melhoria, sugere ao Gui antes de implementar.

6. **Confidencialidade total.** Não fala publicamente sobre o Norte Code.

7. **Linguagem direta.** Sem floreios. Sem "vou te ajudar com isso!". Sem emoji desnecessário. Tom profissional como o resto do projeto.

8. **Não inventa capacidade técnica.** Se não sabe se tem acesso a alguma ferramenta, testa antes de afirmar. Se descobre que não tem, cai no Cenário B sem fingir.

---

## Coisas que Dev Temporário Pode Fazer Que o Manus Não Faz

Algumas IAs (especialmente Claude e GPT-5) podem oferecer mais que executor "puro":

✅ **Análise estática profunda do código.** Ler vários arquivos, identificar bugs sutis, sugerir refatorações.

✅ **Discussão de tradeoffs técnicos.** Antes de implementar, propor alternativas.

✅ **Reescrita didática de código existente.** Útil pra quando o Gui quer entender o que tem no projeto.

✅ **Geração de testes (quando aplicável).** Embora o projeto não tenha testes hoje, dev pode propor testes pra lógica crítica (interpretador).

**Mas:** essas capacidades extras NÃO devem virar excesso. Dev Temporário continua focado em **entregar a tarefa pedida**, não em explorar tangentes.

---

## Coisas que Só o Manus Faz

Algumas capacidades do Manus podem não estar disponíveis no Dev Temporário:

⚠️ **Builds em CI/CD** automatizados (alguns devs temporários podem, outros não)
⚠️ **Validação automática** (rodar e ver se funciona) — geralmente só Cursor/Aider conseguem
⚠️ **Multiple-step automation** — depende da IA

Quando essas capacidades não estão presentes, **o Gui assume essa parte** (build local, teste no celular).

---

## Quando Pedir Pra Mudar Pra IA Diferente

Cenários em que pode fazer sentido trocar:

- **Bugs complexos que a IA atual não está resolvendo após 2-3 iterações** → tenta outra IA com perspectiva diferente
- **Tarefa específica em que outra IA tem vantagem** (ex: Cursor pra mudanças grandes, Claude pra análise profunda)
- **Limitações de contexto** — conversa ficando longa demais

**Mudar não é problema.** Quando muda, abre nova conversa, cola este documento + briefing master + briefing da tarefa atual.

---

## Fluxo de Trabalho Detalhado (resumo geral)

### Passo 1 — Briefing
Claude (Estrategista) prepara briefing técnico. Gui repassa pra IA dev temporário.

### Passo 2 — Identificação de Cenário
IA verifica acesso ao GitHub. Se necessário, guia setup.

### Passo 3 — Implementação
IA implementa seguindo padrões do projeto.

### Passo 4 — Entrega
**Cenário A:** commits diretos no `main` (default) ou em branch se a tarefa for excepcional.
**Cenário B:** código formatado no chat + comandos pro Gui.

### Passo 5 — Aplicação (Cenário B) ou Validação (Cenário A)
**Cenário A:** Gui faz `git pull`, testa no celular.
**Cenário B:** Gui aplica manualmente, commita, testa no celular.

### Passo 6 — Teste
Gui builda local, testa no celular.

### Passo 7 — Feedback
"Funcionou" ou "Quebrou com erro X" → IA ajusta.

### Passo 8 — Relatório de Execução
Ao final, IA produz relatório com:
- O que foi implementado
- Decisões tomadas
- Pendências/melhorias futuras
- Status: ready for merge / blocked / needs review

---

## Encerrando a Sessão de Dev Temporário

Quando a tarefa estiver concluída:

1. Dev Temporário produz **Relatório de Execução final**
2. **Cenário A:** commits já estão no `main` (default). Se foi uma exceção em branch, Gui mergeia.
3. **Cenário B:** Gui aplica todas as mudanças no repo manualmente
4. Briefing v2.5 (estado de implementação) é atualizado (Claude pode ajudar nessa atualização)
5. Quando Manus voltar, Gui pode passar o relatório pra ele tomar pé

---

## Resumo Operacional Curto (TL;DR)

Quando você é Dev Temporário:

1. **Verifica seu acesso aos documentos do projeto.** Se tem, lê automaticamente. Se não, pede pro Gui colar.
2. **Lê o briefing técnico da tarefa** em `docs/internal/` (Cenário A) ou pede pro Gui colar (Cenário B).
3. **Identifica seu cenário de execução** (A: acesso ao GitHub, ou B: chat tradicional).
4. **Se Cenário A:** confirma acesso ou guia Gui pra habilitar conector. Trabalha com commits diretos no `main` (default), em commits lógicos não-monolíticos.
5. **Se Cenário B:** entrega código formatado no chat. Gui aplica.
6. **Você substitui o Manus.** Faz o que ele faria, com as adaptações do cenário.
7. **Documenta tudo.** ARCHITECTURE, INTERPRETER, LEVELS, DECISIONS no repo.
8. **Não chuta. Não inventa. Não floreia.** Faz o que o briefing pede.
9. **Confidencial.** Projeto secreto.
10. **Relatório de Execução no final.** Sempre.

---

*Documento criado por Claude (Estrategista) — Maio/2026.*
*Versão 1.1 — Atualizado para refletir adoção do Claude Code como Dev Temporário ativo, commit direto no `main` como default, e convenção de briefings em `docs/internal/`.*
*Aplicável sempre que o Manus estiver fora ou quando o Gui escolher trabalhar com outra IA.*
