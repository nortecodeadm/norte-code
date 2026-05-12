# Níveis — Norte Code MVP

**Última atualização:** 12/05/2026
**Versão:** 1.2.0 (Nível 3 jogável)

---

## Princípio

Cada nível ensina **uma única coisa**. Não acumular conceitos novos por nível.

## Layout Padrão de um Nível

- Cenário no topo (40% da tela): mundo do nível onde o personagem age
- Paleta de blocos no meio (15%): blocos arrastáveis disponíveis
- Área de montagem embaixo (35%): onde a criança encaixa os blocos
- Botão "▶ Executar" (10%): roda o programa montado

## Mapeamento Narrativo

| Níveis | Fase Narrativa | Descrição |
|--------|---------------|-----------|
| 1–5 | Fase 1 (Origem) | Primeiro jardim, ajudando "alguém" a criar |
| Transição | Fase 2 (Quebra) | Capítulo narrativo: serpente, jardim se fecha |
| 6–10 | Fase 3 (Reconstrução) | Novo terreno árido, reconstrução |

---

## Nível 1 — Sequência simples (2 passos) ✅ IMPLEMENTADO

- **Conceito:** sequência de ações em ordem
- **Cenário:** avatar anda até sementinha e planta
- **Blocos:** [Andar para frente] [Plantar]
- **Solução:** [Andar para frente] → [Plantar]
- **Recompensa visual:** sementinha aparece no chão do Mundo
- **Texto de resumo:** "Você fez seu primeiro programa! Cada passo na ordem certa. Isso se chama **sequência**."

**Implementação técnica:**
- Grid: 3×1, player em (0,0) facing east
- Célula (1,0) marcada como `flowerbed` (alvo visual com borda pontilhada verde)
- Condição de vitória: `plant_all_seeds` (nenhum flowerbed restante sem semente)
- Max blocos: 4
- Reward key: `seed_lvl1`
- Arquivo: `lib/levels/index.ts` → `createLevel1()`

**UX implementada:**
- Objetivo claro no topo: "🌱 Plante no canteiro marcado"
- Instrução: "Toque nos blocos para montar seu programa"
- Hint após 5s de inatividade: "Dica: toque em 'Andar' e depois em 'Plantar' — nessa ordem!"
- Feedback de erro contextual (não plantou, plantou no lugar errado, não andou)
- Animação de sucesso: 1.2s delay → navega pro Level Summary

**Comportamento de recompensa pós-nível:**
- Level Summary salva `seed_lvl1` em `WORLD_ELEMENTS` (AsyncStorage)
- Ao voltar pra Tela Mundo, se `seed_lvl1` está em `WORLD_ELEMENTS`, renderiza `mundo_sementinha.png` na posição definida em `WORLD_LAYOUT`
- Persistência: local (AsyncStorage) + remoto (Supabase `world_elements` quando online)

## Nível 2 — Sequência mais longa (5 passos) ✅ IMPLEMENTADO

- **Conceito:** sequência (reforço do Nível 1, com mais passos)
- **Cenário:** avatar anda até canteiro, planta, anda mais um passo, rega
- **Blocos:** [Andar para frente] [Plantar] [Regar]
- **Solução:** [Andar] [Andar] [Plantar] [Andar] [Andar] [Regar]
- **Recompensa visual:** broto verde **substitui** a sementinha do Nível 1
- **Texto:** "Sequências mais longas funcionam igual. Um passo de cada vez, na ordem certa."

**Implementação técnica:**
- Grid: 5×1, player em (0,0) facing east
- Célula (2,0) marcada como `flowerbed` (canteiro — borda pontilhada laranja)
- Célula (4,0) marcada como `watering_spot` (destino regar — borda pontilhada azul)
- Condição de vitória: `custom` (célula 2 = `seed` E célula 4 = `watered`)
- Max blocos: 6
- Reward key: `sprout_lvl2` (replaces: `seed_lvl1`)
- Arquivo: `lib/levels/index.ts` → `createLevel2()`

**Mecânica nova — Regar:**
- Bloco `water` já existia no interpretador (transforma seed→sprout, sprout→flower)
- Adicionado: `watering_spot` → `watered` quando o avatar executa `water` nessa célula
- Animação: mesma cadeia de 600ms/step do Nível 1, célula muda de cor ao ser regada

