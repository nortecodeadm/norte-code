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
import type { SkinTone, HairStyle, HairColor, Outfit } from "../../lib/player";
import { Avatar } from "../../components/Avatar";
import {
  SKIN_TONE_OPTIONS,
  HAIR_STYLE_OPTIONS,
  HAIR_COLOR_OPTIONS,
  OUTFIT_OPTIONS,
} from "../../lib/assets/avatar";

// ─── Swatch Component (color circles) ────────────────────────────────────────

function Swatch({
  hex,
  isSelected,
  onPress,
}: {
  hex: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={{ marginHorizontal: 6 }}>
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: hex,
          borderWidth: isSelected ? 3 : 1,
          borderColor: isSelected ? "#1F5F3F" : "rgba(0,0,0,0.1)",
        }}
      >
        {isSelected && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white font-bold" style={{ fontSize: 16 }}>
              ✓
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ─── Style Button (text pills) ───────────────────────────────────────────────

function StyleButton({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 16,
        backgroundColor: isSelected ? "#1F5F3F" : "rgba(31, 95, 63, 0.08)",
        marginHorizontal: 4,
        marginVertical: 3,
      }}
    >
      <Text
        style={{
          fontFamily: isSelected ? "Nunito-Bold" : "Nunito-Regular",
          fontSize: 13,
          color: isSelected ? "#FFFDF7" : "#1F5F3F",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function AvatarScreen() {
  const router = useRouter();
  const {
    petType,
    petName,
    avatarSkin,
    avatarHairStyle,
    avatarHairColor,
    avatarOutfit,
    setAvatarSkin,
    setAvatarHairStyle,
    setAvatarHairColor,
    setAvatarOutfit,
    reset,
  } = useOnboardingState();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animations
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  useEffect(() => {
    contentOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
    contentTranslateY.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  // Avatar preview bounce on change
  const avatarScale = useSharedValue(1);
  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  useEffect(() => {
    avatarScale.value = 0.95;
    avatarScale.value = withSpring(1, { damping: 8, stiffness: 200 });
  }, [avatarSkin, avatarHairStyle, avatarHairColor, avatarOutfit]);

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const userId = await ensureAnonymousSession();
      if (!userId) {
        console.error("[Avatar] Failed to get user session");
        setIsSubmitting(false);
        return;
      }

      await createPlayer(userId, {
        avatar_skin: avatarSkin,
        avatar_hair_style: avatarHairStyle,
        avatar_hair_color: avatarHairColor,
        avatar_outfit: avatarOutfit,
        pet_type: petType ?? "cachorro",
        pet_name: petName.trim(),
      });

      reset();
      router.replace("/onboarding/transition");
    } catch (error) {
      console.error("[Avatar] Error completing onboarding:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-warm-white">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={contentStyle} className="items-center pt-12 px-6">
          {/* Title */}
          <Text
            className="text-garden-green text-center mb-6"
            style={{
              fontFamily: "Nunito-SemiBold",
              fontSize: 22,
              lineHeight: 30,
            }}
          >
            Como você se parece?
          </Text>

          {/* Avatar Preview — Single pre-rendered image */}
          <Animated.View style={avatarStyle} className="mb-8">
            <Avatar
              skinTone={avatarSkin}
              hairStyle={avatarHairStyle}
              hairColor={avatarHairColor}
              outfit={avatarOutfit}
              size={160}
            />
          </Animated.View>

          {/* Skin Tone */}
          <View className="w-full mb-6">
            <Text
              className="text-garden-green-700 mb-3"
              style={{ fontFamily: "Nunito-SemiBold", fontSize: 14 }}
            >
              Cor de pele
            </Text>
            <View className="flex-row justify-center">
              {SKIN_TONE_OPTIONS.map((option) => (
                <Swatch
                  key={option.value}
                  hex={option.hex}
                  isSelected={avatarSkin === option.value}
                  onPress={() => setAvatarSkin(option.value)}
                />
              ))}
            </View>
          </View>

          {/* Hair Style */}
          <View className="w-full mb-6">
            <Text
              className="text-garden-green-700 mb-3"
              style={{ fontFamily: "Nunito-SemiBold", fontSize: 14 }}
            >
              Estilo do cabelo
            </Text>
            <View className="flex-row justify-center flex-wrap">
              {HAIR_STYLE_OPTIONS.map((option) => (
                <StyleButton
                  key={option.value}
                  label={option.label}
                  isSelected={avatarHairStyle === option.value}
                  onPress={() => setAvatarHairStyle(option.value)}
                />
              ))}
            </View>
          </View>

          {/* Hair Color */}
          <View className="w-full mb-6">
            <Text
              className="text-garden-green-700 mb-3"
              style={{ fontFamily: "Nunito-SemiBold", fontSize: 14 }}
            >
              Cor do cabelo
            </Text>
            <View className="flex-row justify-center">
              {HAIR_COLOR_OPTIONS.map((option) => (
                <Swatch
                  key={option.value}
                  hex={option.hex}
                  isSelected={avatarHairColor === option.value}
                  onPress={() => setAvatarHairColor(option.value)}
                />
              ))}
            </View>
          </View>

          {/* Outfit */}
          <View className="w-full mb-6">
            <Text
              className="text-garden-green-700 mb-3"
              style={{ fontFamily: "Nunito-SemiBold", fontSize: 14 }}
            >
              Camiseta
            </Text>
            <View className="flex-row justify-center">
              {OUTFIT_OPTIONS.map((option) => (
                <Swatch
                  key={option.value}
                  hex={option.hex}
                  isSelected={avatarOutfit === option.value}
                  onPress={() => setAvatarOutfit(option.value)}
                />
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Fixed bottom button */}
      <View className="absolute bottom-0 left-0 right-0 pb-10 pt-4 px-6 bg-warm-white">
        <Pressable
          onPress={handleConfirm}
          disabled={isSubmitting}
          className="bg-garden-green rounded-2xl py-4 active:opacity-80"
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
      </View>
    </View>
  );
}
