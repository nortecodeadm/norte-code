# Norte Code — Roadmap Narrativo

**Documento vivo. Versão 1.0 — Abril/2026.**

Este documento registra a **visão narrativa de longo prazo** do Norte Code: o arco completo do produto, das fases de jornada do jogador às missões especiais que ecoam histórias bíblicas sem nomeá-las. Serve como bússola pra todas as decisões de produto que envolverem narrativa, evolução do mundo, ou novos conteúdos.

**Por que existe:** o MVP é deliberadamente enxuto (10-12 níveis em 3 fases). Mas a tese do produto é muito maior — ela só faz sentido com a jornada longa. Sem este documento, corremos o risco de perder a visão de longo prazo conforme o desenvolvimento avança feature por feature.

**Como usar:** consultar antes de qualquer briefing de execução que envolva conteúdo narrativo, novos cenários, novas missões, ou evolução do mundo permanente. Atualizar conforme decisões forem refinadas.

---

## 1. Princípio Estruturante

O Norte Code tem **dois espaços narrativos** que coexistem:

**1. Mundo Permanente** — o jardim/cidade da criança. Casa dela. É onde ela mora, planta, constrói, cuida. A maior parte do tempo de uso é gasto aqui. Cresce continuamente conforme ela avança nos níveis. Nunca é abandonado.

**2. Missões Especiais** — incursões temporárias em cenários novos, com narrativa própria, ecoando histórias bíblicas sem nomeá-las. Cada missão é vivida pela criança como participante (não como espectadora). Tem início, meio e fim claros. Após completar, a criança volta pro mundo permanente trazendo algo dela.

**A ligação entre os dois:** cada missão especial **deixa marca permanente no mundo da criança** — uma estrutura nova, uma criatura nova, uma semente especial, um companheiro adicional. As missões enriquecem a casa, não a substituem.

---

## 2. As Três Fases da Jornada Inicial

Antes das missões especiais começarem, a criança vive uma jornada estruturada em três fases que estabelecem a tese do produto.

### Fase 1 — Origem

**Eco bíblico:** Criação. Gênesis 1-2.

**Mundo:** terreno vazio se transformando. A criança começa só com terra, e cada nível faz algo nascer. Sementes, brotos, primeiros animais, primeiras estruturas pequenas.

**Sensação central:** "alguém está criando junto comigo". A presença de "alguém" no mundo é sentida pelos efeitos (algumas coisas surgem antes da criança programar — a luz, a água, o ar). A criança nunca vê esse "alguém", mas sente.

**Aprendizado de programação:** sequência → primeiros loops simples.

**Capítulo de abertura:** entre o nível 3 e o 4. Roteiro detalhado em `docs/chapters/chapter-01-origem.md`.

### Fase 2 — Quebra

**Eco bíblico:** Queda e exílio. Gênesis 3.

**Mundo:** uma serpente aparece (sem nome, sem fala explícita — só presença). Algo dá errado. O jardim original se fecha pra criança. Ela é mandada pra outro terreno: mais árido, mais difícil, com vestígios de algo que foi bonito.

**Sensação central:** "perdi algo. mas posso recomeçar." Não é punição — é deslocamento. A criança não é "expulsa por castigo" no tom narrativo; ela é "mandada com missão" pra um lugar que precisa de cuidado.

**Aprendizado de programação:** introdução a condicionais (decisões).

**Capítulo de transição:** curto, 3-4 telas. Roteiro detalhado em `docs/chapters/chapter-02-quebra.md`.

### Fase 3 — Reconstrução

**Eco bíblico:** Mordomia, vocação humana de cuidar do criado em condições difíceis. Gênesis 3:23, Eclesiastes.

**Mundo:** novo terreno, mais árido inicialmente. A criança aprende a fazer florescer mesmo onde é mais difícil. Conforme avança, o lugar fica bonito de novo — diferente do primeiro, mas com beleza própria.

**Sensação central:** "trabalho dá fruto. cuidar transforma." A criança experimenta que cuidar de um lugar imperfeito também é vocação, e que beleza pode nascer de terreno difícil.

**Aprendizado de programação:** loops complexos, variáveis, primeiras funções.

**É nessa fase que a Reconstrução vai **continuamente** se desenvolvendo** ao longo do produto. Mesmo quando missões especiais começam, a Reconstrução do mundo permanente continua acontecendo entre missões.

---

## 3. As Missões Especiais — Princípios de Design

Antes de listar as missões, é fundamental fixar os princípios que sustentam o design delas. Sem esses princípios, o produto cai em uma das duas armadilhas: sutil demais (perde o eco bíblico) ou maquiagem rasa (Bible App for Kids com nome trocado).

### Princípio 1 — Estrutura teológica clara, detalhes próprios

A missão deve ter o **mesmo gesto teológico** da história bíblica que ecoa, mas com **detalhes próprios** do mundo do Norte Code. Não é cópia da história com nomes trocados. É história nova com estrutura teológica reconhecível.

