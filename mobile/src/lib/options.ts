import type { GoalId } from './types';

export const GOALS: { id: GoalId; label: string; blurb: string; emoji: string }[] = [
  { id: 'healthy', label: 'Eat healthier', blurb: 'Whole foods, balanced plates', emoji: '🥗' },
  { id: 'budget', label: 'Good meals on a budget', blurb: 'Cheap ingredients, big flavor', emoji: '💸' },
  { id: 'weight-loss', label: 'Lose weight', blurb: 'Calorie-aware and filling', emoji: '⚖️' },
  { id: 'muscle-gain', label: 'Build muscle', blurb: 'High protein, enough fuel', emoji: '💪' },
  { id: 'quick', label: 'Fast weeknights', blurb: '30 minutes or less', emoji: '⏱️' },
  { id: 'family', label: 'Feed the family', blurb: 'Kid-friendly crowd pleasers', emoji: '👨‍👩‍👧' },
];

export const STORES = [
  'Any grocery store',
  'Trader Joe’s',
  'Costco',
  'Whole Foods',
  'Aldi',
  'Walmart',
  'Kroger',
  'Target',
];