**Sistema de substituição de recompensas:**
- Ambos `seed_lvl1` e `sprout_lvl2` ficam em `WORLD_ELEMENTS` (histórico)
- Renderização decide: se `sprout_lvl2` existe, mostra broto; senão, mostra sementinha
- Asset: `assets/mundo/mundo_broto.png` (610×625, RGBA)

**Mensagens de erro contextuais:**
- Sem plantar: "Você esqueceu de plantar! Use o bloco 'Plantar' no canteiro marcado."
- Sem regar: "Você plantou, mas a sementinha precisa de água! Use o bloco 'Regar' no final."
- Caminho errado: "Acho que o caminho não está certo. Olha onde está o canteiro e onde precisa regar."
- Plantou no lugar errado: "A sementinha precisa ser plantada no canteiro marcado."

## Nível 3 — Desviando do caminho (Grade 2D) ✅ IMPLEMENTADO

- **Conceito:** movimentos direcionais absolutos + obstáculo
- **Cenário:** avatar desvia de pedra usando movimentos absolutos (descer, direita, subir)
- **Blocos:** [Descer ↓] [Direita →] [Subir ↑] [Plantar 🌱]
- **Solução:** [Descer] [Direita] [Direita] [Subir] [Plantar]
- **Recompensa visual:** broto cresce (substitui broto) + flor ao lado da pedra no Mundo
- **Texto:** "Bom! Às vezes o caminho não é reto. Programar é dar direção certa."

**Implementação técnica:**
- Grid: 3×2, player em (0,0)
- Célula (1,0) marcada como `rock` (obstáculo — fundo marrom, ícone 🪨)
- Célula (2,0) marcada como `flowerbed` (canteiro — borda pontilhada verde)
- Condição de vitória: `custom` (célula (2,0) = `seed`)
- Max blocos: 8
- Reward: multi-element (`grown_sprout_lvl3` replaces `sprout_lvl2` + `flower_lvl3`)
- Arquivo: `lib/levels/index.ts` → `createLevel3()`

**Mecânica nova — Movimentos absolutos:**
- `move_right` (→): move +1 no eixo X (leste)
- `move_down` (↓): move +1 no eixo Y (sul)
- `move_up` (↑): move -1 no eixo Y (norte)
- Coexistem com `move_forward` dos Níveis 1-2 (que usa direção relativa do player)
- `move_left` (←): implementado no interpretador, reservado para níveis futuros

