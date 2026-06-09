# Final Demo Testing Checklist

Use this checklist before sharing the temporary deployment link and again before the live presentation.

## Backend Smoke Checks
- Open `/api/health` and confirm the API returns success and database status is connected.
- Register a new student and confirm the email verification code is delivered.
- Verify the email, log in, and confirm the JWT session works.
- Confirm a student cannot create, edit, delete, or status-change events.
- Confirm an organizer cannot edit or delete another organizer's event.
- Confirm an admin can delete any event.

## Event Discovery and Visibility
- As a guest, open the homepage and view public upcoming events.
- As a guest/student, open a published upcoming event detail page successfully.
- Confirm draft, cancelled, completed, private, internal, and past event detail URLs do not show to guests/students.
- Confirm owning organizers can still open their own draft event details.
- Confirm admins can open restricted event details for moderation.

## Organizer Flow
- Log in as an organizer.
- Create an event with title, description, category, location, dates, capacity, tags, and poster upload.
- Confirm Cloudinary poster appears on the event detail page.
- Edit the event and confirm the form is pre-filled.
- Confirm the "Edit" action only appears for the owning organizer.

## RSVP and Capacity
- Log in as a student and RSVP to a published upcoming event.
- Confirm attendee count increases after refresh.
- Confirm RSVP is rejected for draft, cancelled, completed, and past events.
- Confirm RSVP is rejected when event capacity is full.
- Cancel RSVP and confirm attendee count updates.

## Real-Time Two-Tab Demo
- Open the same event detail page in two authenticated browser tabs.
- RSVP from the student tab and confirm the organizer/admin tab receives the attendee update.
- Send a chat message from an RSVP'd student and confirm it appears in both tabs.
- Confirm organizer/admin can send chat messages without RSVP.
- Confirm a non-RSVP student cannot send chat messages.

## Admin Moderation
- Log in as admin and open the events page.
- Confirm the admin table lists events across organizers.
- Change an event status and confirm the table updates.
- Delete an event and confirm the destructive confirmation dialog appears first.
- Confirm the deleted event disappears from public discovery.

## Recommendation/Home Feed
- Log in as a new student and confirm the home feed still shows fallback upcoming events.
- RSVP to several category/tag-related events and confirm recommendations remain eligible published upcoming events.
- Confirm the homepage recommendation section is capped and links to browse more events.

## Deployment UX Checks
- Test the deployed frontend URL on desktop and mobile width.
- Confirm `VITE_API_BASE_URL` and `VITE_SOCKET_URL` point to the deployed backend.
- Confirm CORS allows the deployed frontend origin.
- Confirm no development verification code is visible in the UI.
- Confirm loading, empty, and error states are visible rather than blank screens.
