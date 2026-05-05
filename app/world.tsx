import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { getPlayer, type PlayerData } from "../lib/player";
import { getCurrentUserId } from "../lib/auth";
import { Avatar } from "../components/Avatar";
import { Mascote } from "../components/Mascote";

/**
 * World screen — placeholder for Seção 1 delivery.
 * Shows the player's avatar + mascot to confirm onboarding completed successfully.
 * Full world implementation comes in Seção 2+.
 */
export default function WorldScreen() {
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const opacity = useSharedValue(0);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    loadPlayer();
  }, []);

  const loadPlayer = async () => {
    const userId = await getCurrentUserId();
    if (userId) {
      const data = await getPlayer(userId);
      setPlayer(data);
    }
    opacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  };

  return (
    <View className="flex-1 bg-warm-white items-center justify-center px-8">
      <Animated.View style={fadeStyle} className="items-center">
        {player ? (
          <>
            <Text
              className="text-garden-green text-center mb-6"
              style={{ fontFamily: "Fraunces-Bold", fontSize: 24 }}
            >
              Seu mundo
            </Text>

            {/* Pre-rendered Avatar */}
            <Avatar
              skinTone={player.avatar_skin}
              hairStyle={player.avatar_hair_style}
              hairColor={player.avatar_hair_color}
              outfit={player.avatar_outfit}
              size={150}
            />

            {/* Mascot */}
            <View className="mt-4 items-center">
              <Mascote
                type={player.pet_type}
                state="padrao"
                size={120}
              />
              <Text
                className="text-garden-green-600 text-center mt-2"
                style={{ fontFamily: "Nunito-SemiBold", fontSize: 18 }}
              >
                {player.pet_name}
              </Text>
            </View>

            <Text
              className="text-garden-green-400 text-center mt-6"
              style={{ fontFamily: "Nunito-Regular", fontSize: 14, lineHeight: 22 }}
            >
              O mundo ainda está vazio...{"\n"}mas em breve vai crescer.
            </Text>

            <View className="mt-6 rounded-2xl bg-garden-green-50 px-6 py-4">
              <Text
                className="text-garden-green-700 text-center"
                style={{ fontFamily: "Nunito-Regular", fontSize: 12, lineHeight: 18 }}
              >
                Tela Mundo — implementação completa{"\n"}virá na próxima seção.
              </Text>
            </View>
          </>
        ) : (
          <Text
            className="text-garden-green-400"
            style={{ fontFamily: "Nunito-Regular", fontSize: 16 }}
          >
            Carregando...
          </Text>
        )}
      </Animated.View>
    </View>
  );
}
