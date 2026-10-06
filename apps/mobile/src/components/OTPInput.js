import React, { useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, controlHeights, radius, spacing, typography } from '../theme';

export default function OTPInput({ value = '', onChangeText, length = 6, error, autoFocus = false }) {
  const refs = useRef([]);
  const digits = value.replace(/\D/g, '').slice(0, length).split('');

  const updateDigit = (text, index) => {
    const entered = text.replace(/\D/g, '');
    const next = Array.from({ length }, (_, position) => digits[position] ?? '');
    if (entered.length > 1) {
      entered.slice(0, length - index).split('').forEach((digit, offset) => { next[index + offset] = digit; });
    } else {
      next[index] = entered;
    }
    const nextValue = next.join('').slice(0, length);
    onChangeText?.(nextValue);
    const nextIndex = Math.min(index + Math.max(entered.length, 1), length - 1);
    if (entered) refs.current[nextIndex]?.focus();
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View>
      <View style={styles.row} accessibilityLabel={`${length}-digit verification code`}>
        {Array.from({ length }, (_, index) => (
          <TextInput
            key={index}
            ref={(input) => { refs.current[index] = input; }}
            style={[styles.cell, digits[index] && styles.filled, error && styles.errored]}
            value={digits[index] ?? ''}
            onChangeText={(text) => updateDigit(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            keyboardType="number-pad"
            textContentType={index === 0 ? 'oneTimeCode' : 'none'}
            maxLength={index === 0 ? length : 1}
            selectTextOnFocus
            autoFocus={autoFocus && index === 0}
            accessibilityLabel={`Digit ${index + 1}`}
          />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  cell: { flex: 1, minWidth: 40, maxWidth: 56, height: controlHeights.otpCell, padding: 0, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, backgroundColor: colors.surface, color: colors.textPrimary, fontSize: 20, fontWeight: typography.weights.bold, textAlign: 'center' },
  filled: { borderColor: colors.primary },
  errored: { borderColor: colors.error },
  error: { marginTop: spacing.sm, color: colors.error, fontSize: typography.sizes.caption, textAlign: 'center' },
});
