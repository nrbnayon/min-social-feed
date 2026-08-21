import React from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Gradients } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { BadgeCheck } from "lucide-react-native";

export interface AvatarProps {
  src?: string;
  size?: number;
  ring?: boolean;
  gradientBorder?: boolean;
  seen?: boolean;
  verified?: boolean;
  name?: string;
  onPress?: () => void;
}

export function Avatar({
  src,
  size = 42,
  ring = true,
  gradientBorder = true,
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

  const showRing = ring || gradientBorder;
  const borderWidth = 2;
  const gapWidth = 1.5;
  const innerSize = showRing ? size - (borderWidth + gapWidth) * 2 : size;

  const content = (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {showRing ? (
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
              padding: borderWidth,
            },
          ]}
        >
          <View
            style={[
              styles.innerContainer,
              {
                width: size - borderWidth * 2,
                height: size - borderWidth * 2,
                borderRadius: (size - borderWidth * 2) / 2,
                backgroundColor: colors.background,
                padding: gapWidth,
              },
            ]}
          >
            {src ? (
              <Image
                source={{ uri: src }}
                style={{
                  width: innerSize,
                  height: innerSize,
                  borderRadius: innerSize / 2,
                }}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={Gradients.avatarPlaceholder}
                style={{
                  width: innerSize,
                  height: innerSize,
                  borderRadius: innerSize / 2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: Math.max(10, innerSize * 0.38),
                    fontWeight: "800",
                  }}
                >
                  {getInitials(name)}
                </Text>
              </LinearGradient>
            )}
          </View>
        </LinearGradient>
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            overflow: "hidden",
            backgroundColor: colors.surface2,
          }}
        >
          {src ? (
            <Image
              source={{ uri: src }}
              style={{ width: size, height: size }}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={Gradients.avatarPlaceholder}
              style={{
                width: size,
                height: size,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: Math.max(10, size * 0.38),
                  fontWeight: "800",
                }}
              >
                {getInitials(name)}
              </Text>
            </LinearGradient>
          )}
        </View>
      )}

      {/* Verified Badge */}
      {verified && (
        <View style={styles.badgeWrapper}>
          <BadgeCheck size={14} color="#FFFFFF" fill="#3B82F6" strokeWidth={2.5} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
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
  badgeWrapper: {
    position: "absolute",
    bottom: -2,
    right: -2,
    borderRadius: 7,
  },
});

export default Avatar;
