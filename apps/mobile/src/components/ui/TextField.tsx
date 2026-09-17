import { forwardRef } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, radius } from "@/src/lib/theme";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  rightAccessory?: React.ReactNode;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, rightAccessory, style, ...props }, ref) => {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputRow, error && styles.inputRowError]}>
          <TextInput
            ref={ref}
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, style]}
            {...props}
          />
          {rightAccessory}
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  },
);
TextField.displayName = "TextField";

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.foreground,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
  },
  inputRowError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 15,
    color: colors.foreground,
  },
  error: {
    fontSize: 12,
    color: colors.danger,
  },
});
