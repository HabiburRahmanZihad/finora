import { forwardRef, useState } from "react";
import { Pressable, type TextInput, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/lib/theme";
import { TextField } from "./TextField";

interface PasswordFieldProps extends Omit<TextInputProps, "secureTextEntry"> {
  label: string;
  error?: string;
}

export const PasswordField = forwardRef<TextInput, PasswordFieldProps>(
  ({ label, error, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <TextField
        ref={ref}
        label={label}
        error={error}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        rightAccessory={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? "Hide password" : "Show password"}
            hitSlop={8}
            onPress={() => setVisible((v) => !v)}
          >
            <Ionicons
              name={visible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.mutedForeground}
            />
          </Pressable>
        }
        {...props}
      />
    );
  },
);
PasswordField.displayName = "PasswordField";
