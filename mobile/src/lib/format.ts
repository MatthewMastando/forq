import type { Aisle, Ingredient, Recipe } from './types';

const FRACTIONS: [number, string][] = [
  [0.125, '⅛'],
  [0.25, '¼'],
  [1 / 3, '⅓'],
  [0.5, '½'],
  [2 / 3, '⅔'],
  [0.75, '¾'],
];

/** 1.5 -> "1½", 0.33 -> "⅓", 2.2 -> "2.2". */
export function formatAmount(n: number): string {
  const whole = Math.floor(n + 0.02);
  const frac = n - whole;
  if (frac < 0.06) return String(whole);
  const match = FRACTIONS.find(([v]) => Math.abs(v - frac) < 0.06);
  if (match) return whole > 0 ? `${whole}${match[1]}` : match[1];
  if (n >= 10) return String(Math.round(n));
  // Kitchen measures: snap to the nearest quarter rather than showing "2.1".
  const snapped = Math.max(0.25, Math.round(n * 4) / 4);
  return snapped === n ? String(n) : formatAmount(snapped);
}

export function formatIngredient(i: Ingredient, scale = 1): string {
  if (i.amount == null) return i.name;
  const qty = formatAmount(i.amount * scale);
  return [qty, i.unit, i.name].filter(Boolean).join(' ');
}

export function totalMinutes(r: Recipe): number {
  return r.prepMinutes + r.cookMinutes;
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

export function formatPrice(n: number): string {
  return `$${n.toFixed(2)}`;
}

export const STAPLES = new Set([
  'kosher salt',
  'salt',
  'black pepper',
  'water',
  'olive oil',
  'vegetable oil',
  'cooking spray',
]);

const AISLE_ORDER: Aisle[] = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Bakery',
  'Grains & Pasta',
  'Canned & Jarred',
  'Condiments & Sauces',
  'Pantry',
  'Spices',
  'Frozen',
];

const PLURAL_UNITS = ['cup', 'can', 'clove', 'slice', 'rib', 'stalk', 'head', 'pint', 'package', 'scoop'];

/** "cups" -> "cup", "15-oz cans" -> "15-oz can", so the same ingredient merges across recipes. */
function singularUnit(unit: string): string {
  const u = unit.trim().toLowerCase();
  const base = PLURAL_UNITS.find((p) => u === `${p}s` || u.endsWith(` ${p}s`) || u.endsWith(`-${p}s`));
  return base ? u.slice(0, -1) : u;
}

function pluralUnit(unit: string, amount: number): string {
  const base = PLURAL_UNITS.find((p) => unit === p || unit.endsWith(` ${p}`));
  return base && amount > 1 ? `${unit}s` : unit;
}

export interface ListItem {
  key: string;
  name: string;
  amount: number | null;
  unit: string;
  aisle: Aisle;
  recipes: string[];
  staple: boolean;
}

/** Combines ingredients across recipes (scaled to the servings each is cooked for) into one list. */
export function buildShoppingList(entries: { recipe: Recipe; servings: number }[]): ListItem[] {
  const items = new Map<string, ListItem>();
  for (const { recipe, servings } of entries) {
    const scale = servings / recipe.servings;
    for (const ing of recipe.ingredients) {
      const name = ing.name.toLowerCase();
      const unit = singularUnit(ing.unit);
      const key = `${name}|${unit}`;
      const existing = items.get(key);
      if (existing) {
        if (existing.amount != null && ing.amount != null) existing.amount += ing.amount * scale;
        if (!existing.recipes.includes(recipe.title)) existing.recipes.push(recipe.title);
      } else {
        items.set(key, {
          key,
          name: ing.name,
          amount: ing.amount == null ? null : ing.amount * scale,
          unit,
          aisle: ing.aisle,
          recipes: [recipe.title],
          staple: STAPLES.has(name),
        });
      }
    }
  }
  return [...items.values()].sort(
    (a, b) => AISLE_ORDER.indexOf(a.aisle) - AISLE_ORDER.indexOf(b.aisle) || a.name.localeCompare(b.name),
  );
}

export function groupByAisle(items: ListItem[]): { aisle: Aisle; items: ListItem[] }[] {
  const groups: { aisle: Aisle; items: ListItem[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.aisle === item.aisle) last.items.push(item);
    else groups.push({ aisle: item.aisle, items: [item] });
  }
  return groups;
}

// Things you buy whole: a plan that needs half an avocado still needs one avocado from the store.
const WHOLE_UNITS = new Set(['', 'can', 'clove', 'package', 'bunch', 'jar', 'head', 'loaf', 'slice', 'rib', 'stalk', 'medium', 'pint']);

export function listItemLabel(item: ListItem): string {
  if (item.amount == null) return item.name;
  const whole = WHOLE_UNITS.has(item.unit) || item.unit.endsWith(' can');
  const amount = whole ? Math.ceil(item.amount - 0.01) : item.amount;
  const name = item.unit === '' ? countNoun(item.name, amount) : item.name;
  return [formatAmount(amount), pluralUnit(item.unit, amount), name].filter(Boolean).join(' ');
}

/** "1 limes" -> "1 lime", "2 lemon" -> "2 lemons" for counted items. */
function countNoun(name: string, amount: number): string {
  const plural = /[^s]s$/.test(name);
  if (amount <= 1 && plural) {
    if (name.endsWith('oes')) return name.slice(0, -2);
    if (name.endsWith('ies')) return `${name.slice(0, -3)}y`;
    return name.slice(0, -1);
  }
  if (amount > 1 && !plural && !name.endsWith('s')) {
    if (/o$/.test(name)) return `${name}es`;
    return `${name}s`;
  }
  return name;
}

/** Plain text that reads well in Apple Notes, Messages, or email via the share sheet. */
export function recipeToText(recipe: Recipe, servings = recipe.servings): string {
  const scale = servings / recipe.servings;
  const m = recipe.macrosPerServing;
  return [
    recipe.title,
    recipe.description,
    '',
    `Serves ${servings} · ${formatMinutes(totalMinutes(recipe))} · ${m.calories} cal, ${m.proteinGrams}g protein per serving`,
    '',
    'INGREDIENTS',
    ...recipe.ingredients.map((i) => `• ${formatIngredient(i, scale)}${i.note ? ` (${i.note})` : ''}`),
    '',
    'STEPS',
    ...recipe.steps.map((s, n) => `${n + 1}. ${s}`),
    '',
    'Shared from Forq',
  ].join('\n');
}

export function shoppingListToText(items: ListItem[], checked: Set<string>): string {
  const lines = ['Forq shopping list', ''];
  for (const group of groupByAisle(items.filter((i) => !i.staple))) {
    lines.push(group.aisle.toUpperCase());
    for (const item of group.items) lines.push(`${checked.has(item.key) ? '✓' : '◻︎'} ${listItemLabel(item)}`);
    lines.push('');
  }
  const staples = items.filter((i) => i.staple);
  if (staples.length) lines.push(`Pantry staples: ${staples.map((s) => s.name).join(', ')}`);
  return lines.join('\n');
}
