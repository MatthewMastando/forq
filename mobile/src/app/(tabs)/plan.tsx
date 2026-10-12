import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RecipeRow } from '@/components/recipe-card';
import { Body, Button, Chip, EmptyState, IconButton, Stat, Title } from '@/components/ui';
import { getRecipe } from '@/data';
import { formatPrice } from '@/lib/format';
import { getGoal, priceFactor } from '@/lib/options';
import { swapRecipe } from '@/lib/planner';
import { useStore } from '@/lib/store';
import { space, useTheme } from '@/lib/theme';
import type { Recipe } from '@/lib/types';

export default function PlanScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { plan, setPlan } = useStore();

  if (!plan) {
    return (
      <View style={{ flex: 1, backgroundColor: t.background, paddingTop: insets.top + space.xxl }}>
        <EmptyState
          icon="calendar-outline"
          title="No plan yet"
          body="Tell us your goal, where you shop, and who you’re feeding. We’ll pick dinners and build one shopping list."
          action={<Button title="Build a plan" icon="sparkles" onPress={() => router.push('/new-plan')} />}
        />
      </View>
    );
  }

  const goal = getGoal(plan.goal);
  const recipes = plan.days.map((d) => getRecipe(d.recipeId)).filter((r): r is Recipe => !!r);
  const avg = (f: (r: Recipe) => number) =>
    Math.round(recipes.reduce((sum, r) => sum + f(r), 0) / Math.max(recipes.length, 1));
  const week = plan.mode === 'week';
  const factor = priceFactor(plan.store);
  const total = (week ? recipes : recipes.slice(0, 1)).reduce(
    (sum, r) => sum + r.costPerServing * plan.servings * factor,
    0,
  );

  function swap(index: number) {
    if (!plan) return;
    const next = swapRecipe(plan.goal, plan.days, plan.days[index].recipeId);
    if (!next) {
      Alert.alert('No more options', 'You’ve seen every recipe for this goal.');
      return;
    }
    setPlan({ ...plan, days: plan.days.map((d, i) => (i === index ? { ...d, recipeId: next } : d)) });
  }

  function promote(index: number) {
    if (!plan) return;
    const ids = plan.days.map((d) => d.recipeId);
    const [picked] = ids.splice(index, 1);
    ids.unshift(picked);
    setPlan({ ...plan, days: plan.days.map((d, i) => ({ ...d, recipeId: ids[i] })) });
  }

  return (
    <ScrollView
      style={{ backgroundColor: t.background }}
      contentContainerStyle={{
        paddingTop: insets.top + space.lg,
        paddingHorizontal: space.xl,
        paddingBottom: 120,
        gap: space.xl,
      }}>
      <View style={{ gap: space.sm }}>
        <Title size={34}>{week ? 'This week' : 'Tonight'}</Title>
        <View style={styles.metaRow}>
          <Chip label={goal.short} icon={goal.icon} color={goal.color} selected />
          <Body muted style={{ fontSize: 14 }}>
            For {plan.servings} · {plan.store}
          </Body>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Stat icon="flame-outline" value={`${avg((r) => r.macrosPerServing.calories)}`} label="avg cal" />
        <Stat icon="barbell-outline" value={`${avg((r) => r.macrosPerServing.proteinGrams)}g`} label="avg protein" />
        <Stat icon="wallet-outline" value={formatPrice(total)} label={week ? 'est. total' : 'est. cost'} />
      </View>

      <View style={{ gap: space.md }}>
        {plan.days.map((day, i) => {
          const recipe = getRecipe(day.recipeId);
          if (!recipe) return null;
          return (
            <RecipeRow
              key={`${day.label}-${recipe.id}`}
              recipe={recipe}
              eyebrow={day.label}
              accessory={
                !week && i > 0 ? (
                  <IconButton
                    icon="arrow-up-circle-outline"
                    label={`Make ${recipe.title} tonight’s pick`}
                    onPress={() => promote(i)}
                  />
                ) : (
                  <IconButton icon="shuffle" label={`Swap ${day.label}`} onPress={() => swap(i)} size={18} />
                )
              }
            />
          );
        })}
        <Text style={{ color: t.textMuted, fontSize: 13, textAlign: 'center' }}>
          {week ? 'Tap shuffle to swap a dinner.' : 'Your shopping list uses the top pick.'} Prices are estimates for{' '}
          {plan.store}.
        </Text>
      </View>

      <View style={{ gap: space.md }}>
        <Button title="Open shopping list" icon="cart" onPress={() => router.navigate('/list')} />
        <Button title="Start a new plan" variant="secondary" icon="refresh" onPress={() => router.push('/new-plan')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
