# Níveis — Norte Code MVP

**Última atualização:** 05/05/2026
**Versão:** 1.0.0 (Nível 1 jogável)

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
- Condição de vitória: `plant_all_seeds`
- Max blocos: 4
- Reward key: `seed_lvl1`
- Arquivo: `lib/levels/index.ts` → `createLevel1()`

## Nível 2 — Sequência mais longa (3-4 passos)

- **Conceito:** sequência (reforço)
- **Cenário:** avatar anda até sementinha, planta, anda até regador, rega
- **Blocos:** [Andar para frente] (várias) [Plantar] [Regar]
- **Solução:** [Andar] [Andar] [Plantar] [Andar] [Regar]
- **Recompensa visual:** primeiro broto verde no Mundo
- **Texto:** "Sequências mais longas funcionam igual. Um passo de cada vez, na ordem certa."

## Nível 3 — Introdução à direção

- **Conceito:** sequência com escolha de direção
- **Cenário:** avatar desvia de pedra pra chegar à sementinha
- **Blocos:** [Andar para frente] [Virar à direita] [Virar à esquerda] [Plantar]
- **Solução:** [Andar] [Virar direita] [Andar] [Virar esquerda] [Andar] [Plantar]
- **Recompensa visual:** flor crescendo ao lado da pedra
- **Texto:** "Bom! Às vezes o caminho não é reto. Programar é dar direção certa."

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
