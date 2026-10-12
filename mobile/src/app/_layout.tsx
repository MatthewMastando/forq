import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { PlanProvider } from '@/lib/plan-store';
import { useTheme } from '@/lib/theme';

export default function RootLayout() {
  const t = useTheme();
  return (
    <PlanProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerTintColor: t.accent,
          headerStyle: { backgroundColor: t.background },
          headerTitleStyle: { color: t.text },
          contentStyle: { backgroundColor: t.background },
        }}>
        <Stack.Screen name="index" options={{ title: 'Forq' }} />
        <Stack.Screen name="new" options={{ title: 'New plan' }} />
        <Stack.Screen name="results" options={{ title: 'Your plan' }} />
        <Stack.Screen name="recipe/[id]" options={{ title: 'Recipe' }} />
        <Stack.Screen name="shopping-list" options={{ title: 'Shopping list' }} />
      </Stack>
    </PlanProvider>
  );
}
