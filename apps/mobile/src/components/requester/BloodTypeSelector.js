import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import BloodTypeBadge from '../BloodTypeBadge';
import { spacing } from '../../theme';

export const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function BloodTypeSelector({ value, onChange, disabled = false }) {
  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {BLOOD_TYPES.map((type) => (
        <Pressable
          key={type}
          accessibilityRole="radio"
          accessibilityLabel={`Blood type ${type}`}
          accessibilityState={{ checked: value === type, disabled }}
          disabled={disabled}
          onPress={() => onChange?.(type)}
          style={({ pressed }) => [styles.option, pressed && styles.pressed]}
        >
          <BloodTypeBadge type={type} selected={value === type} style={styles.badge} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  option: { width: '47%', flexGrow: 1 },
  badge: { width: '100%', minHeight: 68 },
  pressed: { opacity: 0.78 },
});
