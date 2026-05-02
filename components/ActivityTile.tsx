import { Pressable, StyleSheet, View as RNView } from 'react-native';

import { Text, View } from '@/components/Themed';
import { todayKey } from '@/lib/date';
import { selectActivityCount, useNuMaStore } from '@/lib/store';
import type { Activity } from '@/lib/types';

type Props = {
  activity: Activity;
  width: number;
  onPress: () => void;
  onLongPress?: () => void;
};

export default function ActivityTile({
  activity,
  width,
  onPress,
  onLongPress,
}: Props) {
  const count = useNuMaStore(selectActivityCount(activity.id, todayKey()));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [{ width }, pressed && styles.pressed]}>
      <View
        lightColor="#E8E8E8"
        darkColor="#2A2A2A"
        style={styles.tile}>
        <Text style={styles.count}>{count}</Text>
        <RNView style={styles.bottomRow}>
          <Text style={styles.emoji}>{activity.emoji}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {activity.name}
          </Text>
        </RNView>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    aspectRatio: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.7,
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
