# AGENTS.md - EventSync Project Conventions & Codex Autonomy Rules

## Project Overview
EventSync is a production-ready full-stack campus event platform for Nankai University.
It is being built as a Master's Software Engineering course project and must be suitable for:
- live classroom demonstrations
- architectural evaluation
- testing and quality assessment
- deployment and reflection/reporting deliverables

The repository is a monorepo with two application workspaces:
- `frontend` for the React client
- `backend` for the Express API and real-time server

## Product Intent
The system should help students discover campus activities and help organizers publish, manage, and communicate around events in a reliable real-time experience.

Primary outcomes:
- students can find relevant events quickly
- organizers can create and manage events confidently
- RSVP and event communication update in real time
- the system is deployable on free-tier infrastructure

## Tech Stack (Strictly Enforced)
### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components or clean Tailwind components
- React Router v6
- Socket.io-client
- Axios for service-layer HTTP communication only

### Backend
- Node.js
- Express
- TypeScript
- Mongoose
- MongoDB Atlas
- Socket.io
- Cloudinary
- JWT
- bcrypt
- Zod
- dotenv

### Deployment
- Frontend deployed on Vercel
- Backend deployed on Render free tier
- Database hosted on MongoDB Atlas free tier
- Image assets stored in Cloudinary free tier

## Monorepo Rules
- The repository root contains shared project documentation only.
- Application code lives only inside `frontend` and `backend`.
- Frontend and backend must be independently runnable and deployable.
- Root documentation must stay synchronized with implementation milestones.
- Do not introduce extra top-level apps or services unless explicitly approved.

## Layered Architecture (Mandatory)
Every feature must follow this separation of concerns.

### 1. Presentation Layer
Frontend:
- pages
- layouts
- route definitions
- UI components

Backend:
- controllers
- routes
- request/response adapters
- middleware

Responsibilities:
- receive user input or HTTP requests
- call business logic services
- transform outputs into UI state or HTTP responses
- contain no database logic

### 2. Business Logic Layer
Frontend:
- view-oriented services
- client-side orchestration
- state-independent domain helpers

Backend:
- application services
- validation coordination
- authorization rules
- domain workflows

Responsibilities:
- contain feature rules and orchestration
- remain independent from framework-specific persistence details
- never directly define transport concerns beyond typed contracts

### 3. Data Access Layer
Frontend:
- repositories for API data access abstractions if needed

Backend:
- Mongoose models
- repositories
- query builders

Responsibilities:
- manage persistence concerns
- isolate database access
- expose typed methods to the business layer

### 4. Integration Layer
Examples:
- Socket.io server and client wiring
- Cloudinary upload integration
- MongoDB connection bootstrap
- environment/config readers
- third-party service adapters

Responsibilities:
- isolate infrastructure and third-party details
- keep external concerns out of controllers and services

## Layering Constraints
- Never mix layers.
- Controllers must not query Mongoose directly.
- React components must not call Axios directly unless through the approved integration/service flow.
- Business services must not contain direct framework bootstrapping.
- Cloudinary and Socket.io usage must stay inside the integration layer plus thin contracts consumed elsewhere.

## Suggested Repository Structure
```text
eventsync/
  frontend/
    public/
    src/
      app/
      presentation/
      business/
      data-access/
      integration/
      shared/
      styles/
      assets/
    tests/
  backend/
    src/
      presentation/
      business/
      data-access/
      integration/
      shared/
    tests/
  docs/
    architecture/
    api/
    deployment/
```

## Naming Conventions
- Files and folders: `kebab-case`
- React components: `PascalCase`
- TypeScript types, interfaces, classes, and MongoDB models: `PascalCase`
- Variables and functions: `camelCase`
- Constants and environment variable names: `UPPER_SNAKE_CASE`
- Route paths: lowercase with hyphens

Examples:
- `event.controller.ts`
- `auth.service.ts`
- `cloudinary.service.ts`
- `EventCard.tsx`
- `EVENT_STATUS`

