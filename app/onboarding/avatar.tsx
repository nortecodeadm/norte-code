import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useOnboardingState } from "../../lib/onboarding-state";
import { ensureAnonymousSession } from "../../lib/auth";
import { createPlayer } from "../../lib/player";
import type { SkinOption, HairOption, OutfitOption } from "../../lib/player";

// ─── Avatar Options ───────────────────────────────────────────────────────────

const SKIN_OPTIONS: { id: SkinOption; color: string; label: string }[] = [
  { id: "skin_1", color: "#FDDCB5", label: "Clara" },
  { id: "skin_2", color: "#E8B88A", label: "Média clara" },
  { id: "skin_3", color: "#C68B59", label: "Média escura" },
  { id: "skin_4", color: "#8B5E3C", label: "Escura" },
];

const HAIR_OPTIONS: { id: HairOption; emoji: string; label: string }[] = [
  { id: "hair_1", emoji: "💇", label: "Curto" },
  { id: "hair_2", emoji: "💇‍♀️", label: "Médio" },
  { id: "hair_3", emoji: "👱", label: "Longo" },
  { id: "hair_4", emoji: "🧑‍🦱", label: "Cacheado" },
];

const OUTFIT_OPTIONS: { id: OutfitOption; color: string; label: string }[] = [
  { id: "outfit_1", color: "#2E8F5A", label: "Verde" },
  { id: "outfit_2", color: "#4A90D9", label: "Azul" },
  { id: "outfit_3", color: "#D4A744", label: "Amarela" },
];

// ─── Selection Row Component ──────────────────────────────────────────────────

