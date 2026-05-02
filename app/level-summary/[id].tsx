import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function LevelSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-warm-white">
      <Text className="font-nunito text-xl text-garden-green">
        [Tela: Resumo do Nível {id} - Em desenvolvimento]
      </Text>
    </View>
  );
}
