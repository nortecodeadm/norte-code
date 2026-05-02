import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-warm-white px-8">
      <Text className="font-nunito text-2xl text-garden-green text-center leading-relaxed">
        Oi! Vamos começar uma jornada juntos?{"\n\n"}Você vai cuidar de um lugar
        que ainda está vazio e fazê-lo crescer.
      </Text>

      <Pressable
        onPress={() => router.push("/onboarding/pet-choice")}
        className="mt-12 bg-garden-green rounded-2xl px-8 py-4 active:opacity-80"
      >
        <Text className="font-nunito text-lg text-warm-white font-semibold">
          Vamos começar
        </Text>
      </Pressable>
    </View>
  );
}
