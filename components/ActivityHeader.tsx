import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View as RNView } from 'react-native';

import Colors from '@/constants/Colors';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';

export default function ActivityHeader() {
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = Colors[colorScheme].text;

  return (
    <View style={styles.row}>
      <RNView style={styles.spacer} />
      <Text style={styles.title}>Activity</Text>
      <Link href="/activities-info" asChild>
        <Pressable hitSlop={12}>
          <FontAwesome name="info-circle" size={20} color={iconColor} />
        </Pressable>
      </Link>
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
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  spacer: {
    width: 20,
  },
});
