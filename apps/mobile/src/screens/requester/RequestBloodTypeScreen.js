import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppHeader, InfoBanner, PrimaryButton, Screen } from '../../components';
import { BloodTypeSelector } from '../../components/requester';
import { ROUTES } from '../../constants';
import { colors, spacing, typography } from '../../theme';

export default function RequestBloodTypeScreen({ navigation }) {
  const [bloodType, setBloodType] = useState('');
  return (
    <Screen padded={false}>
      <AppHeader title="Emergency request" subtitle="Step 1 of 2" onBack={navigation.goBack} />
      <View style={styles.outer}>
        <View style={styles.content}>
          <Text style={styles.title}>Which blood type is needed?</Text>
          <Text style={styles.subtitle}>Choose the patient’s required blood type. This determines which donors can be matched.</Text>
          <BloodTypeSelector value={bloodType} onChange={setBloodType} />
          <InfoBanner title="Check the patient record" message="Select the prescribed blood type. Do not use the requester’s own blood type." />
          <PrimaryButton title="Continue" icon="arrow-right" iconPosition="right" disabled={!bloodType} onPress={() => navigation.navigate(ROUTES.REQUEST_DETAILS, { bloodType })} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl },
  content: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', gap: spacing.xxl },
  title: { color: colors.textPrimary, fontSize: typography.sizes.title, lineHeight: typography.lineHeights.title, fontWeight: typography.weights.extrabold },
  subtitle: { marginTop: -spacing.xl, color: colors.textSecondary, fontSize: typography.sizes.body, lineHeight: typography.lineHeights.body },
});
