import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View as RNView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import Colors from '@/constants/Colors';
import { Text, useThemeColor } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import {
  dateKey,
  dayAccordionLabel,
  dayOfWeekShort,
  formatWeekRange,
  getWeekDayKeys,
  getWeekStartKey,
  isCurrentWeek,
  shiftDateKey,
  todayKey,
} from '@/lib/date';
import { deleteActivity, deleteEvent, useNuMaStore } from '@/lib/store';
import type { Activity, Event } from '@/lib/types';

const TRACK_HEIGHT = 70;
const BAR_COLOR = '#666';
const BAR_TODAY_COLOR = '#333';
const ACCENT = '#7C5BC4';

type Props = {
  activity: Activity;
  onClose: () => void;
  onEdit: () => void;
};

export default function ActivityTimelineSheet({
  activity,
  onClose,
  onEdit,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = Colors[colorScheme].text;
  const sheetBg = useThemeColor(
    { light: '#F5F2FA', dark: '#1A1822' },
    'background'
  );
  const dayHeaderBg = useThemeColor(
    { light: '#E5DEEE', dark: '#2A2535' },
    'background'
  );
  const dividerColor = useThemeColor(
    { light: 'rgba(0,0,0,0.15)', dark: 'rgba(255,255,255,0.15)' },
    'background'
  );
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  const translateY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => {
        translateY.setValue(Math.max(0, g.dy));
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80) {
          Animated.timing(translateY, {
            toValue: screenHeight,
            duration: 180,
            useNativeDriver: true,
          }).start(() => onClose());
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  const today = todayKey();
  const [weekStartKey, setWeekStartKey] = useState(() => getWeekStartKey(today));
  const [expandedDays, setExpandedDays] = useState<Set<string>>(
    () => new Set([today])
  );

  const events = useNuMaStore((s) => s.events);

  const eventsByDay = useMemo(() => {
    const map: Record<string, Event[]> = {};
    for (const e of events) {
      if (e.activityId !== activity.id) continue;
      const dk = dateKey(new Date(e.timestamp));
      (map[dk] ||= []).push(e);
    }
    for (const dk in map) {
      map[dk].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }
    return map;
  }, [events, activity.id]);

  const earliestWeekKey = useMemo(() => {
    let earliest: string | null = null;
    for (const e of events) {
      if (e.activityId !== activity.id) continue;
      if (earliest === null || e.timestamp < earliest) earliest = e.timestamp;
    }
    if (!earliest) return null;
    return getWeekStartKey(dateKey(new Date(earliest)));
  }, [events, activity.id]);

  const weekDayKeys = useMemo(() => getWeekDayKeys(weekStartKey), [weekStartKey]);
  const weekCounts = useMemo(
    () => weekDayKeys.map((dk) => eventsByDay[dk]?.length ?? 0),
    [weekDayKeys, eventsByDay]
  );
  const maxCount = Math.max(1, ...weekCounts);

  const daysInWeekWithEvents = useMemo(
    () =>
      weekDayKeys
        .filter((dk) => (eventsByDay[dk]?.length ?? 0) > 0)
        .sort((a, b) => b.localeCompare(a)),
    [weekDayKeys, eventsByDay]
  );

  const onCurrentWeek = isCurrentWeek(weekStartKey);
  const canGoPrev =
    earliestWeekKey !== null && weekStartKey > earliestWeekKey;
  const canGoNext = !onCurrentWeek;
  const weekLabel = onCurrentWeek ? 'This week' : formatWeekRange(weekStartKey);

  const onPrevWeek = () => {
    if (canGoPrev) setWeekStartKey(shiftDateKey(weekStartKey, -7));
  };
  const onNextWeek = () => {
    if (canGoNext) setWeekStartKey(shiftDateKey(weekStartKey, 7));
  };

  const toggleDay = (dk: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dk)) next.delete(dk);
      else next.add(dk);
      return next;
    });
  };

  const confirmDeleteEvent = (event: Event) => {
    const time = formatTime(event.timestamp);
    Alert.alert(
      'Delete event?',
      `Remove the ${activity.name.toLowerCase()} entry at ${time}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteEvent(event.id),
        },
      ]
    );
  };

  const confirmDeleteActivity = () => {
    Alert.alert(
      `Delete ${activity.name}?`,
      'This will also delete all logged events for this activity. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteActivity(activity.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <RNView style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: sheetBg,
              height: screenHeight * 0.85,
              paddingBottom: Math.max(insets.bottom, 16),
              transform: [{ translateY }],
            },
          ]}>
          <RNView {...panResponder.panHandlers} style={styles.handleArea}>
            <RNView style={styles.handle} />
          </RNView>

          <RNView style={styles.header}>
            <RNView style={styles.headerLeft}>
              <Text style={styles.activityName}>{activity.name}</Text>
              <Text style={styles.weekLabel}>{weekLabel}</Text>
            </RNView>
            <RNView style={styles.headerActions}>
              <Pressable
                onPress={onEdit}
                hitSlop={12}
                style={styles.actionBtn}>
                <FontAwesome name="pencil" size={20} color={iconColor} />
              </Pressable>
              <Pressable
                onPress={confirmDeleteActivity}
                hitSlop={12}
                style={styles.actionBtn}>
                <FontAwesome name="trash-o" size={20} color={iconColor} />
              </Pressable>
            </RNView>
          </RNView>

          <RNView
            style={[styles.divider, { backgroundColor: dividerColor }]}
          />

          <RNView style={styles.chart}>
            {weekDayKeys.map((dk, i) => {
              const count = weekCounts[i];
              const barHeight = (count / maxCount) * TRACK_HEIGHT;
              const isToday = dk === today;
              return (
                <RNView key={dk} style={styles.chartColumn}>
                  <Text style={styles.barCountLabel}>
                    {count > 0 ? count : ''}
                  </Text>
                  <RNView style={styles.barTrack}>
                    <RNView
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: isToday
                            ? BAR_TODAY_COLOR
                            : BAR_COLOR,
                        },
                      ]}
                    />
                  </RNView>
                  <Text
                    style={[
                      styles.dayOfWeekLabel,
                      isToday && styles.dayOfWeekLabelToday,
                    ]}>
                    {dayOfWeekShort(dk)}
                  </Text>
                </RNView>
              );
            })}
          </RNView>

          <ScrollView
            style={styles.accordion}
            contentContainerStyle={styles.accordionContent}>
            {daysInWeekWithEvents.length === 0 ? (
              <Text style={styles.empty}>
                No {activity.name.toLowerCase()} events this week.
              </Text>
            ) : (
              daysInWeekWithEvents.map((dk) => {
                const dayEvents = eventsByDay[dk];
                const isExpanded = expandedDays.has(dk);
                return (
                  <RNView key={dk} style={styles.daySection}>
                    <Pressable
                      onPress={() => toggleDay(dk)}
                      style={[
                        styles.dayHeader,
                        { backgroundColor: dayHeaderBg },
                      ]}>
                      <Text style={styles.dayHeaderLabel}>
                        {dayAccordionLabel(dk)}
                      </Text>
                      <RNView style={styles.dayHeaderRight}>
                        <RNView style={styles.countBadge}>
                          <Text style={styles.countBadgeText}>
                            {dayEvents.length}
                          </Text>
                        </RNView>
                        <FontAwesome
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={12}
                          color={iconColor}
                        />
                      </RNView>
                    </Pressable>
                    {isExpanded && (
                      <RNView style={styles.eventsList}>
                        {dayEvents.map((e) => (
                          <RNView key={e.id} style={styles.eventRow}>
                            <Text style={styles.eventTime}>
                              <Text style={styles.eventTimeAt}>at </Text>
                              {formatTime(e.timestamp)}
                            </Text>
                            <Pressable
                              onPress={() => confirmDeleteEvent(e)}
                              hitSlop={12}>
                              <FontAwesome
                                name="trash-o"
                                size={18}
                                color={iconColor}
                              />
                            </Pressable>
                          </RNView>
                        ))}
                      </RNView>
                    )}
                  </RNView>
                );
              })
            )}
          </ScrollView>

          <RNView
            style={[styles.footer, { borderTopColor: dividerColor }]}>
            <Pressable
              onPress={onPrevWeek}
              disabled={!canGoPrev}
              hitSlop={12}
              style={[
                styles.footerBtn,
                !canGoPrev && styles.footerBtnDisabled,
              ]}>
              <FontAwesome
                name="chevron-left"
                size={12}
                color={iconColor}
              />
              <Text style={styles.footerBtnText}>Last week</Text>
            </Pressable>
            <Pressable
              onPress={onNextWeek}
              disabled={!canGoNext}
              hitSlop={12}
              style={[
                styles.footerBtn,
                !canGoNext && styles.footerBtnDisabled,
              ]}>
              <Text style={styles.footerBtnText}>Next week</Text>
              <FontAwesome
                name="chevron-right"
                size={12}
                color={iconColor}
              />
            </Pressable>
          </RNView>
        </Animated.View>
      </RNView>
    </Modal>
  );
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 4,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#999',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  headerLeft: {
    flex: 1,
  },
  activityName: {
    fontSize: 24,
    fontWeight: '700',
  },
  weekLabel: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    padding: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 12,
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    height: 110,
    marginBottom: 16,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barCountLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    minHeight: 14,
  },
  barTrack: {
    width: 18,
    height: TRACK_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 3,
  },
  dayOfWeekLabel: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.6,
  },
  dayOfWeekLabelToday: {
    opacity: 1,
    fontWeight: '700',
  },
  accordion: {
    flex: 1,
  },
  accordionContent: {
    paddingBottom: 12,
  },
  daySection: {
    marginBottom: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dayHeaderLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countBadge: {
    backgroundColor: ACCENT,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  eventsList: {
    paddingHorizontal: 16,
  },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  eventTime: {
    fontSize: 15,
  },
  eventTimeAt: {
    opacity: 0.6,
  },
  empty: {
    textAlign: 'center',
    opacity: 0.5,
    paddingVertical: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 14,
    paddingHorizontal: 4,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  footerBtnDisabled: {
    opacity: 0.3,
  },
  footerBtnText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
