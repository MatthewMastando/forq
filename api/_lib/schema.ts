import { z } from 'zod';

// Shape of a recipe from the mobile app's built-in library (keep in sync with mobile/src/lib/types.ts).
export const RecipeSchema = z.object({
  id: z.string().max(100),
  title: z.string().max(200),
  description: z.string().max(1000),
  servings: z.number().int().min(1).max(50),
  prepMinutes: z.number().int().min(0),
  cookMinutes: z.number().int().min(0),
  costPerServing: z.number().min(0),
  macrosPerServing: z.object({
    calories: z.number(),
    proteinGrams: z.number(),
    carbsGrams: z.number(),
    fatGrams: z.number(),
    fiberGrams: z.number(),
  }),
  ingredients: z
    .array(
      z.object({
        name: z.string().max(200),
        amount: z.number().nullable(),
        unit: z.string().max(40),
        aisle: z.string().max(40),
        note: z.string().max(200).optional(),
      }),
    )
    .max(60),
  steps: z.array(z.string().max(2000)).max(30),
  image: z
    .object({
      url: z.string().url().startsWith('https://images.unsplash.com/'),
      alt: z.string().max(500),
      photographer: z.string().max(200),
      photographerUsername: z.string().max(100),
    })
    .nullable(),
});
export type Recipe = z.infer<typeof RecipeSchema>;
