import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BrandMark, PrimaryButton, Screen } from '../../components';
import { ROUTES } from '../../constants';
import { colors, radius, spacing, typography } from '../../theme';

const languages = [
  { code: 'si', name: 'සිංහල', description: 'Sinhala' },
  { code: 'ta', name: 'தமிழ்', description: 'Tamil' },
  { code: 'en', name: 'English', description: 'English' },
];

export default function LanguageSelectionScreen({ navigation }) {
  const [selected, setSelected] = useState('en');
  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <View style={styles.content}>
        <BrandMark compact showTagline={false} />
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>WELCOME TO BLOODLINK</Text>
          <Text style={styles.title}>Choose your language</Text>
          <Text style={styles.subtitle}>Select the language you are most comfortable using.</Text>
        </View>
        <View style={styles.options}>
          {languages.map((language) => {
            const active = selected === language.code;
            return (
              <Pressable
                key={language.code}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                onPress={() => setSelected(language.code)}
                style={({ pressed }) => [styles.option, active && styles.optionActive, pressed && styles.optionPressed]}
              >
                <View style={styles.languageCopy}>
                  <Text style={styles.languageName}>{language.name}</Text>
                  <Text style={styles.languageDescription}>{language.description}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active ? <MaterialCommunityIcons name="check" size={16} color={colors.white} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.note}>You can change this later in Settings.</Text>
        <PrimaryButton title="Continue" icon="arrow-right" iconPosition="right" onPress={() => navigation.navigate(ROUTES.ROLE_SELECTION, { language: selected })} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center', paddingVertical: spacing.xxxl },
  content: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  heading: { marginTop: spacing.xxxl },
  eyebrow: { color: colors.primary, fontSize: typography.sizes.caption, fontWeight: typography.weights.bold, letterSpacing: 0.8 },
  title: { marginTop: spacing.sm, color: colors.textPrimary, fontSize: typography.sizes.display, lineHeight: typography.lineHeights.display, fontWeight: typography.weights.extrabold },
  subtitle: { marginTop: spacing.sm, color: colors.textSecondary, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body },
  options: { gap: spacing.md, marginTop: spacing.xxl, marginBottom: spacing.lg },
  option: { minHeight: 72, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  optionPressed: { opacity: 0.82 },
  languageCopy: { flex: 1 },
  languageName: { color: colors.textPrimary, fontSize: typography.sizes.body, fontWeight: typography.weights.bold },
  languageDescription: { marginTop: 2, color: colors.textSecondary, fontSize: typography.sizes.supporting },
  radio: { width: 24, height: 24, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface },
  radioActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  note: { marginBottom: spacing.xl, color: colors.textSecondary, fontSize: typography.sizes.caption, textAlign: 'center' },
});
