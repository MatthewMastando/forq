import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Heading, Muted, OptionCard } from '@/components/ui';
import { generate } from '@/lib/api';
import { GOALS, STORES } from '@/lib/options';
import { usePlan } from '@/lib/plan-store';
import { useTheme } from '@/lib/theme';
import type { GenerateRequest, GoalId, Mode } from '@/lib/types';

const STEPS = ['Goal', 'Store', 'Servings', 'Plan'] as const;

export default function NewPlan() {
  const t = useTheme();
  const { setPlan } = usePlan();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [store, setStore] = useState<string>(STORES[0]);
  const [servings, setServings] = useState(2);
  const [mode, setMode] = useState<Mode>('single');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const canContinue = step !== 0 || goal !== null;
  const isLast = step === STEPS.length - 1;

  async function submit() {
    if (!goal) return;
    const request: GenerateRequest = { goal, store, servings, mode, notes: notes.trim() || undefined };
    setLoading(true);
    try {
      const result = await generate(request);
      setPlan(request, result);
      router.replace('/results');
    } catch (e) {
      Alert.alert('Couldn’t build your plan', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={{ color: t.muted, fontWeight: '600' }}>
          Step {step + 1} of {STEPS.length}
        </Text>

        {step === 0 && (
          <>
            <Heading>What’s your goal?</Heading>
            {GOALS.map((g) => (
              <OptionCard
                key={g.id}
                title={g.label}
                subtitle={g.blurb}
                emoji={g.emoji}
                selected={goal === g.id}
                onPress={() => setGoal(g.id)}
              />
            ))}
          </>
        )}

        {step === 1 && (
          <>
            <Heading>Where do you shop?</Heading>
            <Muted>We’ll lean on what that store carries and how it prices things.</Muted>
            {STORES.map((s) => (
              <OptionCard key={s} title={s} selected={store === s} onPress={() => setStore(s)} />
            ))}
          </>
        )}

        {step === 2 && (
          <>
            <Heading>How many people?</Heading>
            <View style={styles.stepper}>
              <Stepper label="−" onPress={() => setServings((n) => Math.max(1, n - 1))} />
              <Text style={[styles.count, { color: t.text }]}>{servings}</Text>
              <Stepper label="+" onPress={() => setServings((n) => Math.min(12, n + 1))} />
            </View>
            <Muted>Recipes and the shopping list are scaled to this.</Muted>
          </>
        )}

        {step === 3 && (
          <>
            <Heading>How much should we plan?</Heading>
            <OptionCard
              title="One recipe"
              subtitle="Something to cook tonight"
              emoji="🍳"
              selected={mode === 'single'}
              onPress={() => setMode('single')}
            />
            <OptionCard
              title="A week of dinners"
              subtitle="7 dinners plus one combined shopping list"
              emoji="🗓️"
              selected={mode === 'week'}
              onPress={() => setMode('week')}
            />
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything else? (allergies, no mushrooms, have chicken to use up…)"
              placeholderTextColor={t.muted}
              multiline
              style={[styles.notes, { color: t.text, borderColor: t.border, backgroundColor: t.card }]}
            />
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderColor: t.border, backgroundColor: t.background }]}>
        {step > 0 && (
          <View style={{ flex: 1 }}>
            <Button title="Back" variant="secondary" onPress={() => setStep((s) => s - 1)} disabled={loading} />
          </View>
        )}
        <View style={{ flex: 2 }}>
          <Button
            title={isLast ? (mode === 'week' ? 'Build my week' : 'Get a recipe') : 'Continue'}
            onPress={isLast ? submit : () => setStep((s) => s + 1)}
            disabled={!canContinue}
            loading={loading}
          />
        </View>
      </View>
    </View>
  );
}

function Stepper({ label, onPress }: { label: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label === '+' ? 'More people' : 'Fewer people'}
      onPress={onPress}
      style={[styles.stepButton, { borderColor: t.accent }]}>
      <Text style={{ color: t.accent, fontSize: 28, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32, marginVertical: 24 },
  stepButton: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  count: { fontSize: 48, fontWeight: '700', minWidth: 60, textAlign: 'center' },
  notes: { borderWidth: 1, borderRadius: 14, padding: 14, minHeight: 80, fontSize: 15, marginTop: 8 },
  footer: { flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 36, borderTopWidth: StyleSheet.hairlineWidth },
});
