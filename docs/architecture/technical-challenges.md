# Technical Challenges and Solutions

## 1. Preserving Layered Architecture
- Challenge: EventSync combines REST APIs, real-time sockets, image uploads, authentication, and recommendation logic, which can easily become tightly coupled.
- Solution: the codebase separates presentation, business logic, data access, integration, and shared contracts on both frontend and backend.

## 2. Safe Public Event Visibility
- Challenge: public event detail pages are useful for discovery, but draft, cancelled, completed, private, or internal events must not leak to guests or students.
- Solution: `EventService.getEventByIdForUser` applies a single backend visibility rule: admins and owning organizers can view restricted events; everyone else can only view published, upcoming, public events.

## 3. RSVP Integrity and Capacity Protection
- Challenge: students should not be able to RSVP to draft, past, cancelled, completed, or full events.
- Solution: `RsvpService` now checks event status, start time, and capacity before creating a RSVP, while keeping existing RSVPs idempotent.

## 4. Role-Based Event Management
- Challenge: organizers need freedom to manage their own events, while admins need moderation power across all events.
- Solution: route middleware checks broad roles and `EventService` performs ownership checks before update/delete actions. Admin delete remains available for all events.

## 5. Real-Time Participation and Chat Permissions
- Challenge: attendee counts and chat messages must update live without trusting frontend-only permission checks.
- Solution: Socket.io rooms are authenticated with JWT, and message/room access is checked in backend services before socket events are accepted.

## 6. Recommendation Cold Start
- Challenge: personalized recommendations fail for new users with no RSVP history.
- Solution: the home feed combines strict eligibility, RSVP-based personalization, and chronological fallback so the feed remains useful for cold-start users.

## 7. Optional AI Without Vendor Lock-In
- Challenge: AI ranking can improve recommendation explanations, but a course demo should not fail if an external API key is missing or an API call fails.
- Solution: Groq/Llama ranking is optional. If unavailable, EventSync falls back to deterministic category, tag, and date-based scoring.

## 8. Email Verification UX and Security
- Challenge: real email verification improves realism, but unverified users may abandon the flow and retry registration.
- Solution: verification codes are hashed, expire after a short window, resend attempts are rate-limited, and unverified re-registration refreshes the code without creating duplicate users.
