import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Heading, Muted } from '@/components/ui';
import { publishRecipe } from '@/lib/api';
import { recipeToText } from '@/lib/format';
import { usePlan } from '@/lib/plan-store';
import { useTheme } from '@/lib/theme';

export default function RecipeScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { result } = usePlan();
  const recipe = result?.recipes.find((r) => r.id === id);
  const [link, setLink] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Muted>Recipe not found.</Muted>
      </View>
    );
  }

  // The iOS share sheet covers Apple Notes ("Notes"), Messages, Mail, and Reminders.
  const shareText = () => Share.share({ message: recipeToText(recipe, link ?? undefined) });

  async function shareLink() {
    if (!recipe) return;
    setSharing(true);
    try {
      const url = link ?? (await publishRecipe(recipe)).url;
      setLink(url);
      await Share.share({ message: `${recipe.title} on Forq`, url });
    } catch (e) {
      Alert.alert('Couldn’t create a link', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSharing(false);
    }
  }

  const m = recipe.macrosPerServing;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: '' }} />
      <Heading>{recipe.title}</Heading>
      <Muted>{recipe.description}</Muted>

      <Card>
        <Text style={{ color: t.text }}>
          Serves {recipe.servings} · {recipe.prepMinutes} min prep · {recipe.cookMinutes} min cook
        </Text>
        <Text style={{ color: t.text }}>
          {m.calories} cal · {m.proteinGrams}g protein · {m.carbsGrams}g carbs · {m.fatGrams}g fat (per serving)
        </Text>
        <Text style={{ color: t.text }}>~${recipe.estimatedCostPerServing.toFixed(2)} per serving</Text>
        <Text style={{ color: t.muted, marginTop: 4 }}>{recipe.whyItFitsGoal}</Text>
      </Card>

      <Section title="Ingredients">
        {recipe.ingredients.map((i, n) => (
          <Text key={n} style={[styles.line, { color: t.text }]}>
            • {i.quantity} {i.name}
          </Text>
        ))}
      </Section>

      <Section title="Steps">
        {recipe.steps.map((s, n) => (
          <Text key={n} style={[styles.line, { color: t.text }]}>
            {n + 1}. {s}
          </Text>
        ))}
      </Section>

      <View style={{ gap: 12, marginTop: 8 }}>
        <Button title="Share link" onPress={shareLink} loading={sharing} />
        <Button title="Send to Notes / Messages" variant="secondary" onPress={shareText} />
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: t.text, fontSize: 20, fontWeight: '700' }}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, paddingBottom: 48 },
  line: { fontSize: 16, lineHeight: 23 },
});
