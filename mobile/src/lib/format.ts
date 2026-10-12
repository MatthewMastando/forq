import type { Recipe, ShoppingItem } from './types';

/** Plain-text recipe that reads well in Apple Notes, Messages, or email via the share sheet. */
export function recipeToText(recipe: Recipe, link?: string): string {
  const lines = [
    recipe.title,
    '',
    recipe.description,
    '',
    `Serves ${recipe.servings} · ${recipe.prepMinutes + recipe.cookMinutes} min · ~$${recipe.estimatedCostPerServing.toFixed(2)}/serving`,
    `${recipe.macrosPerServing.calories} cal · ${recipe.macrosPerServing.proteinGrams}g protein per serving`,
    '',
    'Ingredients',
    ...recipe.ingredients.map((i) => `• ${i.quantity} ${i.name}`),
    '',
    'Steps',
    ...recipe.steps.map((s, n) => `${n + 1}. ${s}`),
  ];
  if (link) lines.push('', link);
  lines.push('', 'Made with Forq');
  return lines.join('\n');
}

export function groupByAisle(items: ShoppingItem[]): [string, ShoppingItem[]][] {
  const groups = new Map<string, ShoppingItem[]>();
  for (const item of items) {
    const list = groups.get(item.aisle) ?? [];
    list.push(item);
    groups.set(item.aisle, list);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function shoppingListToText(items: ShoppingItem[]): string {
  const lines = ['Shopping list', ''];
  for (const [aisle, list] of groupByAisle(items)) {
    lines.push(aisle, ...list.map((i) => `☐ ${i.quantity} ${i.name}`), '');
  }
  lines.push('Made with Forq');
  return lines.join('\n');
}
