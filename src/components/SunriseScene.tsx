import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { scene } from '@/theme/tokens';

const WATER = 70;

/** The dawn backdrop behind the streak. Purely decorative, so it is hidden from screen readers. */
export function SunriseScene({ children, style, ...rest }: ViewProps) {
  return (
    <View {...rest} style={[styles.root, style]}>
      <View style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <LinearGradient colors={scene.sky} locations={scene.skyStops} style={styles.sky} />
        <View style={styles.sun} />
        <LinearGradient colors={scene.water} style={styles.water} />
        <LinearGradient colors={['rgba(255,214,160,0.6)', 'rgba(255,214,160,0)']} style={styles.reflection} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { overflow: 'hidden' },
  sky: { position: 'absolute', left: 0, right: 0, top: 0, bottom: WATER },
  sun: {
    position: 'absolute',
    bottom: WATER - 32,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: scene.sun,
    boxShadow: '0 0 40px 10px rgba(255,214,160,0.45)',
  },
  water: { position: 'absolute', left: 0, right: 0, bottom: 0, height: WATER },
  reflection: { position: 'absolute', bottom: WATER - 42, alignSelf: 'center', width: 72, height: 42 },
});
