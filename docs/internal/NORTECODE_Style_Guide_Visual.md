# Norte Code — Style Guide Visual

**Documento vivo. Versão 1.1 — Abril/2026.**

Este documento define a identidade visual completa do Norte Code e serve como referência única para geração de assets via IA (Gemini/Imagen) durante o MVP. O objetivo é garantir **consistência absoluta** entre todos os elementos do app — mascotes, avatar, cenários, blocos de programação, ilustrações de capítulos.

**Princípio orientador:** se um asset gerado não dialoga visualmente com os outros, ele não entra no app. Consistência > velocidade.

**Fluxo de trabalho dos assets visuais:**
- **Gui** lê este Style Guide, gera os assets no Gemini, filtra e aprova.
- **Manus** recebe os arquivos prontos e integra no código do app.

**Quando consultar este documento:** antes de gerar qualquer asset visual novo. Antes de adicionar variação a um asset existente. Quando houver dúvida sobre cor, proporção, expressão ou composição.

---

## 1. Estilo Geral

### 1.1. Família visual

**Flat-design contemporâneo com toques orgânicos.**

Famílias visuais de referência (estudar antes de gerar):

- **Toca Boca** (Toca Life World, Toca Kitchen) — tom geral de personagens, paleta, proporções
- **Sago Mini** (Sago Mini World, Sago Mini Friends) — formas arredondadas, simplicidade, ternura sem infantilização
- **Hopster TV / Khan Academy Kids** — composição de cenários, integração de personagem com mundo
- **Alto's Odyssey** (Snowman Studios) — paleta natural, sensação contemplativa, uso de espaço negativo

**Não confundir com:**
- Estética Disney/Pixar (3D realista, brilhos saturados) — NÃO
- Pixel art retro — NÃO
- Anime/mangá — NÃO
- Ilustração editorial complexa (estilo The New Yorker) — NÃO
- Cartoons agitados (Cartoon Network estilo Adventure Time) — NÃO

### 1.2. Princípios estéticos invioláveis

1. **Formas arredondadas predominantes.** Sem cantos agudos, sem ângulos agressivos. Tudo orgânico.
2. **Traços simples e limpos.** Sem hatching, sem shading complexo, sem gradientes elaborados.
3. **Sombras suaves quando existirem.** Preferencialmente sombras de cor sólida (mesma matiz, valor mais escuro), não gradientes.
4. **Espaço negativo generoso.** Não encher tela de elementos. Respiração visual é parte da estética contemplativa.
5. **Texturas sutis bem-vindas.** Pequena granulação tipo papel reciclado pode adicionar "alma orgânica" sem quebrar o flat. Usar com moderação.
6. **Sem brilhos berrantes, sem highlights metálicos.** Nada que pareça "videogame de plástico".

---

## 2. Paleta de Cores

### 2.1. Cores primárias da marca

```
Verde-jardim profundo:    #1F5F3F
Dourado suave (sol):      #D4A744
Branco quente (papel):    #FAF6EE
Marrom-terra:             #6B4423
Azul-céu calmo:           #7FA8C9
```

### 2.2. Cores secundárias (uso pontual)

```
Verde-broto (vida nova):  #7FB069
Verde-musgo:              #4A6B47
Bege-areia:               #D9C29A
Azul-rio:                 #5B8AA6
Cinza-pedra:              #8E8B82
Vermelho-fruta (raro):    #B5483A
```

### 2.3. Cores específicas da Fase 2 (terreno árido)

```
Marrom-árido claro:       #B89674
Marrom-árido escuro:      #7A5A42
Verde-resistente:         #6B7E58
Amarelo-poeira:           #C9B584
```

### 2.4. Princípios de uso de cor

