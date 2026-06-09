# EventSync Progress Tracker

## Overall Status
Current phase: `Production-ready MVP complete`

## Status Table
| Area | Status | Notes |
| --- | --- | --- |
| Monorepo root and docs | Complete | AGENTS, PRD, README, and progress tracking are in place |
| Backend foundation | Complete | Express, TypeScript, MongoDB, env validation, rate limiting, error handling, Socket.io bootstrap |
| Backend auth and authorization | Complete | JWT auth, role guards, ownership enforcement, self-account deletion |
| Backend event CRUD | Complete | Organizer-owned event CRUD, status updates, Cloudinary poster support |
| Backend RSVP and messaging | Complete | RSVP create/cancel, real-time attendee updates, event-room chat |
| Backend admin role support | Complete | Admin can delete any event while organizer ownership rules remain intact for normal users |
| Frontend foundation | Complete | Vite, Tailwind, auth context, protected routing, service/repository layers |
| Frontend public landing page | Complete | Public `/` route, guest CTA buttons, search/filter, sectioned upcoming events |
| Frontend bilingual UI | Complete | English + Simplified Chinese via react-i18next with persisted language selection |
| Frontend event discovery | Complete | Event feed, cards, detail page, calendar snapshot, loading/error/empty states |
| Frontend live event detail | Complete | Live attendee count, messaging UI, temporal status, countdown timer |
| Organizer event management UI | Complete | Create, edit, status change, poster upload, owner-only edit/delete actions |
| Admin deletion UI | Complete | Admin sees delete controls on any event detail page |
| Cloudinary integration | Complete | Poster upload and replacement flow works through backend integration layer |
| Documentation and report assets | Complete | Architecture diagram, technical challenges, user manual, setup and deployment guidance |
| Frontend lint/build verification | Complete | Latest lint and production build pass |
| UI/UX Polish (Phase 4) | Complete | Nankai navy+gold design system, Inter font, premium components, E2E green |
| Backend lint/build verification | Complete | Latest lint and production build pass |
| Security hardening (Phase 5) | Complete | CORS production hardening, defense-in-depth route guard, full security audit |
| API documentation (Phase 5) | Complete | docs/api/API.md — full REST + Socket.io reference |
| Deployment readiness (Phase 5) | Complete | vercel.json, improved env.example, PRODUCTION-CHECKLIST.md |

## Latest Authentication Verification Pass
- added confirm-password validation on both the frontend and backend registration flows
- added backend email verification fields on `User` and a new `POST /auth/verify-email` endpoint
- introduced SMTP-backed verification email delivery with a safe JSON-transport fallback for local development
- blocked login for unverified users with a specific backend error message
- added a dedicated frontend email-verification page and updated the registration flow to redirect there instead of auto-login
- extended backend auth tests for password mismatch and unverified-login rejection
- refreshed the Playwright registration journey to include OTP verification using the development-only debug code

## Latest Verification Email Resend Pass
- added `POST /api/auth/resend-verification` for unverified users who need a fresh email OTP
- reused the existing verification email delivery path to generate a new 6-digit code and expiry window
- added a per-email in-memory resend throttle capped at 3 attempts per 10 minutes
- extended backend auth tests to cover successful resend, missing-account rejection, already-verified rejection, and resend rate limiting

## Latest Verification Resend UI Pass
- added a resend-code action to the email verification page using the existing frontend auth repository, service, and context layers
- added a 60-second cooldown countdown so users get immediate feedback after requesting a new verification code
- added success and error toast messaging for resend attempts while keeping the verification page layout aligned with the current UI style

## Latest Gmail SMTP Verification Pass
- kept the existing Nodemailer registration flow intact while adding a startup SMTP transporter verification step
- logged SMTP host, SMTP user, and verification success or failure without exposing secrets
- updated the backend `.env.example` and README to use Gmail SMTP plus a Google App Password for local email testing

