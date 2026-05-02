import { Stack, router } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Colors from '@/constants/Colors';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';

export default function ActivitiesInfoScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const tintColor = Colors[colorScheme].tint;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'About Activities',
          headerRight: () => (
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={[styles.done, { color: tintColor }]}>Done</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lead}>
          Activities is where you log child-care events through the day. Each
          tile is one type of activity, and the number on it is today's count.
        </Text>

        <Text style={styles.h}>Tap a tile</Text>
        <Text style={styles.body}>
          Logs a new event for that activity, timestamped now. The count goes
          up by one.
        </Text>

        <Text style={styles.h}>Long-press a tile</Text>
        <Text style={styles.body}>
          Opens that activity's history — a weekly chart and the full list of
          events you've logged, grouped by day. Swipe an event to delete it.
        </Text>

        <Text style={styles.h}>Tap +</Text>
        <Text style={styles.body}>
          Creates a new activity tile for anything you want to track that
          isn't already there.
        </Text>
      </ScrollView>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  lead: {
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 24,
  },
  h: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
  },
  done: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 8,
  },
});
