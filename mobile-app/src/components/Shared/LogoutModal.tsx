import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { useAppTheme } from "@/context/ThemeContext";
import { LogOut } from "lucide-react-native";
import { appShadow } from "@/lib/utils";

interface LogoutModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ visible, onCancel, onConfirm }: LogoutModalProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.dismissArea} onPress={onCancel} />

        <View
          style={[
            styles.dialog,
            {
              backgroundColor: colors.surface,
              borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : colors.border,
            },
          ]}
          className={appShadow}
        >
          {/* Red Alert Icon */}
          <View
            style={{
              backgroundColor: isDark ? "rgba(239, 68, 68, 0.14)" : "rgba(239, 68, 68, 0.1)",
              borderColor: isDark ? "rgba(239, 68, 68, 0.25)" : "rgba(239, 68, 68, 0.18)",
            }}
            className="w-14 h-14 rounded-2xl border items-center justify-center mb-4"
          >
            <LogOut size={26} color="#EF4444" />
          </View>

          {/* Title & Description */}
          <Text
            style={{ color: colors.text }}
            className="text-lg font-black text-center mb-1.5"
          >
            Sign Out of MiniSocial?
          </Text>
          <Text
            style={{ color: colors.text2 }}
            className="text-xs text-center leading-5 mb-6 px-2"
          >
            Are you sure you want to sign out? You will need to log back in to post and interact.
          </Text>

          {/* Action Buttons Row */}
          <View className="flex-row items-center gap-3 w-full">
            {/* Cancel Button */}
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.7}
              style={{
                backgroundColor: colors.surface2,
                borderColor: colors.border,
              }}
              className="flex-1 py-3 rounded-xl border items-center justify-center"
            >
              <Text style={{ color: colors.text }} className="text-xs font-bold">
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Sign Out Button */}
            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.85}
              style={{
                backgroundColor: "#EF4444",
              }}
              className={`flex-1 py-3 rounded-xl items-center justify-center ${appShadow}`}
            >
              <Text className="text-xs font-bold text-white">
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  dialog: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    alignItems: "center",
  },
});

export default LogoutModal;
