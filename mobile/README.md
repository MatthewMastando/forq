# Forq mobile

The Forq iOS/Android app, built with Expo (React Native + TypeScript). No Xcode needed: you test on your phone with Expo Go, and EAS builds and submits the App Store binary in the cloud.

## Run it on your phone

1. Install **Expo Go** from the App Store on your iPhone.
2. On your computer: `cd mobile && npm install && npx expo start`
3. Scan the QR code with your iPhone camera. Your phone and computer need to be on the same Wi-Fi (or run `npx expo start --tunnel`).

Everything works offline from the built-in recipe library; no API keys or backend are needed.

## What's in the app

- **Discover**: search, goal filters, featured dinners, and a grid of every recipe.
- **Plan**: pick a goal, store, and how many people, then get a week of dinners (or three ideas for tonight). Swap any meal with one tap.
- **List**: one shopping list combined across the plan, grouped by aisle, scaled to your servings, with checkboxes and pantry staples tucked away. Share it to Notes or Reminders.
- **Saved**: recipes you've hearted.
- **Recipe**: photo, macros, cost, a servings stepper that rescales ingredients, step-by-step instructions, add to list, and share (Notes, Messages, Mail).

Recipes live in `src/data/recipes.json` (60 recipes, 10 per goal). Photos are from Unsplash and credited on each recipe.

## Ship to the App Store (no Xcode)

You need a paid Apple Developer account ($99/year) and a free Expo account.

1. `npx eas-cli@latest login`
2. `npx eas-cli@latest build --platform ios --profile production` (EAS creates the signing certificates for you)
3. `npx eas-cli@latest submit --platform ios` uploads it to App Store Connect / TestFlight.

## Optional: share links

Set `EXPO_PUBLIC_API_URL` (see `.env.example`) to the Vercel deployment and "Share" will create a public web link (`/r/:id`) instead of sharing text. That needs `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `PUBLIC_WEB_URL` set in Vercel and `SHARED_RECIPES_SETUP.sql` run once in Supabase.

## Checks

`npm run typecheck` and `npm run lint`.
