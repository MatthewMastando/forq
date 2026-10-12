import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/lib/theme';

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}) {
  const t = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: primary ? t.accent : 'transparent',
          borderColor: t.accent,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
      ]}>
      {loading ? (
        <ActivityIndicator color={primary ? t.accentText : t.accent} />
      ) : (
        <Text style={[styles.buttonText, { color: primary ? t.accentText : t.accent }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function OptionCard({
  title,
  subtitle,
  emoji,
  selected,
  onPress,
}: {
  title: string;
  subtitle?: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.option,
        { backgroundColor: selected ? t.selected : t.card, borderColor: selected ? t.accent : t.border },
      ]}>
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionTitle, { color: t.text }]}>{title}</Text>
        {subtitle ? <Text style={{ color: t.muted }}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const t = useTheme();
  return <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }, style]}>{children}</View>;
}

export function Heading({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={[styles.heading, { color: t.text }]}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={{ color: t.muted, fontSize: 15 }}>{children}</Text>;
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { fontSize: 17, fontWeight: '600' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
  },
  emoji: { fontSize: 26 },
  optionTitle: { fontSize: 17, fontWeight: '600' },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 6 },
  heading: { fontSize: 26, fontWeight: '700' },
});
