import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, Button, EmptyState, IconButton, Title, tap } from '@/components/ui';
import { getRecipe } from '@/data';
import { buildShoppingList, groupByAisle, listItemLabel, shoppingListToText, type ListItem } from '@/lib/format';
import { useStore } from '@/lib/store';
import { radius, space, useTheme } from '@/lib/theme';
import type { Recipe } from '@/lib/types';

export default function ListScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { plan, extraList, checked, toggleChecked, clearChecked, removeFromList } = useStore();
  const [showStaples, setShowStaples] = useState(false);

  const entries = useMemo(() => {
    const fromPlan = (plan?.mode === 'week' ? plan.days : plan?.days.slice(0, 1)) ?? [];
    const list: { recipe: Recipe; servings: number; extra: boolean }[] = [];
    for (const d of fromPlan) {
      const recipe = getRecipe(d.recipeId);
      if (recipe) list.push({ recipe, servings: plan!.servings, extra: false });
    }
    for (const e of extraList) {
      const recipe = getRecipe(e.recipeId);
      if (recipe && !list.some((l) => l.recipe.id === recipe.id))
        list.push({ recipe, servings: e.servings, extra: true });
    }
    return list;
  }, [plan, extraList]);

  const items = useMemo(() => buildShoppingList(entries), [entries]);
  const checkedSet = useMemo(() => new Set(checked), [checked]);
  const toBuy = items.filter((i) => !i.staple);
  const staples = items.filter((i) => i.staple);
  const done = toBuy.filter((i) => checkedSet.has(i.key)).length;

  if (entries.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: t.background, paddingTop: insets.top + space.xxl }}>
        <EmptyState
          icon="cart-outline"
          title="Your list is empty"
          body="Build a plan or add any recipe to your list, and we’ll combine the ingredients by aisle."
          action={<Button title="Build a plan" icon="sparkles" onPress={() => router.push('/new-plan')} />}
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
        gap: space.xl,
      }}>
      <View style={{ gap: space.md }}>
        <View style={styles.headerRow}>
          <Title size={34}>Shopping list</Title>
          <IconButton
            icon="share-outline"
            label="Share list"
            onPress={() => Share.share({ message: shoppingListToText(items, checkedSet) })}
          />
        </View>
        <Body muted>
          {done} of {toBuy.length} items · {entries.length} recipe{entries.length === 1 ? '' : 's'}
        </Body>
        <View style={[styles.progressTrack, { backgroundColor: t.surfaceAlt }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: t.success, width: `${(done / Math.max(toBuy.length, 1)) * 100}%` },
            ]}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
          {entries.map(({ recipe, extra }) => (
            <View key={recipe.id} style={[styles.recipePill, { backgroundColor: t.surface, borderColor: t.border }]}>
              <Text style={{ color: t.text, fontSize: 13, fontWeight: '600', maxWidth: 180 }} numberOfLines={1}>
                {recipe.title}
              </Text>
              {extra ? (
                <Pressable
                  hitSlop={8}
                  accessibilityLabel={`Remove ${recipe.title} from list`}
                  onPress={() => removeFromList(recipe.id)}>
                  <Ionicons name="close-circle" size={16} color={t.textMuted} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </ScrollView>
      </View>

      {groupByAisle(toBuy).map((group) => (
        <View key={group.aisle} style={{ gap: space.xs }}>
          <Text style={[styles.aisle, { color: t.textMuted }]}>{group.aisle.toUpperCase()}</Text>
          <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
            {group.items.map((item, i) => (
              <Row
                key={item.key}
                item={item}
                checked={checkedSet.has(item.key)}
                last={i === group.items.length - 1}
                onToggle={() => toggleChecked(item.key)}
              />
            ))}
          </View>
        </View>
      ))}

      {staples.length > 0 && (
        <Pressable
          onPress={() => {
            tap();
            setShowStaples((s) => !s);
          }}
          style={[styles.card, styles.staples, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={styles.headerRow}>
            <Text style={{ color: t.text, fontWeight: '700', fontSize: 15 }}>Probably in your pantry</Text>
            <Ionicons name={showStaples ? 'chevron-up' : 'chevron-down'} size={18} color={t.textMuted} />
          </View>
          {showStaples && (
            <Body muted style={{ fontSize: 14 }}>
              {staples.map((s) => listItemLabel(s)).join(' · ')}
            </Body>
          )}
        </Pressable>
      )}

      {done > 0 && <Button title="Uncheck all" variant="ghost" icon="refresh" onPress={clearChecked} />}
    </ScrollView>
  );
}

function Row({
  item,
  checked,
  last,
  onToggle,
}: {
  item: ListItem;
  checked: boolean;
  last: boolean;
  onToggle: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => {
        tap();
        onToggle();
      }}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: t.border,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      <Ionicons
        name={checked ? 'checkmark-circle' : 'ellipse-outline'}
        size={24}
        color={checked ? t.success : t.border}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: checked ? t.textMuted : t.text,
            fontSize: 16,
            textDecorationLine: checked ? 'line-through' : 'none',
          }}>
          {listItemLabel(item)}
        </Text>
        {item.recipes.length > 1 && (
          <Text style={{ color: t.textMuted, fontSize: 12 }} numberOfLines={1}>
            For {item.recipes.length} recipes
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  recipePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  aisle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginLeft: 4 },
  card: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 13 },
  staples: { paddingVertical: space.md, gap: space.sm },
});
