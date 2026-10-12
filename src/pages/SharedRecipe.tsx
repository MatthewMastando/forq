import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Recipes shared from the Forq mobile app (see api/share.ts and SHARED_RECIPES_SETUP.sql).
interface SharedRecipeData {
  title: string;
  description: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  estimatedCostPerServing: number;
  macrosPerServing: { calories: number; proteinGrams: number; carbsGrams: number; fatGrams: number };
  ingredients: { name: string; quantity: string }[];
  steps: string[];
}

export const SharedRecipe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<SharedRecipeData | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    supabase
      .from('shared_recipes')
      .select('recipe')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setStatus('missing');
        } else {
          setRecipe(data.recipe as SharedRecipeData);
          setStatus('ready');
        }
      });
  }, [id]);

  if (status === 'loading') {
    return <div className="max-w-2xl mx-auto px-4 py-12 text-gray-600">Loading recipe…</div>;
  }
  if (status === 'missing' || !recipe) {
    return <div className="max-w-2xl mx-auto px-4 py-12 text-gray-600">This recipe link doesn’t exist.</div>;
  }

  const m = recipe.macrosPerServing;
  return (
    <article className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
      <p className="mt-2 text-gray-700">{recipe.description}</p>
      <p className="mt-4 text-sm text-gray-600">
        Serves {recipe.servings} · {recipe.prepMinutes + recipe.cookMinutes} min · ~$
        {recipe.estimatedCostPerServing.toFixed(2)}/serving · {m.calories} cal · {m.proteinGrams}g protein
      </p>
      <h2 className="mt-8 text-xl font-semibold text-gray-900">Ingredients</h2>
      <ul className="mt-2 list-disc pl-6 text-gray-800">
        {recipe.ingredients.map((i, n) => (
          <li key={n}>
            {i.quantity} {i.name}
          </li>
        ))}
      </ul>
      <h2 className="mt-8 text-xl font-semibold text-gray-900">Steps</h2>
      <ol className="mt-2 list-decimal pl-6 space-y-2 text-gray-800">
        {recipe.steps.map((s, n) => (
          <li key={n}>{s}</li>
        ))}
      </ol>
    </article>
  );
};
