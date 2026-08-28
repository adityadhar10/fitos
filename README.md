# FitOS — Personal Fitness OS

A full-stack fitness tracking application with AI-powered coaching, nutrition analysis, and workout intelligence.

**Live Demo:** [fitos-frontend-rho.vercel.app](https://fitos-frontend-rho.vercel.app)
**API:** [fitos-production-7280.up.railway.app](https://fitos-production-7280.up.railway.app/api/health)

---

## Overview

FitOS is a personal fitness command center that combines workout logging, nutrition tracking, activity monitoring, and an AI coach into a single dashboard. It's built to demonstrate a complete production-ready full-stack application — authentication, a relational database, third-party AI integration, and a deployed live environment.

## Features

- **AI Coach Studio** — Conversational coach (powered by Gemini) with full context on the user's daily macros, workout history, and recovery metrics
- **AI Food Photo Scan** — Snap a photo of a meal and get an automatic calorie/macro estimate via multimodal AI
- **Barcode Scanner** — Look up packaged foods by barcode for fast, accurate logging
- **Workout Tracking** — Log sets and reps, track personal records (PRs), and view AI-generated training splits
- **Muscle Recovery Heatmap** — Visual front/back body diagram showing which muscle groups are fresh, recovering, or fatigued
- **Nutrition Tracking** — Daily calorie and macro tracking with AI-assisted estimation from text descriptions
- **Activity & Sleep Tracking** — Automatic step detection via device motion sensors, plus manual sleep logging
- **Progress Analytics** — Weight history, predictive weight trend modeling, and CSV data export
- **Badges & Achievements** — Gamified milestones based on real usage data
- **Fitness Score** — A composite daily score blending nutrition, activity, sleep, and consistency

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite
- React Query (TanStack Query)
- React Router
- Lucide React (icons)

**Backend**
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT-based authentication
- Google Gemini API (AI coach + vision-based food analysis)

**Infrastructure**
- Frontend hosted on Vercel
- Backend + Postgres hosted on Railway

## Architecturefitos/
├── frontend/ React + Vite SPA
│ └── src/
│ ├── pages/ Route-level views (Dashboard, Coach, Nutrition, Workout, etc.)
│ ├── components/ Reusable UI (charts, trackers, modals)
│ ├── context/ Auth context/provider
│ └── services/ API client layer
└── backend/ Express REST API
└── src/
├── routes/ auth, meals, workouts, metrics, badges, coach, vision, etc.
├── middleware/ JWT auth guard
└── lib/ Prisma client


The frontend communicates with the backend exclusively through a REST API secured with JWT auth. The AI Coach and food-photo-scan features call Google's Gemini API server-side, keeping API keys off the client.

## Running Locally

**Prerequisites:** Node.js 18+, PostgreSQL, a Gemini API key

```bash
# Clone the repo
git clone https://github.com/adityadhar10/fitos.git
cd fitos

# Backend
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, GEMINI_API_KEY
npx prisma migrate dev
npm run dev             # runs on http://localhost:5001

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev              # runs on http://localhost:5173
```

## What I'd Improve Next

- Add automated tests (unit tests for scoring logic, integration tests for API routes)
- Add refresh tokens instead of a single long-lived JWT
- Move the AI prompt templates into a config layer for easier iteration
- Add rate limiting on AI-powered endpoints

---

Built by Aditya Dhar.