**Exemplo:** a missão da Grande Embarcação não é "salvar animais de uma chuva grande" (idêntica a Noé). É algo como: *"a terra está cansada e precisa descansar de tudo que vive nela; você precisa preparar um lugar que guarde a vida enquanto a terra descansa"*. Mesma teologia (preservação da vida pela mordomia em meio ao juízo), mundo próprio, narrativa autoral.

### Princípio 2 — Criança vive a história, não assiste

Em toda missão, a criança é **participante ativa**, nunca espectadora. Ela programa as ações que fazem a história acontecer. Não é "ler sobre Noé construindo a arca", é "construir a embarcação programando".

### Princípio 3 — Vocabulário próprio, ecos reconhecíveis

Não usar nomes bíblicos diretos (Noé, Moisés, Davi, etc.). Não citar versículos. Não usar "Deus", "Senhor", "Jesus" explicitamente. Mas usar **vocabulário** e **gestos** que ecoam: "alguém olhou pra você", "você foi chamado", "você foi enviado", "guarde isso pelo tempo que durar", "atravesse comigo".

### Princípio 4 — Marca permanente no mundo

Toda missão deve resultar em **algo permanente** no mundo da criança. Pode ser uma estrutura nova, um companheiro novo, uma semente especial, uma habilidade nova, uma criatura. A missão enriquece o mundo permanente — nunca é só "episódio que passa".

### Princípio 5 — Frequência espaçada

Missões especiais não são cotidianas. Acontecem em **marcos** da jornada, não a cada nível. Isso preserva o peso de cada uma. Estimativa: uma missão a cada 8-12 níveis do mundo permanente.

### Princípio 6 — Escopo finito

O produto não pretende cobrir toda a Bíblia. **5-7 missões totais** ao longo da vida do produto, cuidadosamente roteirizadas. Mais que isso esgota repertório e força conteúdo.

---

## 4. As Missões Especiais Planejadas

Ordem cronológica sugerida. Cada missão tem proposta de eco bíblico, gesto teológico central, e marca deixada no mundo permanente.

### Missão 1 — A Grande Embarcação

**Eco:** Dilúvio (Gênesis 6-9).
**Gesto teológico:** preservação da vida pela mordomia em meio ao juízo. Obediência paciente. Recomeço após travessia.
**Estrutura narrativa:** a criança é chamada a construir uma embarcação grande pra abrigar criaturas durante um período em que a terra precisa descansar. Programa a construção (níveis com loops complexos), seleciona o que entra (puzzle de organização), atravessa o período (níveis contemplativos com ritmo lento), replanta depois.
**Marca no mundo permanente:** sementes especiais que só vieram do "depois da travessia". Animais novos que se juntam ao mundo da criança. Uma estrutura tipo arco/marco que fica visível no mundo dela.
**Posicionamento na jornada:** após criança dominar loops e condicionais.

### Missão 2 — A Libertação

**Eco:** Êxodo.
**Gesto teológico:** justiça, libertação, jornada coletiva, providência.
**Estrutura narrativa:** a criança vai a um lugar onde um pequeno povo está preso, sem comida, sem caminho. Programa quebra-cabeças pra abrir caminhos, distribuir alimento, guiar pessoas por terrenos difíceis. Atravessa um obstáculo grande (eco do Mar Vermelho — pode ser uma travessia de pântano, um caminho que se abre).
**Marca no mundo permanente:** companheiros adicionais que vieram do povo libertado. Esses companheiros vivem no mundo da criança, têm pequenas histórias próprias, oferecem trocas/ajudas pontuais.
**Posicionamento na jornada:** após criança dominar variáveis e funções.

### Missão 3 — A Cidade Velha

**Eco:** Reconstrução de Jerusalém (Esdras-Neemias).
**Gesto teológico:** restauração, perseverança contra oposição, comunidade trabalhando junto.
**Estrutura narrativa:** a criança vai a um lugar antigo, em ruínas. Programa a reconstrução de muros, a organização de moradores, a restauração de espaços. Enfrenta dificuldades (escassez, oposição leve narrada como "alguns não querem que se reconstrua").
**Marca no mundo permanente:** habilidade nova de "construir muros/cercas" que pode ser aplicada na cidade da criança. Memória visual da cidade restaurada como inspiração.
**Posicionamento na jornada:** quando a cidade da criança já está se desenvolvendo significativamente.

### Missão 4 — A Semente que Caiu

**Eco:** Paixão de Cristo (João 12:24, Gospels).
**Gesto teológico:** a vida que vem da morte; o cuidado que se dá entregando, não retendo; sacrifício como caminho de fruto.
**Estrutura narrativa:** muito delicada. A criança encontra uma semente especial que precisa "ser deixada na terra escura por um tempo" pra dar fruto maior. A criança espera (níveis lentos, contemplativos). Quando volta, a semente não está mais — mas em volta, vida nova nasceu. Em escala muito maior do que se ela tivesse só guardado a semente.
**Marca no mundo permanente:** uma árvore central no jardim da criança, que dá frutos especiais usados em outras missões/níveis.
**Posicionamento na jornada:** marco emocional importante. Não cedo. Provavelmente após criança ter forte vínculo com o mundo.