## Coding Standards
- All implementation must be written in TypeScript.
- Favor explicit types for public contracts and service boundaries.
- Keep functions focused and composable.
- Avoid hidden side effects.
- Use consistent error objects and response shapes.
- Prefer small modules over large multipurpose files.
- Add concise comments only where the intent is not obvious from the code.

## Validation, Errors, and Logging
- Validate all external input at boundaries.
- Use Zod for request payload validation and environment validation where appropriate.
- Return safe, user-appropriate error messages from the API.
- Log operational failures on the backend in a structured, minimal-noise way.
- Never leak secrets, tokens, stack traces, or database internals to the frontend.

## Security Rules
- No hard-coded secrets or credentials.
- All secrets must come from environment variables.
- Passwords must be hashed with bcrypt.
- JWT handling must use secure expiry and verification rules.
- Protected backend routes must enforce authorization.
- Organizers may only manage their own events.
- Uploaded file handling must validate type and size constraints.

## Data and Real-Time Expectations
- MongoDB Atlas is the source of truth for persisted data.
- Real-time RSVP counts must remain consistent with persisted state.
- Socket.io rooms should be designed around event-level participation.
- Reconnection behavior must degrade gracefully.
- Real-time features must be demonstrable across two browser tabs during manual verification.

## UI/UX Expectations
- The interface must be responsive on mobile and desktop.
- Loading, empty, and error states are mandatory.
- Accessibility basics are required:
  - semantic structure
  - keyboard-friendly interactions
  - form labels
  - visible focus states
- The visual design should feel polished enough for a graduate-level demo.

## Testing Expectations
Minimum expectations for implementation phases:
- unit tests for core business logic
- integration tests for critical API flows
- manual real-time verification in two browser tabs
- deployment smoke checks for frontend and backend

Testing should cover at least:
- authentication flow
- event CRUD permissions
- RSVP behavior
- real-time attendee updates
- major validation failures

## Documentation Rules
- `README.md` must describe setup, architecture, deployment, and key features.
- `progress.md` must be updated after every major task.
- `PRD.md` is the product source of truth.
- Architecture and deployment notes should be added under `docs/` as implementation progresses.

## Required Commands
These commands must exist by the time the respective apps are implemented.

### Backend `package.json`
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint . --ext .ts"
  }
}
```

### Frontend `package.json`
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .ts,.tsx"
  }
}
```

## Environment Variable Policy
Expected categories of environment variables:
- backend server configuration
- MongoDB connection string
- JWT secret and expiry settings
- Cloudinary credentials
- frontend API base URL
- frontend socket server URL

Rules:
- never commit real values
- provide `.env.example` files during implementation
- keep frontend and backend environment variables separate

## Codex Autonomy Rules
- Always start with the exact phrase: `Propose a detailed plan first` before writing code.
- After the plan is accepted, implement incrementally.
- Explain major implementation steps before editing files.
- Never add extra features unless explicitly requested.
- If a requirement is ambiguous and materially affects architecture or scope, ask for clarification before proceeding.
- Preserve layered architecture even when a shortcut seems easier.
- Update `README.md` and `progress.md` after every major task.
- Run verification before claiming completion.

## Definition of Done (Every Task Must Meet All)
- Code is written in TypeScript.
- The solution follows the required layered architecture.
- Linting passes.
- Build passes.
- Errors are handled appropriately.
- Secrets are stored in environment variables.
- The feature is testable end to end.
- Responsive behavior is considered for frontend changes.
- Real-time behavior is manually verified when relevant.
- `progress.md` is updated.
- `README.md` is updated when setup, behavior, or architecture changes.

## Phase Gate for This Repository
Current approved phase:
- documentation and directory scaffold only

Not approved in the current phase:
- application code
- dependency installation
- environment configuration
- deployment setup

Any move beyond scaffold and planning should happen only after explicit user approval.
