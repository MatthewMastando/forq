// Shapes returned by the /api/generate endpoint (see api/_lib/schema.ts in the repo root).

export type GoalId = 'healthy' | 'budget' | 'weight-loss' | 'muscle-gain' | 'quick' | 'family';
export type Mode = 'single' | 'week';

export interface Ingredient {
  name: string;
  quantity: string;
  aisle: string;
}

export interface Macros {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  estimatedCostPerServing: number;
  macrosPerServing: Macros;
  ingredients: Ingredient[];
  steps: string[];
  whyItFitsGoal: string;
}

export interface PlanDay {
  day: string;
  recipeIds: string[];
}

export interface ShoppingItem {
  name: string;
  quantity: string;
  aisle: string;
}

export interface GenerateRequest {
  goal: GoalId;
  store: string;
  servings: number;
  mode: Mode;
  notes?: string;
}

export interface GenerateResponse {
  recipes: Recipe[];
  plan: PlanDay[];
  shoppingList: ShoppingItem[];
}
