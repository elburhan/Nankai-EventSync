# EventSync Production Checklist

Use this checklist before deploying or presenting the EventSync platform.

---

## ✅ Testing

- [x] Backend unit tests pass (`npm run test` in `backend/`)
  - Auth business logic: registration, login, password hashing, JWT issuance
  - Event authorization: ownership enforcement, admin bypass
- [x] Frontend E2E tests pass (`npm run e2e` in `frontend/`)
  - Guest landing page visible
  - Organizer can register, log in, and create a published event
  - Student can register, log in, and RSVP to the event
  - Real-time attendee count updates across two browser contexts
- [x] Backend lint passes (`npm run lint` in `backend/`)
- [x] Frontend lint passes (`npm run lint` in `frontend/`)
- [x] Backend production build passes (`npm run build` in `backend/`)
- [x] Frontend production build passes (`npm run build` in `frontend/`)

---

## ✅ CI/CD

- [x] GitHub Actions CI workflow exists at `.github/workflows/ci.yml`
- [x] CI runs on every push to `main` and on pull requests
- [x] CI pipeline: lint → typecheck → unit tests → frontend build
- [x] No secrets are committed to the repository
- [x] `.env` files are in `.gitignore`

---

## ✅ Logging

- [x] Pino structured logger used across backend
- [x] JSON logs in production, pretty logs in development
- [x] Sensitive fields (password, authorization header, JWT) are **never** logged
- [x] Request logger omits authorization headers
- [x] Errors logged with `{ err: error }` pattern via Pino's built-in serializer

---

## ✅ Health Checks

- [x] `GET /api/health` endpoint exists and returns 200 when database is connected
- [x] Health endpoint returns `status: "degraded"` in the JSON payload when MongoDB is unreachable while the HTTP status remains `200`
- [x] Configure Render health check path to `/api/health`
- [x] Health endpoint does **not** require authentication

---

## ✅ Database

- [x] MongoDB Atlas free cluster provisioned
- [x] Database user created with least-privilege read/write access
- [x] Network access configured (Render IP or `0.0.0.0/0` for free tier)
- [x] `MONGODB_URI` set in Render environment — not committed to repo
- [x] Mongoose indexes in place:
  - `Event`: `{ status, startAt }` compound, `{ organizerId }`, text index on title/description/location/tags
  - `Rsvp`: `{ eventId, userId }` unique compound
  - `User`: `{ email }` unique
  - `Message`: `{ eventId, createdAt }`

---

## ✅ Security

- [x] `helmet()` applied in `app.ts` — sets security HTTP headers
- [x] `x-powered-by` header disabled
- [x] Global rate limiter: 200 requests / 15 minutes per IP
- [x] CORS strictly configured — `FRONTEND_ORIGIN` must be valid URL(s), wildcards rejected in production
- [x] JWT secret minimum 32 characters, validated at startup
- [x] Passwords hashed with bcrypt before persistence
- [x] All mutation routes protected by `requireAuthentication` middleware
- [x] Role enforcement at HTTP layer:
  - `POST /events` → organizer only
  - `PATCH /events/:eventId` → organizer or admin
  - `DELETE /events/:eventId` → organizer or admin
  - `POST/DELETE /events/:eventId/rsvp` → authenticated only
  - `DELETE /auth/me` → authenticated only
- [x] Organizer ownership enforced at service layer (`assertOwnership`)
- [x] Admin can delete any event; admin **cannot** edit another organizer's event
- [x] Upload validation: `posterDataUri` must be `data:image/` or `https://` URL — enforced by Zod
- [x] Chat message validation: Zod schema enforced before processing
- [x] Error handler never leaks stack traces or secrets to client in production
- [x] No secrets or tokens hardcoded anywhere in source code

---

## ✅ Deployment

### Frontend (Vercel)
- [x] `frontend/vercel.json` exists with SPA routing fallback (`index.html` rewrite)
- [x] Root directory set to `frontend` in Vercel project settings
- [x] Build command: `npm run build`
- [x] Output directory: `dist`
- [ ] Environment variables set in Vercel dashboard:
  - `VITE_API_BASE_URL` → `https://<render-service>.onrender.com/api`
  - `VITE_SOCKET_URL` → `https://<render-service>.onrender.com`

### Backend (Render)
- [x] Root directory set to `backend` in Render service settings
- [x] Build command: `npm install && npm run build`
- [x] Start command: `npm run start`
- [x] Health check path: `/api/health`
- [ ] Environment variables set in Render dashboard:
  - `NODE_ENV=production`
  - `PORT=4000`
  - `API_PREFIX=/api`
  - `FRONTEND_ORIGIN=https://<vercel-app>.vercel.app`
  - `MONGODB_URI=<atlas-connection-string>`
  - `JWT_SECRET=<min-32-char-secret>`
  - `JWT_EXPIRES_IN=7d`
  - `CLOUDINARY_CLOUD_NAME=<value>`
  - `CLOUDINARY_API_KEY=<value>`
  - `CLOUDINARY_API_SECRET=<value>`
  - `POSTER_UPLOAD_FOLDER=eventsync/events`

### Cloudinary
- [ ] Free Cloudinary account created
- [ ] Cloud name, API key, and API secret added to Render env
- [ ] Upload folder confirmed to be `eventsync/events` (or custom value)

---

## ⚠️ Known Limitations

| Area | Limitation | Impact |
|---|---|---|
| Socket.io | Single-node in-memory room tracking (`userSocketIds` map). No Redis adapter. | Not horizontally scalable. Render free tier is single instance — no issue for course demo. |
| Admin role | Admin accounts must be created manually in MongoDB (`role: "admin"`). No admin UI. | Acceptable for course project scope. |
| Render cold starts | Free Render services sleep after 15 minutes of inactivity and have a ~30s cold start. | First request after inactivity will be slow. Plan your demo accordingly. |
| MongoDB Atlas free tier | 512 MB storage limit, shared M0 cluster. | Suitable for course demo. Not suitable for production scale. |
| Cloudinary free tier | 25 credits/month. Each transformation or upload consumes credits. | Suitable for course demo. |
| Rate limiting | Rate limit is per-IP, not per-user. | Adequate for demo — not hardened for adversarial use. |
| Token refresh | JWTs expire after `JWT_EXPIRES_IN` (default 7d). No refresh token flow. | Users must log in again after expiry. Acceptable for course scope. |
| Image validation | `posterDataUri` accepts any `data:image/*` MIME type. No server-side file-size cap beyond the 10mb Express body limit. | Adequate for demo; production would add explicit size and MIME validation in Cloudinary config. |