**Mecânica nova — Obstáculo (pedra):**
- `rock` em CellContent: bloqueia movimento (retorna `fail_move`)
- Visual: fundo marrom (#BCAAA4) com ícone 🪨
- Legenda dinâmica: "Pedra" aparece na legenda quando grid contém rock

**Sistema de recompensas múltiplas:**
- `reward.elements[]` com operações `add` e `replaces`
- `grown_sprout_lvl3` substitui `sprout_lvl2` visualmente no Mundo
- `flower_lvl3` é adicionado como novo elemento (ao lado da pedra)
- Cadeia de substituição: grown_sprout > sprout > seed (só o mais evoluído aparece)
- Assets: `mundo_broto_crescido.png` (534×774) e `mundo_flor.png` (272×732)

**Mensagens de erro contextuais:**
- Bloqueado por pedra: "Cuidado! Tem uma pedra no caminho. Você precisa desviar."
- Não chegou no canteiro: "O canteiro está lá, mas você não chegou nele."
- Esqueceu de plantar: "Você chegou no canteiro mas esqueceu de plantar!"
- Fora do grid: "Espera! Você está tentando ir pra fora do mundo."

## Nível 4 — Primeira repetição (loop fixo simples)

- **Conceito:** loop / repetição
- **Cenário:** avatar planta 3 sementinhas seguidas
- **Blocos:** [Andar para frente] [Plantar] [Repetir 3 vezes [...]]
- **Solução elegante:** [Repetir 3 vezes [Andar, Plantar]]
- **Solução aceita (longa):** [Andar] [Plantar] [Andar] [Plantar] [Andar] [Plantar]
- **Recompensa visual:** três brotos enfileirados no Mundo
- **Texto:** "Quando você precisa fazer a mesma coisa várias vezes, **repetir** funciona. Programar bem é fazer mais com menos."

## Nível 5 — Loop com variação de quantidade

- **Conceito:** loop (reforço, com escolha de N)
- **Cenário:** avatar rega 5 brotos em sequência
- **Blocos:** [Andar] [Regar] [Repetir N vezes [...]] (N selecionável: 2, 3, 4, 5)
- **Solução:** [Repetir 5 vezes [Andar, Regar]]
- **Recompensa visual:** brotos viram flores, caminho de pedras começa
- **Texto:** "Você escolheu quantas vezes repetir. Esse é o jeito de cuidar bem: na medida certa."

---

### >>> CAPÍTULO NARRATIVO (entre nível 5 e 6) <<<

---

## Nível 6 — Primeira condicional

- **Conceito:** condicional (se / então)
- **Cenário:** avatar anda por caminho; em algumas casas tem semente, em outras não. Planta só onde tem semente.
- **Blocos:** [Andar] [Plantar] [Se houver semente [Plantar]]
- **Solução:** [Repetir 5 vezes [Andar, Se houver semente [Plantar]]]
- **Recompensa visual:** flores formam padrão de canteiro organizado
- **Texto:** "Você ensinou seu personagem a **decidir**. Isso é uma das coisas mais importantes da programação: saber quando fazer e quando não fazer."

## Nível 7 — Condicional com duas ações (se/senão)

- **Conceito:** se / senão (else)
- **Cenário:** avatar anda por caminho. Casas com semente (planta), casas com broto (rega).
- **Blocos:** [Andar] [Plantar] [Regar] [Se houver semente, plantar, senão regar]
- **Solução:** [Repetir 6 vezes [Andar, Se houver semente plantar senão regar]]
- **Recompensa visual:** primeiro arbusto adulto com frutas
- **Texto:** "Cada situação pede uma resposta diferente. Você está aprendendo a **escolher bem**."

## Nível 8 — Introdução à variável (contador simples)

- **Conceito:** variável
- **Cenário:** avatar coleta exatamente 3 frutas e leva pra cesto. Indicador "Frutas: 0".
- **Blocos:** [Andar] [Pegar fruta (frutas + 1)] [Se frutas = 3, parar]
- **Solução:** [Repetir [Andar, Se houver fruta pegar, Se frutas = 3 parar]]
- **Recompensa visual:** cesta com frutas no Mundo, bichinho come fruta
- **Texto:** "Você usou um lugar pra **guardar** uma informação (quantas frutas). Isso se chama **variável**. Programadores usam isso o tempo todo."

## Nível 9 — Função simples (agrupar ações)

- **Conceito:** função / sub-rotina
- **Cenário:** avatar cuida de 3 canteiros. Cada canteiro = andar, plantar, regar.
- **Blocos:** [Andar] [Plantar] [Regar] [Definir "cuidar" = [...]] [Fazer "cuidar"]
- **Solução:** [Definir "cuidar" = [Plantar, Regar]] depois [Repetir 3 vezes [Andar, Cuidar]]
- **Recompensa visual:** três canteiros completos, espaço de cultivo organizado
- **Texto:** "Você criou um nome novo ('cuidar') que junta várias ações. Isso se chama **função**. É como ensinar uma palavra nova pro seu programa."

## Nível 10 — Combinação (loop + condicional + função)

- **Conceito:** combinar tudo
- **Cenário:** avatar atravessa caminho com canteiros e poças. Canteiros → "cuida". Poças → desvia.
- **Blocos:** [Andar] [Virar] [Cuidar (função pré-definida)] [Se houver poça, virar]
- **Solução:** [Repetir 8 vezes [Se houver poça, virar; senão se houver canteiro, cuidar; senão andar]]
- **Recompensa visual:** cerca de madeira no Mundo (início simbólico da cidade)
- **Texto:** "Você juntou tudo o que aprendeu! Sequência, repetição, decisão, lembrar de coisas, e dar nomes pra ações. É assim que tudo o que existe nos celulares foi feito."

---

## Tela Final (após nível 10)

- **Texto:** "Você terminou a primeira jornada. Mais coisas estão crescendo aqui — em breve."
- **Ação:** Botão "Voltar para o mundo" (sem próximo nível)
