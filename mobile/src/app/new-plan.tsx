import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RecipeImage } from '@/components/recipe-card';
import { Body, Button, IconButton, tap, Title, type IconName } from '@/components/ui';
import { recipesForGoal } from '@/data';
import { GOALS, STORES } from '@/lib/options';
import { buildPlan } from '@/lib/planner';
import { useStore } from '@/lib/store';
import { radius, space, useTheme } from '@/lib/theme';
import type { GoalId, PlanMode } from '@/lib/types';

type Choice = PlanMode | 'swipe';

const STEPS = ['Goal', 'Store', 'People', 'Plan'];

export default function NewPlan() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { plan, setPlan } = useStore();
  const params = useLocalSearchParams<{ swipe?: string }>();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<GoalId | null>(plan?.goal ?? null);
  const [store, setStore] = useState(plan?.store ?? 'Walmart');
  const [servings, setServings] = useState(plan?.servings ?? 2);
  const [mode, setMode] = useState<Choice>(params.swipe ? 'swipe' : (plan?.mode ?? 'week'));

  const tileWidth = (width - space.xl * 2 - space.md) / 2;
  const last = step === STEPS.length - 1;

  function finish() {
    if (!goal) return;
    if (mode === 'swipe') {
      router.replace({ pathname: '/swipe', params: { goal, store, servings: String(servings) } });
      return;
    }
    setPlan({ goal, store, servings, mode, days: buildPlan(goal, mode), createdAt: new Date().toISOString() });
    router.dismiss();
    router.navigate('/plan');
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <View style={[styles.top, { paddingTop: Math.max(insets.top, space.lg) }]}>
        <IconButton icon="close" label="Close" onPress={() => router.back()} />
        <View style={styles.progress}>
          {STEPS.map((s, i) => (
            <View key={s} style={[styles.progressSeg, { backgroundColor: i <= step ? t.accent : t.surfaceAlt }]} />
          ))}
        </View>
        <Text style={{ color: t.textMuted, fontWeight: '600', width: 40, textAlign: 'right' }}>
          {step + 1}/{STEPS.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.lg, paddingBottom: 140 }}>
        {step === 0 && (
          <>
            <Header title="What’s your goal?" body="We’ll pick recipes that fit it." />
            <View style={styles.grid}>
              {GOALS.map((g) => {
                const cover = recipesForGoal(g.id).find((r) => r.image && r.goals[0] === g.id);
                const selected = goal === g.id;
                return (
                  <Pressable
                    key={g.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${g.label}. ${g.blurb}`}
                    onPress={() => {
                      tap();
                      setGoal(g.id);
                    }}
                    style={({ pressed }) => [
                      styles.goalTile,
                      {
                        width: tileWidth,
                        borderColor: selected ? t.accent : 'transparent',
                        opacity: pressed ? 0.9 : 1,
                      },
                    ]}>
                    {cover ? (
                      <RecipeImage recipe={cover} style={StyleSheet.absoluteFill} />
                    ) : (
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: g.color }]} />
                    )}
                    <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']} style={styles.goalShade}>
                      <View style={[styles.goalIcon, { backgroundColor: g.color }]}>
                        <Ionicons name={g.icon} size={16} color="#fff" />
                      </View>
                      <View style={{ gap: 2 }}>
                        <Text style={styles.goalLabel}>{g.label}</Text>
                        <Text style={styles.goalBlurb} numberOfLines={2}>
                          {g.blurb}
                        </Text>
                      </View>
                    </LinearGradient>
                    {selected && (
                      <View style={[styles.check, { backgroundColor: t.accent }]}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Header title="Where do you shop?" body="We’ll adjust cost estimates to the store." />
            <View style={{ gap: space.sm }}>
              {STORES.map((s) => (
                <Option
                  key={s.name}
                  title={s.name}
                  subtitle={s.priceFactor < 0.9 ? 'Lower prices' : s.priceFactor > 1.1 ? 'Higher prices' : undefined}
                  icon="storefront-outline"
                  selected={store === s.name}
                  onPress={() => setStore(s.name)}
                />
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Header title="How many are you feeding?" body="Ingredients and the shopping list scale to this." />
            <View style={styles.peopleGrid}>
              {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => {
                const selected = servings === n;
                return (
                  <Pressable
                    key={n}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${n} ${n === 1 ? 'person' : 'people'}`}
                    onPress={() => {
                      tap();
                      setServings(n);
                    }}
                    style={[
                      styles.peopleTile,
                      {
                        width: (width - space.xl * 2 - space.md * 3) / 4,
                        backgroundColor: selected ? t.accent : t.surface,
                        borderColor: selected ? t.accent : t.border,
                      },
                    ]}>
                    <Text style={{ fontSize: 26, fontWeight: '800', color: selected ? t.onAccent : t.text }}>{n}</Text>
                    <Text style={{ fontSize: 12, color: selected ? t.onAccent : t.textMuted }}>
                      {n === 1 ? 'person' : 'people'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Header title="How much should we plan?" body="You can swap any meal afterwards." />
            <Option
              title="A week of dinners"
              subtitle="7 dinners and one combined shopping list"
              icon="calendar"
              selected={mode === 'week'}
              onPress={() => setMode('week')}
              large
            />
            <Option
              title="Swipe to pick my week"
              subtitle="Swipe right on dinners you like until you have 7"
              icon="heart"
              selected={mode === 'swipe'}
              onPress={() => setMode('swipe')}
              large
            />
            <Option
              title="Just tonight"
              subtitle="3 ideas to choose from"
              icon="restaurant"
              selected={mode === 'tonight'}
              onPress={() => setMode('tonight')}
              large
            />
          </>
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space.lg), backgroundColor: t.background, borderTopColor: t.border },
        ]}>
        {step > 0 && (
          <Button title="Back" variant="secondary" onPress={() => setStep((s) => s - 1)} style={{ flex: 1 }} />
        )}
        <Button
          title={last ? (mode === 'swipe' ? 'Start swiping' : 'Build my plan') : 'Continue'}
          icon={last ? (mode === 'swipe' ? 'heart' : 'sparkles') : undefined}
          disabled={step === 0 && !goal}
          onPress={last ? finish : () => setStep((s) => s + 1)}
          style={{ flex: 2 }}
        />
      </View>
    </View>
  );
}

function Header({ title, body }: { title: string; body: string }) {
  return (
    <View style={{ gap: space.xs, marginBottom: space.xs }}>
      <Title>{title}</Title>
      <Body muted>{body}</Body>
    </View>
  );
}

function Option({
  title,
  subtitle,
  icon,
  selected,
  onPress,
  large,
}: {
  title: string;
  subtitle?: string;
  icon: IconName;
  selected: boolean;
  onPress: () => void;
  large?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.option,
        {
          paddingVertical: large ? space.xl : space.lg,
          backgroundColor: selected ? t.accentSoft : t.surface,
          borderColor: selected ? t.accent : t.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={[styles.optionIcon, { backgroundColor: selected ? t.accent : t.surfaceAlt }]}>
        <Ionicons name={icon} size={20} color={selected ? t.onAccent : t.text} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: t.text, fontSize: 17, fontWeight: '700' }}>{title}</Text>
        {subtitle ? <Text style={{ color: t.textMuted, fontSize: 14 }}>{subtitle}</Text> : null}
      </View>
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={22}
        color={selected ? t.accent : t.border}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.xl,
    paddingBottom: space.sm,
  },
  progress: { flex: 1, flexDirection: 'row', gap: 6 },
  progressSeg: { flex: 1, height: 5, borderRadius: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  goalTile: { height: 190, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 3 },
  goalShade: { flex: 1, padding: space.md, justifyContent: 'space-between' },
  goalIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  goalLabel: { color: '#fff', fontSize: 17, fontWeight: '800' },
  goalBlurb: { color: 'rgba(255,255,255,0.88)', fontSize: 12, lineHeight: 16 },
  check: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  optionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  peopleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  peopleTile: {
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
