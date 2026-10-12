import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { fonts, radius, space, useTheme } from '@/lib/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function tap() {
  Haptics.selectionAsync().catch(() => {});
}

export function Title({
  children,
  size = 30,
  style,
}: {
  children: ReactNode;
  size?: number;
  style?: StyleProp<TextStyle>;
}) {
  const t = useTheme();
  return (
    <Text style={[{ fontFamily: fonts.display, fontSize: size, lineHeight: size * 1.15, color: t.text }, style]}>
      {children}
    </Text>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={styles.sectionTitle}>
      <Text style={{ fontFamily: fonts.displaySemi, fontSize: 21, color: t.text }}>{children}</Text>
      {action}
    </View>
  );
}

export function Body({
  children,
  muted,
  style,
}: {
  children: ReactNode;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  const t = useTheme();
  return <Text style={[{ fontSize: 16, lineHeight: 23, color: muted ? t.textMuted : t.text }, style]}>{children}</Text>;
}

export function Button({
  title,
  onPress,
  icon,
  variant = 'primary',
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const bg = variant === 'primary' ? t.accent : variant === 'secondary' ? t.accentSoft : 'transparent';
  const fg = variant === 'primary' ? t.onAccent : t.accent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled || loading}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={19} color={fg} /> : null}
          <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  active,
  onImage,
  size = 22,
}: {
  icon: IconName;
  onPress: () => void;
  label: string;
  active?: boolean;
  onImage?: boolean;
  size?: number;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.iconButton,
        {
          backgroundColor: onImage ? 'rgba(255,255,255,0.92)' : t.surfaceAlt,
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      <Ionicons name={icon} size={size} color={active ? t.accent : onImage ? '#1C1917' : t.text} />
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  icon,
  color,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  color?: string;
}) {
  const t = useTheme();
  const tint = color ?? t.accent;
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected: !!selected }}
      disabled={!onPress}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? tint : t.surface,
          borderColor: selected ? tint : t.border,
        },
      ]}>
      {icon ? <Ionicons name={icon} size={15} color={selected ? '#fff' : tint} /> : null}
      <Text style={{ color: selected ? '#fff' : t.text, fontWeight: '600', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export function Stat({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  const t = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: t.surface, borderColor: t.border }]}>
      <Ionicons name={icon} size={18} color={t.accent} />
      <Text style={{ color: t.text, fontWeight: '700', fontSize: 16 }}>{value}</Text>
      <Text style={{ color: t.textMuted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 12,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label: string;
}) {
  const t = useTheme();
  const btn = (icon: IconName, next: number, a11y: string) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      disabled={next < min || next > max}
      hitSlop={6}
      onPress={() => {
        tap();
        onChange(next);
      }}
      style={({ pressed }) => [
        styles.stepperBtn,
        {
          borderColor: t.border,
          backgroundColor: t.surface,
          opacity: next < min || next > max ? 0.35 : pressed ? 0.7 : 1,
        },
      ]}>
      <Ionicons name={icon} size={18} color={t.text} />
    </Pressable>
  );
  return (
    <View style={styles.stepper} accessible accessibilityLabel={`${value} ${label}`}>
      {btn('remove', value - 1, `Fewer ${label}`)}
      <Text style={{ color: t.text, fontSize: 17, fontWeight: '700', minWidth: 28, textAlign: 'center' }}>{value}</Text>
      {btn('add', value + 1, `More ${label}`)}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: t.accentSoft }]}>
        <Ionicons name={icon} size={30} color={t.accent} />
      </View>
      <Title size={24} style={{ textAlign: 'center' }}>
        {title}
      </Title>
      <Body muted style={{ textAlign: 'center' }}>
        {body}
      </Body>
      {action ? <View style={{ alignSelf: 'stretch', marginTop: space.sm }}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  button: {
    minHeight: 54,
    borderRadius: radius.md,
    paddingHorizontal: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  buttonText: { fontSize: 17, fontWeight: '700' },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', gap: space.md, paddingHorizontal: space.xl, paddingVertical: 48 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
});
