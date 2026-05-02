import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useOnboardingState } from "../../lib/onboarding-state";
import type { PetType } from "../../lib/player";

interface PetOption {
  type: PetType;
  emoji: string; // Placeholder until real illustrations
  label: string;
}

const PET_OPTIONS: PetOption[] = [
  { type: "dog", emoji: "🐕", label: "Cachorro" },
  { type: "cat", emoji: "🐈", label: "Gato" },
  { type: "rabbit", emoji: "🐇", label: "Coelho" },
];

function PetCard({
  pet,
  isSelected,
  onSelect,
  index,
}: {
  pet: PetOption;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    // Staggered entrance animation
    opacity.value = withDelay(
      200 + index * 150,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    scale.value = withDelay(200 + index * 150, withSpring(1, { damping: 12 }));
  }, []);

  // Selection animation
  const selectionScale = useSharedValue(1);

  useEffect(() => {
    selectionScale.value = withSpring(isSelected ? 1.05 : 1, { damping: 10 });
  }, [isSelected]);

  const selectionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: selectionScale.value }],
  }));

  return (
    <Animated.View style={cardStyle}>
      <Pressable onPress={onSelect}>
        <Animated.View
          style={[
            selectionStyle,
            {
              borderWidth: 3,
              borderColor: isSelected
                ? "rgba(31, 95, 63, 1)"
                : "rgba(31, 95, 63, 0.08)",
            },
          ]}
          className="items-center justify-center rounded-3xl bg-white px-5 py-7 shadow-sm"
        >
          {/* Placeholder emoji — will be replaced with illustrations */}
          <Text style={{ fontSize: 48 }}>{pet.emoji}</Text>
          <Text
            className="mt-3 text-garden-green-700"
            style={{ fontFamily: "Nunito-SemiBold", fontSize: 14 }}
          >
            {pet.label}
          </Text>

          {/* Selection indicator */}
          {isSelected && (
            <View className="absolute -top-1 -right-1 h-6 w-6 items-center justify-center rounded-full bg-garden-green">
              <Text className="text-white text-xs">✓</Text>
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function PetChoiceScreen() {
  const router = useRouter();
  const { petType, setPetType } = useOnboardingState();

  // Header animation
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(15);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  // Button animation
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(10);

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  useEffect(() => {
    headerOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
    headerTranslateY.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  // Show button when a pet is selected
  useEffect(() => {
    if (petType) {
      buttonOpacity.value = withTiming(1, { duration: 300 });
      buttonTranslateY.value = withSpring(0, { damping: 12 });
    }
  }, [petType]);

  return (
    <View className="flex-1 bg-warm-white">
      <View className="flex-1 items-center justify-center px-6">
        {/* Header text */}
        <Animated.View style={headerStyle} className="mb-10">
          <Text
            className="text-garden-green text-center"
            style={{
              fontFamily: "Nunito-SemiBold",
              fontSize: 22,
              lineHeight: 32,
            }}
          >
            Quem você quer levar{"\n"}com você?
          </Text>
        </Animated.View>

        {/* Pet options */}
        <View className="flex-row" style={{ gap: 16 }}>
          {PET_OPTIONS.map((pet, index) => (
            <PetCard
              key={pet.type}
              pet={pet}
              isSelected={petType === pet.type}
              onSelect={() => setPetType(pet.type)}
              index={index}
            />
          ))}
        </View>

        {/* Confirm button — only visible after selection */}
        <Animated.View style={buttonStyle} className="mt-12">
          <Pressable
            onPress={() => {
              if (petType) {
                router.push("/onboarding/pet-name");
              }
            }}
            disabled={!petType}
            className="bg-garden-green rounded-2xl px-10 py-4 active:opacity-80"
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.96 : 1 }],
              opacity: petType ? 1 : 0.5,
            })}
          >
            <Text
              className="text-warm-white text-center"
              style={{ fontFamily: "Nunito-Bold", fontSize: 17 }}
            >
              Esse aí!
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
