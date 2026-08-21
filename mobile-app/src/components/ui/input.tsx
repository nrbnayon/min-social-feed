import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  type TextInputProps,
} from "react-native";
import { useAppTheme } from "@/context/ThemeContext";
import { Eye, EyeOff } from "lucide-react-native";

interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  isPassword?: boolean;
}

export function Input({
  label,
  hint,
  error,
  isPassword,
  style,
  ...props
}: InputProps) {
  const { colors, isDark } = useAppTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text2 }]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.surface2,
            borderColor: error
              ? colors.pink
              : isFocused
              ? colors.brand
              : colors.borderStrong,
          },
        ]}
      >
        <TextInput
          placeholderTextColor={colors.text3}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            { color: colors.text },
            style,
          ]}
          {...props}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword((s) => !s)}
            style={styles.eyeBtn}
            hitSlop={10}
          >
            {showPassword ? (
              <EyeOff size={18} color={colors.text3} />
            ) : (
              <Eye size={18} color={colors.text3} />
            )}
          </Pressable>
        )}
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: colors.pink }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hintText, { color: colors.text3 }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    height: "100%",
  },
  eyeBtn: {
    padding: 6,
  },
  errorText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
  hintText: {
    fontSize: 11,
    marginTop: 4,
  },
});

export default Input;