- **Sem primárias saturadas puras.** Vermelho puro (#FF0000), azul puro (#0000FF), amarelo puro (#FFFF00) — nunca. Sempre versões dessaturadas, esmaecidas.
- **Paleta limitada por cena.** Cada cena/asset usa no máximo 5-6 cores. Sobreposição visual entre assets garante coerência.
- **Verde e dourado como assinatura.** Esses dois sempre presentes em algum elemento — são a cara da marca.
- **Contraste suficiente para acessibilidade.** Mínimo WCAG AA (4.5:1) para texto, 3:1 para elementos visuais informativos.

---

## 3. Tipografia (referência, não geração)

Tipografia já está definida no briefing principal, mas registro aqui pra coesão:

- **Texto corrido:** Nunito (peso Regular 400, SemiBold 600 para destaque)
- **Títulos e elementos da marca:** Fraunces ou Lora (peso Medium 500)

Não gerar texto via IA — texto é renderizado pelo app.

---

## 4. Mascotes (Cachorro, Gato, Coelho)

### 4.1. Princípios comuns aos três

- **Tamanho relativo ao avatar:** mascote vai até a cintura/peito do avatar. Pequeno, mas presente.
- **Postura padrão (estado de repouso):** sentado, atento, próximo do avatar. Olhando suavemente para o que a criança está fazendo.
- **Olhos:** grandes e suaves, mas não exagerados. Pupila redonda, simples. Olhar sereno por padrão.
- **Sem boca aberta na maioria dos estados.** Mascote sereno = boca fechada ou pequeno sorriso suave. Boca aberta apenas em momentos de celebração.
- **Sem acessórios (chapéu, gravata, óculos).** Mascote nu, identidade pela espécie e expressão.
- **Anatomia simplificada:** sem dedos detalhados, sem músculos, sem pelagem com fios visíveis. Silhueta limpa.

### 4.2. Estados expressivos (mesmo conjunto para os três mascotes)

Pra cada mascote, gerar **5 estados** que cobrem o MVP inteiro:

1. **Repouso/Sereno** (estado padrão, 90% do tempo) — sentado, olhar atento e calmo, boca fechada com pequena curva sutil
2. **Atento/Curioso** (momento de execução do programa) — orelhas levantadas, leve inclinação de cabeça, olhar focado
3. **Feliz/Celebrando** (acerto de nível) — sorrindo, pode ter pequena animação no corpo (não gerar movimento — gerar pose alegre que será animada no app)
4. **Pensativo/Reflexivo** (após erro da criança) — olhar levemente baixo, postura pacificadora, sem julgamento
5. **Dormindo** (estado de "sessão fechada" ou pausa longa) — olhos fechados, posição enroscada confortável

**Cada estado deve ser gerado em arquivo separado, em pose isolada (fundo transparente).**

### 4.3. Especificações por mascote

#### Cachorro

- **Raça inspiração:** mistura de Golden Retriever filhote + Welsh Corgi (proporções compactas, cara amigável). NÃO realista — versão estilizada.
- **Pelagem:** cor dourada-mel (#D4A744 esmaecido para #C49B5C). Ventre branco-creme (#FAF6EE).
- **Orelhas:** caídas, mas levantam quando atento (estado 2).
- **Cauda:** média, em curva suave.
- **Características marcantes:** olhar gentil, focinho curto e arredondado.

#### Gato

- **Raça inspiração:** mistura de Ragdoll + American Shorthair filhote (cara redonda, olhos grandes). NÃO realista.
- **Pelagem:** cinza-suave (#A8A099) com peito branco-creme (#FAF6EE). Variação aceitável: bege-mel (#C9B584) com peito branco.
- **Orelhas:** triangulares, sempre levantadas (gato natural).
- **Cauda:** longa, em curva graciosa.
- **Características marcantes:** olhos grandes esmeralda (#7FB069 esmaecido), expressão contemplativa natural.

#### Coelho

- **Raça inspiração:** mistura de Holland Lop + Lionhead filhote (orelhas caídas, cabeça redonda). NÃO realista.
- **Pelagem:** branco-quente (#FAF6EE) com pontas das orelhas e patas em marrom-areia (#D9C29A). Variação aceitável: cinza-bege uniforme.
- **Orelhas:** caídas (estado padrão), levantam quando atento (estado 2).
- **Cauda:** pequeno tufo branco redondo.
- **Características marcantes:** focinho rosado claro (#E8B8A8), olhos grandes negros suaves.

---

## 5. Avatar da Criança

### 5.1. Princípios

- **Estilo:** humano estilizado, proporções de personagem infantil (cabeça relativamente grande em relação ao corpo, ~1:4 ratio).
- **Sem rosto detalhado.** Olhos pequenos pontuais, sorriso sutil ou expressão neutra. Sem nariz definido. Estilo "minimalista expressivo" tipo Toca Boca.
- **Postura padrão:** de pé, levemente angulado (3/4), braços relaxados ao lado do corpo. Pode ter leve sorriso.
- **Sem acessórios além dos especificados** (cabelo + roupa).

### 5.2. Variáveis de customização

**4 tons de pele naturais** (do mais claro ao mais escuro):
```
Pele 1 (clara):       #F5DCC4
Pele 2 (média-clara): #E0B894
Pele 3 (média-escura): #B5825E
Pele 4 (escura):      #6B4423
```

**4 estilos de cabelo (neutros de gênero):**
1. **Curto liso** — corte tigela curto, cobre orelhas pela metade
2. **Médio liso** — bate na altura do queixo
3. **Longo liso** — bate na altura dos ombros
4. **Cacheado volumoso** — formato arredondado natural, médio-curto

Cores de cabelo (gerar cada estilo nas 4 cores):
```
Castanho-escuro:  #3D2817
Castanho-médio:   #6B4423
Castanho-claro:   #A87C50
Loiro-mel:        #C9A876
```

**3 opções de roupa (neutras de gênero):**
1. **Camiseta verde** (#1F5F3F) com calça/short bege (#D9C29A)
2. **Camiseta azul** (#5B8AA6) com calça/short bege (#D9C29A)
3. **Camiseta amarela** (#D4A744) com calça/short marrom-terra (#6B4423)

### 5.3. Total de combinações no MVP

4 (pele) × 4 (cabelo) × 4 (cor cabelo) × 3 (roupa) = **192 combinações teóricas**.

**Não gerar todas.** Gerar **componentes separados em layers** (corpo+pele, cabelo, roupa) e compor em runtime no app. Manus deve consultar o briefing técnico para implementação de avatar layered.

### 5.4. Estados expressivos (avatar)

Pro MVP, gerar avatar em **3 estados**:

1. **Padrão** (de pé, 3/4, expressão neutra suave)
2. **Acerto** (postura levemente erguida, pequeno sorriso)
3. **Pensativo** (postura levemente curvada, mão no queixo opcional)

Mesmos estados em todas as combinações de pele/cabelo/roupa.

---

## 6. Cenários

### 6.1. Mundo da Fase 1 (Origem) — Jardim Original

**Mood:** vida que nasce, ordem que se forma, presença sentida mas não vista.

**Composição:**
- Solo de terra fértil marrom-terra (#6B4423) com texturas suaves
- Céu azul-calmo (#7FA8C9) com pequenas nuvens brancas em formas arredondadas
- Sol dourado (#D4A744) presente mas não dominante
- Espaço amplo, perspectiva tipo "isometria suave" (não isometria pura, levemente angulada)
- Elementos opcionais de cenário fixo: uma pedra grande arredondada, um tronco caído musgoso, distantes (não no centro)
- **Sem horizonte cidade visível** na Fase 1

**Iluminação:** luz dourada de "manhã" ou "fim de tarde". Suave, quente, sem sombras duras.

### 6.2. Mundo da Fase 2 (Quebra/Reconstrução) — Terreno Árido

**Mood:** dificuldade, mas com beleza própria. Terra cansada que ainda assim acolhe.

**Composição:**
- Solo de terra árida marrom-claro (#B89674) com pequenas rachaduras texturizadas
- Céu azul-pálido (#A8C2D4) menos saturado que Fase 1, com poeira leve no horizonte
- Sol dourado mais alto, sensação de calor
- Algumas pedras grandes espalhadas
- Vegetação resistente em pontos: arbustos pequenos verde-resistente (#6B7E58)
- **Vestígio do "primeiro jardim" visível ao fundo** (silhueta sutil, fechado/inacessível) — essa é uma decisão narrativa importante; deve estar presente mas distante.

**Iluminação:** luz dourada-quente, mais alta no céu, sombras um pouco mais definidas que na Fase 1.

### 6.3. Elementos plantáveis/construíveis

Assets individuais que aparecem conforme criança avança:

**Vegetação (gerar em estágios de crescimento):**
- Sementinha (estágio 1): pequeno ponto marrom no chão
- Broto verde (estágio 2): 2-3 folhas pequenas saindo da terra
- Plantinha (estágio 3): caule visível, 4-6 folhas
- Arbusto pequeno (estágio 4): forma arredondada, ~30cm visual
- Árvore jovem (estágio 5): tronco fino, copa redonda

**Estruturas (Fase 2/Reconstrução):**
- Cerca de madeira (segmento) — madeira clara, formato simples
- Caminho de pedras — pedras arredondadas em sequência
- Canteiro delimitado — moldura de madeira ou pedra

**Elementos decorativos:**
- Borboleta pequena (cor pastel)
- Pássaro pequeno em pose estática
- Flor isolada (variantes: amarela, branca, roxo-claro)
- Fruta pequena (variantes em cesto: maçã estilizada, pera)

---

## 7. Blocos de Programação

### 7.1. Princípios

- **Forma:** retângulos arredondados (raio de canto 8-12px relativo).
- **Encaixe visual:** pequenos "chanfros" laterais ou superiores que sugerem encaixe (estilo Scratch), mas mais sutis.
- **Cor por categoria** (mantém consistência com Scratch para criança que migrar):
  - Movimento (Andar, Virar): azul-rio (#5B8AA6)
  - Ação (Plantar, Regar): verde-broto (#7FB069)
  - Repetição (Repetir): laranja-suave (#D4A744 com toque vermelho)
  - Condicional (Se): amarelo-mostarda (#C9A050)
  - Variável (contadores): roxo-suave (#9B7BA8)
  - Função (Definir/Fazer): rosa-suave (#C49B9B)

### 7.2. Estrutura visual de um bloco

Cada bloco tem:
- **Ícone à esquerda** (40% do bloco): pictograma simples representando a ação (pé andando, regador, semente, flecha curva pra repetição, ponto de interrogação pra condicional)
- **Texto à direita** (60% do bloco): em Nunito SemiBold, cor branca ou bege-claro
- **Borda inferior mais escura** (mesma matiz, valor 20% mais escuro): cria leve profundidade

### 7.3. Estados visuais

- **Repouso** (na paleta): cor sólida com leve sombra
- **Sendo arrastado**: aumenta levemente (1.05x), sombra mais pronunciada
- **Encaixado**: alinha perfeitamente com bloco anterior
- **Inválido** (não pode encaixar ali): leve filtro vermelho-suave

### 7.4. Ícones dos blocos (lista para geração)

Gerar cada ícone como peça isolada (PNG transparente, 64x64 mínimo):

- **Andar para frente:** pé caminhando estilizado
- **Virar à direita:** seta curva pra direita
- **Virar à esquerda:** seta curva pra esquerda
- **Plantar:** mão segurando semente sobre terra
- **Regar:** regador inclinado com gotinhas
- **Pegar fruta:** mão segurando fruta
- **Repetir:** seta circular
- **Se (condicional):** losango com ponto de interrogação
- **Variável (contador):** caixinha com número estilizado
- **Função (Definir):** caixa rotulada
- **Função (Fazer):** seta apontando pra caixa

---

## 8. Capítulos Narrativos

### 8.1. Princípios

Cada capítulo tem 5-6 telas. Cada tela = ilustração de tela cheia + texto sobreposto.

- **Composição centralizada.** Personagem ou cena no centro. Texto abaixo ou acima, com bom espaço respiratório.
- **Paleta restrita por capítulo.** Cada capítulo tem sub-paleta dominante (ex: Capítulo da Origem é mais dourado/verde-broto; Capítulo da Quebra é mais marrom-árido/cinza).
- **Sem texto na imagem gerada.** Texto será sobreposto pelo app em tipografia controlada.
- **Sensação contemplativa.** Como ilustração de livro infantil de qualidade (ex: Sally Lloyd-Jones / Jago, Maurice Sendak modernizado).

### 8.2. Capítulo 1 (Origem) — Especificações por tela

**Tela 1 — Terra vazia:** plano amplo, terra árida sem vegetação, céu suave amanhecendo, sensação de espera. Sem personagens.

**Tela 2 — A presença:** mesma terra, mas agora com leve sugestão de "alguém olhando" — pode ser um ponto de luz dourada vinda de cima, ou uma silhueta fora de quadro projetando sombra suave. Mistério benevolente.

**Tela 3 — Primeira vida:** terra com primeiro broto verde nascendo. Close médio. Foco no broto.

**Tela 4 — Crescimento:** plano que mostra vários brotos, alguns já em plantas pequenas. Sensação de progresso.

**Tela 5 — Jardim formado:** plano amplo do jardim cheio, com flores, pequenos animais, riacho sutil. Beleza completa.

**Tela 6 — Convite:** mesmo jardim, mas agora aparece o avatar da criança no canto, pequeno, recém-chegado. Mascote ao lado.

### 8.3. Capítulo 2 (Quebra) — Especificações por tela

**Tela 1 — Sombra:** jardim ainda bonito, mas começa a aparecer uma sombra alongada vindo do canto. Algo se aproxima.

**Tela 2 — A serpente:** silhueta de uma serpente estilizada (NÃO realista, NÃO assustadora — formas arredondadas, talvez verde-escuro com padrões sutis). Presença, não ameaça gritante.

**Tela 3 — Algo mudou:** jardim com cores ligeiramente mais frias, algumas flores caídas, sensação de tristeza suave.

**Tela 4 — A travessia:** avatar da criança em silhueta, caminhando para fora do jardim, com mascote ao lado. Olhando para frente, postura digna.

**Tela 5 — Novo lugar:** terreno árido (ver 6.2), avatar e mascote chegando. Sol mais alto. Início de novo capítulo.

---

## 9. Uso do Gemini (Imagen) — Prompts Modelo

### 9.1. Estrutura recomendada de prompt

```
[ESTILO] + [SUJEITO] + [POSE/ESTADO] + [PALETA/COR] + [COMPOSIÇÃO] + [QUALIDADE TÉCNICA] + [ANTI-PADRÕES]
```

### 9.2. Prompts modelo prontos

**Mascote — Cachorro estado padrão:**
```
Flat-design illustration of a small golden-yellow puppy with white belly,
sitting calmly, attentive but serene expression, ears slightly drooping,
big gentle dark eyes, simple closed mouth with subtle smile,
rounded shapes, no realistic fur details, no harsh shadows,
soft warm color palette (golden #D4A744, cream #FAF6EE),
isolated on transparent background, contemplative children's app aesthetic,
inspired by Toca Boca and Sago Mini illustrations,
NOT 3D, NOT realistic, NOT Disney style, NOT saturated colors,
high quality vector-style illustration, centered composition.
```

**Mascote — Gato estado celebrando:**
```
Flat-design illustration of a small gray cat with cream chest,
standing with raised front paw in joyful pose, slight bounce,
big emerald-green eyes (desaturated #7FB069), gentle open smile,
ears upright, tail curved upward expressively,
rounded shapes, no realistic fur, no harsh shadows,
soft palette (gray #A8A099, cream #FAF6EE),
isolated on transparent background, children's app aesthetic,
inspired by Toca Boca and Sago Mini,
NOT 3D, NOT realistic, NOT cartoon-frantic, NOT saturated,
high quality vector-style, centered composition.
```

**Cenário — Jardim Fase 1:**
```
Flat-design illustration of a peaceful garden landscape, fertile brown earth,
soft blue calm sky with rounded white clouds, gentle warm golden sunlight,
isometric-soft perspective slightly angled,
small rounded boulder and mossy fallen log in distance,
no city visible, generous negative space,
contemplative atmosphere, morning light,
color palette: warm browns (#6B4423), soft greens (#7FB069),
cream sky, gentle gold (#D4A744),
inspired by Alto's Odyssey and Toca Boca World,
NOT 3D, NOT photorealistic, NOT saturated primary colors, NOT busy composition,
high quality children's app illustration, wide format.
```

**Cenário — Terreno Árido Fase 2:**
```
Flat-design illustration of an arid landscape, dry cracked brown earth (#B89674),
pale dusty blue sky (#A8C2D4), high warm sun,
sparse resistant green bushes (#6B7E58),
scattered round boulders, sense of difficulty but with own beauty,
distant silhouette of the lost first garden barely visible at horizon (unreachable),
contemplative atmosphere, defined but soft shadows,
color palette: warm arid browns, dusty greens, gold,
inspired by Alto's Odyssey desert scenes,
NOT 3D, NOT photorealistic, NOT depressing, NOT post-apocalyptic,
high quality children's app illustration, wide format.
```

**Bloco de programação — exemplo:**
```
Flat icon for "plant a seed" action in children's coding app,
hand holding a small seed above brown earth, simple symbolic shapes,
rounded design, soft green palette (#7FB069),
isolated on transparent background, 64x64 pixel design,
inspired by Scratch Jr block icons but more refined and warm,
NOT realistic, NOT 3D, NOT cluttered,
clean vector-style icon, centered.
```

**Capítulo narrativo — exemplo Tela 3 do Capítulo 1:**
```
Flat-design children's book illustration, close-medium view of a single small
green sprout growing from rich brown earth, soft morning light, gentle warm
golden glow surrounding the sprout, sense of new life and miracle,
rounded organic shapes, no text in image, generous negative space at top,
inspired by Sarah Anderson and Sally Lloyd-Jones illustrations,
soft palette (browns #6B4423, greens #7FB069, cream #FAF6EE, gold #D4A744),
NOT 3D, NOT photorealistic, NOT busy, NOT dark,
high quality contemplative children's book illustration.
```

### 9.3. Variáveis a ajustar entre gerações

Quando gerar variações ou novos assets, manter constantes:
- Estilo (flat-design, paleta, anti-padrões)
- Referências (Toca Boca, Sago Mini, Alto's Odyssey)
- Atmosfera (contemplativa, suave, calma)

E variar conforme necessidade:
- Sujeito (que personagem/elemento)
- Pose/estado
- Composição (close, médio, amplo)

---

## 10. Anti-padrões (NUNCA gerar assim)

Lista explícita do que rejeitar em qualquer asset gerado. Se o output do Gemini cair em qualquer item abaixo, **regenerar**.

1. **Cores saturadas berrantes** (vermelho puro, amarelo puro, magenta, ciano)
2. **Estilo 3D realista** (Pixar, Dreamworks, fotorrealismo)
3. **Estética Disney clássica** (princesas, brilhos, gradientes saturados)
4. **Cartoons agitados** (Cartoon Network, traços frenéticos, expressões exageradas)
5. **Anime/mangá** (olhos enormes brilhantes, cabelos espigados)
6. **Texturas pesadas** (oil painting, watercolor heavy, ilustrações editoriais complexas)
7. **Sombras duras** com gradientes ou tons fortes
8. **Composições caóticas** (muitos elementos, sem espaço respiratório)
9. **Personagens com expressões frenéticas** (boca muito aberta, olhos muito arregalados)
10. **Pixel art** ou estética retro 8-bit
11. **Símbolos religiosos explícitos** (cruzes, terços, bíblias visíveis em qualquer cenário)
12. **Versões "fofas demais"** que infantilizam excessivamente (mascotes com bochechas rosadas exageradas, etc.)
13. **Diversidade que parece "cota cumprida"** (avatares forçados em poses de "diversidade") — apenas pessoas reais com tons reais
14. **Texto dentro da imagem** (gerado pela IA) — texto sempre sobreposto pelo app

---

## 11. Workflow de Geração e Validação

O fluxo dos assets visuais no Norte Code tem dois papéis claros:

- **Gui:** gera os assets no Gemini, filtra qualidade, aprova, organiza arquivos.
- **Manus:** recebe os arquivos prontos do Gui e integra no código do app.

Manus **não gera assets** — só integra. Gui **não escreve código** — só entrega arquivos.

### 11.1. Para o Gui — gerando os assets

Quando precisar gerar um asset novo:

1. **Identificar a categoria** — é mascote? cenário? bloco? capítulo? Localizar a seção específica deste Style Guide (Seções 4, 5, 6, 7 ou 8).
2. **Pegar o prompt modelo da Seção 9.2** correspondente. Se não existir prompt pronto pra esse asset específico, adaptar um existente da mesma categoria.
3. **Abrir o Gemini** (https://gemini.google.com).
4. **Colar o prompt** e gerar. Pedir múltiplas variações se a primeira não convencer.
5. **Filtrar contra anti-padrões da Seção 10.** Descartar qualquer geração que viole princípios estéticos invioláveis.
6. **Comparar com assets já aprovados** da mesma categoria. A nova geração dialoga visualmente com o que já existe? Paleta, estilo, atmosfera batem?
7. **Selecionar a melhor versão.** Salvar no computador com nome claro (ex: `cachorro_padrao.png`, `jardim_fase1_background.png`).
8. **Documentar o prompt usado** em arquivo próprio (sugestão: criar uma planilha simples ou doc anotando "asset → prompt usado → data"). Ajuda quando precisar gerar variação ou regenerar depois com mesma direção.

**Dica de iteração no Gemini:** se o resultado quase acertou mas falhou em algum detalhe (ex: "ficou bom mas a cor está saturada demais"), em vez de mandar um prompt novo, peça ajuste em linguagem natural no chat: *"Mesma imagem mas com paleta menos saturada, mais terrosa"*. O Gemini mantém contexto da conversa e refina.

**Dica de consistência:** quando gerar todos os estados de um mesmo personagem (ex: 5 estados do cachorro), faça **na mesma sessão de chat com o Gemini**, em sequência. Isso ajuda o modelo a manter o personagem visualmente consistente entre estados.

### 11.2. Para o Gui — entregando os assets pro Manus

Quando tiver um lote de assets aprovados, organize numa pasta clara e envie pro Manus em mensagem direta. Estrutura sugerida de mensagem:

```
Manus, segue lote novo de assets aprovados pra integrar no app.

Conteúdo:
- 5 estados do mascote cachorro (padrao, atento, feliz, pensativo, dormindo)
- Estado padrão do avatar (4 tons de pele × 4 cabelos × 3 roupas)

Anexos: [arquivos]

Instruções:
- Estrutura de pastas conforme Seção 12 do Style Guide.
- Substituir os emojis placeholder atuais pelos assets reais.
- Sistema de avatar deve compor em layers (corpo + cabelo + roupa) em runtime, não usar imagens combinadas.
- Documentar a integração em ARCHITECTURE.md.

Quando terminar, gera novo build .apk pra eu testar.
```

### 11.3. Para o Manus — integrando os assets

Quando receber assets do Gui:

1. **Não modificar arquivos.** Use exatamente como entregues. Se precisar redimensionar ou recortar, alinhar antes com o Gui.
2. **Organizar conforme Seção 12** deste Style Guide (estrutura de pastas).
3. **Substituir placeholders** (emojis, ícones genéricos) pelos assets reais nas telas correspondentes.
4. **Implementar sistema de composição** quando aplicável (avatar layered, mascote com swap de estado).
5. **Documentar em ARCHITECTURE.md** como assets estão organizados, como são carregados, como são compostos em runtime.
6. **Gerar build .apk** após integração e enviar link pro Gui validar visualmente.

Se um asset entregue causar problema técnico (formato errado, resolução baixa demais, transparência mal exportada), comunicar ao Gui pra ele regenerar — não tentar "consertar" o asset sozinho.

### 11.4. Validação visual final

Quando Manus entregar build com assets integrados, Gui valida no celular:

- Sensação contemplativa está presente?
- Paleta entre assets parece coerente?
- Mascote mantém personalidade entre estados?
- Avatar componentizado renderiza limpo (sem "costuras" visíveis)?
- Cenários funcionam visualmente em diferentes tamanhos de tela?

Se algum asset não funcionar bem no contexto do app (ex: ficou pequeno demais, contraste ruim com o fundo), Gui ajusta o asset (regenera ou edita) antes de pedir nova integração.

### 11.5. Iteração — quando algo não está bom

Se um asset gerado não está bom mas tem potencial, ajustar o prompt em pequenas variações antes de descartar. Mudanças típicas que ajudam:

- Adicionar/remover referência específica (*"inspired by Toca Boca"* → *"inspired by Sago Mini"*)
- Reforçar anti-padrão problemático (*"less saturated"*, *"softer expression"*, *"more space around character"*)
- Especificar enquadramento (*"centered"*, *"wide composition"*, *"close-up"*)
- Pedir variação direta no chat do Gemini (*"mesma ilustração mas com paleta mais quente"*)

Se mesmo após várias tentativas o Gemini não entregar resultado consistente com o Style Guide, considerar mudar de ferramenta pra esse asset específico (alternativas: ChatGPT/DALL-E, Recraft, Imagen via API). Documentar a decisão pra próximas iterações.

---

## 12. Estrutura de Arquivos Sugerida

Organização de assets gerados no repositório:

```
assets/
├── characters/
│   ├── pets/
│   │   ├── dog/
│   │   │   ├── dog_idle.png
│   │   │   ├── dog_attentive.png
│   │   │   ├── dog_happy.png
│   │   │   ├── dog_thoughtful.png
│   │   │   └── dog_sleeping.png
│   │   ├── cat/
│   │   └── rabbit/
│   └── avatar/
│       ├── body/         (4 tons de pele)
│       ├── hair/         (4 estilos × 4 cores)
│       └── outfits/      (3 opções)
├── world/
│   ├── phase1_garden/
│   │   ├── background.png
│   │   ├── soil.png
│   │   └── elements/    (rocks, log, etc.)
│   ├── phase2_arid/
│   └── plantables/      (sprout, plant, tree, etc.)
├── blocks/
│   └── icons/           (walk, plant, water, repeat, etc.)
└── chapters/
    ├── chapter_01_origin/
    │   ├── tela_01.png
    │   ├── tela_02.png
    │   └── ...
    └── chapter_02_breaking/
```

---

## 13. Como Este Documento Evolui

Documento vivo. Ajustes esperados:

- **Novos estados expressivos** podem ser adicionados aos mascotes conforme necessidade de gameplay
- **Novos elementos de cenário** quando missões especiais entrarem em desenvolvimento
- **Refinamento de paleta** se Gemini mostrar limitação consistente em alguma cor
- **Prompts modelo adicionais** conforme padrões de geração se consolidarem

Mas os **princípios estéticos invioláveis (Seção 1.2)**, a **paleta primária (Seção 2.1)** e os **anti-padrões (Seção 10)** são estruturais. Mudanças neles requerem decisão explícita do Gui registrada em DECISIONS.md.

---

*Documento criado por Claude em colaboração com Gui. Abril/2026.*
*Versão 1.1 — Style Guide Visual completo do Norte Code para geração via Gemini/Imagen. Workflow corrigido: Gui gera os assets, Manus integra no app.*
