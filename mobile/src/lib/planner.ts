import { recipesForGoal, RECIPES } from '@/data';

import type { GoalId, PlanDay, PlanMode, Recipe } from './types';

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Dinner candidates for a goal: goal-specific recipes first (shuffled), then other dinners as backup. */
export function dinnerCandidates(goal: GoalId): Recipe[] {
  const forGoal = recipesForGoal(goal).filter((r) => r.mealType === 'dinner');
  const primary = shuffle(forGoal.filter((r) => r.goals[0] === goal));
  const secondary = shuffle(forGoal.filter((r) => r.goals[0] !== goal));
  const ids = new Set([...primary, ...secondary].map((r) => r.id));
  const backup = shuffle(RECIPES.filter((r) => r.mealType === 'dinner' && !ids.has(r.id)));
  return [...primary, ...secondary, ...backup];
}

/** Picks dinners, avoiding the same cuisine on back-to-back nights where possible. */
export function buildPlan(goal: GoalId, mode: PlanMode): PlanDay[] {
  const candidates = dinnerCandidates(goal);
  if (mode === 'tonight') {
    return candidates.slice(0, 3).map((r, i) => ({ label: i === 0 ? 'Top pick' : 'Or try', recipeId: r.id }));
  }
  return assignWeek(candidates);
}

/**
 * A week built from swiped-right recipes. Picks come first; if there are fewer than seven,
 * the rest is filled from the goal's other dinners.
 */
export function buildPlanFromPicks(goal: GoalId, pickedIds: string[]): PlanDay[] {
  const picks = pickedIds.map((id) => RECIPES.find((r) => r.id === id)).filter((r): r is Recipe => !!r);
  const picked = new Set(pickedIds);
  const fill = dinnerCandidates(goal).filter((r) => !picked.has(r.id));
  return assignWeek([...picks, ...fill].slice(0, WEEKDAYS.length));
}

function assignWeek(candidates: Recipe[]): PlanDay[] {
  const days: PlanDay[] = [];
  const pool = [...candidates];
  for (const label of WEEKDAYS) {
    if (pool.length === 0) break;
    const prev = days.length ? RECIPES.find((r) => r.id === days[days.length - 1].recipeId) : undefined;
    let idx = pool.findIndex((r) => r.cuisine !== prev?.cuisine);
    if (idx === -1) idx = 0;
    const [pick] = pool.splice(idx, 1);
    days.push({ label, recipeId: pick.id });
  }
  return days;
}

/** A different dinner for the goal that isn't already in the plan. */
export function swapRecipe(goal: GoalId, days: PlanDay[], currentId: string): string | undefined {
  const used = new Set(days.map((d) => d.recipeId));
  return dinnerCandidates(goal).find((r) => !used.has(r.id) && r.id !== currentId)?.id;
}
