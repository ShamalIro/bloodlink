import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { AppHeader, FormInput, PrimaryButton, Screen, SecondaryButton } from '../../components';
import { ROUTES } from '../../constants';
import { formatDate, formatTime } from '../../services/campApi';
import { colors, radius, spacing, typography } from '../../theme';

const TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const atHour = (h, dayOffset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, 0, 0, 0);
  return d;
};

// Combine the day from `day` with the hours/minutes from `time`.
const combine = (day, time) => {
  const d = new Date(day);
  d.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return d;
};

// A tappable row that opens a native date/time picker.
function PickerField({ label, value, mode, onChange, minimumDate }) {
  const [show, setShow] = useState(false);
  return (
    <View style={s.fieldGroup}>
      <Text style={s.label}>{label}</Text>
      <Pressable style={s.field} onPress={() => setShow((v) => !v)} accessibilityRole="button">
        <Text style={s.fieldText}>{mode === 'date' ? formatDate(value) : formatTime(value)}</Text>
      </Pressable>
      {show ? (
        <DateTimePicker
          value={value}
          mode={mode}
          minimumDate={minimumDate}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, picked) => {
            if (Platform.OS !== 'ios') setShow(false);
            if (picked) onChange(picked);
          }}
        />
      ) : null}
    </View>
  );
}

export default function CampFormScreen({ navigation }) {
  const [name, setName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [date, setDate] = useState(atHour(9, 1));
  const [startTime, setStartTime] = useState(atHour(9));
  const [endTime, setEndTime] = useState(atHour(15));
  const [target, setTarget] = useState('50');
  const [bloodTypes, setBloodTypes] = useState([]);
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');

  const startsAt = combine(date, startTime);
  const endsAt = combine(date, endTime);
  const timeError =
    startsAt.getTime() <= Date.now()
      ? 'The camp must start in the future.'
      : endsAt.getTime() <= startsAt.getTime()
        ? 'The end time must be after the start time.'
        : '';
  const valid = Boolean(name.trim() && venueName.trim() && coords && Number(target) >= 1 && bloodTypes.length && !timeError);

  const toggleType = (t) =>
    setBloodTypes((list) => (list.includes(t) ? list.filter((x) => x !== t) : [...list, t]));

  const useMyLocation = async () => {
    setLocating(true);
    setLocError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocError('Location permission was denied. Allow it in Settings and try again.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    } catch (e) {
      setLocError('Could not get your location. Try again.');
    } finally {
      setLocating(false);
    }
  };

  const preview = () =>
    navigation.navigate(ROUTES.CAMP_PREVIEW, {
      draft: {
        name: name.trim(),
        venueName: venueName.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        startsAt: startsAt.toISOString(), // strings, so navigation params stay serializable
        endsAt: endsAt.toISOString(),
        target: Number(target),
        bloodTypes,
      },
    });

  return (
    <Screen scroll keyboardAvoiding safeAreaEdges={['top', 'left', 'right']} contentContainerStyle={s.screen}>
      <View style={s.content}>
        <AppHeader title="New donation camp" onBack={navigation.goBack} />
        <FormInput label="Camp name" placeholder="e.g. Kurunegala Community Drive" value={name} onChangeText={setName} />
        <PickerField label="Date" value={date} mode="date" minimumDate={new Date()} onChange={setDate} />
        <PickerField label="Start time" value={startTime} mode="time" onChange={setStartTime} />
        <PickerField label="End time" value={endTime} mode="time" onChange={setEndTime} />
        {timeError ? <Text style={s.error} accessibilityRole="alert">{timeError}</Text> : null}
        <FormInput label="Venue name" placeholder="e.g. Town Hall, Kurunegala" value={venueName} onChangeText={setVenueName} />
        <View style={s.fieldGroup}>
          <Text style={s.label}>Venue location</Text>
          <SecondaryButton
            title={coords ? 'Location set - tap to update' : 'Use my current location'}
            onPress={useMyLocation}
            disabled={locating}
          />
          {coords ? <Text style={s.hint}>{coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}</Text> : null}
          {locError ? <Text style={s.error} accessibilityRole="alert">{locError}</Text> : null}
        </View>
        <FormInput
          label="Target donors"
          placeholder="50"
          value={target}
          onChangeText={(v) => setTarget(v.replace(/\D/g, ''))}
          keyboardType="number-pad"
        />
        <Text style={s.label}>Blood types needed</Text>
        <View style={s.types}>
          {TYPES.map((t) => {
            const on = bloodTypes.includes(t);
            return (
              <Pressable key={t} onPress={() => toggleType(t)} style={[s.type, on && s.selected]}>
                <Text style={[s.typeText, on && s.selectedText]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>
        <PrimaryButton title="Preview camp" disabled={!valid} onPress={preview} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  screen: { paddingBottom: spacing.xxxl },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: spacing.xl },
  fieldGroup: { gap: spacing.sm },
  label: { color: colors.textPrimary, fontSize: typography.sizes.supporting, fontWeight: typography.weights.semibold },
  field: { minHeight: 52, justifyContent: 'center', paddingHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, backgroundColor: colors.surface },
  fieldText: { color: colors.textPrimary, fontSize: typography.sizes.supporting },
  hint: { color: colors.textSecondary, fontSize: typography.sizes.caption },
  error: { color: colors.error, fontSize: typography.sizes.supporting },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  type: { width: '23%', minHeight: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, backgroundColor: colors.surface },
  selected: { borderColor: colors.primary, backgroundColor: colors.primary },
  typeText: { color: colors.textPrimary, fontWeight: typography.weights.bold },
  selectedText: { color: colors.white },
});