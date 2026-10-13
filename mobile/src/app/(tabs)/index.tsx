import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeatureCard, RecipeTile } from '@/components/recipe-card';
import { Body, Button, Chip, EmptyState, SectionTitle, Title } from '@/components/ui';
import { RECIPES, recipesForGoal } from '@/data';
import { getGoal, GOALS } from '@/lib/options';
import { useStore } from '@/lib/store';
import { radius, space, useTheme } from '@/lib/theme';
import type { GoalId, MealType } from '@/lib/types';

const MEALS: { id: MealType; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Discover() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { plan } = useStore();
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [meal, setMeal] = useState<MealType | null>(null);
  const [query, setQuery] = useState('');

  const pad = space.xl;
  const tileWidth = (width - pad * 2 - space.lg) / 2;

  const featured = useMemo(
    () => (goal ? recipesForGoal(goal) : RECIPES).filter((r) => r.mealType === 'dinner').slice(0, 6),
    [goal],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (goal ? recipesForGoal(goal) : RECIPES).filter(
      (r) =>
        (!meal || r.mealType === meal) &&
        (!q ||
          r.title.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(q))),
    );
  }, [goal, meal, query]);

  const searching = query.trim().length > 0;

  return (
    <ScrollView
      style={{ backgroundColor: t.background }}
      contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: 120, gap: space.xl }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag">
      <View style={{ paddingHorizontal: pad, gap: space.xs }}>
        <Body muted>{greeting()}</Body>
        <Title size={34}>What are we cooking?</Title>
      </View>

      <View style={[styles.search, { marginHorizontal: pad, backgroundColor: t.surface, borderColor: t.border }]}>
        <Ionicons name="search" size={18} color={t.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search recipes or ingredients"
          placeholderTextColor={t.textMuted}
          returnKeyType="search"
          clearButtonMode="while-editing"
          style={{ flex: 1, fontSize: 16, color: t.text, paddingVertical: 12 }}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: pad, gap: space.sm }}>
        <Chip label="All" selected={goal === null} onPress={() => setGoal(null)} />
        {GOALS.map((g) => (
          <Chip
            key={g.id}
            label={g.short}
            icon={g.icon}
            color={g.color}
            selected={goal === g.id}
            onPress={() => setGoal(goal === g.id ? null : g.id)}
          />
        ))}
      </ScrollView>

      {!searching && (
        <View style={[styles.cta, { marginHorizontal: pad, backgroundColor: t.accentSoft }]}>
          <View style={{ gap: 4 }}>
            <Text style={{ color: t.text, fontSize: 19, fontWeight: '800' }}>
              {plan ? 'Your plan is ready' : 'Plan your week in 30 seconds'}
            </Text>
            <Body muted style={{ fontSize: 14, lineHeight: 20 }}>
              {plan
                ? `${plan.days.length} ${getGoal(plan.goal).short.toLowerCase()} dinners for ${plan.servings}, shopping at ${plan.store}.`
                : 'Pick a goal, a store, and how many you’re feeding. We’ll build dinners and one shopping list.'}
            </Body>
          </View>
          <Button
            title={plan ? 'Open my plan' : 'Build my plan'}
            icon={plan ? 'calendar' : 'sparkles'}
            onPress={() => (plan ? router.navigate('/plan') : router.push('/new-plan'))}
            style={{ minHeight: 48 }}
          />
          {!plan && (
            <Button
              title="Or swipe to pick dinners"
              icon="heart"
              variant="secondary"
              onPress={() => router.push({ pathname: '/new-plan', params: { swipe: '1' } })}
              style={{ minHeight: 48, marginTop: -space.sm }}
            />
          )}
        </View>
      )}

      {!searching && featured.length > 0 && (
        <View style={{ gap: space.md }}>
          <View style={{ paddingHorizontal: pad }}>
            <SectionTitle>
              {goal ? `Top ${getGoal(goal).short.toLowerCase()} dinners` : 'Tonight’s favorites'}
            </SectionTitle>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={width * 0.78 + space.md}
            contentContainerStyle={{ paddingHorizontal: pad, gap: space.md }}>
            {featured.map((r) => (
              <FeatureCard key={r.id} recipe={r} width={width * 0.78} />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={{ paddingHorizontal: pad, gap: space.md }}>
        <SectionTitle>{searching ? `${results.length} results` : 'All recipes'}</SectionTitle>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {MEALS.map((m) => (
            <Chip
              key={m.id}
              label={m.label}
              selected={meal === m.id}
              onPress={() => setMeal(meal === m.id ? null : m.id)}
            />
          ))}
        </View>
        {results.length === 0 ? (
          <EmptyState icon="search" title="No matches" body="Try a different ingredient or clear a filter." />
        ) : (
          <View style={styles.grid}>
            {results.map((r) => (
              <RecipeTile key={r.id} recipe={r} width={tileWidth} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cta: { gap: space.lg, padding: space.xl, borderRadius: radius.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg, rowGap: space.xl },
});
