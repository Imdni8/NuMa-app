import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Activity, Event } from './types';
import { dateKey } from './date';

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
  _didSeedDefaults: boolean;
  _didSeedSampleEvents: boolean;
};

const TESTER_KEY = 'numa:tester';

function getStateKey(): string | null {
  return tester ? `numa:${tester}:state` : null;
}

let tester: string | null = null;
let testerLoaded = false;
const testerListeners = new Set<() => void>();

export type TesterStatus = 'loading' | 'absent' | 'present';
let testerStatusSnapshot: TesterStatus = 'loading';

function recomputeTesterStatus() {
  testerStatusSnapshot = !testerLoaded
    ? 'loading'
    : tester
    ? 'present'
    : 'absent';
}

function notifyTester() {
  recomputeTesterStatus();
  testerListeners.forEach((l) => l());
}

let state: State = {
  activities: [],
  events: [],
  _didSeedDefaults: false,
  _didSeedSampleEvents: false,
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
    const key = getStateKey();
    if (key) {
      AsyncStorage.setItem(key, JSON.stringify(state)).catch(() => {});
    }
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

async function hydrateState() {
  const key = getStateKey();
  if (!key) {
    hydrated = true;
    notify();
    hydrationListeners.forEach((l) => l());
    hydrationListeners.clear();
    return;
  }
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      try {
        state = { ...state, ...JSON.parse(raw) };
      } catch {
        // ignore corrupt persisted state
      }
    }
  } catch {
    // ignore storage failures
  }
  hydrated = true;
  notify();
  hydrationListeners.forEach((l) => l());
  hydrationListeners.clear();
}

if (typeof window !== 'undefined') {
  AsyncStorage.getItem(TESTER_KEY)
    .then((stored) => {
      tester = stored && stored.trim() ? stored.trim() : null;
    })
    .catch(() => {})
    .finally(() => {
      testerLoaded = true;
      notifyTester();
      if (tester) {
        hydrateState();
      }
    });
}

export function setTester(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  tester = trimmed;
  AsyncStorage.setItem(TESTER_KEY, trimmed).catch(() => {});
  notifyTester();
  // Reset to initial state for the new tester (if tester switched, prevents leakage),
  // then load any saved data for this tester.
  state = {
    activities: [],
    events: [],
    _didSeedDefaults: false,
    _didSeedSampleEvents: false,
  };
  hydrated = false;
  hydrateState();
}

export function useTesterStatus(): TesterStatus {
  return useSyncExternalStore(
    (l) => {
      testerListeners.add(l);
      return () => {
        testerListeners.delete(l);
      };
    },
    () => testerStatusSnapshot,
    () => testerStatusSnapshot
  );
}

export function useNuMaStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state)
  );
}

export function getNuMaState(): State {
  return state;
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

export function deleteEvent(id: string) {
  setState((s) => ({
    events: s.events.filter((e) => e.id !== id),
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

export function seedSampleEventsOnce() {
  if (state._didSeedSampleEvents) return;
  setState((s) => {
    if (s.activities.length === 0) return s;
    const sampleEvents: Event[] = [];
    const now = new Date();
    const TEST_DAYS = 14;
    for (let dayOffset = 0; dayOffset < TEST_DAYS; dayOffset++) {
      for (const activity of s.activities) {
        if (Math.random() < 0.2) continue;
        const dayCount = 1 + Math.floor(Math.random() * 5);
        for (let i = 0; i < dayCount; i++) {
          const eventDate = new Date(now);
          eventDate.setDate(now.getDate() - dayOffset);
          eventDate.setHours(
            8 + Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 60),
            0,
            0
          );
          sampleEvents.push({
            id: newId(),
            activityId: activity.id,
            timestamp: eventDate.toISOString(),
          });
        }
      }
    }
    return {
      events: [...s.events, ...sampleEvents],
      _didSeedSampleEvents: true,
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
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
