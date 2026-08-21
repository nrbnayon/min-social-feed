import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { useAppTheme } from "@/context/ThemeContext";
import { Eye, EyeOff, X } from "lucide-react-native";

export interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  containerClassName?: string;
  wrapperClassName?: string;
  wrapperStyle?: ViewStyle;
  inputHeight?: number;
}

export function Input({
  label,
  hint,
  error,
  isPassword,
  leftIcon,
  rightIcon,
  clearable,
  onClear,
  containerClassName = "mb-4",
  wrapperClassName = "",
  wrapperStyle,
  inputHeight = 50,
  style,
  value,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const { colors } = useAppTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return colors.pink;
    if (isFocused) return colors.brand;
    return colors.border;
  };

  return (
    <View className={`w-full ${containerClassName}`}>
      {label ? (
        <Text className="text-sm font-semibold text-textSecondary mb-2 ml-1">
          {label}
        </Text>
      ) : null}

      <View
        style={[
          {
            height: inputHeight,
            borderColor: getBorderColor(),
            borderWidth: isFocused ? 1.5 : 1,
          },
          wrapperStyle,
        ]}
        className={`flex-row items-center px-3.5 bg-surface rounded-lg ${wrapperClassName}`}
      >
        {leftIcon ? (
          <View className="mr-2.5 items-center justify-center pointer-events-none">
            {leftIcon}
          </View>
        ) : null}

        <TextInput
          value={value}
          placeholderTextColor={colors.text3}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={[
            {
              flex: 1,
              fontSize: 15,
              color: colors.text,
              paddingTop: 0,
              paddingBottom: 0,
              paddingVertical: 0,
              margin: 0,
              height: Platform.OS === "ios" ? inputHeight - 8 : "100%",
              textAlignVertical: "center",
            },
            style,
          ]}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword((s) => !s)}
            activeOpacity={0.7}
            className="p-1 -mr-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPassword ? (
              <EyeOff size={19} color={colors.text3} />
            ) : (
              <Eye size={19} color={colors.text3} />
            )}
          </TouchableOpacity>
        ) : clearable && value && value.length > 0 ? (
          <TouchableOpacity
            onPress={onClear}
            activeOpacity={0.7}
            className="p-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={16} color={colors.text3} />
          </TouchableOpacity>
        ) : rightIcon ? (
          <View className="ml-2 items-center justify-center">
            {rightIcon}
          </View>
        ) : null}
      </View>

      {error ? (
        <Text className="text-xs font-semibold text-pink mt-1.5 ml-1">
          {error}
        </Text>
      ) : hint ? (
        <Text className="text-xs text-textSecondary mt-1.5 ml-1">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export default Input;