import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Heading, Muted } from '@/components/ui';
import { usePlan } from '@/lib/plan-store';
import { useTheme } from '@/lib/theme';

export default function Home() {
  const t = useTheme();
  const { result } = usePlan();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ gap: 8 }}>
        <Heading>What are we cooking?</Heading>
        <Muted>Pick a goal, where you shop, and who you’re feeding. Forq does the rest.</Muted>
      </View>

      <Button title="Start a new plan" onPress={() => router.push('/new')} />

      {result ? (
        <Card>
          <Text style={{ color: t.text, fontWeight: '600', fontSize: 17 }}>Your latest plan</Text>
          <Muted>
            {result.recipes.length} recipe{result.recipes.length === 1 ? '' : 's'} · {result.shoppingList.length}{' '}
            items to buy
          </Muted>
          <View style={{ height: 8 }} />
          <Button title="Open plan" variant="secondary" onPress={() => router.push('/results')} />
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 20 },
});
