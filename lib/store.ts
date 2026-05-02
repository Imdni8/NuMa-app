import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Activity, Event } from './types';
import { dateKey, shiftDateKey, todayKey } from './date';

const DEFAULT_ACTIVITIES: ReadonlyArray<Pick<Activity, 'name' | 'emoji'>> = [
  { name: 'Feeding', emoji: '🍼' },
  { name: 'Burping', emoji: '👶' },
  { name: 'Peeing', emoji: '💧' },
  { name: 'Pooping', emoji: '💩' },
];

function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

type State = {
  activities: Activity[];
  events: Event[];
  selectedDate: string;
  _didSeedDefaults: boolean;
};

const STORAGE_KEY = 'numa-state';

let state: State = {
  activities: [],
  events: [],
  selectedDate: todayKey(),
  _didSeedDefaults: false,
};

let hydrated = false;
const listeners = new Set<() => void>();
const hydrationListeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function setState(updater: (s: State) => Partial<State>) {
  state = { ...state, ...updater(state) };
  notify();
  if (hydrated) {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

if (typeof window !== 'undefined') {
  AsyncStorage.getItem(STORAGE_KEY)
    .then((raw) => {
      if (raw) {
        try {
          state = { ...state, ...JSON.parse(raw) };
        } catch {
          // ignore corrupt persisted state
        }
      }
    })
    .finally(() => {
      hydrated = true;
      notify();
      hydrationListeners.forEach((l) => l());
      hydrationListeners.clear();
    });
}

export function useNuMaStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state)
  );
}

export const numaStorePersist = {
  hasHydrated: () => hydrated,
  onFinishHydration: (listener: () => void) => {
    if (hydrated) {
      listener();
      return () => {};
    }
    hydrationListeners.add(listener);
    return () => {
      hydrationListeners.delete(listener);
    };
  },
};

export function setSelectedDate(key: string) {
  setState(() => ({ selectedDate: key }));
}

export function shiftSelectedDate(deltaDays: number) {
  setState((s) => ({ selectedDate: shiftDateKey(s.selectedDate, deltaDays) }));
}

export function addEvent(activityId: string) {
  setState((s) => ({
    events: [
      ...s.events,
      { id: newId(), activityId, timestamp: new Date().toISOString() },
    ],
  }));
}

export function addActivity(input: { name: string; emoji: string }) {
  setState((s) => ({
    activities: [
      ...s.activities,
      {
        id: newId(),
        name: input.name,
        emoji: input.emoji,
        createdAt: new Date().toISOString(),
      },
    ],
  }));
}

export function updateActivity(
  id: string,
  patch: Partial<Pick<Activity, 'name' | 'emoji'>>
) {
  setState((s) => ({
    activities: s.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
  }));
}

export function deleteActivity(id: string) {
  setState((s) => ({
    activities: s.activities.filter((a) => a.id !== id),
    events: s.events.filter((e) => e.activityId !== id),
  }));
}

export function seedDefaultsOnce() {
  if (state._didSeedDefaults) return;
  setState((s) => {
    const now = new Date().toISOString();
    return {
      activities: [
        ...s.activities,
        ...DEFAULT_ACTIVITIES.map((a) => ({
          id: newId(),
          name: a.name,
          emoji: a.emoji,
          createdAt: now,
        })),
      ],
      _didSeedDefaults: true,
    };
  });
}

export function selectActivityCount(activityId: string, dayKey: string) {
  return (s: State) =>
    s.events.filter(
      (e) => e.activityId === activityId && dateKey(new Date(e.timestamp)) === dayKey
    ).length;
}

export function selectEventsForActivityOnDate(activityId: string, dayKey: string) {
  return (s: State) =>
    s.events
      .filter((e) => e.activityId === activityId && dateKey(new Date(e.timestamp)) === dayKey)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