## Completed in the Pre-Final Enhancements Phase
- added light bilingual support with `react-i18next`
- added persistent `EN / 中文` language switching in the navbar
- made `/` a public landing page instead of an auth gate
- redesigned the homepage around upcoming academic, sports, and cultural events
- added homepage search and category filtering for guests
- added live temporal event states: Upcoming, Happening Now, and Event Ended
- added a real-time countdown timer for upcoming events
- added backend and frontend support for the `admin` role
- allowed admins to delete any event while preserving organizer ownership for normal edit/delete flows
- kept RSVP and chat behavior stable while extending the UI
- refreshed README guidance for the new public, bilingual, and admin-aware behavior

## Completed in Phase 3 (E2E Verification)
**Status**: Complete
- Configured Playwright with in-process web server orchestration for frontend (Vite) and backend (Express).
- Implemented robust `Complete E2E User Journey` test ensuring isolated and synchronized contexts.
- Verified Guest landing page.
- Verified Organizer registration, login, event creation, and publishing.
- Verified Student registration and RSVP workflow.
- Verified two-browser real-time RSVP sync via Socket.io.

## Completed in Phase 1 (Testing & CI/CD)
- configured `vitest` for the backend with fully mocked, isolated dependencies
- wrote comprehensive unit tests for `AuthService` (login, register, JWT hashing logic)
- wrote comprehensive unit tests for `EventService` (ownership rules, admin bypass logic)
- configured GitHub Actions (`.github/workflows/main.yml`) for automated linting, building, and testing
- updated `package.json` with appropriate `test` scripts

## Completed in Phase 2 (Observability & Database Resilience)
- replaced basic console logger with structured JSON logging via `pino`
- added safe request logging middleware (`pino-http`) with strict redaction rules for secrets and passwords
- improved error visibility in `error-handler.middleware.ts` by logging the actual error object
- augmented `event.model.ts` with proper compound indexes for status, category, and start time queries
- upgraded the `/api/health` endpoint to actively verify MongoDB connectivity

## Remaining Risks & Next Enhancements (Phase 3 & Beyond)
- **Scalability**: Single-node Socket.io setup. Needs Redis adapter if scaled horizontally.
- **E2E Automation**: Needs Playwright for automating the two-tab real-time classroom demo verification.
- **UI/UX Polish**: UI relies on plain Tailwind without micro-animations or a premium component library (e.g., shadcn/ui).

## Recommended Next Step
- Execute Phase 3 (E2E Verification) using Playwright, or proceed to Phase 4 to elevate the visual design.

## Latest Adjustment
- removed visible attendee numbers from the user-facing frontend while preserving RSVP and real-time backend state
- standardized event categories to exactly `Academic`, `Sports`, `Art and culture`, and `Others`
- switched organizer event category input to a controlled dropdown using only the approved category values
- aligned homepage filtering and section labels with the same approved category set
- updated the navbar brand link so clicking the EventSync logo always returns to `/`

## Latest AI Feature
- added authenticated `POST /api/recommendations` for personalized event suggestions
- integrated **Groq + Llama** recommendation ranking with a 30-minute in-memory cache
- added a safe fallback recommendation engine based on RSVP history, category affinity, and tag matching
- surfaced `Recommended For You` sections on both the homepage and dashboard
- documented `GROQ_API_KEY` setup and fallback behavior in the README

## Latest Real-Time Chat Fix
- fixed multi-user event-room chat so all authenticated attendees with an RSVP plus the organizer can send messages
- improved socket room persistence by automatically rejoining joined event rooms after reconnects
- ensured message sends are acknowledged so the composer only clears after a successful server-side save
- hardened the sender flow so the sender socket is joined to the event room before broadcast delivery
- improved chat list behavior so new room messages stay visible as the conversation updates

## Latest Admin, Feed, and Calendar Adjustment
- strengthened the authenticated home feed fallback so recommendation exclusions no longer leave users with a blank dashboard when upcoming events exist
- expanded the events screen filters with explicit date-range controls and an admin-only organiser filter for cross-organiser event browsing
- clarified event browser scope in the UI so admins, organisers, and students see the correct filtered dataset for their role

