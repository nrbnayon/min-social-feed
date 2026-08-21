import React from "react";
import { Platform, Text } from "react-native";
import { useToastStore } from "@/store/useToastStore";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { BookmarkCheck, X, Info } from "lucide-react-native";

export const Toast = () => {
  const { visible, message, type } = useToastStore();

  if (!visible) return null;

  const bgColors = {
    success: "bg-primary",
    error: "bg-red-500",
    info: "bg-blue-600",
  };

  const Icon = () => {
    switch (type) {
      case "success":
        return <BookmarkCheck color="white" size={20} />;
      case "error":
        return <X color="white" size={20} />;
      default:
        return <Info color="white" size={20} />;
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.springify()}
      exiting={FadeOutUp}
      className={`absolute top-14 left-5 right-5 z-[9999] p-4 rounded-2xl flex-row items-center shadow-lg ${bgColors[type]}`}
      style={{
        marginTop: Platform.OS === "android" ? 20 : 0,
      }}
    >
      <Icon />
      <Text className="text-white ml-2.5 font-bold flex-1 text-sm">
        {message}
      </Text>
    </Animated.View>
  );
};
