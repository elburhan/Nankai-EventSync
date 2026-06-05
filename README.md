# EventSync

EventSync is a production-ready full-stack campus event platform for Nankai University. It is designed as a Master's Software Engineering course project with layered architecture, real-time collaboration, bilingual-ready UI, and free-tier deployment targets.

## MVP Status
`Production-ready MVP complete`

## What This Repository Includes
- React 18 + Vite + TypeScript frontend
- Express + TypeScript + MongoDB Atlas backend
- JWT authentication with protected routes
- email verification with one-time codes before first login
- Organizer event creation, editing, status management, and deletion
- Admin event deletion rights across all events
- Cloudinary-backed poster upload
- RSVP flows with live synchronization
- Socket.io event-room messaging
- Public landing page with category sections and search/filter
- Light bilingual support for English and Simplified Chinese
- Self-account deletion with explicit cascading cleanup
- AI-powered personalized recommendations using Groq + Llama with a local fallback engine

## Tech Stack

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Socket.io-client
- Zod
- i18next + react-i18next

### Backend
- Node.js
- Express
- TypeScript
- Mongoose
- Socket.io
- Cloudinary
- JWT
- bcrypt
- Zod
- dotenv

### Deployment Targets
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Media storage: Cloudinary

## Repository Structure
```text
eventsync/
|-- frontend/
|-- backend/
|-- docs/
|   |-- api/
|   |-- architecture/
|   `-- deployment/
|-- AGENTS.md
|-- PRD.md
|-- README.md
`-- progress.md
```

## Core Features
- Public homepage at `/` with upcoming category sections
- Search and category filtering for public event discovery
- Login and registration for students and organizers
- confirm-password validation and email OTP verification during registration
- Protected dashboard and event detail pages
- Organizer-owned event CRUD with poster upload and status controls
- Admin ability to delete any event
- Admin status moderation actions across all events
- Real-time RSVP state across tabs
- Real-time event-room chat
- Live temporal event states: Upcoming, Happening Now, Event Ended
- Live countdown timer for upcoming events
- Language switcher with persistent `EN / 中文` selection
- Personalized `Recommended For You` sections on the homepage and dashboard
- Role-aware event listings for admins, organizers, and students
- Cold-start-safe home feed that never depends entirely on prior user interactions
- Calendar range search for upcoming and past/completed events

## Architecture
- Frontend presentation layer: pages, layouts, routes, and UI components
- Frontend business layer: auth, event, notification, and recommendation orchestration services
- Frontend data-access layer: repositories for HTTP and socket interactions
- Frontend integration layer: Axios client, Socket.io client, i18n bootstrap, token storage, image helpers
- Backend presentation layer: routes, controllers, middleware
- Backend business layer: auth, event, RSVP, messaging, room-access, recommendation, and user-cleanup services
- Backend data-access layer: Mongoose models and repositories
- Backend integration layer: environment config, MongoDB, JWT, Socket.io server, Cloudinary, and Groq AI integration

Architecture artifacts:
- [system-architecture.md](c:\Users\Burhan\Desktop\eventsync\docs\architecture\system-architecture.md)
- [technical-challenges.md](c:\Users\Burhan\Desktop\eventsync\docs\architecture\technical-challenges.md)
- [user-manual.md](c:\Users\Burhan\Desktop\eventsync\docs\deployment\user-manual.md)

## Local Setup

### 1. Backend Environment
Create `backend/.env` from [backend/.env.example](c:\Users\Burhan\Desktop\eventsync\backend\.env.example) and provide:
- `NODE_ENV`
- `PORT`
- `API_PREFIX`
- `FRONTEND_ORIGIN`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_EMAIL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `POSTER_UPLOAD_FOLDER`
- `GROQ_API_KEY`

