# FitOS Project Structure

A quick guide to where everything lives in this repo.

## Top level

FitOS/
├── frontend/ React + Vite app (the UI users interact with)
├── backend/ Express + Prisma API server
├── docs/ Product documentation
├── railway.json Railway deployment config
└── README.md Project overview


## Frontend (`frontend/src/`)

src/
├── pages/ One file per app page/route (Dashboard, Nutrition, Workout, etc.)
├── components/ Reusable UI pieces used across pages (StatCard, WaterTracker, etc.)
├── context/ React context providers (AuthContext for login state)
├── hooks/ Custom React hooks (useStepTracker)
├── services/ API call functions (api.ts — talks to the backend)
├── data/ Static/local data (indianFoods.ts, mockData.ts, muscleMap.ts)
├── constants/ App-wide constants (goals.ts, version.ts)
├── types/ Shared TypeScript types
├── assets/ Images used in the UI
├── App.tsx Root component, sets up routing
└── main.tsx App entry point


**Where to add things:**
- New page → `pages/`, then add a route in `App.tsx`
- Reusable widget used on 2+ pages → `components/`
- Static reference data (food lists, etc.) → `data/`
- New API call → add a function in `services/api.ts`

## Backend (`backend/src/`)

src/
├── routes/ One file per API resource (meals.ts, workouts.ts, auth.ts, etc.)
├── middleware/ Express middleware (auth check, request validation, error handling)
├── lib/ Shared setup code (prisma.ts — database client)
├── data/ Static reference data used in calculations (nutritionTable.ts)
├── db/ Legacy/raw SQL helpers (being phased out in favor of Prisma)
└── server.ts App entry point, mounts all routes


**Where to add things:**
- New API endpoint → add a route file in `routes/`, mount it in `server.ts`
- New validation rule → `middleware/validate.ts` + a Zod schema in the relevant route file
- New database model → edit `prisma/schema.prisma`, then run a migration

## Database (`backend/prisma/`)

- `schema.prisma` — the source of truth for all database tables
- `migrations/` — auto-generated migration history (don't edit by hand)

## Key flows

- **Auth**: `frontend/src/context/AuthContext.tsx` ↔ `backend/src/routes/auth.ts`
- **Nutrition**: `frontend/src/pages/Nutrition.tsx` ↔ `backend/src/routes/meals.ts` + `backend/src/routes/vision.ts` (AI estimation)
- **Workouts**: `frontend/src/pages/Workout.tsx` ↔ `backend/src/routes/workouts.ts` + `backend/src/routes/routines.ts`