## Latest Discovery & Feed Fixes
- made `GET /events` role-aware so admins can see all events, organizers see only their own events, and students/guests see only public upcoming events
- added `GET /home-feed` so authenticated home and dashboard feeds never go blank during recommendation cold starts
- blended personalized recommendations with chronological fallback events to guarantee a non-empty home feed when events exist
- added `GET /calendar-events` for visible-range calendar queries that include past and completed events
- updated the frontend events calendar to query by month range and support searching/filtering for completed and historical events

## Latest Admin Events Table
- added an admin-only management table on the events page using the existing `GET /events` endpoint
- added direct delete actions with confirmation and automatic refresh after deletion
- kept the calendar and standard event-card feed intact for organisers and students while expanding the admin workflow

## Latest Refactor and Test Pass
- refactored recommendation fallback selection into named strategy helpers for easier unit testing
- extended backend recommendation tests to cover cold-start behavior, fallback filling, and strategy helper filtering
- wired the events page to the shared `useEventDateRangeQuery` hook so visible-range query building is typed and reusable
- kept the existing admin delete-on-table Playwright flow aligned with the refreshed events page behavior

## Latest P0 Stabilization and Observability Pass
- fixed Playwright backend orchestration by allowing the backend HTTP server to boot before MongoDB finishes connecting and by increasing the Playwright backend health timeout
- removed the duplicate `User.email` Mongoose index definition so backend tests and startup no longer emit duplicate-index warnings
- extended recommendation service tests to cover malformed organizer data and ineligible feed events such as cancelled, malformed-status, and past events
- added structured `pino` logs for home-feed fallback path selection and admin-triggered event deletions
- stabilized the admin events page fetch loop by memoizing the shared date-range query hook, and hardened the admin delete Playwright selector against rerender flakiness

## Latest P1 Recommendation and Filter Pass
- centralized feed safety rules in a shared `isEligibleFeedEvent` helper so cancelled, past, malformed-status, and private/internal events are excluded consistently
- tightened the home-feed contract so merged results stay deduplicated and never exceed the requested limit
- added development-only recommendation debug metadata for fallback-path tracing and personalized-vs-fallback counts
- expanded the shared `useEventDateRangeQuery` hook into a single filter-state source of truth for search, organizer, status, and visible date range

## Latest P2 Admin Moderation Pass
- added `PATCH /events/:eventId/status` for owner/admin status updates with structured admin audit logs
- expanded the admin events table with direct publish, draft, completed, and cancelled actions while keeping delete as the dangerous action
- strengthened the delete confirmation copy so admins see the event title, scheduled date, and permanent impact before removing an event
- extended the admin Playwright flow to cover status moderation before delete

## Testing Status
- backend unit tests currently cover `AuthService`, `EventService`, and `RecommendationService`, including ownership/admin rules, status updates, recommendation cold-start behavior, eligibility filtering, malformed organizer data, and home-feed limit enforcement
- frontend integration/e2e coverage currently includes the admin events table moderation-and-delete flow plus the broader main Playwright user journey
- remaining gap: there is still no frontend unit-test command or dedicated component/hook test coverage yet for the calendar UI or `useEventDateRangeQuery`

## User Testing
- recommended participant group: 2-3 classmates using separate accounts in one short session
- suggested roles:
  - 1 admin user
  - 1 or 2 student users
- suggested setup:
  - start the backend and frontend locally
  - prepare several events in different statuses, including at least one completed/past event
  - make sure the admin account can access the events management table
- suggested test tasks:
  - student task 1: browse the public or authenticated events view and open an event detail page
  - student task 2: use the calendar and date filters to find a past or completed event
  - admin task 1: open the admin events table and change an event status such as `Published` to `Cancelled` or `Completed`
  - admin task 2: delete an event using the confirmation flow
  - optional shared task: compare whether the actions and labels are easy to understand in both English and Chinese
- suggested observation points during the session:
  - can users find the correct page without help
  - do they understand the date filters and calendar range behavior
  - do they notice the difference between status actions and delete actions
  - do they hesitate at any button, label, or confirmation message
