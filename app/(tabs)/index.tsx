import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View as RNView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import AccidentalTapDialog from '@/components/AccidentalTapDialog';
import ActivityHeader from '@/components/ActivityHeader';
import ActivityTile from '@/components/ActivityTile';
import ActivityTimelineSheet from '@/components/ActivityTimelineSheet';
import CreateActivitySheet from '@/components/CreateActivitySheet';
import { Text, useThemeColor, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import {
  addEvent,
  getNuMaState,
  numaStorePersist,
  seedDefaultsOnce,
  seedSampleEventsOnce,
  useNuMaStore,
} from '@/lib/store';
import type { Activity } from '@/lib/types';

const SCREEN_PADDING = 16;
const GAP = 12;
const ACCIDENTAL_TAP_WINDOW_MS = 2 * 60 * 1000;

export default function ActivitiesScreen() {
  const activities = useNuMaStore((s) => s.activities);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tileWidth = (width - SCREEN_PADDING * 2 - GAP) / 2;

  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = Colors[colorScheme].text;
  const fabBg = useThemeColor(
    { light: '#E5DEEE', dark: '#2A2535' },
    'background'
  );

  const [openActivityId, setOpenActivityId] = useState<string | null>(null);
  const [pendingActivity, setPendingActivity] = useState<Activity | null>(null);
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  const openActivity = openActivityId
    ? activities.find((a) => a.id === openActivityId) ?? null
    : null;

  // Auto-clear sheet state if the underlying activity disappears (cascade delete)
  useEffect(() => {
    if (openActivityId && !openActivity) setOpenActivityId(null);
  }, [openActivityId, openActivity]);

  useEffect(() => {
    const seed = () => {
      seedDefaultsOnce();
      seedSampleEventsOnce();
    };
    if (numaStorePersist.hasHydrated()) {
      seed();
      return;
    }
    return numaStorePersist.onFinishHydration(seed);
  }, []);

  const handleTilePress = useCallback((activity: Activity) => {
    const events = getNuMaState().events;
    let mostRecent = 0;
    for (const e of events) {
      if (e.activityId !== activity.id) continue;
      const t = new Date(e.timestamp).getTime();
      if (t > mostRecent) mostRecent = t;
    }
    if (mostRecent > 0 && Date.now() - mostRecent < ACCIDENTAL_TAP_WINDOW_MS) {
      setPendingActivity(activity);
    } else {
      addEvent(activity.id);
    }
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ActivityHeader />
      <ScrollView contentContainerStyle={styles.scroll}>
        <RNView style={styles.grid}>
          {activities.map((a) => (
            <ActivityTile
              key={a.id}
              activity={a}
              width={tileWidth}
              onPress={() => handleTilePress(a)}
              onLongPress={() => setOpenActivityId(a.id)}
            />
          ))}
        </RNView>
        {activities.length === 0 && (
          <Text style={styles.empty}>Loading…</Text>
        )}
      </ScrollView>
      <Pressable
        onPress={() => setShowCreateSheet(true)}
        style={[styles.fab, { backgroundColor: fabBg }]}>
        <FontAwesome name="plus" size={24} color={iconColor} />
      </Pressable>
      {showCreateSheet && (
        <CreateActivitySheet onClose={() => setShowCreateSheet(false)} />
      )}
      {openActivity && (
        <ActivityTimelineSheet
          activity={openActivity}
          onClose={() => setOpenActivityId(null)}
          onEdit={() => {
            const id = openActivity.id;
            setOpenActivityId(null);
            router.push(`/edit-activity?id=${id}`);
          }}
        />
      )}
      {pendingActivity && (
        <AccidentalTapDialog
          onConfirm={() => {
            addEvent(pendingActivity.id);
            setPendingActivity(null);
          }}
          onDismiss={() => setPendingActivity(null)}
        />
      )}
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});