### 2. Frontend Environment
Create `frontend/.env` from [frontend/.env.example](c:\Users\Burhan\Desktop\eventsync\frontend\.env.example) and provide:
- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`

### 3. Groq + Llama Recommendation Setup
EventSync can generate personalized recommendations with **Llama via Groq**.

1. Create a Groq account and generate an API key.
2. Add it to `backend/.env`:
   - `GROQ_API_KEY=your-groq-api-key`
3. Start the backend normally.
4. The recommendation service uses Groq's OpenAI-compatible API to call a Llama 3.x 70B model.
5. If `GROQ_API_KEY` is missing or the Groq request fails, EventSync automatically falls back to a local content-based recommendation engine.

Recommendation behavior:
- endpoint: `POST /api/recommendations`
- authentication required
- signals used: past RSVPs, favorite categories, favorite tags, and current date
- output: 4-6 recommended upcoming events with a short reason
- cache: in-memory per-user cache for 30 minutes
- eligibility: only published, upcoming, non-private events are eligible for the feed
- contract: home-feed responses return up to the requested limit, never more, with duplicates removed
- debug meta: development responses include fallback-path and recommendation-count metadata for tuning

### 4. Email Verification Setup
EventSync now verifies every newly registered account by email before first login.

1. Add SMTP credentials to `backend/.env` if you want real email delivery. For local Gmail testing, use:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM_EMAIL`
   - Example:
     - `SMTP_HOST=smtp.gmail.com`
     - `SMTP_PORT=587`
     - `SMTP_SECURE=false`
     - `SMTP_USER=your_gmail_address@gmail.com`
     - `SMTP_PASS=your_google_app_password`
     - `SMTP_FROM_EMAIL=your_gmail_address@gmail.com`
2. If SMTP is not configured in local development, the backend falls back to Nodemailer's JSON transport and logs the verification code for testing.
3. The email verification page no longer shows any visible development code. Users receive the code through email, while automated tests read the development-only code from the backend response in test mode.
4. On backend startup, EventSync now verifies the configured SMTP transporter and logs the SMTP host, SMTP user, and verification success or failure.
5. Registration returns a verification-pending response instead of logging the user in immediately.
6. The frontend then routes the user to `/verify-email` to submit the 6-digit code.

### 5. Install Dependencies
Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

### 6. Run the Apps
Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

### 7. Verify Basic Health
- Backend health check: `http://localhost:4000/api/health`
- Frontend app: `http://localhost:5173`

## Local Testing

### Language Switching
1. Open `http://localhost:5173`.
2. Use the `EN / 中文` switcher in the navbar.
3. Confirm the navbar, home hero, buttons, form labels, event statuses, and major page copy update immediately.
4. Refresh and confirm the selected language persists.

### Public Landing Page
1. Visit `/` while logged out.
2. Confirm the page is public and shows guest `Login` and `Register` actions.
3. When signed out, confirm event cards clearly ask users to sign in before opening protected event details.
4. Confirm upcoming events appear under:
   - Academic
   - Sports
   - Art and culture
   - Others
5. Use the search box and category filter to confirm the sections update cleanly.

### Recommendation Demo
1. Add `GROQ_API_KEY` to `backend/.env`.
2. Start backend and frontend.
3. Register or log in.
4. RSVP to a few events so the system learns category and tag preferences.
5. Open `/` or `/dashboard`.
6. Confirm the `Recommended For You` section appears.
7. Confirm each recommendation includes a short reason.
8. Remove `GROQ_API_KEY` and restart the backend to confirm the fallback logic still returns recommendations.

### Role-Aware Event Visibility
1. Log in as an admin and open `/events`.
2. Confirm events across all organizers are visible.
3. Log in as an organizer and confirm `/events` only shows events created by that organizer.
4. Log in as a student and confirm `/events` only shows public upcoming events.

### Home Feed Cold Start
1. Register a new account with no RSVPs.
2. Open `/` or `/dashboard`.
3. Confirm the home feed still shows event cards instead of a blank recommendation area.
4. RSVP to a few events and confirm the feed continues working with personalized ordering blended with fallback results.

### Calendar Search
1. Open `/events`.
2. Move between months with the month navigation buttons.
3. Search by title/location and filter by status such as `Completed`.
4. Confirm past and completed events appear when they intersect the selected month range.

### Organizer and Admin Permissions
1. Log in as an organizer who owns an event.
2. Confirm `Edit event` and `Delete event` are visible on that event detail page.
3. Change the event status between Draft, Published, Completed, and Cancelled.
4. Log in as a different organizer and confirm they cannot edit or delete someone else's event.
5. Log in as an admin user and open an event created by another user.
6. Confirm the admin events table shows status actions such as `Publish`, `Move to draft`, `Mark completed`, and `Cancel event`.
7. Confirm `Delete event` is visible for the admin and deletion succeeds.

