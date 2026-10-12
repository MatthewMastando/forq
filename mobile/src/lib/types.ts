export type GoalId = 'healthy' | 'budget' | 'weight-loss' | 'muscle-gain' | 'quick' | 'family';
export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type PlanMode = 'tonight' | 'week';

export type Aisle =
  | 'Produce'
  | 'Meat & Seafood'
  | 'Dairy & Eggs'
  | 'Bakery'
  | 'Pantry'
  | 'Spices'
  | 'Canned & Jarred'
  | 'Grains & Pasta'
  | 'Frozen'
  | 'Condiments & Sauces';

export interface Ingredient {
  name: string;
  amount: number | null;
  unit: string;
  aisle: Aisle;
  note?: string;
}

export interface Macros {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
}

export interface RecipeImage {
  url: string;
  unsplashId: string;
  alt: string;
  photographer: string;
  photographerUsername: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  goals: GoalId[];
  mealType: MealType;
  cuisine: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: 'easy' | 'medium';
  costPerServing: number;
  macrosPerServing: Macros;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
  image: RecipeImage | null;
}

export interface PlanDay {
  label: string;
  recipeId: string;
}

export interface Plan {
  goal: GoalId;
  store: string;
  servings: number;
  mode: PlanMode;
  days: PlanDay[];
  createdAt: string;
}
