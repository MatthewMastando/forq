import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { RecipeImage, RecipeRow } from '@/components/recipe-card';
import { Body, Button, IconButton, tap, Title } from '@/components/ui';
import { getRecipe } from '@/data';
import { formatMinutes, formatPrice, totalMinutes } from '@/lib/format';
import { getGoal, priceFactor } from '@/lib/options';
import { buildPlanFromPicks, dinnerCandidates, WEEKDAYS } from '@/lib/planner';
import { useStore } from '@/lib/store';
import { fonts, radius, space, useTheme } from '@/lib/theme';
import type { GoalId, Recipe } from '@/lib/types';

const TARGET = WEEKDAYS.length;

export default function Swipe() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ goal: GoalId; store: string; servings: string }>();
  const goal = params.goal ?? 'healthy';
  const store = params.store ?? 'Walmart';
  const servings = Number(params.servings) || 2;
  const { setPlan } = useStore();

  const deck = useMemo(() => dinnerCandidates(goal), [goal]);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [reviewing, setReviewing] = useState(false);

  const current = deck[index];
  const next = deck[index + 1];
  const done = reviewing || picks.length >= TARGET || !current;

  function decide(liked: boolean) {
    if (!current) return;
    Haptics.impactAsync(liked ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (liked) setPicks((p) => [...p, current.id]);
    setIndex((i) => i + 1);
  }

  function finish() {
    setPlan({
      goal,
      store,
      servings,
      mode: 'week',
      days: buildPlanFromPicks(goal, picks),
      createdAt: new Date().toISOString(),
    });
    router.dismissAll();
    router.navigate('/plan');
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <View style={[styles.top, { paddingTop: Math.max(insets.top, space.lg) }]}>
        <IconButton icon="close" label="Close" onPress={() => router.back()} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={{ color: t.text, fontWeight: '700', fontSize: 15, textAlign: 'center' }}>
            {picks.length} of {TARGET} dinners picked
          </Text>
          <View style={styles.progress}>
            {WEEKDAYS.map((d, i) => (
              <View
                key={d}
                style={[styles.progressSeg, { backgroundColor: i < picks.length ? t.accent : t.surfaceAlt }]}
              />
            ))}
          </View>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {done ? (
        <Review
          picks={picks}
          goal={goal}
          servings={servings}
          store={store}
          canKeepSwiping={!!current && picks.length < TARGET}
          onKeepSwiping={() => setReviewing(false)}
          onFinish={finish}
        />
      ) : (
        <>
          <View style={styles.deck}>
            {next && <Card key={next.id} recipe={next} width={width - space.xl * 2} behind />}
            <SwipeCard key={current.id} recipe={current} width={width - space.xl * 2} onDecide={decide} />
          </View>
          <View style={{ paddingBottom: Math.max(insets.bottom, space.lg), gap: space.sm }}>
            <View style={styles.actions}>
              <RoundButton icon="close" label="Skip" color="#78716C" onPress={() => decide(false)} />
              <RoundButton
                icon="information"
                label="See recipe"
                color={t.textMuted}
                small
                onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: current.id } })}
              />
              <RoundButton icon="heart" label="Add to my week" color={t.accent} onPress={() => decide(true)} />
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={picks.length === 0}
              onPress={() => {
                tap();
                setReviewing(true);
              }}
              style={[styles.reviewLink, { opacity: picks.length > 0 ? 1 : 0 }]}>
              <Text style={{ color: t.textMuted, fontWeight: '600' }}>Done? Review my picks</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const SWIPE_OUT = 600;

