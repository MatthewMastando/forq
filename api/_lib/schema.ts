import { z } from 'zod';

// Keep in sync with mobile/src/lib/types.ts.

export const GOALS = ['healthy', 'budget', 'weight-loss', 'muscle-gain', 'quick', 'family'] as const;

export const GenerateRequestSchema = z.object({
  goal: z.enum(GOALS),
  store: z.string().min(1).max(60),
  servings: z.number().int().min(1).max(12),
  mode: z.enum(['single', 'week']),
  notes: z.string().max(500).optional(),
});
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

export const RecipeSchema = z.object({
  id: z.string().describe('Short kebab-case slug, unique within this response'),
  title: z.string(),
  description: z.string().describe('One or two appetizing sentences'),
  servings: z.number().int(),
  prepMinutes: z.number().int(),
  cookMinutes: z.number().int(),
  estimatedCostPerServing: z.number().describe('US dollars, based on typical prices at the chosen store'),
  macrosPerServing: z.object({
    calories: z.number().int(),
    proteinGrams: z.number().int(),
    carbsGrams: z.number().int(),
    fatGrams: z.number().int(),
  }),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.string().describe('Amount with unit, e.g. "2 cups" or "1 lb"'),
      aisle: z.string().describe('Store section, e.g. Produce, Meat & Seafood, Dairy, Pantry, Frozen'),
    }),
  ),
  steps: z.array(z.string()),
  whyItFitsGoal: z.string().describe('One sentence on why this recipe serves the chosen goal'),
});
export type Recipe = z.infer<typeof RecipeSchema>;

export const GenerateResponseSchema = z.object({
  recipes: z.array(RecipeSchema),
  plan: z
    .array(z.object({ day: z.string(), recipeIds: z.array(z.string()) }))
    .describe('Empty for a single recipe; one entry per day for a weekly plan'),
  shoppingList: z
    .array(z.object({ name: z.string(), quantity: z.string(), aisle: z.string() }))
    .describe('Combined across all recipes, quantities summed, staples like salt and oil omitted'),
});
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;
