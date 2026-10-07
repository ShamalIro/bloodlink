import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BrandMark, Screen } from '../../components';
import { ROLES, ROUTES } from '../../constants';
import { colors, iconSizes, radius, spacing, typography } from '../../theme';

const choices = [
  { role: ROLES.DONOR, title: 'I can donate', description: 'Get alerts when someone nearby needs your blood type.', icon: 'water-outline' },
  { role: ROLES.REQUESTER, title: 'I need blood', description: 'Raise an emergency request for a patient in minutes.', icon: 'hospital-box-outline' },
  { role: ROLES.COORDINATOR, title: 'Hospital coordinator', description: 'Verify requests, coordinate donors and manage blood stock.', icon: 'hospital-building' },
  { role: ROLES.NGO, title: 'NGO staff', description: 'Organize donation camps and coordinate volunteers.', icon: 'account-group-outline' },
];

export default function RoleSelectionScreen({ navigation }) {
  const selectRole = (role) => {
    if (role === ROLES.DONOR) navigation.navigate(ROUTES.DONOR_PHONE_LOGIN, { role });
    else navigation.navigate(ROUTES.LOGIN, { role });
  };

  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <View style={styles.content}>
        <BrandMark compact showTagline={false} />
        <Text style={styles.title}>Who are you joining as?</Text>
        <Text style={styles.subtitle}>Choose the role that best describes how you will use BloodLink.</Text>
        <View style={styles.choices}>
          {choices.map((choice) => (
            <Pressable
              key={choice.role}
              accessibilityRole="button"
              onPress={() => selectRole(choice.role)}
              style={({ pressed }) => [styles.choice, pressed && styles.choicePressed]}
            >
              <View style={styles.iconWrap}>
                <MaterialCommunityIcons name={choice.icon} size={iconSizes.navigation} color={colors.primary} />
              </View>
              <View style={styles.choiceCopy}>
                <Text style={styles.choiceTitle}>{choice.title}</Text>
                <Text style={styles.choiceDescription}>{choice.description}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => navigation.navigate(ROUTES.LOGIN)} style={styles.signIn} hitSlop={8}>
          <Text style={styles.signInText}>Already registered? <Text style={styles.signInStrong}>Sign in</Text></Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center', paddingVertical: spacing.xxxl },
  content: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  title: { marginTop: spacing.xxxl, color: colors.textPrimary, fontSize: typography.sizes.display, lineHeight: typography.lineHeights.display, fontWeight: typography.weights.extrabold },
  subtitle: { marginTop: spacing.sm, color: colors.textSecondary, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body },
  choices: { gap: spacing.md, marginTop: spacing.xxl },
  choice: { minHeight: 92, flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface },
  choicePressed: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  iconWrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.primaryTint },
  choiceCopy: { flex: 1, paddingHorizontal: spacing.md },
  choiceTitle: { color: colors.textPrimary, fontSize: typography.sizes.body, fontWeight: typography.weights.bold },
  choiceDescription: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.sizes.supporting, lineHeight: typography.lineHeights.supporting },
  signIn: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl },
  signInText: { color: colors.textSecondary, fontSize: typography.sizes.supporting },
  signInStrong: { color: colors.primary, fontWeight: typography.weights.bold },
});
