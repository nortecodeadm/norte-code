/**
 * ActivityBasket — Cesta visual do mapa de atividade do Nível 8.
 *
 * Diferente da CESTA DA RECOMPENSA do Mundo Permanente (esta aparece
 * apenas no mapa de atividade enquanto a criança joga). Vai trocando
 * de asset conforme `fruitCount` muda:
 *   0 → cesta_vazia, 1 → cesta_1, 2 → cesta_2, 3 → cesta_3
 *
 * É a representação CONCRETA da variável (par com o contador HUD que é
 * a representação ABSTRATA). A criança vê a cesta encher e o número
 * subir simultaneamente — variável fica dupla-mente visível.
 *
 * Posição é calibrável via prop `style` (Gui ajusta na fase de polish).
 * No briefing, a animação "fruta voando da árvore pra cesta" foi
 * adiada — a cesta troca instantaneamente quando pick_fruit executa.
 */

import React from "react";
import { Image, View, type StyleProp, type ViewStyle } from "react-native";

const CESTA_VAZIA = require("../../assets/mundo/atividade_cesta_vazia.png");
const CESTA_1 = require("../../assets/mundo/atividade_cesta_1.png");
const CESTA_2 = require("../../assets/mundo/atividade_cesta_2.png");
const CESTA_3 = require("../../assets/mundo/atividade_cesta_3.png");

interface ActivityBasketProps {
  fruitCount: number;
  /** Posição/tamanho controlados pelo container. */
  style?: StyleProp<ViewStyle>;
  /** Largura do asset em pixels (default 80). */
  size?: number;
}

function basketAsset(count: number) {
  // Idempotente quando count > 3 — segura visual coerente caso o
  // interpretador deixasse passar (atualmente capa em 3, mas mantém
  // robusto). Negativo cai no vazio por defeito.
  if (count <= 0) return CESTA_VAZIA;
  if (count === 1) return CESTA_1;
  if (count === 2) return CESTA_2;
  return CESTA_3;
}

export function ActivityBasket({
  fruitCount,
  style,
  size = 80,
}: ActivityBasketProps) {
  return (
    <View style={[{ width: size }, style]}>
      <Image
        source={basketAsset(fruitCount)}
        resizeMode="contain"
        style={{ width: size, height: size }}
      />
    </View>
  );
}
