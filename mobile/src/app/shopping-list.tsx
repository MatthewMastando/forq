import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { Button, Muted } from '@/components/ui';
import { groupByAisle, shoppingListToText } from '@/lib/format';
import { usePlan } from '@/lib/plan-store';
import { useTheme } from '@/lib/theme';

export default function ShoppingList() {
  const t = useTheme();
  const { result } = usePlan();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const items = result?.shoppingList ?? [];

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Muted>Nothing to buy yet.</Muted>
      </View>
    );
  }

  const toggle = (key: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {groupByAisle(items).map(([aisle, list]) => (
        <View key={aisle} style={{ gap: 4 }}>
          <Text style={{ color: t.muted, fontWeight: '700', textTransform: 'uppercase' }}>{aisle}</Text>
          {list.map((item) => {
            const key = `${aisle}:${item.name}`;
            const done = checked.has(key);
            return (
              <Pressable
                key={key}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                onPress={() => toggle(key)}
                style={styles.row}>
                <Text style={{ color: done ? t.accent : t.muted, fontSize: 20 }}>{done ? '☑' : '☐'}</Text>
                <Text
                  style={{
                    color: done ? t.muted : t.text,
                    fontSize: 16,
                    flex: 1,
                    textDecorationLine: done ? 'line-through' : 'none',
                  }}>
                  {item.quantity} {item.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
      <Button
        title="Send to Notes / Reminders"
        variant="secondary"
        onPress={() => Share.share({ message: shoppingListToText(items) })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 20, paddingBottom: 48 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
});
