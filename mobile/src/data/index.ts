import type { GoalId, Recipe } from '@/lib/types';

import raw from './recipes.json';

export const RECIPES = raw as Recipe[];

const byId = new Map(RECIPES.map((r) => [r.id, r]));

export function getRecipe(id: string): Recipe | undefined {
  return byId.get(id);
}

/** Recipes that fit a goal, with recipes written primarily for that goal first. */
export function recipesForGoal(goal: GoalId): Recipe[] {
  return RECIPES.filter((r) => r.goals.includes(goal)).sort(
    (a, b) => Number(b.goals[0] === goal) - Number(a.goals[0] === goal),
  );
}