### Two-Tab Real-Time Demo
1. Open the same event detail page in two authenticated tabs.
2. RSVP in one tab and confirm room state updates in both tabs.
3. Send a chat message in one tab and confirm it appears in the other tab.
4. Refresh one tab and confirm it reconnects and restores room state.

## Deployment Steps

See [docs/deployment/PRODUCTION-CHECKLIST.md](docs/deployment/PRODUCTION-CHECKLIST.md) for the full go-live checklist.

### Frontend on Vercel
1. Push the repository to GitHub.
2. Import the repo into Vercel.
3. Set the root directory to `frontend`.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add:
   - `VITE_API_BASE_URL`
   - `VITE_SOCKET_URL`

### Backend on Render
1. Create a new Web Service from the same repository.
2. Set the root directory to `backend`.
3. Build command: `npm install && npm run build`
4. Start command: `npm run start`
5. Health check path: `/api/health`
6. Add backend variables from `backend/.env.example`, including:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `FRONTEND_ORIGIN`
   - Cloudinary values
   - optional `GROQ_API_KEY`

### MongoDB Atlas
1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Create a database user with read/write access.
3. Add Render's IP range or `0.0.0.0/0` on the free tier.
4. Copy the connection string into `MONGODB_URI`.

### Cloudinary
1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Copy the cloud name, API key, and API secret into the backend environment.
3. Test poster upload through the organizer event form.

### Groq
1. Create a Groq account.
2. Generate an API key.
3. Add `GROQ_API_KEY` to the Render backend environment.
4. Redeploy the backend and confirm `/api/recommendations` returns AI-generated results.

## Verification Commands

Backend:
```bash
cd backend
npm run lint
npm run build
npm run test
```

Frontend:
```bash
cd frontend
npm run lint
npm run build
npm run e2e
```

Playwright E2E requires a dedicated MongoDB connection string through `E2E_MONGODB_URI`. The test runner injects that URI into the backend web server and intentionally leaves SMTP unset so registration stays on Nodemailer's JSON transport during automated verification.

PowerShell example:
```powershell
cd frontend
$env:E2E_MONGODB_URI='mongodb+srv://<user>:<password>@<cluster>/<eventsync-e2e-db>?retryWrites=true&w=majority'
npm run e2e
```

## Socket Event Summary

Client emits:
- `event:join`
- `event:leave`
- `message:send`

Server emits:
- `event:joined`
- `event:left`
- `event:rsvp-updated`
- `message:created`
- `socket:error`

## Recommendation API
- `POST /api/recommendations`
- requires `Authorization: Bearer <jwt>`
- request body:

```json
{
  "limit": 4
}
```

- returns recommended upcoming events plus a short reason for each item
- uses **Llama via Groq** when `GROQ_API_KEY` is configured
- falls back to local category/tag scoring when AI is unavailable

## Additional Discovery APIs
- `GET /events`
  - guest/student: public upcoming events only
  - organizer: only their own events
  - admin: all events, with filters
- `GET /home-feed`
  - authenticated only
  - returns a non-empty blended feed when eligible upcoming events exist, even during recommendation cold starts
  - never returns more than the requested `limit`
- `GET /calendar-events`
  - optional auth
  - supports `from`, `to`, `q`, `status`, and `organizerId`
  - includes past/completed events when they intersect the visible date range

## Admin Role Notes
- Admin users are supported on the backend and frontend role model.
- Admin users can delete any event.
- Admin users can also change event status directly from the events management table.
- Organizers can still edit and delete only events they created.
- For this course project, an admin can be created manually in MongoDB by changing the user's `role` field to `admin`.

## API Reference

See [docs/api/API.md](docs/api/API.md) for the full REST and Socket.io event reference.

## Course Report Support
- Product requirements: [PRD.md](PRD.md)
- Engineering conventions: [AGENTS.md](AGENTS.md)
- Progress tracker: [progress.md](progress.md)
- Mermaid architecture diagram: [docs/architecture/system-architecture.md](docs/architecture/system-architecture.md)
- Technical challenges and solutions: [docs/architecture/technical-challenges.md](docs/architecture/technical-challenges.md)
- User manual appendix: [docs/deployment/user-manual.md](docs/deployment/user-manual.md)
- API reference: [docs/api/API.md](docs/api/API.md)
- Production checklist: [docs/deployment/PRODUCTION-CHECKLIST.md](docs/deployment/PRODUCTION-CHECKLIST.md)
