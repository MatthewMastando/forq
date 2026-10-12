import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RecipeImage } from '@/components/recipe-card';
import { Body, Button, Chip, EmptyState, IconButton, SectionTitle, Stat, Stepper, Title, tap } from '@/components/ui';
import { getRecipe } from '@/data';
import { publishRecipe, sharingLinksEnabled } from '@/lib/api';
import { formatIngredient, formatMinutes, formatPrice, recipeToText } from '@/lib/format';
import { getGoal } from '@/lib/options';
import { useStore } from '@/lib/store';
import { radius, space, useTheme } from '@/lib/theme';

export default function RecipeScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = getRecipe(id);
  const { savedIds, toggleSaved, addToList, plan } = useStore();
  const [servings, setServings] = useState(plan?.servings ?? recipe?.servings ?? 4);
  const [have, setHave] = useState<Set<number>>(new Set());
  const [added, setAdded] = useState(false);

  if (!recipe) {
    return (
      <View style={{ flex: 1, backgroundColor: t.background, paddingTop: insets.top + 80 }}>
        <EmptyState icon="alert-circle-outline" title="Recipe not found" body="It may have been removed." />
      </View>
    );
  }

  const saved = savedIds.includes(recipe.id);
  const scale = servings / recipe.servings;
  const m = recipe.macrosPerServing;

  async function share() {
    if (!recipe) return;
    if (sharingLinksEnabled) {
      try {
        const { url } = await publishRecipe(recipe);
        await Share.share({ message: `${recipe.title} on Forq`, url });
        return;
      } catch {
        // Fall back to sharing the recipe text.
      }
    }
    await Share.share({ message: recipeToText(recipe, servings) });
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <IconButton icon="share-outline" label="Share recipe" onImage onPress={share} size={20} />
              <IconButton
                icon={saved ? 'heart' : 'heart-outline'}
                label={saved ? 'Remove from saved' : 'Save recipe'}
                active={saved}
                onImage
                onPress={() => toggleSaved(recipe.id)}
                size={20}
              />
            </View>
          ),
        }}
      />
      <ScrollView
        style={{ backgroundColor: t.background }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}>
        <RecipeImage recipe={recipe} style={styles.hero}>
          <LinearGradient colors={['rgba(0,0,0,0.35)', 'transparent']} style={styles.heroTopShade} />
        </RecipeImage>

        <View style={[styles.sheet, { backgroundColor: t.background }]}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {recipe.goals.map((g) => {
              const goal = getGoal(g);
              return <Chip key={g} label={goal.short} icon={goal.icon} color={goal.color} selected />;
            })}
          </View>

          <View style={{ gap: space.sm }}>
            <Title>{recipe.title}</Title>
            <Body muted>{recipe.description}</Body>
          </View>

          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Stat icon="time-outline" value={formatMinutes(recipe.prepMinutes + recipe.cookMinutes)} label="total" />
            <Stat icon="flame-outline" value={`${m.calories}`} label="calories" />
            <Stat icon="barbell-outline" value={`${m.proteinGrams}g`} label="protein" />
            <Stat icon="pricetag-outline" value={formatPrice(recipe.costPerServing)} label="per serving" />
          </View>

          <Text style={{ color: t.textMuted, fontSize: 13, textAlign: 'center' }}>
            Per serving: {m.carbsGrams}g carbs · {m.fatGrams}g fat · {m.fiberGrams}g fiber · {recipe.prepMinutes} min
            prep
          </Text>

          <View style={{ gap: space.md }}>
            <SectionTitle action={<Stepper value={servings} onChange={setServings} label="servings" />}>
              Ingredients
            </SectionTitle>
            <Body muted style={{ fontSize: 14, marginTop: -8 }}>
              For {servings} {servings === 1 ? 'serving' : 'servings'}. Tap what you already have.
            </Body>
            <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
              {recipe.ingredients.map((ing, i) => {
                const got = have.has(i);
                return (
                  <Pressable
                    key={i}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: got }}
                    onPress={() => {
                      tap();
                      setHave((prev) => {
                        const next = new Set(prev);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        return next;
                      });
                    }}
                    style={[
                      styles.ingredient,
                      {
                        borderBottomColor: t.border,
                        borderBottomWidth: i === recipe.ingredients.length - 1 ? 0 : StyleSheet.hairlineWidth,
                      },
                    ]}>
                    <Ionicons
                      name={got ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={got ? t.success : t.border}
                    />
                    <Text style={{ flex: 1, fontSize: 16, color: got ? t.textMuted : t.text }}>
                      {formatIngredient(ing, scale)}
                      {ing.note ? <Text style={{ color: t.textMuted }}>{`, ${ing.note}`}</Text> : null}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Button
              title={added ? 'Added to your list' : 'Add to shopping list'}
              icon={added ? 'checkmark' : 'cart-outline'}
              variant="secondary"
              onPress={() => {
                addToList(recipe.id, servings);
                setAdded(true);
              }}
            />
          </View>

          <View style={{ gap: space.md }}>
            <SectionTitle>Steps</SectionTitle>
            {recipe.steps.map((step, i) => (
              <View key={i} style={styles.step}>
                <View style={[styles.stepNum, { backgroundColor: t.accentSoft }]}>
                  <Text style={{ color: t.accent, fontWeight: '800' }}>{i + 1}</Text>
                </View>
                <Body style={{ flex: 1 }}>{step}</Body>
              </View>
            ))}
          </View>

          <Button title="Share recipe" icon="share-outline" onPress={share} />
          <Text style={{ color: t.textMuted, fontSize: 13, textAlign: 'center' }}>
            Send to Notes, Messages, or Mail from the share sheet.
          </Text>

          {recipe.image ? (
            <Text
              style={{ color: t.textMuted, fontSize: 12, textAlign: 'center' }}
              onPress={() =>
                Linking.openURL(
                  `https://unsplash.com/@${recipe.image!.photographerUsername}?utm_source=forq&utm_medium=referral`,
                ).catch(() => Alert.alert('Couldn’t open link'))
              }>
              Photo by {recipe.image.photographer} on Unsplash
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { height: 380 },
  heroTopShade: { height: 140 },
  sheet: {
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    gap: space.xl,
  },
  card: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.md },
  ingredient: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 12 },
  step: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  stepNum: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: -2 },
});
