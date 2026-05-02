import { StyleSheet, View as RNView } from 'react-native';

import { Text, View } from '@/components/Themed';
import { selectActivityCount, useNuMaStore } from '@/lib/store';
import type { Activity } from '@/lib/types';

export default function ActivityTile({
  activity,
  width,
}: {
  activity: Activity;
  width: number;
}) {
  const dayKey = useNuMaStore((s) => s.selectedDate);
  const count = useNuMaStore(selectActivityCount(activity.id, dayKey));

  return (
    <View
      lightColor="#E8E8E8"
      darkColor="#2A2A2A"
      style={[styles.tile, { width }]}>
      <Text style={styles.count}>{count}</Text>
      <RNView style={styles.bottomRow}>
        <Text style={styles.emoji}>{activity.emoji}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {activity.name}
        </Text>
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    aspectRatio: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
  },
  count: {
    fontSize: 56,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
    textAlignVertical: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emoji: {
    fontSize: 16,
  },
  name: {
    fontSize: 14,
    flexShrink: 1,
  },
});
