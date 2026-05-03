# Briefing de Geração de Assets Visuais — Norte Code

Este documento contém as instruções exatas para a geração de assets visuais do aplicativo Norte Code (focado em crianças de 7 a 10 anos) por uma IA geradora de imagens (como Gemini Pro, Midjourney ou DALL-E).

## 1. O Problema Atual (Por que estamos re-gerando)

Na primeira iteração, cometemos dois erros críticos que inviabilizaram o uso direto dos assets:

1. **Falta de Transparência Real:** Os arquivos PNG vieram com o fundo "xadrez" (checkerboard) incorporado nos dados RGB da imagem, em vez de usar o canal alpha (transparência real).
2. **Assets não composíveis:** O sistema de avatar requer a sobreposição de imagens (layers). Os assets gerados inicialmente tinham escalas e posições diferentes (ex: o cabelo era uma imagem enorme que cobria o rosto inteiro quando sobreposta ao corpo).

## 2. A Solução Arquitetural (Sistema de 2 Layers)

Para resolver o problema de composição, a arquitetura do aplicativo foi alterada para um **sistema de 2 layers pré-alinhadas**.

O avatar é renderizado empilhando duas imagens `<Image />` do React Native, ambas com `resizeMode="contain"`. Para que isso funcione, **todas as imagens devem ter exatamente a mesma dimensão (512x512) e o mesmo alinhamento de câmera**.

*   **Layer 1 (Base): Corpo Vestido.** O personagem inteiro, da cabeça aos pés, já vestindo a roupa.
*   **Layer 2 (Topo): Cabelo.** Apenas o cabelo, flutuando na parte superior do canvas 512x512, exatamente na posição onde a cabeça do Layer 1 estará.

## 3. Direcionamento Artístico

*   **Público-alvo:** Crianças de 7 a 10 anos.
*   **Estilo Visual:** Flat-design contemporâneo, estilo "chibi" ou "cartoon" amigável. Traços limpos, cores sólidas, sem excesso de sombreamento complexo.
*   **Tom:** Amigável, educativo, orgânico.
*   **Paleta Base:**
    *   Verde-jardim (`#1F5F3F`)
    *   Dourado (`#D4A744`)
    *   Branco quente (`#FDFBF7`)
    *   Azul (`#4A90D9`)

## 4. Especificações Técnicas de Entrega

**MUITO IMPORTANTE:**
*   **Formato:** PNG com canal alpha (transparência REAL). O fundo não pode ser branco, nem preto, nem xadrez.
*   **Resolução:** Exatamente 512x512 pixels.
*   **Alinhamento:** Rigorosamente o mesmo em todas as imagens. A base do personagem deve estar sempre na mesma coordenada Y inferior, e o centro do rosto na mesma coordenada X e Y.

## 5. Lista de Entregáveis

### 5.1. Avatar: Corpos Vestidos (Layer 1)
O personagem em pé, de frente, com expressão neutra/feliz.
São 12 imagens no total (4 tons de pele × 3 cores de camiseta).

**Tons de pele (Skins):**
1.  `clara` (ex: `#FDDCBD`)
2.  `media-clara` (ex: `#E8B88A`)
3.  `media-escura` (ex: `#C68642`)
4.  `escura` (ex: `#8D5524`)

**Cores da camiseta (Outfits):**
1.  `verde` (`#2E7D4F`)
2.  `azul` (`#4A90D9`)
3.  `amarela` (`#F5C542`)

*Nomenclatura exigida:* `corpo_[skin]_[outfit].png` (ex: `corpo_clara_verde.png`, `corpo_escura_azul.png`).

### 5.2. Avatar: Cabelos (Layer 2)
Apenas o cabelo. A área do rosto e do corpo deve ser 100% transparente. O cabelo deve estar posicionado na parte superior do canvas 512x512, de forma que "encaixe" perfeitamente na cabeça do Layer 1 quando sobreposto.
São 16 imagens no total (4 estilos × 4 cores).

**Estilos de Cabelo (Styles):**
1.  `curtoliso`
2.  `curtobaguncado`
3.  `longoliso`
4.  `cacheado`

**Cores de Cabelo (Colors):**
1.  `castanho-escuro` (`#3B2314`)
2.  `castanho-medio` (`#6B3A2A`)
3.  `castanho-claro` (`#A0522D`)
4.  `loiro-mel` (`#DAA520`)

*Nomenclatura exigida:* `cabelo_[style]_[color].png` (ex: `cabelo_curtoliso_castanho-escuro.png`).

### 5.3. Mascotes
Os bichinhos companheiros. Cada um deve ter 5 estados emocionais. O estilo deve combinar com o do avatar.
São 15 imagens no total (3 mascotes × 5 estados).

**Mascotes (Types):**
1.  `cachorro`
2.  `gato`
3.  `coelho`

**Estados Emocionais (States):**
1.  `padrao` (Neutro/Feliz)
2.  `atento` (Orelhas em pé, olhos arregalados)
3.  `feliz` (Sorrindo muito, comemorando)
4.  `pensativo` (Olhando para cima, mãozinha no queixo)
5.  `dormindo` (Olhos fechados, deitado)

*Nomenclatura exigida:* `[type]_[state].png` (ex: `cachorro_feliz.png`, `gato_dormindo.png`).

## 6. Como testar a composição (Para o desenvolvedor/IA)

Para garantir que o trabalho foi bem feito, você pode usar um script Python simples com a biblioteca Pillow (`PIL`) para sobrepor as imagens e verificar se o cabelo encaixa no rosto sem cobrir os olhos.

```python
from PIL import Image

# Carrega as layers
body = Image.open("corpo_clara_verde.png").convert("RGBA")
hair = Image.open("cabelo_curtobaguncado_castanho-escuro.png").convert("RGBA")

# Cria um canvas vazio
composite = Image.new("RGBA", (512, 512), (0, 0, 0, 0))

# Cola o corpo e depois o cabelo por cima
composite.paste(body, (0, 0), body)
composite.paste(hair, (0, 0), hair)

# Salva para verificação visual
composite.save("teste_composicao.png")
```
