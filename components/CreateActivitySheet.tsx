import { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View as RNView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { Text, useThemeColor } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { addActivity } from '@/lib/store';

const DEFAULT_EMOJI = '👶';

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

type Props = {
  onClose: () => void;
};

export default function CreateActivitySheet({ onClose }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const tintColor = Colors[colorScheme].tint;
  const textColor = Colors[colorScheme].text;

  const sheetBg = useThemeColor(
    { light: '#FFFFFF', dark: '#1A1822' },
    'background'
  );
  const inputBg = useThemeColor(
    { light: '#F5F2FA', dark: '#2A2535' },
    'background'
  );
  const inputBorder = useThemeColor(
    { light: '#D9D2E5', dark: '#3D3550' },
    'background'
  );
  const createBg = useThemeColor(
    { light: '#1A1A1A', dark: '#FFFFFF' },
    'background'
  );
  const createTextColor = useThemeColor(
    { light: '#FFFFFF', dark: '#1A1A1A' },
    'text'
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

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');

  const canSave = name.trim().length > 0;

  const onSave = () => {
    if (!canSave) return;
    addActivity({
      name: name.trim(),
      emoji: emoji || DEFAULT_EMOJI,
    });
    onClose();
  };

  const onEmojiChange = (text: string) => {
    setEmoji(firstGrapheme(text));
  };

  return (
    <Modal
      visible
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: sheetBg,
              paddingBottom: Math.max(insets.bottom, 16) + 8,
              transform: [{ translateY }],
            },
          ]}>
          <RNView {...panResponder.panHandlers} style={styles.handleArea}>
            <RNView style={styles.handle} />
          </RNView>

          <Text style={styles.title}>Add new activity</Text>

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
          <Text style={styles.hint}>
            Defaults to {DEFAULT_EMOJI} if left empty.
          </Text>

          <Pressable
            onPress={onSave}
            disabled={!canSave}
            style={[
              styles.createBtn,
              {
                backgroundColor: createBg,
                opacity: canSave ? 1 : 0.4,
              },
            ]}>
            <Text style={[styles.createBtnText, { color: createTextColor }]}>
              Create
            </Text>
          </Pressable>

          <Pressable onPress={onClose} style={styles.cancelBtn} hitSlop={4}>
            <Text style={[styles.cancelText, { color: tintColor }]}>
              Cancel
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
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
    paddingHorizontal: 24,
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.8,
    marginBottom: 6,
    marginTop: 4,
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
    marginBottom: 8,
  },
  createBtn: {
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelText: {
    fontSize: 16,
  },
});
