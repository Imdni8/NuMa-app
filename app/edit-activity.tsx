import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import Colors from '@/constants/Colors';
import { Text, useThemeColor, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { updateActivity, useNuMaStore } from '@/lib/store';

function firstGrapheme(text: string): string {
  if (!text) return '';
  try {
    const Seg = (Intl as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
    if (Seg) {
      const segmenter = new Seg(undefined, { granularity: 'grapheme' });
      const first = segmenter.segment(text)[Symbol.iterator]().next().value;
      return first?.segment ?? '';
    }
  } catch {
    // fall through
  }
  return text.match(/^./u)?.[0] ?? '';
}

export default function EditActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const activity = useNuMaStore((s) =>
    s.activities.find((a) => a.id === id) ?? null
  );

  const colorScheme = useColorScheme() ?? 'light';
  const tintColor = Colors[colorScheme].tint;
  const textColor = Colors[colorScheme].text;
  const inputBg = useThemeColor(
    { light: '#F5F2FA', dark: '#2A2535' },
    'background'
  );
  const inputBorder = useThemeColor(
    { light: '#D9D2E5', dark: '#3D3550' },
    'background'
  );

  const [name, setName] = useState(activity?.name ?? '');
  const [emoji, setEmoji] = useState(activity?.emoji ?? '');

  useEffect(() => {
    if (!activity) router.back();
  }, [activity]);

  if (!activity) return null;

  const canSave = name.trim().length > 0;

  const onSave = () => {
    if (!canSave) return;
    updateActivity(activity.id, {
      name: name.trim(),
      emoji: emoji || activity.emoji,
    });
    router.back();
  };

  const onEmojiChange = (text: string) => {
    setEmoji(firstGrapheme(text));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Edit activity',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={[styles.headerBtn, { color: tintColor }]}>
                Cancel
              </Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={onSave} disabled={!canSave} hitSlop={12}>
              <Text
                style={[
                  styles.headerBtn,
                  { color: tintColor, opacity: canSave ? 1 : 0.4 },
                ]}>
                Save
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>
          Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Type something"
          placeholderTextColor="#999"
          style={[
            styles.input,
            {
              color: textColor,
              backgroundColor: inputBg,
              borderColor: inputBorder,
            },
          ]}
          autoFocus
          returnKeyType="next"
        />

        <Text style={styles.label}>Emoji</Text>
        <TextInput
          value={emoji}
          onChangeText={onEmojiChange}
          style={[
            styles.input,
            styles.emojiInput,
            {
              color: textColor,
              backgroundColor: inputBg,
              borderColor: inputBorder,
            },
          ]}
        />
        <Text style={styles.hint}>Leave empty to keep {activity.emoji}.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.8,
    marginTop: 16,
    marginBottom: 6,
  },
  required: {
    color: '#E0476F',
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  emojiInput: {
    fontSize: 22,
    paddingVertical: 10,
  },
  hint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 6,
  },
  headerBtn: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 8,
  },
});
