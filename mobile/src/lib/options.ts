import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { GoalId } from './types';

type IconName = ComponentProps<typeof Ionicons>['name'];

export interface Goal {
  id: GoalId;
  label: string;
  short: string;
  blurb: string;
  icon: IconName;
  color: string;
}

export const GOALS: Goal[] = [
  {
    id: 'healthy',
    label: 'Eat healthier',
    short: 'Healthy',
    blurb: 'Whole foods and balanced plates',
    icon: 'leaf',
    color: '#2F8F5B',
  },
  {
    id: 'budget',
    label: 'Save money',
    short: 'Budget',
    blurb: 'Big flavor for under $3.50 a serving',
    icon: 'wallet',
    color: '#C27C0E',
  },
  {
    id: 'weight-loss',
    label: 'Lose weight',
    short: 'Lighter',
    blurb: 'Filling meals under 550 calories',
    icon: 'trending-down',
    color: '#2C7DA0',
  },
  {
    id: 'muscle-gain',
    label: 'Build muscle',
    short: 'High protein',
    blurb: '35g+ protein per serving',
    icon: 'barbell',
    color: '#B5432F',
  },
  {
    id: 'quick',
    label: 'Cook fast',
    short: 'Quick',
    blurb: 'On the table in 30 minutes',
    icon: 'flash',
    color: '#7A4FD1',
  },
  {
    id: 'family',
    label: 'Feed the family',
    short: 'Family',
    blurb: 'Crowd pleasers kids will eat',
    icon: 'people',
    color: '#D9480F',
  },
];

export function getGoal(id: GoalId): Goal {
  return GOALS.find((g) => g.id === id) ?? GOALS[0];
}

/** Rough price level of each store relative to a typical supermarket, used to adjust cost estimates. */
export const STORES: { name: string; priceFactor: number }[] = [
  { name: 'Walmart', priceFactor: 0.88 },
  { name: 'Kroger', priceFactor: 1 },
  { name: 'Target', priceFactor: 1 },
  { name: 'Aldi', priceFactor: 0.8 },
  { name: 'Trader Joe’s', priceFactor: 0.95 },
  { name: 'Costco', priceFactor: 0.82 },
  { name: 'Whole Foods', priceFactor: 1.25 },
  { name: 'Other', priceFactor: 1 },
];

export function priceFactor(store: string | undefined): number {
  return STORES.find((s) => s.name === store)?.priceFactor ?? 1;
}