### Missão 5 — A Cidade-Jardim

**Eco:** Nova Jerusalém (Apocalipse 21-22).
**Gesto teológico:** consumação, integração final, beleza redimida.
**Estrutura narrativa:** mais que missão — é **culminação**. A criança não vai pra outro lugar; o próprio mundo dela revela uma camada nova. A cidade que ela construiu tem o jardim dentro, a árvore especial (da missão 4) no centro, os companheiros (da missão 2) habitando, os marcos (da missão 1, missão 3) integrados. Tudo o que foi cultivado e recebido se integra.
**Marca no mundo permanente:** o mundo permanente passa a ter um nome próprio (que a criança escolhe). Visualmente atinge uma camada nova de beleza.
**Posicionamento na jornada:** marco final do arco principal do produto. Após essa, o produto pode continuar com novos níveis, mas o arco narrativo principal está consumado.

---

## 5. Missões Possíveis (não confirmadas)

Estas estão sendo consideradas mas não confirmadas. Entram apenas se houver fôlego narrativo e se servirem ao todo:

- **A Casa que Recebeu Estranhos** (eco de Lucas 14, hospitalidade radical)
- **O Ovo que Esperou** (eco do nascimento de Cristo, expectativa cumprida)
- **A Pequena Luz na Tempestade** (eco de João 1, luz nas trevas)

Cada uma dessas requer roteiro próprio se for desenvolvida.

---

## 6. Princípios Adicionais sobre Cosmovisão

Além dos capítulos narrativos das fases iniciais e das missões especiais, a cosmovisão cristã do Norte Code permeia o produto inteiro de formas distribuídas:

**Falas curtas do mascote em momentos-chave** — quando criança erra muitas vezes, completa nível difícil, volta após dias, planta árvore especial. Pequenas pílulas de sabedoria em linguagem afetiva, sem virar pregação.

**Nomes dos níveis com peso** — "Primeira Semente", "O Que Se Repete", "Na Medida Certa", "Saber Quando", "Pra Quem Tem Pouco", "Construir e Manter".

**Textos pós-nível com camada de sentido** — em vez de "Você aprendeu loop", textos como *"Você fez três flores nascerem. Cuidar repetido também é cuidar."*

**Trilha sonora com temas conectados** (futuro) — temas musicais associados a cada fase e missão. Memória afetiva acumulada.

**Disposições espirituais cultivadas pela mecânica** — paciência (esperar a fruta), cuidado (regar antes de podar), compartilhamento (decisões de mordomia pós-MVP), esperança (o jardim sempre pode voltar).

---

## 7. O Que Tudo Isso Soma

Ao final da jornada completa, uma criança que jogou Norte Code teve contato com:

- **O arco bíblico inteiro** em forma narrativa vivida (criação, queda, exílio, reconstrução, dilúvio/preservação, libertação, restauração, paixão/ressurreição, consumação)
- **Conceitos teológicos centrais** sentidos pela vivência (mordomia, justiça, providência, sacrifício, restauração, comunidade)
- **Disposições espirituais cultivadas** ao longo de meses de uso
- **Vocabulário de sentido** absorvido naturalmente
- **Programação de verdade** (sequência, loops, condicionais, variáveis, funções, possivelmente recursão e estruturas de dados em conteúdo futuro)

Tudo isso **sem versículo, sem catequese, sem pregação direta**. A cosmovisão cristã foi vivida, não ensinada como matéria.

E se houver o desejo, depois, de ensinar a Bíblia explicitamente — em casa, na igreja, na catequese — a criança terá um **solo fértil de imaginação cristã** preparado. Os ecos vividos no Norte Code vão ressoar com as histórias bíblicas reais quando ela as encontrar.

Esse é o ponto.

---

## 8. Como Este Documento Evolui

Este roadmap é vivo. Ajustes esperados conforme o produto se desenvolve:

- **Roteiros detalhados de cada capítulo e missão** vão ser escritos em arquivos separados em `docs/chapters/` e `docs/missions/` quando entrarem em desenvolvimento
- **Ordem das missões** pode ser ajustada com base em feedback real (Benjamin, beta testers)
- **Missões podem ser cortadas ou adicionadas** se a tese do produto se mostrar diferente na prática
- **Marcas no mundo permanente** podem ser refinadas conforme arquitetura técnica permite

Mas os **princípios de design** (Seção 3) e as **três fases iniciais** (Seção 2) são estruturais. Mudanças neles requerem decisão explícita do Gui registrada em DECISIONS.md.

---

*Documento criado por Claude em colaboração com Gui. Abril/2026.*
*Versão 1.0 — Visão narrativa de longo prazo do Norte Code.*