- suggested follow-up questions:
  - what was easy
  - what was confusing
  - one thing you would improve
- suggested note-taking format:
  - record 3-5 feedback points per participant
  - group notes into `easy`, `confusing`, and `improvement ideas`
  - highlight repeated comments because those are the strongest candidates for post-demo refinement
- report usage note:
  - this lightweight user test is intended to provide qualitative feedback for the course report, not full production analytics

## Known Bugs / Limitations
- recommendation quality is still primarily heuristic plus prompt-based ranking, not a trained ML system, so relevance depends heavily on limited RSVP history and event metadata
- frontend automated testing is still weighted toward Playwright end-to-end checks and manual verification; there is no frontend unit-test runner yet for hooks or isolated components
- backend auditability is log-based only: admin deletes and status changes are recorded in structured logs, but there is no admin-facing audit log screen
- private/internal event eligibility flags are supported in recommendation logic, but the persisted event schema and organizer/admin UI do not yet expose a full visibility-management workflow
- the admin events table currently favors clarity over scale and does not yet include server-side pagination or more advanced bulk-management actions for large event sets
- some UI copy and status-management flows are still relatively generic and could be refined further through additional user testing, especially around admin moderation and calendar filtering
- the recommendation cache is in-memory per backend instance, which is acceptable for the course project but would need shared caching for a horizontally scaled deployment
- real-time messaging and RSVP synchronization work in a single-node setup, but the current Socket.io deployment does not yet include a Redis adapter or other multi-instance coordination layer

## Future Work
- improve recommendation relevance with stronger heuristics or a lightweight ML pipeline trained on richer interaction data such as views, clicks, and repeat attendance
- add a simple audit-log interface so admins can review deletes, status changes, and other sensitive moderation actions without reading raw backend logs
- extend the visibility and permission model so organizers and admins can explicitly manage public, private, and internal-only events from the UI and persisted schema
- introduce frontend unit/component testing for key hooks and screens such as `useEventDateRangeQuery`, event filters, and moderation controls
- add scalable admin-table enhancements such as pagination, search by title, and bulk event moderation actions
- harden production readiness further with shared caching and multi-instance real-time infrastructure for recommendation and Socket.io workloads

## Latest P0 Deployment Readiness Pass
- removed the hardcoded Playwright MongoDB Atlas URI and replaced it with the required `E2E_MONGODB_URI` environment variable
- updated the main Playwright user-journey spec to read the development-only verification code from the registration API response instead of relying on any visible debug UI
- aligned the API and deployment health-check documentation with the actual backend behavior: `/api/health` always returns HTTP `200` and signals degraded state in the JSON payload
- strengthened frontend and backend `.gitignore` coverage for local env backups, Playwright auth/session artifacts, reports, and log files so test and deployment secrets stay out of source control

## Latest P1 Presentation Polish Pass
- removed visible mojibake from the main bilingual translation resource, footer copy, language switcher, and authentication hero panels
- fixed the invalid nested navbar link while preserving the same brand navigation behavior
- clarified the public homepage CTA so signed-out users are asked to sign in before opening protected event details
- moved the visible calendar labels and overflow text into i18n so the calendar stays bilingual and presentation-ready
- aligned README guidance with Gmail SMTP local development, hidden verification codes on the real UI, and the `E2E_MONGODB_URI` requirement for Playwright

## Latest Final Optimization Pass
- added backend-scoped public event detail visibility so guests/students can only view published, upcoming, public events while owners/admins retain management visibility
- hardened RSVP creation so draft, non-published, past, and full-capacity events reject new RSVPs with clear API errors
- opened the frontend event detail route for safe public viewing while keeping RSVP, chat, and live room participation authenticated
- centralized backend event category and pagination limit constants to reduce duplicated literals in validators and pagination helpers
- refreshed architecture/report support docs with a visibility-aware Mermaid diagram, eight final challenges-and-solutions talking points, and a deployment demo checklist
- expanded backend unit tests for event visibility and RSVP status/date/capacity guards
