import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { formatMinutes, formatPrice, totalMinutes } from '@/lib/format';
import { getGoal } from '@/lib/options';
import { fonts, radius, space, useTheme } from '@/lib/theme';
import type { Recipe } from '@/lib/types';

export function RecipeImage({
  recipe,
  style,
  children,
}: {
  recipe: Recipe;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const t = useTheme();
  const goal = getGoal(recipe.goals[0]);
  return (
    <View style={[{ overflow: 'hidden', backgroundColor: t.surfaceAlt }, style]}>
      {recipe.image ? (
        <Image
          source={{ uri: recipe.image.url }}
          alt={recipe.image.alt}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback, { backgroundColor: goal.color }]}>
          <Ionicons name="restaurant" size={36} color="rgba(255,255,255,0.85)" />
        </View>
      )}
      {children}
    </View>
  );
}

function open(recipe: Recipe) {
  router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } });
}

function Meta({ recipe, light }: { recipe: Recipe; light?: boolean }) {
  const t = useTheme();
  const color = light ? 'rgba(255,255,255,0.9)' : t.textMuted;
  return (
    <Text style={{ color, fontSize: 13, fontWeight: '500' }} numberOfLines={1}>
      {formatMinutes(totalMinutes(recipe))} · {recipe.macrosPerServing.calories} cal ·{' '}
      {recipe.macrosPerServing.proteinGrams}g protein
    </Text>
  );
}

/** Big photo card with the title over a gradient, for carousels. */
export function FeatureCard({ recipe, width }: { recipe: Recipe; width: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={recipe.title}
      onPress={() => open(recipe)}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      <RecipeImage recipe={recipe} style={[styles.feature, { width }]}>
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.featureShade}>
          <Text style={styles.featureTitle} numberOfLines={2}>
            {recipe.title}
          </Text>
          <Meta recipe={recipe} light />
        </LinearGradient>
      </RecipeImage>
    </Pressable>
  );
}

/** Grid tile: photo with title and quick facts underneath. */
export function RecipeTile({ recipe, width }: { recipe: Recipe; width: number }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={recipe.title}
      onPress={() => open(recipe)}
      style={({ pressed }) => [{ width, gap: 6, opacity: pressed ? 0.85 : 1 }]}>
      <RecipeImage recipe={recipe} style={[styles.tileImage, { height: width * 0.8 }]}>
        <View style={styles.tileBadge}>
          <Text style={styles.tileBadgeText}>{formatPrice(recipe.costPerServing)}</Text>
        </View>
      </RecipeImage>
      <Text style={{ color: t.text, fontWeight: '700', fontSize: 15, lineHeight: 19 }} numberOfLines={2}>
        {recipe.title}
      </Text>
      <Text style={{ color: t.textMuted, fontSize: 13 }} numberOfLines={1}>
        {formatMinutes(totalMinutes(recipe))} · {recipe.macrosPerServing.calories} cal
      </Text>
    </Pressable>
  );
}

/** Compact row with a thumbnail, for plans and lists. */
export function RecipeRow({ recipe, eyebrow, accessory }: { recipe: Recipe; eyebrow?: string; accessory?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: t.surface, borderColor: t.border }]}>
      <Pressable
        accessibilityRole="button"
        onPress={() => open(recipe)}
        accessibilityLabel={`${eyebrow ? `${eyebrow}: ` : ''}${recipe.title}`}
        style={({ pressed }) => [styles.rowMain, { opacity: pressed ? 0.8 : 1 }]}>
        <RecipeImage recipe={recipe} style={styles.thumb} />
        <View style={{ flex: 1, gap: 3 }}>
          {eyebrow ? (
            <Text style={{ color: t.accent, fontSize: 12, fontWeight: '700', letterSpacing: 0.6 }}>
              {eyebrow.toUpperCase()}
            </Text>
          ) : null}
          <Text style={{ color: t.text, fontWeight: '700', fontSize: 16 }} numberOfLines={2}>
            {recipe.title}
          </Text>
          <Meta recipe={recipe} />
        </View>
      </Pressable>
      {accessory}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  feature: { height: 260, borderRadius: radius.lg, justifyContent: 'flex-end' },
  featureShade: { padding: space.lg, paddingTop: 60, gap: 4 },
  featureTitle: { color: '#fff', fontFamily: fonts.display, fontSize: 24, lineHeight: 28 },
  tileImage: { borderRadius: radius.md },
  tileBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tileBadgeText: { color: '#1C1917', fontSize: 12, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingRight: space.md,
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.sm },
  thumb: { width: 76, height: 76, borderRadius: radius.sm },
});
