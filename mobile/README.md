# Forq mobile

The Forq iOS/Android app, built with Expo (React Native + TypeScript). No Xcode needed: you test on your phone with a development build or Expo Go, and EAS builds and submits the App Store binary in the cloud.

## Run it

1. `cd mobile && npm install`
2. `cp .env.example .env.local` and point `EXPO_PUBLIC_API_URL` at the API (your Vercel URL, or `http://<your-computer's-LAN-IP>:3000` when running `vercel dev` at the repo root).
3. `npx expo start`, then scan the QR code with the Expo Go app on your iPhone.

## Ship to the App Store (no Xcode)

You need a paid Apple Developer account ($99/year) and a free Expo account.

1. `npx eas-cli@latest login`
2. `npx eas-cli@latest build --platform ios --profile production` (EAS creates signing certificates for you)
3. `npx eas-cli@latest submit --platform ios` uploads to App Store Connect / TestFlight.

For day-to-day testing once native modules are added: `npx eas-cli@latest build --profile development --platform ios` and install it on your phone.

## How it fits together

- `src/app/` holds the screens (Expo Router): home, the goal → store → servings → plan wizard (`new.tsx`), results, recipe detail, and the shopping list.
- Recipes come from `POST /api/generate` (repo root `api/`), a Vercel function that calls Claude and returns structured recipes, a weekly plan, and a combined shopping list.
- "Share link" calls `POST /api/share`, which stores the recipe in Supabase and returns a public `/r/:id` page on the web app.
- "Send to Notes" opens the iOS share sheet with a plain-text recipe; pick Notes to save it to Apple Notes.

## API environment variables (Vercel project settings)

- `ANTHROPIC_API_KEY`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server only, never in the app)
- `PUBLIC_WEB_URL` (base URL for share links, e.g. `https://forq.vercel.app`)

Run `SHARED_RECIPES_SETUP.sql` in Supabase once to create the `shared_recipes` table.
