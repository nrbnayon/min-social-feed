import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import type { Story } from "@/types";
import { Avatar } from "@/components/Shared/Avatar";
import { X } from "lucide-react-native";

interface StoryViewerModalProps {
  story: Story | null;
  onClose: () => void;
}

const { width, height } = Dimensions.get("window");

export function StoryViewerModal({ story, onClose }: StoryViewerModalProps) {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  useEffect(() => {
    if (story) {
      progress.value = 0;
      progress.value = withTiming(
        1,
        { duration: 5000, easing: Easing.linear },
        (finished) => {
          if (finished) {
            runOnJS(onClose)();
          }
        }
      );
    }
  }, [story]);

  if (!story) return null;

  return (
    <Modal
      visible={Boolean(story)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Full Image */}
        <Image
          source={{ uri: story.image }}
          style={styles.storyImage}
          resizeMode="cover"
        />

        {/* Gradient dark overlays */}
        <View style={styles.topGradient} />
        <View style={styles.bottomGradient} />

        {/* Header with Progress & User */}
        <View style={[styles.header, { top: insets.top + 10 }]}>
          {/* Progress Bar */}
          <View style={styles.progressBarBackground}>
            <Animated.View style={[styles.progressBarFill, progressStyle]} />
          </View>

          {/* User info */}
          <View style={styles.userInfoRow}>
            <View style={styles.userMeta}>
              <Avatar src={story.avatar} size={36} />
              <View>
                <Text style={styles.username}>@{story.username}</Text>
                <Text style={styles.timeAgo}>2h ago</Text>
              </View>
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <X size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Tap areas */}
        <View style={styles.touchContainer}>
          <Pressable style={styles.touchHalf} onPress={onClose} />
          <Pressable style={styles.touchHalf} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
  },
  storyImage: {
    width,
    height,
    position: "absolute",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  header: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 10,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  username: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  timeAgo: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  touchContainer: {
    flex: 1,
    flexDirection: "row",
  },
  touchHalf: {
    flex: 1,
  },
});

export default StoryViewerModal;
