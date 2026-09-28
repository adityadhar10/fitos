# FitOS Architecture

## Overview
FitOS uses a monolithic Express.js backend with a React + Vite frontend, prioritizing strict layered architecture for maintainability.

## Backend Architecture
The backend strictly adheres to a three-layer MVC pattern:

**Request Flow:**
`Frontend Request` → `Express Router (auth/zod)` → `Controller` → `Service` → `Prisma/External API`

- **Routes (`/src/routes`)**: Define endpoint paths, attach standard middleware (`requireAuth`, rate limiting), and validate inputs via Zod. No business logic or DB calls allowed.
- **Controllers (`/src/controllers`)**: Strictly handle HTTP logic. They read from `req`, call the appropriate `Service`, and return JSON or forward to `next(error)`. No Prisma or AI imports allowed.
- **Services (`/src/services`)**: Hold all application business logic, Prisma interactions, macOS TTS, and Gemini AI integrations. Completely agnostic to Express.
- **Middleware (`/src/middleware`)**: Cross-cutting tools (global error handler `errorHandler.ts`, JWT authentication `requireAuth`, rate limits).

### Error Handling
The backend uses a unified `AppError` class.
Services throw domain-specific errors (e.g. `InsightError`, `AuthError`).
Controllers intercept these and format them as `AppError(status, message)`, or forward unexpected errors to `next(error)`, which fall back to standard 500s.

## Frontend Architecture
The frontend uses React with a highly centralized network stack.

**API Architecture:**
- `apiClient.ts`: Single Axios instance handling the base URL (`VITE_API_URL`) and JWT interceptor.
- Domain APIs (`authApi.ts`, `workoutApi.ts`, etc.): Thin wrappers around `apiClient`, exporting specialized functions.
- `api.ts`: A centralized barrel file exporting all domain APIs for backward compatibility with older components.

## Security
- **Authentication**: JWT is issued strictly on the backend via bcrypt verification. The frontend simply attaches it via local storage to the Bearer header.
- **Zero-Trust Validation**: User IDs are *never* trusted from `req.body`. All user-scoped Prisma calls use `req.userId` directly from the verified JWT payload.
- **Secrets**: `DATABASE_URL` and `GEMINI_API_KEY` exist *only* on the backend.
- **Hardware Integration**: The `/api/voice/*` endpoints are secured via JWT to prevent unauthenticated network users from executing macOS shell commands via the text-to-speech engine.

