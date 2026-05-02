import { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View as RNView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ActivityTile from '@/components/ActivityTile';
import DateHeader from '@/components/DateHeader';
import { Text, View } from '@/components/Themed';
import { numaStorePersist, seedDefaultsOnce, useNuMaStore } from '@/lib/store';

const SCREEN_PADDING = 16;
const GAP = 12;

export default function ActivitiesScreen() {
  const activities = useNuMaStore((s) => s.activities);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tileWidth = (width - SCREEN_PADDING * 2 - GAP) / 2;

  useEffect(() => {
    if (numaStorePersist.hasHydrated()) {
      seedDefaultsOnce();
      return;
    }
    return numaStorePersist.onFinishHydration(seedDefaultsOnce);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DateHeader />
      <ScrollView contentContainerStyle={styles.scroll}>
        <RNView style={styles.grid}>
          {activities.map((a) => (
            <ActivityTile key={a.id} activity={a} width={tileWidth} />
          ))}
        </RNView>
        {activities.length === 0 && (
          <Text style={styles.empty}>Loading…</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: SCREEN_PADDING,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  empty: {
    textAlign: 'center',
    opacity: 0.5,
    marginTop: 40,
  },
});
