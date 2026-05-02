import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
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

const MAX_NAME_LENGTH = 12;

export default function PetNameScreen() {
  const router = useRouter();
  const { petType, petName, setPetName } = useOnboardingState();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Animations
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(15);
  const inputOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(10);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const inputStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  useEffect(() => {
    // Header entrance
    headerOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
    headerTranslateY.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    // Input entrance (delayed)
    inputOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );

    // Auto-focus the input after animation
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // Show button when name has content
  useEffect(() => {
    const hasName = petName.trim().length > 0;
    buttonOpacity.value = withTiming(hasName ? 1 : 0, { duration: 250 });
    buttonTranslateY.value = hasName
      ? withSpring(0, { damping: 12 })
      : withTiming(10, { duration: 200 });
  }, [petName]);

  const handleConfirm = () => {
    if (petName.trim().length > 0) {
      Keyboard.dismiss();
      router.push("/onboarding/avatar");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-warm-white"
    >
      <View className="flex-1 items-center justify-center px-8">
        {/* Header */}
        <Animated.View style={headerStyle} className="mb-8">
          <Text
            className="text-garden-green text-center"
            style={{
              fontFamily: "Nunito-SemiBold",
              fontSize: 22,
              lineHeight: 32,
            }}
          >
            Qual vai ser o nome{"\n"}dele(a)?
          </Text>
        </Animated.View>

        {/* Pet emoji reminder */}
        <Animated.View style={inputStyle} className="mb-6">
          <Text style={{ fontSize: 48 }}>
            {petType === "dog" ? "🐕" : petType === "cat" ? "🐈" : "🐇"}
          </Text>
        </Animated.View>

        {/* Name input */}
        <Animated.View style={inputStyle} className="w-full max-w-xs">
          <TextInput
            ref={inputRef}
            value={petName}
            onChangeText={(text) => {
              if (text.length <= MAX_NAME_LENGTH) {
                setPetName(text);
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={handleConfirm}
            returnKeyType="done"
            placeholder="Digite o nome..."
            placeholderTextColor="#8FD1AB"
            maxLength={MAX_NAME_LENGTH}
            autoCapitalize="words"
            autoCorrect={false}
            className="rounded-2xl bg-white px-6 py-4 text-center text-garden-green shadow-sm"
            style={{
              fontFamily: "Nunito-SemiBold",
              fontSize: 20,
              borderWidth: 2,
              borderColor: isFocused ? "#1F5F3F" : "rgba(31, 95, 63, 0.15)",
            }}
          />

          {/* Character counter */}
          <Text
            className="mt-2 text-center"
            style={{
              fontFamily: "Nunito",
              fontSize: 12,
              color:
                petName.length >= MAX_NAME_LENGTH
                  ? "#B8892E"
                  : "rgba(31, 95, 63, 0.4)",
            }}
          >
            {petName.length}/{MAX_NAME_LENGTH}
          </Text>
        </Animated.View>

        {/* Confirm button */}
        <Animated.View style={buttonStyle} className="mt-10">
          <Pressable
            onPress={handleConfirm}
            disabled={petName.trim().length === 0}
            className="bg-garden-green rounded-2xl px-10 py-4 active:opacity-80"
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <Text
              className="text-warm-white text-center"
              style={{ fontFamily: "Nunito-Bold", fontSize: 17 }}
            >
              Pronto!
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}
