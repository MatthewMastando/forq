import type { Recipe } from './types';

// Optional: point EXPO_PUBLIC_API_URL at the Vercel deployment to share recipes as web links.
// Without it, sharing sends the recipe as text through the share sheet.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const sharingLinksEnabled = !!API_URL;

/** Publishes a recipe and returns a public web link anyone can open. */
export async function publishRecipe(recipe: Recipe): Promise<{ id: string; url: string }> {
  const res = await fetch(`${API_URL}/api/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipe }),
  });
  if (!res.ok) throw new Error(`Share failed (${res.status})`);
  return res.json();
}
