import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';

import { json } from './_lib/http.js';
import { GenerateRequestSchema, GenerateResponseSchema, type GenerateRequest } from './_lib/schema.js';

export const config = { maxDuration: 300 };

const client = new Anthropic(); // reads ANTHROPIC_API_KEY

const GOAL_GUIDANCE: Record<GenerateRequest['goal'], string> = {
  healthy: 'Prioritize whole foods, vegetables, lean proteins, whole grains, and modest sodium and added sugar.',
  budget: 'Keep cost per serving low: cheap staples, store brands, overlapping ingredients across recipes, minimal waste.',
  'weight-loss': 'Target roughly 400-550 calories per serving with high protein and fiber so meals stay filling.',
  'muscle-gain': 'Target at least 40g protein per serving with enough carbohydrates to fuel training.',
  quick: 'Keep total time at or under 30 minutes with minimal prep and few dishes.',
  family: 'Favor familiar, kid-friendly flavors that are easy to customize at the table.',
};

const SYSTEM = `You are Forq, a practical home-cooking planner. You write recipes that real people can shop for and cook on a weeknight.

Ground every recipe in the user's goal, scale it to the number of people they are feeding, and choose ingredients that the named store reliably carries (including its well-known private-label products when that helps). Estimate costs from typical US prices at that store. Macros are per serving and should be realistic estimates.

For a weekly plan, reuse ingredients across recipes where it makes sense so the shopping list stays short and nothing goes to waste.`;

function userPrompt(req: GenerateRequest): string {
  const lines = [
    `Goal: ${req.goal}. ${GOAL_GUIDANCE[req.goal]}`,
    `Store: ${req.store}`,
    `Feeding: ${req.servings} ${req.servings === 1 ? 'person' : 'people'}`,
    req.mode === 'week'
      ? 'Build a 7-day dinner plan (Monday through Sunday), one recipe per day, plus one combined shopping list.'
      : 'Suggest one recipe to cook today, plus its shopping list. Leave the plan empty.',
  ];
  if (req.notes) lines.push(`Extra notes from the user: ${req.notes}`);
  return lines.join('\n');
}

export async function POST(request: Request): Promise<Response> {
  const parsed = GenerateRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return json({ error: 'Invalid request', issues: parsed.error.issues }, 400);
  }

  try {
    const stream = client.beta.messages.stream({
      model: 'claude-opus-5-5',
      max_tokens: 64000,
      // Re-runs a request on a fallback model if a safety classifier declines it.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: betaZodOutputFormat(GenerateResponseSchema) },
      system: SYSTEM,
      messages: [{ role: 'user', content: userPrompt(parsed.data) }],
    });
    const message = await stream.finalMessage();

    if (message.stop_reason === 'refusal') {
      return json({ error: 'Forq couldn’t make a plan for that request. Try rewording your notes.' }, 422);
    }
    if (!message.parsed_output) {
      return json({ error: 'The plan came back incomplete. Please try again.' }, 502);
    }
    return json(message.parsed_output);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return json({ error: 'Forq is busy right now. Try again in a minute.' }, 429);
    }
    if (error instanceof Anthropic.APIError) {
      console.error('Claude API error', error.status, error.message);
      return json({ error: 'Recipe generation failed. Please try again.' }, 502);
    }
    throw error;
  }
}
