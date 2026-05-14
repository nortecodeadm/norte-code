# Decisões Estratégicas — Roadmap Visual do Mundo Permanente

**Nota pro Claude Code:** este arquivo contém entradas que DEVEM ser copiadas pra `docs/DECISIONS.md` no repo do projeto durante a implementação do Nível 5. Após copiar, este arquivo (`NORTECODE_DECISIONS_PendingEntries.md`) pode ser apagado, OU mantido vazio como template pra próximas entradas que o Estrategista preparar.

Conteúdo abaixo é texto pronto pra inserção. Adapte apenas o campo `[YYYY-MM-DD]` pra data real do commit.

---

## Entrada 1 — Roadmap Visual + Pedagógico consolidado (Níveis 5-10)

```
[YYYY-MM-DD] Decisão estratégica: Roadmap completo dos Níveis 5-10 consolidado em sessão dedicada.

Após entrega do Nível 4, fizemos sessão de estratégia dedicada para
desenhar coerência narrativa e pedagógica entre os 6 níveis restantes
do MVP. Decisões registradas:

ESCOPO DO MVP:
- O MVP cobre: Criação (Níveis 1-8) + Tentação (Nível 9) + Queda +
  início da Esperança/Restauração (Nível 10).
- Cidade que cuida do jardim fica pós-MVP.
- Capítulo Narrativo formal (telas dedicadas) fica pra sessão posterior.

ESTRUTURA NARRATIVA DOS NÍVEIS:
- Níveis 1-4 já entregues — sementinha vira mini-árvore, primeiras
  flores aparecem.
- Nível 5: primeira grande mudança visual do Mundo (background novo,
  grama, flor no tronco). Plantinhas estágio 3 substituem sementes.
- Níveis 6-8: amadurecimento do jardim. Fauna entra gradualmente
  (pássaro no 6, esquilo no 7, fauna pequena no 8). Árvore frutífera
  aparece no Nível 7 (antecipando coleta de frutas do Nível 8).
- Nível 9: serpente aparece e oferece atalho. Inevitabilidade.
- Nível 10: cenário muda radicalmente pra árido. Mas termina com
  brotos novos, sinalizando esperança.

PRINCÍPIO PEDAGÓGICO "FERRAMENTAS ANTECIPADAS":
- Cada conceito de programação aprendido nos Níveis 5-8 será REVISITADO
  no Nível 10 como ferramenta de restauração no árido.
  - Loop (Nível 5) → replantar rápido no árido
  - Condicional (Nível 6) → decidir onde plantar (solo bom vs ruim)
  - If/else (Nível 7) → escolher entre plantar e regar conforme contexto
  - Variável (Nível 8) → racionar sementes com água disponível
- O Nível 10 pode NÃO usar todos os conceitos — provavelmente 2-3.
  Lista exata definida em sessão dedicada antes da implementação do 10.
- O texto de conclusão de cada nível 5-8 planta a semente de que o
  conceito vai ser útil mais pra frente. Não é enrolação narrativa,
  é design pedagógico calibrado.

CONTINUIDADE VISUAL DA PLANTA PRINCIPAL:
- Uma única planta evolui ao longo dos níveis: sementinha (1) → broto
  (2) → broto médio (3) → mini-árvore (4) → árvore jovem (6) →
  árvore frutífera (7).
- Substituições em cadeia, mesmo padrão estabelecido nos Níveis 1-4.

MUDANÇAS GRANDES DE BACKGROUND DO MUNDO:
- Nível 5: background v1 → v2 (mesma cena com graminha esparsa +
  florestinha em silhueta + flor no tronco).
- Nível 10: background v2 → árido. Primeira mudança radical de paleta
  do MVP. Jardim Fase 1 vira memória/silhueta no horizonte.

DECISÃO TÉCNICA: o background é substituível (mesma lógica de
substituição usada pra plantas).

ROADMAP COMPLETO DOCUMENTADO em Briefing MVP v2.7 (docs/internal/),
Seção 4.7.
```

---

## Entrada 2 — A queda do Nível 9 como inevitabilidade narrativa

```
[YYYY-MM-DD] Decisão narrativa-chave: a queda no Nível 9 é inevitável.

A serpente que aparece no Nível 9 oferece um "atalho" pra criança.
Mecânica exata da oferta ainda TBD (sessão dedicada antes da
implementação do Nível 9), mas o PRINCÍPIO está decidido:

Toda criança que joga o MVP "cai" no Nível 9. Não há caminho técnico
pra recusar o atalho da serpente. Razões:

1. Coerência teológica (Gênesis 3): a queda não tem versão alternativa.
   É a história sendo contada, não teste de virtude do jogador.

2. Coerência pedagógica: se o Nível 10 (consequência da queda) é o
   coração narrativo do MVP, todas as crianças precisam chegar lá.
   Caminho opcional faria metade das crianças nunca ver a virada.

3. Coerência psicológica: "ser tentado e cair" é parte da experiência
   humana. Reforçar que a queda é responsabilidade individual quando
   ela na verdade é universal seria moralismo, não narrativa.

IMPLICAÇÃO PRÁTICA:
- O Nível 9 termina com sucesso TÉCNICO (programa funciona) mas
  ERRO NARRATIVO (algo se quebrou).
- O Nível 10 NÃO é punição. É consequência + nova oportunidade. A
  mensagem final é de esperança.
- A criança que escolheu o atalho não deve se sentir mal — a história
  precisa SUSTENTAR ela. A mensagem do Nível 10 explicita que o que
  foi aprendido permanece, e que cuidar continua possível mesmo no
  difícil.

A mecânica específica do atalho (NPC, bloco mágico na paleta, restrição
de maxBlocks que força a aceitar, etc.) será decidida em sessão dedicada
antes da implementação do Nível 9.

Hipótese de design forte registrada: a serpente oferece um bloco
pré-pronto que substitui a função "cuidar" que a criança construiu —
subvertendo a abstração aprendida. A criança escolhe o "pronto" sobre
o que ela cultivou. Isso é exatamente a queda contada em código.
```

---

## Entrada 3 — Princípio de substituição estendido ao background do Mundo

```
[YYYY-MM-DD] Decisão técnica: background do Mundo permanente é substituível.

O mesmo padrão usado pra plantas (substituir grown_sprout_lvl3 por
mini_tree_lvl4) é estendido pro background da Tela Mundo.

A partir do Nível 5, o background pode mudar:
- Crianças que NÃO passaram do Nível 4: veem background v1.
- Crianças que passaram do Nível 5: veem background v2.
- Crianças que passaram do Nível 10: veem background árido.

Implementação sugerida: no WORLD_LAYOUT, o background é um elemento como
qualquer outro, com regras de substituição. Quando o nível N é concluído
e tem `rewards` que substituem o background, o asset é trocado.

Estrutura sugerida:
{ type: "world_background_replace", removeId: "bg_v1", addId: "bg_v2", asset: "background_mundo_v2" }

Esta decisão tem impacto na implementação do Nível 5 (primeira ocorrência)
e do Nível 10 (segunda ocorrência, mais radical).
```

---

*Documento de transição preparado por Claude (Estrategista) em Maio/2026.*
*Conteúdo a ser copiado pra `docs/DECISIONS.md` do repo durante a implementação do Nível 5.*
