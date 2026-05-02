import { Modal, Pressable, StyleSheet, View as RNView } from 'react-native';

import Colors from '@/constants/Colors';
import { Text, useThemeColor } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';

type Props = {
  onConfirm: () => void;
  onDismiss: () => void;
};

export default function AccidentalTapDialog({ onConfirm, onDismiss }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const tintColor = Colors[colorScheme].tint;
  const dialogBg = useThemeColor(
    { light: '#F5F2FA', dark: '#1A1822' },
    'background'
  );

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <RNView style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <RNView style={[styles.dialog, { backgroundColor: dialogBg }]}>
          <Text style={styles.title}>Was it an accidental tap?</Text>
          <Text style={styles.body}>
            Looks like you logged the same event recently. To prevent
            accidental logging due to mistaps, we show this warning in case
            the same event has been logged less than 2 minutes ago.
          </Text>
          <RNView style={styles.buttons}>
            <Pressable onPress={onDismiss} style={styles.button} hitSlop={4}>
              <Text style={[styles.buttonText, { color: tintColor }]}>
                Dismiss
              </Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.button} hitSlop={4}>
              <Text style={[styles.buttonText, { color: tintColor }]}>
                Log it
              </Text>
            </Pressable>
          </RNView>
        </RNView>
      </RNView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
