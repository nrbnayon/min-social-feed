import React from "react";
import { View, Image, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Gradients } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";

interface AvatarProps {
  src?: string;
  size?: number;
  ring?: boolean;
  seen?: boolean;
  verified?: boolean;
  name?: string;
  onPress?: () => void;
  className?: string;
}

export function Avatar({
  src,
  size = 40,
  ring = false,
  seen = false,
  verified = false,
  name,
  onPress,
}: AvatarProps) {
  const { isDark, colors } = useAppTheme();

  const getInitials = (n?: string) => {
    if (!n) return "U";
    const parts = n.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  const imageSize = ring ? size - 6 : size;

  const content = (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {ring ? (
        <LinearGradient
          colors={seen ? Gradients.storySeen : Gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              padding: 2.5,
            },
          ]}
        >
          <View
            style={[
              styles.innerContainer,
              {
                borderRadius: imageSize / 2,
                backgroundColor: colors.background,
              },
            ]}
          >
            {src ? (
              <Image
                source={{ uri: src }}
                style={{
                  width: imageSize,
                  height: imageSize,
                  borderRadius: imageSize / 2,
                }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.fallback,
                  {
                    width: imageSize,
                    height: imageSize,
                    borderRadius: imageSize / 2,
                    backgroundColor: colors.surface2,
                  },
                ]}
              >
                <Text style={[styles.initials, { fontSize: imageSize * 0.4, color: colors.text }]}>
                  {getInitials(name)}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.imageContainer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.surface2,
            },
          ]}
        >
          {src ? (
            <Image
              source={{ uri: src }}
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.fallback,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: colors.surface2,
                },
              ]}
            >
              <Text style={[styles.initials, { fontSize: size * 0.4, color: colors.text }]}>
                {getInitials(name)}
              </Text>
            </View>
          )}
        </View>
      )}

      {verified && (
        <View
          style={[
            styles.verifiedBadge,
            {
              width: Math.max(14, size * 0.32),
              height: Math.max(14, size * 0.32),
              borderRadius: Math.max(7, size * 0.16),
              borderColor: colors.background,
            },
          ]}
        >
          <Text style={{ color: "#FFF", fontSize: Math.max(9, size * 0.2), fontWeight: "900" }}>
            ✓
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    alignItems: "center",
    justifyContent: "center",
  },
  innerContainer: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imageContainer: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontWeight: "700",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
});

export default Avatar;
