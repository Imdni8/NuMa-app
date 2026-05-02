import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet } from 'react-native';

import Colors from '@/constants/Colors';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { formatDateLabel, todayKey } from '@/lib/date';
import { shiftSelectedDate, useNuMaStore } from '@/lib/store';

export default function DateHeader() {
  const colorScheme = useColorScheme() ?? 'light';
  const selectedDate = useNuMaStore((s) => s.selectedDate);

  const iconColor = Colors[colorScheme].text;
  const canGoForward = selectedDate < todayKey();

  return (
    <View style={styles.row}>
      <Pressable onPress={() => shiftSelectedDate(-1)} hitSlop={12}>
        <FontAwesome name="chevron-left" size={18} color={iconColor} />
      </Pressable>
      <Text style={styles.label}>{formatDateLabel(selectedDate)}</Text>
      <Pressable
        onPress={() => shiftSelectedDate(1)}
        disabled={!canGoForward}
        hitSlop={12}
        style={!canGoForward && styles.disabled}>
        <FontAwesome name="chevron-right" size={18} color={iconColor} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  label: {
    fontSize: 22,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.25,
  },
});
