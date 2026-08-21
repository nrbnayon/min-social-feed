import React from "react";
import { Modal, View, Text, TouchableOpacity, Pressable } from "react-native";
import { LogOut, X } from "lucide-react-native";

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ visible, onClose, onConfirm }: LogoutModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        onPress={onClose}
        className="flex-1 bg-black/75 items-center justify-center p-5"
      >
        <Pressable 
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-background dark:bg-[#161616] rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-2xl items-center"
        >
          {/* Close Icon Top Right */}
          <TouchableOpacity 
            onPress={onClose}
            className="absolute right-4 top-4 p-2 rounded-full bg-gray-100 dark:bg-white/5"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={16} color="#A1A1AA" />
          </TouchableOpacity>

          {/* Warning / Logout Badge */}
          <View className="w-16 h-16 rounded-full bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 items-center justify-center mb-4 mt-2">
            <LogOut size={28} color="#EF4444" />
          </View>

          {/* Title */}
          <Text className="text-foreground text-xl font-bold font-plus text-center mb-2">
            Log Out
          </Text>

          {/* Subtitle */}
          <Text className="text-secondary text-sm text-center leading-relaxed mb-6 px-2">
            Are you sure you want to log out of your account? You will need to sign back in to access your bookings and profile.
          </Text>

          {/* Action Buttons */}
          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              className="flex-1 py-3.5 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 items-center justify-center"
            >
              <Text className="text-foreground font-bold text-sm tracking-wide">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.8}
              className="flex-1 py-3.5 rounded-2xl bg-red-600 items-center justify-center shadow-sm"
            >
              <Text className="text-white font-bold text-sm tracking-wide">
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default LogoutModal;
