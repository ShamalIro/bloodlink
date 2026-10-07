import React, { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, controlHeights, radius, spacing, typography } from '../theme';

const PhoneInput = forwardRef(function PhoneInput({
  label = 'Mobile number',
  countryCode = '+94',
  value,
  onChangeText,
  helperText,
  error,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}, ref) {
  const [focused, setFocused] = useState(false);
  const handleChange = (text) => onChangeText?.(text.replace(/[^0-9\s]/g, ''));

  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.row, focused && styles.focused, error && styles.errored]}>
        <View style={styles.prefix}>
          <Text style={styles.flag}>🇱🇰</Text>
          <Text style={styles.countryCode}>{countryCode}</Text>
        </View>
        <TextInput
          ref={ref}
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          placeholder="77 123 4567"
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.primary}
          onFocus={(event) => { setFocused(true); onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); onBlur?.(event); }}
          {...props}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
});

export default PhoneInput;

const styles = StyleSheet.create({
  label: { marginBottom: spacing.sm, color: colors.textPrimary, fontSize: typography.sizes.label, lineHeight: typography.lineHeights.label, fontWeight: typography.weights.semibold },
  row: { minHeight: controlHeights.input, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  focused: { borderColor: colors.primary },
  errored: { borderColor: colors.error },
  prefix: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, borderRightWidth: 1, borderRightColor: colors.border, backgroundColor: colors.surfaceMuted },
  flag: { fontSize: typography.sizes.body },
  countryCode: { color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold },
  input: { flex: 1, minWidth: 0, paddingHorizontal: spacing.lg, paddingVertical: 0, color: colors.textPrimary, fontSize: typography.sizes.body },
  helper: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption },
  error: { marginTop: spacing.xs, color: colors.error, fontSize: typography.sizes.caption, lineHeight: typography.lineHeights.caption },
});
