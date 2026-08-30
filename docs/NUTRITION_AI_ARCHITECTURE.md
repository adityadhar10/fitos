# Nutrition AI Architecture

How FitOS estimates calories and macros from a text description or a food photo, and why it's built this way.

## The problem with naive AI estimation

The obvious approach — "send the meal description to an LLM, ask for calories/protein/carbs/fats back" — has a real flaw: LLMs are language predictors, not calculators. Asking an AI to silently do multi-step arithmetic in its head (identify ingredients → look up nutrition values → multiply by quantity → sum) produces **inconsistent results**. The same input can return meaningfully different numbers on different calls, because the model is pattern-matching to a plausible-sounding answer, not performing verified computation.

We hit this directly: analyzing the same photo of chole bhature returned 650, then 750, then 926 kcal across repeated attempts using a naive "ask the AI for the final numbers" prompt.

## The fix: separate identification from calculation

Instead of asking the AI for final numbers, we split the problem into two steps:

1. **AI does what it's good at: identification.** Gemini reads the text description (or image) and returns a structured list of ingredients with estimated grams — e.g. `[{"name": "chole", "grams": 250}, {"name": "bhature", "grams": 180}]`.
2. **Code does what it's good at: math.** The backend looks up each ingredient's per-100g nutrition data and does the actual multiplication and summation in plain TypeScript. Given the same ingredient list, this step is 100% deterministic — no variance, ever.

This means the only remaining source of variation is the AI's gram estimate for ambiguous quantities ("some oil," "a bowl of rice") — which is a much smaller, more acceptable source of variance than getting the arithmetic itself wrong.

## The three-tier ingredient lookup (`resolveIngredient`)

Located at `backend/src/lib/resolveIngredient.ts`. For any ingredient name, it checks three sources in order:

1. **Database cache** (`IngredientNutrition` Prisma model) — previously resolved ingredients, including ones the AI looked up before. Includes fuzzy matching (see below).
2. **Static table** (`backend/src/data/nutritionTable.ts`) — a hand-curated list of common ingredients across Indian, Western, and generic cuisines, for instant, zero-latency, zero-cost lookups on frequently used items.
3. **AI lookup** — if not found anywhere, ask Gemini for that single ingredient's per-100g nutrition data, then **save the result to the database** so every future lookup for that ingredient is instant and consistent.

This makes the ingredient database **self-expanding**: the more the app is used, the more comprehensive it gets, without anyone manually typing in every possible food.

## Fuzzy matching (why it matters)

Early on, the database cache did exact-string matching only. This caused a real bug: the AI sometimes named the same dish differently between calls — "chole" vs "chole (chickpea curry)" — and each variant got treated as a *different* ingredient, cached separately with different (AI-guessed) values. Since the two cached entries disagreed, results for the same actual food kept changing depending on which name the AI happened to use that time.

The fix: when no exact match is found, `resolveIngredient` also checks the cache for **fuzzy matches** — stripping parenthetical notes (`"chole (chickpea curry)"` → `"chole"`) and checking substring overlap — before falling through to a fresh AI lookup. This is covered by an automated test (`backend/src/lib/__tests__/resolveIngredient.test.ts`) specifically to prevent this regression from silently returning.

## Context-aware assumptions

The ingredient-extraction prompt makes explicit, stated assumptions for ambiguous cases (e.g. "if oil isn't mentioned, assume 21g for a curry/sabzi, but NOT for grilled/baked/raw dishes"). This fixed a real bug where cooking oil was being phantom-added to non-Indian, non-curry dishes (like grilled salmon) because an earlier version of the prompt applied the assumption too broadly.

These assumptions are surfaced to the user in the UI ("AI assumed: 250g chole, 180g bhature...") so a wrong assumption is visible and correctable, not a silent black box.

## Where this lives in the code

- `backend/src/lib/resolveIngredient.ts` — the 3-tier lookup + fuzzy matching
- `backend/src/data/nutritionTable.ts` — the static hand-curated table
- `backend/prisma/schema.prisma` — `IngredientNutrition` model (the self-expanding cache)
- `backend/src/routes/vision.ts` — both `/estimate-text` (text input) and `/analyze` (photo input) use this same architecture
- `frontend/src/components/FoodSearch.tsx` — local Indian foods list + Open Food Facts + AI-estimate fallback for the manual search box (a separate, simpler flow from the ingredient-based system above)

## Known limitations

- Accuracy for **exact quantities** (e.g. "200g chicken breast") is very high, since the math is deterministic and limited only by ingredient database quality.
- Accuracy for **vague quantities** (e.g. "a bowl of dal") depends on the AI's gram estimate, which is inherently approximate — no system, human or AI, can be exact when the true portion size isn't stated.
- The static table and AI-lookup fallback both return **generic/average** nutrition values — a specific restaurant's recipe or a home cook's exact ratios will vary from these averages.
