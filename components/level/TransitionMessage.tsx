/**
 * TransitionMessage — Mensagem entre a execução da criança e a do mascote.
 *
 * Feature "Mascote como Gabarito Visual" (a partir do Nível 7). Aparece
 * sobre o mapa depois que a criança vence, anunciando que o mascote vai
 * refazer a tarefa aplicando a solução ótima.
 *
 * Visual: cartão branco-cream com borda verde-folha, texto em Fraunces,
 * centralizado. Fade-in 200ms / fade-out 300ms controlados pela prop
 * `visible` — o componente fica montado o tempo todo (opacity 0 quando
 * invisível) pra a animação de saída poder rodar.
 *
 * Posicionado no TERÇO SUPERIOR da área do mapa pra não cobrir a célula
 * inicial do avatar/mascote (que fica à esquerda, na base do grid).
 */

import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface TransitionMessageProps {
  /** Controla fade-in (true) / fade-out (false). */
  visible: boolean;
  /** Nome do mascote dado pela criança no onboarding. */
  petName: string;
}

export function TransitionMessage({ visible, petName }: TransitionMessageProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: visible ? 200 : 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        animStyle,
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          alignItems: "center",
          paddingTop: 24,
        },
      ]}
    >
      <View
        style={{
          backgroundColor: "rgba(253, 251, 247, 0.94)",
          borderWidth: 1.5,
          borderColor: "#7FB069",
          borderRadius: 16,
          paddingHorizontal: 20,
          paddingVertical: 14,
          marginHorizontal: 32,
          shadowColor: "#1F5F3F",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <Text
          style={{
            fontFamily: "Fraunces-Bold",
            fontSize: 16,
            color: "#1F5F3F",
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          O {petName} aprendeu com você. Olha o jeito dele!
        </Text>
      </View>
    </Animated.View>
  );
}
