import React, { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, controlHeights, iconSizes, radius, spacing, typography } from '../theme';

const FormInput = forwardRef(function FormInput({
  label,
  helperText,
  error,
  leftIcon,
  rightElement,
  containerStyle,
  inputContainerStyle,
  style,
  editable = true,
  onFocus,
  onBlur,
  ...props
}, ref) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[
        styles.inputContainer,
        focused && styles.focused,
        error && styles.errored,
        !editable && styles.disabled,
        inputContainerStyle,
      ]}>
        {leftIcon ? <MaterialCommunityIcons name={leftIcon} size={iconSizes.medium} color={colors.textSecondary} /> : null}
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.primary}
          editable={editable}
          onFocus={(event) => { setFocused(true); onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); onBlur?.(event); }}
          {...props}
        />
        {rightElement}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
});

export default FormInput;

const styles = StyleSheet.create({
  label: { marginBottom: spacing.sm, color: colors.textPrimary, fontSize: typography.sizes.label, lineHeight: typography.lineHeights.label, fontWeight: typography.weights.semibold },
  inputContainer: { minHeight: controlHeights.input, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  focused: { borderColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.08, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, elevation: 0 },
  errored: { borderColor: colors.error },
  disabled: { backgroundColor: colors.surfaceMuted, opacity: 0.72 },
  input: { flex: 1, minWidth: 0, paddingVertical: 0, color: colors.textPrimary, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body },
  helper: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption },
  error: { marginTop: spacing.xs, color: colors.error, fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption },
});