function SelectionRow<T extends string>({
  title,
  options,
  selected,
  onSelect,
  renderOption,
}: {
  title: string;
  options: { id: T }[];
  selected: T;
  onSelect: (id: T) => void;
  renderOption: (option: { id: T }, isSelected: boolean) => React.ReactNode;
}) {
  return (
    <View className="mb-6 w-full">
      <Text
        className="text-garden-green-600 mb-3"
        style={{ fontFamily: "Nunito-SemiBold", fontSize: 14 }}
      >
        {title}
      </Text>
      <View className="flex-row" style={{ gap: 12 }}>
        {options.map((option) => (
          <Pressable key={option.id} onPress={() => onSelect(option.id)}>
            {renderOption(option, selected === option.id)}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AvatarScreen() {
  const router = useRouter();
  const {
    petType,
    petName,
    avatarSkin,
    avatarHair,
    avatarOutfit,
    setAvatarSkin,
    setAvatarHair,
    setAvatarOutfit,
    reset,
  } = useOnboardingState();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animations
  const contentOpacity = useSharedValue(0);
  const previewScale = useSharedValue(0.9);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const previewStyle = useAnimatedStyle(() => ({
    transform: [{ scale: previewScale.value }],
  }));

  useEffect(() => {
    contentOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
    previewScale.value = withSpring(1, { damping: 12 });
  }, []);

  // Bounce preview when selection changes
  useEffect(() => {
    previewScale.value = withSpring(1.03, { damping: 8 });
    const timer = setTimeout(() => {
      previewScale.value = withSpring(1, { damping: 10 });
    }, 150);
    return () => clearTimeout(timer);
  }, [avatarSkin, avatarHair, avatarOutfit]);

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Ensure we have a session
      const userId = await ensureAnonymousSession();
      if (!userId) {
        console.error("[Avatar] Failed to get user session");
        setIsSubmitting(false);
        return;
      }

      // Create player in Supabase + local storage
      await createPlayer(userId, {
        avatar_skin: avatarSkin,
        avatar_hair: avatarHair,
        avatar_outfit: avatarOutfit,
        pet_type: petType ?? "dog",
        pet_name: petName.trim(),
      });

      // Reset onboarding state (no longer needed in memory)
      reset();

      // Navigate to the world
      router.replace("/world");
    } catch (error) {
      console.error("[Avatar] Error completing onboarding:", error);
      setIsSubmitting(false);
    }
  };

  // Get the current visual values for the preview
  const currentSkinColor =
    SKIN_OPTIONS.find((s) => s.id === avatarSkin)?.color ?? SKIN_OPTIONS[0].color;
  const currentOutfitColor =
    OUTFIT_OPTIONS.find((o) => o.id === avatarOutfit)?.color ??
    OUTFIT_OPTIONS[0].color;
  const currentHairEmoji =
    HAIR_OPTIONS.find((h) => h.id === avatarHair)?.emoji ?? "💇";

  return (
    <View className="flex-1 bg-warm-white">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
          paddingVertical: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={contentStyle} className="w-full items-center">
          {/* Header */}
          <Text
            className="text-garden-green text-center mb-6"
            style={{
              fontFamily: "Nunito-SemiBold",
              fontSize: 20,
              lineHeight: 28,
            }}
          >
            Como você quer ser?
          </Text>

          {/* Avatar Preview */}
          <Animated.View
            style={previewStyle}
            className="items-center justify-center mb-8"
          >
            <View
              className="items-center justify-center rounded-full"
              style={{
                width: 120,
                height: 120,
                backgroundColor: currentSkinColor,
                borderWidth: 3,
                borderColor: "rgba(31, 95, 63, 0.15)",
              }}
            >
              {/* Hair indicator */}
              <Text style={{ fontSize: 28, marginBottom: -4 }}>
                {currentHairEmoji}
              </Text>
              {/* Face */}
              <Text style={{ fontSize: 14 }}>😊</Text>
              {/* Outfit indicator */}
              <View
                className="rounded-lg mt-1"
                style={{
                  width: 50,
                  height: 24,
                  backgroundColor: currentOutfitColor,
                  borderRadius: 6,
                }}
              />
            </View>
          </Animated.View>

          {/* Skin selection */}
          <SelectionRow
            title="Cor de pele"
            options={SKIN_OPTIONS}
            selected={avatarSkin}
            onSelect={setAvatarSkin}
            renderOption={(option, isSelected) => {
              const opt = SKIN_OPTIONS.find((s) => s.id === option.id)!;
              return (
                <View
                  className="items-center justify-center rounded-full"
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: opt.color,
                    borderWidth: 3,
                    borderColor: isSelected ? "#1F5F3F" : "transparent",
                  }}
                >
                  {isSelected && (
                    <Text className="text-white text-xs font-bold">✓</Text>
                  )}
                </View>
              );
            }}
          />

          {/* Hair selection */}
          <SelectionRow
            title="Cabelo"
            options={HAIR_OPTIONS}
            selected={avatarHair}
            onSelect={setAvatarHair}
            renderOption={(option, isSelected) => {
              const opt = HAIR_OPTIONS.find((h) => h.id === option.id)!;
              return (
                <View
                  className="items-center justify-center rounded-2xl bg-white"
                  style={{
                    width: 56,
                    height: 56,
                    borderWidth: 2,
                    borderColor: isSelected
                      ? "#1F5F3F"
                      : "rgba(31, 95, 63, 0.08)",
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{opt.emoji}</Text>
                </View>
              );
            }}
          />

          {/* Outfit selection */}
          <SelectionRow
            title="Camiseta"
            options={OUTFIT_OPTIONS}
            selected={avatarOutfit}
            onSelect={setAvatarOutfit}
            renderOption={(option, isSelected) => {
              const opt = OUTFIT_OPTIONS.find((o) => o.id === option.id)!;
              return (
                <View
                  className="items-center justify-center rounded-2xl"
                  style={{
                    width: 56,
                    height: 56,
                    backgroundColor: opt.color,
                    borderWidth: 3,
                    borderColor: isSelected ? "#1F5F3F" : "transparent",
                    opacity: isSelected ? 1 : 0.7,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>👕</Text>
                  {isSelected && (
                    <View className="absolute -top-1 -right-1 h-5 w-5 items-center justify-center rounded-full bg-garden-green">
                      <Text className="text-white" style={{ fontSize: 10 }}>
                        ✓
                      </Text>
                    </View>
                  )}
                </View>
              );
            }}
          />

          {/* Confirm button */}
          <Pressable
            onPress={handleConfirm}
            disabled={isSubmitting}
            className="mt-8 bg-garden-green rounded-2xl px-10 py-4 active:opacity-80"
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.96 : 1 }],
              opacity: isSubmitting ? 0.6 : 1,
            })}
          >
            <Text
              className="text-warm-white text-center"
              style={{ fontFamily: "Nunito-Bold", fontSize: 17 }}
            >
              {isSubmitting ? "Preparando..." : "É esse!"}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
