# Entrada pendente pro DECISIONS.md — Mascote como Gabarito Visual (a partir do Nível 7)

**Nota pro Claude Code:** este arquivo contém entrada nova pra `docs/DECISIONS.md` que deve ser copiada durante a implementação do mascote-gabarito (mini-projeto que precede o Nível 9). Após copiar, este arquivo pode ser apagado, OU mantido vazio como template pra próximas entradas que o Estrategista preparar.

Conteúdo abaixo é texto pronto pra inserção. Adapte apenas o campo `[YYYY-MM-DD]` pra data real do commit.

---

```
[YYYY-MM-DD] Decisão narrativa-arquitetural: A partir do Nível 7, o mascote executa a tarefa como gabarito visual após o avatar.

CONTEXTO:
Durante a sessão estratégica do Nível 9 (Maio/2026), surgiu a
questão de como fazer a criança "experimentar" a queda sem ser
manipulada pelo design. Gui propôs que o mascote vire o agente da
queda quando a criança escolhe certo, e em seguida refinou a ideia
pra que o mascote já tenha um papel ativo nos níveis anteriores —
como "gabarito visual" da solução ótima.

DECISÃO:
A partir do Nível 7, toda execução bem-sucedida do programa pela
criança é seguida IMEDIATAMENTE de uma execução do mascote, que
aplica a solução ótima do nível (gabarito definido na config do
nível). O mascote tem avatar próprio no mapa durante essa segunda
execução. Mensagem entre as execuções: "O {nome do mascote}
aprendeu com você. Olha o jeito dele!" (refinável durante
implementação).

MOTIVAÇÃO PEDAGÓGICA:
1. Mostra a solução ótima sem corrigir explicitamente a criança.
   Ela pode passar o nível com solução longa e ainda assim VER a
   versão elegante. Aprendizagem por exemplo, não por correção.
2. Honra a autonomia da criança: não há punição por usar solução
   longa. Ela passa, vence, e DECIDE se da próxima vez quer
   experimentar o jeito mais elegante.
3. Resolve um problema pedagógico antigo do MVP: a "solução
   elegante" sempre existia como solução-alvo mas a criança podia
   passar todos os níveis sem nunca tê-la visto.

MOTIVAÇÃO NARRATIVA:
1. Mascote vira segundo agente moral do jogo — companheiro com
   agência própria, não decoração. Coerente com cosmovisão reformada:
   a criação inteira (não só os humanos) participa do drama da queda
   e da redenção (Rm 8).
2. Estabelece expectativa visual de "mascote sempre aprende e acerta"
   ao longo dos Níveis 7-8. Constrói confiança da criança no
   companheiro.
3. Pavimenta narrativamente o Nível 9: a quebra dessa expectativa
   (quando o mascote, pela primeira vez, é seduzido pela serpente e
   pega o atalho) tem peso emocional alto. Sem essa fundação, a
   queda no Nível 9 seria arbitrária.

PRINCÍPIO DE NÃO-RETROATIVIDADE PRESERVADO:
Implementar o mascote-gabarito nos Níveis 7 e 8 é aditivo, não
retroativo:
- Não muda como os níveis funcionam mecanicamente
- Não muda o que a criança pode fazer
- Adiciona uma CENA POSTERIOR (execução do mascote) após o sucesso
- Equivalente a adicionar nova animação no level summary

Níveis 1-6: NÃO recebem o mascote-gabarito. Princípio de não-
retroatividade respeitado pra esses níveis. (O mascote já existe
nesses níveis como personagem decorativo afetivo — função antiga
preservada.)

IMPLICAÇÕES TÉCNICAS:
1. Cada nível a partir do 7 precisa ter o GABARITO definido em sua
   config — a sequência de blocos da solução ótima.
2. O interpretador roda 2 vezes após sucesso: 1ª com programa da
   criança, 2ª com gabarito.
3. Sprite do mascote substitui o avatar verde durante a 2ª
   execução. Mesma mecânica visual de movimento, plantio, rega,
   coleta — só o sprite muda.
4. Estado do mapa precisa resetar entre as 2 execuções (planta
   cresceu na execução da criança — volta ao estado inicial pra
   execução do mascote).
5. Mascote pode executar TODAS as ações que o avatar executa.

ARCO COMPLETO PREVISTO PARA O MASCOTE NO MVP:
- Níveis 1-6: companheiro decorativo afetivo (estado atual)
- Níveis 7-8: gabarito visual confiável (executa sempre certo)
- Nível 9: gabarito quebrado — mascote é seduzido pela serpente,
  pega o atalho, é o agente da queda. Quebra de expectativa
  emocional alta.
- Nível 10: mascote precisa de redenção tanto quanto a criança.
  Algumas tarefas da restauração podem ser executadas pelo mascote
  (não pelo avatar) — restauração comunitária, não individual.

CONEXÃO COM TESE-ÂNCORA DO ARCO (Níveis 9-10):
Esta decisão sustenta a tese registrada na sessão estratégica:
"Restauração parcial + aprendizado integrado + motivação pra
continuar." O mascote-gabarito ensina; a quebra dele no Nível 9
mostra que a queda é real; a redenção dele no Nível 10 mostra que
restauração é trabalho de mais de um.

DECISÕES AINDA EM ABERTO (mini-sessão dedicada antes da
implementação):
- Posicionamento exato da mensagem entre execuções
- Animação de transição entre as 2 execuções (fade? pulse?
  instantâneo?)
- Comportamento de "entrada" do mascote (aparece do nada? caminha
  até a posição inicial?)
- Reset visual do mapa entre as 2 execuções
- Casos especiais: e se a criança já fez exatamente o gabarito?
  Mostra mesmo assim?
- Onde armazenar o "gabarito" tecnicamente
```

---

*Documento de transição preparado por Claude (Estrategista) em Maio/2026.*
*Conteúdo a ser copiado pra `docs/DECISIONS.md` do repo durante a implementação do mascote-gabarito (mini-projeto que precede o Nível 9).*
