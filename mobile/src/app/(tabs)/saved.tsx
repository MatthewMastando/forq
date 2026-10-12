import { router } from 'expo-router';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RecipeTile } from '@/components/recipe-card';
import { Body, Button, EmptyState, Title } from '@/components/ui';
import { getRecipe } from '@/data';
import { useStore } from '@/lib/store';
import { space, useTheme } from '@/lib/theme';
import type { Recipe } from '@/lib/types';

export default function SavedScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { savedIds } = useStore();
  const saved = savedIds.map(getRecipe).filter((r): r is Recipe => !!r);
  const tileWidth = (width - space.xl * 2 - space.lg) / 2;

  if (saved.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: t.background, paddingTop: insets.top + space.xxl }}>
        <EmptyState
          icon="heart-outline"
          title="Nothing saved yet"
          body="Tap the heart on any recipe to keep it here."
          action={<Button title="Browse recipes" variant="secondary" onPress={() => router.navigate('/')} />}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: t.background }}
      contentContainerStyle={{
        paddingTop: insets.top + space.lg,
        paddingHorizontal: space.xl,
        paddingBottom: 120,
        gap: space.lg,
      }}>
      <View style={{ gap: space.xs }}>
        <Title size={34}>Saved</Title>
        <Body muted>
          {saved.length} recipe{saved.length === 1 ? '' : 's'}
        </Body>
      </View>
      <View style={styles.grid}>
        {saved.map((r) => (
          <RecipeTile key={r.id} recipe={r} width={tileWidth} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg, rowGap: space.xl },
});