function SwipeCard({ recipe, width, onDecide }: { recipe: Recipe; width: number; onDecide: (liked: boolean) => void }) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const threshold = width * 0.3;

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY;
    })
    .onEnd((e) => {
      const fling = Math.abs(e.velocityX) > 800;
      if (Math.abs(x.value) > threshold || fling) {
        const liked = (fling ? e.velocityX : x.value) > 0;
        x.value = withTiming(liked ? SWIPE_OUT : -SWIPE_OUT, { duration: 200 }, () => {
          scheduleOnRN(onDecide, liked);
        });
      } else {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value * 0.3 },
      { rotate: `${interpolate(x.value, [-width, width], [-12, 12])}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[StyleSheet.absoluteFill, style]}>
        <Card recipe={recipe} width={width} drag={x} />
      </Animated.View>
    </GestureDetector>
  );
}

function Card({
  recipe,
  width,
  behind,
  drag,
}: {
  recipe: Recipe;
  width: number;
  behind?: boolean;
  drag?: SharedValue<number>;
}) {
  const goal = getGoal(recipe.goals[0]);
  const likeStyle = useAnimatedStyle(() => ({
    opacity: drag ? interpolate(drag.value, [0, width * 0.25], [0, 1], 'clamp') : 0,
  }));
  const nopeStyle = useAnimatedStyle(() => ({
    opacity: drag ? interpolate(drag.value, [-width * 0.25, 0], [1, 0], 'clamp') : 0,
  }));

  return (
    <View
      accessible
      accessibilityLabel={`${recipe.title}. ${recipe.description}`}
      style={[styles.card, behind && styles.behind]}>
      <RecipeImage recipe={recipe} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.85)']} locations={[0.4, 1]} style={styles.shade}>
        <View style={[styles.goalPill, { backgroundColor: goal.color }]}>
          <Ionicons name={goal.icon} size={12} color="#fff" />
          <Text style={styles.goalPillText}>{goal.short}</Text>
        </View>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {recipe.description}
        </Text>
        <Text style={styles.meta}>
          {recipe.cuisine} · {formatMinutes(totalMinutes(recipe))} · {recipe.macrosPerServing.calories} cal ·{' '}
          {formatPrice(recipe.costPerServing)}/serving
        </Text>
      </LinearGradient>
      {drag && (
        <>
          <Animated.View style={[styles.stamp, styles.stampLike, likeStyle]}>
            <Text style={[styles.stampText, { color: '#4CC38A' }]}>YUM</Text>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.stampNope, nopeStyle]}>
            <Text style={[styles.stampText, { color: '#FF6B6B' }]}>NOPE</Text>
          </Animated.View>
        </>
      )}
    </View>
  );
}

function RoundButton({
  icon,
  label,
  color,
  small,
  onPress,
}: {
  icon: 'close' | 'heart' | 'information';
  label: string;
  color: string;
  small?: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  const size = small ? 52 : 68;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.round,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: t.surface,
          borderColor: t.border,
          transform: [{ scale: pressed ? 0.92 : 1 }],
        },
      ]}>
      <Ionicons name={icon} size={small ? 24 : 32} color={color} />
    </Pressable>
  );
}

function Review({
  picks,
  goal,
  servings,
  store,
  canKeepSwiping,
  onKeepSwiping,
  onFinish,
}: {
  picks: string[];
  goal: GoalId;
  servings: number;
  store: string;
  canKeepSwiping: boolean;
  onKeepSwiping: () => void;
  onFinish: () => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const recipes = picks.map(getRecipe).filter((r): r is Recipe => !!r);
  const missing = TARGET - recipes.length;
  const cost = recipes.reduce((sum, r) => sum + r.costPerServing * servings * priceFactor(store), 0);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.lg, paddingBottom: 180 }}>
        <View style={{ gap: space.xs }}>
          <Title>{missing > 0 ? 'Good picks so far' : 'Your week is picked'}</Title>
          <Body muted>
            {recipes.length === 0
              ? `Nothing caught your eye? We’ll pick seven ${getGoal(goal).short.toLowerCase()} dinners for you.`
              : missing > 0
                ? `You liked ${recipes.length}. We’ll fill the other ${missing} with ${getGoal(goal).short.toLowerCase()} dinners.`
                : `About ${formatPrice(cost)} at ${store} for ${servings}. Your shopping list is built from these.`}
          </Body>
        </View>
        <View style={{ gap: space.sm }}>
          {recipes.map((r) => (
            <RecipeRow key={r.id} recipe={r} />
          ))}
        </View>
      </ScrollView>
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, space.lg), backgroundColor: t.background, borderTopColor: t.border },
        ]}>
        {canKeepSwiping && (
          <Button title="Keep swiping" variant="secondary" onPress={onKeepSwiping} style={{ flex: 1 }} />
        )}
        <Button title="Build my week" icon="calendar" onPress={onFinish} style={{ flex: 2 }} />
      </View>
    </View>
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
  progress: { flexDirection: 'row', gap: 4 },
  progressSeg: { flex: 1, height: 5, borderRadius: 3 },
  deck: { flex: 1, marginHorizontal: space.xl, marginTop: space.md, marginBottom: space.lg },
  card: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  behind: { transform: [{ scale: 0.95 }, { translateY: 14 }], opacity: 0.9 },
  shade: { flex: 1, justifyContent: 'flex-end', padding: space.xl, gap: space.sm },
  goalPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  goalPillText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  title: { color: '#fff', fontFamily: fonts.display, fontSize: 30, lineHeight: 34 },
  desc: { color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 21 },
  meta: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },
  stamp: { position: 'absolute', top: 40, borderWidth: 4, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  stampLike: { left: 24, borderColor: '#4CC38A', transform: [{ rotate: '-14deg' }] },
  stampNope: { right: 24, borderColor: '#FF6B6B', transform: [{ rotate: '14deg' }] },
  stampText: { fontSize: 34, fontWeight: '900', letterSpacing: 2 },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: space.xl },
  round: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  reviewLink: { alignSelf: 'center', padding: space.sm },
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
