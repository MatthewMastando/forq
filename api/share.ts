import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { json } from './_lib/http.js';
import { RecipeSchema } from './_lib/schema.js';

// Server-only credentials: set these in Vercel project settings, never in the app bundle.
const supabase = createClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
const WEB_URL = process.env.PUBLIC_WEB_URL ?? 'https://forq.vercel.app';

const ShareRequestSchema = z.object({ recipe: RecipeSchema });

export async function POST(request: Request): Promise<Response> {
  const parsed = ShareRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return json({ error: 'Invalid recipe' }, 400);
  }

  const { data, error } = await supabase
    .from('shared_recipes')
    .insert({ recipe: parsed.data.recipe })
    .select('id')
    .single();

  if (error || !data) {
    console.error('shared_recipes insert failed', error);
    return json({ error: 'Couldn’t create a share link.' }, 500);
  }

  return json({ id: data.id, url: `${WEB_URL}/r/${data.id}` });
}
