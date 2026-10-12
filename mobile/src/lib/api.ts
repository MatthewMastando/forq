import type { GenerateRequest, GenerateResponse, Recipe } from './types';

// The Vercel deployment of this repo serves /api/*. Set EXPO_PUBLIC_API_URL in mobile/.env.local
// (e.g. http://192.168.1.20:3000 when running `vercel dev`, or your production URL).
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.error ?? `Request failed (${res.status})`);
  }
  return json as T;
}

export function generate(req: GenerateRequest) {
  return post<GenerateResponse>('/api/generate', req);
}

/** Publishes a recipe and returns a public web link anyone can open. */
export function publishRecipe(recipe: Recipe) {
  return post<{ id: string; url: string }>('/api/share', { recipe });
}
