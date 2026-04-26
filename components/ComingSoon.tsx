import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function ComingSoon({ tab }: { tab: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{tab}</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
  },
});
