import { Link, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Heading, Muted } from '@/components/ui';
import { usePlan } from '@/lib/plan-store';
import { useTheme } from '@/lib/theme';
import type { Recipe } from '@/lib/types';

export default function Results() {
  const t = useTheme();
  const { result, request } = usePlan();

  if (!result || !request) {
    return (
      <View style={styles.container}>
        <Muted>No plan yet.</Muted>
        <Button title="Start a new plan" onPress={() => router.replace('/new')} />
      </View>
    );
  }

  const byId = new Map(result.recipes.map((r) => [r.id, r]));
  const week = request.mode === 'week' && result.plan.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Heading>{week ? 'Your week' : 'Tonight’s pick'}</Heading>
      <Muted>
        For {request.servings} {request.servings === 1 ? 'person' : 'people'} · shopping at {request.store}
      </Muted>

      {week
        ? result.plan.map((day) => (
            <View key={day.day} style={{ gap: 8 }}>
              <Text style={{ color: t.muted, fontWeight: '700', textTransform: 'uppercase' }}>{day.day}</Text>
              {day.recipeIds.map((id) => {
                const recipe = byId.get(id);
                return recipe ? <RecipeRow key={id} recipe={recipe} /> : null;
              })}
            </View>
          ))
        : result.recipes.map((r) => <RecipeRow key={r.id} recipe={r} />)}

      <Button title={`Shopping list (${result.shoppingList.length})`} onPress={() => router.push('/shopping-list')} />
    </ScrollView>
  );
}

function RecipeRow({ recipe }: { recipe: Recipe }) {
  const t = useTheme();
  return (
    <Link href={{ pathname: '/recipe/[id]', params: { id: recipe.id } }} asChild>
      <Pressable>
        <Card>
          <Text style={{ color: t.text, fontSize: 18, fontWeight: '600' }}>{recipe.title}</Text>
          <Muted>
            {recipe.prepMinutes + recipe.cookMinutes} min · {recipe.macrosPerServing.calories} cal ·{' '}
            {recipe.macrosPerServing.proteinGrams}g protein · ~${recipe.estimatedCostPerServing.toFixed(2)}/serving
          </Muted>
        </Card>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
});
